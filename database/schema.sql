CREATE TABLE IF NOT EXISTS districts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS ds_offices (
  id INT AUTO_INCREMENT PRIMARY KEY,
  district_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  CONSTRAINT fk_ds_district FOREIGN KEY (district_id) REFERENCES districts(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS clubs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  club_name VARCHAR(200) NOT NULL,
  address VARCHAR(255) NOT NULL,
  district_id INT NOT NULL,
  ds_id INT NOT NULL,
  gn_division VARCHAR(150) NOT NULL,
  CONSTRAINT fk_club_district FOREIGN KEY (district_id) REFERENCES districts(id) ON DELETE RESTRICT,
  CONSTRAINT fk_club_ds FOREIGN KEY (ds_id) REFERENCES ds_offices(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin','user') NOT NULL DEFAULT 'user',
  status ENUM('active','inactive') NOT NULL DEFAULT 'active',
  avatar VARCHAR(255),
  language_preference VARCHAR(10) DEFAULT 'si',
  theme_mode VARCHAR(10) DEFAULT 'light',
  theme_color VARCHAR(30) DEFAULT 'theme-12',
  created_at DATETIME NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS club_grades (
  id INT AUTO_INCREMENT PRIMARY KEY,
  club_id INT NOT NULL,
  year INT NOT NULL,
  score DECIMAL(5,2) NOT NULL,
  grade CHAR(1) NOT NULL,
  created_by INT NOT NULL,
  created_at DATETIME NOT NULL,
  CONSTRAINT fk_grade_club FOREIGN KEY (club_id) REFERENCES clubs(id) ON DELETE CASCADE,
  CONSTRAINT fk_grade_user FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT,
  INDEX idx_grade_year (year),
  INDEX idx_grade_grade (grade),
  INDEX idx_grade_user (created_by)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS audit_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  action VARCHAR(50) NOT NULL,
  entity VARCHAR(50) NOT NULL,
  entity_id INT NOT NULL,
  timestamp DATETIME NOT NULL,
  CONSTRAINT fk_audit_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
