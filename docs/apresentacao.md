# Guia de Apresentação — Vital Experience Fase 2

## Roteiro sugerido (15–20 min)

### 1. Introdução (2 min)
- Apresentar o problema: monitoramento físico de pacientes em reabilitação e fisioterapia
- Solução: sistema web integrado com sensores vestíveis
- Equipe e papéis

### 2. Demonstração do Frontend (8–10 min)

**Ordem de navegação:**

| Tela | Ponto a destacar |
|------|-----------------|
| Login (`index.html`) | Design dividido, animação do botão, validação |
| Dashboard | Stats em tempo real, gráfico de FC, alertas |
| Usuários | CRUD completo, busca, associação a profissional |
| Profissionais | Cores por especialidade, contagem de pacientes |
| Sensores | Status coloridos, associação a paciente |
| Sessões | Filtro por status, duração calculada |
| Dados dos Sensores | Gráfico sparkline, simulação de leitura em tempo real |
| Relatórios | Seleção de paciente, gráfico histórico, distribuição |
| Perfil | Edição de dados, reset de demonstração |

### 3. Arquitetura e Código (3–4 min)
- Mostrar estrutura de pastas
- Explicar `api.js` como camada de simulação localStorage
- Mostrar backend Express (server.js + controllers)
- Mostrar schema.sql do PostgreSQL

### 4. Metodologia Scrum (2 min)
- Sprints, backlog, cerimônias realizadas
- Divisão de tarefas entre os membros

### 5. Próximos passos (1 min)
- Fase 3: integração real backend ↔ frontend
- Deploy em nuvem (Railway / Render)
- Dashboard em tempo real com WebSocket

---

## Credenciais de demonstração

| Campo | Valor |
|-------|-------|
| E-mail | `admin@vitalexperience.com` |
| Senha | `admin` |

---

## Dados pré-carregados

O sistema inicializa automaticamente com:
- **3 profissionais** (Fisioterapia, Educação Física, Neurológica)
- **4 pacientes** com condições distintas
- **5 sensores** (Monitor Cardíaco, Acelerômetro, Oxímetro, Giroscópio, EMG)
- **5 sessões** (4 concluídas + 1 em andamento)
- **~38 leituras** de sensores com FC, SpO₂, esforço e fadiga

---

## Paleta de Cores

| Cor | Hex | Uso |
|-----|-----|-----|
| Preto | `#0D0D0D` | Sidebar, fundo principal |
| Cinza Claro | `#F0F0EC` | Fundo de conteúdo |
| Amarelo | `#F5E642` | Destaques, nav ativo |
| Verde | `#1DB954` | Status ativo, sucesso |
| Rosa | `#FF2D7A` | Alertas, ações destrutivas |
