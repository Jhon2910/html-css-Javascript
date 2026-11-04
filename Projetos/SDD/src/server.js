const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const databasePath = process.env.HELPDESK_DB_PATH || path.join(__dirname, '..', 'helpdesk.db');
const db = new sqlite3.Database(databasePath);

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

let databaseInitialization;

function initializeDatabase() {
    if (!databaseInitialization) {
        databaseInitialization = new Promise((resolve, reject) => {
            db.run('PRAGMA foreign_keys = ON', (error) => {
                if (error) return reject(error);

                db.run(`CREATE TABLE IF NOT EXISTS chamados (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    titulo TEXT NOT NULL CHECK(length(titulo) <= 50),
                    descricao TEXT NOT NULL CHECK(length(descricao) <= 500),
                    categoria TEXT NOT NULL,
                    status TEXT NOT NULL DEFAULT 'Aberto',
                    data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP
                )`, (error) => {
                    if (error) return reject(error);

                    db.run(`CREATE TABLE IF NOT EXISTS atendimentos (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        chamado_id INTEGER NOT NULL,
                        descricao TEXT NOT NULL,
                        responsavel TEXT NOT NULL,
                        data_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY (chamado_id) REFERENCES chamados (id)
                    )`, (error) => {
                        if (error) return reject(error);
                        resolve();
                    });
                });
            });
        });
    }

    return databaseInitialization;
}

function isValidId(id) {
    return /^\d+$/.test(id) && Number.isSafeInteger(Number(id)) && Number(id) > 0;
}

app.get('/api/chamados/:id', (req, res) => {
    const { id } = req.params;
    if (!isValidId(id)) {
        return res.status(400).json({ erro: 'Chamado inválido.' });
    }

    const sqlChamado = 'SELECT * FROM chamados WHERE id = ?';
    const sqlAtendimentos = 'SELECT * FROM atendimentos WHERE chamado_id = ? ORDER BY id ASC';

    db.get(sqlChamado, [id], (err, chamado) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ erro: 'Erro ao carregar o chamado.' });
        }

        if (!chamado) {
            return res.status(404).json({ erro: 'Chamado não encontrado' });
        }

        db.all(sqlAtendimentos, [id], (err, atendimentos) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ erro: 'Erro ao carregar o histórico.' });
            }
            res.status(200).json({ chamado, atendimentos });
        });
    });
});

app.get('/api/chamados', (req, res) => {
    db.all('SELECT * FROM chamados ORDER BY id ASC', [], (err, rows) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ erro: 'Erro ao carregar a lista de chamados.' });
        }
        res.status(200).json(rows);
    });
});

app.post('/api/chamados', (req, res) => {
    const { titulo, descricao, categoria } = req.body || {};

    if (
        typeof titulo !== 'string' ||
        typeof descricao !== 'string' ||
        typeof categoria !== 'string' ||
        !titulo.trim() ||
        !descricao.trim()
    ) {
        return res.status(400).json({ erro: 'Título, descrição e categoria são obrigatórios.' });
    }

    if (titulo.length > 50 || descricao.length > 500) {
        return res.status(400).json({ erro: 'Limites de caracteres excedidos.' });
    }

    const categoriasValidas = ['Hardware', 'Software', 'Rede e Internet', 'Outros'];
    if (!categoriasValidas.includes(categoria)) {
        return res.status(400).json({ erro: 'Categoria inválida.' });
    }

    db.run(
        "INSERT INTO chamados (titulo, descricao, categoria, status) VALUES (?, ?, ?, 'Aberto')",
        [titulo.trim(), descricao.trim(), categoria],
        function(err) {
            if (err) {
                console.error(err);
                return res.status(500).json({ erro: 'Erro interno ao salvar o chamado. Tente novamente.' });
            }
            res.status(201).json({ id: this.lastID, mensagem: 'Chamado criado com sucesso.' });
        }
    );
});

app.post('/api/chamados/:id/atendimentos', (req, res) => {
    const { id } = req.params;
    const { status, responsavel, descricao } = req.body || {};

    if (!isValidId(id)) {
        return res.status(400).json({ erro: 'Chamado inválido.' });
    }

    if (
        typeof status !== 'string' ||
        typeof responsavel !== 'string' ||
        typeof descricao !== 'string' ||
        !responsavel.trim() ||
        !descricao.trim()
    ) {
        return res.status(400).json({ erro: 'Todos os campos do atendimento são obrigatórios.' });
    }

    const statusValidos = ['Aberto', 'Em atendimento', 'Concluído'];
    if (!statusValidos.includes(status)) {
        return res.status(400).json({ erro: 'Status inválido.' });
    }

    db.serialize(() => {
        db.run('BEGIN IMMEDIATE', (err) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ erro: 'Erro ao iniciar o registro do atendimento.' });
            }

            db.run('UPDATE chamados SET status = ? WHERE id = ?', [status, id], function(err) {
                if (err) {
                    console.error(err);
                    return db.run('ROLLBACK', () => {
                        res.status(500).json({ erro: 'Erro ao atualizar o status do chamado.' });
                    });
                }

                if (this.changes === 0) {
                    return db.run('ROLLBACK', () => {
                        res.status(404).json({ erro: 'Chamado não encontrado.' });
                    });
                }

                db.run(
                    'INSERT INTO atendimentos (chamado_id, descricao, responsavel) VALUES (?, ?, ?)',
                    [id, descricao.trim(), responsavel.trim()],
                    (err) => {
                        if (err) {
                            console.error(err);
                            return db.run('ROLLBACK', () => {
                                res.status(500).json({ erro: 'Erro ao registrar o atendimento.' });
                            });
                        }

                        db.run('COMMIT', (err) => {
                            if (err) {
                                console.error(err);
                                return db.run('ROLLBACK', () => {
                                    res.status(500).json({ erro: 'Erro ao salvar o atendimento.' });
                                });
                            }
                            res.status(201).json({ mensagem: 'Atendimento registrado e status atualizado com sucesso.' });
                        });
                    }
                );
            });
        });
    });
});

if (require.main === module) {
    const port = Number(process.env.PORT) || 3000;
    initializeDatabase()
        .then(() => {
            app.listen(port, () => {
                console.log(`Servidor rodando em http://localhost:${port}`);
            });
        })
        .catch((error) => {
            console.error('Erro ao inicializar o banco de dados:', error.message);
            db.close();
            process.exitCode = 1;
        });
}

module.exports = { app, db, initializeDatabase };
