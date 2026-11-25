<?php
require_once __DIR__ . '/_resposta.php';
exigirMetodo('POST');
require_once __DIR__ . '/../config/conexao.php';

$d = receberJson();
$nome = trim($d['nome'] ?? '');
$email = strtolower(trim($d['email'] ?? ''));
$telefone = trim($d['telefone'] ?? '');
$senha = $d['senha'] ?? '';

if (
    $nome === '' ||
    !filter_var($email, FILTER_VALIDATE_EMAIL) ||
    $telefone === '' ||
    strlen($senha) < 6
) {
    responder([
        'sucesso' => false,
        'mensagem' => 'Preencha todos os campos e use uma senha com pelo menos 6 caracteres.'
    ], 422);
}

try {
    $q = $pdo->prepare(
        'INSERT INTO usuarios(nome, email, telefone, senha_hash) VALUES(?, ?, ?, ?)'
    );
    $q->execute([
        $nome,
        $email,
        $telefone,
        password_hash($senha, PASSWORD_DEFAULT)
    ]);

    // Cria a sessão imediatamente após o cadastro.
    session_regenerate_id(true);
    $_SESSION['usuario_id'] = (int) $pdo->lastInsertId();
    $_SESSION['usuario_nome'] = $nome;

    responder([
        'sucesso' => true,
        'mensagem' => 'Conta criada com sucesso!',
        'usuario' => [
            'id' => (int) $_SESSION['usuario_id'],
            'nome' => $nome
        ]
    ]);
} catch (PDOException $e) {
    if ($e->getCode() === '23000') {
        responder([
            'sucesso' => false,
            'mensagem' => 'Este e-mail já está cadastrado.'
        ], 409);
    }

    responder([
        'sucesso' => false,
        'mensagem' => 'Não foi possível criar a conta.'
    ], 500);
}
