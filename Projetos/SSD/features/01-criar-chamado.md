# Especificação Funcional e Técnica: Criar Chamado (`01-criar-chamado.md`)

## 1. Visão Geral
* **Objetivo:** Permitir que usuários do sistema registrem incidentes ou requisições de serviço na plataforma de suporte.
* **Atores:** Usuário Comum, Analista de Suporte, Administrador.
* **Prioridade:** Alta (Core Feature).

---

## 2. Interface e Campos de Entrada
Campos necessários para a criação do chamado na interface (UI):

| Campo | Tipo | Obrigatório | Regras / Validações |
| :--- | :--- | :---: | :--- |
| **Título** | Texto | Sim | Mínimo 10 e máximo 100 caracteres. |
| **Descrição** | Texto Longo | Sim | Detalhamento do problema. Mínimo 30 caracteres. |
| **Categoria** | Select | Sim | Opções pré-definidas (ex: Hardware, Software, Redes, Acessos). |
| **Impacto** | Select | Sim | Opções: Baixo, Médio, Alto, Crítico. |
| **Anexos** | Arquivo | Não | Permitido apenas PDF, JPG, PNG. Limite de 5MB por arquivo (Máx: 3 arquivos). |

---

## 3. Regras de Negócio (RN)
* **RN01 - Atribuição de SLA:** O prazo de atendimento (SLA) deve ser calculado automaticamente no backend com base no *Impacto* e na *Categoria* selecionados.
* **RN02 - Status Inicial:** Todo chamado recém-criado deve obrigatoriamente iniciar com o status `Aberto`.
* **RN03 - Notificação:** Após a criação com sucesso, um e-mail de confirmação contendo o ID e o link do chamado deve ser enviado para o criador.
* **RN04 - Bloqueio de Anexos Maliciosos:** Arquivos com extensões executáveis (ex: `.exe`, `.bat`, `.sh`) devem ser rejeitados imediatamente pelo backend.

---

## 4. Fluxo do Sistema

### 4.1 Fluxo Principal (Caminho Feliz)
1. O usuário acessa a página de "Novo Chamado".
2. O usuário preenche todos os campos obrigatórios e anexa uma imagem do erro (opcional).
3. O usuário clica em "Enviar".
4. O sistema valida os dados (frontend e backend).
5. O sistema salva o chamado no banco de dados e gera um ID único.
6. O sistema dispara a notificação por e-mail.
7. O usuário é redirecionado para a tela de detalhes do chamado criado com uma mensagem de sucesso.

### 4.2 Fluxos Alternativos e de Exceção
* **FA01 - Dados Inválidos:** Se algum campo obrigatório não for preenchido, o sistema destaca o campo em vermelho e impede o envio.
* **FE01 - Falha no Upload:** Se o arquivo exceder 5MB, exibe o erro: `"O arquivo excede o limite máximo de 5MB"`.

---

## 5. Especificação Técnica (Backend)

### 5.1 Endpoint de Criação
* **Rota:** `POST /api/v1/tickets`
* **Autenticação:** Obrigatória (`Bearer Token` via JWT).
* **Content-Type:** `multipart/form-data` (devido aos anexos) ou `application/json` (se não houver arquivos).

### 5.2 Exemplo de Payload (Request Body)
```json
{
  "title": "Erro ao acessar o módulo de relatórios",
  "description": "Ao clicar no botão de exportar PDF, o sistema exibe erro 500 na tela interna.",
  "category": "Software",
  "impact": "Alto"
}
```

### 5.3 Respostas da API (Responses)

* **`201 Created`** (Sucesso):
```json
{
  "success": true,
  "message": "Chamado criado com sucesso.",
  "data": {
    "ticketId": "TK-84920",
    "status": "Aberto",
    "createdAt": "2026-10-02T12:35:00Z",
    "slaExpiration": "2026-10-03T12:35:00Z"
  }
}
```

* **`400 Bad Request`** (Erro de Validação):
```json
{
  "success": false,
  "error": "ValidationFailed",
  "message": "O campo 'title' deve ter no mínimo 10 caracteres."
}
```

---

## 6. Critérios de Aceite (QA)
* [ ] O sistema não deve permitir o envio do formulário com o campo "Título" vazio.
* [ ] O chamado gravado no banco de dados deve conter exatamente o ID do usuário que fez a requisição autenticada.
* [ ] Se o impacto selecionado for `Crítico`, o SLA deve ser gerado para no máximo 2 horas.
* [ ] O upload de um arquivo `.pdf` deve funcionar, mas um arquivo `.exe` deve retornar erro `415 Unsupported Media Type`.
