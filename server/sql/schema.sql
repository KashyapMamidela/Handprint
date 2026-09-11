-- Handprint schema for MySQL (run once against a fresh `handprint` database,
-- e.g. via phpMyAdmin's SQL tab or `mysql -u root handprint < schema.sql`).

CREATE DATABASE IF NOT EXISTS handprint;
USE handprint;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('volunteer', 'admin') NOT NULL DEFAULT 'volunteer',
  initials VARCHAR(4) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE drives (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  org VARCHAR(255) NOT NULL,
  description TEXT,
  event_date DATE NULL,
  hours_estimate DECIMAL(5, 1) NULL,
  spots INT NULL,
  created_by INT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE SET NULL
);

CREATE TABLE hour_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  drive_id INT NOT NULL,
  hours DECIMAL(5, 1) NOT NULL,
  description TEXT,
  proof_path VARCHAR(500) NULL,
  status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
  verified_by INT NULL,
  verified_at TIMESTAMP NULL,
  rejection_reason TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES users (id) ON DELETE CASCADE,
  FOREIGN KEY (drive_id) REFERENCES drives (id) ON DELETE CASCADE,
  FOREIGN KEY (verified_by) REFERENCES users (id) ON DELETE SET NULL,
  CHECK (hours > 0)
);

CREATE INDEX hour_logs_student_id_idx ON hour_logs (student_id);
CREATE INDEX hour_logs_drive_id_idx ON hour_logs (drive_id);
CREATE INDEX hour_logs_status_idx ON hour_logs (status);
CREATE INDEX drives_created_by_idx ON drives (created_by);
