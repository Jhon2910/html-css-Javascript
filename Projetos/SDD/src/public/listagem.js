document.addEventListener('DOMContentLoaded', () => {
    configurarPerfil();
    carregarChamados();
});

function configurarPerfil() {
    const selectPerfil = document.getElementById('perfil');
    
    const perfilGuardado = sessionStorage.getItem('perfilAtivo');
    if (perfilGuardado) {
        selectPerfil.value = perfilGuardado;
    } else {
        sessionStorage.setItem('perfilAtivo', 'funcionario');
    }

    selectPerfil.addEventListener('change', (e) => {
        sessionStorage.setItem('perfilAtivo', e.target.value);
    });
}

async function carregarChamados() {
    const container = document.getElementById('lista-chamados');
    container.innerHTML = '<p>Carregando chamados...</p>';

    try {
        const response = await fetch('/api/chamados');
        
        if (!response.ok) {
            throw new Error('Falha ao comunicar com o servidor.');
        }
        
        const chamados = await response.json();
        
        if (chamados.length === 0) {
            container.innerHTML = '<p>Nenhum chamado encontrado.</p>';
            return;
        }

        container.innerHTML = ''; // Limpa a mensagem de carregamento

        chamados.forEach(chamado => {
            const card = document.createElement('div');
            card.className = 'card';
            
            let badgeClass = 'badge-aberto';
            if (chamado.status === 'Em atendimento') badgeClass = 'badge-atendimento';
            if (chamado.status === 'Concluído') badgeClass = 'badge-concluido';

            card.innerHTML = `
                <div class="card-header">
                    <strong>#${chamado.id} - ${chamado.titulo}</strong>
                    <span class="badge ${badgeClass}">${chamado.status}</span>
                </div>
                <p style="color: #aaaaaa; margin-bottom: 12px; font-size: 13px;">Categoria: ${chamado.categoria}</p>
                <a href="detalhes.html?id=${chamado.id}" class="btn-detalhes">Consultar detalhes</a>
            `;
            container.appendChild(card);
        });

    } catch (error) {
        container.innerHTML = `<p class="erro" style="display:block;">${error.message}</p>`;
    }
}