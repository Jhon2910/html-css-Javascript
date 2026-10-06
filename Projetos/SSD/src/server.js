import http from 'node:http';

const SLA_MATRIX = {
  "Acessos / Permissões": { Crítico: 30, Alto: 120, Médio: 480, Baixo: 1440 },
  "Infraestrutura / Redes": { Crítico: 60, Alto: 240, Médio: 720, Baixo: 1440 },
  "Software / Sistemas":   { Crítico: 120, Alto: 360, Médio: 960, Baixo: 2160 },
  "Hardware":              { Crítico: 120, Alto: 480, Médio: 1440, Baixo: 2880 }
};

function calculateSla(category, impact, startDate) {
  const minutesToAdd = SLA_MATRIX[category]?.[impact] || 1440;
  const expiration = new Date(startDate.getTime());

  if (impact === "Crítico" || impact === "Alto") {
    expiration.setMinutes(expiration.getMinutes() + minutesToAdd);
  } else {
    expiration.setMinutes(expiration.getMinutes() + minutesToAdd);
    const day = expiration.getDay(); 
    if (day === 6) expiration.setDate(expiration.getDate() + 2); 
    if (day === 0) expiration.setDate(expiration.getDate() + 1); 
  }
  return expiration;
}

// Criação do servidor nativo
const server = http.createServer((req, res) => {
  // Define cabeçalho padrão para JSON
  res.setHeader('Content-Type', 'application/json');

  // Rota: POST /api/v1/tickets
  if (req.method === 'POST' && req.url === '/api/v1/tickets') {
    let body = '';

    // Captura os blocos de dados da requisição
    req.on('data', chunk => { body += chunk; });

    req.on('end', () => {
      try {
        const { title, description, category, impact } = JSON.parse(body);

        // Validações idênticas à especificação
        if (!title || title.length < 10 || title.length > 100) {
          res.statusCode = 400;
          return res.end(JSON.stringify({
            success: false, error: "ValidationFailed",
            message: "O campo 'title' é obrigatório e deve ter entre 10 e 100 caracteres."
          }));
        }

        if (!description || description.length < 30) {
          res.statusCode = 400;
          return res.end(JSON.stringify({
            success: false, error: "ValidationFailed",
            message: "O campo 'description' é obrigatório e deve ter no mínimo 30 caracteres."
          }));
        }

        if (!SLA_MATRIX[category] || !SLA_MATRIX[category][impact]) {
          res.statusCode = 400;
          return res.end(JSON.stringify({
            success: false, error: "ValidationFailed", message: "Categoria ou Impacto inválidos."
          }));
        }

        const createdAt = new Date();
        const slaExpiration = calculateSla(category, impact, createdAt);
        const ticketId = `TK-${Math.floor(10000 + Math.random() * 90000)}`;

        res.statusCode = 201;
        return res.end(JSON.stringify({
          success: true,
          message: "Chamado criado com sucesso.",
          data: { ticketId, status: "Aberto", createdAt: createdAt.toISOString(), slaExpiration: slaExpiration.toISOString() }
        }));

      } catch (err) {
        res.statusCode = 400;
        return res.end(JSON.stringify({ success: false, message: "JSON inválido enviado no corpo." }));
      }
    });
  } else {
    res.statusCode = 404;
    res.end(JSON.stringify({ success: false, message: "Rota não encontrada." }));
  }
});

export { server };

if (process.argv[1] === new URL(import.meta.url).pathname) {
  server.listen(3000, () => console.log("Servidor nativo rodando na porta 3000"));
}
