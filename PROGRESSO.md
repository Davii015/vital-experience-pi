# PROGRESSO.md — Vital Experience

**Projeto Integrador — UniEVANGÉLICA — Engenharia de Software — 5º Período**
**Última atualização:** 14/05/2026

---

## Equipe

| Nome | Função |
|------|--------|
| Davi dos Santos Araújo | Product Owner (PO) |
| Hugo Alves da Silva | Scrum Master (SM) |
| Jorge Henrique Hajjar Farah Pereira | Desenvolvedor / Modelagem |
| Luísa Maria Duarte Souza Bastos | QA / Documentação |

---

## Status Geral: ✅ FASE 2 COMPLETA + ✅ PRISMA CONFIGURADO

---

## Checklist — Frontend

### Estrutura Base
- [x] `frontend/css/global.css` — stylesheet completo com design system
- [x] `frontend/js/api.js` — camada de dados (localStorage + seed + utilitários)
- [x] `frontend/index.html` — página de login
- [x] `frontend/js/auth.js` — lógica de autenticação

### Páginas CRUD
- [x] `frontend/pages/dashboard.html` + `js/dashboard.js`
- [x] `frontend/pages/usuarios.html` + `js/usuarios.js`
- [x] `frontend/pages/profissionais.html` + `js/profissionais.js`
- [x] `frontend/pages/sensores.html` + `js/sensores.js`
- [x] `frontend/pages/sessoes.html` + `js/sessoes.js`
- [x] `frontend/pages/dados-sensores.html` + `js/dados-sensores.js`
- [x] `frontend/pages/relatorios.html` + `js/relatorios.js`
- [x] `frontend/pages/perfil.html` + `js/perfil.js`

---

## Checklist — Prisma + Supabase

- [x] `backend/prisma/schema.prisma` — 6 models, 4 enums, relations completas
- [x] `backend/prisma/seed.js` — 4 profissionais, 5 usuários, 6 sensores, 5 sessões, 37+ leituras, 5 relatórios
- [x] `backend/src/config/prisma.js` — instância única do PrismaClient
- [x] `backend/.env.example` — atualizado com DATABASE_URL e DIRECT_URL (Supabase)
- [x] `backend/package.json` — scripts prisma:generate, prisma:migrate, prisma:studio, prisma:seed, db:push
- [x] `@prisma/client@5.22.0` instalado como dependency
- [x] `prisma@5.22.0` instalado como devDependency
- [x] `npx prisma generate` — executado com sucesso ✅

**Modelos criados:**
- `Professional` (id, name, email, phone, specialty, registrationNumber, status)
- `User` (id, name, email, birthDate, gender, conditionDescription, professionalId)
- `Sensor` (id, name, type, serialNumber, status, batteryLevel, lastSync, userId)
- `Session` (id, title, sessionType, startedAt, endedAt, status, userId, professionalId)
- `SensorData` (id, heartRate, movementLevel, effortLevel, fatigueRisk, oxygenLevel, bodyTemperature, steps)
- `Report` (id, title, summary, evolutionStatus, recommendation)

**Enums:** `Status`, `SessionStatus`, `FatigueRisk`, `Gender`

**Como testar a conexão com Supabase:**
1. Copie `backend/.env.example` → `backend/.env`
2. Preencha `DATABASE_URL` e `DIRECT_URL` com as URLs do Supabase Dashboard
3. Execute `cd backend && npx prisma db push`
4. Execute `npx prisma db seed`
5. Execute `npx prisma studio` para visualizar os dados

**Próximos passos:**
- Migrar controllers para usar `prisma` ao invés de `pg`
- Configurar `prisma migrate dev` com nome descritivo
- Conectar frontend ao backend real (remover localStorage como fonte de dados)

---

## Checklist — Backend

- [x] `backend/package.json`
- [x] `backend/.env.example`
- [x] `backend/server.js`
- [x] `backend/src/config/database.js`
- [x] `backend/src/middlewares/auth.js`
- [x] `backend/src/routes/auth.js`
- [x] `backend/src/routes/users.js`
- [x] `backend/src/routes/professionals.js`
- [x] `backend/src/routes/sensors.js`
- [x] `backend/src/routes/sessions.js`
- [x] `backend/src/routes/sensorData.js`
- [x] `backend/src/routes/reports.js`
- [x] `backend/src/controllers/authController.js`
- [x] `backend/src/controllers/usersController.js`
- [x] `backend/src/controllers/professionalsController.js`
- [x] `backend/src/controllers/sensorsController.js`
- [x] `backend/src/controllers/sessionsController.js`
- [x] `backend/src/controllers/sensorDataController.js`
- [x] `backend/src/controllers/reportsController.js`

---

## Checklist — Banco de Dados

- [x] `database/schema.sql` — 6 tabelas + índices
- [x] `database/seed.sql` — dados iniciais realistas

---

## Checklist — Documentação

- [x] `README.md`
- [x] `PROGRESSO.md`
- [x] `.gitignore`
- [x] `docs/api.md`
- [x] `docs/diagramas.md`
- [x] `docs/responsabilidades-equipe.md`
- [x] `docs/seguranca-privacidade.md`
- [x] `docs/apresentacao.md`

---

## Funcionalidades Implementadas

### Frontend
- Login com autenticação simulada (localStorage)
- Dashboard com stats, gráfico de FC, alertas e sessões recentes
- CRUD completo: Usuários, Profissionais, Sensores, Sessões
- Visualização de dados de sensores com gráfico sparkline CSS
- Simulação de leituras em tempo real
- Relatórios por paciente (gráficos de FC, esforço, fadiga)
- Perfil com edição de dados e reset de demonstração
- Responsividade completa (desktop, tablet, mobile)
- Toast notifications, modais de confirmação, estados vazios

### Backend (esqueleto)
- API REST com Express.js
- 7 grupos de rotas com autenticação JWT
- Controllers com queries PostgreSQL parametrizadas
- Middleware de autenticação JWT
- Tratamento centralizado de erros

### Banco de Dados
- Schema PostgreSQL com 6 tabelas relacionadas
- Índices de performance
- Seed com dados realistas de demonstração

---

## Dados de Demonstração (seed automático no frontend)

| Entidade | Quantidade |
|----------|-----------|
| Profissionais | 3 |
| Usuários/Pacientes | 4 |
| Sensores | 5 |
| Sessões | 5 (4 concluídas + 1 em andamento) |
| Leituras de sensores | ~38 |
| Alertas | 3 |

---

## Como Testar o Frontend

1. Abra `frontend/index.html` no navegador
2. Use: `admin@vitalexperience.com` / `admin`
3. Navegue por todas as telas
4. Os dados são inicializados automaticamente no primeiro acesso

---

## Como Rodar o Backend (quando conectar ao PostgreSQL)

```bash
cd backend
npm install
cp .env.example .env
# Edite .env com suas credenciais do PostgreSQL
psql -f ../database/schema.sql
psql -d vital_experience -f ../database/seed.sql
npm run dev
```

---

## Histórico de Versões

| Versão | Data | Descrição |
|--------|------|-----------|
| 0.1.0 | 14/05/2026 | Estrutura inicial, CSS global, api.js, login |
| 0.2.0 | 14/05/2026 | Dashboard, Usuários, Profissionais |
| 0.3.0 | 14/05/2026 | Sensores, Sessões, Dados dos Sensores |
| 1.0.0 | 14/05/2026 | Relatórios, Perfil, Backend, Database, Docs — Fase 2 completa |
| 1.1.0 | 14/05/2026 | Prisma 5.x configurado com Supabase PostgreSQL — schema, seed, client |
