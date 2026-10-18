# API REST — Vital Experience, Fase 02

Base local: `http://localhost:3001/api`. Frontend integrado: `http://localhost:3001/app/`. Contrato de referência legível por ferramentas: [openapi.yaml](openapi.yaml).

## Autenticação

`POST /auth/login` verifica o e-mail e a senha do administrador no banco. Para o navegador, a resposta define `ve_session` como cookie `HttpOnly`, `SameSite=Strict` e `Secure` em produção, com duração padrão de 1 hora, e retorna `{ "user": {...}, "csrfToken": "..." }`. Requisições autenticadas com cookie que alteram dados precisam enviar `X-CSRF-Token`. O cliente HTTP do frontend faz isso automaticamente.

Clientes não navegadores podem enviar `"mode":"bearer"` no login. Nesse caso, a resposta inclui `token` e `user`; as requisições seguintes enviam `Authorization: Bearer <token>`, sem CSRF. Tokens nunca devem ser expostos em documentação, logs ou commits.

`GET /auth/me` consulta a sessão e retorna o administrador. `PUT /auth/me` altera nome e/ou e-mail. `PUT /auth/password` exige senha atual e nova senha com 12 ou mais caracteres; ao alterar, incrementa `tokenVersion`, invalidando tokens anteriores. `POST /auth/logout` limpa o cookie local. Um Bearer já emitido continua válido até expirar ou até a senha ser alterada; logout Bearer não mantém lista de revogação.

O sistema possui atualmente apenas o papel `ADMIN`: todos os administradores autenticados acessam os registros globais. Não há autorização por paciente, profissional ou equipe. Não usar dados clínicos reais até implementar e validar controles de acesso, consentimento e política de tratamento apropriados.

## Endpoints

| Método e caminho | Uso |
|---|---|
| `POST /auth/login` | Autenticar administrador (público) |
| `GET /auth/me` | Consultar perfil e token CSRF da sessão por cookie |
| `PUT /auth/me` | Atualizar nome/e-mail do administrador |
| `PUT /auth/password` | Trocar senha e revogar tokens anteriores |
| `POST /auth/logout` | Limpar cookie local |
| `GET/POST /users` e `GET/PUT/DELETE /users/:id` | Usuários monitorados |
| `GET/POST /professionals` e `GET/PUT/DELETE /professionals/:id` | Profissionais |
| `GET/POST /sensors` e `GET/PUT/DELETE /sensors/:id` | Sensores e vínculo com usuário |
| `GET/POST /sessions` e `GET/PUT/DELETE /sessions/:id` | Sessões e estados |
| `GET/POST /sensor-data`, `GET /sensor-data/session/:sessionId`, `DELETE /sensor-data/:id` | Leituras de sensores |
| `GET /reports/user/:userId`, `GET /reports/summary` | Consolidação por usuário e totais |

Todas as rotas acima, salvo login, exigem cookie ou Bearer válido. `GET /health` e `GET /` são públicos e ficam fora do prefixo `/api`.

## Campos e regras principais

- Usuário: `name`, `conditionDescription` obrigatórios; `birthDate`, `gender`, `professionalId`, `email`, `phone`, `status` opcionais conforme serviço. O frontend informa data de nascimento, não idade fixa.
- Profissional: `name` e demais dados cadastrais; vínculo e situação são verificados nas operações relacionadas.
- Sensor: `name`, `type`, `serialNumber`, `status`, `batteryLevel`, `lastSync`, `userId`.
- Sessão: `userId`, `sessionType`, `startedAt`, `endedAt`, `status`, `professionalId`, `title`, `notes`. Estados: `EM_ANDAMENTO`, `FINALIZADA`, `CANCELADA`; finalizada exige `endedAt` não anterior ao início.
- Leitura: `sessionId`, `sensorId`, `heartRate`, `movementLevel`, `effortLevel`, `fatigueRisk`, `oxygenLevel`, `bodyTemperature`, `steps`, `recordedAt`. O backend valida faixas e vínculo sensor/usuário, e rejeita leitura em sessão cancelada.
- `GET /reports/summary` retorna totais de usuários, profissionais, sensores ativos, sessões e leituras. `GET /reports/user/:userId` retorna usuário, sessões com leituras, relatórios existentes e agregações; não cria um documento clínico novo.

Os services aceitam alguns nomes legados em `snake_case`, mas o cliente atual envia `camelCase`. O frontend traduz os códigos de enum e formatos de campo para rótulos exibidos na interface.

## Erros

As falhas são JSON com `error`: `400` entrada inválida, `401` autenticação/credenciais inválidas, `403` CSRF inválido, `404` rota ou registro ausente, `409` duplicidade/conflito de regra e `500` falha interna. Erros de banco inesperados não retornam detalhes sensíveis ao cliente.

## Evidência e limite

O teste HTTP local cobre login, sessão por cookie, CSRF, CRUD de usuário pelo cliente `api.js`, perfil, senha, revogação de token, modo Bearer e rejeição de leitura fora da faixa. Nesse teste, as operações Prisma usam substitutos em memória; a comunicação HTTP é real, mas a persistência PostgreSQL/Supabase ainda não foi comprovada neste ambiente.
