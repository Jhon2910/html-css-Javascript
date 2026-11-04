# Projeto: Sistema de Chamados Help Desk

## Missão
Desenvolver um sistema web de gerenciamento de chamados de suporte, com o objetivo de organizar as solicitações dos funcionários, facilitar o atendimento pela equipe de suporte e permitir o acompanhamento do andamento de cada solicitação.

## Público-alvo
O sistema será utilizado por dois grupos:
- Funcionários: responsáveis por registrar chamados e acompanhar suas solicitações.
- Equipe de suporte: responsável por visualizar os chamados, consultar suas informações, atualizar seus status e registrar informações sobre os atendimentos realizados.

## Problema
Atualmente, a empresa utiliza um processo informal para registrar problemas e solicitações de suporte, por meio de e-mails e mensagens.
Esse processo apresenta algumas dificuldades:
- Solicitações podem ser esquecidas.
- Não existe um histórico organizado dos atendimentos.
- Os funcionários têm dificuldade para acompanhar suas solicitações.
- A equipe de suporte não possui uma visão centralizada dos chamados pendentes.
- Os gestores encontram dificuldades para acompanhar os problemas existentes.

## Objetivos
- Centralizar as solicitações de suporte em um único sistema.
- Permitir o registro de novos chamados organizados por categorias simples (Hardware, Software, Rede e Internet, Outros).
- Facilitar a consulta e o acompanhamento das solicitações.
- Organizar o atendimento por meio de status (Aberto, Em atendimento, Concluído).
- Registrar informações sobre os atendimentos, permitindo a criação de um histórico com múltiplos registros por chamado.
- Melhorar a organização e o controle dos problemas relatados pelos funcionários.

## Funcionalidades principais
1. Cadastro de chamados: Funcionário informa título, descrição e categoria do problema (iniciado automaticamente como "Aberto").
2. Listagem de chamados: Visualizar chamados cadastrados e seus respectivos status.
3. Consulta de chamado: Visualizar os detalhes de uma solicitação específica.
4. Atualização de status: Exclusiva para a equipe de suporte (Aberto, Em atendimento, Concluído).
5. Registro de atendimento: A equipe de suporte registra a descrição do atendimento, data/horário e informa manualmente o nome do responsável.

## Fora do escopo
As seguintes funcionalidades não serão desenvolvidas na primeira versão (MVP):
- Autenticação de usuários, login e senhas (a identificação do perfil será feita por seleção simples na interface).
- Diferentes níveis avançados de permissões.
- Notificações por e-mail.
- Envio de arquivos e anexos.
- Sistema de comentários.
- Priorização de chamados e categorias avançadas.
- SLA, dashboard e relatórios gerenciais.
- Integração com outras plataformas e classificação automática por inteligência artificial.

## Restrições
- O projeto será desenvolvido no contexto de uma atividade acadêmica de Engenharia de Software.
- A implementação deverá respeitar rigorosamente o escopo definido para o MVP, sem adicionar funcionalidades não planejadas.
- O sistema deverá ser desenvolvido como uma aplicação Web.

## Stack tecnológica
### Front-end
HTML, CSS e JavaScript.

### Back-end
Node.js.

### Banco de dados
SQLite.

### Outras tecnologias
- Visual Studio Code para desenvolvimento.
- Git e GitHub para controle de versão e armazenamento do projeto.