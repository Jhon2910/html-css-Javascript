class GameHubMediaPlayer {
  constructor(containerId, options = {}) {
    this.container = typeof containerId === "string" ? document.getElementById(containerId) : containerId;
    this.options = {
      autoplay: options.autoplay || false,
      muted: options.muted !== undefined ? options.muted : false,
      loop: options.loop || false,
      controls: options.controls !== undefined ? options.controls : true,
      poster: options.poster || "https://cdn.cloudflare.steamstatic.com/steam/apps/292030/library_600x900_2x.jpg",
      titulo: options.titulo || "Trailer Oficial",
      isEn: options.isEn || false,
      ...options
    };
  }

  static extrairYoutubeId(url) {
    if (!url) return "";
    const match = url.match(/(?:embed\/|v=|vi\/|youtu\.be\/|\/v\/|watch\?v=|&v=)([\w-]{11})/);
    return (match && match[1]) ? match[1] : (url.length === 11 ? url : "");
  }

  renderizarVideoNativo(videoUrl) {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="gamehub-media-frame">
        <video 
          class="gamehub-html5-player"
          ${this.options.controls ? "controls" : ""}
          ${this.options.autoplay ? "autoplay" : ""}
          ${this.options.muted ? "muted" : ""}
          ${this.options.loop ? "loop" : ""}
          playsinline
          poster="${this.options.poster}"
          preload="metadata"
        >
          <source src="${videoUrl}" type="video/webm">
          <source src="${videoUrl}" type="video/mp4">
          ${this.options.isEn ? 'Your browser does not support HTML5 video.' : 'Seu navegador não suporta a reprodução deste vídeo.'}
        </video>
      </div>
    `;
  }

  renderizarEmbed(youtubeIdOuUrl) {
    if (!this.container) return;

    const videoId = GameHubMediaPlayer.extrairYoutubeId(youtubeIdOuUrl);

    if (!videoId) {
      this.renderizarPosterFallback();
      return;
    }

    const params = new URLSearchParams({
      rel: "0",
      modestbranding: "1",
      playsinline: "1",
      enablejsapi: "1",
      origin: window.location.origin && window.location.origin !== "null" ? window.location.origin : "https://youtube-nocookie.com"
    });

    const embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?${params.toString()}`;

    this.container.innerHTML = `
      <div class="gamehub-media-frame">
        <iframe
          src="${embedUrl}"
          title="${this.options.titulo}"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerpolicy="strict-origin-when-cross-origin"
          allowfullscreen
          loading="lazy"
        ></iframe>
      </div>
    `;
  }

  renderizarPosterFallback() {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="gamehub-media-frame gamehub-poster-fallback" style="background-image: url('${this.options.poster}');">
        <div class="gamehub-poster-overlay">
          <span class="gamehub-poster-titulo">${this.options.titulo}</span>
          <span class="gamehub-trailer-unavailable">${this.options.isEn ? 'Trailer unavailable for in-page playback.' : 'Trailer indisponível para reprodução nesta página.'}</span>
        </div>
      </div>
    `;
  }

  carregarMidia(fonteVideo) {
    if (!fonteVideo) {
      this.renderizarPosterFallback();
      return;
    }

    const fonte = fonteVideo.trim();

    if (fonte.endsWith(".mp4") || fonte.endsWith(".webm") || fonte.includes("/video/") || fonte.includes("steamstatic.com")) {
      this.renderizarVideoNativo(fonte);
    } else if (fonte.includes("youtube") || fonte.includes("youtu.be") || fonte.length === 11) {
      this.renderizarEmbed(fonte);
    } else {
      this.renderizarPosterFallback();
    }
  }
}

window.GameHubMediaPlayer = GameHubMediaPlayer;
