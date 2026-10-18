# Progresso — Vital Experience

**Projeto Integrador, 6º período — Fase 02**
**Atualizado em:** 18/10/2026

## Situação comprovada

| Frente | Situação | Evidência |
|---|---|---|
| API REST em Express | Implementada | Rotas, controllers, services, validação e tratamento de erros em `backend/src/` |
| Cliente HTTP no frontend | Implementado e testado localmente | `frontend/js/api.js` usa `fetch` para `/api`; teste de integração exercita login e CRUD de usuário pela camada real do cliente |
| Autenticação do administrador | Implementada e testada localmente | Login bcrypt/JWT, cookie HttpOnly com CSRF, consulta/edição de perfil, troca de senha e revogação de tokens anteriores |
| Cadastros, sessões e leituras | Implementados no código | Telas chamam endpoints reais; regras de negócio estão nos services. O teste HTTP automatizado cobre CRUD de usuário e rejeição de leitura inválida; não cobre todas as telas/entidades |
| Resumo e relatórios | Implementados no código | Endpoints `/reports/summary` e `/reports/user/:userId`, consumidos no dashboard e em relatórios |
| Prisma e migrações | Esquema validado localmente | `prisma generate` e `prisma validate` passaram; migração de `tokenVersion` adicionada |
| Persistência PostgreSQL/Supabase | Não verificável neste ambiente | Não há banco de teste configurado; migrações e fluxo de escrita real ainda devem ser executados em ambiente descartável |
| Interface em navegador real | Não verificada automaticamente | Teste HTTP carrega `/app/` e executa o cliente `api.js`, mas não percorre visualmente todas as telas |
| Sensores físicos, alertas e autorização por paciente/profissional | Pendentes | Há leitura sintética manual de demonstração; não há ingestão de hardware, motor de alertas ou escopo de dados por profissional |

## Decisões da Fase 02

- Preservar HTML, CSS, JavaScript, Node.js, Express, Prisma e PostgreSQL.
- Servir frontend e API na mesma origem (`/app/` e `/api`) por padrão. Para origens separadas, `FRONTEND_ORIGIN` restringe CORS; a política de cookie precisa ser revista para produção cruzada.
- Substituir a simulação em `localStorage` pelo cliente HTTP em `frontend/js/api.js`.
- Usar autenticação de administrador por cookie HttpOnly, `SameSite=Strict` e cabeçalho CSRF em mutações. O modo Bearer permanece disponível para clientes não navegadores.
- Evitar declarar recursos futuros como concluídos: o dashboard informa que alertas automáticos não possuem fonte persistente; a leitura sintética é identificada como demonstração.
- Proteger o seed destrutivo com confirmação explícita e proibição em produção.

## Verificações executadas

- `npm run prisma:generate`: passou.
- `npx prisma validate`: passou com URLs fictícias apenas para validação local do esquema.
- `npm run check`: passou, validando a sintaxe do backend e do frontend.
- `npm test`: 2 testes passaram. O teste integrado usa delegates Prisma em memória e servidor HTTP local; **não demonstra gravação em PostgreSQL**.
- `git diff --check`: executar antes da entrega final para confirmar formatação das alterações.

## Próximas validações

1. Configurar um PostgreSQL/Supabase de teste sem dados importantes, aplicar `prisma migrate deploy` e verificar criação, consulta, atualização e exclusão reais em todas as entidades.
2. Criar/obter um administrador de teste por procedimento controlado. Executar o seed somente se for aceitável apagar todos os dados das tabelas do projeto.
3. Percorrer login, CRUD, sessões, leituras, relatórios e perfil em navegador real, inclusive erros e layouts móveis.
4. Ampliar testes de regras de negócio, autorização, segurança, indisponibilidade do banco e comportamento da interface.
5. Planejar autorização granular, política de privacidade/retenção, integração com sensores e alertas conforme requisitos futuros.

O texto acadêmico pronto para copiar manualmente está em `Atualizacoes_Documentacao_Fase_02.txt`. O Word oficial permanece somente leitura.
