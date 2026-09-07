# Segurança e Privacidade — Vital Experience

## Dados Pessoais Tratados

O sistema coleta e processa os seguintes dados pessoais dos pacientes:

| Dado | Finalidade | Base Legal (LGPD) |
|------|------------|-------------------|
| Nome completo | Identificação | Execução de contrato |
| Idade e gênero | Contextualização clínica | Execução de contrato |
| Condição/diagnóstico | Condução do tratamento | Execução de contrato |
| Dados biométricos (FC, SpO₂, movimento) | Monitoramento da saúde | Consentimento / Saúde |

---

## Medidas de Segurança Implementadas

### Autenticação
- Senhas armazenadas com hash bcrypt (salt rounds = 10)
- Autenticação via JWT com expiração configurável (padrão: 7 dias)
- Todas as rotas protegidas exigem Bearer Token válido

### Banco de Dados
- Credenciais via variáveis de ambiente (`.env`) — nunca no código
- Acesso aos dados pelo Prisma Client, sem concatenação manual de SQL
- Chaves estrangeiras com `ON DELETE CASCADE` ou `SET NULL`

### API
- CORS configurado (restrinja `origin` em produção)
- Validação de entrada nos services, incluindo datas, enums, intervalos e vínculos
- Middleware de tratamento de erros centralizado

---

## Boas Práticas para Deploy

1. Nunca suba o arquivo `.env` para o repositório (já no `.gitignore`)
2. Use HTTPS em produção (Nginx como reverse proxy com Let's Encrypt)
3. Restrinja o CORS apenas ao domínio do frontend
4. Defina `JWT_SECRET` com uma string longa e aleatória (32+ caracteres)
5. Mantenha o PostgreSQL em rede privada, não exposto à internet
6. Faça backups regulares do banco de dados

---

## Conformidade com LGPD

- Dados de pacientes só devem ser acessados por profissionais autorizados
- O sistema deve registrar (futuramente) logs de acesso por usuário
- Prevenir retenção de dados desnecessária — implementar política de exclusão
- Obter consentimento explícito dos pacientes antes do monitoramento
