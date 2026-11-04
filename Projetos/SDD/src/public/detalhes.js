document.addEventListener('DOMContentLoaded', () => {
    carregarDetalhesChamado();
});

async function carregarDetalhesChamado() {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    const divConteudo = document.getElementById('conteudo-chamado');

    if (!id) {
        mostrarErro('Chamado não encontrado');
        return;
    }

    if (!/^[1-9]\d*$/.test(id) || !Number.isSafeInteger(Number(id))) {
        mostrarErro('Chamado inválido');
        return;
    }

    try {
        const response = await fetch(`/api/chamados/${id}`);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.erro || 'Erro ao carregar os dados.');
        }

        preencherInterface(data.chamado, data.atendimentos);
        verificarPerfilAcesso();
        
        divConteudo.style.display = 'block';

    } catch (error) {
        mostrarErro(error.message);
    }
}

function preencherInterface(chamado, atendimentos) {
    document.getElementById('titulo-pagina').textContent = `Chamado #${chamado.id}`;
    document.getElementById('detalhe-id-titulo').textContent = `#${chamado.id} - ${chamado.titulo}`;
    document.getElementById('detalhe-categoria').textContent = chamado.categoria;
    document.getElementById('detalhe-descricao').textContent = chamado.descricao;
    
    const dataCriacao = new Date(chamado.data_criacao).toLocaleString('pt-BR');
    document.getElementById('detalhe-data').textContent = dataCriacao;

    const badge = document.getElementById('detalhe-status');
    badge.textContent = chamado.status;
    badge.className = 'badge'; 
    if (chamado.status === 'Aberto') badge.classList.add('badge-aberto');
    else if (chamado.status === 'Em atendimento') badge.classList.add('badge-atendimento');
    else badge.classList.add('badge-concluido');

    const listaAtendimentos = document.getElementById('lista-atendimentos');
    if (atendimentos.length === 0) {
        listaAtendimentos.innerHTML = '<p class="atendimento-vazio">Ainda não há registros de atendimento para este chamado</p>';
    } else {
        listaAtendimentos.innerHTML = '';
        atendimentos.forEach(at => {
            const dataAt = new Date(at.data_registro).toLocaleString('pt-BR');
            const divItem = document.createElement('div');
            divItem.className = 'item-historico';
            divItem.innerHTML = `
                <div class="historico-header">
                    <span><strong>Responsável:</strong> ${at.responsavel}</span>
                    <span>${dataAt}</span>
                </div>
                <p style="font-size: 13px; line-height: 1.4;">${at.descricao}</p>
            `;
            listaAtendimentos.appendChild(divItem);
        });
    }
}

function verificarPerfilAcesso() {
    const perfilAtivo = sessionStorage.getItem('perfilAtivo') || 'funcionario';
    
    if (perfilAtivo === 'funcionario') {
        document.getElementById('area-suporte-bloqueada').style.display = 'block';
        document.getElementById('area-formulario-suporte').style.display = 'none';
    } else {
        document.getElementById('area-suporte-bloqueada').style.display = 'none';
        document.getElementById('area-formulario-suporte').style.display = 'block';
    }
}

document.addEventListener('submit', async (e) => {
    if (e.target && e.target.id === 'form-atendimento') {
        e.preventDefault();

        const urlParams = new URLSearchParams(window.location.search);
        const id = urlParams.get('id');

        const status = document.getElementById('novo-status').value;
        const responsavel = document.getElementById('responsavel').value.trim();
        const descricao = document.getElementById('descricao-atendimento').value.trim();

        if (!status || !responsavel || !descricao) {
            alert('Preencha todos os campos do atendimento.');
            return;
        }

        try {
            const response = await fetch(`/api/chamados/${id}/atendimentos`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status, responsavel, descricao })
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.erro || 'Erro ao salvar o atendimento.');

            await carregarDetalhesChamado();
            document.getElementById('form-atendimento').reset();

        } catch (error) {
            alert(error.message);
        }
    }
});

function mostrarErro(mensagem) {
    const divErro = document.getElementById('mensagem-erro');
    divErro.textContent = mensagem;
    divErro.style.display = 'block';
}