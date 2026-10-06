# Roadmap — Sistema de Chamados

## MVP

### Fase 1 – Estrutura Inicial e Ambiente (Flask)
- [ ] Configurar ambiente virtual Python (`venv`) e instalar Flask.
- [ ] Configurar a estrutura inicial do projeto (`src/`, `src/templates/`, `src/static/`).
- [ ] Configurar o aplicativo inicial Flask (`app.py`) com uma rota para a página inicial.
- [ ] Design básico HTML/CSS (Modelo base para o sistema).

### Fase 2 – Banco de Dados e Registro de Chamadas
- [ ] Configurar banco de dados SQLite e a tabela `chamados`.
- [ ] Configurar a página com formulário para criar chamadas (`01-criar-chamado`).
- [ ] Configurar a rota do Flask que irá receber o input do formulário e armazená-lo no SQLite.
- [ ] Adicionar validação básica no lado do backend (Verificar campos obrigatórios).

### Fase 3 — Visualização e Detalhes (Consulta)
- [ ] Criar a página inicial que lista todos os chamados vindos do banco de dados (`02-listar-chamados`).
- [ ] Criar a página de detalhes de um chamado específico através do ID (`03-consultar-chamado`).

### Fase 4 — Atendimento e Fecho do MVP
- [ ] Criar o formulário na página de detalhes para alterar o status do chamado (`04-atualizar-chamado`).
- [ ] Implementar o campo para registar as informações básicas do atendimento.
- [ ] Testar todo o fluxo do MVP ponta a ponta.

## Pós-MVP (Evoluções Futuras)
- [ ] Sistema de Autenticação (Login para funcionários e suporte).
- [ ] Níveis de prioridade nos chamados (Baixa, Média, Alta).
- [ ] Categorias dinâmicas vindas do banco de dados.
- [ ] Upload de anexos/capturas de ecrã.
- [ ] Notificações automáticas por e-mail.
- [ ] Dashboard com gráficos de chamados pendentes e concluídos.
