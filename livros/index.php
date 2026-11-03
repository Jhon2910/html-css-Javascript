<?php

require_once 'util\banco.php';

try {
    $pdo = conectarBanco();
    $sql = "SELECT id, titulo, autor, ano, capa FROM livro";
    $stmt = $pdo->prepare($sql);
    $stmt->execute();
    $livros = $stmt->fetchAll(PDO::FETCH_ASSOC);

} catch (PDOException $e) {
    die("erro com banco de dados: " . $e->getMessage());
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Meus Livros</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/water.css@2/out/light.css">
    <style>
        #livros {
            display: flex;
        }
    </style>
</head>
<body>
    <h1>Meus Livros</h1>

    <form action="cadastrar.php" method="post" enctype="multipart/form-data">
        <p><strong>Novo Livro</strong></p>

        <div>
            <label>Título <input type="text" name="titulo" minlength = "2" maxlength = "255" required></label>
        </div>
        <div>
            <label>Autor <input type="text" name="autor[;autor]*" minlength = "2" required pattern = "\w+(;\w+)* "></label>
        </div>
        <div>
            <label>Ano <input type="number" name="ano" required></label>
        </div>
        <div>
            <label>Capa <input type="file" name="capa" required></label>
        </div>
        <p><button type="submit">Enviar</button></p>
    </form>

    <hr>
    <h2>Livros</h2>

    <div id="livros">
    <?php foreach ($livros as $livro) { ?>
    
        <div>
            <div><img src="<?= $livro['capa'] ?>" width="120px"></div>
            <h3><?= $livro['titulo'] ?></h3>
            <p><?= $livro['autor'] ?> (Ano <?= $livro['ano'] ?>)</p>
        </div>

    <?php } ?>
    </div>
</body>
</html>