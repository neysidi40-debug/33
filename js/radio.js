/* ==========================================================================
   RÁDIO 33 — estações geradas ao vivo pelo navegador (Web Audio).
   Nada de arquivo de áudio: cada nota é sintetizada na hora.
   Pra mudar a playlist do youtube, edite PLAYLIST abaixo.
   ========================================================================== */

(function () {
  const PLAYLIST = [
    { id: 'Bm2Eg2X4kZA', titulo: 'Na Hora do Almoço', artista: 'Belchior' }
  ];

  const el = (id) => document.getElementById(id);
  const botaoLigar = el('radio-ligar');
  if (!botaoLigar) return;

  const semMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let salaAberta = false;
  try { salaAberta = localStorage.getItem('k4pu-sala') === 'aberta'; } catch (e) { /* ok */ }

  /* ---------- áudio base ---------- */

  let ctx = null;
  let mestre = null;
  let analisador = null;
  let ruidoBuf = null;
  let chiadoBuf = null;

  const midi = (n) => 440 * Math.pow(2, (n - 69) / 12);

  function iniciarAudio() {
    if (ctx) return;
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    mestre = ctx.createGain();
    mestre.gain.value = el('radio-volume').value / 100;
    analisador = ctx.createAnalyser();
    analisador.fftSize = 256;
    mestre.connect(analisador);
    analisador.connect(ctx.destination);

    // ruído branco (2s)
    ruidoBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const r = ruidoBuf.getChannelData(0);
    for (let i = 0; i < r.length; i++) r[i] = Math.random() * 2 - 1;

    // chiado de vinil: estalos esparsos
    chiadoBuf = ctx.createBuffer(1, ctx.sampleRate * 3, ctx.sampleRate);
    const c = chiadoBuf.getChannelData(0);
    for (let i = 0; i < c.length; i++) {
      if (Math.random() < 0.0006) {
        const forca = (Math.random() * 0.7 + 0.3) * (Math.random() < 0.5 ? -1 : 1);
        for (let j = 0; j < 40 && i + j < c.length; j++) c[i + j] += forca * Math.exp(-j / 6);
      }
    }
  }

  function ruido(destino, ganho, tipoFiltro, freq, q) {
    const fonte = ctx.createBufferSource();
    fonte.buffer = ruidoBuf;
    fonte.loop = true;
    const filtro = ctx.createBiquadFilter();
    filtro.type = tipoFiltro;
    filtro.frequency.value = freq;
    if (q) filtro.Q.value = q;
    const g = ctx.createGain();
    g.gain.value = ganho;
    fonte.connect(filtro).connect(g).connect(destino);
    fonte.start();
    return { fonte, filtro, ganho: g };
  }

  function nota(destino, freq, t, dur, tipo, vol, ataque) {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = tipo;
    osc.frequency.value = freq;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol, t + (ataque || 0.01));
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(g).connect(destino);
    osc.start(t);
    osc.stop(t + dur + 0.05);
  }

  function batida(destino, t, tipo) {
    if (tipo === 'bumbo') {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.frequency.setValueAtTime(120, t);
      osc.frequency.exponentialRampToValueAtTime(42, t + 0.18);
      g.gain.setValueAtTime(0.55, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);
      osc.connect(g).connect(destino);
      osc.start(t);
      osc.stop(t + 0.4);
      return;
    }
    const fonte = ctx.createBufferSource();
    fonte.buffer = ruidoBuf;
    const filtro = ctx.createBiquadFilter();
    const g = ctx.createGain();
    const caixa = tipo === 'caixa';
    filtro.type = caixa ? 'bandpass' : 'highpass';
    filtro.frequency.value = caixa ? 1800 : 7000;
    g.gain.setValueAtTime(caixa ? 0.16 : 0.035, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + (caixa ? 0.18 : 0.05));
    fonte.connect(filtro).connect(g).connect(destino);
    fonte.start(t, Math.random() * 1.5);
    fonte.stop(t + 0.2);
  }

  /* agenda eventos um pouquinho à frente (técnica de "lookahead") */
  function agendador(passo, aoPasso) {
    let proximo = ctx.currentTime + 0.1;
    let n = 0;
    const id = setInterval(() => {
      while (proximo < ctx.currentTime + 0.15) {
        aoPasso(n, proximo);
        proximo += passo;
        n++;
      }
    }, 25);
    return () => clearInterval(id);
  }

  /* ---------- estações ---------- */

  const ESTACOES = [
    {
      freq: '33.3',
      nome: 'lofi do nulo',
      desc: 'batida lenta, acordes cansados e chiado de vinil. gerado ao vivo, nunca toca igual.',
      tocar(saida) {
        const filtro = ctx.createBiquadFilter();
        filtro.type = 'lowpass';
        filtro.frequency.value = 1600;
        filtro.connect(saida);

        const eco = ctx.createDelay();
        eco.delayTime.value = 0.42;
        const retorno = ctx.createGain();
        retorno.gain.value = 0.32;
        eco.connect(retorno).connect(eco);
        retorno.connect(filtro);

        const chiado = ctx.createBufferSource();
        chiado.buffer = chiadoBuf;
        chiado.loop = true;
        const gChiado = ctx.createGain();
        gChiado.gain.value = 0.12;
        chiado.connect(gChiado).connect(saida);
        chiado.start();
        const chiadoFundo = ruido(saida, 0.012, 'highpass', 3000);

        const ACORDES = [
          { baixo: 45, notas: [57, 60, 64, 67] }, // Am7
          { baixo: 41, notas: [57, 60, 64, 65] }, // Fmaj7
          { baixo: 48, notas: [55, 59, 60, 64] }, // Cmaj7
          { baixo: 43, notas: [55, 59, 62, 64] }  // G6
        ];
        const ESCALA = [69, 72, 74, 76, 79, 81, 84];
        const dezesseis = 60 / 72 / 4;

        const parar = agendador(dezesseis, (n, t) => {
          const passo = n % 16;
          const acorde = ACORDES[Math.floor(n / 16) % ACORDES.length];
          const balanco = passo % 2 === 1 ? dezesseis * 0.18 : 0;
          const tt = t + balanco;

          if (passo === 0) acorde.notas.forEach((m) => nota(filtro, midi(m), tt, dezesseis * 16, 'triangle', 0.045, 0.4));
          if (passo === 0 || passo === 10) nota(filtro, midi(acorde.baixo), tt, dezesseis * 5, 'sine', 0.22, 0.02);
          if (passo === 0 || passo === 9) batida(saida, tt, 'bumbo');
          if (passo === 4 || passo === 12) batida(saida, tt, 'caixa');
          if (passo % 2 === 0) batida(saida, tt, 'chimbal');
          if (passo % 2 === 0 && Math.random() < 0.3) {
            const m = ESCALA[(Math.random() * ESCALA.length) | 0];
            nota(eco, midi(m), tt, dezesseis * 3, 'sine', 0.07, 0.01);
            nota(filtro, midi(m), tt, dezesseis * 3, 'sine', 0.06, 0.01);
          }
        });

        return () => { parar(); chiado.stop(); chiadoFundo.fonte.stop(); };
      }
    },
    {
      freq: '33.6',
      nome: 'chuva às 3h',
      desc: 'chuva na janela, um zumbido grave e pensamento demais. pra dormir (ou tentar).',
      tocar(saida) {
        const chuva = ruido(saida, 0.14, 'lowpass', 2400);
        const chuvaFina = ruido(saida, 0.05, 'highpass', 5000);

        const lfo = ctx.createOscillator();
        const lfoGanho = ctx.createGain();
        lfo.frequency.value = 0.07;
        lfoGanho.gain.value = 0.06;
        lfo.connect(lfoGanho).connect(chuva.ganho.gain);
        lfo.start();

        const drone = [55, 82.4, 110.2].map((f, i) => {
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          o.type = 'sine';
          o.frequency.value = f;
          o.detune.value = i * 4;
          g.gain.value = 0.035;
          o.connect(g).connect(saida);
          o.start();
          return o;
        });

        const pingo = setInterval(() => {
          const t = ctx.currentTime + Math.random() * 0.1;
          nota(saida, 1800 + Math.random() * 2600, t, 0.08, 'sine', 0.015 + Math.random() * 0.02);
        }, 90);

        const acordeLonge = agendador(9, (n, t) => {
          [53, 57, 60, 64].forEach((m) => nota(saida, midi(m), t, 7, 'sine', 0.025, 2.5));
        });

        return () => {
          clearInterval(pingo);
          acordeLonge();
          chuva.fonte.stop();
          chuvaFina.fonte.stop();
          lfo.stop();
          drone.forEach((o) => o.stop());
        };
      }
    },
    {
      freq: '33.9',
      nome: 'estática',
      desc: 'só chiado. mas se você prestar atenção, alguém tá tentando falar alguma coisa em morse.',
      tocar(saida) {
        const estatica = ruido(saida, 0.07, 'bandpass', 1300, 0.6);
        const chiado = ctx.createBufferSource();
        chiado.buffer = chiadoBuf;
        chiado.loop = true;
        const gChiado = ctx.createGain();
        gChiado.gain.value = 0.25;
        chiado.connect(gChiado).connect(saida);
        chiado.start();

        const MORSE = {
          s: '...', t: '-', i: '..', l: '.-..', h: '....', e: '.', r: '.-.', 3: '...--'
        };
        // "still here 33" → sequência de bipes (1 = ligado, 0 = desligado)
        const unidades = [];
        'still here 33'.split('').forEach((letra) => {
          if (letra === ' ') { unidades.push(0, 0, 0, 0); return; }
          MORSE[letra].split('').forEach((s) => {
            const n = s === '.' ? 1 : 3;
            for (let i = 0; i < n; i++) unidades.push(1);
            unidades.push(0);
          });
          unidades.push(0, 0);
        });
        for (let i = 0; i < 14; i++) unidades.push(0);

        const parar = agendador(0.085, (n, t) => {
          const atual = unidades[n % unidades.length];
          const anterior = unidades[(n - 1 + unidades.length) % unidades.length];
          if (atual && !anterior) {
            let dur = 0;
            for (let k = n; unidades[k % unidades.length]; k++) dur += 0.085;
            nota(saida, 640, t, dur, 'sine', 0.09, 0.005);
          }
        });

        return () => { parar(); estatica.fonte.stop(); chiado.stop(); };
      }
    },
    {
      freq: '34.0',
      nome: 'playlist do k4pu',
      desc: 'o que eu ando ouvindo de verdade. toca pelo youtube.',
      youtube: true
    },
    {
      freq: '33.0',
      nome: 'frequência da sala',
      desc: 'você não devia estar ouvindo isso. caixinha de música pra quem achou a porta.',
      secreta: true,
      tocar(saida) {
        const eco = ctx.createDelay();
        eco.delayTime.value = 0.55;
        const retorno = ctx.createGain();
        retorno.gain.value = 0.42;
        eco.connect(retorno).connect(eco);
        retorno.connect(saida);

        const ESCALA = [72, 74, 76, 79, 81, 84, 86, 88];
        let ultima = 2;
        const parar = agendador(0.42, (n, t) => {
          if (Math.random() < 0.25) return;
          ultima = Math.max(0, Math.min(ESCALA.length - 1, ultima + ((Math.random() * 5) | 0) - 2));
          const f = midi(ESCALA[ultima]);
          nota(saida, f, t, 1.6, 'sine', 0.12, 0.003);
          nota(saida, f * 2, t, 0.6, 'sine', 0.03, 0.003);
          nota(eco, f, t, 1.2, 'sine', 0.05, 0.003);
          if (n % 8 === 0) nota(saida, midi(ESCALA[0] - 24), t, 3, 'sine', 0.08, 0.05);
        });
        return parar;
      }
    }
  ].filter((e) => !e.secreta || salaAberta);

  /* ---------- estado e interface ---------- */

  let atual = 0;
  let ligado = false;
  let pararEstacao = null;
  let saidaEstacao = null;
  let faixaYoutube = 0;

  const lista = el('radio-estacoes');
  lista.innerHTML = ESTACOES.map((e, i) =>
    `<li><button type="button" data-indice="${i}"${e.secreta ? ' class="secreta"' : ''}>
      <span>${e.freq}</span> ${e.nome}</button></li>`).join('');

  function mostrarEstacao() {
    const e = ESTACOES[atual];
    el('radio-freq').innerHTML = `${e.freq} <small>FM</small>`;
    el('radio-nome').textContent = e.nome;
    el('radio-desc').textContent = e.desc;
    lista.querySelectorAll('button').forEach((b, i) => b.classList.toggle('ativa', i === atual));
    // ponteiro do dial: 32.8 a 34.2
    const pos = (parseFloat(e.freq) - 32.8) / 1.4 * 100;
    el('radio-ponteiro').style.left = Math.max(2, Math.min(98, pos)) + '%';
    el('radio-status').textContent = ligado ? 'no ar' : 'desligado';
    el('radio-led').classList.toggle('aceso', ligado);
    botaoLigar.textContent = ligado ? '■ desligar' : '▶ ligar';
    botaoLigar.setAttribute('aria-pressed', String(ligado));
  }

  function chiadoSintonia() {
    const g = ctx.createGain();
    g.connect(mestre);
    const r = ruido(g, 0.18, 'bandpass', 900 + Math.random() * 1500, 0.8);
    g.gain.setValueAtTime(1, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.45);
    setTimeout(() => r.fonte.stop(), 500);
  }

  function pararTudo() {
    if (pararEstacao) { pararEstacao(); pararEstacao = null; }
    if (saidaEstacao) {
      const s = saidaEstacao;
      s.gain.setTargetAtTime(0, ctx.currentTime, 0.08);
      setTimeout(() => s.disconnect(), 600);
      saidaEstacao = null;
    }
    el('radio-youtube').innerHTML = '';
    el('radio-youtube').hidden = true;
  }

  function tocarAtual() {
    pararTudo();
    const e = ESTACOES[atual];
    if (e.youtube) {
      const faixa = PLAYLIST[faixaYoutube % PLAYLIST.length];
      const caixa = el('radio-youtube');
      caixa.hidden = false;
      caixa.innerHTML =
        `<iframe src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(faixa.id)}?autoplay=1" ` +
        `title="${faixa.titulo} — ${faixa.artista}" allow="autoplay; encrypted-media" allowfullscreen></iframe>`;
      el('radio-desc').textContent = `tocando: ${faixa.titulo} — ${faixa.artista}`;
      return;
    }
    saidaEstacao = ctx.createGain();
    saidaEstacao.gain.setValueAtTime(0, ctx.currentTime);
    saidaEstacao.gain.linearRampToValueAtTime(1, ctx.currentTime + 0.6);
    saidaEstacao.connect(mestre);
    pararEstacao = e.tocar(saidaEstacao);
  }

  function ligarDesligar() {
    iniciarAudio();
    if (ctx.state === 'suspended') ctx.resume();
    ligado = !ligado;
    if (ligado) {
      chiadoSintonia();
      tocarAtual();
      animarVisualizador();
      if (ESTACOES[atual].secreta && window.k4puNulo) window.k4puNulo.falar('essa música... eu conheço.');
    } else {
      pararTudo();
      desenhar();
    }
    mostrarEstacao();
  }

  function sintonizar(indice) {
    atual = (indice + ESTACOES.length) % ESTACOES.length;
    if (ligado) {
      chiadoSintonia();
      tocarAtual();
    }
    mostrarEstacao();
  }

  botaoLigar.addEventListener('click', ligarDesligar);
  el('radio-anterior').addEventListener('click', () => sintonizar(atual - 1));
  el('radio-proxima').addEventListener('click', () => {
    if (ligado && ESTACOES[atual].youtube && PLAYLIST.length > 1) {
      faixaYoutube++;
      tocarAtual();
      return;
    }
    sintonizar(atual + 1);
  });
  lista.addEventListener('click', (ev) => {
    const b = ev.target.closest('button');
    if (b) sintonizar(Number(b.dataset.indice));
  });
  el('radio-volume').addEventListener('input', (ev) => {
    if (mestre) mestre.gain.setTargetAtTime(ev.target.value / 100, ctx.currentTime, 0.05);
  });

  /* ---------- visualizador ---------- */

  const canvas = el('radio-onda');
  const c2d = canvas.getContext('2d');

  function corTema(nome) {
    return getComputedStyle(canvas).getPropertyValue(nome).trim() || '#78d4a6';
  }

  function desenhar() {
    const largura = canvas.clientWidth;
    const altura = canvas.clientHeight;
    const escala = window.devicePixelRatio || 1;
    if (canvas.width !== largura * escala) {
      canvas.width = largura * escala;
      canvas.height = altura * escala;
    }
    c2d.setTransform(escala, 0, 0, escala, 0, 0);
    c2d.clearRect(0, 0, largura, altura);

    const barras = 48;
    const larguraBarra = largura / barras;
    let dados = null;
    if (ligado && analisador && !ESTACOES[atual].youtube) {
      dados = new Uint8Array(analisador.frequencyBinCount);
      analisador.getByteFrequencyData(dados);
    }

    c2d.fillStyle = corTema('--radio-barra');
    for (let i = 0; i < barras; i++) {
      let v;
      if (dados) v = dados[Math.floor(i * dados.length / barras * 0.8)] / 255;
      else if (ligado) v = 0.08 + Math.random() * 0.1; // youtube: sem acesso ao som
      else v = 0.02;
      const h = Math.max(1, v * altura);
      c2d.fillRect(i * larguraBarra + 1, altura - h, larguraBarra - 2, h);
    }
  }

  let loopAtivo = false;
  function animarVisualizador() {
    if (loopAtivo) return;
    loopAtivo = true;
    (function quadro() {
      desenhar();
      if (ligado && !semMovimento) requestAnimationFrame(quadro);
      else loopAtivo = false;
    })();
  }

  mostrarEstacao();
  desenhar();
  window.addEventListener('resize', () => { if (!ligado) desenhar(); });
})();
