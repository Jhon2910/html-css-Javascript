# Atualizar chamado

## Objetivo
Permitir que a equipe de suporte atualize o status de uma solicitação e registre as informações sobre o trabalho realizado, construindo o histórico do chamado.

## Atores
Equipe de suporte.

## User Story
Como membro da equipe de suporte,
quero atualizar o status de um chamado e registrar o trabalho que realizei,
para manter o histórico organizado e o usuário informado sobre o progresso.

## Dados de entrada
- Novo status (opção vazia por padrão: "Selecione o novo status...", obrigando à escolha entre Aberto, Em atendimento, Concluído).
- Nome do responsável pelo atendimento (texto, preenchimento manual).
- Descrição do atendimento realizado (texto).

## Regras de negócio
- A funcionalidade de atualização só deve estar disponível e visível se o perfil ativo for "Equipe de suporte".
- Funcionários não podem alterar o status nem adicionar registros de atendimento.
- O sistema permite múltiplos registros de atendimento por chamado, inclusive permitindo que chamados com status "Concluído" recebam novos registros e sejam reabertos.
- Cada atualização deve salvar a descrição, o responsável e a data e hora automaticamente.
- O status principal do chamado no banco de dados deve ser atualizado de acordo com a seleção feita no atendimento.

## Comportamento esperado
Na página `detalhes.html`, se o perfil for "Equipe de suporte", o sistema exibe o formulário de novo atendimento. Ao enviar, o sistema deve salvar os dados na tabela `atendimentos`, atualizar o status na tabela `chamados` e atualizar a interface imediatamente com o novo registro no histórico e a nova etiqueta de status.

## Validações
- O sistema deve validar se o nome do responsável foi preenchido.
- O sistema deve validar se a descrição do atendimento foi preenchida.
- O sistema deve impedir o envio se o novo status não for selecionado (mantido na opção "Selecione o novo status...").

## Critérios de aceitação
1. Se o perfil for "Equipe de suporte", a tela deve apresentar o formulário para registrar o atendimento.
2. A opção inicial do campo status deve ser "Selecione o novo status...".
3. O sistema deve impedir o envio, exibindo uma mensagem se algum dado obrigatório estiver faltando.
4. Ao enviar com sucesso, um novo registro deve ser criado e o status geral do chamado deve mudar.
5. Após o envio, o novo atendimento deve aparecer no final da seção "Histórico de atendimento", e o formulário deve ser limpo, permitindo novos registros.

## Casos de exceção
- Se ocorrer uma falha de comunicação com o banco de dados, a interface não deve apagar os dados digitados e deve exibir uma mensagem de erro.

## Fora do escopo
- Envio de notificações por e-mail.
- Edição ou exclusão de registros de atendimento anteriores.

## Status: Concluída