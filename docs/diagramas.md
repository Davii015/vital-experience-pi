# Diagramas — Vital Experience

## Arquitetura do sistema

```text
Frontend HTML CSS JavaScript
  └─ localStorage para demonstração atual
  └─ integração HTTP planejada
            │
            ▼
API REST Node.js e Express
  ├─ routes: endpoints e middleware JWT
  ├─ controllers: requisições e respostas HTTP
  ├─ services: regras de negócio e operações Prisma
  ├─ utils: validação de entradas
  └─ errorHandler: erros 400, 401, 404, 409 e 500
            │
            ▼
Prisma Client e migrations
            │
            ▼
Supabase PostgreSQL
```

## Modelo de dados

```text
Professional 1 ─── N User
Professional 1 ─── N Session
Professional 1 ─── N Report
User         1 ─── N Sensor
User         1 ─── N Session
User         1 ─── N Report
Session      1 ─── N SensorData
Sensor       1 ─── N SensorData

Admin: credenciais dos operadores autenticados pela API
```

As chaves estrangeiras obrigatórias usam exclusão em cascata quando o registro dependente perde o sentido, como sessões e leituras de um usuário removido. Relações opcionais usam `SET NULL`, preservando o histórico quando um profissional ou sensor é desvinculado.

## Fluxo de autenticação

```text
POST /api/auth/login
  ├─ procura o administrador por e-mail no PostgreSQL
  ├─ compara a senha com o hash bcrypt
  ├─ rejeita credenciais inválidas com 401
  └─ emite JWT com prazo configurável

Rota protegida
  ├─ recebe Authorization Bearer
  ├─ valida assinatura e expiração
  └─ encaminha a requisição ao controller
```

## Fluxo de uma sessão de monitoramento

```text
1. Selecionar usuário e profissional ativos
2. Criar sessão com data inicial e tipo
3. Vincular ou selecionar sensor ativo do usuário
4. Registrar leituras ligadas à sessão
5. Validar intervalos fisiológicos e vínculo sensor-usuário
6. Finalizar a sessão com endedAt posterior a startedAt
7. Consultar consolidação e relatórios do usuário
```
