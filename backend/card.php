<?php
/**
 * LAV Digital Pagos - Renderizador de Metadatos Sociales y OpenGraph en Servidor
 * Garantiza que WhatsApp, Telegram, Facebook y navegadores muestren la tarjeta
 * y logotipo específicos del negocio y NO una página genérica.
 */

require_once __DIR__ . '/config.php';

$slug = isset($_GET['slug']) ? strtolower(trim($_GET['slug'])) : '';

if (empty($slug)) {
    header("Location: ../index.html");
    exit();
}

// Buscar tarjeta en MySQL o JSON fallback
$pdo = getDbConnection();
$card = null;

if ($pdo) {
    try {
        $stmt = $pdo->prepare("SELECT data FROM payment_cards WHERE LOWER(slug) = ? LIMIT 1");
        $stmt->execute([$slug]);
        $row = $stmt->fetch();
        if ($row) {
            $card = json_decode($row['data'], true);
        }
    } catch (PDOException $e) {
        error_log("Error buscando tarjeta en card.php: " . $e->getMessage());
    }
}

if (!$card) {
    $cards = loadCardsFromJsonFallback();
    foreach ($cards as $c) {
        if (strtolower($c['slug'] ?? '') === $slug) {
            $card = $c;
            break;
        }
    }
}

// Si no existe la tarjeta, redirigir al inicio o 404
if (!$card) {
    http_response_code(404);
    echo "<!DOCTYPE html><html><head><title>Tarjeta no encontrada</title></head><body style='font-family:sans-serif;text-align:center;padding:50px;'><h2>Tarjeta no encontrada</h2><p>El enlace solicitado no existe o ha sido despublicado.</p><a href='../'>Volver al inicio</a></body></html>";
    exit();
}

// Extracción de datos específicos de la tarjeta
$businessName = htmlspecialchars($card['businessName'] ?? 'Negocio Comercial', ENT_QUOTES, 'UTF-8');
$tagline = htmlspecialchars($card['tagline'] ?? 'Transferencias Bancarias & PayPal', ENT_QUOTES, 'UTF-8');
$category = htmlspecialchars($card['category'] ?? '', ENT_QUOTES, 'UTF-8');

// Construcción de descripción detallada para el snippet de WhatsApp
$bankNames = [];
if (!empty($card['banking']['accounts'])) {
    foreach ($card['banking']['accounts'] as $acc) {
        if (!empty($acc['bankName'])) {
            $bankNames[] = $acc['bankName'];
        }
    }
}
$bankSummary = count($bankNames) > 0 ? implode(', ', array_unique($bankNames)) : 'SPEI';

$metaTitle = "💳 Pago Oficial — {$businessName}";
$metaDescription = "Datos bancarios para transferencia inmediata ({$bankSummary}), PayPal y métodos de pago verificados de {$businessName}. Toca para consultar y copiar datos.";

// Imagen de previsualización (Logotipo del negocio o icono de marca)
$logoUrl = $card['logoUrl'] ?? '';
$imageUrl = BASE_URL . 'icon.svg';
if (!empty($logoUrl)) {
    if (strpos($logoUrl, 'http') === 0) {
        $imageUrl = $logoUrl;
    } else {
        $imageUrl = rtrim(BASE_URL, '/') . '/' . ltrim($logoUrl, '/');
    }
}

$canonicalUrl = rtrim(BASE_URL, '/') . '/t/' . urlencode($slug);

// Detectar si la petición proviene de un rastreador social (WhatsApp, Facebook, Twitter, Telegram, etc.)
$userAgent = strtolower($_SERVER['HTTP_USER_AGENT'] ?? '');
$isCrawler = preg_match('/(whatsapp|facebookexternalhit|facebot|twitterbot|telegrambot|linkedinbot|slackbot|discordbot|bingbot|googlebot)/i', $userAgent);

// Si es un usuario humano en navegador, redirigir a la SPA conservando el parámetro para carga inmediata
if (!$isCrawler && !isset($_GET['preview'])) {
    header("Location: ../?card=" . urlencode($slug), true, 302);
    exit();
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo $metaTitle; ?></title>
    <meta name="description" content="<?php echo $metaDescription; ?>">
    <link rel="canonical" href="<?php echo $canonicalUrl; ?>">

    <!-- Metadatos OpenGraph para WhatsApp, Facebook, LinkedIn -->
    <meta property="og:type" content="website">
    <meta property="og:title" content="<?php echo $metaTitle; ?>">
    <meta property="og:description" content="<?php echo $metaDescription; ?>">
    <meta property="og:image" content="<?php echo $imageUrl; ?>">
    <meta property="og:url" content="<?php echo $canonicalUrl; ?>">
    <meta property="og:site_name" content="LAV Digital Pagos">
    <meta property="og:locale" content="es_MX">

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="<?php echo $metaTitle; ?>">
    <meta name="twitter:description" content="<?php echo $metaDescription; ?>">
    <meta name="twitter:image" content="<?php echo $imageUrl; ?>">

    <!-- Redirección automática de respaldo -->
    <meta http-equiv="refresh" content="0; url=../?card=<?php echo urlencode($slug); ?>">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #090d16; color: #f8fafc; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0;">
    <div style="text-align: center; max-width: 400px; padding: 24px;">
        <h2 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 8px;"><?php echo $businessName; ?></h2>
        <p style="color: #94a3b8; font-size: 0.95rem; margin-bottom: 20px;">Cargando tarjeta digital de pago...</p>
        <a href="../?card=<?php echo urlencode($slug); ?>" style="display: inline-block; background-color: #10b981; color: #041611; font-weight: 600; padding: 12px 24px; border-radius: 12px; text-decoration: none;">Abrir tarjeta de pago</a>
    </div>
</body>
</html>
