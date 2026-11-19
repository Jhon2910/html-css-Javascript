# Estacionamento

Sistema simples para registrar entradas e saídas de veículos. O pátio tem 100 vagas. As entradas são pela Rua X e as saídas pela Rua Y.

## Como executar

É necessário ter Python 3 instalado. O SQLite já vem com o Python, então não é preciso instalar outras bibliotecas.

Abra o PowerShell nesta pasta e execute:

```powershell
py -3 server.py
```

Depois, abra http://127.0.0.1:8000 no navegador. O banco `estacionamento.sqlite3` será criado automaticamente.

## Tarifa

Como o enunciado não informa a tarifa, o sistema cobra R$ 10,00 por hora ou fração, com valor mínimo de uma hora.

## Testes

```powershell
py -3 -m unittest discover -s tests -v
```
