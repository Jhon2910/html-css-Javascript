import json
import math
import sqlite3
from contextlib import contextmanager
from datetime import datetime
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, urlparse


ROOT = Path(__file__).resolve().parent
DATABASE = ROOT / "estacionamento.sqlite3"
CAPACITY = 100
HOURLY_RATE_CENTS = 1000


def connect_database():
    DATABASE.parent.mkdir(parents=True, exist_ok=True)
    connection = sqlite3.connect(DATABASE, timeout=10)
    connection.row_factory = sqlite3.Row
    return connection


@contextmanager
def database():
    connection = connect_database()
    try:
        with connection:
            yield connection
    finally:
        connection.close()


def initialize_database():
    with database() as connection:
        sql = (ROOT / "schema.sql").read_text(encoding="utf-8")
        connection.executescript(sql)


def current_time():
    return datetime.now().replace(microsecond=0)


def normalize_plate(plate):
    return "".join(plate.strip().upper().split())


def calculate_charge_cents(entry_time, end_time):
    seconds = (end_time - entry_time).total_seconds()
    hours = max(1, math.ceil(seconds / 3600))
    return hours * HOURLY_RATE_CENTS


def duration_minutes(entry_time, end_time):
    minutes = (end_time - entry_time).total_seconds() // 60
    return max(0, int(minutes))


class ParkingHandler(BaseHTTPRequestHandler):
    def send_json(self, status, data):
        body = json.dumps(data, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    def send_file(self, name, content_type="text/html; charset=utf-8"):
        try:
            body = (ROOT / name).read_bytes()
        except OSError:
            self.send_json(404, {"erro": "Arquivo não encontrado."})
            return

        self.send_response(200)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    def read_json(self):
        try:
            length = int(self.headers.get("Content-Length", "0"))
            if length < 0 or length > 16384:
                raise ValueError
            data = json.loads(self.rfile.read(length) or b"{}")
        except (ValueError, json.JSONDecodeError):
            raise ValueError("Envie dados válidos no formato JSON.") from None

        if not isinstance(data, dict):
            raise ValueError("Envie um objeto JSON.")
        return data

    def do_GET(self):
        path = urlparse(self.path).path

        if path == "/api/vagas":
            self.get_availability()
        elif path == "/api/veiculos":
            self.get_vehicles()
        elif path == "/api/saida":
            plate = parse_qs(urlparse(self.path).query).get("placa", [""])[0]
            self.get_exit_quote(plate)
        elif path in ("/", "/entrada", "/entrada.html"):
            self.send_file("entrada.html")
        elif path in ("/saida", "/saida.html"):
            self.send_file("saida.html")
        elif path == "/styles.css":
            self.send_file("styles.css", "text/css; charset=utf-8")
        elif path == "/app.js":
            self.send_file("app.js", "text/javascript; charset=utf-8")
        else:
            self.send_json(404, {"erro": "Recurso não encontrado."})

    def do_POST(self):
        path = urlparse(self.path).path
        if path not in ("/api/entradas", "/api/saidas"):
            self.send_json(404, {"erro": "Recurso não encontrado."})
            return

        try:
            data = self.read_json()
        except ValueError as error:
            self.send_json(400, {"erro": str(error)})
            return

        if path == "/api/entradas":
            self.register_entry(data)
        else:
            self.register_exit(data)

    def get_availability(self):
        with database() as connection:
            occupied = connection.execute(
                "SELECT COUNT(*) FROM estacionamentos WHERE saida IS NULL"
            ).fetchone()[0]

        self.send_json(200, {
            "capacidade": CAPACITY,
            "ocupadas": occupied,
            "disponiveis": CAPACITY - occupied,
            "agora": current_time().isoformat(),
        })

    def get_vehicles(self):
        now = current_time()
        with database() as connection:
            rows = connection.execute(
                """
                SELECT id, modelo, placa, entrada
                FROM estacionamentos
                WHERE saida IS NULL
                ORDER BY entrada ASC, id ASC
                """
            ).fetchall()

        vehicles = []
        for row in rows:
            entry = datetime.fromisoformat(row["entrada"])
            vehicles.append({
                "id": row["id"],
                "modelo": row["modelo"],
                "placa": row["placa"],
                "entrada": row["entrada"],
                "permanenciaMinutos": duration_minutes(entry, now),
            })

        self.send_json(200, {"veiculos": vehicles, "agora": now.isoformat()})

    def get_exit_quote(self, plate):
        plate = normalize_plate(plate)
        if not plate:
            self.send_json(400, {"erro": "Informe a placa do veículo."})
            return

        with database() as connection:
            vehicle = connection.execute(
                """
                SELECT id, modelo, placa, entrada
                FROM estacionamentos
                WHERE upper(placa) = ? AND saida IS NULL
                """,
                (plate,),
            ).fetchone()

        if vehicle is None:
            self.send_json(404, {"erro": "Não há veículo estacionado com essa placa."})
            return

        now = current_time()
        entry = datetime.fromisoformat(vehicle["entrada"])
        self.send_json(200, {
            "id": vehicle["id"],
            "modelo": vehicle["modelo"],
            "placa": vehicle["placa"],
            "entrada": vehicle["entrada"],
            "permanenciaMinutos": duration_minutes(entry, now),
            "valorCentavos": calculate_charge_cents(entry, now),
            "agora": now.isoformat(),
        })

    def register_entry(self, data):
        model = data.get("modelo", "")
        plate = data.get("placa", "")
        if not isinstance(model, str) or not model.strip() or len(model.strip()) > 100:
            self.send_json(400, {"erro": "Informe um modelo válido (até 100 caracteres)."})
            return
        if not isinstance(plate, str):
            self.send_json(400, {"erro": "Informe uma placa válida (até 15 caracteres)."})
            return

        model = model.strip()
        plate = normalize_plate(plate)
        if not plate or len(plate) > 15:
            self.send_json(400, {"erro": "Informe uma placa válida (até 15 caracteres)."})
            return

        now = current_time()
        with database() as connection:
            connection.execute("BEGIN IMMEDIATE")
            occupied = connection.execute(
                "SELECT COUNT(*) FROM estacionamentos WHERE saida IS NULL"
            ).fetchone()[0]

            if occupied >= CAPACITY:
                connection.rollback()
                self.send_json(409, {"erro": "O pátio está cheio; não é possível registrar novas entradas."})
                return

            duplicate = connection.execute(
                "SELECT 1 FROM estacionamentos WHERE upper(placa) = ? AND saida IS NULL",
                (plate,),
            ).fetchone()
            if duplicate:
                connection.rollback()
                self.send_json(409, {"erro": "Este veículo já está estacionado."})
                return

            try:
                connection.execute(
                    "INSERT INTO estacionamentos (modelo, placa, entrada) VALUES (?, ?, ?)",
                    (model, plate, now.isoformat()),
                )
            except sqlite3.IntegrityError:
                connection.rollback()
                self.send_json(409, {"erro": "Este veículo já está estacionado."})
                return

        self.send_json(201, {
            "mensagem": "Entrada registrada com sucesso.",
            "entrada": now.isoformat(),
            "placa": plate,
        })

    def register_exit(self, data):
        plate = data.get("placa", "")
        if not isinstance(plate, str) or not normalize_plate(plate):
            self.send_json(400, {"erro": "Informe a placa do veículo."})
            return

        plate = normalize_plate(plate)
        now = current_time()
        with database() as connection:
            connection.execute("BEGIN IMMEDIATE")
            vehicle = connection.execute(
                """
                SELECT id, modelo, placa, entrada
                FROM estacionamentos
                WHERE upper(placa) = ? AND saida IS NULL
                """,
                (plate,),
            ).fetchone()

            if vehicle is None:
                connection.rollback()
                self.send_json(404, {"erro": "Não há veículo estacionado com essa placa."})
                return

            entry = datetime.fromisoformat(vehicle["entrada"])
            amount = calculate_charge_cents(entry, now)
            connection.execute(
                "UPDATE estacionamentos SET saida = ? WHERE id = ?",
                (now.isoformat(), vehicle["id"]),
            )

        self.send_json(200, {
            "mensagem": "Saída registrada com sucesso.",
            "modelo": vehicle["modelo"],
            "placa": vehicle["placa"],
            "saida": now.isoformat(),
            "valorCentavos": amount,
        })


if __name__ == "__main__":
    initialize_database()
    server = ThreadingHTTPServer(("127.0.0.1", 8000), ParkingHandler)
    print("Estacionamento disponível em http://127.0.0.1:8000")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nServidor encerrado.")
    finally:
        server.server_close()
