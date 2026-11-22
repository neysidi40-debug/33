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
})();
