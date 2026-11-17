# Vital Experience

Aplicação de demonstração do Projeto Integrador — Engenharia de Software, 6º período, UniEVANGÉLICA. Permite acompanhar pacientes, profissionais, sensores, sessões, leituras e relatórios com três tipos de acesso.

Frontend em HTML/CSS/JavaScript, API Node.js + Express e PostgreSQL/Supabase acessado pelo Prisma. A autenticação é própria da API, com JWT em cookie HttpOnly e proteção CSRF; não usa Supabase Auth.

## Executar localmente

Ambiente verificado: Node.js 24, npm 11 e Prisma 5.22. É necessário um banco PostgreSQL disponível e acesso à rede quando estiver hospedado no Supabase.

No PowerShell, dentro da pasta do projeto:

```powershell
cd backend
npm.cmd ci
if (!(Test-Path .env)) { Copy-Item .env.example .env }
notepad .env
```

Configure `DATABASE_URL`, `DIRECT_URL`, `JWT_SECRET` (chave aleatória de pelo menos 32 caracteres), `ADMIN_EMAIL` e `ADMIN_PASSWORD` (senha própria de pelo menos 12 caracteres). Para gerar a chave JWT:

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

No Supabase, obtenha as conexões em **Connect**: Transaction pooler (porta 6543, com `?pgbouncer=true`) para `DATABASE_URL` e Session pooler (porta 5432) para `DIRECT_URL`. Use as URLs e a senha do seu próprio projeto. Mantenha `FRONTEND_ORIGIN=` vazio para o frontend servido pela API.

```powershell
npm.cmd run prisma:generate
npx.cmd prisma migrate deploy
npm.cmd run account:admin
npm.cmd run dev
```

Abra **http://localhost:3001/app/** e selecione **Administrador**. O login utiliza as credenciais definidas no `.env`. O comando `account:admin` preserva contas existentes e não redefine senhas. As migrations alteram a estrutura do banco: confira o destino e mantenha backup quando houver dados relevantes.

Para iniciar novamente, execute `npm.cmd run dev` em `backend/`. Use `Ctrl+C` para parar. O frontend depende da API; abrir o HTML diretamente não estabelece a sessão.

## Contas para demonstração

Cadastre primeiro o profissional e o paciente pelo acesso de administrador, vinculando o paciente ao profissional. Consulte os IDs apresentados no sistema e execute em `backend/`:

```powershell
npm.cmd run account:professional -- ID_DO_PROFISSIONAL
npm.cmd run account:patient -- ID_DO_PACIENTE
```

Substitua os identificadores pelos números reais. Para paciente sem e-mail cadastrado, informe um e-mail de login como segundo argumento: `npm.cmd run account:patient -- 8 paciente@example.com`.

Cada comando cria uma conta vinculada a um cadastro ativo e gera uma senha aleatória. As credenciais ficam somente nos arquivos locais `.env.professional-<id>` e `.env.patient-<id>`, ignorados pelo Git. Contas já existentes não são sobrescritas. Não é enviado e-mail ou mensagem ao titular. O e-mail de login do paciente fica em `patient_accounts`, separado do contato cadastral.

Na tela de login, escolha **Administrador**, **Profissional** ou **Paciente**. A mesma página atende aos três perfis. As senhas não estão neste repositório; utilize os arquivos de credenciais do seu ambiente.

## Permissões

| Ação | Administrador | Profissional | Paciente |
|---|---|---|---|
| Consultar pacientes e sensores | Todos | Pacientes vinculados e seus sensores | Somente os próprios dados e sensores |
| Consultar profissionais | Todos | Próprio cadastro | Responsável atual |
| Criar/editar cadastros gerais | Sim | Não | Não |
| Consultar sessões e leituras | Todas | Sessões próprias de pacientes vinculados | Próprias sessões e leituras |
| Criar/editar sessões e registrar leituras | Sim | Dentro do próprio escopo | Não |
| Consultar relatórios e totais | Globais | Escopo autorizado | Próprios dados |
| Excluir registros | Sim | Não | Não |
| Trocar a própria senha | Sim | Sim | Sim |

As permissões são verificadas pela API, inclusive em acessos diretos por ID. Cadastros inativos perdem acesso; trocar a senha invalida sessões anteriores. Profissionais e pacientes solicitam correções cadastrais ao administrador.

## Roteiro de apresentação

1. Entre como administrador para mostrar os cadastros gerais e os vínculos.
2. Saia e entre como profissional para mostrar seus pacientes, criar uma sessão e registrar uma leitura de demonstração.
3. Saia e entre como paciente para consultar apenas seu acompanhamento e seu perfil.
4. Abra os relatórios e confira os registros persistidos no banco.

Use dados fictícios. As leituras de demonstração são sintéticas; não representam integração validada com sensores físicos. Alertas automáticos, recuperação de senha, limitação de tentativas de login e auditoria independente permanecem pendentes.

## Verificação

```powershell
npm.cmd run check
npm.cmd test
npx.cmd prisma validate
```

Os testes HTTP automatizados usam persistência simulada em memória e cobrem autenticação, CSRF, isolamento por perfil, bloqueio de alterações e revogação de sessões. Login e consultas dos perfis de demonstração também devem ser conferidos no banco escolhido.

## Estrutura publicada

- `frontend/`: telas, estilos e cliente HTTP.
- `backend/`: API, schema, migrations, scripts de criação de contas e testes.
- `docs/api.md`, `docs/openapi.yaml`, `docs/seguranca-privacidade.md`: referência técnica.

Apresentações, slides, documentos acadêmicos, SQL legado, credenciais, logs e dependências instaladas não fazem parte desta versão publicada. As migrations do Prisma são a fonte oficial da estrutura do banco.

O seed (`npm run prisma:seed`) é opcional e **apaga registros das tabelas do projeto** antes de recriar dados fictícios; use apenas em banco descartável, após definir `SEED_RESET_CONFIRM=APAGAR_DADOS_DE_DEMONSTRACAO`. Ele não é necessário para executar a aplicação nem para criar as contas acima.
