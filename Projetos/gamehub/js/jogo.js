function pegarParametroDaURL(nomeDoParametro) {
  const parametros = new URLSearchParams(window.location.search);
  return parametros.get(nomeDoParametro);
}

function escapeHtml(text) {
  if (!text) return "";
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function extrairIdYoutube(url) {
  if (!url) return "";
  const match = url.match(/(?:embed\/|v=|vi\/|youtu\.be\/|\/v\/|watch\?v=|&v=)([^#&?]*).*/);
  return (match && match[1]) ? match[1] : "";
}

function obterComentariosDoJogo(idDoJogo, comentariosPadrao = []) {
  const storageKey = `gamehub_comentarios_${idDoJogo}`;
  try {
    const salvos = localStorage.getItem(storageKey);
    if (salvos) {
      return JSON.parse(salvos);
    }
  } catch (e) {}
  return comentariosPadrao;
}

function salvarComentariosDoJogo(idDoJogo, listaComentarios) {
  const storageKey = `gamehub_comentarios_${idDoJogo}`;
  try {
    localStorage.setItem(storageKey, JSON.stringify(listaComentarios));
  } catch (e) {}
}

document.addEventListener("DOMContentLoaded", function () {
  const isEn = document.documentElement.lang === "en" || window.location.pathname.includes("_en.html");
  const idDoJogo = Number(pegarParametroDaURL("id"));

  const langToggle = document.querySelector(".lang-toggle");
  if (langToggle && idDoJogo) {
    langToggle.href = isEn ? `jogo.html?id=${idDoJogo}` : `jogo_en.html?id=${idDoJogo}`;
  }

  const containerJogo = document.getElementById("conteudo-jogo");
  if (!containerJogo) return;

  const jogo = typeof listaDeJogos !== "undefined" 
    ? listaDeJogos.find(item => item.id === idDoJogo) 
    : null;

  if (!jogo) {
    containerJogo.innerHTML = `
      <div class="container" style="padding: 80px 24px; text-align: center;">
        <i class="fa-solid fa-gamepad" style="font-size: 48px; color: var(--laranja); margin-bottom: 16px;"></i>
        <h1 style="font-size: 28px; margin-bottom: 12px; color: var(--texto);">${isEn ? 'Game not found' : 'Jogo não encontrado'}</h1>
        <p style="color: var(--texto-fraco); margin-bottom: 28px;">
          ${isEn ? 'We could not find this game in the catalog.' : 'Não encontramos esse jogo no catálogo do GameHub.'}
        </p>
        <a href="${isEn ? 'catalogo_en.html' : 'catalogo.html'}" class="btn btn-primario">
          ${isEn ? '← Back to catalog' : '← Voltar ao catálogo'}
        </a>
      </div>
    `;
    return;
  }

  // Textos e Traduções
  const nomeExibido = isEn ? (jogo.nome_en || jogo.nome) : jogo.nome;
  const categoriaExibida = obterCategoriaExibida(jogo, isEn);
  const lancamentoExibido = jogo.lancamento === "Lançado"
    ? (isEn ? "Released" : "Lançado")
    : jogo.lancamento;
  const descricaoLongaCandidata = isEn
    ? (jogo.descricaoLonga_en || jogo.descricaoLonga || jogo.descricaoCurta_en || jogo.descricaoCurta) 
    : (jogo.descricaoLonga || jogo.descricaoCurta || "Descrição indisponível.");
  const descricaoLongaExibida = descricaoDeJogoEhGenerica(descricaoLongaCandidata)
    ? ""
    : descricaoLongaCandidata;
  const mostrarDesenvolvedora = jogo.desenvolvedora
    && !jogo.desenvolvedora.toLowerCase().startsWith("estúdio reconhecido da indústria");
  const mostrarPlataformas = jogo.plataformas && jogo.plataformas !== "PC, PlayStation, Xbox";
  const mostrarIdiomas = jogo.idiomas_en !== "English, Portuguese (Brazil)";
  const idiomasExibidos = isEn 
    ? (jogo.idiomas_en || jogo.idiomas || "English, Portuguese, Spanish, French, German, Japanese")
    : (jogo.idiomas || "Português (Brasil), Inglês, Espanhol, Francês, Alemão, Japonês");

  document.title = `${nomeExibido} — GameHub`;
  const favoritado = typeof ehFavorito === "function" && ehFavorito(jogo.id);
  
  // Extração do vídeo oficial
  const videoId = extrairIdYoutube(jogo.trailer || jogo.trailerUrl);

  // Imagens
  const imagemCapa = jogo.imagem || "https://cdn.cloudflare.steamstatic.com/steam/apps/292030/library_600x900_2x.jpg";
  const imagemFundo = jogo.fundo || imagemCapa;

  // Lojas Oficiais
  const termoBuscaLoja = encodeURIComponent(jogo.nome);
  const plataformasJogo = (mostrarPlataformas ? jogo.plataformas : "").toLowerCase();
  const ehNintendo = plataformasJogo.includes("nintendo") || plataformasJogo.includes("switch") || plataformasJogo.includes("wii") || plataformasJogo.includes("3ds") || plataformasJogo.includes("ds");
  const temSteam = plataformasJogo.includes("pc");
  const temPlayStation = plataformasJogo.includes("playstation") || plataformasJogo.includes("ps4") || plataformasJogo.includes("ps5");
  const temXbox = plataformasJogo.includes("xbox");
  const linkSteam = jogo.steamAppId
    ? `https://store.steampowered.com/app/${jogo.steamAppId}/`
    : `https://store.steampowered.com/search/?term=${termoBuscaLoja}`;
  const linkPsn = `https://store.playstation.com/search/${termoBuscaLoja}`;
  const linkXbox = `https://www.xbox.com/search?q=${termoBuscaLoja}`;
  const linkNintendo = `https://www.nintendo.com/us/search/#q=${termoBuscaLoja}`;
  const mostrarLinkSteam = temSteam || (!temPlayStation && !temXbox && !ehNintendo);

  // Status de Lançamento e Avaliação
  const ehLancado = jogo.lancado !== false;
  const notaValida = Number.isFinite(jogo.nota);

  // Comentários
  let comentarios = obterComentariosDoJogo(jogo.id, jogo.comentariosPadrao || []);

  containerJogo.innerHTML = `
    <!-- HERO BACKDROP CINEMATOGRÁFICO (IGDB STYLE) -->
    <div class="jogo-hero-banner" style="background-image: url('${imagemFundo}');">
      <div class="jogo-hero-overlay"></div>
    </div>

    <div class="container jogo-detalhes-container">
      <div class="jogo-pagina">

        <!-- CONTEÚDO PRINCIPAL -->
        <div class="jogo-info-col">
          <div class="jogo-cabecalho-principal">
            <div class="jogo-capa-wrapper">
              <img
                src="${imagemCapa}"
                alt="${escapeHtml(nomeExibido)}"
                onerror="this.onerror=null;this.src='https://cdn.cloudflare.steamstatic.com/steam/apps/292030/library_600x900_2x.jpg';"
              />
            </div>

            <div class="jogo-intro-dados">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; flex-wrap: wrap; margin-bottom: 12px;">
                <div>
                  <h1 style="font-size: 32px; line-height: 1.15; color: var(--texto); font-weight: 700; margin-bottom: 6px;">${escapeHtml(nomeExibido)}</h1>
                  ${mostrarDesenvolvedora ? `<span style="font-size: 13px; color: var(--laranja); font-family: var(--fonte-tecnica); text-transform: uppercase;">${escapeHtml(jogo.desenvolvedora)}</span>` : ""}
                </div>
                
                <!-- BOTÃO SALVAR NA BIBLIOTECA -->
                <button id="btn-fav-jogo" class="btn-fav-jogo-action ${favoritado ? 'ativo' : ''}">
                  <i class="${favoritado ? 'fa-solid' : 'fa-regular'} fa-heart"></i>
                  <span id="btn-fav-jogo-texto">${favoritado ? (isEn ? 'Saved in Library' : 'Salvo na Biblioteca') : (isEn ? 'Save to Library' : 'Salvar na Biblioteca')}</span>
                </button>
              </div>

              <!-- STATUS DE LANÇAMENTO & AVALIAÇÃO -->
              ${ehLancado && notaValida ? `
                <div style="color: var(--verde); font-weight: 600; font-size: 15px; margin-bottom: 14px; display: flex; align-items: center; gap: 6px;">
                  ⭐ <span class="nota" style="font-size: 16px; font-weight: 700;">${jogo.nota}</span> ${isEn ? 'player rating' : 'de avaliação dos jogadores'}
                </div>
              ` : !ehLancado ? `
                <div class="box-jogo-unreleased">
                  <div class="badge-unreleased">
                    <i class="fa-solid fa-clock"></i> ${isEn ? 'Upcoming / In Development' : 'Aguardando Lançamento Oficial'}
                  </div>
                  <div class="info-unreleased">
                    ⭐ <strong>N/A</strong> — ${isEn ? 'Ratings will be available after the official release in ' + lancamentoExibido : 'Avaliações estarão disponíveis após o lançamento oficial previsto para ' + lancamentoExibido}
                  </div>
                </div>
              ` : ""}

              <div class="jogo-tags" style="display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 16px;">
                <span class="jogo-tag" style="background: var(--bg-card); border: 1px solid var(--linha); padding: 4px 10px; border-radius: 4px; font-size: 12px; color: var(--verde); font-weight: 600;">${escapeHtml(categoriaExibida)}</span>
                ${mostrarPlataformas ? `<span class="jogo-tag" style="background: var(--bg-card); border: 1px solid var(--linha); padding: 4px 10px; border-radius: 4px; font-size: 12px; color: var(--texto-fraco);">${escapeHtml(jogo.plataformas)}</span>` : ""}
              </div>
            </div>
          </div>

          <!-- ABAS DE NAVEGAÇÃO INTERNA (SOBRE / IDIOMAS / COMENTÁRIOS) -->
          <div class="abas-jogo-container">
            <div class="abas-botoes">
              <button class="aba-btn ativa" data-aba="sobre">
                <i class="fa-solid fa-align-left"></i> ${isEn ? 'Overview & Languages' : 'Visão Geral & Idiomas'}
              </button>
              <button class="aba-btn" data-aba="comentarios">
                <i class="fa-solid fa-comments"></i> ${isEn ? 'Community Reviews' : 'Comentários da Comunidade'} (<span id="contagem-comentarios-aba">${comentarios.length}</span>)
              </button>
            </div>

            <!-- ABA 1: VISÃO GERAL & IDIOMAS -->
            <div id="aba-sobre" class="aba-conteudo ativa">
              ${descricaoLongaExibida ? `
                <h3 style="font-size: 18px; color: var(--texto); margin-bottom: 12px; font-weight: 700;">
                  ${isEn ? 'About the Game' : 'Sobre o Jogo'}
                </h3>
                <p class="jogo-descricao" style="line-height: 1.75; font-size: 15px; color: var(--texto); margin-bottom: 24px;">
                  ${escapeHtml(descricaoLongaExibida)}
                </p>
              ` : ""}

              <!-- SEÇÃO DE IDIOMAS DISPONÍVEIS -->
              ${mostrarIdiomas ? `<div class="secao-idiomas" style="background: var(--bg-card); border: 1px solid var(--linha); border-radius: 10px; padding: 20px; margin-bottom: 24px;">
                <h4 style="font-size: 15px; color: var(--texto); margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
                  <i class="fa-solid fa-language" style="color: var(--laranja);"></i> ${isEn ? 'Languages' : 'Idiomas'}
                </h4>
                
                <div style="font-size: 13px; color: var(--texto-fraco); line-height: 1.6;">
                  <strong style="color: var(--texto);">${isEn ? 'Available languages:' : 'Idiomas disponíveis:'}</strong><br />
                  ${escapeHtml(idiomasExibidos)}
                </div>` : ""}
              </div>

              <!-- LINKS PARA DOWNLOAD NAS LOJAS OFICIAIS -->
              <div class="secao-lojas">
                <h3><i class="fa-solid fa-download" style="color: var(--laranja);"></i> ${isEn ? 'Get / Wishlist on Official Stores' : 'Baixar / Lista de Desejos nas Lojas Oficiais'}</h3>
                <div class="lojas-grid">
                  ${mostrarLinkSteam ? `<a href="${linkSteam}" target="_blank" rel="noopener noreferrer" class="btn-loja btn-loja-steam">
                    <i class="fa-brands fa-steam"></i> Steam (PC)
                  </a>` : ""}
                  ${temPlayStation ? `<a href="${linkPsn}" target="_blank" rel="noopener noreferrer" class="btn-loja btn-loja-psn">
                    <i class="fa-brands fa-playstation"></i> PlayStation Store
                  </a>` : ""}
                  ${temXbox ? `<a href="${linkXbox}" target="_blank" rel="noopener noreferrer" class="btn-loja btn-loja-xbox">
                    <i class="fa-brands fa-xbox"></i> Xbox Store
                  </a>` : ""}
                  ${ehNintendo ? `<a href="${linkNintendo}" target="_blank" rel="noopener noreferrer" class="btn-loja btn-loja-nintendo">
                    <i class="fa-solid fa-gamepad"></i> Nintendo Store
                  </a>` : ""}
                </div>
              </div>
            </div>

            <!-- ABA 2: COMENTÁRIOS DA COMUNIDADE -->
            <div id="aba-comentarios" class="aba-conteudo">
              <div class="comentarios-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 12px;">
                <h3 style="font-size: 18px; color: var(--texto); font-weight: 700; margin: 0;">
                  ${isEn ? 'Community Reviews' : 'Avaliações e Comentários'}
                </h3>
                <div style="font-size: 14px; color: var(--texto-fraco);">
                  ⭐                   <strong style="color: var(--texto);" id="media-comentarios">${notaValida ? jogo.nota : 'N/A'}</strong> ${isEn ? 'community score' : 'média da comunidade'}
                </div>
              </div>

              <!-- FORMULÁRIO DE NOVO COMENTÁRIO -->
              <div class="form-novo-comentario" style="background: var(--bg-card); border: 1px solid var(--linha); border-radius: 10px; padding: 20px; margin-bottom: 28px;">
                <h4 style="font-size: 14px; color: var(--texto); margin-bottom: 12px;">
                  <i class="fa-solid fa-pen" style="color: var(--laranja);"></i> ${isEn ? 'Leave your review or comment' : 'Deixe sua avaliação ou comentário'}
                </h4>
                
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px;">
                  <span style="font-size: 13px; color: var(--texto-fraco);">${isEn ? 'Your Rating:' : 'Sua Nota:'}</span>
                  <div id="estrelas-seletor" style="display: flex; gap: 6px; cursor: pointer; color: var(--laranja); font-size: 18px;">
                    <i class="fa-solid fa-star" data-valor="1"></i>
                    <i class="fa-solid fa-star" data-valor="2"></i>
                    <i class="fa-solid fa-star" data-valor="3"></i>
                    <i class="fa-solid fa-star" data-valor="4"></i>
                    <i class="fa-solid fa-star" data-valor="5"></i>
                  </div>
                  <input type="hidden" id="input-nota-comentario" value="5" />
                </div>

                <textarea
                  id="texto-novo-comentario"
                  placeholder="${isEn ? 'Write what you think about this game...' : 'Escreva o que você achou deste jogo, jogabilidade, gráficos ou expectativas...'}"
                  rows="3"
                  style="width: 100%; padding: 12px; background: var(--bg); border: 1px solid var(--linha); border-radius: 6px; color: var(--texto); font-family: inherit; font-size: 14px; resize: vertical; margin-bottom: 12px;"
                ></textarea>

                <div style="display: flex; justify-content: flex-end;">
                  <button id="btn-enviar-comentario" class="btn btn-primario" style="padding: 8px 20px; font-size: 13px;">
                    <i class="fa-solid fa-paper-plane"></i> ${isEn ? 'Post Review' : 'Publicar Comentário'}
                  </button>
                </div>
              </div>

              <!-- LISTA DE COMENTÁRIOS -->
              <div id="lista-comentarios-container" class="lista-comentarios"></div>
            </div>

          </div>

          <div style="margin-top: 24px;">
            <a href="${isEn ? 'catalogo_en.html' : 'catalogo.html'}" class="btn btn-secundario">
              ${isEn ? '← Back to catalog' : '← Voltar ao catálogo'}
            </a>
          </div>
        </div>

        <!-- BARRA LATERAL COM TRAILER E METADADOS -->
        <aside class="jogo-lateral" style="background: var(--bg-card); border: 1px solid var(--linha); border-radius: 12px; padding: 24px; box-shadow: var(--shadow);">
          ${mostrarDesenvolvedora ? `<div class="jogo-lateral-linha" style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid var(--linha); font-size: 13px;">
            <span style="color: var(--texto-fraco);">${isEn ? 'Developer' : 'Desenvolvedora'}</span>
            <strong style="color: var(--texto);">${escapeHtml(jogo.desenvolvedora)}</strong>
          </div>` : ""}

          <div class="jogo-lateral-linha" style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid var(--linha); font-size: 13px;">
            <span style="color: var(--texto-fraco);">${isEn ? 'Release Date' : 'Lançamento'}</span>
            <strong style="color: ${ehLancado ? 'var(--texto)' : 'var(--laranja)'};">${escapeHtml(lancamentoExibido)}</strong>
          </div>

          <div class="jogo-lateral-linha" style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid var(--linha); font-size: 13px;">
            <span style="color: var(--texto-fraco);">${isEn ? 'Genre' : 'Categoria'}</span>
            <strong style="color: var(--texto);">${escapeHtml(categoriaExibida)}</strong>
          </div>

          ${mostrarPlataformas ? `<div class="jogo-lateral-linha" style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid var(--linha); font-size: 13px;">
            <span style="color: var(--texto-fraco);">${isEn ? 'Platforms' : 'Plataformas'}</span>
            <strong style="color: var(--texto); text-align: right; max-width: 160px;">${escapeHtml(jogo.plataformas)}</strong>
          </div>` : ""}

          <div class="jogo-trailer" style="margin-top: 24px;">
            <h2 style="font-size: 16px; margin-bottom: 12px; color: var(--texto); display: flex; align-items: center; gap: 8px;">
              <i class="fa-solid fa-clapperboard" style="color: var(--laranja);"></i> ${isEn ? 'Official Trailer' : 'Trailer Oficial'}
            </h2>
            
            <div id="player-trailer-jogo"></div>
          </div>
        </aside>

      </div>
    </div>
  `;

  // -------------------------------------------------------
  // INICIALIZAR GAMEHUB MEDIA ENGINE
  // -------------------------------------------------------
  const containerPlayer = document.getElementById("player-trailer-jogo");
  if (containerPlayer && typeof GameHubMediaPlayer !== "undefined") {
    const mediaPlayer = new GameHubMediaPlayer(containerPlayer, {
      poster: imagemFundo,
      titulo: `${nomeExibido} - ${isEn ? 'Official Trailer' : 'Trailer Oficial'}`,
      isEn: isEn,
      autoplay: false,
      muted: false
    });
    mediaPlayer.carregarMidia(jogo.trailer || videoId || jogo.trailerUrl);
  }

  const abaBotoes = document.querySelectorAll(".aba-btn");
  abaBotoes.forEach(btn => {
    btn.addEventListener("click", () => {
      abaBotoes.forEach(b => b.classList.remove("ativa"));
      document.querySelectorAll(".aba-conteudo").forEach(c => c.classList.remove("ativa"));

      btn.classList.add("ativa");
      const targetId = `aba-${btn.getAttribute("data-aba")}`;
      const targetConteudo = document.getElementById(targetId);
      if (targetConteudo) targetConteudo.classList.add("ativa");
    });
  });

  function renderizarListaComentarios() {
    const listaContainer = document.getElementById("lista-comentarios-container");
    if (!listaContainer) return;

    if (comentarios.length === 0) {
      listaContainer.innerHTML = `
        <div style="padding: 24px; text-align: center; color: var(--texto-fraco); background: var(--bg-card); border-radius: 8px; border: 1px dashed var(--linha);">
          <i class="fa-regular fa-comment-dots" style="font-size: 28px; margin-bottom: 8px; color: var(--laranja);"></i>
          <p>${isEn ? 'No reviews yet. Be the first to review!' : 'Ainda não há comentários. Seja o primeiro a avaliar este jogo!'}</p>
        </div>
      `;
      return;
    }

    listaContainer.innerHTML = comentarios.map((com, index) => {
      const estrelasHtml = Array.from({ length: 5 }, (_, i) => 
        i < (com.nota || 5) 
          ? '<i class="fa-solid fa-star" style="color: var(--laranja); font-size: 12px;"></i>' 
          : '<i class="fa-regular fa-star" style="color: var(--linha); font-size: 12px;"></i>'
      ).join("");

      return `
        <div class="comentario-card" style="background: var(--bg-card); border: 1px solid var(--linha); border-radius: 8px; padding: 16px; margin-bottom: 14px; display: flex; gap: 14px;">
          <img src="${com.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=' + encodeURIComponent(com.autor)}" alt="${escapeHtml(com.autor)}" style="width: 44px; height: 44px; border-radius: 50%; border: 2px solid var(--linha); flex-shrink: 0; background: var(--bg);" />
          
          <div style="flex: 1;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; flex-wrap: wrap; gap: 6px;">
              <div>
                <strong style="font-size: 14px; color: var(--texto); margin-right: 8px;">${escapeHtml(com.autor)}</strong>
                <span style="font-size: 11px; color: var(--texto-fraco);">${escapeHtml(com.data)}</span>
              </div>
              <div style="display: flex; gap: 2px;">
                ${estrelasHtml}
              </div>
            </div>

            <p style="font-size: 14px; color: var(--texto); line-height: 1.5; margin-bottom: 10px;">
              ${escapeHtml(com.texto)}
            </p>

            <div style="display: flex; justify-content: space-between; align-items: center;">
              <button class="btn-like-comentario" onclick="curtirComentario(${index})" style="background: transparent; border: none; color: var(--texto-fraco); cursor: pointer; font-size: 12px; display: flex; align-items: center; gap: 6px; padding: 4px 8px; border-radius: 4px;">
                <i class="fa-regular fa-thumbs-up"></i> <span>${com.likes || 0}</span>
              </button>
            </div>
          </div>
        </div>
      `;
    }).join("");

    const badgeAba = document.getElementById("contagem-comentarios-aba");
    if (badgeAba) badgeAba.textContent = comentarios.length;
  }

  renderizarListaComentarios();

  window.curtirComentario = function (index) {
    if (comentarios[index]) {
      comentarios[index].likes = (comentarios[index].likes || 0) + 1;
      salvarComentariosDoJogo(jogo.id, comentarios);
      renderizarListaComentarios();
    }
  };

  const estrelas = document.querySelectorAll("#estrelas-seletor i");
  const inputNota = document.getElementById("input-nota-comentario");

  estrelas.forEach(star => {
    star.addEventListener("click", function () {
      const valor = Number(this.getAttribute("data-valor"));
      if (inputNota) inputNota.value = valor;

      estrelas.forEach((s, idx) => {
        if (idx < valor) {
          s.className = "fa-solid fa-star";
        } else {
          s.className = "fa-regular fa-star";
        }
      });
    });
  });

  const btnEnviar = document.getElementById("btn-enviar-comentario");
  const textarea = document.getElementById("texto-novo-comentario");

  if (btnEnviar && textarea) {
    btnEnviar.addEventListener("click", function () {
      const texto = textarea.value.trim();
      if (!texto) {
        alert(isEn ? "Please type a review before submitting." : "Por favor, digite seu comentário antes de enviar.");
        return;
      }

      // Obtém usuário logado do auth.js ou visitante padrão
      const user = typeof obterUsuarioLogado === "function" ? obterUsuarioLogado() : null;
      const nomeAutor = user ? user.nome : (isEn ? "Player" : "Jogador GameHub");
      const avatarAutor = user && user.foto ? user.foto : `https://api.dicebear.com/7.x/bottts/svg?seed=${Date.now()}`;
      const notaValor = inputNota ? Number(inputNota.value) : 5;

      const hoje = new Date();
      const dataFormatada = hoje.toLocaleDateString(isEn ? "en-US" : "pt-BR");

      const novoComentario = {
        id: `com_${Date.now()}`,
        autor: nomeAutor,
        avatar: avatarAutor,
        nota: notaValor,
        data: dataFormatada,
        texto: texto,
        likes: 0
      };

      comentarios.unshift(novoComentario);
      salvarComentariosDoJogo(jogo.id, comentarios);
      renderizarListaComentarios();

      textarea.value = "";
    });
  }

  // -------------------------------------------------------
  // FAVORITOS
  // -------------------------------------------------------
  const btnFav = document.getElementById("btn-fav-jogo");
  if (btnFav) {
    btnFav.addEventListener("click", function () {
      if (typeof alternarFavorito === "function") {
        const isFav = alternarFavorito(jogo.id);
        btnFav.classList.toggle("ativo", isFav);
        btnFav.innerHTML = `
          <i class="${isFav ? 'fa-solid' : 'fa-regular'} fa-heart"></i>
          <span>${isFav ? (isEn ? 'Saved in Library' : 'Salvo na Biblioteca') : (isEn ? 'Save to Library' : 'Salvar na Biblioteca')}</span>
        `;
        if (typeof atualizarInterfaceAuth === "function") {
          atualizarInterfaceAuth();
        }
      }
    });
  }
});
