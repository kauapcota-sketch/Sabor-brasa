<?php
require_once __DIR__ . '/_resposta.php';
exigirMetodo('GET');

if (empty($_SESSION['usuario_id'])) {
    responder(['logado' => false]);
}

responder([
    'logado' => true,
    'usuario' => [
        'id' => (int) $_SESSION['usuario_id'],
        'nome' => $_SESSION['usuario_nome'] ?? ''
    ]
]);
