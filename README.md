# Vital Experience

Sistema web de monitoramento físico e sensorial para reabilitação, fisioterapia e esporte adaptado.

**Projeto Integrador — UniEVANGÉLICA — Engenharia de Software — 6º Período**

---

## Equipe

| Nome | Função |
|---|---|
| Davi dos Santos Araújo | Product Owner |
| Hugo Alves da Silva | Scrum Master |
| Jorge Henrique Hajjar Farah Pereira | Desenvolvedor / Modelagem |
| Luísa Maria Duarte Souza Bastos | QA / Documentação |

**Orientadores:** Eder José Almeida da Silva (principal), Wosney Ramos de Souza (secundário)

---

## Stack Tecnológica

- **Frontend:** HTML5 + CSS3 + JavaScript puro
- **Backend:** Node.js + Express (API REST em rotas, controllers e services)
- **Autenticação:** JWT em cookie HttpOnly para o navegador (com CSRF), Bearer para clientes de API e bcryptjs
- **ORM:** Prisma 5.x (fonte oficial do modelo e do acesso aos dados)
- **Banco de Dados:** Supabase PostgreSQL

## Identidade Visual

| Token | Cor |
|---|---|
| Preto | `#0D0D0D` |
| Cinza claro | `#F0F0EC` |
| Amarelo | `#F5E642` |
| Verde | `#1DB954` |
| Rosa | `#FF2D7A` |

Fontes: **Syne** (títulos) · **DM Sans** (corpo) · **DM Mono** (dados)

---

## Estrutura do Projeto

```
vital-experience-pi/
├── frontend/
│   ├── pages/          # Telas do sistema (dashboard, usuarios, etc.)
│   ├── css/            # Estilos globais e específicos
│   ├── js/             # Lógica de cada tela + cliente HTTP em api.js
│   ├── assets/         # Imagens e ícones
│   └── index.html      # Tela de login
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma   # Fonte principal do banco (modelos e enums)
│   │   ├── migrations/     # Evolução versionada do esquema
│   │   └── seed.js         # Dados fictícios (limpa banco de desenvolvimento se autorizado)
│   ├── src/
│   │   ├── config/
│   │   │   └── prisma.js   # Instância única do PrismaClient
│   │   ├── controllers/    # Adaptação de requisições e respostas HTTP
│   │   ├── services/       # Regras de negócio e persistência com Prisma
│   │   ├── routes/         # Endpoints da API REST
│   │   ├── middlewares/    # Autenticação e tratamento central de erros
│   │   ├── errors/         # Erros de domínio convertidos em respostas HTTP
│   │   └── utils/          # Validação e funções compartilhadas
│   ├── tests/              # Testes automatizados do backend
│   ├── server.js
│   ├── package.json
│   └── .env.example
├── database/
│   ├── schema.sql      # Referência SQL, não substitui as migrations
│   └── seed.sql        # Referência histórica; não executar em banco com dados reais
└── docs/
    ├── api.md
    ├── openapi.yaml
    ├── diagramas.md
    ├── responsabilidades-equipe.md
    ├── seguranca-privacidade.md
    └── apresentacao.md
```

---

## Como executar a aplicação integrada

1. Instale Node.js e tenha um PostgreSQL de desenvolvimento disponível (local ou Supabase de teste).
2. Em `backend/`, execute `npm install` e copie `.env.example` para `.env`.
3. Configure `DATABASE_URL`, `DIRECT_URL`, `JWT_SECRET` (mínimo de 32 caracteres) e uma senha de administrador de teste com no mínimo 12 caracteres.
4. Execute `npm run prisma:generate` e `npx prisma migrate deploy` em um banco de teste. As migrations são a fonte oficial da estrutura.
5. Para criar os dados de demonstração, somente em um banco descartável, defina `SEED_RESET_CONFIRM=APAGAR_DADOS_DE_DEMONSTRACAO` e execute `npm run prisma:seed`. **Esse comando exclui todos os registros das tabelas do projeto antes de recriá-los.** Não o execute em banco com dados a preservar. Como alternativa, crie um administrador no banco por um procedimento controlado.
6. Execute `npm run dev` e abra `http://localhost:3001/app/`. Não abra `frontend/index.html` via `file://`: a aplicação depende da API e do cookie de sessão na mesma origem.

A API está em `http://localhost:3001/api`; o endpoint de saúde é `/health`. Nenhuma credencial real deve ser publicada no repositório. Caso frontend e backend sejam servidos de origens diferentes, configure `FRONTEND_ORIGIN` com a origem exata do frontend e `window.VE_API_BASE_URL` com a URL pública da API. Cookie entre origens distintas exige configuração de HTTPS e política de cookies apropriada; o caminho recomendado para demonstração é a mesma origem em `/app/`.

Validações disponíveis:

```bash
npm run check
npm test
npx prisma validate
```

---

## Configuração do Prisma com Supabase

### 1. Configure o `.env`

No arquivo `backend/.env`, preencha com as URLs do seu projeto Supabase:

```env
DATABASE_URL="postgresql://postgres.PROJECT_REF:SENHA@aws-1-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.PROJECT_REF:SENHA@aws-1-sa-east-1.pooler.supabase.com:5432/postgres"
```

Obtenha as URLs em: **Supabase Dashboard → Settings → Database → Connection string → URI**

### 2. Gerar o Prisma Client

```bash
cd backend
npx prisma generate
# ou
npm run prisma:generate
```

### 3. Aplicar as migrations no banco de teste

```bash
npx prisma migrate deploy
```

### 4. Popular um banco descartável com dados fictícios (opcional)

```bash
# Configure antes ADMIN_PASSWORD (12+ caracteres) e
# SEED_RESET_CONFIRM=APAGAR_DADOS_DE_DEMONSTRACAO no .env.
npm run prisma:seed
```

### 5. Abrir o Prisma Studio (visualizador visual do banco)

```bash
npx prisma studio
# ou
npm run prisma:studio
```

> **Importante:** `database/schema.sql` é referência legível. Prisma e migrations são a fonte oficial. `prisma migrate deploy` altera o esquema: use somente após revisar o destino e manter backup, se houver dados relevantes.

## Implementação integrada da Fase 02 do 6º período

- autenticação de administradores persistidos com hash bcrypt; JWT em cookie HttpOnly com CSRF para o navegador ou Bearer para cliente de API;
- consulta e edição de perfil, alteração de senha e revogação dos tokens anteriores por `tokenVersion`;
- rotas protegidas para usuários, profissionais, sensores, sessões, leituras e relatórios;
- controllers enxutos e services responsáveis pelas regras de negócio;
- validação de campos obrigatórios, intervalos fisiológicos, datas e enums;
- verificação de vínculos entre usuário, profissional, sessão e sensor;
- bloqueio de leitura em sessão cancelada e de sensor incompatível com o usuário da sessão;
- persistência por Prisma Client em PostgreSQL/Supabase;
- respostas 400, 401, 404 e 409 para falhas conhecidas e tratamento centralizado de erros;
- frontend consumindo `/api` para login, cadastros, sessões, leituras e relatórios, sem `localStorage` como fonte de dados;
- testes locais de disponibilidade e contrato HTTP/cliente com persistência simulada em memória, além de verificação de sintaxe e validação do esquema Prisma.

**Limite da evidência:** ainda não foi fornecido um banco Supabase de teste. As migrations não foram aplicadas neste ambiente e a persistência real em PostgreSQL não foi comprovada. Alertas automáticos, aquisição por sensor físico, autorização por profissional/paciente e testes de interface em navegador real permanecem pendentes.

---

## Telas do Sistema

1. **Login** — autenticação real da API
2. **Dashboard** — indicadores gerais, alertas, sessões recentes
3. **Usuários Monitorados** — CRUD completo
4. **Profissionais** — CRUD completo
5. **Sensores** — CRUD + associação a usuários
6. **Sessões de Monitoramento** — registro de sessões
7. **Dados dos Sensores** — histórico por sessão e registro persistido de leitura sintética de demonstração
8. **Relatórios** — evolução por usuário
9. **Perfil & Segurança** — dados do administrador e troca de senha

---

## Repositório

GitHub: [https://github.com/Davii015/vital-experience-pi](https://github.com/Davii015/vital-experience-pi)

