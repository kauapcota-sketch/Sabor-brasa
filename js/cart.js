const fmt = v => Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

let carrinho = JSON.parse(localStorage.getItem('sb_carrinho') || '[]');
function totalItem(i) {
 return (i.preco + i.adicionais.reduce((s, a) => s + a.preco * a.quantidade, 0)) * i.quantidade }

function render() {
    const box = document.getElementById('itens-carrinho'); box.innerHTML = '';
    if (!carrinho.length) box.innerHTML = '<p class="aviso">Seu carrinho está vazio. <a href="index.html">Voltar ao cardápio</a></p>';
    carrinho.forEach((i, n) => {
        const el = document.createElement('div');
        el.className = 'item-carrinho';

        const ad = i.adicionais.map(a => `${a.nome} (${a.quantidade})`).join(', ');
        el.innerHTML = `<div><strong>${i.nome}</strong><p class="aviso">Quantidade: ${i.quantidade}${ad ? ' · ' + ad : ''}</p><strong>${fmt(totalItem(i))}</strong></div><button type="button">Remover</button>`;
        el.querySelector('button').onclick = () => { carrinho.splice(n, 1); salvar(); };
        box.appendChild(el);
    });
    document.getElementById('total-carrinho').textContent = 'Total: ' + fmt(carrinho.reduce((s, i) => s + totalItem(i), 0));
}
function salvar() {
    localStorage.setItem('sb_carrinho', JSON.stringify(carrinho)); render();

}
document.getElementById('form-finalizar').addEventListener('submit', async e => {
    e.preventDefault();

    const msg = document.getElementById('mensagem');
    if (!carrinho.length) {
        msg.textContent = 'Adicione produtos antes de finalizar.';
        return;
    } msg.textContent = 'Enviando pedido...';
    try {
        const r = await fetch('../api/finalizar-pedido.php', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },

            body: JSON.stringify({ endereco: document.getElementById('endereco').value, pagamento: document.getElementById('pagamento').value, itens: carrinho.map(i => ({ produto_id: i.produto_id, quantidade: i.quantidade, adicionais: i.adicionais.map(a => ({ adicional_id: a.id, quantidade: a.quantidade })) })) })
        });

        const d = await r.json(); if (!r.ok || !d.sucesso) throw new Error(d.mensagem || 'Falha ao enviar pedido.');

        localStorage.removeItem('sb_carrinho');

        carrinho = []; msg.textContent = `Pedido #${d.pedido_id} enviado! Total: ${fmt(d.total)}. Acompanhe com a equipe da hamburgueria.`;

        render();
    } catch (err) {
        msg.textContent = err.message; if (err.message.toLowerCase().includes('login')) setTimeout(() => location.href = 'login.html', 1000);

    }
});

fetch('../api/me.php').then(r => r.json()).then(d => {
    document.getElementById('status-login').textContent = d.logado ? 'Conectado como ' + d.usuario.nome : 'Para finalizar, entre na sua conta. Você será direcionado ao login se ainda não estiver conectado.';

}).catch(() => { }); render();