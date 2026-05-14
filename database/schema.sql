-- =====================================================
-- Vital Experience — Esquema do Banco de Dados
-- PostgreSQL 14+
-- =====================================================

CREATE DATABASE vital_experience;
\c vital_experience;

-- Tabela de administradores do sistema
CREATE TABLE admins (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(120) NOT NULL,
  email         VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de profissionais (fisioterapeutas, educadores físicos, etc.)
CREATE TABLE professionals (
  id         SERIAL PRIMARY KEY,
  name       VARCHAR(120) NOT NULL,
  specialty  VARCHAR(100),
  email      VARCHAR(255) UNIQUE NOT NULL,
  phone      VARCHAR(30),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de pacientes/usuários monitorados
CREATE TABLE users (
  id              SERIAL PRIMARY KEY,
  name            VARCHAR(120) NOT NULL,
  age             SMALLINT NOT NULL CHECK (age > 0 AND age < 130),
  gender          VARCHAR(30),
  condition       TEXT,
  professional_id INTEGER REFERENCES professionals(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de sensores vestíveis
CREATE TABLE sensors (
  id            SERIAL PRIMARY KEY,
  type          VARCHAR(80)  NOT NULL,
  model         VARCHAR(120) NOT NULL,
  serial_number VARCHAR(60),
  status        VARCHAR(30)  DEFAULT 'Ativo',
  user_id       INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de sessões de monitoramento
CREATE TABLE sessions (
  id         SERIAL PRIMARY KEY,
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type       VARCHAR(80) NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time   TIMESTAMPTZ,
  status     VARCHAR(30) DEFAULT 'Agendada',
  notes      TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de leituras dos sensores
CREATE TABLE sensor_data (
  id           SERIAL PRIMARY KEY,
  session_id   INTEGER NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  heart_rate   SMALLINT,
  movement     NUMERIC(6,3),
  effort_level VARCHAR(20),
  sp_o2        NUMERIC(4,1),
  fatigue_state VARCHAR(20),
  timestamp    TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_sensors_user       ON sensors(user_id);
CREATE INDEX idx_sessions_user      ON sessions(user_id);
CREATE INDEX idx_sensor_data_session ON sensor_data(session_id);
CREATE INDEX idx_sensor_data_ts     ON sensor_data(timestamp);
