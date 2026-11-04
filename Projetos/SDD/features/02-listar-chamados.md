# Listar chamados

## Objetivo
Permitir a visualização de todos os chamados cadastrados no sistema para que os usuários possam acompanhar suas solicitações e a equipe de suporte saiba quais problemas estão pendentes.

## Atores
Funcionários e equipe de suporte.

## User Story
Como usuário do sistema, 
quero visualizar a lista de chamados registrados, 
para saber quais solicitações existem e qual o status atual de cada uma.

## Dados de entrada
- Não existem dados de entrada manuais. O sistema deverá carregar as informações diretamente do banco de dados.
- Seleção de perfil: o usuário escolhe em um menu se está usando o sistema como "Funcionário" ou "Suporte" (sem autenticação).

## Regras de negócio
- A listagem deve exibir informações resumidas de cada chamado: ID (identificador), Título, Categoria e Status.
- Os chamados devem ser apresentados por ordem cronológica de criação, com os **mais recentes no final da lista**.
- O sistema deve diferenciar visualmente os chamados de acordo com o seu status (Aberto, Em atendimento, Concluído).

## Comportamento esperado
Ao acessar a página `listagem.html`, o sistema deve exibir um seletor de perfil no topo (por padrão: Funcionário). Em seguida, deve fazer uma requisição ao servidor para buscar todos os chamados no banco de dados SQLite e apresentá-los na interface.

## Validações
- O sistema deve verificar se a resposta do banco de dados está vazia antes de tentar exibir a lista.

## Critérios de aceitação
1. Ao acessar a página de listagem, o sistema deve exibir os chamados previamente cadastrados ordenados do mais antigo para o mais recente (recentes no final).
2. O topo da página deve exibir um seletor permitindo alternar o perfil entre "Funcionário" e "Suporte".
3. Cada item da lista deve mostrar o ID, Título, Categoria e Status correspondente.
4. Se não existirem chamados cadastrados, o sistema deve apresentar a mensagem "Nenhum chamado encontrado".
5. Cada chamado listado deve possuir um botão para visualizar os detalhes da solicitação.
6. Em caso de erro de comunicação com o servidor, o sistema deve exibir uma mensagem informando que não foi possível carregar a lista.

## Casos de exceção
- Se o banco de dados estiver inacessível, a interface não deve apresentar falhas; deve apenas exibir um aviso de erro ao usuário.

## Fora do escopo
- Paginação da lista.
- Filtros por status ou categoria (previsto para pós-MVP).
- Barra de pesquisa.

## Status: Concluída