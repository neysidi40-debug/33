/* ==========================================================================
   SCRIPT PRINCIPAL
   Lê os dados de diario-dados.js e galeria-dados.js e monta o HTML.
   Não precisa editar este arquivo para adicionar posts ou fotos — só os
   arquivos de dados.
   ========================================================================== */

function escapeHTML(texto) {
  const div = document.createElement("div");
  div.textContent = texto;
  return div.innerHTML;
}

function cartaoEntrada(post) {
  const tags = (post.tags || [])
    .map((t) => `<span class="tag">${escapeHTML(t)}</span>`)
    .join("");
  return `
    <article class="entrada fade-in">
      <span class="entrada-data">${escapeHTML(post.data)}</span>
      <h3><a href="postagem.html?id=${encodeURIComponent(post.id)}">${escapeHTML(post.titulo)}</a></h3>
      <p>${escapeHTML(post.resumo)}</p>
      <p class="post-humor">${escapeHTML(post.humor || "")}</p>
      <div class="entrada-tags">${tags}</div>
    </article>
  `;
}

function renderListaEntradas(seletor, limite) {
  const container = document.querySelector(seletor);
  if (!container) return;

  const lista = typeof limite === "number" ? POSTAGENS.slice(0, limite) : POSTAGENS;

  if (lista.length === 0) {
    container.innerHTML = `<p class="vazio">no posts yet.</p>`;
    return;
  }

  container.innerHTML = lista.map(cartaoEntrada).join("");
}

function renderChangelog(seletor, limite) {
  const container = document.querySelector(seletor);
  if (!container || typeof ATUALIZACOES === "undefined") return;

  const lista = typeof limite === "number" ? ATUALIZACOES.slice(0, limite) : ATUALIZACOES;
  container.innerHTML = lista.map((atualizacao) => `
    <div class="changelog-item">
      <strong>${escapeHTML(atualizacao.data)}</strong>
      <p>${escapeHTML(atualizacao.texto)}</p>
    </div>
  `).join("");
}

function renderPostagemCompleta(seletor) {
  const container = document.querySelector(seletor);
  if (!container) return;

  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  const post = POSTAGENS.find((p) => p.id === id);

  if (!post) {
    container.innerHTML = `
      <a class="voltar-link" href="diario.html">&larr; voltar ao diário</a>
      <p class="vazio">não encontrei este post.</p>
    `;
    return;
  }

  const tags = (post.tags || [])
    .map((t) => `<span class="tag">${escapeHTML(t)}</span>`)
    .join("");
  const paragrafos = (post.corpo || [])
    .map((p) => `<p>${escapeHTML(p)}</p>`)
    .join("");

  container.innerHTML = `
    <a class="voltar-link" href="diario.html">&larr; voltar ao diário</a>
    <div class="entrada-completa fade-in">
      <span class="entrada-data">${escapeHTML(post.data)}</span>
      <h1>${escapeHTML(post.titulo)}</h1>
      <p class="post-humor">${escapeHTML(post.humor || "")}</p>
      <div class="corpo">${paragrafos}</div>
      <div class="entrada-tags">${tags}</div>
    </div>
  `;

  document.title = `${post.titulo} — Diário`;
}

function renderGaleria(seletor) {
  const container = document.querySelector(seletor);
  if (!container) return;

  if (FOTOS.length === 0) {
    container.innerHTML = `<p class="vazio">no pictures yet.</p>`;
    return;
  }

  container.innerHTML = FOTOS.map(
    (foto, i) => `
      <figure class="polaroide" data-indice="${i}">
        <div class="foto-wrap">
          <img src="${escapeHTML(versaoFoto(foto.src, "mini"))}" alt="${escapeHTML(foto.legenda)}"
               loading="${i < 6 ? "eager" : "lazy"}" decoding="async" width="600" height="600">
        </div>
        <figcaption class="legenda">${escapeHTML(foto.legenda)}</figcaption>
      </figure>
    `
  ).join("");

  // foto nova sem versão leve ainda (falta rodar "npm run fotos"): usa o original
  container.querySelectorAll(".foto-wrap img").forEach((img, i) => {
    img.addEventListener("error", () => { img.src = FOTOS[i].src; }, { once: true });
    if (img.complete && img.naturalWidth) img.classList.add("carregada");
    else img.addEventListener("load", () => img.classList.add("carregada"), { once: true });
  });

  configurarLightbox(container);
}

/* Caminho da versão otimizada (gerada por ferramentas/otimizar-fotos.js).
   versaoFoto("imagens/IMG_1.jpg", "mini") → "imagens/mini/IMG_1.webp" */
function versaoFoto(src, pasta) {
  const barra = src.lastIndexOf("/");
  const nome = src.slice(barra + 1).replace(/\.[^.]+$/, "");
  return `${src.slice(0, barra)}/${pasta}/${nome}.webp`;
}

function configurarLightbox(grade) {
  const lightbox = document.querySelector(".lightbox");
  if (!lightbox) return;

  const imgLightbox = lightbox.querySelector("img");
  const legendaLightbox = lightbox.querySelector(".legenda");
  const botaoFechar = lightbox.querySelector(".lightbox-fechar");

  grade.querySelectorAll(".polaroide").forEach((el) => {
    el.addEventListener("click", () => {
      const foto = FOTOS[Number(el.dataset.indice)];
      // mostra a miniatura na hora e troca pela versão grande quando ela chegar
      const miniatura = el.querySelector("img");
      imgLightbox.src = miniatura.currentSrc || miniatura.src;
      const grande = new Image();
      grande.onload = () => { if (imgLightbox.dataset.atual === foto.src) imgLightbox.src = grande.src; };
      grande.onerror = () => { if (imgLightbox.dataset.atual === foto.src) imgLightbox.src = foto.src; };
      imgLightbox.dataset.atual = foto.src;
      grande.src = versaoFoto(foto.src, "grande");
      imgLightbox.alt = foto.legenda;
      legendaLightbox.textContent = foto.legenda;
      lightbox.classList.add("aberto");
      document.body.classList.add("lightbox-aberto");
      // segredo: a 33ª foto guarda o fragmento 2 da sala secreta
      if (Number(el.dataset.indice) === 32 && window.k4puFragmento) {
        setTimeout(() => window.k4puFragmento(2), 900);
      }
    });
  });

  function fechar() {
    lightbox.classList.remove("aberto");
    document.body.classList.remove("lightbox-aberto");
  }

  botaoFechar.addEventListener("click", fechar);
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) fechar();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") fechar();
  });
}

const idMusicaYoutube = 'Bm2Eg2X4kZA';

function abrirMusicaGaleria() {
  window.open(`https://www.youtube.com/watch?v=${idMusicaYoutube}`, '_blank', 'noopener');
}

function iniciarChuvaCodigo() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const canvas = document.createElement('canvas');
  canvas.className = 'codigo-chuva';
  canvas.setAttribute('aria-hidden', 'true');
  document.body.prepend(canvas);

  // o tema atual esconde a chuva pelo CSS: aí nem começa a desenhar (economiza CPU)
  if (getComputedStyle(canvas).display === 'none') {
    canvas.remove();
    return;
  }

  const contexto = canvas.getContext('2d');
  const caracteres = '01{}[]<>/\\;:=+$#@ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const tamanho = 15;
  let colunas = 0;
  let gotas = [];

  function redimensionar() {
    const escala = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * escala;
    canvas.height = window.innerHeight * escala;
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    contexto.setTransform(escala, 0, 0, escala, 0, 0);
    colunas = Math.ceil(window.innerWidth / tamanho);
    gotas = Array.from({ length: colunas }, () => Math.random() * -40);
  }

  function desenhar() {
    contexto.fillStyle = 'rgba(17, 24, 39, 0.09)';
    contexto.fillRect(0, 0, window.innerWidth, window.innerHeight);
    contexto.font = `${tamanho}px "Space Mono", monospace`;

    gotas.forEach((posicao, coluna) => {
      const caractere = caracteres[Math.floor(Math.random() * caracteres.length)];
      const x = coluna * tamanho;
      const y = posicao * tamanho;
      contexto.fillStyle = coluna % 7 === 0 ? '#72f1b8' : '#64d8ff';
      contexto.globalAlpha = 0.24;
      contexto.fillText(caractere, x, y);
      contexto.globalAlpha = 1;

      gotas[coluna] = posicao > window.innerHeight / tamanho + 20 && Math.random() > 0.975
        ? 0
        : posicao + 0.45;
    });

    window.requestAnimationFrame(desenhar);
  }

  redimensionar();
  window.addEventListener('resize', redimensionar);
  desenhar();
}

/* Marca o link de navegação da página atual */
function marcarNavAtiva() {
  const pagina = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-principal a").forEach((link) => {
    if (link.getAttribute("href") === pagina) {
      link.classList.add("ativo");
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  marcarNavAtiva();
  iniciarChuvaCodigo();
  const controleMusica = document.querySelector('.musica-controle');
  if (controleMusica) controleMusica.addEventListener('click', abrirMusicaGaleria);
});
