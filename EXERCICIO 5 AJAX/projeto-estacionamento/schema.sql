CREATE TABLE IF NOT EXISTS estacionamentos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    modelo TEXT NOT NULL CHECK (length(trim(modelo)) BETWEEN 1 AND 100),
    placa TEXT NOT NULL CHECK (length(trim(placa)) BETWEEN 1 AND 15),
    entrada TEXT NOT NULL,
    saida TEXT
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_estacionamentos_placa_ativa
    ON estacionamentos (upper(placa))
    WHERE saida IS NULL;

CREATE INDEX IF NOT EXISTS idx_estacionamentos_ativos_entrada
    ON estacionamentos (entrada)
    WHERE saida IS NULL;
