# AI-USAGE.md - Relato de uso de inteligência artificial

Este documento descreve como a ferramenta de Inteligência Artificial foi integrada ao processo de desenvolvimento do **Sistema Help Desk**, seguindo as diretrizes e etapas da atividade prática de **Spec-Driven Development (SDD)**.

---

## 1. Ferramenta de IA Utilizada
* **Assistente de IA Generativa:** Gemini (como colaborador pessoal de desenvolvimento de software e engenharia).

---

## 2. Etapas em que a IA foi Aplicada
A IA foi acionada de forma colaborativa e incremental ao longo de todo o ciclo de vida do projeto:
* **Análise de requisitos e visão geral (Etapas 1 a 4):** Auxílio na estruturação inicial dos arquivos `project.md` e `roadmap.md`, transformando uma necessidade informal de negócio em objetivos claros, escopo e restrições técnicas.
* **Sessões de esclarecimento e detecção de ambiguidades (Etapas 5 e 6):** Identificação de pontos omissos nos requisitos (como regras de negócio para atualização de status, visibilidade de perfis, categorias e comportamento de históricos vazios).
* **Decomposição em tarefas e planejamento (Etapas 7 e 8):** Elaboração de planos de implementação divididos em tarefas pequenas, verificáveis e sequenciais.
* **Implementação e Codificação (Etapas 9):** Geração assistida de código para o back-end em Node.js (com SQLite) e para o front-end (HTML, CSS em Dark Mode e JavaScript com tratamento de rotas e APIs).
* **Documentação Final (Etapas 26 e 27):** Estruturação do `README.md` e deste relatório de uso de IA (`AI-USAGE.md`).

---

## 3. Exemplos de Tarefas Realizadas com Auxílio da IA
* **Estruturação de Regras de Negócio:** Definição conjunta de que o MVP não conteria autenticação real, mas sim um seletor visual simplificado de perfil armazenado em `sessionStorage`.
* **Geração de código modular:** Criação das rotas Express para inserção de chamados, listagem cronológica, consulta detalhada com filtros de perfil e transações simultâneas para registro de atendimentos e atualização de status.
* **Padronização visual:** Implementação de folhas de estilo (CSS) alinhadas rigorosamente às diretrizes visuais predefinidas (Dark Mode, paleta de cores escuras e realces em roxo).

---

## 4. Sugestões da IA Rejeitadas ou Ajustadas
* **Complexidade de autenticação:** A IA sugeriu em momentos iniciais a implementação de tokens JWT ou sessões robustas de banco de dados, mas a sugestão foi ajustada para um seletor de perfil simples na interface, respeitando estritamente o escopo enxuto do MVP.
* **Granularidade de validações:** Os limites de caracteres (50 para títulos e 500 para descrições) e o comportamento do formulário de suporte foram refinados por decisão humana direta para atender perfeitamente aos critérios de aceitação acadêmicos.

---

## 5. Problemas Encontrados nas Respostas da IA
* Durante a integração entre as tabelas relacionais do SQLite (`chamados` e `atendimentos`), foi necessário ajustar manualmente a gestão de transações assíncronas no Node.js para garantir que o rollback funcionasse corretamente caso ocorresse uma falha na atualização simultânea do status.

---

## 6. Verificação do Código Produzido
* Foi criada uma suíte automatizada executada com `npm test` para cobrir cadastro, validações, listagem, consulta, atualização de status e histórico. A interface também deve ser conferida no navegador durante a validação funcional.

---

## 7. Decisões sob Responsabilidade Humana
A Inteligência Artificial atuou estritamente como suporte técnico e de engenharia. Permaneceram sob total responsabilidade da equipe/usuário:
* A aprovação final de todas as regras de negócio e restrições de escopo.
* A validação dos testes funcionais e critérios de aceitação.
* A estrutura de pastas e a decisão final sobre a stack tecnológica adotada.