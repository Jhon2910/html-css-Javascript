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
  const icon = themeBtn.querySelector("i");
  if (!icon) return;

  if (isDark) {
    icon.className = "fa-regular fa-sun";
    themeBtn.title = document.documentElement.lang === "en" ? "Switch to light mode" : "Mudar para modo claro";
  } else {
    icon.className = "fa-regular fa-moon";
    themeBtn.title = document.documentElement.lang === "en" ? "Switch to dark mode" : "Mudar para modo escuro";
  }
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

function criarCardJogo(jogo) {
  const favoritado = typeof ehFavorito === "function" && ehFavorito(jogo.id);
  const isEn = document.documentElement.lang === "en" || window.location.pathname.includes("_en.html");

  const nomeExibido = isEn ? (jogo.nome_en || jogo.nome) : jogo.nome;
  const categoriaExibida = isEn ? (jogo.categoria_en || jogo.categoria) : jogo.categoria;
  const descricaoExibida = isEn ? (jogo.descricaoCurta_en || jogo.descricaoCurta) : jogo.descricaoCurta;
  const linkJogo = isEn ? `jogo_en.html?id=${jogo.id}` : `jogo.html?id=${jogo.id}`;

  const ehLancado = jogo.lancado !== false && jogo.nota !== null;

  return `
    <div class="card-jogo">
      <a href="${linkJogo}" style="display: flex; flex-direction: column; height: 100%; text-decoration: none; color: inherit;">
        <div class="card-jogo-capa">
          <span class="card-jogo-categoria">${escapeHtml(categoriaExibida)}</span>
          <img src="${jogo.imagem}" alt="${escapeHtml(nomeExibido)}" onerror="this.onerror=null;this.src='https://cdn.cloudflare.steamstatic.com/steam/apps/292030/library_600x900_2x.jpg';" />
        </div>
        <div class="card-jogo-corpo">
          <h3>${escapeHtml(nomeExibido)}</h3>
          <p>${escapeHtml(descricaoExibida)}</p>
          <div class="card-jogo-nota">
            ${ehLancado 
              ? `<span>⭐ <span class="nota">${jogo.nota}</span></span>` 
              : `<span style="color: var(--laranja); font-weight: 600; font-size: 11px;"><i class="fa-solid fa-clock"></i> ${isEn ? 'Upcoming (' + jogo.lancamento + ')' : 'Em Breve (' + jogo.lancamento + ')'}</span>`
            }
            <span style="color: var(--texto-fraco); font-size: 11px;">${escapeHtml(jogo.desenvolvedora)}</span>
          </div>
        </div>
      </a>
      <button class="btn-fav-card ${favoritado ? 'ativo' : ''}" onclick="toggleFavCard(event, ${jogo.id})" title="${favoritado ? (isEn ? 'Remove from favorites' : 'Remover dos favoritos') : (isEn ? 'Save to favorites' : 'Salvar nos favoritos')}">
        <i class="${favoritado ? 'fa-solid' : 'fa-regular'} fa-heart"></i>
      </button>
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
  const gradeCatalogo = document.getElementById("grade-jogos-catalogo");
  if (!gradeCatalogo || typeof listaDeJogos === "undefined") return;

  if (typeof window.atualizarCatalogo === "function") {
    window.atualizarCatalogo();
    return;
  }

  const jogosDisponiveis = () => window.listaDeJogos || listaDeJogos;

  const campoBusca = document.getElementById("campo-busca");
  const botoesFiltro = document.querySelectorAll(".filtro-btn");
  const contador = document.getElementById("catalogo-contador");
  const paginacao = document.getElementById("paginacao-catalogo");
  const isEn = document.documentElement.lang === "en" || window.location.pathname.includes("_en.html");
  const jogosPorPagina = 20;

  let categoriaAtiva = "todos";
  let termoBusca = "";
  let paginaAtual = 1;

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
        return catPt.includes(catAlvo) || catEn.includes(catAlvo);
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
    mostrarJogos(filtrados.slice(inicio, inicio + jogosPorPagina), "grade-jogos-catalogo");
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
      });
    });
  }

  if (campoBusca) {
    campoBusca.addEventListener("input", (e) => {
      termoBusca = e.target.value.toLowerCase().trim();
      paginaAtual = 1;
      aplicarFiltros();
    });
  }

  aplicarFiltros();
}

function criarCardNoticia(noticia) {
  const isEn = document.documentElement.lang === "en" || window.location.pathname.includes("_en.html");
  const fonte = noticia.fonte || (isEn ? "GAMING RADAR" : "RADAR GAMER");

  return `
    <article class="card-noticia">
      <div>
        <div class="card-noticia-header">
          <span class="card-noticia-data">${escapeHtml(noticia.data)}</span>
          <span class="card-noticia-source"><i class="fa-solid fa-bolt"></i> ${escapeHtml(fonte)}</span>
        </div>
        <h3>${escapeHtml(noticia.titulo)}</h3>
        <p>${escapeHtml(noticia.resumo)}</p>
      </div>
      <a href="${noticia.link || '#'}" target="_blank" rel="noopener noreferrer" class="card-noticia-link">
        ${isEn ? 'Read full article on source' : 'Ler matéria completa na fonte'} →
      </a>
    </article>
  `;
}

async function carregarEExibirNoticias(idDoElemento, limite = null) {
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
  if (typeof buscarNoticiasTempoReal === "function") {
    noticias = await buscarNoticiasTempoReal(isEn);
  } else {
    noticias = isEn ? listaDeNoticiasEN : listaDeNoticiasPT;
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

document.addEventListener("DOMContentLoaded", function () {
  initThemeGamehub();
  configurarMenuMobile();

  const gradeDestaque = document.getElementById("grade-jogos-destaque");
  if (gradeDestaque && typeof listaDeJogos !== "undefined") {
    mostrarJogos(listaDeJogos.slice(0, 8), "grade-jogos-destaque");
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
    btnRefreshNews.addEventListener("click", () => {
      carregarEExibirNoticias("grade-noticias-completa");
    });
  }

  configurarCatalogo();

});