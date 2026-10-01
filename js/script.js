
const produtos = {
    
    basico: {
        nome: "X-Básico",
        preco: 20.00,
        imagem: "/img/792cf5dc0120821dbac92de5b5cb2afb.jpg"
    },

    amazonia: {
        nome: "X-Amazonia",
        preco: 28.00,
        imagem: "/img/b50d22aed638664f17fe53e43680d7c8.jpg"
    },

    frango: {
        nome: "X-Frango do Sabor",
        preco: 33.00,
        imagem: "/img/aab97026788432316d3a26d6057de02e.jpg"
    },

    egg: {
        nome: "X-EGG-MAX-PRO-ULTIMATE",
        preco: 52.00,
        imagem: "/img/e263e50bc39528becbd777a271e297af.jpg"
    },

    costela: {
        nome: "Costela Supreme Single",
        preco: 87.00,
        imagem: "../img/costela.jpg"
    }

};


// PRODUTO ATUAL
let produtoAtual = produtos.costela;


// QUANTIDADE DO HAMBÚRGUER
let quantidadeProduto = 1;


// ADICIONAIS
const adicionais = {

    costela: {
        preco: 9.50,
        quantidade: 0
    },

    bovino: {
        preco: 15.50,
        quantidade: 0
    },

    bacon: {
        preco: 5.00,
        quantidade: 0
    },

    queijo: {
        preco: 4.00,
        quantidade: 0
    }

};


// ABRIR PRODUTO
function abrirProduto(tipo) {

    produtoAtual = produtos[tipo];

    quantidadeProduto = 1;

    // Zera os adicionais
    for (const produto in adicionais) {
        adicionais[produto].quantidade = 0;
        document.getElementById("qtd-" + produto).textContent = "0";
    }

    // Nome
    document.getElementById("nome-produto").textContent =
        produtoAtual.nome;
    // Imagem
    document.getElementById("imagem-produto").src =
        produtoAtual.imagem;
    document.getElementById("imagem-produto").alt =
        produtoAtual.nome;
    // Preço base
    document.getElementById("preco-base").textContent =
        "R$ " + produtoAtual.preco.toFixed(2).replace(".", ",");
    // Quantidade
    document.getElementById("quantidade-produto").textContent =
        quantidadeProduto;
    atualizarPreco();
    // Fecha menu
    document.getElementById("menu").classList.remove("ativo");
    // Abre modal
    document.getElementById("modalProduto").classList.add("ativo");
}


// ALTERAR QUANTIDADE DO HAMBÚRGUER
function alterarProduto(valor) {

    quantidadeProduto += valor;

    if (quantidadeProduto < 1) {
        quantidadeProduto = 1;
    }
    document.getElementById("quantidade-produto").textContent =
        quantidadeProduto;

    atualizarPreco();
}


// ALTERAR QUANTIDADE DOS ADICIONAIS
function alterarQuantidade(produto, valor) {

    const item = adicionais[produto];

    item.quantidade += valor;

    if (item.quantidade < 0) {
        item.quantidade = 0;
    }

    document.getElementById("qtd-" + produto).textContent =
        item.quantidade;

    atualizarPreco();
}


// CALCULAR PREÇO
function atualizarPreco() {

    let precoAdicionais = 0;

    for (const produto in adicionais) {

        const item = adicionais[produto];
        precoAdicionais +=

            item.preco * item.quantidade;
    }

    // Preço do hambúrguer + adicionais
    const precoUnitario =
        produtoAtual.preco + precoAdicionais;

    // Multiplica pela quantidade
    const total =
        precoUnitario * quantidadeProduto;

    document.getElementById("preco-total").textContent =
        "R$ " + total.toFixed(2).replace(".", ",");
}


// ABRIR MENU
function abrirMenu() {

    const menu = document.getElementById("menu");

    menu.classList.toggle("ativo");
}


// ABRIR CARDÁPIO PELO MENU
function abrirCardapio() {

    document.getElementById("menu").classList.remove("ativo");

    abrirProduto("costela");
}


// FECHAR PRODUTO
function fecharProduto() {

    document
        .getElementById("modalProduto")
        .classList.remove("ativo");
}


// ADICIONAR AO CARRINHO
function adicionarCarrinho() {

    const total =
        document.getElementById("preco-total").textContent;

    alert(
        "Pedido adicionado ao carrinho!\n\n" +

        produtoAtual.nome +

        "\nQuantidade: " +
        quantidadeProduto +

        "\nTotal: " +
        total
    );
}
//LOGIN
function entrarPagina(){

    var Senha_Usuário;

   
    Senha_Usuário = document.getElementById('inpSenha').value;

    if ( Senha_Usuário === "123"){
        alert("login realizado com sucesso!.");
        window.location.href = "/html/index.html";
    }
    else {
        alert("Senha e/ou Usuário incorretos. Tente Novamente")
    }
}