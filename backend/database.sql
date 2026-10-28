-- LAV Digital Pagos
-- Script de Creación de Base de Datos para Hostinger MySQL
-- Versión compatible con MySQL 5.7+ y MySQL 8.0+ / MariaDB 10.3+

SET NAMES utf8mb4;
SET time_zone = '+00:00';
SET foreign_key_checks = 0;
SET sql_mode = 'NO_AUTO_VALUE_ON_ZERO';

-- --------------------------------------------------------
-- Estructura de tabla para `payment_cards`
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS `payment_cards` (
  `id` VARCHAR(64) NOT NULL,
  `slug` VARCHAR(128) NOT NULL,
  `business_name` VARCHAR(255) NOT NULL,
  `category` VARCHAR(100) DEFAULT '',
  `template_id` VARCHAR(64) NOT NULL DEFAULT 'minimalist-slate',
  `status` ENUM('draft', 'published', 'archived') NOT NULL DEFAULT 'draft',
  `logo_url` TEXT DEFAULT NULL,
  `data` LONGTEXT NOT NULL COMMENT 'JSON payload estructurado con cuentas bancarias, paypal y estilos',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `published_at` DATETIME DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_slug` (`slug`),
  KEY `idx_status` (`status`),
  KEY `idx_updated_at` (`updated_at`),
  KEY `idx_template` (`template_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Estructura de tabla para logs de accesos / escaneos QR (opcional para analítica ligera)
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS `card_views_log` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `card_id` VARCHAR(64) NOT NULL,
  `ip_hash` VARCHAR(64) DEFAULT NULL,
  `user_agent` VARCHAR(255) DEFAULT NULL,
  `referrer` VARCHAR(255) DEFAULT NULL,
  `viewed_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY `idx_card_date` (`card_id`, `viewed_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
