/* Roda no <head>, antes da página aparecer (evita piscar):
   1. aplica o tema salvo (o botão de trocar fica em js/extras.js)
   2. prepara a animação de entrada se a pessoa veio de outra página
      do site (a saída é feita por js/transicao.js) */
(function () {
  const raiz = document.documentElement;

  try {
    if (localStorage.getItem('k4pu-tema') === 'papel') raiz.setAttribute('data-tema', 'papel');
  } catch (e) { /* sem storage: fica no tema padrão */ }

  try {
    const estilo = sessionStorage.getItem('k4pu-transicao');
    const destino = sessionStorage.getItem('k4pu-transicao-destino');
    sessionStorage.removeItem('k4pu-transicao');
    sessionStorage.removeItem('k4pu-transicao-destino');
    if (estilo && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      raiz.classList.add('entrando', 'entrada-' + estilo);
      // o mesmo texto da cortina de saída continua na tela até ela abrir
      if (destino) raiz.style.setProperty('--transicao-texto', JSON.stringify('$ open ' + destino.replace(/[^\w.\-]/g, '') + '_'));
    }
  } catch (e) { /* ok */ }

  /* 3. dificulta abrir as ferramentas do desenvolvedor.
     (impedir de verdade é impossível: o navegador é da pessoa e o menu
     do próprio navegador continua funcionando. isso só afasta curioso.) */
  const BRONCAS = ['ei. aqui não.', 'f12? sério?', 'tá procurando o quê?', 'nada pra ver aqui. circulando.', 'o nulo tá de olho.'];
  function bronca() {
    const texto = BRONCAS[Math.floor(Math.random() * BRONCAS.length)];
    if (window.k4puNulo) window.k4puNulo.falar(texto, 2500);
    else if (window.k4puAvisar) window.k4puAvisar(texto);
  }

  window.addEventListener('keydown', (e) => {
    const tecla = (e.key || '').toLowerCase();
    const ctrl = e.ctrlKey || e.metaKey;
    const bloquear =
      e.key === 'F12' ||
      (ctrl && e.shiftKey && ['i', 'j', 'c', 'k'].includes(tecla)) || // inspecionar / console
      (e.metaKey && e.altKey && ['i', 'j', 'c', 'u'].includes(tecla)) || // atalhos do mac
      (ctrl && !e.shiftKey && tecla === 'u'); // ver código-fonte
    if (bloquear) {
      e.preventDefault();
      e.stopPropagation();
      bronca();
    }
  }, true);

  // botão direito (tem o "inspecionar"), menos em campos de texto pra não perder o copiar/colar
  window.addEventListener('contextmenu', (e) => {
    if (e.target.closest && e.target.closest('input, textarea, [contenteditable]')) return;
    e.preventDefault();
    bronca();
  }, true);
})();
