<?php

const DSN = "mysql:host=localhost;dbname=livros;charset=utf8mb4;port=3306";
const BD_USUARIO = "root";
const BD_SENHA = "";

function conectarBanco() {

    try {
        $pdo = new PDO(DSN, BD_USUARIO, BD_SENHA);
    } catch (PDOException $e) {
        die("erro com banco de dados: " . $e->getMessage());
    }

    return $pdo;
}
