<?php 
require_once __DIR__.'/_resposta.php';

 exigirMetodo('GET'); require_once __DIR__.'/../config/conexao.php';
 
  try{$itens=$pdo->query('SELECT id,nome,preco

   FROM adicionais WHERE ativo=1 ORDER BY id')->fetchAll();

   foreach($itens as &$a)$a['preco']=(float)$a['preco'];unset($a);

   responder(['sucesso'=>true,'adicionais'=>$itens]);}catch(PDOException $e){responder(['sucesso'=>false,'mensagem'=>'Erro ao consultar adicionais.'],500);}
