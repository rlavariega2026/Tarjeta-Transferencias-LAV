# GUÍA DEFINITIVA DE INSTALACIÓN Y PUBLICACIÓN EN HOSTINGER
# LAV DIGITAL PAGOS

Aplicación profesional para crear, personalizar, publicar y compartir tarjetas digitales de pago para negocios en Hostinger.

---

## 1. Arquitectura del Proyecto

El proyecto está diseñado bajo una arquitectura desacoplada y compatible con cualquier plan de hosting compartido (cPanel o hPanel) de Hostinger:

- **Frontend (SPA):** React 19, TypeScript, Vite, Tailwind CSS compilado en archivos estáticos (`index.html`, `assets/`, `icon.svg`, `manifest.json`).
- **Backend (PHP):** Archivos PHP sin dependencias complejas (`backend/config.php`, `backend/api.php`, `backend/card.php`).
- **Base de Datos (MySQL):** Tabla optimizada `payment_cards` con índices en `slug`, `status` y `updated_at`.
- **Servidor Web (Apache / LiteSpeed):** Archivo `.htaccess` con reglas de reescritura para URLs amigables (`/t/nombre-negocio` o `/pagos/nombre-negocio`) y renderizado de OpenGraph en servidor para WhatsApp.

---

## 2. Paso a Paso para Publicar en Hostinger

### Paso 1: Compilar la Aplicación Frontend
1. En tu computadora o terminal, ejecuta:
   ```bash
   npm run build
   ```
2. Esto generará la carpeta `dist/` con todos los archivos estáticos listos para producción.

### Paso 2: Crear la Base de Datos MySQL en Hostinger
1. Inicia sesión en tu cuenta de Hostinger y entra a **hPanel**.
2. Ve a la sección **Bases de Datos -> Bases de datos MySQL**.
3. Ingresa los datos para una nueva base de datos:
   - **Nombre de la base de datos:** ej. `u123456789_lavpagos`
   - **Usuario MySQL:** ej. `u123456789_admin`
   - **Contraseña:** una contraseña segura y guárdala.
4. Haz clic en **Crear**.

### Paso 3: Importar la Estructura de Tablas en phpMyAdmin
1. En la misma pantalla de bases de datos de Hostinger, haz clic en **Entrar a phpMyAdmin** junto a tu base de datos recién creada.
2. En phpMyAdmin, haz clic en la pestaña **Importar** (en el menú superior).
3. Haz clic en **Examinar** o **Seleccionar archivo** y elige el archivo `backend/database.sql` incluido en el proyecto.
4. Deja las opciones por defecto y haz clic en **Continuar** o **Importar**.
5. Verás el mensaje en verde confirmando la creación de la tabla `payment_cards`.

### Paso 4: Configurar Credenciales en `backend/config.php`
1. Abre el archivo `backend/config.php`.
2. Actualiza las constantes con los datos reales creados en el Paso 2:
   ```php
   define('DB_HOST', 'localhost');
   define('DB_NAME', 'u123456789_lavpagos');
   define('DB_USER', 'u123456789_admin');
   define('DB_PASS', 'TuPasswordRealAqui');
   define('DB_PORT', 3306);

   // Tu ruta real en Hostinger
   define('BASE_URL', 'https://lavdigitalmkt.com/pagos-digitales/');
   ```
3. Guarda el archivo.

### Paso 5: Subir los Archivos al Directorio en Hostinger
1. Entra al **Administrador de Archivos** de Hostinger (o conéctate por FTP con FileZilla).
2. Navega a `public_html/`.
3. Crea una carpeta independiente llamada `pagos-digitales` (o la ruta que hayas elegido).
   *Nota: No sobrescribas tus aplicaciones existentes de tarjetas, bienes raíces o invitaciones.*
4. Sube a `/public_html/pagos-digitales/`:
   - El contenido de la carpeta `dist/` (`index.html`, carpeta `assets/`, `icon.svg`, `manifest.json`, `.htaccess`).
   - La carpeta `backend/` completa conteniendo `api.php`, `config.php`, `card.php`, y `database.sql`.
   - Crea una carpeta vacía llamada `uploads/` y asegúrate de que tenga permisos `755`.

### Estructura Final en Hostinger:
```
/public_html/pagos-digitales/
├── .htaccess
├── index.html
├── icon.svg
├── manifest.json
├── sw.js
├── assets/
│   ├── index-*.js
│   └── index-*.css
├── backend/
│   ├── api.php
│   ├── config.php
│   ├── card.php
│   └── database.sql
└── uploads/ (permisos 755)
```

---

## 3. Verificación de Funcionamiento

1. Abre tu navegador e ingresa a:
   `https://lavdigitalmkt.com/pagos-digitales/`
2. Ve a la pestaña **Despliegue Hostinger** y haz clic en **Probar Conexión Ahora**. Deberás ver el indicador verde: *MySQL PDO (Hostinger) - Conectado a MySQL exitosamente*.
3. Haz clic en **+ Crear Tarjeta**.
4. Sube el logotipo del negocio, captura las cuentas bancarias (SPEI con validación CLABE), activa PayPal o Google Reviews si corresponde.
5. Haz clic en **Publicar Tarjeta**.
6. Se asignará un enlace permanente (ej. `https://lavdigitalmkt.com/pagos-digitales/t/mi-negocio`).
7. Envía ese enlace por WhatsApp a tu teléfono o a un cliente. Comprobarás que WhatsApp muestra automáticamente la previsualización social (OpenGraph) con el logotipo y nombre de tu negocio gracias al renderizador `backend/card.php`.

---

## 4. Actualización Futura sin Pérdida de Datos

Cuando realices mejoras en la aplicación en el futuro:
1. Vuelve a compilar con `npm run build`.
2. Sube únicamente los archivos de la carpeta `dist/` a `/public_html/pagos-digitales/`.
3. **NUNCA borres la base de datos MySQL ni la carpeta `uploads/`**.
4. Todas las tarjetas de tus clientes seguirán activas con los mismos enlaces públicos y códigos QR sin interrupción alguna.
