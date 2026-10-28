<?php
/**
 * LAV Digital Pagos - Endpoint REST API para Hostinger
 * Maneja persistencia en MySQL con fallback transparente a JSON
 */

require_once __DIR__ . '/config.php';

$pdo = getDbConnection();
$method = $_SERVER['REQUEST_METHOD'];
$requestUri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Obtener sub-ruta después de /api/
$pathInfo = '';
if (strpos($requestUri, '/api/') !== false) {
    $parts = explode('/api/', $requestUri);
    $pathInfo = trim(end($parts), '/');
} elseif (isset($_GET['endpoint'])) {
    $pathInfo = trim($_GET['endpoint'], '/');
}

$segments = explode('/', $pathInfo);
$resource = $segments[0] ?? '';
$param = $segments[1] ?? '';

// Router
switch ($resource) {
    case 'health':
        handleHealth($pdo);
        break;

    case 'cards':
        handleCards($pdo, $method, $param);
        break;

    case 'upload':
        handleUpload();
        break;

    default:
        // Si no hay recurso específico, reporta salud
        handleHealth($pdo);
        break;
}

/**
 * Endpoint de Salud / Diagnóstico de Conexión
 */
function handleHealth($pdo) {
    $dbStatus = $pdo ? 'Conectado a MySQL exitosamente' : 'Modo respaldo JSON activo (MySQL pendiente de configurar en config.php)';
    $driver = $pdo ? 'MySQL PDO (Hostinger)' : 'JSON File Storage (Fallback)';

    sendJsonResponse([
        'status' => 'OK',
        'driver' => $driver,
        'database' => $dbStatus,
        'timestamp' => date('c'),
        'php_version' => PHP_VERSION,
        'message' => 'API de LAV Digital Pagos operativa en Hostinger.'
    ]);
}

/**
 * Manejador de CRUD para Tarjetas de Pago
 */
function handleCards($pdo, $method, $param) {
    if ($method === 'GET') {
        if (!empty($param)) {
            // Obtener tarjeta por SLUG o ID
            $card = getSingleCard($pdo, $param);
            if ($card) {
                sendJsonResponse($card);
            } else {
                sendJsonResponse(['error' => 'Tarjeta no encontrada con el identificador: ' . $param], 404);
            }
        } else {
            // Listar todas las tarjetas
            $cards = getAllCards($pdo);
            sendJsonResponse($cards);
        }
    } elseif ($method === 'POST') {
        // Crear o actualizar tarjeta
        $rawInput = file_get_contents('php://input');
        $cardData = json_decode($rawInput, true);

        if (!$cardData || empty($cardData['slug']) || empty($cardData['businessName'])) {
            sendJsonResponse(['error' => 'Datos incompletos: slug y businessName son obligatorios.'], 400);
        }

        $savedCard = saveCardToStorage($pdo, $cardData);
        sendJsonResponse([
            'success' => true,
            'message' => 'Tarjeta guardada y publicada en Hostinger correctamente.',
            'card' => $savedCard
        ]);
    } elseif ($method === 'DELETE') {
        if (empty($param)) {
            sendJsonResponse(['error' => 'ID de tarjeta requerido para eliminar'], 400);
        }
        deleteCardFromStorage($pdo, $param);
        sendJsonResponse(['success' => true, 'id' => $param]);
    } else {
        sendJsonResponse(['error' => 'Método HTTP no permitido'], 405);
    }
}

/**
 * Obtiene todas las tarjetas
 */
function getAllCards($pdo) {
    if ($pdo) {
        try {
            $stmt = $pdo->query("SELECT data FROM payment_cards ORDER BY updated_at DESC");
            $cards = [];
            while ($row = $stmt->fetch()) {
                $decoded = json_decode($row['data'], true);
                if ($decoded) {
                    $cards[] = $decoded;
                }
            }
            return $cards;
        } catch (PDOException $e) {
            error_log("Error consultando MySQL: " . $e->getMessage());
        }
    }
    return loadCardsFromJsonFallback();
}

/**
 * Obtiene una sola tarjeta por slug o ID
 */
function getSingleCard($pdo, $slugOrId) {
    $clean = strtolower(trim($slugOrId));
    if ($pdo) {
        try {
            $stmt = $pdo->prepare("SELECT data FROM payment_cards WHERE LOWER(slug) = ? OR id = ? LIMIT 1");
            $stmt->execute([$clean, $slugOrId]);
            $row = $stmt->fetch();
            if ($row) {
                return json_decode($row['data'], true);
            }
        } catch (PDOException $e) {
            error_log("Error buscando en MySQL: " . $e->getMessage());
        }
    }

    $local = loadCardsFromJsonFallback();
    foreach ($local as $c) {
        if (strtolower($c['slug'] ?? '') === $clean || ($c['id'] ?? '') === $slugOrId) {
            return $c;
        }
    }
    return null;
}

/**
 * Guarda o actualiza tarjeta
 */
function saveCardToStorage($pdo, $card) {
    $now = date('Y-m-d H:i:s');
    $card['updatedAt'] = date('c');

    if ($card['status'] === 'published' && empty($card['publishedAt'])) {
        $card['publishedAt'] = date('c');
    }

    $id = $card['id'] ?? ('card_' . time() . '_' . substr(md5(uniqid()), 0, 6));
    $card['id'] = $id;
    $slug = strtolower(trim($card['slug']));
    $businessName = $card['businessName'];
    $category = $card['category'] ?? '';
    $templateId = $card['templateId'] ?? 'minimalist-slate';
    $status = $card['status'] ?? 'draft';
    $logoUrl = $card['logoUrl'] ?? null;
    $jsonData = json_encode($card, JSON_UNESCAPED_UNICODE);

    // Intentar guardar en MySQL
    if ($pdo) {
        try {
            $sql = "INSERT INTO payment_cards (id, slug, business_name, category, template_id, status, logo_url, data, updated_at, published_at)
                    VALUES (:id, :slug, :business_name, :category, :template_id, :status, :logo_url, :data, :updated_at, :published_at)
                    ON DUPLICATE KEY UPDATE 
                        slug = VALUES(slug),
                        business_name = VALUES(business_name),
                        category = VALUES(category),
                        template_id = VALUES(template_id),
                        status = VALUES(status),
                        logo_url = VALUES(logo_url),
                        data = VALUES(data),
                        updated_at = VALUES(updated_at),
                        published_at = VALUES(published_at)";
            
            $stmt = $pdo->prepare($sql);
            $stmt->execute([
                ':id' => $id,
                ':slug' => $slug,
                ':business_name' => $businessName,
                ':category' => $category,
                ':template_id' => $templateId,
                ':status' => $status,
                ':logo_url' => $logoUrl,
                ':data' => $jsonData,
                ':updated_at' => $now,
                ':published_at' => ($status === 'published' ? $now : null)
            ]);
            return $card;
        } catch (PDOException $e) {
            error_log("Error guardando en MySQL: " . $e->getMessage());
        }
    }

    // Fallback JSON
    $cards = loadCardsFromJsonFallback();
    $found = false;
    foreach ($cards as $idx => $existing) {
        if (($existing['id'] ?? '') === $id) {
            $cards[$idx] = $card;
            $found = true;
            break;
        }
    }
    if (!$found) {
        array_unshift($cards, $card);
    }
    saveCardsToJsonFallback($cards);
    return $card;
}

/**
 * Elimina tarjeta
 */
function deleteCardFromStorage($pdo, $id) {
    if ($pdo) {
        try {
            $stmt = $pdo->prepare("DELETE FROM payment_cards WHERE id = ?");
            $stmt->execute([$id]);
        } catch (PDOException $e) {
            error_log("Error eliminando en MySQL: " . $e->getMessage());
        }
    }

    $cards = loadCardsFromJsonFallback();
    $filtered = array_filter($cards, function($c) use ($id) {
        return ($c['id'] ?? '') !== $id;
    });
    saveCardsToJsonFallback(array_values($filtered));
}

/**
 * Manejo de subida de logotipos e imágenes
 */
function handleUpload() {
    if (!file_exists(UPLOADS_DIR)) {
        mkdir(UPLOADS_DIR, 0755, true);
    }

    // Soporte para subida multipart
    if (isset($_FILES['logo']) && $_FILES['logo']['error'] === UPLOAD_ERR_OK) {
        $file = $_FILES['logo'];
        $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        $allowed = ['png', 'jpg', 'jpeg', 'webp', 'svg'];

        if (!in_array($ext, $allowed)) {
            sendJsonResponse(['error' => 'Formato no permitido. Usa PNG, JPG, WebP o SVG.'], 400);
        }

        $safeName = 'logo_' . time() . '_' . substr(md5(uniqid()), 0, 6) . '.' . $ext;
        $target = UPLOADS_DIR . $safeName;

        if (move_uploaded_file($file['tmp_name'], $target)) {
            $url = 'uploads/' . $safeName;
            sendJsonResponse(['url' => $url, 'filename' => $safeName]);
        } else {
            sendJsonResponse(['error' => 'No se pudo mover el archivo al directorio de subidas.'], 500);
        }
    }

    // Soporte para base64 en JSON
    $rawInput = file_get_contents('php://input');
    $payload = json_decode($rawInput, true);
    if (!empty($payload['dataUrl'])) {
        if (preg_match('/^data:image\/(\w+);base64,/', $payload['dataUrl'], $type)) {
            $data = substr($payload['dataUrl'], strpos($payload['dataUrl'], ',') + 1);
            $type = strtolower($type[1]);
            if ($type === 'jpeg') $type = 'jpg';
            $data = base64_decode($data);

            if ($data === false) {
                sendJsonResponse(['error' => 'Fallo al decodificar Base64'], 400);
            }

            $safeName = 'logo_' . time() . '_' . substr(md5(uniqid()), 0, 6) . '.' . $type;
            file_put_contents(UPLOADS_DIR . $safeName, $data);
            sendJsonResponse(['url' => 'uploads/' . $safeName]);
        }
    }

    sendJsonResponse(['error' => 'No se recibió ningún archivo'], 400);
}
