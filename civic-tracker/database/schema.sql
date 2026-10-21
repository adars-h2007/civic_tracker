-- Optional MySQL 8 schema. The backend also creates/updates these tables
-- automatically (spring.jpa.hibernate.ddl-auto=update).
-- Safe to re-run: the account role migration supports databases created before
-- RESIDENT and SOLVER account types were added.

CREATE DATABASE IF NOT EXISTS civic_tracker
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE civic_tracker;

CREATE TABLE IF NOT EXISTS accounts (
  id             BIGINT AUTO_INCREMENT PRIMARY KEY,
  name           VARCHAR(80)  NOT NULL,
  email          VARCHAR(254) NOT NULL,
  password_hash  VARCHAR(60)  NOT NULL,
  role           VARCHAR(20)  NOT NULL DEFAULT 'RESIDENT',
  created_at     DATETIME(6)  NOT NULL,
  CONSTRAINT uk_account_email UNIQUE (email),
  CONSTRAINT chk_account_role CHECK (role IN ('RESIDENT', 'SOLVER'))
);

-- CREATE TABLE IF NOT EXISTS does not add columns to an existing table.
-- Add the role column if this database was created before account roles.
SET @role_column_exists = (
  SELECT COUNT(*)
  FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'accounts'
    AND column_name = 'role'
);
SET @role_migration = IF(
  @role_column_exists = 0,
  'ALTER TABLE accounts ADD COLUMN role VARCHAR(20) NOT NULL DEFAULT ''RESIDENT'' AFTER password_hash',
  'SELECT 1'
);
PREPARE role_migration_stmt FROM @role_migration;
EXECUTE role_migration_stmt;
DEALLOCATE PREPARE role_migration_stmt;

CREATE TABLE IF NOT EXISTS issues (
  id             BIGINT AUTO_INCREMENT PRIMARY KEY,
  title          VARCHAR(120) NOT NULL,
  description    VARCHAR(1000),
  category       VARCHAR(20)  NOT NULL,   -- ROADS|WATER|LIGHTING|GARBAGE|DRAINAGE|PARKS|OTHER
  location       VARCHAR(160) NOT NULL,
  ward           VARCHAR(80)  NOT NULL,
  reporter_name  VARCHAR(80)  NOT NULL,
  status         VARCHAR(20)  NOT NULL DEFAULT 'REPORTED', -- REPORTED|ACKNOWLEDGED|IN_PROGRESS|RESOLVED|REJECTED
  priority       VARCHAR(10)  NOT NULL DEFAULT 'MEDIUM',   -- LOW|MEDIUM|HIGH|URGENT
  upvotes        INT          NOT NULL DEFAULT 0,
  created_at     DATETIME(6)  NOT NULL,
  updated_at     DATETIME(6)  NOT NULL,
  INDEX idx_issue_status (status),
  INDEX idx_issue_category (category),
  CONSTRAINT chk_issue_status CHECK (status IN ('REPORTED', 'ACKNOWLEDGED', 'IN_PROGRESS', 'RESOLVED', 'REJECTED')),
  CONSTRAINT chk_issue_priority CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'URGENT')),
  CONSTRAINT chk_issue_category CHECK (category IN ('ROADS', 'WATER', 'LIGHTING', 'GARBAGE', 'DRAINAGE', 'PARKS', 'OTHER'))
);

CREATE TABLE IF NOT EXISTS issue_comments (
  id          BIGINT AUTO_INCREMENT PRIMARY KEY,
  issue_id    BIGINT       NOT NULL,
  author      VARCHAR(80)  NOT NULL,
  text        VARCHAR(500) NOT NULL,
  kind        VARCHAR(10)  NOT NULL DEFAULT 'COMMENT',  -- COMMENT|STATUS
  created_at  DATETIME(6)  NOT NULL,
  CONSTRAINT fk_comment_issue FOREIGN KEY (issue_id) REFERENCES issues(id) ON DELETE CASCADE,
  INDEX idx_comment_issue (issue_id),
  CONSTRAINT chk_comment_kind CHECK (kind IN ('COMMENT', 'STATUS'))
);
