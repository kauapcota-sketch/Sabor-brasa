<?php
require_once __DIR__ . "/_resposta.php";
exigirGet();
require_once __DIR__ . "/../config/conexao.php";

$id = filter_input(INPUT_GET, "id", FILTER_VALIDATE_INT);
if (!$id || $id < 1) {
    responder(["sucesso" => false, "mensagem" => "Informe um ID válido. Exemplo: produto.php?id=1"], 400);
}

try {
    $consulta = $pdo->prepare(
        "SELECT id, nome, descricao, preco, imagem
         FROM produtos WHERE id = :id AND ativo = 1 LIMIT 1"
    );
    $consulta->execute(["id" => $id]);
    $produto = $consulta->fetch();

    if (!$produto) {
        responder(["sucesso" => false, "mensagem" => "Produto não encontrado."], 404);
    }

    $produto["preco"] = (float) $produto["preco"];
    responder(["sucesso" => true, "produto" => $produto]);
} catch (PDOException $e) {
    responder(["sucesso" => false, "mensagem" => "Erro ao buscar produto."], 500);
}