// Matriz de SLA expressa em minutos para facilitar os cálculos matemáticos
const SLA_MATRIX = {
  "Acessos / Permissões": { Crítico: 30, Alto: 120, Médio: 480, Baixo: 1440 },
  "Infraestrutura / Redes": { Crítico: 60, Alto: 240, Médio: 720, Baixo: 1440 },
  "Software / Sistemas":   { Crítico: 120, Alto: 360, Médio: 960, Baixo: 2160 },
  "Hardware":              { Crítico: 120, Alto: 480, Médio: 1440, Baixo: 2880 }
};

/**
 * Calcula a data de expiração do SLA com base na categoria e impacto.
 * Trata horas corridas (Crítico/Alto) vs horas úteis simplificadas (Médio/Baixo).
 */
function calculateSla(category, impact, startDate) {
  const minutesToAdd = SLA_MATRIX[category]?.[impact] || 1440; // Default 24h se falhar
  const expiration = new Date(startDate.getTime());

  if (impact === "Crítico" || impact === "Alto") {
    // Horas Corridas: Soma direta simples
    expiration.setMinutes(expiration.getMinutes() + minutesToAdd);
  } else {
    // Horas Úteis Simplificadas: Se cair no fim de semana, empurra para segunda-feira
    expiration.setMinutes(expiration.getMinutes() + minutesToAdd);
    const day = expiration.getDay(); 
    if (day === 6) expiration.setDate(expiration.getDate() + 2); // Sábado -> Segunda
    if (day === 0) expiration.setDate(expiration.getDate() + 1); // Domingo -> Segunda
  }

  return expiration;
}

export const createTicket = async (req, res) => {
  try {
    const { title, description, category, impact } = req.body;
    const files = req.files || [];

    // 1. Validações de campos obrigatórios e tamanhos mínimos (Conforme Markdown)
    if (!title || title.length < 10 || title.length > 100) {
      return res.status(400).json({
        success: false,
        error: "ValidationFailed",
        message: "O campo 'title' é obrigatório e deve ter entre 10 e 100 caracteres."
      });
    }

    if (!description || description.length < 30) {
      return res.status(400).json({
        success: false,
        error: "ValidationFailed",
        message: "O campo 'description' é obrigatório e deve ter no mínimo 30 caracteres."
      });
    }

    if (!SLA_MATRIX[category] || !SLA_MATRIX[category][impact]) {
      return res.status(400).json({
        success: false,
        error: "ValidationFailed",
        message: "Categoria ou Impacto inválidos informados."
      });
    }

    // 2. Processamento dos metadados do Chamado
    const createdAt = new Date();
    const slaExpiration = calculateSla(category, impact, createdAt);
    const ticketId = `TK-${Math.floor(10000 + Math.random() * 90000)}`; // Simulação de ID único

    // 3. Gatilho de Alerta de Contenção (Regra Crítica do Markdown)
    if (impact === "Crítico") {
      console.warn(`[CONTAINMENT-REQUIRED] Alerta Máximo! Chamado crítico criado: ${ticketId}`);
    }

    // Mapeia os caminhos dos arquivos salvos para retorno/persistência
    const attachmentPaths = files.map(file => file.path);

    // [Aqui entraria a query de persistência no Banco de Dados via ORM ou Driver]

    return res.status(201).json({
      success: true,
      message: "Chamado criado com sucesso.",
      data: {
        ticketId,
        status: "Aberto",
        createdAt: createdAt.toISOString(),
        slaExpiration: slaExpiration.toISOString(),
        attachmentsCount: attachmentPaths.length
      }
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "InternalServerError",
      message: "Erro interno ao processar a criação do chamado."
    });
  }
};
