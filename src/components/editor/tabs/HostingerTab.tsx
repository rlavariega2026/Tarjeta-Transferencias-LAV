import React, { useState, useEffect } from 'react';
import { 
  Server, 
  Database, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  FileCode, 
  ExternalLink, 
  ShieldCheck, 
  RefreshCw,
  FolderTree,
  Terminal,
  FileCheck
} from 'lucide-react';
import JSZip from 'jszip';
import { 
  testServerConnection, 
  getHostingerSettings, 
  saveHostingerSettings, 
  HostingerSettings 
} from '../../../services/apiService';

interface HostingerTabProps {
  onNotify: (title: string, desc?: string, type?: 'success' | 'error' | 'info') => void;
}

export const HostingerTab: React.FC<HostingerTabProps> = ({ onNotify }) => {
  const [settings, setSettings] = useState<HostingerSettings>(getHostingerSettings());
  const [serverHealth, setServerHealth] = useState<{
    connected: boolean;
    driver: string;
    status: string;
    message: string;
    timestamp: string;
  } | null>(null);
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [activeCodeTab, setActiveCodeTab] = useState<'config' | 'sql' | 'api' | 'card' | 'htaccess'>('config');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [isGeneratingZip, setIsGeneratingZip] = useState<boolean>(false);

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    setIsChecking(true);
    const health = await testServerConnection();
    setServerHealth(health);
    setIsChecking(false);
  };

  const handleSaveSettings = () => {
    saveHostingerSettings(settings);
    onNotify('Configuración guardada', 'Ruta base de Hostinger actualizada.', 'success');
  };

  const handleCopyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    onNotify('Código copiado', 'Puedes pegarlo directamente en tu editor o en el Administrador de Archivos de Hostinger.', 'success');
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Código de config.php
  const configPhpCode = `<?php
/**
 * LAV Digital Pagos - Configuración de Base de Datos para Hostinger
 * Ubicación en Hostinger: /public_html/pagos-digitales/backend/config.php
 */

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Credenciales MySQL en Hostinger (hPanel -> Bases de datos MySQL)
define('DB_HOST', 'localhost');
define('DB_NAME', 'u123456789_lavpagos');      // Tu nombre de BD de Hostinger
define('DB_USER', 'u123456789_admin');         // Tu usuario de BD de Hostinger
define('DB_PASS', 'TuPasswordSeguro123!');     // Tu contraseña configurada
define('DB_PORT', 3306);

// URL Base pública en tu dominio
define('BASE_URL', '${settings.baseUrl || 'https://lavdigitalmkt.com/pagos-digitales/'}');
define('UPLOADS_DIR', __DIR__ . '/../uploads/');
define('DATA_BACKUP_FILE', __DIR__ . '/cards_backup.json');

function getDbConnection() {
    static $pdo = null;
    if ($pdo !== null) return $pdo;

    try {
        $dsn = "mysql:host=" . DB_HOST . ";port=" . DB_PORT . ";dbname=" . DB_NAME . ";charset=utf8mb4";
        $options = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ];
        return new PDO($dsn, DB_USER, DB_PASS, $options);
    } catch (PDOException $e) {
        error_log("Error conectando a MySQL: " . $e->getMessage());
        return null; // Fallback automático a archivo JSON para cero caídas
    }
}

function sendJsonResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    exit();
}`;

  // Código de database.sql
  const databaseSqlCode = `-- LAV Digital Pagos
-- Script MySQL para Hostinger (phpMyAdmin)
CREATE TABLE IF NOT EXISTS \`payment_cards\` (
  \`id\` VARCHAR(64) NOT NULL PRIMARY KEY,
  \`slug\` VARCHAR(128) NOT NULL UNIQUE,
  \`business_name\` VARCHAR(255) NOT NULL,
  \`category\` VARCHAR(100) DEFAULT '',
  \`template_id\` VARCHAR(64) NOT NULL DEFAULT 'minimalist-slate',
  \`status\` ENUM('draft', 'published', 'archived') NOT NULL DEFAULT 'draft',
  \`logo_url\` TEXT DEFAULT NULL,
  \`data\` LONGTEXT NOT NULL COMMENT 'Payload JSON con cuentas bancarias, paypal y estilos',
  \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  \`published_at\` DATETIME DEFAULT NULL,
  KEY \`idx_slug\` (\`slug\`),
  KEY \`idx_status\` (\`status\`),
  KEY \`idx_updated\` (\`updated_at\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`;

  // Código de .htaccess
  const htaccessCode = `# LAV Digital Pagos - Apache Rewrite Rules para Hostinger
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /pagos-digitales/

    # Rutas limpias de tarjetas con OpenGraph en servidor para WhatsApp
    RewriteRule ^t/([a-zA-Z0-9_-]+)/?$ backend/card.php?slug=$1 [L,QSA]
    RewriteRule ^pagos/([a-zA-Z0-9_-]+)/?$ backend/card.php?slug=$1 [L,QSA]

    # Endpoints de API PHP
    RewriteRule ^api/(.*)$ backend/api.php?endpoint=$1 [L,QSA]

    # Servir archivos estáticos reales
    RewriteCond %{REQUEST_FILENAME} -f [OR]
    RewriteCond %{REQUEST_FILENAME} -d
    RewriteRule ^ - [L]

    # SPA Fallback a index.html
    RewriteRule ^ index.html [L]
</IfModule>

# Protección de archivos delicados
<FilesMatch "(\\.(sql|env|log)|config\\.php|cards_backup\\.json)$">
    Order allow,deny
    Deny from all
</FilesMatch>

Options -Indexes`;

  // Generador de ZIP para Hostinger
  const handleDownloadFullZip = async () => {
    setIsGeneratingZip(true);
    try {
      const zip = new JSZip();

      // Carpeta backend
      const backendFolder = zip.folder('backend');
      backendFolder?.file('config.php', configPhpCode);
      backendFolder?.file('database.sql', databaseSqlCode);
      
      // Obtener el código real de api.php y card.php desde los archivos existentes o templates
      const apiRes = await fetch('/backend/api.php').catch(() => null);
      const apiContent = apiRes && apiRes.ok ? await apiRes.text() : '<?php /* api.php */ ?>';
      backendFolder?.file('api.php', apiContent);

      const cardRes = await fetch('/backend/card.php').catch(() => null);
      const cardContent = cardRes && cardRes.ok ? await cardRes.text() : '<?php /* card.php */ ?>';
      backendFolder?.file('card.php', cardContent);

      // Carpeta raíz
      zip.file('.htaccess', htaccessCode);

      // Instrucciones en Markdown
      const instructions = `# GUÍA DE PUBLICACIÓN EN HOSTINGER — LAV DIGITAL PAGOS
Ruta: ${settings.baseUrl}

## 1. Crear Base de Datos en Hostinger hPanel
1. Entra a tu hPanel -> Bases de datos MySQL.
2. Crea una base de datos nueva (ejemplo: u123456789_lavpagos).
3. Crea un usuario con todos los privilegios y contraseña segura.

## 2. Importar Tablas en phpMyAdmin
1. Entra a phpMyAdmin desde el hPanel.
2. Selecciona tu base de datos y ve a la pestaña "Importar".
3. Sube el archivo \`backend/database.sql\` y haz clic en Continuar.

## 3. Configurar Credenciales en backend/config.php
Abre \`backend/config.php\` y coloca el nombre de tu base de datos, usuario y contraseña.

## 4. Subir Archivos a Hostinger File Manager
Sube la carpeta del proyecto a:
\`/public_html/pagos-digitales/\`

Estructura requerida:
- \`/public_html/pagos-digitales/index.html\`
- \`/public_html/pagos-digitales/assets/\`
- \`/public_html/pagos-digitales/.htaccess\`
- \`/public_html/pagos-digitales/icon.svg\`
- \`/public_html/pagos-digitales/manifest.json\`
- \`/public_html/pagos-digitales/backend/api.php\`
- \`/public_html/pagos-digitales/backend/config.php\`
- \`/public_html/pagos-digitales/backend/card.php\`
- \`/public_html/pagos-digitales/uploads/\` (permisos 755)

## 5. Verificación
Abre tu navegador en:
${settings.baseUrl}
Crea tu primera tarjeta y compártela en WhatsApp. ¡Verás el logotipo y metadatos reales!`;

      zip.file('INSTRUCCIONES_HOSTINGER.md', instructions);

      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'LAV_Pagos_Hostinger_Deploy_Bundle.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      onNotify('Paquete Hostinger generado', 'Se descargó LAV_Pagos_Hostinger_Deploy_Bundle.zip con todos los archivos listos para subir.', 'success');
    } catch (e: any) {
      console.error('Error zipping:', e);
      onNotify('Error al empaquetar', e.message || 'No se pudo generar el ZIP', 'error');
    } finally {
      setIsGeneratingZip(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Diagnóstico de Conexión en Tiempo Real */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Server className="w-4 h-4 text-emerald-400" />
              <span>Diagnóstico de Servidor & Conexión Hostinger</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Verifica el estado del backend, persistencia de datos y respuesta del endpoint /api/health.
            </p>
          </div>

          <button
            onClick={checkConnection}
            disabled={isChecking}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors border border-slate-700 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${isChecking ? 'animate-spin' : ''}`} />
            <span>{isChecking ? 'Verificando...' : 'Probar Conexión Ahora'}</span>
          </button>
        </div>

        {serverHealth && (
          <div className={`p-4 rounded-xl border ${
            serverHealth.connected 
              ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300' 
              : 'bg-amber-950/20 border-amber-500/30 text-amber-300'
          }`}>
            <div className="flex items-start gap-3">
              {serverHealth.connected ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              )}
              <div className="flex-1 text-xs space-y-1">
                <div className="font-bold text-sm tracking-tight">
                  {serverHealth.driver}
                </div>
                <p className="text-slate-300">{serverHealth.message}</p>
                <div className="text-[11px] font-mono text-slate-400 pt-1">
                  Estado: {serverHealth.status} • Última verificación: {new Date(serverHealth.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 2. Configuración de Ruta en Hostinger */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <FolderTree className="w-4 h-4 text-emerald-400" />
          <span>Ruta de Alojamiento en Hostinger</span>
        </h4>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            URL Base Provisional en tu Dominio
          </label>
          <div className="flex gap-2">
            <input
              type="url"
              value={settings.baseUrl}
              onChange={(e) => setSettings({ ...settings, baseUrl: e.target.value })}
              placeholder="https://lavdigitalmkt.com/pagos-digitales/"
              className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-xs font-mono focus:outline-none focus:border-emerald-500"
            />
            <button
              onClick={handleSaveSettings}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow transition-colors cursor-pointer"
            >
              Guardar Ruta
            </button>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Esta URL se utiliza para generar los enlaces individuales, las invitaciones de WhatsApp y los códigos QR.
          </p>
        </div>

        {/* Botón Descargar Paquete Completo ZIP */}
        <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <div className="text-xs font-bold text-slate-200">
              Descargar Paquete Completo de Despliegue (.ZIP)
            </div>
            <div className="text-[11px] text-slate-400">
              Incluye config.php, database.sql, api.php, card.php, .htaccess e instrucciones paso a paso.
            </div>
          </div>

          <button
            onClick={handleDownloadFullZip}
            disabled={isGeneratingZip}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 active:scale-95 shadow-md transition-all cursor-pointer whitespace-nowrap"
          >
            <Download className="w-4 h-4" />
            <span>{isGeneratingZip ? 'Generando ZIP...' : 'Descargar ZIP Hostinger'}</span>
          </button>
        </div>
      </div>

      {/* 3. Visor Interactivo de Código para Servidor */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <FileCode className="w-4 h-4 text-emerald-400" />
            <span>Archivos de Producción para Hostinger</span>
          </h4>
        </div>

        {/* Selector de Archivo */}
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {[
            { id: 'config', name: 'config.php', label: 'Conexión MySQL' },
            { id: 'sql', name: 'database.sql', label: 'Script de Tablas' },
            { id: 'htaccess', name: '.htaccess', label: 'Reglas Apache & URLs' }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveCodeTab(item.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors cursor-pointer ${
                activeCodeTab === item.id
                  ? 'bg-emerald-500 text-slate-950 font-bold'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {item.name}
            </button>
          ))}
        </div>

        {/* Contenido del Código */}
        <div className="relative">
          <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-300 overflow-x-auto max-h-72 leading-relaxed">
            {activeCodeTab === 'config' && configPhpCode}
            {activeCodeTab === 'sql' && databaseSqlCode}
            {activeCodeTab === 'htaccess' && htaccessCode}
          </pre>

          <button
            onClick={() => {
              const code = activeCodeTab === 'config' ? configPhpCode : activeCodeTab === 'sql' ? databaseSqlCode : htaccessCode;
              handleCopyCode(code, activeCodeTab);
            }}
            className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 shadow-sm cursor-pointer"
          >
            {copiedCode === activeCodeTab ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Copiado</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copiar Archivo</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 4. Instrucciones Paso a Paso para Desplegar */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <FileCheck className="w-4 h-4 text-emerald-400" />
          <span>Guía Paso a Paso para Desplegar en Hostinger</span>
        </h4>

        <div className="space-y-3 text-xs text-slate-300">
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
            <div className="font-bold text-emerald-400">Paso 1: Crear Base de Datos MySQL en Hostinger</div>
            <p className="text-slate-400">
              Entra a tu <strong>hPanel → Bases de datos MySQL</strong>. Crea una base de datos nueva (ej. <code>u123456789_lavpagos</code>), un usuario y su contraseña.
            </p>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
            <div className="font-bold text-emerald-400">Paso 2: Importar Script SQL en phpMyAdmin</div>
            <p className="text-slate-400">
              Abre <strong>phpMyAdmin</strong> desde tu hPanel. Selecciona la base de datos creada, ve a la pestaña <strong>Importar</strong> y ejecuta el archivo <code>database.sql</code> para crear la tabla <code>payment_cards</code> con sus índices.
            </p>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
            <div className="font-bold text-emerald-400">Paso 3: Subir Archivos a la Carpeta Independiente</div>
            <p className="text-slate-400">
              Desde el <strong>Administrador de Archivos</strong> de Hostinger o FileZilla (FTP), sube los archivos compilados a <code>/public_html/pagos-digitales/</code>. No toques ni sobrescribas tus otras carpetas de tarjetas, inmobiliaria o invitaciones.
            </p>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
            <div className="font-bold text-emerald-400">Paso 4: Comprobar Tarjetas y Metadatos en WhatsApp</div>
            <p className="text-slate-400">
              Crea tu tarjeta en el editor y haz clic en <strong>Publicar</strong>. Al enviar el enlace por WhatsApp, el archivo <code>backend/card.php</code> generará dinámicamente el título y logotipo exclusivo de tu negocio.
            </p>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
            <div className="font-bold text-emerald-400">Paso 5: Actualizaciones Futuras sin Pérdida de Datos</div>
            <p className="text-slate-400">
              Cuando actualices la aplicación en el futuro, solo reemplaza los archivos HTML/JS/CSS de la carpeta <code>assets/</code>. <strong>Nunca borres la base de datos MySQL ni la carpeta <code>uploads/</code></strong>, asegurando que las tarjetas ya publicadas de tus clientes sigan funcionando ininterrumpidamente.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
