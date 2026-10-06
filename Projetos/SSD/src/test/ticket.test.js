import { test, describe, before, after } from 'node:test';
import assert from 'node:assert';
import { app } from './server.js';

describe('Suíte de Testes - Criar Chamado (POST /api/v1/tickets)', () => {
  let server;
  let baseUrl;

  // Inicia o servidor em uma porta dinâmica antes dos testes começarem
  before(() => {
    server = app.listen(0); // 0 escolhe uma porta livre aleatória
    const { port } = server.address();
    baseUrl = `http://localhost:${port}/api/v1/tickets`;
  });

  // Desliga o servidor após o término de todos os testes
  after(() => {
    server.close();
  });

  test('Deve criar um chamado com sucesso e retornar o SLA calculado', async () => {
    const payload = {
      title: "Falha na VPN de produção",
      description: "Não consigo conectar ao gateway principal a partir do escritório doméstico.",
      category: "Infraestrutura / Redes",
      impact: "Alto"
    };

    const response = await fetch(baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const body = await response.json();

    assert.strictEqual(response.status, 201);
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.data.status, "Aberto");
    assert.ok(body.data.ticketId.startsWith("TK-"));
    assert.ok(body.data.slaExpiration); // Verifica se o campo do SLA foi gerado
  });

  test('Deve rejeitar a criação se o título tiver menos de 10 caracteres', async () => {
    const payload = {
      title: "Curto",
      description: "Descrição longa o suficiente para passar na validação de tamanho mínimo.",
      category: "Software / Sistemas",
      impact: "Baixo"
    };

    const response = await fetch(baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const body = await response.json();

    assert.strictEqual(response.status, 400);
    assert.strictEqual(body.success, false);
    assert.strictEqual(body.error, "ValidationFailed");
    assert.match(body.message, /o campo 'title' é obrigatório/i);
  });

  test('Deve rejeitar a criação se a descrição tiver menos de 30 caracteres', async () => {
    const payload = {
      title: "Título válido com tamanho correto",
      description: "Muito curta.",
      category: "Software / Sistemas",
      impact: "Baixo"
    };

    const response = await fetch(baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const body = await response.json();

    assert.strictEqual(response.status, 400);
    assert.strictEqual(body.error, "ValidationFailed");
  });
});
