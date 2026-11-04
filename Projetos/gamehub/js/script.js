function initThemeGamehub() {
  const themeBtn = document.getElementById("theme-toggle");
  const savedTheme = localStorage.getItem("theme") || localStorage.getItem("portfolio_theme");
  const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const activeTheme = savedTheme ? savedTheme : (systemPrefersDark ? "dark" : "light");

  document.documentElement.setAttribute("data-theme", activeTheme);
  localStorage.setItem("theme", activeTheme);
  localStorage.setItem("portfolio_theme", activeTheme);
  updateThemeIcon(activeTheme === "dark");

  if (themeBtn) {
    themeBtn.addEventListener("click", () => {
      const currentTheme = document.documentElement.getAttribute("data-theme") || "light";
      const nextTheme = currentTheme === "light" ? "dark" : "light";

      document.documentElement.setAttribute("data-theme", nextTheme);
      localStorage.setItem("theme", nextTheme);
      localStorage.setItem("portfolio_theme", nextTheme);
      updateThemeIcon(nextTheme === "dark");
    });
  }
}

function updateThemeIcon(isDark) {
  const themeBtn = document.getElementById("theme-toggle");
  if (!themeBtn) return;

  // CSS handles showing/hiding the sun/moon icons via .icon-dark/.icon-light classes
  // Just update the button title/aria-label
  const isEn = document.documentElement.lang === "en" || window.location.pathname.includes("_en.html");

  themeBtn.title = isDark
    ? (isEn ? "Switch to light mode" : "Mudar para modo claro")
    : (isEn ? "Switch to dark mode" : "Mudar para modo escuro");
  themeBtn.setAttribute("aria-label", themeBtn.title);
}

function configurarMenuMobile() {
  const botaoMenu = document.querySelector(".menu-toggle");
  const menuNav = document.querySelector(".nav");

  if (!botaoMenu || !menuNav) return;

  botaoMenu.addEventListener("click", function (e) {
    e.stopPropagation();
    menuNav.classList.toggle("aberto");
  });

  menuNav.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
      menuNav.classList.remove("aberto");
    });
  });

  document.addEventListener("click", function (e) {
    if (!menuNav.contains(e.target) && !botaoMenu.contains(e.target)) {
      menuNav.classList.remove("aberto");
    }
  });
}

function obterCategoriaExibida(jogo, isEn) {
  if (!isEn) return jogo.categoria;

  const traducoes = {
    "Ação/Aventura": "Action/Adventure",
    "Plataforma/Indie": "Platformer/Indie",
    "Tiro (FPS/TPS)": "Shooter (FPS/TPS)",
    "RPG (Role-Playing Game)": "RPG",
    "Aventura/Indie": "Adventure/Indie",
    "Simulação": "Simulation",
    "Aventura/Sandbox": "Adventure/Sandbox",
    "Sobrevivência": "Survival",
    "Puzzle": "Puzzle",
    "Estratégia/Simulação": "Strategy/Simulation",
    "Terror": "Horror",
    "Esportes/Corrida": "Sports/Racing"
  };

  return traducoes[jogo.categoria] || jogo.categoria_en || jogo.categoria;
}

function obterTituloNormalizado(titulo) {
  return (titulo || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();
}

function pontuarFichaJogo(jogo) {
  let pontuacao = 0;
  if (jogo.descricaoCurta && !descricaoDeJogoEhGenerica(jogo.descricaoCurta)) pontuacao += 2;
  if (jogo.descricaoLonga && !descricaoDeJogoEhGenerica(jogo.descricaoLonga)) pontuacao += 2;
  if (jogo.desenvolvedora && !jogo.desenvolvedora.toLowerCase().startsWith("estúdio reconhecido da indústria")) pontuacao += 1;
  if (jogo.plataformas && jogo.plataformas !== "PC, PlayStation, Xbox") pontuacao += 1;
  if (jogo.idiomas_en && jogo.idiomas_en !== "English, Portuguese (Brazil)") pontuacao += 1;
  if (jogo.trailer || jogo.trailerUrl) pontuacao += 2;
  return pontuacao;
}

function obterCatalogoUnico(jogos) {
  const jogosPorTitulo = new Map();

  jogos.forEach(jogo => {
    const chave = obterTituloNormalizado(jogo.nome);
    const atual = jogosPorTitulo.get(chave);
    if (!atual || pontuarFichaJogo(jogo) > pontuarFichaJogo(atual)) {
      jogosPorTitulo.set(chave, jogo);
    }
  });

  return Array.from(jogosPorTitulo.values()).sort((a, b) => a.id - b.id);
}

const GAME_DB_API = "https://app.lizardbyte.dev/GameDB";
const gameDbBuckets = new Map();
const gameDbGames = new Map();

function normalizarBuscaGameDb(texto) {
  return (texto || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
}

function obterBucketGameDb(termo) {
  const inicial = normalizarBuscaGameDb(termo).match(/[a-z0-9]/g) || [];
  return inicial.length >= 2 ? inicial.slice(0, 2).join("") : inicial[0] || "@";
}

function mapearCategoriaGameDb(generos = []) {
  const nomes = generos.map(genero => (genero.name || "").toLowerCase());
  if (nomes.some(nome => nome.includes("role-playing") || nome === "rpg")) return "RPG (Role-Playing Game)";
  if (nomes.some(nome => nome.includes("shooter"))) return "Tiro (FPS/TPS)";
  if (nomes.some(nome => nome.includes("strategy") || nome.includes("simulation"))) return "Estratégia/Simulação";
  if (nomes.some(nome => nome.includes("sport") || nome.includes("racing"))) return "Esportes/Corrida";
  if (nomes.some(nome => nome.includes("platform") || nome.includes("indie") || nome.includes("puzzle"))) return "Plataforma/Indie";
  if (nomes.some(nome => nome.includes("action") || nome.includes("adventure"))) return "Ação/Aventura";
  return generos[0]?.name || "Game";
}

function normalizarJogoGameDb(jogo) {
  const nome = jogo.name || "Untitled game";
  const capaUrl = jogo.cover?.url ? `https:${jogo.cover.url}`.replace("/t_thumb/", "/t_cover_big/") : "";
  const artworkUrl = jogo.artworks?.[0]?.url ? `https:${jogo.artworks[0].url}`.replace("/t_thumb/", "/t_720p/") : capaUrl;
  const dataLancamento = (jogo.release_dates || [])
    .map(data => data.date)
    .filter(Number.isFinite)
    .sort((a, b) => a - b)[0];
  const anoLancamento = dataLancamento ? new Date(dataLancamento * 1000).getFullYear() : null;
  const desenvolvedora = (jogo.involved_companies || []).find(item => item.developer)?.company?.name || "";
  const categoria = mapearCategoriaGameDb(jogo.genres || []);
  const video = (jogo.videos || []).find(item => item.url);
  const nota = Number.isFinite(jogo.rating) ? Math.min(5, Math.round(jogo.rating / 20 * 10) / 10) : null;

  return {
    id: Number(jogo.id),
    nome,
    nome_en: nome,
    categoria,
    categoria_en: categoria,
    imagem: capaUrl,
    fundo: artworkUrl,
    lancado: !anoLancamento || anoLancamento <= new Date().getFullYear(),
    lancamento: anoLancamento ? String(anoLancamento) : "TBA",
    nota,
    descricaoCurta: jogo.summary || "",
    descricaoCurta_en: jogo.summary || "",
    descricaoLonga: jogo.summary || "",
    descricaoLonga_en: jogo.summary || "",
    desenvolvedora,
    plataformas: "",
    idiomas: "",
    idiomas_en: "",
    trailerUrl: video?.url || "",
    fonteGameDb: true
  };
}

async function buscarIndiceGameDb(termo) {
  const bucket = obterBucketGameDb(termo);
  if (!gameDbBuckets.has(bucket)) {
    const response = await fetch(`${GAME_DB_API}/buckets/${encodeURIComponent(bucket)}.json`);
    if (!response.ok) throw new Error(`GameDB index returned ${response.status}`);
    gameDbBuckets.set(bucket, await response.json());
  }
  return gameDbBuckets.get(bucket);
}

async function buscarJogoGameDb(id) {
  const gameId = Number(id);
  if (!Number.isInteger(gameId) || gameId <= 0) return null;

  if (!gameDbGames.has(gameId)) {
    const response = await fetch(`${GAME_DB_API}/games/${gameId}.json`);
    if (!response.ok) throw new Error(`GameDB game request returned ${response.status}`);
    gameDbGames.set(gameId, await response.json());
  }
  return normalizarJogoGameDb(gameDbGames.get(gameId));
}

async function buscarJogosGameDb(termo, limite = 8) {
  const consulta = normalizarBuscaGameDb(termo);
  if (consulta.replace(/[^a-z0-9]/g, "").length < 2) return [];

  const indice = await buscarIndiceGameDb(termo);
  const correspondencias = Object.entries(indice)
    .filter(([, jogo]) => normalizarBuscaGameDb(jogo.name).startsWith(consulta))
    .sort(([, a], [, b]) => a.name.localeCompare(b.name))
    .slice(0, limite);

  const resultados = await Promise.allSettled(correspondencias.map(([id]) => buscarJogoGameDb(id)));
  return resultados
    .filter(resultado => resultado.status === "fulfilled" && resultado.value)
    .map(resultado => resultado.value);
}

function criarCardJogo(jogo) {
  const favoritado = typeof ehFavorito === "function" && ehFavorito(jogo.id);
  const isEn = document.documentElement.lang === "en" || window.location.pathname.includes("_en.html");

  const nomeExibido = isEn ? (jogo.nome_en || jogo.nome) : jogo.nome;
  const categoriaExibida = obterCategoriaExibida(jogo, isEn);
  const descricaoExibida = isEn ? (jogo.descricaoCurta_en || jogo.descricaoCurta) : jogo.descricaoCurta;
  const mostrarDescricao = descricaoExibida && !descricaoDeJogoEhGenerica(descricaoExibida);
  const mostrarDesenvolvedora = jogo.desenvolvedora
    && !jogo.desenvolvedora.toLowerCase().startsWith("estúdio reconhecido da indústria");
  const fonte = jogo.fonteGameDb ? "&source=gamedb" : "";
  const linkJogo = isEn ? `jogo_en.html?id=${jogo.id}${fonte}` : `jogo.html?id=${jogo.id}${fonte}`;

  const ehLancado = jogo.lancado !== false;
  const notaValida = Number.isFinite(jogo.nota);

  return `
    <div class="card-jogo">
      <a href="${linkJogo}" style="display: flex; flex-direction: column; height: 100%; text-decoration: none; color: inherit;">
        <div class="card-jogo-capa">
          <span class="card-jogo-categoria">${escapeHtml(categoriaExibida)}</span>
          <img src="${jogo.imagem}" alt="${escapeHtml(nomeExibido)}" onerror="this.onerror=null;this.src='https://cdn.cloudflare.steamstatic.com/steam/apps/292030/library_600x900_2x.jpg';" />
        </div>
        <div class="card-jogo-corpo">
          <h3>${escapeHtml(nomeExibido)}</h3>
          ${mostrarDescricao ? `<p>${escapeHtml(descricaoExibida)}</p>` : ""}
          <div class="card-jogo-nota">
            ${ehLancado && notaValida
              ? `<span>⭐ <span class="nota">${jogo.nota}</span></span>` 
              : ehLancado
                ? `<span style="color: var(--texto-fraco); font-size: 11px;">${isEn ? 'Released' : 'Lançado'}</span>`
                : `<span style="color: var(--laranja); font-weight: 600; font-size: 11px;"><i class="fa-solid fa-clock"></i> ${isEn ? 'Upcoming (' + jogo.lancamento + ')' : 'Em Breve (' + jogo.lancamento + ')'}</span>`
            }
            ${mostrarDesenvolvedora ? `<span style="color: var(--texto-fraco); font-size: 11px;">${escapeHtml(jogo.desenvolvedora)}</span>` : ""}
          </div>
        </div>
      </a>
      ${jogo.fonteGameDb ? "" : `<button class="btn-fav-card ${favoritado ? 'ativo' : ''}" onclick="toggleFavCard(event, ${jogo.id})" title="${favoritado ? (isEn ? 'Remove from favorites' : 'Remover dos favoritos') : (isEn ? 'Save to favorites' : 'Salvar nos favoritos')}">
        <i class="${favoritado ? 'fa-solid' : 'fa-regular'} fa-heart"></i>
      </button>`}
    </div>
  `;
}

window.toggleFavCard = function (event, id) {
  event.preventDefault();
  event.stopPropagation();

  if (typeof alternarFavorito === "function") {
    const isFav = alternarFavorito(id);
    const btn = event.currentTarget;
    if (btn) {
      btn.classList.toggle("ativo", isFav);
      btn.innerHTML = `<i class="${isFav ? 'fa-solid' : 'fa-regular'} fa-heart"></i>`;
    }
    if (typeof atualizarInterfaceAuth === "function") {
      atualizarInterfaceAuth();
    }
  }
};

function mostrarJogos(jogos, idDoElemento) {
  const elemento = document.getElementById(idDoElemento);
  if (!elemento) return;

  if (!jogos || jogos.length === 0) {
    const isEn = document.documentElement.lang === "en" || window.location.pathname.includes("_en.html");
    elemento.innerHTML = `
      <div style="grid-column: 1 / -1; padding: 48px 0; text-align: center; color: var(--texto-fraco);">
        <i class="fa-solid fa-gamepad" style="font-size: 36px; margin-bottom: 12px; opacity: 0.5;"></i>
        <p>${isEn ? 'No games found matching your search.' : 'Nenhum jogo encontrado com os filtros selecionados.'}</p>
      </div>
    `;
    return;
  }

  elemento.innerHTML = jogos.map(criarCardJogo).join("");
}

function configurarCatalogo() {
  const gradeCatalogo = document.getElementById("grid-catalogo");
  if (!gradeCatalogo || typeof listaDeJogos === "undefined") return;

  if (typeof window.atualizarCatalogo === "function") {
    window.atualizarCatalogo();
    return;
  }

  const jogosDisponiveis = () => obterCatalogoUnico(window.listaDeJogos || listaDeJogos);

  const campoBusca = document.getElementById("campo-busca");
  const botoesFiltro = document.querySelectorAll(".filtro-btn");
  const contador = document.getElementById("catalogo-stats");
  const paginacao = document.getElementById("paginacao");
  const gameDbSection = document.getElementById("gamedb-section");
  const gameDbResults = document.getElementById("gamedb-results");
  const gameDbStatus = document.getElementById("gamedb-status");
  const isEn = document.documentElement.lang === "en" || window.location.pathname.includes("_en.html");
  const jogosPorPagina = 20;

  let categoriaAtiva = "todos";
  let termoBusca = "";
  let paginaAtual = 1;
  let jogosGameDbAtuais = [];
  let gameDbRequestId = 0;
  let gameDbTimeout;

  function renderizarResultadosGameDb(mensagem = "") {
    if (!gameDbSection || !gameDbResults || !gameDbStatus) return;

    const filtrados = categoriaAtiva === "todos"
      ? jogosGameDbAtuais
      : jogosGameDbAtuais.filter(jogo => {
          const categoria = obterCategoriaExibida(jogo, isEn).toLowerCase();
          return categoria.includes(categoriaAtiva.toLowerCase());
        });

    mostrarJogos(filtrados, "gamedb-results");
    gameDbStatus.textContent = mensagem || (isEn
      ? `${filtrados.length} additional GameDB result${filtrados.length === 1 ? "" : "s"}.`
      : `${filtrados.length} resultado${filtrados.length === 1 ? "" : "s"} adicional(is) do GameDB.`);
  }

  function buscarResultadosGameDb() {
    if (!gameDbSection || !gameDbResults || !gameDbStatus) return;

    const consulta = termoBusca;
    const consultaNormalizada = normalizarBuscaGameDb(consulta).replace(/[^a-z0-9]/g, "");
    const requestId = ++gameDbRequestId;
    window.clearTimeout(gameDbTimeout);

    if (consultaNormalizada.length < 2) {
      jogosGameDbAtuais = [];
      gameDbSection.hidden = true;
      return;
    }

    gameDbSection.hidden = false;
    gameDbResults.innerHTML = "";
    gameDbStatus.textContent = isEn ? "Searching GameDB..." : "Pesquisando no GameDB...";

    gameDbTimeout = window.setTimeout(async () => {
      try {
        const jogos = await buscarJogosGameDb(consulta);
        if (requestId !== gameDbRequestId) return;

        jogosGameDbAtuais = jogos;
        const mensagem = jogos.length
          ? ""
          : (isEn ? "No GameDB games found with that title prefix." : "Nenhum jogo do GameDB encontrado começando com esse título.");
        renderizarResultadosGameDb(mensagem);
      } catch (error) {
        if (requestId !== gameDbRequestId) return;
        jogosGameDbAtuais = [];
        gameDbResults.innerHTML = "";
        gameDbStatus.textContent = isEn
          ? "GameDB could not be reached. Local catalog results are still available."
          : "Não foi possível acessar o GameDB. Os resultados do catálogo local continuam disponíveis.";
        console.error("Erro ao consultar GameDB:", error);
      }
    }, 350);
  }

  function renderizarPaginacao(totalDePaginas) {
    if (!paginacao) return;

    if (totalDePaginas <= 1) {
      paginacao.innerHTML = "";
      return;
    }

    const paginas = Array.from({ length: totalDePaginas }, (_, indice) => indice + 1);
    paginacao.innerHTML = `
      <button class="pagina-btn" data-pagina="${paginaAtual - 1}" ${paginaAtual === 1 ? "disabled" : ""} aria-label="${isEn ? "Previous page" : "Página anterior"}">
        <i class="fa-solid fa-chevron-left"></i> ${isEn ? "Previous" : "Anterior"}
      </button>
      <div class="pagina-numeros">
        ${paginas.map(pagina => `<button class="pagina-btn pagina-numero ${pagina === paginaAtual ? "ativo" : ""}" data-pagina="${pagina}" aria-current="${pagina === paginaAtual ? "page" : "false"}">${pagina}</button>`).join("")}
      </div>
      <button class="pagina-btn" data-pagina="${paginaAtual + 1}" ${paginaAtual === totalDePaginas ? "disabled" : ""} aria-label="${isEn ? "Next page" : "Próxima página"}">
        ${isEn ? "Next" : "Próxima"} <i class="fa-solid fa-chevron-right"></i>
      </button>
    `;

    paginacao.querySelectorAll("[data-pagina]").forEach(botao => {
      botao.addEventListener("click", () => {
        paginaAtual = Number(botao.dataset.pagina);
        aplicarFiltros();
        gradeCatalogo.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
  }

  function aplicarFiltros() {
    const jogos = jogosDisponiveis();
    let filtrados = jogos;

    if (categoriaAtiva !== "todos") {
      filtrados = filtrados.filter(j => {
        const catPt = (j.categoria || "").toLowerCase();
        const catEn = (j.categoria_en || "").toLowerCase();
        const catAlvo = categoriaAtiva.toLowerCase();
        const categoriaTraduzida = obterCategoriaExibida(j, true).toLowerCase();
        return catPt.includes(catAlvo) || catEn.includes(catAlvo) || categoriaTraduzida.includes(catAlvo);
      });
    }

    if (termoBusca) {
      filtrados = filtrados.filter(j => 
        (j.nome && j.nome.toLowerCase().includes(termoBusca)) ||
        (j.nome_en && j.nome_en.toLowerCase().includes(termoBusca)) ||
        (j.desenvolvedora && j.desenvolvedora.toLowerCase().includes(termoBusca)) ||
        (j.descricaoCurta && j.descricaoCurta.toLowerCase().includes(termoBusca)) ||
        (j.descricaoCurta_en && j.descricaoCurta_en.toLowerCase().includes(termoBusca))
      );
    }

    const totalDePaginas = Math.max(1, Math.ceil(filtrados.length / jogosPorPagina));
    paginaAtual = Math.min(paginaAtual, totalDePaginas);
    const inicio = (paginaAtual - 1) * jogosPorPagina;
    mostrarJogos(filtrados.slice(inicio, inicio + jogosPorPagina), "grid-catalogo");
    renderizarPaginacao(totalDePaginas);

    if (contador) {
      contador.textContent = isEn
        ? `Showing ${filtrados.length ? inicio + 1 : 0}-${Math.min(inicio + jogosPorPagina, filtrados.length)} of ${filtrados.length} games | Page ${paginaAtual} of ${totalDePaginas}`
        : `Exibindo ${filtrados.length ? inicio + 1 : 0}-${Math.min(inicio + jogosPorPagina, filtrados.length)} de ${filtrados.length} jogos | Página ${paginaAtual} de ${totalDePaginas}`;
    }
  }

  window.atualizarCatalogo = aplicarFiltros;

  if (botoesFiltro) {
    botoesFiltro.forEach(botao => {
      botao.addEventListener("click", () => {
        botoesFiltro.forEach(b => b.classList.remove("ativo"));
        botao.classList.add("ativo");
        categoriaAtiva = botao.dataset.categoria;
        paginaAtual = 1;
        aplicarFiltros();
        renderizarResultadosGameDb();
      });
    });
  }

  if (campoBusca) {
    campoBusca.addEventListener("input", (e) => {
      termoBusca = e.target.value.toLowerCase().trim();
      paginaAtual = 1;
      aplicarFiltros();
      buscarResultadosGameDb();
    });
  }

  aplicarFiltros();
}

function criarCardNoticia(noticia) {
  const isEn = document.documentElement.lang === "en" || window.location.pathname.includes("_en.html");
  let linkDaNoticia = "";
  try {
    const link = new URL(noticia.link);
    if (link.protocol === "https:") linkDaNoticia = link.href;
  } catch {
    linkDaNoticia = "";
  }

  return `
    <article class="card-noticia">
      <div>
        <div class="card-noticia-header">
          <span class="card-noticia-data">${escapeHtml(noticia.data)}</span>
          <span class="card-noticia-source">${escapeHtml(noticia.fonte)}</span>
        </div>
        <h3>${escapeHtml(noticia.titulo)}</h3>
        <p>${escapeHtml(noticia.resumo)}</p>
      </div>
      ${linkDaNoticia ? `
        <a href="${linkDaNoticia}" target="_blank" rel="noopener noreferrer" class="card-noticia-link">
          ${isEn ? 'Read full article' : 'Ler matéria completa'} →
        </a>
      ` : ""}
    </article>
  `;
}

async function carregarEExibirNoticias(idDoElemento, limite = null, atualizar = false) {
  const elemento = document.getElementById(idDoElemento);
  if (!elemento) return;

  const isEn = document.documentElement.lang === "en" || window.location.pathname.includes("_en.html");

  elemento.innerHTML = `
    <div style="grid-column: 1 / -1; padding: 24px; text-align: center; color: var(--texto-fraco);">
      <i class="fa-solid fa-spinner fa-spin" style="font-size: 24px; margin-bottom: 8px;"></i>
      <p>${isEn ? "Loading real-time gaming news..." : "Carregando notícias em tempo real..."}</p>
    </div>
  `;

  let noticias = [];
  if (typeof buscarNoticiasTempoReal !== "function") {
    console.error("News feed loader is unavailable.");
  } else {
    try {
      noticias = await buscarNoticiasTempoReal(isEn, atualizar);
    } catch (erro) {
      console.error("Não foi possível carregar as notícias:", erro);
    }
  }

  if (!Array.isArray(noticias) || noticias.length === 0) {
    elemento.innerHTML = `
      <p class="news-empty-state" role="status">
        ${isEn ? "News are temporarily unavailable. Please try again later." : "As notícias estão temporariamente indisponíveis. Tente novamente mais tarde."}
      </p>
    `;
    return;
  }

  if (limite && noticias.length > limite) {
    noticias = noticias.slice(0, limite);
  }

  elemento.innerHTML = noticias.map(criarCardNoticia).join("");
}

function escapeHtml(text) {
  if (!text) return "";
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function descricaoDeJogoEhGenerica(texto) {
  const descricao = (texto || "").trim().toLowerCase();
  return descricao.startsWith("um dos jogos mais famosos do gênero ")
    || descricao.startsWith("one of the most famous games in the ")
    || (descricao.startsWith("explore ") && descricao.includes(" em uma experiência marcante para fãs de videogames."))
    || (descricao.startsWith("experience ") && descricao.includes(", a memorable game for fans around the world."));
}

document.addEventListener("DOMContentLoaded", function () {
  initThemeGamehub();
  configurarMenuMobile();
  configurarFormularioContato();

  const gradeDestaque = document.getElementById("jogos-destaque");
  if (gradeDestaque && typeof listaDeJogos !== "undefined") {
    mostrarJogos(obterCatalogoUnico(listaDeJogos).slice(0, 8), "jogos-destaque");
  }

  const noticiasDestaque = document.getElementById("grade-noticias-destaque");
  if (noticiasDestaque) {
    carregarEExibirNoticias("grade-noticias-destaque", 4);
  }

  const noticiasCompleta = document.getElementById("grade-noticias-completa");
  if (noticiasCompleta) {
    carregarEExibirNoticias("grade-noticias-completa");
  }

  const btnRefreshNews = document.getElementById("btn-refresh-news");
  if (btnRefreshNews) {
    btnRefreshNews.addEventListener("click", async () => {
      btnRefreshNews.disabled = true;
      try {
        await carregarEExibirNoticias("grade-noticias-completa", null, true);
      } finally {
        btnRefreshNews.disabled = false;
      }
    });
  }

  configurarCatalogo();

});

function configurarFormularioContato() {
  const form = document.getElementById("form-contato");
  if (!form) return;

  const isEn = document.documentElement.lang === "en";
  const feedback = document.getElementById("form-feedback");

  form.addEventListener("submit", event => {
    event.preventDefault();

    const formData = new FormData(form);
    const nome = String(formData.get("nome") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const assunto = String(formData.get("assunto") || "").trim();
    const mensagem = String(formData.get("mensagem") || "").trim();
    const corpo = isEn
      ? `Name: ${nome}\nEmail: ${email}\n\n${mensagem}`
      : `Nome: ${nome}\nE-mail: ${email}\n\n${mensagem}`;
    const mailto = `mailto:jonathanalexandre2910@gmail.com?subject=${encodeURIComponent(assunto)}&body=${encodeURIComponent(corpo)}`;

    if (feedback) {
      feedback.textContent = isEn
        ? "Your email app will open with the message ready. Please send it from there."
        : "Seu aplicativo de e-mail será aberto com a mensagem pronta. Finalize o envio por lá.";
      feedback.style.color = "var(--verde)";
    }

    window.location.href = mailto;
  });
}