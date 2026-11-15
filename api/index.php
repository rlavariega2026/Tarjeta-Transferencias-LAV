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

// Protected session authentication and first-owner setup.
ini_set('session.use_strict_mode','1');
session_name('LAV_TRANSFERENCIAS_SESSION');
session_set_cookie_params(['lifetime'=>0,'path'=>'/Tarjetas-transferencias/','secure'=>!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS']!=='off','httponly'=>true,'samesite'=>'Lax']);
session_start();
$usersFile=$dataDir.'/users.json';
function usersRead(string $f): array { $v=is_file($f)?json_decode((string)file_get_contents($f),true):[]; return is_array($v)?$v:[]; }
function usersWrite(string $f,array $v): void { if(file_put_contents($f,json_encode($v,JSON_PRETTY_PRINT),LOCK_EX)===false)respond(['error'=>'Error al guardar usuarios'],500); }
function bodyJson(): array { $v=json_decode((string)file_get_contents('php://input'),true);return is_array($v)?$v:[]; }
function loggedUser(string $f): ?array {
  $id=$_SESSION['user']??null;
  if(!$id || time()-($_SESSION['last']??0)>3600)return null;
  foreach(usersRead($f) as $u)if($u['username']===$id && ($u['active']??true) && ($_SESSION['version']??-1)===($u['version']??0)){$_SESSION['last']=time();return ['username'=>$u['username'],'role'=>$u['role']];}
  return null;
}
function requireLogin(string $f,bool $admin=false): array { $u=loggedUser($f);if(!$u)respond(['error'=>'Inicia sesión'],401);if($admin && $u['role']!=='superadmin')respond(['error'=>'Acceso denegado'],403);return $u; }
function csrfCheck(): void { if(!hash_equals((string)($_SESSION['csrf']??''),(string)($_SERVER['HTTP_X_CSRF_TOKEN']??'')))respond(['error'=>'CSRF inválido'],403); }
if(($parts[0]??'')==='auth'){
  $action=$parts[1]??'';
  if($action==='status' && $method==='GET')respond(['setupRequired'=>count(usersRead($usersFile))===0,'user'=>loggedUser($usersFile),'csrf'=>$_SESSION['csrf']??null]);
  if($action==='setup' && $method==='POST'){
    if(count(usersRead($usersFile))!==0)respond(['error'=>'Configuración ya realizada'],403);
    $b=bodyJson();$password=(string)($b['password']??'');
    if(strlen($password)<12)respond(['error'=>'La contraseña debe tener al menos 12 caracteres'],400);
    usersWrite($usersFile,[['username'=>'lavariega','password'=>password_hash($password,PASSWORD_DEFAULT),'role'=>'superadmin','active'=>true,'version'=>0]]);
    session_regenerate_id(true);$_SESSION['user']='lavariega';$_SESSION['version']=0;$_SESSION['last']=time();$_SESSION['csrf']=bin2hex(random_bytes(32));
    respond(['user'=>['username'=>'lavariega','role'=>'superadmin'],'csrf'=>$_SESSION['csrf']]);
  }
  if($action==='login' && $method==='POST'){
    $b=bodyJson();$name=(string)($b['username']??'');$pass=(string)($b['password']??'');
    $attemptFile=$dataDir.'/login-attempts.json';$attempts=usersRead($attemptFile);$key=hash('sha256',($_SERVER['REMOTE_ADDR']??'unknown').'|'.$name);$rec=$attempts[$key]??['count'=>0,'since'=>time()];
    if(time()-$rec['since']>900)$rec=['count'=>0,'since'=>time()];
    if($rec['count']>=8)respond(['error'=>'Demasiados intentos. Espera 15 minutos'],429);
    foreach(usersRead($usersFile) as $u)if($u['username']===$name && ($u['active']??true) && password_verify($pass,$u['password'])){
      unset($attempts[$key]);usersWrite($attemptFile,$attempts);
      session_regenerate_id(true);$_SESSION['user']=$name;$_SESSION['version']=$u['version']??0;$_SESSION['last']=time();$_SESSION['csrf']=bin2hex(random_bytes(32));
      respond(['user'=>['username'=>$name,'role'=>$u['role']],'csrf'=>$_SESSION['csrf']]);
    }
    $rec['count']++;$attempts[$key]=$rec;usersWrite($attemptFile,$attempts);respond(['error'=>'Usuario o contraseña incorrectos'],401);
  }
  if($action==='logout' && $method==='POST'){csrfCheck();session_destroy();respond(['success'=>true]);}
  respond(['error'=>'Ruta de autenticación no encontrada'],404);
}
if(($parts[0]??'')==='users'){
  requireLogin($usersFile,true);
  if($method!=='GET')csrfCheck();
  $users=usersRead($usersFile);
  if($method==='GET')respond(array_map(fn($u)=>['username'=>$u['username'],'role'=>$u['role'],'active'=>$u['active']??true],$users));
  $b=bodyJson();$name=trim((string)($b['username']??''));$action=(string)($b['action']??'create');
  if(!preg_match('/^[a-zA-Z0-9_.-]{3,40}$/',$name))respond(['error'=>'Nombre de usuario inválido'],400);
  if($name==='lavariega' && $action!=='password')respond(['error'=>'Cuenta principal protegida'],403);
  $index=null;foreach($users as $i=>$u)if($u['username']===$name)$index=$i;
  if($action==='create'){
    if($index!==null)respond(['error'=>'Usuario existente'],409);
    if(strlen((string)($b['password']??''))<12)respond(['error'=>'Contraseña mínima: 12 caracteres'],400);
    $users[]=['username'=>$name,'password'=>password_hash($b['password'],PASSWORD_DEFAULT),'role'=>'user','active'=>true,'version'=>0];
  }else{
    if($index===null)respond(['error'=>'Usuario inexistente'],404);
    if($action==='delete')array_splice($users,$index,1);
    elseif($action==='suspend' || $action==='activate'){$users[$index]['active']=$action==='activate';$users[$index]['version']=($users[$index]['version']??0)+1;}
    elseif($action==='password'){if(strlen((string)($b['password']??''))<12)respond(['error'=>'Contraseña mínima: 12 caracteres'],400);$users[$index]['password']=password_hash($b['password'],PASSWORD_DEFAULT);$users[$index]['version']=($users[$index]['version']??0)+1;}
    else respond(['error'=>'Acción inválida'],400);
  }
  usersWrite($usersFile,$users);respond(['success'=>true]);
}
// Drafts, editor data and uploads require a valid session; only published/demo cards are public.
if(($parts[0]??'')==='cards' && $method==='GET' && isset($parts[1]) && !loggedUser($usersFile)){
  $slug=strtolower(rawurldecode($parts[1]));
  foreach(loadCards($cardsFile) as $card)if((strtolower((string)($card['slug']??''))===$slug) && in_array($card['status']??'', ['published','demo'],true))respond($card);
  respond(['error'=>'Publicación no encontrada'],404);
}
if(($parts[0]??'')!=='health' && ($parts[0]??'')!==''){
  requireLogin($usersFile);
  if($method!=='GET')csrfCheck();
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
