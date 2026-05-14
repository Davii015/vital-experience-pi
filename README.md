# Vital Experience

Sistema web de monitoramento físico e sensorial para reabilitação, fisioterapia e esporte adaptado.

**Projeto Integrador — UniEVANGÉLICA — Engenharia de Software — 5º Período**

---

## Equipe

| Nome | Matrícula | Função |
|---|---|---|
| Davi dos Santos Araújo | 2410285 | Product Owner |
| Hugo Alves da Silva | 2411476 | Scrum Master |
| Jorge Henrique Hajjar Farah Pereira | 2412215 | Desenvolvedor / Modelagem |
| Luísa Maria Duarte Souza Bastos | 2411446 | QA / Documentação |

**Orientadores:** Eder José Almeida da Silva (principal), Wosney Ramos de Souza (secundário)

---

## Stack Tecnológica

- **Frontend:** HTML5 + CSS3 + JavaScript puro
- **Backend:** Node.js + Express (API REST)
- **ORM:** Prisma 5.x (fonte principal do banco)
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
vital-experience/
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
│   │   │   ├── prisma.js   # Instância única do PrismaClient
│   │   │   └── database.js # Conexão pg legacy (referência)
│   │   ├── controllers/    # Lógica de negócio por entidade
│   │   ├── routes/         # Endpoints da API REST
│   │   └── middlewares/    # Autenticação JWT
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

Os dados são simulados via `localStorage` — não é necessário backend ativo para testar o frontend.

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

> **Importante:** o arquivo `database/schema.sql` permanece como documentação de referência. O Prisma é a fonte oficial de estrutura do banco.

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

GitHub: [https://github.com/Davii015/vitalexperience3](https://github.com/Davii015/vitalexperience3)
