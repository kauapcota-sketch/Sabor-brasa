<?php 
require_once __DIR__.'/_resposta.php';
 exigirMetodo('POST');
 if(empty($_SESSION['usuario_id']))responder(['sucesso'=>false,'mensagem'=>'Faça login para finalizar o pedido.'],401);
 require_once __DIR__.'/../config/conexao.php';
 $d=receberJson();$endereco=trim($d['endereco']??'');
 $pagamento=$d['pagamento']??'';
 $itens=$d['itens']??[];
 if($endereco===''||!in_array($pagamento,['pix','cartao','dinheiro'],true)||!is_array($itens)||count($itens)<1)
 responder(['sucesso'=>false,'mensagem'=>'Confira o endereço, pagamento e itens do pedido.'],422);
try{$pdo->beginTransaction();
    $linhas=[];
    $subtotal=0;$qProduto=$pdo->prepare('SELECT id,nome,preco FROM produtos WHERE id=? AND ativo=1');
    $qAd=$pdo->prepare('SELECT id,nome,preco FROM adicionais WHERE id=? AND ativo=1');
    foreach($itens as $i){$pid=(int)($i['produto_id']??0);$qty=(int)($i['quantidade']??0);
        if($pid<1||$qty<1||$qty>30)throw new Exception('Quantidade ou produto inválido.');
        $qProduto->execute([$pid]);$p=$qProduto->fetch();if(!$p)throw new Exception('Um produto não está mais disponível.');
        $adItens=[];
        $totalUnit=(float)$p['preco'];
        foreach(($i['adicionais']??[]) as $a){$aid=(int)($a['adicional_id']??0);$aq=(int)($a['quantidade']??0);
            if($aq<0||$aq>20)throw new Exception('Quantidade de adicional inválida.');
            if($aq===0)continue;$qAd->execute([$aid]);$ad=$qAd->fetch();
            if(!$ad)throw new Exception('Um adicional não está mais disponível.');
            $totalUnit+=(float)$ad['preco']*$aq;$adItens[]=['id'=>$aid,'nome'=>$ad['nome'],'preco'=>(float)$ad['preco'],'quantidade'=>$aq];
        }$subtotal+=$totalUnit*$qty;$linhas[]=['produto'=>$p,'quantidade'=>$qty,'unitario'=>$totalUnit,'adicionais'=>$adItens];
    } 
    $q=$pdo->prepare('INSERT INTO pedidos(usuario_id,endereco,pagamento,status,subtotal,total) VALUES(?,?,?,?,?,?)');
    $q->execute([$_SESSION['usuario_id'],$endereco,$pagamento,'recebido',$subtotal,$subtotal]);$pedidoId=(int)$pdo->lastInsertId();
    $qi=$pdo->prepare('INSERT INTO pedido_itens(pedido_id,produto_id,nome_produto,preco_unitario,quantidade) VALUES(?,?,?,?,?)');
    $qa=$pdo->prepare('INSERT INTO pedido_item_adicionais(pedido_item_id,adicional_id,nome_adicional,preco_unitario,quantidade) VALUES(?,?,?,?,?)');
    foreach($linhas as $l){$qi->execute([$pedidoId,$l['produto']['id'],$l['produto']['nome'],(float)$l['produto']['preco'],$l['quantidade']]);
        $itemId=(int)$pdo->lastInsertId();
        foreach($l['adicionais'] as $a)$qa->execute([$itemId,$a['id'],$a['nome'],$a['preco'],$a['quantidade']]);
    }$pdo->commit();responder(['sucesso'=>true,'pedido_id'=>$pedidoId,'total'=>$subtotal]);
}catch(PDOException $e)
{if($pdo->inTransaction())$pdo->rollBack();responder(['sucesso'=>false,'mensagem'=>'Erro interno ao salvar o pedido.'],500);
}catch(Exception $e){if($pdo->inTransaction())$pdo->rollBack();responder(['sucesso'=>false,'mensagem'=>$e->getMessage()],422);
}catch(Throwable $e){if($pdo->inTransaction())$pdo->rollBack();responder(['sucesso'=>false,'mensagem'=>'Erro interno ao finalizar o pedido.'],500);}
