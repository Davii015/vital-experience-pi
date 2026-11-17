# Segurança e privacidade — estado da Fase 02

Este documento descreve controles observáveis no código e limitações. Não constitui avaliação jurídica de conformidade nem autoriza o uso de dados clínicos reais.

## Dados manipulados

O modelo inclui identificação de usuários monitorados, condição/objetivo, vínculo profissional, sessões e leituras fisiológicas. Essas informações exigem cuidado especial. Os dados de demonstração são sintéticos; não devem ser confundidos com medições de sensores físicos ou com diagnóstico clínico.

## Controles implementados

- Senhas de administradores, profissionais e pacientes são comparadas com hash bcrypt. O seed gera hash com 12 rodadas e exige senha própria de ao menos 12 caracteres.
- JWT padrão expira em 1 hora. No navegador, o token é armazenado em cookie `HttpOnly`, `SameSite=Strict` e `Secure` quando `NODE_ENV=production`; não é gravado em `localStorage`.
- Mutações autenticadas por cookie exigem `X-CSRF-Token`. Clientes Bearer enviam JWT no cabeçalho `Authorization`.
- Cada requisição autenticada verifica a existência da conta, a versão do token e, para profissionais e pacientes, o cadastro ativo; a alteração de senha incrementa `tokenVersion` e revoga tokens anteriores.
- `FRONTEND_ORIGIN` permite uma lista explícita de origens CORS em implantação separada. O uso padrão do frontend é na mesma origem da API.
- Rotas protegidas utilizam middleware de autenticação; services validam tipos, estados, datas, intervalos e alguns vínculos. Erros conhecidos são padronizados sem expor detalhes internos ao cliente.
- A configuração do banco e a chave JWT ficam em variáveis de ambiente. O `.env` deve permanecer fora do Git.
- O seed de demonstração é bloqueado em produção e exige confirmação explícita da limpeza. Ele é destrutivo e serve apenas para banco descartável.

## Limitações e riscos pendentes

- Os papéis ADMIN, PROFESSIONAL e PATIENT estão implementados, com isolamento por vínculo profissional e paciente. Pacientes têm acesso de consulta aos próprios dados, com troca da própria senha. Ainda não há trilha de auditoria nem política de retenção implementados.
- Não há limitação de tentativas de login, recuperação de senha, segundo fator ou revogação imediata de Bearer no logout. A troca de senha revoga os tokens pela versão.
- É necessária revisão da política de cookies e HTTPS se frontend e backend forem implantados em origens diferentes. O ambiente local usa `/app/` e `/api` na mesma origem.
- Em 17/11/2026 foram verificados login e consultas profissionais no Supabase real; a conta de paciente segue a mesma autenticação própria da API; os testes HTTP automatizados de isolamento e permissões usam persistência em memória. Não foi realizada auditoria independente de segurança/privacidade. Não usar dados clínicos reais antes de validar infraestrutura, acesso, consentimento e tratamento de dados com os responsáveis pelo projeto.

## Preparação para implantação

Use HTTPS, configure segredo JWT longo e aleatório, restrinja acesso ao banco, mantenha backups e logs adequados, revise dependências e teste migrations em ambiente descartável antes de aplicar em produção. A base jurídica e a política institucional de tratamento de dados devem ser definidas por responsáveis competentes; o código atual não demonstra conformidade integral.
