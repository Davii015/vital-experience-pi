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
- **Autenticação:** JWT + bcryptjs
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
│   ├── js/             # Lógica de cada tela + camada API localStorage
│   ├── assets/         # Imagens e ícones
│   └── index.html      # Tela de login
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma   # Fonte principal do banco (modelos e enums)
│   │   └── seed.js         # Dados fictícios para apresentação
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
│   ├── schema.sql      # Estrutura das tabelas
│   └── seed.sql        # Dados iniciais para teste
└── docs/
    ├── api.md
    ├── diagramas.md
    ├── responsabilidades-equipe.md
    ├── seguranca-privacidade.md
    └── apresentacao.md
```

---

## Como Rodar o Frontend

Não requer instalação. Abra diretamente no navegador:

```
frontend/index.html
```

**Login de acesso:** qualquer e-mail + senha com 6 ou mais caracteres.

O frontend ainda mantém dados de demonstração no `localStorage`. A integração HTTP com o backend está prevista para a próxima etapa e não interfere na execução isolada da API.

---

## Como Rodar o Backend

```bash
cd backend
npm install
cp .env.example .env
# Edite .env com as credenciais do Supabase e JWT_SECRET
npm run dev
```

API disponível em: `http://localhost:3001`

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

### 3. Aplicar o schema no banco (primeira vez)

```bash
npx prisma migrate dev --name init
# ou, sem migrations (apenas sincroniza):
npm run db:push
```

### 4. Popular o banco com dados fictícios

```bash
npx prisma db seed
# ou
npm run prisma:seed
```

### 5. Abrir o Prisma Studio (visualizador visual do banco)

```bash
npx prisma studio
# ou
npm run prisma:studio
```

> **Importante:** o arquivo `database/schema.sql` permanece como referência legível. O Prisma e suas migrations são a fonte oficial da estrutura do banco.

## Backend implementado na Fase 01 do 6º período

- autenticação de administradores com senha em hash e emissão de JWT;
- rotas protegidas para usuários, profissionais, sensores, sessões, leituras e relatórios;
- controllers enxutos e services responsáveis pelas regras de negócio;
- validação de campos obrigatórios, intervalos fisiológicos, datas e enums;
- verificação de vínculos entre usuário, profissional, sessão e sensor;
- bloqueio de leitura em sessão cancelada e de sensor incompatível com o usuário da sessão;
- persistência por Prisma Client em PostgreSQL/Supabase;
- respostas 400, 401, 404 e 409 para falhas conhecidas e tratamento centralizado de erros;
- teste automatizado do endpoint de saúde e verificação de sintaxe do código.

---

## Telas do Sistema

1. **Login** — autenticação simulada
2. **Dashboard** — indicadores gerais, alertas, sessões recentes
3. **Usuários Monitorados** — CRUD completo
4. **Profissionais** — CRUD completo
5. **Sensores** — CRUD + associação a usuários
6. **Sessões de Monitoramento** — registro de sessões
7. **Dados dos Sensores** — histórico por sessão (freq. cardíaca, movimentação, esforço, fadiga)
8. **Relatórios** — evolução por usuário
9. **Perfil & Segurança** — dados do operador e política de privacidade

---

## Repositório

GitHub: [https://github.com/Davii015/vital-experience-pi](https://github.com/Davii015/vital-experience-pi)

