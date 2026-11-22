/* ==========================================================================
   TRANSIÇÕES ENTRE PÁGINAS
   Ao clicar num link do site, uma "cortina" de terminal cobre a tela antes
   de trocar de página; a página nova termina a animação (ver js/tema.js).
   Estilos: cortina (padrão), glitch (arquivos corrompidos), dobra (universo).
   ========================================================================== */

(function () {
  const raiz = document.documentElement;
  const semMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const CLASSES_ENTRADA = ['entrando', 'entrada-cortina', 'entrada-glitch', 'entrada-dobra'];
  let timerEntrada = null;

  // a animação de entrada roda uma vez só
  function limparEntrada() {
    clearTimeout(timerEntrada);
    timerEntrada = setTimeout(() => raiz.classList.remove(...CLASSES_ENTRADA), 1400);
  }
  limparEntrada();

  function animarEntrada(estilo) {
    if (semMovimento) return;
    raiz.classList.remove(...CLASSES_ENTRADA);
    void raiz.offsetWidth; // reinicia as animações
    raiz.classList.add('entrando', 'entrada-' + estilo);
    limparEntrada();
  }

  const nomeDaPagina = (url) => url.pathname.split('/').pop() || 'index.html';

  function estiloPara(url) {
    if (nomeDaPagina(url) === 'corrompido.html' || nomeDaPagina(location) === 'corrompido.html') return 'glitch';
    return 'cortina';
  }

  let saindo = false;

  function navegar(href, estilo) {
    const url = new URL(href, location.href);
    if (saindo) return;
    if (semMovimento) {
      location.href = url.href;
      return;
    }
    saindo = true;
    estilo = estilo || estiloPara(url);
    try {
      sessionStorage.setItem('k4pu-transicao', estilo);
      sessionStorage.setItem('k4pu-transicao-destino', nomeDaPagina(url));
    } catch (e) { /* ok */ }

    // se qualquer coisa der errado na animação, a página troca mesmo assim
    const ir = () => { location.href = url.href; };
    const seguranca = setTimeout(ir, 1500);

    try {
      mostrarCortina(url, estilo);
    } catch (e) {
      clearTimeout(seguranca);
      ir();
      return;
    }
    setTimeout(() => { clearTimeout(seguranca); ir(); }, estilo === 'glitch' ? 480 : 420);
  }

  function mostrarCortina(url, estilo) {
    document.querySelectorAll('.transicao-saida').forEach((c) => c.remove());
    const capa = document.createElement('div');
    capa.className = 'transicao-saida transicao-' + estilo;
    capa.setAttribute('aria-hidden', 'true');
    capa.innerHTML =
      '<div class="transicao-texto">' +
        '<span class="transicao-prompt">$ open </span><span class="transicao-destino"></span><span class="transicao-cursor">_</span>' +
        '<div class="transicao-barra"></div>' +
      '</div>';
    capa.querySelector('.transicao-destino').textContent = nomeDaPagina(url);
    document.body.appendChild(capa);
    raiz.classList.add('saindo');
  }

  window.k4puNavegar = navegar;

  /* links do próprio site */
  function linkInterno(a) {
    if (!a || a.target === '_blank' || a.hasAttribute('download')) return null;
    if (a.closest('.universo-palco')) return null; // o universo tem a própria viagem
    const url = new URL(a.getAttribute('href'), location.href);
    if (url.origin !== location.origin || url.protocol !== location.protocol) return null;
    if (!/(\.html|\/)$/.test(url.pathname)) return null;
    // só âncora na mesma página (#algo): deixa o navegador rolar normalmente.
    // link pra própria página sem âncora (ex.: "home" estando na home) anima também.
    const mesmaPagina = url.pathname === location.pathname && url.search === location.search;
    if (mesmaPagina && url.hash) return null;
    return url;
  }

  // escuta na fase de captura: roda antes de outros scripts poderem engolir o clique
  window.addEventListener('click', (e) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const url = linkInterno(e.target.closest && e.target.closest('a[href]'));
    if (!url) return;
    e.preventDefault();
    navegar(url.href);
  }, true);

  // voltar/avançar/F5 também chegam com animação na próxima página
  window.addEventListener('pagehide', () => {
    try {
      if (!sessionStorage.getItem('k4pu-transicao')) sessionStorage.setItem('k4pu-transicao', 'cortina');
    } catch (e) { /* ok */ }
  });

  /* adianta o download da próxima página quando o mouse passa no link */
  const jaBuscadas = new Set();
  document.addEventListener('pointerover', (e) => {
    const url = linkInterno(e.target.closest && e.target.closest('a[href]'));
    if (!url || jaBuscadas.has(url.href) || location.protocol === 'file:') return;
    jaBuscadas.add(url.href);
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = url.href;
    document.head.appendChild(link);
  });

  /* voltar pelo botão do navegador não deixa a cortina presa na tela */
  window.addEventListener('pageshow', (e) => {
    if (!e.persisted) return;
    saindo = false;
    raiz.classList.remove('saindo');
    document.querySelectorAll('.transicao-saida').forEach((c) => c.remove());
    try { sessionStorage.removeItem('k4pu-transicao'); } catch (err) { /* ok */ }
    animarEntrada('cortina');
  });
})();
