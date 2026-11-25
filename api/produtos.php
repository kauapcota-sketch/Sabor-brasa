<?php
require_once __DIR__ . '/_resposta.php';
exigirMetodo('GET');
require_once __DIR__ . '/../config/conexao.php';

try {
    $ps = $pdo->query(
        'SELECT id, nome, descricao, preco, imagem, categoria
         FROM produtos
         WHERE ativo = 1
         ORDER BY CASE WHEN categoria = "hamburguer" THEN 1 ELSE 2 END, id'
    );

    $itens = $ps->fetchAll();

    foreach ($itens as &$p) {
        $p['preco'] = (float) $p['preco'];
    }
    unset($p);

    responder([
        'sucesso' => true,
        'produtos' => $itens,
        'quantidade' => count($itens)
    ]);
} catch (PDOException $e) {
    responder([
        'sucesso' => false,
        'mensagem' => 'Erro ao consultar produtos. Confira se a coluna categoria foi criada no banco.'
    ], 500);
}
