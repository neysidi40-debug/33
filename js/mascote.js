/* ==========================================================================
   MASCOTE — "nulo", um fantasminha de pixel que mora no canto do site.
   Clique nele pra conversar. Ele dorme se você some por um tempo.
   Pra editar o que ele fala, mexa nas listas de FALAS abaixo.
   ========================================================================== */

(function () {
  const NOME = 'nulo';

  const FALAS = {
    geral: [
      'eu moro aqui. não pago aluguel.',
      'tô de olho em você. literalmente, só tenho olho.',
      'o k4pu disse que eu era temporário. já faz tempo.',
      'fuck everything. mas com carinho.',
      'esse site tem segredos. eu sei todos. não vou contar.',
      'clica de novo. vai.',
      'sou feito de 33 pixels de tristeza. mentira, são mais.',
      'se eu sumir, procura no terminal.'
    ],
    dicas: [
      'dizem que tem uma porta escondida em algum lugar do universo.',
      'três fragmentos. já achou algum?',
      'já tentou clicar no que você quer fazer da vida? lá na home. várias vezes.',
      'a 33ª foto da galeria é especial. só isso que eu digo.',
      'tem um arquivo .dat lá nos corrompidos que eu não abro nem a pau.'
    ],
    paginas: {
      'index.html': ['bem-vindo ao canto do k4pu.', 'o contador ali embaixo é de verdade agora. chique.'],
      'diario.html': ['lê com calma. ele escreveu isso de madrugada.', 'tem coisa aqui que nem eu sabia.'],
      'postagem.html': ['gostou? não precisa responder. eu sei.'],
      'galeria.html': ['as fotos carregam rápido agora. de nada.', 'não julga as fotos. ok, julga um pouco.'],
      'terminal.html': ['digita "nulo" aí pra ver uma coisa.', 'digita "ls -a". confia.'],
      'ferramentas.html': ['ferramentas! eu uso a calculadora pra contar até 33.', 'o bloco de notas guarda tudo só no seu navegador. nem eu leio.'],
      'radio.html': ['aumenta o volume. ou não, sei lá.', 'a 33.9 fala alguma coisa em código morse...'],
      'universo.html': ['cuidado pra não se perder. eu me perdi uma vez.', 'aquele planeta quebrado ali... não clica. (clica.)'],
      'corrompido.html': ['eu não gosto daqui. tem coisa errada nesses arquivos.', 'esse lugar me dá arrepio. e eu sou um fantasma.'],
      'sala.html': ['você chegou até aqui. eu sabia.', 'shh. é segredo.'],
      '404.html': ['eu também não sei onde a gente tá.', 'perdido? bem-vindo, essa é minha casa.']
    }
  };

  // sprite 12x12: X = corpo, o = olho, m = boca
  const SPRITE = [
    '....XXXX....',
    '..XXXXXXXX..',
    '.XXXXXXXXXX.',
    '.XXXXXXXXXX.',
    'XXXooXXooXXX',
    'XXXooXXooXXX',
    'XXXXXXXXXXXX',
    'XXXXXmmXXXXX',
    'XXXXXXXXXXXX',
    'XXXXXXXXXXXX',
    'XXXXXXXXXXXX',
    'X.XX.XX.XX.X'
  ];

  let escondido = false;
  try { escondido = localStorage.getItem('k4pu-nulo') === 'escondido'; } catch (e) { /* ok */ }

  const semMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const pagina = location.pathname.split('/').pop() || 'index.html';

  /* ---------- montar ---------- */

  function desenharSprite() {
    let corpo = '';
    let olhos = '';
    let boca = '';
    SPRITE.forEach((linha, y) => {
      [...linha].forEach((c, x) => {
        const r = `<rect x="${x}" y="${y}" width="1.02" height="1.02"/>`;
        if (c === 'X' || c === 'm') corpo += r;
        if (c === 'o') olhos += r;
        if (c === 'm') boca += r;
      });
    });
    return `<svg viewBox="0 0 12 12" shape-rendering="crispEdges" aria-hidden="true">
      <g class="nulo-corpo">${corpo}</g>
      <g class="nulo-olhos">${olhos}</g>
      <g class="nulo-boca">${boca}</g>
    </svg>`;
  }

  const raiz = document.createElement('div');
  raiz.className = 'nulo';
  raiz.innerHTML =
    `<div class="nulo-balao" role="status" aria-live="polite"></div>` +
    `<button type="button" class="nulo-boneco" aria-label="conversar com o ${NOME}">${desenharSprite()}</button>` +
    `<button type="button" class="nulo-fechar" aria-label="esconder o ${NOME}">×</button>`;
  document.body.appendChild(raiz);

  const balao = raiz.querySelector('.nulo-balao');
  const boneco = raiz.querySelector('.nulo-boneco');
  const olhos = raiz.querySelector('.nulo-olhos');

  if (escondido) raiz.classList.add('escondido');

  /* ---------- falar ---------- */

  let timerBalao = null;
  function falar(texto, duracao) {
    balao.textContent = texto;
    raiz.classList.add('falando');
    clearTimeout(timerBalao);
    timerBalao = setTimeout(() => raiz.classList.remove('falando'), duracao || 4200);
  }

  const sortear = (lista) => lista[Math.floor(Math.random() * lista.length)];
  let ultimaFala = '';

  function falaAleatoria() {
    const h = new Date().getHours();
    const opcoes = [];
    if (h >= 0 && h < 5) opcoes.push(`são ${h}h. vai dormir.`, 'madrugada de novo? a gente precisa conversar.');
    if (h >= 5 && h < 9) opcoes.push('bom dia. ou quase isso.');
    (FALAS.paginas[pagina] || []).forEach((f) => opcoes.push(f, f));
    opcoes.push(...FALAS.geral);
    if (Math.random() < 0.35) opcoes.push(...FALAS.dicas);

    let fala = sortear(opcoes);
    if (fala === ultimaFala) fala = sortear(opcoes);
    ultimaFala = fala;
    return fala;
  }

  let cliques = 0;
  let acabouDeArrastar = false;
  boneco.addEventListener('click', () => {
    if (acabouDeArrastar) { acabouDeArrastar = false; return; }
    seguraAte = performance.now() + 3000;
    acordar(false);
    cliques++;
    raiz.classList.remove('pulando');
    void raiz.offsetWidth;
    raiz.classList.add('pulando');
    if (cliques === 10) {
      falar('para de me cutucar. tá bom, toma: o fragmento 2 tá numa foto.', 6000);
      return;
    }
    falar(falaAleatoria());
  });

  raiz.querySelector('.nulo-fechar').addEventListener('click', () => {
    falar('tá bom, eu saio. me chama no terminal: "nulo".', 2200);
    setTimeout(() => {
      raiz.classList.add('escondido');
      try { localStorage.setItem('k4pu-nulo', 'escondido'); } catch (e) { /* ok */ }
    }, 2200);
  });

  /* ---------- dormir quando ninguém mexe ---------- */

  let timerSono = null;
  function adormecer() {
    raiz.classList.add('dormindo');
    falar('zzz', 600000);
  }
  function acordar(comFala) {
    clearTimeout(timerSono);
    timerSono = setTimeout(adormecer, 120000); // dorme depois de 2 min sem ninguém mexer
    if (raiz.classList.contains('dormindo')) {
      raiz.classList.remove('dormindo');
      if (comFala) falar('hm? ah, oi. eu tava acordado.');
      else raiz.classList.remove('falando');
    }
  }
  ['mousemove', 'keydown', 'scroll', 'touchstart'].forEach((ev) =>
    document.addEventListener(ev, () => acordar(true), { passive: true }));
  acordar(false);

  /* ---------- olhos ---------- */

  function olharPara(dx, dy) {
    const dist = Math.hypot(dx, dy) || 1;
    olhos.setAttribute('transform', `translate(${(dx / dist * 0.7).toFixed(2)} ${(dy / dist * 0.7).toFixed(2)})`);
  }

  // quando está parado, os olhos seguem o cursor
  let mouse = null;
  let pedido = null;
  document.addEventListener('mousemove', (e) => {
    mouse = { x: e.clientX, y: e.clientY };
    if (pedido || semMovimento || raiz.classList.contains('andando')) return;
    pedido = requestAnimationFrame(() => {
      pedido = null;
      const caixa = boneco.getBoundingClientRect();
      olharPara(e.clientX - (caixa.left + caixa.width / 2), e.clientY - (caixa.top + caixa.height / 2));
    });
  }, { passive: true });

  /* ---------- passear pela tela ---------- */

  const FALAS_PASSEIO = [
    'passeando...', 'o que tem aqui?', 'só dando uma volta.', 'essa parte do site é bonita.',
    'você vem sempre aqui?', 'tô de olho.', 'lalala.'
  ];

  const tamanho = () => boneco.offsetWidth || 48;
  const margem = 8;
  let x = 14;
  let y = window.innerHeight - tamanho() - 14;
  let alvo = null;
  let velocidade = 50;
  let esperaAte = performance.now() + 600;
  let seguraAte = 0; // depois de um clique ele para um pouco pra conversar
  let emCima = false;
  let emCimaDesde = 0;
  let arrastando = false;

  function prender() {
    x = Math.max(margem, Math.min(window.innerWidth - tamanho() - margem, x));
    y = Math.max(margem, Math.min(window.innerHeight - tamanho() - margem, y));
  }

  function aplicarPosicao() {
    raiz.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
    raiz.classList.toggle('balao-baixo', y < 130);
    raiz.classList.toggle('balao-esquerda', x > window.innerWidth - 250);
  }

  function escolherAlvo(perto) {
    const maxX = window.innerWidth - tamanho() - margem;
    const maxY = window.innerHeight - tamanho() - margem;
    if (perto && mouse) {
      // às vezes ele vai ver o que você está fazendo (mas não em cima do cursor)
      const ang = Math.random() * Math.PI * 2;
      alvo = { x: mouse.x + Math.cos(ang) * 90, y: mouse.y + Math.sin(ang) * 90 };
    } else {
      alvo = { x: margem + Math.random() * (maxX - margem), y: margem + Math.random() * (maxY - margem) };
    }
    alvo.x = Math.max(margem, Math.min(maxX, alvo.x));
    alvo.y = Math.max(margem, Math.min(maxY, alvo.y));
    velocidade = 70 + Math.random() * 80; // px por segundo
  }

  function parado() {
    return arrastando || emCima ||
      raiz.classList.contains('dormindo') || performance.now() < seguraAte ||
      raiz.classList.contains('escondido') || document.documentElement.classList.contains('carregando');
  }

  let ultimoQuadro = performance.now();
  function quadro(agora) {
    const dt = Math.min(0.05, (agora - ultimoQuadro) / 1000);
    ultimoQuadro = agora;

    // mouse em cima por muito tempo sem clicar: ele sai da frente
    if (emCima && agora - emCimaDesde > 2500) {
      emCima = false;
      escolherAlvo(false);
      falar('ops, tô na frente?', 1500);
      setTimeout(() => raiz.classList.remove('falando'), 1500);
    }

    if (parado()) {
      raiz.classList.remove('andando');
    } else if (!alvo) {
      raiz.classList.remove('andando');
      if (agora > esperaAte) escolherAlvo(Math.random() < 0.2);
    } else {
      const dx = alvo.x - x;
      const dy = alvo.y - y;
      const dist = Math.hypot(dx, dy);
      if (dist < 1.5) {
        alvo = null;
        esperaAte = agora + 500 + Math.random() * 2000;
        raiz.style.setProperty('--inclinar', '0deg');
        if (Math.random() < 0.08) falar(sortear(FALAS_PASSEIO), 2200);
      } else {
        // desacelera perto do destino
        const passo = Math.min(dist, velocidade * dt * Math.min(1, 0.3 + dist / 80));
        x += (dx / dist) * passo;
        y += (dy / dist) * passo + Math.sin(agora / 260) * 0.25;
        raiz.classList.add('andando');
        raiz.style.setProperty('--inclinar', (dx > 0 ? 7 : -7) + 'deg');
        olharPara(dx, dy);
      }
    }

    prender();
    aplicarPosicao();
    requestAnimationFrame(quadro);
  }

  boneco.addEventListener('mouseenter', () => { emCima = true; emCimaDesde = performance.now(); });
  boneco.addEventListener('mouseleave', () => { emCima = false; });
  window.addEventListener('resize', () => { prender(); aplicarPosicao(); });

  /* arrastar com o mouse ou o dedo */
  let inicio = null;
  boneco.addEventListener('pointerdown', (e) => {
    inicio = { px: e.clientX, py: e.clientY, x, y };
    boneco.setPointerCapture(e.pointerId);
  });
  boneco.addEventListener('pointermove', (e) => {
    if (!inicio) return;
    const dx = e.clientX - inicio.px;
    const dy = e.clientY - inicio.py;
    if (!arrastando && Math.hypot(dx, dy) < 6) return;
    if (!arrastando) {
      arrastando = true;
      raiz.classList.add('arrastado');
      raiz.classList.remove('falando');
    }
    x = inicio.x + dx;
    y = inicio.y + dy;
    raiz.style.setProperty('--inclinar', Math.max(-20, Math.min(20, dx / 6)) + 'deg');
    prender();
    aplicarPosicao();
  });
  function soltar() {
    if (arrastando) {
      acabouDeArrastar = true;
      setTimeout(() => { acabouDeArrastar = false; }, 50);
      raiz.classList.remove('arrastado');
      raiz.style.setProperty('--inclinar', '0deg');
      alvo = null;
      esperaAte = performance.now() + 2500;
      emCima = false;
      falar(sortear(['ei! me solta.', 'tô tonto.', 'aqui tá bom, valeu.', 'isso é sequestro.']), 2400);
    }
    arrastando = false;
    inicio = null;
  }
  boneco.addEventListener('pointerup', soltar);
  boneco.addEventListener('pointercancel', soltar);

  prender();
  aplicarPosicao();
  if (!semMovimento) requestAnimationFrame(quadro);

  /* ---------- primeira vez ---------- */

  setTimeout(() => {
    if (escondido || document.documentElement.classList.contains('carregando')) return;
    let jaConhece = false;
    try { jaConhece = !!localStorage.getItem('k4pu-nulo-oi'); localStorage.setItem('k4pu-nulo-oi', '1'); } catch (e) { /* ok */ }
    if (!jaConhece) falar(`oi. eu sou o ${NOME}. clica em mim.`, 5000);
  }, 6500);

  /* ---------- controle externo (terminal, sala...) ---------- */

  window.k4puNulo = {
    falar,
    mostrar(texto) {
      raiz.classList.remove('escondido');
      try { localStorage.removeItem('k4pu-nulo'); } catch (e) { /* ok */ }
      acordar(false);
      falar(texto || 'voltei. sentiu falta?');
    }
  };
})();
