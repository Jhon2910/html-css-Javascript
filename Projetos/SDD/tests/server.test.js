const assert = require('node:assert/strict');
const { after, before, test } = require('node:test');
const { mkdtempSync, rmSync } = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const temporaryDirectory = mkdtempSync(path.join(os.tmpdir(), 'helpdesk-tests-'));
process.env.HELPDESK_DB_PATH = path.join(temporaryDirectory, 'helpdesk.db');

const { app, db, initializeDatabase } = require('../src/server');

let server;
let baseUrl;

before(async () => {
    await initializeDatabase();
    server = app.listen(0);
    await new Promise((resolve, reject) => {
        server.once('listening', resolve);
        server.once('error', reject);
    });
    baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
    if (server) {
        await new Promise((resolve, reject) => {
            server.close((error) => error ? reject(error) : resolve());
        });
    }

    await new Promise((resolve, reject) => {
        db.close((error) => error ? reject(error) : resolve());
    });
    rmSync(temporaryDirectory, { recursive: true, force: true });
});

test('API atende aos critérios de cadastro, consulta e registro de atendimentos', async () => {
    let response = await fetch(`${baseUrl}/api/chamados`);
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), []);

    response = await fetch(`${baseUrl}/api/chamados`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ titulo: '   ', descricao: 'Descrição', categoria: 'Hardware' })
    });
    assert.equal(response.status, 400);

    response = await fetch(`${baseUrl}/api/chamados`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ titulo: 'Título', descricao: 'd'.repeat(501), categoria: 'Hardware' })
    });
    assert.equal(response.status, 400);

    response = await fetch(`${baseUrl}/api/chamados`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ titulo: 'x'.repeat(51), descricao: 'Descrição', categoria: 'Hardware' })
    });
    assert.equal(response.status, 400);

    response = await fetch(`${baseUrl}/api/chamados`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ titulo: 'Chamado de teste', descricao: 'Descrição', categoria: 'Inválida' })
    });
    assert.equal(response.status, 400);

    response = await fetch(`${baseUrl}/api/chamados`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            titulo: 'x'.repeat(50),
            descricao: 'd'.repeat(500),
            categoria: 'Hardware'
        })
    });
    assert.equal(response.status, 201);
    const { id } = await response.json();

    response = await fetch(`${baseUrl}/api/chamados/${id}`);
    assert.equal(response.status, 200);
    let details = await response.json();
    assert.equal(details.chamado.status, 'Aberto');
    assert.deepEqual(details.atendimentos, []);

    response = await fetch(`${baseUrl}/api/chamados/invalido`);
    assert.equal(response.status, 400);

    response = await fetch(`${baseUrl}/api/chamados/999999`);
    assert.equal(response.status, 404);
    assert.equal((await response.json()).erro, 'Chamado não encontrado');

    const postAtendimento = (ticketId, payload) => fetch(
        `${baseUrl}/api/chamados/${ticketId}/atendimentos`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        }
    );

    response = await postAtendimento(id, {
        status: '',
        responsavel: 'Suporte',
        descricao: 'Análise inicial'
    });
    assert.equal(response.status, 400);

    response = await postAtendimento(id, {
        status: 'Status inválido',
        responsavel: 'Suporte',
        descricao: 'Análise inicial'
    });
    assert.equal(response.status, 400);

    response = await postAtendimento(999999, {
        status: 'Em atendimento',
        responsavel: 'Suporte',
        descricao: 'Chamado inexistente'
    });
    assert.equal(response.status, 404);

    response = await postAtendimento(id, {
        status: 'Em atendimento',
        responsavel: '  Suporte  ',
        descricao: '  Análise inicial  '
    });
    assert.equal(response.status, 201);

    response = await postAtendimento(id, {
        status: 'Concluído',
        responsavel: 'Suporte',
        descricao: 'Problema resolvido'
    });
    assert.equal(response.status, 201);

    response = await fetch(`${baseUrl}/api/chamados/${id}`);
    details = await response.json();
    assert.equal(details.chamado.status, 'Concluído');
    assert.equal(details.atendimentos.length, 2);
    assert.equal(details.atendimentos[0].responsavel, 'Suporte');
    assert.equal(details.atendimentos[0].descricao, 'Análise inicial');

    response = await fetch(`${baseUrl}/api/chamados`);
    const tickets = await response.json();
    assert.equal(tickets.length, 1);
    assert.equal(tickets[0].id, id);
    assert.equal(tickets[0].titulo, 'x'.repeat(50));
});
