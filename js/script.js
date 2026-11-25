const API = '../api';

let produtos = [];
let adicionais = [];
let produtoAtual = null;
let quantidadeProduto = 1;
let quantidadesAdicionais = {};

const moeda = v => Number(v).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
});

function escapeHtml(v) {
    return String(v ?? '').replace(/[&<>"']/g, c => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
}

async function carregarCardapio() {
    const lista = document.getElementById('lista-produtos');
    if (!lista) return;

    try {
        const [rp, ra] = await Promise.all([
            fetch(`${API}/produtos.php`),
            fetch(`${API}/adicionais.php`)
        ]);

        const dp = await rp.json();
        const da = await ra.json();

        if (!rp.ok || !dp.sucesso) {
            throw new Error(dp.mensagem || 'Não foi possível carregar os produtos.');
        }

        produtos = dp.produtos || [];
        adicionais = da.adicionais || [];

        lista.innerHTML = '';

        const hamburgueres = produtos.filter(p => (p.categoria || 'hamburguer') === 'hamburguer');
        const acompanhamentos = produtos.filter(p => p.categoria === 'acompanhamento');

        renderizarGrupo(lista, 'Hambúrgueres', hamburgueres, '🍔');
        renderizarGrupo(lista, 'Bebidas e sobremesas', acompanhamentos, '🥤');

        atualizarContadorCarrinho();
    } catch (e) {
        lista.innerHTML = `<p class="aviso">${escapeHtml(e.message)} Confira se o WAMP e o banco de dados estão ligados.</p>`;
    }
}

function renderizarGrupo(container, titulo, itens, icone) {
    if (!itens.length) return;

    const secao = document.createElement('section');
    secao.className = 'grupo-cardapio';

    const heading = document.createElement('h3');
    heading.className = 'titulo-grupo-cardapio';
    heading.textContent = `${icone} ${titulo}`;
    secao.appendChild(heading);

    const grade = document.createElement('div');
    grade.className = 'cards';

    itens.forEach(p => {
        const card = document.createElement('article');
        card.className = 'card';
        card.tabIndex = 0;

        const imagem = p.imagem
            ? `<img src="../${escapeHtml(p.imagem)}" alt="${escapeHtml(p.nome)}">`
            : `<div class="card-sem-imagem" aria-hidden="true">${p.categoria === 'acompanhamento' ? '🥤' : '🍔'}</div>`;

        card.innerHTML = `
            ${imagem}
            <div>
                <h3>${escapeHtml(p.nome)}</h3>
                <p>${escapeHtml(p.descricao || 'Preparado especialmente para você.')}</p>
                <p class="preco-card">${moeda(p.preco)}</p>
                <span class="texto-escolher">Clique para escolher</span>
            </div>`;

        card.addEventListener('click', () => abrirProduto(p.id));
        card.addEventListener('keydown', e => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                abrirProduto(p.id);
            }
        });

        grade.appendChild(card);
    });

    secao.appendChild(grade);
    container.appendChild(secao);
}

function abrirMenu() {
    document.getElementById('menu')?.classList.toggle('ativo');
}

function abrirCardapio() {
    document.getElementById('menu')?.classList.remove('ativo');
    document.getElementById('cardapio')?.scrollIntoView({ behavior: 'smooth' });
}

function abrirProdutoPorSlug(slug) {
    const p = produtos.find(x => String(x.slug || '').toLowerCase() === slug)
        || produtos.find(x => x.nome.toLowerCase().includes('costela'));

    if (p) abrirProduto(p.id);
    else abrirCardapio();
}

function abrirProduto(id) {
    produtoAtual = produtos.find(p => Number(p.id) === Number(id));
    if (!produtoAtual) return;

    quantidadeProduto = 1;
    quantidadesAdicionais = {};

    document.getElementById('nome-produto').textContent = produtoAtual.nome;
    document.getElementById('descricao-produto').textContent =
        produtoAtual.descricao || 'Preparado com ingredientes selecionados.';

    const imagemProduto = document.getElementById('imagem-produto');
    if (produtoAtual.imagem) {
        imagemProduto.src = '../' + produtoAtual.imagem;
        imagemProduto.style.display = '';
    } else {
        imagemProduto.removeAttribute('src');
        imagemProduto.style.display = 'none';
    }
    imagemProduto.alt = produtoAtual.nome;

    document.getElementById('preco-base').textContent = moeda(produtoAtual.preco);
    document.getElementById('quantidade-produto').textContent = '1';

    const box = document.getElementById('lista-adicionais');
    const tituloAdicionais = document.querySelector('.acrescimos');

    box.innerHTML = '';

    // Bebidas e sobremesas são produtos individuais; adicionais só aparecem nos hambúrgueres.
    const permiteAdicionais = (produtoAtual.categoria || 'hamburguer') === 'hamburguer';
    if (tituloAdicionais) tituloAdicionais.style.display = permiteAdicionais ? '' : 'none';
    box.style.display = permiteAdicionais ? '' : 'none';

    if (permiteAdicionais) {
        adicionais.forEach(a => {
            quantidadesAdicionais[a.id] = 0;

            const el = document.createElement('div');
            el.className = 'opcao';
            el.innerHTML = `
                <div>
                    <span>${escapeHtml(a.nome)}</span>
                    <small>+ ${moeda(a.preco)}</small>
                </div>
                <div class="quantidade">
                    <button type="button" aria-label="Diminuir">−</button>
                    <span>0</span>
                    <button type="button" aria-label="Aumentar">+</button>
                </div>`;

            const buttons = el.querySelectorAll('button');
            const span = el.querySelector('.quantidade span');

            buttons[0].onclick = () => mudarAdicional(a.id, -1, span);
            buttons[1].onclick = () => mudarAdicional(a.id, 1, span);

            box.appendChild(el);
        });
    }

    document.getElementById('menu')?.classList.remove('ativo');
    document.getElementById('modalProduto').classList.add('ativo');
    document.getElementById('modalProduto').setAttribute('aria-hidden', 'false');
    atualizarPreco();
}

function mudarAdicional(id, delta, span) {
    quantidadesAdicionais[id] = Math.max(0, (quantidadesAdicionais[id] || 0) + delta);
    span.textContent = quantidadesAdicionais[id];
    atualizarPreco();
}

function alterarProduto(delta) {
    quantidadeProduto = Math.max(1, quantidadeProduto + delta);
    document.getElementById('quantidade-produto').textContent = quantidadeProduto;
    atualizarPreco();
}

function atualizarPreco() {
    if (!produtoAtual) return;

    let unit = Number(produtoAtual.preco);
    if ((produtoAtual.categoria || 'hamburguer') === 'hamburguer') {
        adicionais.forEach(a => {
            unit += Number(a.preco) * (quantidadesAdicionais[a.id] || 0);
        });
    }

    document.getElementById('preco-total').textContent = moeda(unit * quantidadeProduto);
}

function fecharProduto() {
    document.getElementById('modalProduto').classList.remove('ativo');
    document.getElementById('modalProduto').setAttribute('aria-hidden', 'true');
}

function adicionarCarrinho() {
    if (!produtoAtual) return;

    const cart = JSON.parse(localStorage.getItem('sb_carrinho') || '[]');
    const escolhidos = (produtoAtual.categoria || 'hamburguer') === 'hamburguer'
        ? adicionais
            .filter(a => quantidadesAdicionais[a.id] > 0)
            .map(a => ({
                id: Number(a.id),
                nome: a.nome,
                preco: Number(a.preco),
                quantidade: quantidadesAdicionais[a.id]
            }))
        : [];

    cart.push({
        produto_id: Number(produtoAtual.id),
        nome: produtoAtual.nome,
        preco: Number(produtoAtual.preco),
        imagem: produtoAtual.imagem,
        quantidade: quantidadeProduto,
        adicionais: escolhidos
    });

    localStorage.setItem('sb_carrinho', JSON.stringify(cart));
    atualizarContadorCarrinho();
    fecharProduto();
    alert('Produto adicionado ao carrinho!');
}

function atualizarContadorCarrinho() {
    const c = JSON.parse(localStorage.getItem('sb_carrinho') || '[]')
        .reduce((s, i) => s + Number(i.quantidade || 0), 0);

    const el = document.getElementById('contador-carrinho');
    if (el) el.textContent = c;
}

// Carrossel: só inicia se os elementos existirem nesta página.
function iniciarCarrossel() {
    const listaImagens = document.querySelector('.lista-imagens');
    const imagens = document.querySelectorAll('.imagem');
    const botaoAnterior = document.querySelector('.botao-anterior');
    const botaoProximo = document.querySelector('.botao-proximo');
    const areaIndicadores = document.querySelector('.indicadores');

    if (!listaImagens || !imagens.length || !botaoAnterior || !botaoProximo || !areaIndicadores) return;

    let imagemAtual = 0;
    areaIndicadores.innerHTML = '';

    imagens.forEach((imagem, indice) => {
        const indicador = document.createElement('button');
        indicador.classList.add('indicador');
        indicador.setAttribute('aria-label', `Ir para a imagem ${indice + 1}`);
        indicador.addEventListener('click', () => {
            imagemAtual = indice;
            atualizarCarrossel();
        });
        areaIndicadores.appendChild(indicador);
    });

    function atualizarCarrossel() {
        listaImagens.style.transform = `translateX(-${imagemAtual * 100}%)`;
        areaIndicadores.querySelectorAll('.indicador').forEach((indicador, indice) => {
            indicador.classList.toggle('ativo', indice === imagemAtual);
        });
    }

    botaoProximo.addEventListener('click', () => {
        imagemAtual = (imagemAtual + 1) % imagens.length;
        atualizarCarrossel();
    });

    botaoAnterior.addEventListener('click', () => {
        imagemAtual = (imagemAtual - 1 + imagens.length) % imagens.length;
        atualizarCarrossel();
    });

    atualizarCarrossel();
}

document.addEventListener('keydown', e => {
    if (e.key === 'Escape') fecharProduto();
});

document.addEventListener('DOMContentLoaded', () => {
    carregarCardapio();
    iniciarCarrossel();
});
