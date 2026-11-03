<?php

require_once 'util/banco.php';

$titulo = $_POST['titulo'] ?: null;
$autor  = $_POST['autor'] ?: null;
$ano  = $_POST['ano'] ?: null;
$capa  = $_FILES['capa'] ?: null;

if (isset($titulo) && isset($autor) && isset($ano) && isset($capa)) {
    $nomeArquivo = $_FILES['capa']['name'];

    /*
        quando um arquivo é enviado a um script PHP,
        o PHP intercepta esse arquivo e já o salva
        em um arquivo temporário dentro do servidor.
        Terminado o processamento da request,
        o arquivo temporário é deletado.
    */
    $arquivo = $_FILES['capa']['tmp_name']; // onde o PHP salvou o arquivo temporariamente no servidor

    /*
        o tipo MIME diz qual é o tipo de conteúdo do arquivo.
        Aqui, os tipos MIME aceitos são aqueles que começam
        com image, como image/jpeg, image/png, image/gif.
    */
    if (!str_starts_with(mime_content_type($arquivo), "image")) {
        die("upload não é uma imagem!");
    }

    $destino = 'capas/' . basename($nomeArquivo);

    if (!move_uploaded_file($arquivo, $destino)) {
        die("upload deu erro.");
    }

    try {
        $sql = "INSERT INTO livro (titulo, autor, ano, capa) VALUES (?, ?, ?, ?)";
        $stmt = conectarBanco()->prepare($sql);
        $stmt->execute(array($titulo, $autor, $ano, $destino));
    } catch (PDOException $e) {
        die("erro no cadastro: " . $e->getMessage());
    }

}

/* 
    Adiciona um cabeçalho HTTP a response
    forçando o navegador a redirecionar para a página principal
*/
header('Location: index.php');