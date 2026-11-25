<?php
header('Content-Type: application/json; charset=utf-8'); header('Cache-Control: no-store');
if(session_status()===PHP_SESSION_NONE){session_start();}
function responder($dados,$status=200){http_response_code($status);echo json_encode($dados,JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES);exit;}
function exigirMetodo($metodo){if($_SERVER['REQUEST_METHOD']!==$metodo){header('Allow: '.$metodo);responder(['sucesso'=>false,'mensagem'=>'Método não permitido.'],405);}}
function receberJson(){ $d=json_decode(file_get_contents('php://input'),true); if(!is_array($d)) responder(['sucesso'=>false,'mensagem'=>'Envie os dados em JSON válido.'],400); return $d; }
