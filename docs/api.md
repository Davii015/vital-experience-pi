# API Reference — Vital Experience

Base URL: `http://localhost:3001/api`

Todas as rotas, exceto `POST /auth/login`, exigem o cabeçalho:

```http
Authorization: Bearer <token>
```

Os exemplos usam `camelCase`, mas os campos legados em `snake_case` também são aceitos quando indicado pelos services.

## Autenticação

### POST /auth/login

Autentica um administrador persistido no banco. A senha é comparada com o hash bcrypt e, quando válida, a API emite um JWT.

```json
{ "email": "admin@vitalexperience.com", "password": "admin" }
```

## Recursos e endpoints

| Recurso | Endpoints | Responsabilidade |
|---|---|---|
| Usuários | `GET/POST /users`, `GET/PUT/DELETE /users/:id` | CRUD de usuários monitorados e vínculo com profissional |
| Profissionais | `GET/POST /professionals`, `GET/PUT/DELETE /professionals/:id` | CRUD e bloqueio de remoção quando há usuários ativos |
| Sensores | `GET/POST /sensors`, `GET/PUT/DELETE /sensors/:id` | CRUD, estado, bateria e vínculo com usuário |
| Sessões | `GET/POST /sessions`, `GET/PUT/DELETE /sessions/:id` | Registro e ciclo de vida das sessões |
| Leituras | `GET/POST /sensor-data`, `GET /sensor-data/session/:sessionId`, `DELETE /sensor-data/:id` | Persistência e consulta de dados fisiológicos |
| Relatórios | `GET /reports/user/:userId`, `GET /reports/summary` | Consolidação de sessões, leituras e indicadores |

## Campos principais

### Usuário monitorado

`name`, `conditionDescription`, `email`, `phone`, `birthDate`, `gender`, `status`, `professionalId`.

### Profissional

`name`, `specialty`, `email`, `phone`, `registrationNumber`, `status`.

### Sensor

`name`, `type`, `serialNumber`, `status`, `batteryLevel`, `lastSync`, `userId`.

### Sessão

`userId`, `professionalId`, `title`, `sessionType`, `notes`, `startedAt`, `endedAt`, `status`.

### Leitura de sensor

`sessionId`, `sensorId`, `heartRate`, `movementLevel`, `effortLevel`, `fatigueRisk`, `bodyTemperature`, `oxygenLevel`, `steps`, `recordedAt`.

## Regras validadas pela API

- e-mails de administradores, profissionais e usuários e números de série são únicos;
- profissionais e usuários vinculados a novos registros devem existir e estar ativos;
- uma sessão finalizada exige `endedAt`, que não pode ser anterior a `startedAt`;
- uma leitura não pode ser registrada em sessão cancelada;
- quando a leitura informa um sensor, ele deve estar ativo e vinculado ao mesmo usuário da sessão;
- frequência cardíaca, saturação, temperatura, movimento, bateria e passos são validados por intervalo;
- estados e classificações usam os enums definidos no Prisma.

## Respostas de erro

| Código | Uso |
|---|---|
| 400 | Campo ausente, formato inválido ou referência inexistente |
| 401 | Token ausente, inválido ou credenciais incorretas |
| 404 | Rota ou registro não encontrado |
| 409 | Duplicidade, vínculo impeditivo ou conflito de regra de negócio |
| 500 | Erro inesperado ou configuração obrigatória ausente |
