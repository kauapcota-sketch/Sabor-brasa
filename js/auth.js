async function enviarAuth(formId, endpoint) {
    const form = document.getElementById(formId);
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const msg = document.getElementById('mensagem');
        const botao = form.querySelector('button[type="submit"]');
        const textoOriginal = botao ? botao.textContent : '';

        if (msg) msg.textContent = 'Processando...';
        if (botao) {
            botao.disabled = true;
            botao.textContent = 'AGUARDE...';
        }

        const dados = Object.fromEntries(new FormData(form).entries());

        try {
            const resposta = await fetch('../api/' + endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'same-origin',
                body: JSON.stringify(dados)
            });

            const resultado = await resposta.json();

            if (!resposta.ok || !resultado.sucesso) {
                throw new Error(resultado.mensagem || 'Não foi possível concluir.');
            }

            if (msg) msg.textContent = 'Tudo certo! Redirecionando...';

            // Login e cadastro agora levam à página inicial com a sessão ativa.
            window.location.href = 'index.html';
        } catch (erro) {
            if (msg) msg.textContent = erro.message;
            if (botao) {
                botao.disabled = false;
                botao.textContent = textoOriginal;
            }
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    enviarAuth('form-login', 'login.php');
    enviarAuth('form-cadastro', 'cadastro.php');
});
