-- =====================================================
-- Vital Experience — Dados Iniciais (Seed)
-- Execute após o schema.sql
-- =====================================================

\c vital_experience;

-- Admin padrão (senha: admin)
INSERT INTO admins (name, email, password_hash) VALUES
  ('Administrador', 'admin@vitalexperience.com',
   '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi');

-- Profissionais
INSERT INTO professionals (name, specialty, email, phone) VALUES
  ('Dra. Ana Paula Rodrigues', 'Fisioterapia Esportiva',  'ana.paula@vitalexperience.com', '(62) 98888-0001'),
  ('Dr. Marcos Lima',          'Educação Física',          'marcos.lima@vitalexperience.com', '(62) 98888-0002'),
  ('Dra. Juliana Costa',       'Fisioterapia Neurológica', 'juliana.costa@vitalexperience.com', '(62) 98888-0003');

-- Usuários monitorados
INSERT INTO users (name, age, gender, condition, professional_id) VALUES
  ('Lucas Ferreira',    28, 'Masculino', 'Reabilitação pós-cirurgia de joelho', 1),
  ('Beatriz Santos',    35, 'Feminino',  'Condicionamento físico pós-parto',    2),
  ('Carlos Eduardo',    52, 'Masculino', 'AVC — recuperação neuromotora',       3),
  ('Mariana Oliveira',  19, 'Feminino',  'Atleta — prevenção de lesões',        1);

-- Sensores
INSERT INTO sensors (type, model, serial_number, status, user_id) VALUES
  ('Monitor Cardíaco',  'HeartSens Pro V2',     'HS-001-2026', 'Ativo',          1),
  ('Acelerômetro',      'MotionTrack X3',        'MT-002-2026', 'Ativo',          2),
  ('Oxímetro',          'OxyPulse Clip',         'OP-003-2026', 'Ativo',          3),
  ('Giroscópio',        'GyroBalance Elite',     'GB-004-2026', 'Em manutenção',  NULL),
  ('Eletromiógrafo',    'EMG ProSens 8CH',       'EP-005-2026', 'Ativo',          4);

-- Sessões
INSERT INTO sessions (user_id, type, start_time, end_time, status, notes) VALUES
  (1, 'Fisioterapia',         '2026-05-10 09:00:00-03', '2026-05-10 10:00:00-03', 'Concluída',    'Exercícios de cadeia cinética fechada'),
  (2, 'Cardio',               '2026-05-11 08:00:00-03', '2026-05-11 08:45:00-03', 'Concluída',    'Esteira e bicicleta ergométrica'),
  (3, 'Reabilitação',         '2026-05-12 14:00:00-03', '2026-05-12 15:30:00-03', 'Concluída',    'Estimulação motora fina'),
  (4, 'Avaliação Funcional',  '2026-05-13 10:00:00-03', '2026-05-13 11:00:00-03', 'Concluída',    'Teste de sprint e agilidade'),
  (1, 'Fisioterapia',         '2026-05-14 09:30:00-03', NULL,                     'Em andamento', NULL);

-- Dados dos sensores (leituras simuladas para sessões 1–4)
INSERT INTO sensor_data (session_id, heart_rate, movement, effort_level, sp_o2, fatigue_state) VALUES
  (1, 72,  0.12, 'Baixo',      98.2, 'Descansado'),
  (1, 88,  0.34, 'Moderado',   97.8, 'Alerta'),
  (1, 102, 0.67, 'Alto',       97.1, 'Alerta'),
  (1, 118, 0.89, 'Alto',       96.5, 'Cansado'),
  (1, 125, 1.12, 'Muito Alto', 96.0, 'Cansado'),
  (1, 110, 0.78, 'Alto',       96.8, 'Cansado'),
  (1, 95,  0.45, 'Moderado',   97.4, 'Alerta'),
  (1, 80,  0.21, 'Baixo',      98.0, 'Descansado'),
  (2, 68,  0.08, 'Baixo',      98.5, 'Descansado'),
  (2, 95,  0.55, 'Moderado',   97.9, 'Alerta'),
  (2, 120, 1.20, 'Alto',       96.7, 'Cansado'),
  (2, 138, 1.65, 'Muito Alto', 95.8, 'Exausto'),
  (2, 142, 1.80, 'Muito Alto', 95.5, 'Exausto'),
  (2, 130, 1.45, 'Muito Alto', 95.9, 'Cansado'),
  (2, 115, 1.10, 'Alto',       96.3, 'Cansado'),
  (2, 98,  0.60, 'Moderado',   97.2, 'Alerta'),
  (2, 78,  0.25, 'Baixo',      97.8, 'Descansado'),
  (3, 65,  0.05, 'Baixo',      98.8, 'Descansado'),
  (3, 74,  0.18, 'Baixo',      98.5, 'Descansado'),
  (3, 82,  0.30, 'Moderado',   98.1, 'Alerta'),
  (3, 90,  0.42, 'Moderado',   97.7, 'Alerta'),
  (3, 88,  0.38, 'Moderado',   97.9, 'Alerta'),
  (3, 79,  0.22, 'Baixo',      98.2, 'Descansado'),
  (3, 70,  0.10, 'Baixo',      98.6, 'Descansado'),
  (4, 75,  0.15, 'Baixo',      98.3, 'Descansado'),
  (4, 110, 0.90, 'Alto',       97.0, 'Alerta'),
  (4, 135, 1.55, 'Muito Alto', 95.8, 'Cansado'),
  (4, 148, 2.10, 'Muito Alto', 94.9, 'Exausto'),
  (4, 152, 2.35, 'Muito Alto', 94.5, 'Exausto'),
  (4, 140, 1.90, 'Muito Alto', 95.2, 'Exausto'),
  (4, 128, 1.40, 'Muito Alto', 95.7, 'Cansado'),
  (4, 112, 0.95, 'Alto',       96.4, 'Cansado'),
  (4, 95,  0.55, 'Moderado',   97.0, 'Alerta'),
  (4, 80,  0.28, 'Baixo',      97.8, 'Descansado');
