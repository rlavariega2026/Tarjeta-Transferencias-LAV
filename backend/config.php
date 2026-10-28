<?php
/**
 * LAV Digital Pagos - Configuración de Base de Datos y Seguridad para Hostinger
 * Compatible con cPanel / hPanel y MySQL 5.7+ / 8.0+
 */

// Permitir peticiones seguras (CORS)
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Configuración de Base de Datos MySQL en Hostinger
// IMPORTANTE: Sustituye estos valores con los datos de tu hPanel -> Bases de datos MySQL
define('DB_HOST', getenv('LAV_DB_HOST') ?: 'localhost');
define('DB_NAME', getenv('LAV_DB_NAME') ?: 'u123456789_lavpagos');
define('DB_USER', getenv('LAV_DB_USER') ?: 'u123456789_admin');
define('DB_PASS', getenv('LAV_DB_PASS') ?: 'TuPasswordSeguro123!');
define('DB_PORT', getenv('LAV_DB_PORT') ?: 3306);

// Ruta base provisional en Hostinger
define('BASE_URL', 'https://lavdigitalmkt.com/pagos-digitales/');
define('UPLOADS_DIR', __DIR__ . '/../uploads/');
define('DATA_BACKUP_FILE', __DIR__ . '/cards_backup.json');

/**
 * Obtiene la conexión PDO a MySQL con manejo seguro de errores
 */
function getDbConnection() {
    static $pdo = null;
    if ($pdo !== null) {
        return $pdo;
    }

    // Si las credenciales son las predeterminadas o vacías, retorna null para activar fallback JSON
    if (DB_NAME === 'u123456789_lavpagos' && DB_PASS === 'TuPasswordSeguro123!') {
        return null;
    }

    try {
        $dsn = "mysql:host=" . DB_HOST . ";port=" . DB_PORT . ";dbname=" . DB_NAME . ";charset=utf8mb4";
        $options = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ];
        $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
        return $pdo;
    } catch (PDOException $e) {
        error_log("Error conectando a MySQL: " . $e->getMessage());
        return null; // Fallback automático para evitar 500 error
    }
}

/**
 * Respuesta JSON estándar
 */
function sendJsonResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    exit();
}

/**
 * Carga tarjetas del archivo JSON de respaldo si MySQL no está configurado aún
 */
function loadCardsFromJsonFallback() {
    if (file_exists(DATA_BACKUP_FILE)) {
        $content = file_get_contents(DATA_BACKUP_FILE);
        $data = json_decode($content, true);
        if (is_array($data)) {
            return $data;
        }
    }
    return [];
}

/**
 * Guarda tarjetas en JSON de respaldo
 */
function saveCardsToJsonFallback($cards) {
    file_put_contents(DATA_BACKUP_FILE, json_encode($cards, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
}
