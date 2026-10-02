# Projeto Help Desk

## Objetivo
Fornecer um meio organizado de registrar os problemas existentes e garantir que todos sejam registrados online através de um site auditável e fácil de acompanhar.

## Público Alvo
* **Funcionários da Empresa:** que farão os pedidos e acompanharão seu progresso.
* **Gerentes/Equipe de Suporte:** que precisam visualizar os problemas abertos e atualizar o status e o fluxo do serviço.

## Problemas Identificados
Os pedidos são feitos por e-mail ou meios informais no momento e isso leva ao fato de muitos pedidos não serem acompanhados, falta de um histórico organizado, a incapacidade de acompanhar o progresso de cada pedido e os gerentes não sabem dos problemas pendentes.

## Objetivos
* Ter um meio organizado de registrar as chamadas
* Conseguir visualizar o status de cada pedido e atualizar seu fluxo até a conclusão.

## Funcionalidades principais (MVP)
* Cadastrar um chamado (com título, descrição e categoria).
* Visualizar a lista de todos os chamados cadastrados.
* Consultar os dados detalhados de um chamado específico.
* Alterar o status do chamado (ex: Aberto, Em Atendimento, Concluído) e registar informações do atendimento.

## Fora do escopo
Nesta primeira versão (MVP), o sistema **NÃO** terá:
* Autenticação e login de utilizadores (qualquer pessoa acede ao sistema).
* Perfis de utilizador diferenciados.
* Upload de anexos ou imagens.
* Notificações por e-mail ou integração com Microsoft Teams.
* Dashboards ou relatórios avançados.

## Restrições
* **Prazo/Contexto:** Projeto académico para a disciplina de Engenharia de Software.
* **Complexidade:** Deve ser um sistema web leve (monolito) focado na entrega rápida de valor.

## Stack tecnológica
### Front-end
* **HTML5:** Para a estrutura das páginas e formulários.
* **CSS3:** Para a estilização visual (foco em layouts limpos e responsivos).
* **JavaScript (Mínimo):** Apenas se for estritamente necessário para pequenas interações na interface.

### Back-end
* **Python 3:** Linguagem base para a lógica do servidor.
* **Flask:** Micro-framework para gestão de rotas e renderização de templates HTML (Jinja2).

### Banco de dados
* **SQLite:** Banco de dados relacional local, leve e embutido (gera um ficheiro `.db` na raiz do projeto), ideal para o MVP por não exigir instalação de servidores complexos.

### Outras tecnologias
* **Git / GitHub:** Para controlo de versão.
* **VS Code:** Como ambiente de desenvolvimento (IDE).
