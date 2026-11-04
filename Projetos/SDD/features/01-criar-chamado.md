# Criar chamado

## Objetivo
Permitir que um usuário (funcionário) registre uma nova solicitação de suporte no sistema, detalhando o problema enfrentado.

## Atores
Funcionário.

## User Story
Como funcionário,
quero registrar um problema de suporte,
para que a equipe responsável possa realizar o atendimento.

## Dados de entrada
- Título do chamado (máximo de 50 caracteres).
- Descrição detalhada do problema (máximo de 500 caracteres).
- Categoria (opções predefinidas: Hardware, Software, Rede e Internet, Outros).

## Regras de negócio
- O título é de preenchimento obrigatório.
- A descrição é de preenchimento obrigatório.
- A seleção de uma categoria é obrigatória.
- Todo chamado deve possuir um status.
- Um novo chamado deve ser registrado automaticamente com o status inicial de "Aberto".

## Comportamento esperado
O sistema deve apresentar um formulário de cadastro. Após o preenchimento e submissão dos dados pelo usuário, o sistema deve salvar as informações no banco de dados, gerar um identificador único para o chamado e redirecionar o usuário imediatamente para a tela de listagem de chamados.

## Validações
- O sistema deve validar no momento do envio se o campo de título não está vazio.
- O sistema deve validar no momento do envio se o campo de descrição não está vazio.
- O sistema deve impedir a submissão se o título ultrapassar 50 caracteres ou se a descrição ultrapassar 500 caracteres.
- O sistema deve validar se uma das quatro categorias válidas foi selecionada.

## Critérios de aceitação
1. Deve ser possível preencher os campos de título, descrição e selecionar a categoria.
2. Ao enviar um formulário com todos os dados válidos, um novo chamado deve ser criado no banco de dados.
3. Um chamado recém-criado deve possuir obrigatoriamente o status "Aberto".
4. O sistema deve impedir o cadastro e apresentar uma mensagem de erro quando o título ou a descrição não forem informados.
5. O sistema deve impedir a digitação ou o envio de dados que ultrapassem os limites de 50 caracteres (título) e 500 caracteres (descrição).
6. Após a criação com sucesso, o usuário deve ser automaticamente levado para a listagem de chamados.

## Casos de exceção
- Se o banco de dados estiver indisponível ou ocorrer um erro interno ao salvar, o sistema deve impedir a perda total dos dados preenchidos na tela e exibir uma mensagem amigável solicitando que o usuário tente novamente.

## Fora do escopo
- Upload de arquivos e anexos.
- Notificação por e-mail informando a criação do chamado.
- Autenticação real do usuário (login/senha).

## Status: Concluída