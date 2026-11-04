# Sistema Help Desk - Spec-Driven Development (SDD)

Este repositório contém o desenvolvimento de um sistema web interno de gestão de chamados de suporte (Help Desk), construído no contexto de uma atividade acadêmica de Engenharia de Software utilizando a abordagem de **Spec-Driven Development (SDD)** (Desenvolvimento Orientado por Especificações).

---

## Objetivo do Projeto
Transformar uma necessidade de negócio inicial — caracterizada por processos informais de suporte via e-mails e mensagens — em um software funcional e estruturado, priorizando a clareza de requisitos, regras de negócio bem definidas, critérios de aceitação verificáveis e um planejamento incremental baseado em MVP (Produto Mínimo Viável).

---

## Funcionalidades Implementadas (MVP)

1. **Criar Chamado (`features/01-criar-chamado.md`):**
   * Permite que funcionários registrem novas solicitações de suporte informando o título (limite de 50 caracteres), a categoria (`Hardware`, `Software`, `Rede e Internet`, `Outros`) e a descrição detalhada (limite de 500 caracteres).
   * O sistema define automaticamente o status inicial como **"Aberto"**.

2. **Listar Chamados (`features/02-listar-chamados.md`):**
   * Apresenta todos os chamados registrados em ordem cronológica (com os mais recentes no final).
   * Contém um seletor dinâmico de perfil de acesso na interface (`Funcionário` / `Equipe de suporte`) para fins de simulação de papéis.

3. **Consultar Detalhes (`features/03-consultar-chamado.md`):**
   * Exibe as informações completas de um chamado específico (ID, título, categoria, status, data de criação e descrição).
   * Adapta a interface de acordo com o perfil ativo, aplicando restrições visuais (como o bloqueio de ações de suporte para funcionários) e gerenciando o histórico de atendimentos.

4. **Atualizar chamado e registrar atendimento (`features/04-atualizar-chamado.md`):**
   * Exclusivo para a **Equipe de suporte**.
   * Permite alterar o status global do chamado (`Aberto`, `Em atendimento`, `Concluído`), associando um nome de responsável e a descrição do trabalho realizado, gerando múltiplos registros em um histórico organizado.

---

## Stack Tecnológica

* **Front-end:** HTML5, CSS3 (com Dark Mode nativo e diretrizes visuais padronizadas) e JavaScript (Vanilla).
* **Back-end:** Node.js com o framework Express.
* **Banco de dados:** SQLite.
* **Ferramentas de Apoio:** Visual Studio Code, Git e GitHub.

## Como executar

Pré-requisitos: Node.js e npm instalados.

1. Na pasta raiz do projeto, instale as dependências:

   ```bash
   npm install
   ```

2. Inicie o servidor:

   ```bash
   npm start
   ```

3. Acesse `http://localhost:3000` no navegador. O banco de dados SQLite é criado automaticamente na primeira execução.

Para encerrar o servidor, pressione `Ctrl+C` no terminal.

## Testes

Execute `npm test` para verificar os principais critérios da API: cadastro e validação de chamados, listagem, consulta, atualização de status e histórico de atendimentos, incluindo IDs inválidos ou inexistentes.

---

## Estrutura do Projeto

```text
help-desk/
│
├── project.md             # Visão geral, missão, público-alvo, escopo e restrições
├── roadmap.md             # Planejamento geral da evolução do projeto (Fases do MVP e Pós-MVP)
├── AI-USAGE.md            # Relato do processo de utilização de ferramentas de IA
├── README.md              # Documentação principal do projeto
│
├── features/              # Especificações orientadas por SDD
│   ├── 01-criar-chamado.md
│   ├── 02-listar-chamados.md
│   ├── 03-consultar-chamado.md
│   └── 04-atualizar-chamado.md
│
└── src/                   # Código-fonte da aplicação
    ├── server.js          # Servidor Node.js, rotas de API e banco de dados SQLite
    └── public/            # Arquivos estáticos do front-end
        ├── index.html     # Página de cadastro de chamados
        ├── listagem.html  # Página de listagem geral
        ├── detalhes.html  # Página de consulta e atualização
        ├── style.css      # Estilos visuais da aplicação
        ├── script.js      # Lógica do formulário de criação
        ├── listagem.js    # Lógica de listagem e perfis
        └── detalhes.js    # Lógica de detalhes e formulário de suporte