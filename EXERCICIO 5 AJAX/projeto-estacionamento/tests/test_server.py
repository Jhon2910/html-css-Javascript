import json
import tempfile
import threading
import unittest
from datetime import datetime
from http.server import ThreadingHTTPServer
from pathlib import Path
from urllib.error import HTTPError
from urllib.request import Request, urlopen

import server


class ParkingApiTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.temp_dir = tempfile.TemporaryDirectory()
        server.DATABASE = Path(cls.temp_dir.name) / "test.sqlite3"
        server.initialize_database()
        cls.httpd = ThreadingHTTPServer(("127.0.0.1", 0), server.ParkingHandler)
        cls.thread = threading.Thread(target=cls.httpd.serve_forever, daemon=True)
        cls.thread.start()
        cls.base_url = "http://127.0.0.1:%s" % cls.httpd.server_port

    @classmethod
    def tearDownClass(cls):
        cls.httpd.shutdown()
        cls.httpd.server_close()
        cls.thread.join()
        cls.temp_dir.cleanup()

    def setUp(self):
        with server.database() as connection:
            connection.execute("DELETE FROM estacionamentos")

    def api(self, path, method="GET", body=None):
        data = json.dumps(body).encode("utf-8") if body is not None else None
        request = Request(self.base_url + path, data=data, method=method)
        if data is not None:
            request.add_header("Content-Type", "application/json")
        try:
            response = urlopen(request)
        except HTTPError as error:
            response = error
        return response.code, json.loads(response.read().decode("utf-8"))

    def test_entry_records_server_time_and_duplicate_plate_is_rejected(self):
        status, entry = self.api(
            "/api/entradas", "POST", {"modelo": "Honda Civic", "placa": " abc1d23 "}
        )
        self.assertEqual(status, 201)
        self.assertEqual(entry["placa"], "ABC1D23")
        self.assertLessEqual(abs((datetime.now() - datetime.fromisoformat(entry["entrada"])).total_seconds()), 2)

        status, error = self.api(
            "/api/entradas", "POST", {"modelo": "Outro", "placa": "abc1d23"}
        )
        self.assertEqual(status, 409)
        self.assertIn("já está estacionado", error["erro"])

    def test_exit_lookup_quotes_and_exit_frees_space(self):
        status, _ = self.api("/api/entradas", "POST", {"modelo": "Fiat Uno", "placa": "XYZ9876"})
        self.assertEqual(status, 201)

        status, quote = self.api("/api/saida?placa=xyz9876")
        self.assertEqual(status, 200)
        self.assertEqual(quote["modelo"], "Fiat Uno")
        self.assertEqual(quote["valorCentavos"], server.HOURLY_RATE_CENTS)

        status, receipt = self.api("/api/saidas", "POST", {"placa": "xyz9876"})
        self.assertEqual(status, 200)
        self.assertEqual(receipt["placa"], "XYZ9876")

        status, availability = self.api("/api/vagas")
        self.assertEqual(status, 200)
        self.assertEqual(availability["disponiveis"], server.CAPACITY)
        self.assertEqual(availability["ocupadas"], 0)

    def test_full_lot_rejects_another_entry(self):
        with server.database() as connection:
            connection.executemany(
                "INSERT INTO estacionamentos (modelo, placa, entrada) VALUES (?, ?, ?)",
                [
                    ("Modelo", "P%07d" % index, datetime.now().isoformat())
                    for index in range(server.CAPACITY)
                ],
            )

        status, error = self.api(
            "/api/entradas", "POST", {"modelo": "Novo", "placa": "NOVA123"}
        )
        self.assertEqual(status, 409)
        self.assertIn("cheio", error["erro"])

    def test_non_object_json_is_rejected_with_a_clear_error(self):
        status, error = self.api("/api/entradas", "POST", [])
        self.assertEqual(status, 400)
        self.assertEqual(error["erro"], "Envie um objeto JSON.")


if __name__ == "__main__":
    unittest.main()
