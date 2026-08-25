/* ==========================================================================
   SCRIPT PRINCIPAL
   Lê os dados de diario-dados.js e galeria-dados.js e monta o HTML.
   Não precisa editar este arquivo para adicionar posts ou fotos — só os
   arquivos de dados.

   OTIMIZAÇÃO DE IMAGENS
   As fotos originais (de celular) costumam vir muito pesadas. Em vez de
   carregar o arquivo original inteiro, a galeria pede uma versão já
   redimensionada e comprimida através do serviço gratuito wsrv.nl, que
   busca a foto original no seu GitHub Pages e devolve uma cópia menor.
   Isso deixa o carregamento bem mais rápido sem precisar editar as fotos.
   ========================================================================== */

/* Endereço base do seu site publicado — usado para montar a URL completa
   de cada foto (o serviço de otimização precisa da URL pública, não só
   do caminho relativo tipo "imagens/foto.jpg"). */
const BASE_URL_SITE = "https://neysidi40-debug.github.io/k4pu/";

function escapeHTML(texto) {
  const div = document.createElement("div");
  div.textContent = texto;
  return div.innerHTML;
}

/* Monta a URL otimizada de uma imagem.
   largura: tamanho máximo em pixels que a imagem vai ocupar na tela. */
function urlOtimizada(caminhoRelativo, largura) {
  const urlOriginal = BASE_URL_SITE + caminhoRelativo;
  const parametros = new URLSearchParams({
    url: urlOriginal,
    w: String(largura),
    q: "75",
    output: "webp",
  });
  return `https://wsrv.nl/?${parametros.toString()}`;
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
          <img
            src="${escapeHTML(urlOtimizada(foto.src, 500))}"
            alt="${escapeHTML(foto.legenda)}"
            loading="lazy"
            decoding="async"
          >
        </div>
        <figcaption class="legenda">${escapeHTML(foto.legenda)}</figcaption>
      </figure>
    `
  ).join("");

  configurarLightbox(container);
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
      /* No lightbox a foto aparece grande, então pedimos uma versão maior
         (1200px) — ainda bem mais leve que o arquivo original. */
      imgLightbox.src = urlOtimizada(foto.src, 1200);
      imgLightbox.alt = foto.legenda;
      legendaLightbox.textContent = foto.legenda;
      lightbox.classList.add("aberto");
      document.body.classList.add("lightbox-aberto");
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
