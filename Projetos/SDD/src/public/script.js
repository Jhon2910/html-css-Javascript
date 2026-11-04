document.getElementById('form-chamado').addEventListener('submit', async (e) => {
    e.preventDefault();

    const titulo = document.getElementById('titulo').value.trim();
    const categoria = document.getElementById('categoria').value;
    const descricao = document.getElementById('descricao').value.trim();
    const mensagemErro = document.getElementById('mensagem-erro');
    
    mensagemErro.style.display = 'none';

    if (!titulo || !descricao || !categoria) {
        mostrarErro('Todos os campos são obrigatórios.');
        return;
    }

    if (titulo.length > 50 || descricao.length > 500) {
        mostrarErro('Os limites de caracteres foram excedidos.');
        return;
    }

    try {
        const response = await fetch('/api/chamados', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ titulo, categoria, descricao })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.erro || 'Erro interno ao salvar o chamado. Tente novamente.');
        }

        window.location.href = 'listagem.html';

    } catch (error) {
        mostrarErro(error.message);
    }
});

function mostrarErro(mensagem) {
    const divErro = document.getElementById('mensagem-erro');
    divErro.textContent = mensagem;
    divErro.style.display = 'block';
}