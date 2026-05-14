# Diagramas — Vital Experience

## Diagrama Entidade-Relacionamento (DER)

```
┌────────────┐       ┌──────────────────┐       ┌──────────────┐
│   admins   │       │   professionals  │       │    users     │
│────────────│       │──────────────────│       │──────────────│
│ id (PK)    │       │ id (PK)          │◄──────│ id (PK)      │
│ name       │       │ name             │  1:N  │ name         │
│ email      │       │ specialty        │       │ age          │
│ password.. │       │ email            │       │ gender       │
│ created_at │       │ phone            │       │ condition    │
└────────────┘       │ created_at       │       │ professio..  │
                     └──────────────────┘       │ created_at   │
                                                └──────┬───────┘
                                                       │ 1:N
                                                       ▼
┌────────────┐       ┌──────────────────┐       ┌──────────────┐
│  sensors   │       │   sensor_data    │       │   sessions   │
│────────────│       │──────────────────│       │──────────────│
│ id (PK)    │       │ id (PK)          │       │ id (PK)      │
│ type       │       │ session_id (FK)──┼───────│ user_id (FK) │
│ model      │       │ heart_rate       │  N:1  │ type         │
│ serial_no  │       │ movement         │       │ start_time   │
│ status     │       │ effort_level     │       │ end_time     │
│ user_id(FK)│       │ sp_o2            │       │ status       │
│ created_at │       │ fatigue_state    │       │ notes        │
└────────────┘       │ timestamp        │       │ created_at   │
                     └──────────────────┘       └──────────────┘
```

---

## Fluxo de Autenticação

```
Usuário → POST /api/auth/login
           ├─ Credenciais inválidas → 401 Unauthorized
           └─ Credenciais válidas  → JWT Token (7d)
                                       └─ Armazenado no localStorage
                                          (frontend simulado)
```

---

## Arquitetura do Sistema

```
┌─────────────────────────────────────────────┐
│              FRONTEND (HTML/CSS/JS)          │
│                                             │
│  index.html  ──► pages/dashboard.html       │
│                  pages/usuarios.html        │
│                  pages/profissionais.html   │
│                  pages/sensores.html        │
│                  pages/sessoes.html         │
│                  pages/dados-sensores.html  │
│                  pages/relatorios.html      │
│                  pages/perfil.html          │
│                                             │
│  js/api.js (localStorage — simulação)       │
└───────────────────┬─────────────────────────┘
                    │ HTTP REST (Fase 2+)
┌───────────────────▼─────────────────────────┐
│           BACKEND (Node.js + Express)        │
│                                             │
│  server.js                                  │
│  src/routes/       (7 arquivos)             │
│  src/controllers/  (7 arquivos)             │
│  src/middlewares/auth.js                    │
│  src/config/database.js                     │
└───────────────────┬─────────────────────────┘
                    │ pg (Pool)
┌───────────────────▼─────────────────────────┐
│              PostgreSQL                      │
│                                             │
│  admins · professionals · users             │
│  sensors · sessions · sensor_data           │
└─────────────────────────────────────────────┘
```

---

## Fluxo de uma Sessão de Monitoramento

```
1. Profissional acessa o sistema
2. Cadastra / seleciona o paciente
3. Cria nova sessão (tipo + horário)
4. Sistema registra sensores associados ao paciente
5. Durante a sessão: leituras são inseridas em sensor_data
6. Ao finalizar: status → "Concluída", end_time preenchido
7. Relatório gerado consolidando todas as leituras
```
