# Diagramas — Vital Experience, Fase 02

## Arquitetura implementada

```mermaid
flowchart LR
  N["Navegador: HTML, CSS e JavaScript"] -->|"/app/ estático; /api JSON via fetch"| E["Servidor Express"]
  E --> R["Rotas e middleware de autenticação/CSRF"]
  R --> C["Controllers HTTP"]
  C --> S["Services: validação e regras de negócio"]
  S --> P["Prisma Client"]
  P --> D["PostgreSQL / Supabase configurado pelo ambiente"]
  R --> H["Tratamento centralizado de erros"]
```

O código do navegador fica em `frontend/` e é servido por `backend/server.js` em `/app`. A camada `frontend/js/api.js` converte campos e rótulos da interface para o contrato da API. O Express responde em `/api`, separa rotas, controllers e services, e utiliza o Prisma Client para acesso aos dados. A conexão com PostgreSQL depende das URLs externas; a execução desta fase não incluiu banco de teste.

## Modelo de dados

```mermaid
erDiagram
  ADMIN {
    int id PK
    string email UK
    string passwordHash
    int tokenVersion
  }
  PROFESSIONAL ||--o{ USER : acompanha
  PROFESSIONAL ||--o{ SESSION : conduz
  PROFESSIONAL ||--o{ REPORT : assina
  USER ||--o{ SENSOR : utiliza
  USER ||--o{ SESSION : participa
  USER ||--o{ REPORT : recebe
  SESSION ||--o{ SENSORDATA : registra
  SENSOR ||--o{ SENSORDATA : origina
```

`Professional` e `Sensor` podem estar ausentes em relações opcionais; a configuração de exclusão dessas relações usa `SET NULL` quando aplicável. As migrations Prisma governam o esquema. A coluna `Admin.tokenVersion` foi acrescentada na Fase 02 para invalidar sessões anteriores após a troca de senha.

## Fluxo do navegador

```mermaid
sequenceDiagram
  participant U as Administrador
  participant F as Frontend /app
  participant A as API /api
  participant B as Prisma/PostgreSQL
  U->>F: Informa e-mail e senha
  F->>A: POST /auth/login
  A->>B: Consulta Admin e verifica hash bcrypt
  A-->>F: Cookie HttpOnly + csrfToken + user
  F->>A: GET /auth/me (cookie)
  A->>B: Confere tokenVersion
  A-->>F: Perfil e csrfToken
  F->>A: POST /users (cookie + X-CSRF-Token)
  A->>B: Valida e executa Prisma
  A-->>F: 201 + usuário criado
  F->>A: GET /users
  A-->>F: Lista atualizada
```

O fluxo HTTP do cliente foi exercitado em teste local com delegates Prisma substituídos por memória. As setas para PostgreSQL representam a implementação prevista pelo código, não uma conexão real verificada neste ambiente.

## Fluxo de monitoramento

1. Cadastrar usuário e, opcionalmente, profissional.
2. Abrir sessão para usuário ativo, informando tipo e início.
3. Registrar uma leitura sintética manual de demonstração ou enviar leitura válida à API; o serviço verifica sessão e sensor vinculado, se informado.
4. Finalizar sessão com horário final não anterior ao inicial.
5. Consultar sessões, leituras e agregações em `/reports/user/:userId`.

Não há comunicação com hardware, WebSocket ou alertas automáticos implementados.
