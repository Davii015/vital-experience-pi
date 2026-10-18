# Roteiro de apresentação — 6º período, Fase 02

## Preparação

Use um PostgreSQL/Supabase **de teste e descartável**, configure `backend/.env`, aplique as migrations e crie um administrador de demonstração. O seed só pode ser executado após confirmação explícita de que a limpeza de todas as tabelas do projeto é aceitável. Defina uma senha própria; não existe senha padrão segura publicada. Inicie `npm run dev` e abra `http://localhost:3001/app/`.

Se não houver banco de teste, apresente apenas código, documentação e testes locais; não anuncie uma demonstração persistida em Supabase.

## Sequência sugerida

1. Apresente o problema, o escopo acadêmico e a arquitetura HTML/CSS/JavaScript → Express → services → Prisma → PostgreSQL.
2. Mostre o login do administrador e a navegação autenticada. Explique cookie HttpOnly, cabeçalho CSRF e sessão com expiração.
3. Cadastre um profissional e um usuário monitorado. Reabra a página e confirme os registros **somente se o banco de teste estiver configurado**.
4. Cadastre um sensor, crie uma sessão e registre uma leitura sintética de demonstração. Diferencie explicitamente dado sintético de leitura de hardware.
5. Consulte dashboard, histórico de leituras, relatórios agregados e perfil; altere a senha somente se puder reiniciar a sessão de demonstração.
6. Mostre `docs/openapi.yaml`, `npm run check`, `npm test` e a diferença entre teste HTTP com persistência simulada e validação real do banco.
7. Termine com limitações: ausência de sensores físicos, alertas automáticos, controle de acesso granular e validação com PostgreSQL neste ambiente.

## Evidência disponível no repositório

O frontend usa `fetch` para a API real e não depende de `localStorage` como banco. O teste HTTP local verifica login, CSRF, CRUD de usuário, perfil, troca de senha e Bearer; o esquema Prisma é validado. A persistência real e o fluxo visual completo ainda exigem um ambiente de teste apropriado.
