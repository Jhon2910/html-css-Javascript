# Consultar chamado

## Objetivo
Permitir que os usuários visualizem todos os detalhes e o histórico de uma solicitação específica, compreendendo o problema relatado de forma completa.

## Atores
Funcionários e equipe de suporte.

## User Story
Como usuário do sistema,
quero visualizar os dados completos de um chamado,
para entender o problema relatado e acompanhar seu histórico de atendimento.

## Dados de entrada
- ID do chamado (fornecido automaticamente pelo sistema através da URL da página, ex: `detalhes.html?id=1`).
- Perfil do usuário (recuperado da sessão salva na página de listagem).

## Regras de negócio
- O sistema deve apresentar todos os dados do chamado: ID, título, descrição completa, categoria, status e data de criação.
- A página de detalhes não permite a edição do título ou descrição do chamado original.
- Se o perfil ativo for "Funcionário", o sistema deve exibir uma área indicando "Ações de suporte bloqueadas".
- O sistema deve exibir o histórico de registros de atendimento associados a este chamado.
- Se não houver nenhum atendimento registrado, o sistema deve exibir exatamente o texto: "Ainda não há registros de atendimento para este chamado".

## Comportamento esperado
Ao carregar a página `detalhes.html`, o sistema deve capturar o ID da URL e buscar os dados completos do chamado e de seus atendimentos no servidor. A interface será exibida com essas informações, mostrando bloqueios visuais para funcionários e mensagens amigáveis para históricos vazios. Deve existir um botão para voltar à lista.

## Validações
- O sistema deve validar se o ID foi passado na requisição.
- O sistema deve validar se o ID corresponde a um chamado existente no banco de dados.

## Critérios de aceitação
1. Ao acessar a página com um ID válido, os detalhes completos do chamado devem ser exibidos na interface.
2. Se o usuário for "Funcionário", a tela deve exibir o texto "Ações de suporte bloqueadas".
3. Se o chamado não possuir histórico, o texto "Ainda não há registros de atendimento para este chamado" deve estar visível.
4. Se a URL não tiver um ID ou o chamado não existir, o sistema deve exibir "Chamado não encontrado".
5. Deve existir um botão funcional para "Voltar para a lista".

## Casos de exceção
- Se o usuário informar um ID em formato inválido na URL (ex.: `?id=abc`), o sistema deve exibir "Chamado inválido".

## Fora do escopo
- Edição das informações originais do chamado pelo funcionário.
- A funcionalidade real de alterar o status e gravar novos atendimentos (isso pertence à funcionalidade 04 - Atualizar chamado).

## Status: Concluída