# API Reference — Vital Experience

Base URL: `http://localhost:3001/api`

Todas as rotas (exceto `/auth/login`) exigem o header:
```
Authorization: Bearer <token>
```

---

## Auth

### POST /auth/login
Autentica o administrador.

**Body:**
```json
{ "email": "admin@vitalexperience.com", "password": "admin" }
```

**Resposta 200:**
```json
{ "token": "eyJ...", "user": { "id": 1, "name": "Admin", "email": "..." } }
```

---

## Users

| Método | Rota         | Descrição                  |
|--------|--------------|----------------------------|
| GET    | /users       | Lista todos os usuários    |
| GET    | /users/:id   | Busca usuário por ID       |
| POST   | /users       | Cria novo usuário          |
| PUT    | /users/:id   | Atualiza usuário           |
| DELETE | /users/:id   | Remove usuário             |

**Campos (POST/PUT):** `name*`, `age*`, `gender`, `condition*`, `professional_id`

---

## Professionals

| Método | Rota                | Descrição                     |
|--------|---------------------|-------------------------------|
| GET    | /professionals      | Lista todos os profissionais  |
| GET    | /professionals/:id  | Busca por ID                  |
| POST   | /professionals      | Cria profissional             |
| PUT    | /professionals/:id  | Atualiza profissional         |
| DELETE | /professionals/:id  | Remove profissional           |

**Campos (POST/PUT):** `name*`, `specialty*`, `email*`, `phone`

---

## Sensors

| Método | Rota         | Descrição              |
|--------|--------------|------------------------|
| GET    | /sensors     | Lista todos os sensores|
| GET    | /sensors/:id | Busca por ID           |
| POST   | /sensors     | Cadastra sensor        |
| PUT    | /sensors/:id | Atualiza sensor        |
| DELETE | /sensors/:id | Remove sensor          |

**Campos (POST/PUT):** `type*`, `model*`, `serial_number`, `status`, `user_id`

---

## Sessions

| Método | Rota           | Descrição              |
|--------|----------------|------------------------|
| GET    | /sessions      | Lista todas as sessões |
| GET    | /sessions/:id  | Busca por ID           |
| POST   | /sessions      | Cria sessão            |
| PUT    | /sessions/:id  | Atualiza sessão        |
| DELETE | /sessions/:id  | Remove sessão          |

**Campos (POST/PUT):** `user_id*`, `type*`, `start_time*`, `end_time`, `status`, `notes`

---

## Sensor Data

| Método | Rota                           | Descrição                      |
|--------|--------------------------------|--------------------------------|
| GET    | /sensor-data                   | Todas as leituras              |
| GET    | /sensor-data/session/:sessionId| Leituras de uma sessão         |
| POST   | /sensor-data                   | Registra nova leitura          |
| DELETE | /sensor-data/:id               | Remove leitura                 |

**Campos (POST):** `session_id*`, `heart_rate`, `movement`, `effort_level`, `sp_o2`, `fatigue_state`

---

## Reports

| Método | Rota                    | Descrição                          |
|--------|-------------------------|------------------------------------|
| GET    | /reports/user/:userId   | Relatório completo de um paciente  |
| GET    | /reports/summary        | Resumo geral do sistema            |

---

*Campos marcados com `*` são obrigatórios.*
