/* ==========================================================================
   EXTRAS — relógio, troca de tema, rastro do cursor, contador de visitas
   e alguns segredos. Carregado no fim do <body> de todas as páginas.
   ========================================================================== */

(function () {
  const raiz = document.documentElement;
  const semMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function ler(tipo, chave) {
    try { return window[tipo].getItem(chave); } catch (e) { return null; }
  }
  function salvar(tipo, chave, valor) {
    try { window[tipo].setItem(chave, valor); } catch (e) { /* sem storage */ }
  }

  /* ---------- aviso flutuante ---------- */

  let avisoAtual = null;
  function avisar(texto) {
    if (avisoAtual) avisoAtual.remove();
    const el = document.createElement('div');
    el.className = 'aviso-33';
    el.setAttribute('role', 'status');
    el.textContent = texto;
    document.body.appendChild(el);
    avisoAtual = el;
    void el.offsetWidth; // garante a transição de entrada
    el.classList.add('visivel');
    setTimeout(() => {
      el.classList.remove('visivel');
      setTimeout(() => el.remove(), 400);
    }, 3200);
  }
  window.k4puAvisar = avisar;

  /* ---------- relógio + botão de tema no topo ---------- */

  const topo = document.querySelector('.topo-conteudo');
  let relogio = null;
  let botaoTema = null;

  if (topo) {
    const extras = document.createElement('div');
    extras.className = 'topo-extras';
    extras.innerHTML =
      '<time class="relogio"></time>' +
      '<button type="button" class="botao-tema"></button>';
    topo.appendChild(extras);
    relogio = extras.querySelector('.relogio');
    botaoTema = extras.querySelector('.botao-tema');
  }

  const DIAS = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
  const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
  const dois = (n) => String(n).padStart(2, '0');

  function atualizarRelogio() {
    const d = new Date();
    relogio.dateTime = d.toISOString();
    relogio.innerHTML =
      `<span class="relogio-dia">${DIAS[d.getDay()]}</span>` +
      `<span class="relogio-data"> · ${d.getDate()} ${MESES[d.getMonth()]} ${d.getFullYear()}</span>` +
      ` · <span class="relogio-hora">${dois(d.getHours())}:${dois(d.getMinutes())}:${dois(d.getSeconds())}</span>`;
  }

  if (relogio) {
    atualizarRelogio();
    setTimeout(() => {
      atualizarRelogio();
      setInterval(atualizarRelogio, 1000);
    }, 1000 - new Date().getMilliseconds());
  }

  /* ---------- tema escuro / papel ---------- */

  function temaPapel() {
    return raiz.getAttribute('data-tema') === 'papel';
  }

  function rotularBotaoTema() {
    if (!botaoTema) return;
    const papel = temaPapel();
    botaoTema.textContent = papel ? '☾︎ escuro' : '☀︎ papel';
    botaoTema.setAttribute('aria-label', papel ? 'mudar para o tema escuro' : 'mudar para o tema papel');
  }

  function trocarTema() {
    raiz.classList.add('trocando-tema');
    if (temaPapel()) raiz.removeAttribute('data-tema');
    else raiz.setAttribute('data-tema', 'papel');
    salvar('localStorage', 'k4pu-tema', temaPapel() ? 'papel' : 'escuro');
    rotularBotaoTema();
    setTimeout(() => raiz.classList.remove('trocando-tema'), 450);
  }

  if (botaoTema) {
    rotularBotaoTema();
    botaoTema.addEventListener('click', trocarTema);
  }

  /* ---------- rastro de estrelinhas no cursor ---------- */

  if (window.matchMedia('(pointer: fine)').matches && !semMovimento) {
    let ultimo = 0;
    let ativas = 0;
    document.addEventListener('mousemove', (e) => {
      const agora = performance.now();
      if (agora - ultimo < 45 || ativas > 18) return;
      ultimo = agora;

      const faisca = document.createElement('span');
      faisca.className = 'faisca';
      faisca.setAttribute('aria-hidden', 'true');
      faisca.textContent = Math.random() > 0.35 ? '✦' : '·';
      faisca.style.left = e.clientX + 'px';
      faisca.style.top = e.clientY + 'px';
      faisca.style.setProperty('--dx', (Math.random() * 16 - 8).toFixed(1) + 'px');
      faisca.style.setProperty('--dy', (Math.random() * 10 + 6).toFixed(1) + 'px');
      document.body.appendChild(faisca);
      ativas++;
      faisca.addEventListener('animationend', () => { faisca.remove(); ativas--; }, { once: true });
    }, { passive: true });
  }

  /* ---------- contador de visitas (só existe na home) ---------- */

  const elContador = document.getElementById('contador-visitas');
  if (elContador) {
    const elLegenda = document.getElementById('contador-legenda');
    const API = 'https://abacus.jasoncameron.dev';
    const CONTADOR = 'k4pu-33/visitas';
    // abrindo o arquivo no próprio computador só consulta, não soma visita
    const teste = location.protocol === 'file:' || ['localhost', '127.0.0.1'].includes(location.hostname);
    const jaContado = ler('sessionStorage', 'k4pu-visitante');

    const mostrar = (n) => {
      elContador.textContent = String(n).padStart(6, '0');
      if (elLegenda) elLegenda.textContent = teste ? 'modo teste: não conta visita' : 'obrigado por passar aqui';
    };

    if (jaContado) {
      mostrar(Number(jaContado));
    } else {
      const controle = new AbortController();
      setTimeout(() => controle.abort(), 6000);
      fetch(`${API}/${teste ? 'get' : 'hit'}/${CONTADOR}`, { signal: controle.signal })
        .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
        .then((dados) => {
          if (typeof dados.value !== 'number') throw new Error('resposta estranha');
          if (!teste) salvar('sessionStorage', 'k4pu-visitante', String(dados.value));
          mostrar(dados.value);
        })
        .catch(() => {
          elContador.textContent = '33.33';
          if (elLegenda) elLegenda.textContent = 'contador offline agora';
        });
    }
  }

  /* ==========================================================================
     SEGREDOS
     ========================================================================== */

  /* modo matrix: chuva de código por 10s (konami code ou comando no terminal) */
  let matrixAtivo = false;
  function modoMatrix() {
    if (matrixAtivo) return;
    if (semMovimento) {
      avisar('achou o segredo. mas seu sistema pediu menos animação :)');
      return;
    }
    matrixAtivo = true;
    avisar('modo matrix ativado ✦ 10s');

    const canvas = document.createElement('canvas');
    canvas.className = 'chuva-33';
    canvas.setAttribute('aria-hidden', 'true');
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    const tam = 16;
    const escala = window.devicePixelRatio || 1;
    const largura = window.innerWidth;
    const altura = window.innerHeight;
    canvas.width = largura * escala;
    canvas.height = altura * escala;
    ctx.setTransform(escala, 0, 0, escala, 0, 0);

    const letras = '0123456789k4pu33{}<>/;=+*#';
    const gotas = Array.from({ length: Math.ceil(largura / tam) }, () => Math.random() * -30);
    const fim = performance.now() + 10000;
    const papel = temaPapel();

    function quadro(agora) {
      ctx.fillStyle = papel ? 'rgba(237, 229, 211, 0.14)' : 'rgba(9, 9, 9, 0.12)';
      ctx.fillRect(0, 0, largura, altura);
      ctx.font = `${tam}px "Space Mono", monospace`;
      gotas.forEach((y, i) => {
        ctx.fillStyle = i % 5 === 0 ? (papel ? '#a24f3a' : '#d5b86a') : (papel ? '#23304a' : '#78d4a6');
        ctx.fillText(letras[(Math.random() * letras.length) | 0], i * tam, y * tam);
        gotas[i] = y * tam > altura && Math.random() > 0.97 ? 0 : y + 0.6;
      });
      if (agora < fim) {
        requestAnimationFrame(quadro);
      } else {
        canvas.classList.add('saindo');
        setTimeout(() => { canvas.remove(); matrixAtivo = false; }, 700);
      }
    }
    requestAnimationFrame(quadro);
  }
  window.k4puMatrix = modoMatrix;

  /* "dormir": a página apaga por uns segundos */
  function dormir() {
    raiz.classList.add('dormindo');
    avisar('zzz... volta depois do café');
    setTimeout(() => raiz.classList.remove('dormindo'), 5000);
  }

  /* teclado: konami code e palavras digitadas em qualquer lugar da página */
  const KONAMI = ['arrowup', 'arrowup', 'arrowdown', 'arrowdown', 'arrowleft', 'arrowright', 'arrowleft', 'arrowright', 'b', 'a'];
  const PALAVRAS = {
    k4pu: () => avisar('oi. você me achou ✦'),
    sono: dormir,
    help: () => avisar('aqui não. tenta a página terminal.')
  };
  let posKonami = 0;
  let digitado = '';

  document.addEventListener('keydown', (e) => {
    if (e.target.closest && e.target.closest('input, textarea, select, [contenteditable]')) return;
    const tecla = e.key.toLowerCase();

    if (tecla === KONAMI[posKonami]) posKonami++;
    else posKonami = tecla === KONAMI[0] ? 1 : 0;
    if (posKonami === KONAMI.length) {
      posKonami = 0;
      modoMatrix();
    }

    if (e.key.length === 1) {
      digitado = (digitado + tecla).slice(-10);
      Object.keys(PALAVRAS).forEach((palavra) => {
        if (digitado.endsWith(palavra)) {
          digitado = '';
          PALAVRAS[palavra]();
        }
      });
    }
  });

  /* ---------- fragmentos da sala secreta ----------
     1: home (dar a volta completa na palavra "exist")
     2: galeria (abrir a 33ª foto)
     3: arquivos corrompidos (decodificar 33.dat)               */

  const FRAGMENTOS = { 1: 'still', 2: 'here', 3: '33' };

  function fragmentosAchados() {
    try {
      const lista = JSON.parse(localStorage.getItem('k4pu-fragmentos'));
      return Array.isArray(lista) ? lista : [];
    } catch (e) {
      return [];
    }
  }

  function acharFragmento(n) {
    const achados = fragmentosAchados();
    if (achados.includes(n)) {
      avisar(`fragmento ${n}/3 já é seu: "${FRAGMENTOS[n]}"`);
      return;
    }
    achados.push(n);
    salvar('localStorage', 'k4pu-fragmentos', JSON.stringify(achados));
    avisar(`✦ fragmento ${n}/3 encontrado: "${FRAGMENTOS[n]}"` +
      (achados.length === 3 ? ' — agora procura a porta.' : ''));
  }

  window.k4puFragmentos = () => fragmentosAchados().map((n) => ({ n, palavra: FRAGMENTOS[n] }));
  window.k4puFragmento = acharFragmento;

  /* home: clicar em "exist" troca a palavra (a volta completa dá o fragmento 1) */
  const palavraHero = document.querySelector('.hero h1 em');
  if (palavraHero) {
    const opcoes = ['exist', 'survive', 'sleep', 'pay rent', 'touch grass'];
    let i = 0;
    palavraHero.classList.add('segredo-clicavel');
    palavraHero.addEventListener('click', () => {
      i = (i + 1) % opcoes.length;
      palavraHero.textContent = opcoes[i];
      if (i === 0) acharFragmento(1);
    });
  }

  /* home: 5 cliques no status */
  const status = document.querySelector('.widget-status');
  if (status) {
    const textoStatus = status.querySelector('strong');
    const original = textoStatus ? textoStatus.textContent : '';
    let cliques = 0;
    status.addEventListener('click', () => {
      cliques++;
      if (cliques === 5 && textoStatus) {
        textoStatus.textContent = ' fingindo que tá disponível';
        avisar('status real revelado.');
        setTimeout(() => { textoStatus.textContent = original; cliques = 0; }, 6000);
      }
    });
  }

  /* pra quem abre o console */
  console.log(
    '%c k4pu 33 %c procurando segredos no código? tenta ↑↑↓↓←→←→ b a',
    'background:#78d4a6;color:#090909;font-weight:bold;padding:2px 4px',
    'color:#999'
  );
})();
