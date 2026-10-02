import { test, describe, before, after } from 'node:test';
import assert from 'node:assert';
import { server } from './server.js';

describe('Suíte de Testes - Criar Chamado (Nativo)', () => {
  let baseUrl;

  before(() => {
    server.listen(0); // Abre em uma porta aleatória disponível
    const { port } = server.address();
    baseUrl = `http://localhost:${port}/api/v1/tickets`;
  });

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
      body: JSON.stringify(payload)
    });

    const body = await response.json();

    assert.strictEqual(response.status, 201);
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.data.status, "Aberto");
    assert.ok(body.data.slaExpiration);
  });

  test('Deve rejeitar se o título for curto demais', async () => {
    const payload = {
      title: "Curto",
      description: "Descrição longa o suficiente para passar na validação de tamanho mínimo.",
      category: "Software / Sistemas",
      impact: "Baixo"
    };

    const response = await fetch(baseUrl, {
      method: 'POST',
      body: JSON.stringify(payload)
    });

    const body = await response.json();

    assert.strictEqual(response.status, 400);
    assert.strictEqual(body.error, "ValidationFailed");
  });
});
