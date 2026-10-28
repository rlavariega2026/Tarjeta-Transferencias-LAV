<?php
declare(strict_types=1);
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$path = trim((string)($_GET['path'] ?? ''), '/');
$parts = $path === '' ? [] : explode('/', $path);
$root = dirname(__DIR__);
$dataDir = $root . '/data';
$cardsFile = $dataDir . '/cards.json';
$uploadsDir = $root . '/uploads';
if (!is_dir($dataDir)) { @mkdir($dataDir, 0755, true); }
if (!is_dir($uploadsDir)) { @mkdir($uploadsDir, 0755, true); }
if (!file_exists($cardsFile)) { @file_put_contents($cardsFile, "[]"); }
function respond($body, int $status=200): never { http_response_code($status); echo json_encode($body, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES); exit; }
function loadCards(string $file): array {
  if (!is_file($file)) return [];
  $data = json_decode((string)file_get_contents($file), true);
  return is_array($data) ? $data : [];
}
function saveCards(string $file, array $cards): bool {
  $json = json_encode(array_values($cards), JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
  return $json !== false && file_put_contents($file, $json, LOCK_EX) !== false;
}
if (($parts[0] ?? '') !== '') {
  if ($parts[0] === 'health' && $method === 'GET') {
    respond(['status'=>'OK','driver'=>'PHP JSON Storage','cardsCount'=>count(loadCards($cardsFile)),'timestamp'=>gmdate('c'),'message'=>'API LAV Digital Pagos activa en Hostinger.']);
  }
  if ($parts[0] === 'cards' && $method === 'GET' && count($parts) === 1) {
    respond(loadCards($cardsFile));
  }
  if ($parts[0] === 'cards' && $method === 'GET' && isset($parts[1])) {
    $slug = strtolower(rawurldecode($parts[1]));
    foreach (loadCards($cardsFile) as $card) {
      if (strtolower((string)($card['slug'] ?? '')) === $slug || (string)($card['id'] ?? '') === $slug) respond($card);
    }
    respond(['error'=>'Tarjeta no encontrada'],404);
  }
  if ($parts[0] === 'cards' && $method === 'POST' && count($parts) === 1) {
    $incoming = json_decode((string)file_get_contents('php://input'), true);
    if (!is_array($incoming) || empty($incoming['slug']) || empty($incoming['businessName']) || empty($incoming['id'])) respond(['error'=>'Datos incompletos: id, slug y businessName son obligatorios'],400);
    $cards = loadCards($cardsFile); $found = false;
    foreach ($cards as $i => $card) {
      if (($card['id'] ?? '') === $incoming['id']) { $cards[$i] = array_merge($card, $incoming, ['updatedAt'=>gmdate('c')]); $found=true; break; }
    }
    if (!$found) { $incoming['createdAt'] = $incoming['createdAt'] ?? gmdate('c'); $incoming['updatedAt'] = gmdate('c'); array_unshift($cards,$incoming); }
    if (!saveCards($cardsFile,$cards)) respond(['error'=>'No se pudo guardar. Verifica permisos de escritura de la carpeta data.'],500);
    respond(['success'=>true,'card'=>$incoming]);
  }
  if ($parts[0] === 'cards' && $method === 'DELETE' && isset($parts[1])) {
    $id = rawurldecode($parts[1]); $cards = array_values(array_filter(loadCards($cardsFile), fn($c)=>(string)($c['id'] ?? '') !== $id));
    if (!saveCards($cardsFile,$cards)) respond(['error'=>'No se pudo guardar el cambio'],500);
    respond(['success'=>true,'id'=>$id]);
  }
  if ($parts[0] === 'upload' && $method === 'POST') {
    if (!isset($_FILES['logo']) || $_FILES['logo']['error'] !== UPLOAD_ERR_OK) respond(['error'=>'No se recibió un archivo válido'],400);
    $file = $_FILES['logo'];
    if ($file['size'] > 5 * 1024 * 1024) respond(['error'=>'El archivo supera el límite de 5MB'],413);
    $finfo = new finfo(FILEINFO_MIME_TYPE); $mime = $finfo->file($file['tmp_name']);
    $allowed = ['image/png'=>'png','image/jpeg'=>'jpg','image/webp'=>'webp','image/svg+xml'=>'svg'];
    if (!isset($allowed[$mime])) respond(['error'=>'Formato de imagen no permitido'],415);
    $name = 'logo_' . bin2hex(random_bytes(10)) . '.' . $allowed[$mime];
    if (!move_uploaded_file($file['tmp_name'], $uploadsDir . '/' . $name)) respond(['error'=>'No se pudo guardar la imagen'],500);
    $base = rtrim(dirname(dirname($_SERVER['SCRIPT_NAME'] ?? '/Tarjetas-transferencias/api/index.php')), '/');
    respond(['url'=>($base ?: '') . '/uploads/' . $name]);
  }
}
respond(['error'=>'Ruta API no encontrada'],404);
