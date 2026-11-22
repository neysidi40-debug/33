/* ==========================================================================
   FERRAMENTAS — 10 utilitários que rodam 100% no navegador.
   Cada ferramenta é montada só quando é aberta pela primeira vez.
   Endereço direto: ferramentas.html#senhas, #qr, #pomodoro...
   ========================================================================== */

(function () {
  const lista = document.getElementById('oficina-lista');
  const janela = document.getElementById('oficina-conteudo');
  const tituloJanela = document.getElementById('oficina-titulo');
  if (!lista || !janela) return;

  /* ---------- utilidades ---------- */

  const semMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const avisar = (t) => (window.k4puAvisar ? window.k4puAvisar(t) : null);

  // número aleatório uniforme em [0, n) usando o gerador criptográfico
  function aleatorio(n) {
    const limite = Math.floor(0x100000000 / n) * n;
    const buf = new Uint32Array(1);
    do { crypto.getRandomValues(buf); } while (buf[0] >= limite);
    return buf[0] % n;
  }
  const sortear = (arr) => arr[aleatorio(arr.length)];

  function copiar(texto) {
    const ok = () => avisar('copiado ✦');
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(texto).then(ok, () => copiarAntigo(texto, ok));
    } else {
      copiarAntigo(texto, ok);
    }
  }
  function copiarAntigo(texto, ok) {
    const area = document.createElement('textarea');
    area.value = texto;
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    try { document.execCommand('copy'); ok(); } catch (e) { avisar('não consegui copiar :('); }
    area.remove();
  }

  function baixar(nome, conteudo, tipo) {
    const blob = conteudo instanceof Blob ? conteudo : new Blob([conteudo], { type: tipo || 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = nome;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function ler(chave, padrao) {
    try { const v = localStorage.getItem(chave); return v === null ? padrao : JSON.parse(v); } catch (e) { return padrao; }
  }
  function gravar(chave, valor) {
    try { localStorage.setItem(chave, JSON.stringify(valor)); return true; } catch (e) { return false; }
  }

  function bip(notas) {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      notas.forEach((f, i) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        const t = ctx.currentTime + i * 0.22;
        o.frequency.value = f;
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(0.2, t + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);
        o.connect(g).connect(ctx.destination);
        o.start(t);
        o.stop(t + 0.25);
      });
      setTimeout(() => ctx.close(), notas.length * 260 + 300);
    } catch (e) { /* sem áudio */ }
  }

  // botão "copiar" em qualquer [data-copiar] (valor) ou [data-copiar-de] (id de um campo)
  janela.addEventListener('click', (e) => {
    const b = e.target.closest('[data-copiar], [data-copiar-de]');
    if (!b) return;
    if (b.dataset.copiarDe) {
      const alvo = document.getElementById(b.dataset.copiarDe);
      const texto = 'value' in alvo ? alvo.value : alvo.textContent;
      if (texto) copiar(texto);
    } else {
      copiar(b.dataset.copiar);
    }
  });

  /* desenha um QR code num canvas (usa js/vendor/qrcode.min.js) */
  function desenharQR(ctx, texto, x, y, tamanho, escuro, claro, margem) {
    if (typeof qrcode === 'undefined') throw new Error('biblioteca de QR não carregou');
    qrcode.stringToBytes = qrcode.stringToBytesFuncs['UTF-8'];
    const qr = qrcode(0, 'M');
    qr.addData(texto, 'Byte');
    qr.make();
    const n = qr.getModuleCount();
    const m = margem === undefined ? 2 : margem;
    const celula = tamanho / (n + m * 2);
    ctx.fillStyle = claro;
    ctx.fillRect(x, y, tamanho, tamanho);
    ctx.fillStyle = escuro;
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        if (qr.isDark(r, c)) {
          ctx.fillRect(Math.floor(x + (c + m) * celula), Math.floor(y + (r + m) * celula), Math.ceil(celula), Math.ceil(celula));
        }
      }
    }
    return n;
  }

  /* ==========================================================================
     01 · GERADOR DE NOMES
     ========================================================================== */

  function montarNomes(raiz) {
    const PALAVRAS = {
      sombrio: ['noite', 'vazio', 'nulo', 'eco', 'sombra', 'ruido', 'cinza', 'neblina', 'void', 'ghost', 'static', 'glitch', 'lost', 'null', 'dusk', 'crow'],
      fofo: ['nuvem', 'mel', 'bolinha', 'pipoca', 'miau', 'lua', 'pudim', 'cookie', 'bunny', 'peach', 'mochi', 'star', 'honey', 'jujuba', 'frufru'],
      gamer: ['shadow', 'pixel', 'killer', 'ninja', 'dark', 'neo', 'turbo', 'hyper', 'zero', 'byte', 'storm', 'raven', 'fury', 'nova', 'blaze', 'viper'],
      minimal: ['k', 'x', 'v', 'r', 'm', 'sol', 'mar', 'um', 'oi', 'eu', 'ar', 'lo', 'yu', 'ka']
    };
    const SUFIXOS = ['zinho', 'x', 'wave', 'core', 'byte', 'fm', 'kid', 'dev', 'sz', 'ita', 'ão', 'exe', 'zz', 'boy', 'girl', 'one'];
    const leet = (t) => t.replace(/[aeiost]/g, (c) => ({ a: '4', e: '3', i: '1', o: '0', s: '5', t: '7' }[c]));

    raiz.innerHTML = `
      <p class="ferr-desc">apelidos e usernames aleatórios. clica em um pra copiar.</p>
      <div class="ferr-linha">
        <label class="ferr-campo">estilo
          <select id="nomes-estilo">
            <option value="misto">misturado</option>
            <option value="sombrio">sombrio</option>
            <option value="fofo">fofo</option>
            <option value="gamer">gamer</option>
            <option value="minimal">minimalista</option>
          </select>
        </label>
        <label class="ferr-check"><input type="checkbox" id="nomes-33"> colocar 33</label>
        <label class="ferr-check"><input type="checkbox" id="nomes-leet"> l33t</label>
        <button type="button" class="ferr-botao principal" id="nomes-gerar">gerar</button>
      </div>
      <div class="ferr-chips" id="nomes-saida"></div>`;

    const saida = raiz.querySelector('#nomes-saida');

    function umNome() {
      const estilo = raiz.querySelector('#nomes-estilo').value;
      const fonte = estilo === 'misto' ? PALAVRAS[sortear(Object.keys(PALAVRAS))] : PALAVRAS[estilo];
      const a = sortear(fonte);
      const b = sortear(Math.random() < 0.5 ? fonte : SUFIXOS);
      const num = String(aleatorio(100)).padStart(2, '0');
      const formatos = [
        () => a + b, () => `${a}_${b}`, () => `${a}.${b}`, () => a + num,
        () => `x${a}x`, () => `${a}${b}${num}`, () => `_${a}_`, () => `${a}${b}`.toUpperCase()
      ];
      let nome = sortear(formatos)();
      if (raiz.querySelector('#nomes-leet').checked) nome = leet(nome);
      if (raiz.querySelector('#nomes-33').checked) nome += Math.random() < 0.5 ? '33' : '_33';
      return nome.slice(0, 22);
    }

    function gerar() {
      const nomes = new Set();
      while (nomes.size < 10) nomes.add(umNome());
      saida.innerHTML = '';
      nomes.forEach((n) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'ferr-chip';
        b.textContent = n;
        b.dataset.copiar = n;
        saida.appendChild(b);
      });
    }

    raiz.querySelector('#nomes-gerar').addEventListener('click', gerar);
    gerar();
  }

  /* ==========================================================================
     02 · GERADOR DE SENHAS
     ========================================================================== */

  function montarSenhas(raiz) {
    const CONJUNTOS = {
      maiusculas: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
      minusculas: 'abcdefghijklmnopqrstuvwxyz',
      numeros: '0123456789',
      simbolos: '!@#$%&*?-_=+.:;/~^'
    };
    const PARECIDOS = /[Il1O0o]/g;
    const PALAVRAS = ['nuvem', 'cafe', 'janela', 'lua', 'trem', 'gato', 'chuva', 'vinil', 'neon', 'mar', 'pixel', 'ponte', 'radio', 'sombra', 'tigre', 'limao', 'vento', 'farol', 'cometa', 'tinta', 'pedra', 'folha', 'mapa', 'ruido', 'eco', 'nulo', 'sol', 'livro', 'ilha', 'raiz'];

    raiz.innerHTML = `
      <p class="ferr-desc">gerado no seu navegador com o gerador criptográfico. nada sai daqui.</p>
      <div class="ferr-linha">
        <label class="ferr-check"><input type="radio" name="senha-modo" value="caracteres" checked> caracteres</label>
        <label class="ferr-check"><input type="radio" name="senha-modo" value="frase"> frase-senha</label>
      </div>
      <div class="ferr-linha" id="senha-opcoes">
        <label class="ferr-campo">tamanho <output id="senha-tam-valor">20</output>
          <input type="range" id="senha-tam" min="8" max="64" value="20">
        </label>
        <label class="ferr-check"><input type="checkbox" id="senha-maiusculas" checked> A-Z</label>
        <label class="ferr-check"><input type="checkbox" id="senha-minusculas" checked> a-z</label>
        <label class="ferr-check"><input type="checkbox" id="senha-numeros" checked> 0-9</label>
        <label class="ferr-check"><input type="checkbox" id="senha-simbolos" checked> !@#</label>
        <label class="ferr-check"><input type="checkbox" id="senha-parecidos"> sem I l 1 O 0</label>
      </div>
      <div class="ferr-saida-linha">
        <input type="text" class="ferr-saida" id="senha-saida" readonly aria-label="senha gerada">
        <button type="button" class="ferr-botao" data-copiar-de="senha-saida">copiar</button>
        <button type="button" class="ferr-botao principal" id="senha-gerar">gerar</button>
      </div>
      <div class="forca"><div class="forca-barra" id="senha-forca-barra"></div></div>
      <p class="ferr-nota" id="senha-forca"></p>`;

    const $ = (s) => raiz.querySelector(s);

    function gerar() {
      const modo = raiz.querySelector('input[name="senha-modo"]:checked').value;
      let senha;
      let bits;

      if (modo === 'frase') {
        const palavras = Array.from({ length: 5 }, () => sortear(PALAVRAS));
        palavras[aleatorio(5)] = palavras[0].charAt(0).toUpperCase() + palavras[0].slice(1);
        senha = palavras.join('-') + aleatorio(100);
        bits = 5 * Math.log2(PALAVRAS.length) + Math.log2(100);
      } else {
        const tamanho = Number($('#senha-tam').value);
        const ativos = Object.keys(CONJUNTOS).filter((k) => $('#senha-' + k).checked);
        if (!ativos.length) {
          $('#senha-saida').value = '';
          $('#senha-forca').textContent = 'marca pelo menos um tipo de caractere.';
          return;
        }
        const limpar = (t) => ($('#senha-parecidos').checked ? t.replace(PARECIDOS, '') : t);
        const grupos = ativos.map((k) => limpar(CONJUNTOS[k]));
        const todos = grupos.join('');
        // garante pelo menos um caractere de cada tipo marcado
        for (let tentativa = 0; tentativa < 100; tentativa++) {
          senha = Array.from({ length: tamanho }, () => todos[aleatorio(todos.length)]).join('');
          if (grupos.every((g) => [...senha].some((c) => g.includes(c)))) break;
        }
        bits = tamanho * Math.log2(todos.length);
      }

      $('#senha-saida').value = senha;
      const nivel = bits < 50 ? ['fraca', 25] : bits < 80 ? ['ok', 50] : bits < 120 ? ['forte', 78] : ['absurda', 100];
      $('#senha-forca-barra').style.width = nivel[1] + '%';
      $('#senha-forca-barra').dataset.nivel = nivel[0];
      $('#senha-forca').textContent = `força: ${nivel[0]} (~${Math.round(bits)} bits)`;
    }

    $('#senha-tam').addEventListener('input', (e) => { $('#senha-tam-valor').textContent = e.target.value; gerar(); });
    raiz.querySelectorAll('input[type="checkbox"]').forEach((c) => c.addEventListener('change', gerar));
    raiz.querySelectorAll('input[name="senha-modo"]').forEach((r) => r.addEventListener('change', () => {
      $('#senha-opcoes').hidden = raiz.querySelector('input[name="senha-modo"]:checked').value === 'frase';
      gerar();
    }));
    $('#senha-gerar').addEventListener('click', gerar);
    gerar();
  }

  /* ==========================================================================
     03 · BLOCO DE NOTAS
     ========================================================================== */

  function montarNotas(raiz) {
    const CHAVE = 'k4pu-notas';
    let notas = ler(CHAVE, []);
    if (!Array.isArray(notas) || !notas.length) notas = [{ id: Date.now(), texto: '' }];
    let atual = notas[0].id;

    raiz.innerHTML = `
      <p class="ferr-desc">salva sozinho, só neste navegador. ninguém mais vê.</p>
      <div class="ferr-linha">
        <label class="ferr-campo">nota <select id="notas-lista"></select></label>
        <button type="button" class="ferr-botao" id="notas-nova">+ nova</button>
        <button type="button" class="ferr-botao" id="notas-baixar">baixar .txt</button>
        <button type="button" class="ferr-botao perigo" id="notas-apagar">apagar</button>
      </div>
      <textarea class="ferr-area notas-area" id="notas-texto" spellcheck="false" placeholder="escreve aqui. a primeira linha vira o título."></textarea>
      <p class="ferr-nota" id="notas-status"></p>`;

    const $ = (s) => raiz.querySelector(s);
    const area = $('#notas-texto');
    const titulo = (n) => (n.texto.split('\n')[0].trim() || 'sem título').slice(0, 30);
    const notaAtual = () => notas.find((n) => n.id === atual);

    function desenharLista() {
      $('#notas-lista').innerHTML = '';
      notas.forEach((n) => {
        const o = document.createElement('option');
        o.value = n.id;
        o.textContent = titulo(n);
        o.selected = n.id === atual;
        $('#notas-lista').appendChild(o);
      });
    }

    function status(textoExtra) {
      const t = area.value;
      const palavras = t.trim() ? t.trim().split(/\s+/).length : 0;
      $('#notas-status').textContent = `${t.length} caracteres · ${palavras} palavras${textoExtra ? ' · ' + textoExtra : ''}`;
    }

    function abrir(id) {
      atual = id;
      area.value = notaAtual().texto;
      desenharLista();
      status();
    }

    let timer = null;
    area.addEventListener('input', () => {
      notaAtual().texto = area.value;
      status('salvando...');
      clearTimeout(timer);
      timer = setTimeout(() => {
        const ok = gravar(CHAVE, notas);
        const h = new Date();
        status(ok ? `salvo às ${String(h.getHours()).padStart(2, '0')}:${String(h.getMinutes()).padStart(2, '0')}` : 'não deu pra salvar neste navegador');
        const opcao = $('#notas-lista').selectedOptions[0];
        if (opcao) opcao.textContent = titulo(notaAtual());
      }, 400);
    });

    $('#notas-lista').addEventListener('change', (e) => abrir(Number(e.target.value)));
    $('#notas-nova').addEventListener('click', () => {
      const nova = { id: Date.now(), texto: '' };
      notas.unshift(nova);
      gravar(CHAVE, notas);
      abrir(nova.id);
      area.focus();
    });
    $('#notas-apagar').addEventListener('click', () => {
      if (notaAtual().texto && !confirm(`apagar "${titulo(notaAtual())}"? não tem volta.`)) return;
      notas = notas.filter((n) => n.id !== atual);
      if (!notas.length) notas = [{ id: Date.now(), texto: '' }];
      gravar(CHAVE, notas);
      abrir(notas[0].id);
    });
    $('#notas-baixar').addEventListener('click', () => {
      const nome = titulo(notaAtual()).replace(/[^\w\- ]+/g, '').trim() || 'nota';
      baixar(nome + '.txt', area.value);
    });

    abrir(atual);
  }

  /* ==========================================================================
     04 · CONVERSOR DE TEXTO
     ========================================================================== */

  function montarTexto(raiz) {
    const PEQUENAS = 'ᴀʙᴄᴅᴇꜰɢʜɪᴊᴋʟᴍɴᴏᴘǫʀꜱᴛᴜᴠᴡxʏᴢ';
    const MORSE = { a: '.-', b: '-...', c: '-.-.', d: '-..', e: '.', f: '..-.', g: '--.', h: '....', i: '..', j: '.---', k: '-.-', l: '.-..', m: '--', n: '-.', o: '---', p: '.--.', q: '--.-', r: '.-.', s: '...', t: '-', u: '..-', v: '...-', w: '.--', x: '-..-', y: '-.--', z: '--..', 0: '-----', 1: '.----', 2: '..---', 3: '...--', 4: '....-', 5: '.....', 6: '-....', 7: '--...', 8: '---..', 9: '----.' };

    // troca letras/números por versões unicode (negrito, cursiva, círculo...)
    function mapear(t, maiuscula, minuscula, digito) {
      return [...t.normalize('NFD')].map((c) => {
        const p = c.codePointAt(0);
        if (p >= 65 && p <= 90 && maiuscula) return String.fromCodePoint(maiuscula + p - 65);
        if (p >= 97 && p <= 122 && minuscula) return String.fromCodePoint(minuscula + p - 97);
        if (p >= 48 && p <= 57 && digito) return typeof digito === 'function' ? digito(p - 48) : String.fromCodePoint(digito + p - 48);
        return c;
      }).join('').normalize('NFC');
    }

    const CONVERSOES = [
      ['MAIÚSCULAS', (t) => t.toUpperCase()],
      ['minúsculas', (t) => t.toLowerCase()],
      ['Título', (t) => t.toLowerCase().replace(/(^|\s)(\S)/g, (m, a, b) => a + b.toUpperCase())],
      ['aLtErNaDo', (t) => { let i = 0; return [...t].map((c) => (/\p{L}/u.test(c) ? (i++ % 2 ? c.toUpperCase() : c.toLowerCase()) : c)).join(''); }],
      ['l33t', (t) => t.replace(/[aeiostAEIOST]/g, (c) => ({ a: '4', e: '3', i: '1', o: '0', s: '5', t: '7' }[c.toLowerCase()]))],
      ['invertido', (t) => [...t].reverse().join('')],
      ['e s p a ç a d o', (t) => [...t].join(' ')],
      ['versalete', (t) => [...t.toLowerCase().normalize('NFD')].map((c) => { const p = c.charCodeAt(0); return p >= 97 && p <= 122 ? PEQUENAS[p - 97] : c; }).join('').normalize('NFC')],
      ['negrito', (t) => mapear(t, 0x1D5D4, 0x1D5EE, 0x1D7EC)],
      ['cursiva', (t) => mapear(t, 0x1D4D0, 0x1D4EA, 0)],
      ['bolinha', (t) => mapear(t, 0x24B6, 0x24D0, (d) => (d === 0 ? '⓪' : String.fromCodePoint(0x2460 + d - 1)))],
      ['glitch', (t) => [...t].map((c) => (c === ' ' ? c : c + Array.from({ length: 1 + aleatorio(3) }, () => String.fromCodePoint(0x0300 + aleatorio(0x70))).join(''))).join('')],
      ['morse', (t) => t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').split(' ').map((p) => [...p].map((c) => MORSE[c] || '').filter(Boolean).join(' ')).join(' / ')]
    ];

    raiz.innerHTML = `
      <p class="ferr-desc">escreve em cima. clica em qualquer resultado pra copiar.</p>
      <textarea class="ferr-area" id="texto-entrada" rows="3" spellcheck="false">still here 33</textarea>
      <div class="conversoes" id="texto-saidas"></div>`;

    const entrada = raiz.querySelector('#texto-entrada');
    const saidas = raiz.querySelector('#texto-saidas');

    saidas.innerHTML = CONVERSOES.map(([nome], i) => `
      <button type="button" class="conversao" data-i="${i}">
        <span class="conversao-nome">${nome}</span>
        <span class="conversao-valor"></span>
      </button>`).join('');

    function atualizar() {
      const t = entrada.value;
      saidas.querySelectorAll('.conversao').forEach((b) => {
        const valor = CONVERSOES[Number(b.dataset.i)][1](t);
        b.querySelector('.conversao-valor').textContent = valor || '—';
        b.dataset.copiar = valor;
      });
    }

    entrada.addEventListener('input', atualizar);
    atualizar();
  }

  /* ==========================================================================
     05 · POMODORO
     ========================================================================== */

  function montarPomodoro(raiz) {
    const MODOS = {
      foco: { nome: 'foco', minutos: 25 },
      pausa: { nome: 'pausa', minutos: 5 },
      longa: { nome: 'pausa longa', minutos: 15 }
    };
    const hoje = new Date().toISOString().slice(0, 10);
    const registro = ler('k4pu-pomodoro', {});
    let ciclos = registro.dia === hoje ? registro.ciclos : 0;

    let modo = 'foco';
    let restante = MODOS.foco.minutos * 60;
    let fim = null;
    let timer = null;
    const tituloOriginal = document.title;

    raiz.innerHTML = `
      <p class="ferr-desc">25 minutos de foco, 5 de pausa. a cada 4 focos, uma pausa longa.</p>
      <div class="ferr-linha pomodoro-modos">
        <button type="button" class="ferr-botao" data-modo="foco">foco 25</button>
        <button type="button" class="ferr-botao" data-modo="pausa">pausa 5</button>
        <button type="button" class="ferr-botao" data-modo="longa">longa 15</button>
        <label class="ferr-campo">min <input type="number" id="pomo-min" min="1" max="180" value="25"></label>
      </div>
      <div class="pomodoro-visor">
        <div class="pomodoro-modo" id="pomo-modo">foco</div>
        <div class="pomodoro-tempo" id="pomo-tempo">25:00</div>
        <div class="pomodoro-barra" id="pomo-barra"></div>
      </div>
      <div class="ferr-linha">
        <button type="button" class="ferr-botao principal" id="pomo-play">▶ começar</button>
        <button type="button" class="ferr-botao" id="pomo-zerar">zerar</button>
        <button type="button" class="ferr-botao" id="pomo-pular">pular</button>
      </div>
      <p class="ferr-nota" id="pomo-ciclos"></p>`;

    const $ = (s) => raiz.querySelector(s);
    const total = () => MODOS[modo].minutos * 60;
    const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

    function desenhar() {
      $('#pomo-tempo').textContent = fmt(restante);
      $('#pomo-modo').textContent = MODOS[modo].nome + (fim ? '' : ' · pausado');
      const feito = 1 - restante / total();
      const cheio = Math.round(feito * 30);
      $('#pomo-barra').textContent = '[' + '#'.repeat(cheio) + '.'.repeat(30 - cheio) + ']';
      $('#pomo-play').textContent = fim ? '❚❚ pausar' : '▶ começar';
      $('#pomo-ciclos').textContent = `focos completos hoje: ${ciclos}`;
      raiz.querySelectorAll('[data-modo]').forEach((b) => b.classList.toggle('ativo', b.dataset.modo === modo));
      document.title = fim ? `${fmt(restante)} · ${MODOS[modo].nome}` : tituloOriginal;
    }

    function tique() {
      restante = Math.max(0, Math.round((fim - Date.now()) / 1000));
      if (restante === 0) terminar();
      desenhar();
    }

    function pausar() {
      clearInterval(timer);
      fim = null;
      desenhar();
    }

    function terminar() {
      clearInterval(timer);
      fim = null;
      bip([660, 880, 990]);
      if (modo === 'foco') {
        ciclos++;
        gravar('k4pu-pomodoro', { dia: hoje, ciclos });
        avisar(ciclos % 4 === 0 ? 'foco feito! agora uma pausa longa.' : 'foco feito! respira um pouco.');
        trocarModo(ciclos % 4 === 0 ? 'longa' : 'pausa');
      } else {
        avisar('pausa acabou. bora?');
        trocarModo('foco');
      }
    }

    function trocarModo(novo) {
      pausar();
      modo = novo;
      $('#pomo-min').value = MODOS[modo].minutos;
      restante = total();
      desenhar();
    }

    $('#pomo-play').addEventListener('click', () => {
      if (fim) { pausar(); return; }
      fim = Date.now() + restante * 1000;
      timer = setInterval(tique, 250);
      desenhar();
    });
    $('#pomo-zerar').addEventListener('click', () => trocarModo(modo));
    $('#pomo-pular').addEventListener('click', () => { restante = 0; fim = Date.now(); tique(); });
    raiz.querySelectorAll('[data-modo]').forEach((b) => b.addEventListener('click', () => trocarModo(b.dataset.modo)));
    $('#pomo-min').addEventListener('change', (e) => {
      const v = Math.min(180, Math.max(1, Number(e.target.value) || 1));
      e.target.value = v;
      MODOS[modo].minutos = v;
      if (!fim) { restante = v * 60; desenhar(); }
    });

    desenhar();
  }

  /* ==========================================================================
     06 · CALCULADORA RETRÔ
     ========================================================================== */

  function montarCalculadora(raiz) {
    raiz.innerHTML = `
      <p class="ferr-desc">funciona com o teclado também. tenta chegar em 33.</p>
      <div class="calc">
        <div class="calc-visor">
          <div class="calc-historico" id="calc-historico">&nbsp;</div>
          <div class="calc-numero" id="calc-numero">0</div>
        </div>
        <div class="calc-teclas">
          <button type="button" data-tecla="C" class="calc-fn">C</button>
          <button type="button" data-tecla="±" class="calc-fn">±</button>
          <button type="button" data-tecla="%" class="calc-fn">%</button>
          <button type="button" data-tecla="/" class="calc-op">÷</button>
          <button type="button" data-tecla="7">7</button>
          <button type="button" data-tecla="8">8</button>
          <button type="button" data-tecla="9">9</button>
          <button type="button" data-tecla="*" class="calc-op">×</button>
          <button type="button" data-tecla="4">4</button>
          <button type="button" data-tecla="5">5</button>
          <button type="button" data-tecla="6">6</button>
          <button type="button" data-tecla="-" class="calc-op">−</button>
          <button type="button" data-tecla="1">1</button>
          <button type="button" data-tecla="2">2</button>
          <button type="button" data-tecla="3">3</button>
          <button type="button" data-tecla="+" class="calc-op">+</button>
          <button type="button" data-tecla="⌫" class="calc-fn">⌫</button>
          <button type="button" data-tecla="0">0</button>
          <button type="button" data-tecla=".">,</button>
          <button type="button" data-tecla="=" class="calc-igual">=</button>
        </div>
      </div>`;

    const visor = raiz.querySelector('#calc-numero');
    const historico = raiz.querySelector('#calc-historico');
    const SIMBOLO = { '+': '+', '-': '−', '*': '×', '/': '÷' };

    let atual = '0';
    let guardado = null;
    let operador = null;
    let novoNumero = false;

    const limpo = (n) => {
      if (!isFinite(n)) return 'erro';
      const t = String(parseFloat(n.toPrecision(12)));
      return t.length > 14 ? n.toExponential(6) : t;
    };
    const mostrar = () => { visor.textContent = atual.replace('.', ','); };

    function calcular(a, b, op) {
      if (op === '+') return a + b;
      if (op === '-') return a - b;
      if (op === '*') return a * b;
      if (op === '/') return b === 0 ? Infinity : a / b;
      return b;
    }

    function tecla(t) {
      if (atual === 'erro' && t !== 'C') t = 'C';
      if (/^[0-9]$/.test(t)) {
        if (novoNumero || atual === '0') { atual = t; novoNumero = false; } else if (atual.length < 14) atual += t;
      } else if (t === '.') {
        if (novoNumero) { atual = '0.'; novoNumero = false; } else if (!atual.includes('.')) atual += '.';
      } else if (t === 'C') {
        atual = '0'; guardado = null; operador = null; novoNumero = false; historico.innerHTML = '&nbsp;';
      } else if (t === '⌫') {
        if (!novoNumero) atual = atual.length > 1 ? atual.slice(0, -1) : '0';
      } else if (t === '±') {
        atual = atual.startsWith('-') ? atual.slice(1) : (atual === '0' ? '0' : '-' + atual);
      } else if (t === '%') {
        atual = limpo(parseFloat(atual) / 100);
      } else if (SIMBOLO[t]) {
        if (operador && !novoNumero) atual = limpo(calcular(guardado, parseFloat(atual), operador));
        guardado = parseFloat(atual);
        operador = t;
        novoNumero = true;
        historico.textContent = `${limpo(guardado).replace('.', ',')} ${SIMBOLO[t]}`;
      } else if (t === '=') {
        if (!operador) return;
        const b = parseFloat(atual);
        historico.textContent = `${limpo(guardado).replace('.', ',')} ${SIMBOLO[operador]} ${limpo(b).replace('.', ',')} =`;
        atual = limpo(calcular(guardado, b, operador));
        if (atual === 'erro') historico.textContent = 'divisão por zero. o universo agradece.';
        operador = null;
        guardado = null;
        novoNumero = true;
        if (atual === '33') {
          avisar('33. still here.');
          if (window.k4puNulo) window.k4puNulo.falar('ei, esse número é meu.');
        }
      }
      mostrar();
    }

    raiz.querySelector('.calc-teclas').addEventListener('click', (e) => {
      const b = e.target.closest('[data-tecla]');
      if (b) tecla(b.dataset.tecla);
    });

    const MAPA = { Enter: '=', '=': '=', Backspace: '⌫', Escape: 'C', Delete: 'C', ',': '.', x: '*', X: '*' };
    document.addEventListener('keydown', (e) => {
      if (raiz.closest('[hidden]') || raiz.hidden) return;
      if (e.target.closest('input, textarea, select')) return;
      const t = MAPA[e.key] || e.key;
      if (/^[0-9]$/.test(t) || ['.', '+', '-', '*', '/', '=', '⌫', 'C', '%'].includes(t)) {
        e.preventDefault();
        tecla(t);
        const botao = raiz.querySelector(`[data-tecla="${CSS.escape(t)}"]`);
        if (botao) { botao.classList.add('apertado'); setTimeout(() => botao.classList.remove('apertado'), 120); }
      }
    });
  }

  /* ==========================================================================
     07 · ASCII ART
     ========================================================================== */

  function montarAscii(raiz) {
    const CONJUNTOS = {
      classico: ' .:-=+*#%@',
      blocos: ' ░▒▓█',
      fino: " .'`^,:;Il!i><~+_-?][}{1)(|/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$",
      binario: ' 01',
      treze: ' .:33'
    };

    raiz.innerHTML = `
      <p class="ferr-desc">escolhe uma imagem. ela é convertida aqui mesmo, não sobe pra lugar nenhum.</p>
      <div class="ferr-linha">
        <label class="ferr-botao principal ferr-arquivo">escolher imagem<input type="file" id="ascii-arquivo" accept="image/*"></label>
        <button type="button" class="ferr-botao" id="ascii-exemplo">usar a arte do site</button>
      </div>
      <div class="ferr-linha">
        <label class="ferr-campo">largura <output id="ascii-larg-valor">90</output>
          <input type="range" id="ascii-largura" min="30" max="180" value="90">
        </label>
        <label class="ferr-campo">caracteres
          <select id="ascii-conjunto">
            <option value="classico">clássico</option>
            <option value="blocos">blocos</option>
            <option value="fino">detalhado</option>
            <option value="binario">binário</option>
            <option value="treze">33</option>
          </select>
        </label>
        <label class="ferr-check"><input type="checkbox" id="ascii-inverter"> inverter</label>
      </div>
      <pre class="ascii-saida" id="ascii-saida">nenhuma imagem ainda.</pre>
      <div class="ferr-linha">
        <button type="button" class="ferr-botao" data-copiar-de="ascii-saida">copiar</button>
        <button type="button" class="ferr-botao" id="ascii-baixar">baixar .txt</button>
      </div>`;

    const $ = (s) => raiz.querySelector(s);
    const saida = $('#ascii-saida');
    let imagem = null;

    function converter() {
      if (!imagem) return;
      const largura = Number($('#ascii-largura').value);
      const altura = Math.max(1, Math.round(largura * (imagem.height / imagem.width) * 0.56));
      const canvas = document.createElement('canvas');
      canvas.width = largura;
      canvas.height = altura;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      ctx.drawImage(imagem, 0, 0, largura, altura);
      let dados;
      try {
        dados = ctx.getImageData(0, 0, largura, altura).data;
      } catch (e) {
        saida.textContent = 'o navegador bloqueou essa imagem quando o site é aberto direto do computador.\nescolhe uma imagem sua pelo botão, ou testa com o site publicado.';
        return;
      }
      let chars = CONJUNTOS[$('#ascii-conjunto').value];
      // fundo escuro: caractere "cheio" = claro. inverter troca isso.
      if ($('#ascii-inverter').checked) chars = [...chars].reverse().join('');
      let texto = '';
      for (let y = 0; y < altura; y++) {
        for (let x = 0; x < largura; x++) {
          const i = (y * largura + x) * 4;
          const luz = (0.299 * dados[i] + 0.587 * dados[i + 1] + 0.114 * dados[i + 2]) / 255;
          const alfa = dados[i + 3] / 255;
          texto += chars[Math.min(chars.length - 1, Math.floor(luz * alfa * chars.length))];
        }
        texto += '\n';
      }
      saida.textContent = texto;
      saida.style.fontSize = `${Math.max(4, Math.min(11, 640 / largura))}px`;
    }

    function carregar(src) {
      const img = new Image();
      img.onload = () => { imagem = img; converter(); };
      img.onerror = () => { saida.textContent = 'não consegui abrir essa imagem.'; };
      img.src = src;
    }

    $('#ascii-arquivo').addEventListener('change', (e) => {
      const arquivo = e.target.files[0];
      if (!arquivo) return;
      const leitor = new FileReader();
      leitor.onload = () => carregar(leitor.result);
      leitor.readAsDataURL(arquivo);
    });
    $('#ascii-exemplo').addEventListener('click', () => carregar('imagens/artecodigo%5D.jpg'));
    $('#ascii-largura').addEventListener('input', (e) => { $('#ascii-larg-valor').textContent = e.target.value; converter(); });
    $('#ascii-conjunto').addEventListener('change', converter);
    $('#ascii-inverter').addEventListener('change', converter);
    $('#ascii-baixar').addEventListener('click', () => { if (imagem) baixar('ascii-33.txt', saida.textContent); });
  }

  /* ==========================================================================
     08 · CARTÃO DE LINK
     ========================================================================== */

  function montarCartao(raiz) {
    const CORES = { verde: '#78d4a6', ouro: '#f0c674', ferrugem: '#e0786a', azul: '#6fb3d9' };

    raiz.innerHTML = `
      <p class="ferr-desc">transforma um link num cartão bonito pra mandar ou postar. (encurtar de verdade precisaria de um servidor, então aqui o link vai inteiro dentro do qr code.)</p>
      <div class="cartao-form">
        <label class="ferr-campo bloco">link <input type="url" id="cartao-link" placeholder="https://..." value="https://neysidi40-debug.github.io/33/"></label>
        <label class="ferr-campo bloco">título <input type="text" id="cartao-titulo" maxlength="40" value="k4pu 33"></label>
        <label class="ferr-campo bloco">descrição <input type="text" id="cartao-desc" maxlength="80" value="meu pequeno canto da internet."></label>
        <div class="ferr-linha">
          <label class="ferr-campo">cor
            <select id="cartao-cor">
              <option value="verde">verde</option>
              <option value="ouro">ouro</option>
              <option value="ferrugem">ferrugem</option>
              <option value="azul">azul</option>
            </select>
          </label>
          <label class="ferr-check"><input type="checkbox" id="cartao-qr" checked> qr code</label>
        </div>
      </div>
      <canvas class="cartao-canvas" id="cartao-canvas" width="1200" height="630"></canvas>
      <div class="ferr-linha">
        <button type="button" class="ferr-botao principal" id="cartao-baixar">baixar png</button>
        <button type="button" class="ferr-botao" id="cartao-copiar">copiar link</button>
      </div>`;

    const $ = (s) => raiz.querySelector(s);
    const canvas = $('#cartao-canvas');
    const ctx = canvas.getContext('2d');

    function linkLimpo() {
      let l = $('#cartao-link').value.trim();
      if (l && !/^[a-z]+:\/\//i.test(l)) l = 'https://' + l;
      return l;
    }

    // quebra texto em linhas que cabem na largura
    function quebrar(texto, largura) {
      const linhas = [];
      let linha = '';
      texto.split(' ').forEach((p) => {
        const teste = linha ? linha + ' ' + p : p;
        if (ctx.measureText(teste).width > largura && linha) { linhas.push(linha); linha = p; } else linha = teste;
      });
      if (linha) linhas.push(linha);
      return linhas;
    }

    function desenhar() {
      const W = 1200;
      const H = 630;
      const cor = CORES[$('#cartao-cor').value];
      const link = linkLimpo();
      const comQR = $('#cartao-qr').checked && link;
      const fonte = "'Space Mono', 'Courier New', monospace";

      ctx.fillStyle = '#090909';
      ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = 'rgba(255,255,255,0.025)';
      for (let y = 0; y < H; y += 24) { ctx.beginPath(); ctx.moveTo(0, y + 0.5); ctx.lineTo(W, y + 0.5); ctx.stroke(); }

      // janela
      ctx.fillStyle = '#111';
      ctx.fillRect(40, 40, W - 80, H - 80);
      ctx.strokeStyle = '#303030';
      ctx.lineWidth = 2;
      ctx.strokeRect(40, 40, W - 80, H - 80);
      ctx.fillStyle = '#171717';
      ctx.fillRect(41, 41, W - 82, 48);
      ctx.fillStyle = '#777';
      ctx.font = `20px ${fonte}`;
      ctx.fillText('link  /  k4pu-33  /  cartao.md', 64, 72);
      ctx.fillStyle = cor;
      ctx.fillRect(40, 89, 4, H - 129);

      const larguraTexto = comQR ? 640 : W - 180;
      ctx.fillStyle = cor;
      ctx.font = `20px ${fonte}`;
      ctx.fillText('# link', 84, 150);

      ctx.fillStyle = '#f3f3f3';
      ctx.font = `bold 58px ${fonte}`;
      const linhasTitulo = quebrar($('#cartao-titulo').value || 'sem título', larguraTexto).slice(0, 2);
      linhasTitulo.forEach((l, i) => ctx.fillText(l, 84, 225 + i * 66));

      let y = 225 + linhasTitulo.length * 66 + 10;
      ctx.fillStyle = '#999';
      ctx.font = `26px ${fonte}`;
      quebrar($('#cartao-desc').value, larguraTexto).slice(0, 3).forEach((l) => { ctx.fillText(l, 84, y); y += 38; });

      ctx.fillStyle = cor;
      ctx.font = `22px ${fonte}`;
      let mostrar = link.replace(/^https?:\/\//, '');
      while (ctx.measureText('→ ' + mostrar).width > larguraTexto && mostrar.length > 4) mostrar = mostrar.slice(0, -2);
      if (mostrar !== link.replace(/^https?:\/\//, '')) mostrar += '…';
      ctx.fillText('→ ' + (mostrar || 'cola um link aí'), 84, H - 92);

      if (comQR) {
        try {
          desenharQR(ctx, link, W - 380, 150, 280, '#090909', '#f3f3f3', 2);
          ctx.fillStyle = '#666';
          ctx.font = `18px ${fonte}`;
          ctx.fillText('aponta a câmera', W - 340, 462);
        } catch (e) {
          ctx.fillStyle = '#e0786a';
          ctx.font = `18px ${fonte}`;
          ctx.fillText('link grande demais pro qr', W - 380, 300);
        }
      }

      ctx.fillStyle = '#555';
      ctx.font = `18px ${fonte}`;
      ctx.fillText('k4pu 33 · still here', W - 300, H - 62);
    }

    raiz.querySelectorAll('input, select').forEach((c) => c.addEventListener('input', desenhar));
    $('#cartao-baixar').addEventListener('click', () => canvas.toBlob((b) => baixar('cartao-33.png', b)));
    $('#cartao-copiar').addEventListener('click', () => { if (linkLimpo()) copiar(linkLimpo()); });

    desenhar();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(desenhar);
  }

  /* ==========================================================================
     09 · QR CODE
     ========================================================================== */

  function montarQR(raiz) {
    const ESTILOS = {
      classico: ['#000000', '#ffffff'],
      terminal: ['#78d4a6', '#090909'],
      papel: ['#23304a', '#f7f2e6'],
      ouro: ['#3a2405', '#f0c674']
    };

    raiz.innerHTML = `
      <p class="ferr-desc">texto, link, wi-fi, o que for. gerado aqui mesmo.</p>
      <textarea class="ferr-area" id="qr-texto" rows="2" spellcheck="false">https://neysidi40-debug.github.io/33/</textarea>
      <div class="ferr-linha">
        <label class="ferr-campo">estilo
          <select id="qr-estilo">
            <option value="classico">clássico</option>
            <option value="terminal">terminal</option>
            <option value="papel">papel</option>
            <option value="ouro">ouro</option>
          </select>
        </label>
        <label class="ferr-campo">tamanho
          <select id="qr-tamanho">
            <option value="256">256px</option>
            <option value="512" selected>512px</option>
            <option value="1024">1024px</option>
          </select>
        </label>
        <button type="button" class="ferr-botao principal" id="qr-baixar">baixar png</button>
      </div>
      <canvas class="qr-canvas" id="qr-canvas" width="512" height="512"></canvas>
      <p class="ferr-nota" id="qr-info"></p>
      <p class="ferr-nota">dica: pra wi-fi, escreve assim → WIFI:T:WPA;S:nome-da-rede;P:senha;;</p>`;

    const $ = (s) => raiz.querySelector(s);
    const canvas = $('#qr-canvas');

    function desenhar() {
      const tamanho = Number($('#qr-tamanho').value);
      canvas.width = tamanho;
      canvas.height = tamanho;
      const [escuro, claro] = ESTILOS[$('#qr-estilo').value];
      const ctx = canvas.getContext('2d');
      const texto = $('#qr-texto').value;
      if (!texto) {
        ctx.fillStyle = claro;
        ctx.fillRect(0, 0, tamanho, tamanho);
        $('#qr-info').textContent = 'escreve alguma coisa.';
        return;
      }
      try {
        const n = desenharQR(ctx, texto, 0, 0, tamanho, escuro, claro, 3);
        $('#qr-info').textContent = `${texto.length} caracteres · ${n}×${n} módulos`;
      } catch (e) {
        ctx.fillStyle = claro;
        ctx.fillRect(0, 0, tamanho, tamanho);
        $('#qr-info').textContent = 'texto grande demais pra um qr code.';
      }
    }

    $('#qr-texto').addEventListener('input', desenhar);
    $('#qr-estilo').addEventListener('change', desenhar);
    $('#qr-tamanho').addEventListener('change', desenhar);
    $('#qr-baixar').addEventListener('click', () => canvas.toBlob((b) => baixar('qr-33.png', b)));
    desenhar();
  }

  /* ==========================================================================
     10 · RANDOMIZADOR
     ========================================================================== */

  function montarSorteio(raiz) {
    const DESAFIOS = [
      'beber um copo d\'água agora.',
      'mandar mensagem pra alguém que você não fala há tempo.',
      'ficar 10 minutos sem celular.',
      'arrumar uma coisa no seu quarto. só uma.',
      'ouvir um álbum inteiro sem pular nenhuma.',
      'sair e olhar pro céu por 2 minutos.',
      'escrever 3 coisas que deram certo hoje.',
      'dormir antes da meia-noite. boa sorte.',
      'tirar uma foto de algo bonito e não postar.',
      'comer uma fruta.',
      'alongar por 5 minutos.',
      'apagar 33 fotos inúteis da galeria do celular.',
      'elogiar alguém de verdade hoje.',
      'desenhar alguma coisa, mesmo que fique feia.'
    ];
    const DADO = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];

    raiz.innerHTML = `
      <p class="ferr-desc">pra quando você não consegue decidir. (ou seja: sempre.)</p>
      <div class="ferr-linha sorteio-abas" role="tablist">
        <button type="button" class="ferr-botao ativo" data-aba="numero">número</button>
        <button type="button" class="ferr-botao" data-aba="lista">lista</button>
        <button type="button" class="ferr-botao" data-aba="cor">cor</button>
        <button type="button" class="ferr-botao" data-aba="desafio">desafio</button>
        <button type="button" class="ferr-botao" data-aba="moeda">moeda</button>
        <button type="button" class="ferr-botao" data-aba="dado">dado</button>
      </div>
      <div class="sorteio-opcoes" data-opcoes="numero">
        <label class="ferr-campo">de <input type="number" id="sorteio-min" value="1"></label>
        <label class="ferr-campo">até <input type="number" id="sorteio-max" value="33"></label>
      </div>
      <div class="sorteio-opcoes" data-opcoes="lista" hidden>
        <textarea class="ferr-area" id="sorteio-itens" rows="4" spellcheck="false">pizza
hambúrguer
miojo de novo
dormir sem jantar</textarea>
      </div>
      <div class="sorteio-resultado" id="sorteio-resultado" aria-live="polite">?</div>
      <div class="sorteio-detalhe" id="sorteio-detalhe"></div>
      <div class="ferr-linha">
        <button type="button" class="ferr-botao principal" id="sorteio-girar">sortear</button>
        <button type="button" class="ferr-botao" id="sorteio-copiar">copiar</button>
      </div>`;

    const $ = (s) => raiz.querySelector(s);
    let aba = 'numero';
    let ultimo = '';

    function resultado() {
      if (aba === 'numero') {
        let a = Math.round(Number($('#sorteio-min').value));
        let b = Math.round(Number($('#sorteio-max').value));
        if (a > b) [a, b] = [b, a];
        if (b - a > 1e9) b = a + 1e9;
        return { texto: String(a + aleatorio(b - a + 1)) };
      }
      if (aba === 'lista') {
        const itens = $('#sorteio-itens').value.split('\n').map((t) => t.trim()).filter(Boolean);
        return { texto: itens.length ? sortear(itens) : 'lista vazia' };
      }
      if (aba === 'cor') {
        const rgb = [aleatorio(256), aleatorio(256), aleatorio(256)];
        const hex = '#' + rgb.map((v) => v.toString(16).padStart(2, '0')).join('');
        return { texto: hex, cor: hex, detalhe: `rgb(${rgb.join(', ')})` };
      }
      if (aba === 'desafio') return { texto: sortear(DESAFIOS), pequeno: true };
      if (aba === 'moeda') return { texto: aleatorio(2) ? 'cara' : 'coroa' };
      const n = aleatorio(6);
      return { texto: DADO[n], detalhe: `deu ${n + 1}` };
    }

    function mostrar(r) {
      const el = $('#sorteio-resultado');
      el.textContent = r.texto;
      el.classList.toggle('pequeno', !!r.pequeno);
      el.style.setProperty('--cor-sorteada', r.cor || 'transparent');
      el.classList.toggle('com-cor', !!r.cor);
      $('#sorteio-detalhe').textContent = r.detalhe || '';
    }

    function girar() {
      const final = resultado();
      ultimo = final.texto;
      if (semMovimento) { mostrar(final); return; }
      let n = 0;
      const id = setInterval(() => {
        mostrar(resultado());
        if (++n >= 10) { clearInterval(id); mostrar(final); }
      }, 45);
    }

    raiz.querySelectorAll('[data-aba]').forEach((b) => b.addEventListener('click', () => {
      aba = b.dataset.aba;
      raiz.querySelectorAll('[data-aba]').forEach((x) => x.classList.toggle('ativo', x === b));
      raiz.querySelectorAll('[data-opcoes]').forEach((o) => { o.hidden = o.dataset.opcoes !== aba; });
      $('#sorteio-resultado').textContent = '?';
      $('#sorteio-resultado').classList.remove('pequeno', 'com-cor');
      $('#sorteio-detalhe').textContent = '';
      ultimo = '';
    }));
    $('#sorteio-girar').addEventListener('click', girar);
    $('#sorteio-copiar').addEventListener('click', () => { if (ultimo) copiar(ultimo); });
  }

  /* ==========================================================================
     LISTA E NAVEGAÇÃO
     ========================================================================== */

  const FERRAMENTAS = [
    { id: 'nomes', nome: 'gerador de nomes', arquivo: 'nomes.exe', montar: montarNomes },
    { id: 'senhas', nome: 'gerador de senhas', arquivo: 'senhas.exe', montar: montarSenhas },
    { id: 'notas', nome: 'bloco de notas', arquivo: 'notas.txt', montar: montarNotas },
    { id: 'texto', nome: 'conversor de texto', arquivo: 'texto.exe', montar: montarTexto },
    { id: 'pomodoro', nome: 'pomodoro', arquivo: 'pomodoro.exe', montar: montarPomodoro },
    { id: 'calculadora', nome: 'calculadora', arquivo: 'calc.exe', montar: montarCalculadora },
    { id: 'ascii', nome: 'ascii art', arquivo: 'ascii.exe', montar: montarAscii },
    { id: 'cartao', nome: 'cartão de link', arquivo: 'cartao.png', montar: montarCartao },
    { id: 'qr', nome: 'qr code', arquivo: 'qr.png', montar: montarQR },
    { id: 'sorteio', nome: 'randomizador', arquivo: 'sorteio.exe', montar: montarSorteio }
  ];

  lista.innerHTML = FERRAMENTAS.map((f, i) => `
    <li><a class="oficina-item" href="#${f.id}" data-id="${f.id}">
      <span class="oficina-num">${String(i + 1).padStart(2, '0')}</span> ${f.nome}
    </a></li>`).join('');

  const montadas = {};

  function abrir(id) {
    const f = FERRAMENTAS.find((x) => x.id === id) || FERRAMENTAS[0];
    Object.values(montadas).forEach((p) => { p.hidden = true; });
    if (!montadas[f.id]) {
      const painel = document.createElement('div');
      painel.className = 'ferramenta';
      painel.id = 'ferramenta-' + f.id;
      janela.appendChild(painel);
      try {
        f.montar(painel);
      } catch (e) {
        painel.textContent = 'essa ferramenta quebrou: ' + e.message;
      }
      montadas[f.id] = painel;
    }
    montadas[f.id].hidden = false;
    tituloJanela.textContent = `ferramentas  /  ${f.arquivo}`;
    lista.querySelectorAll('.oficina-item').forEach((a) => {
      const ativo = a.dataset.id === f.id;
      a.classList.toggle('ativo', ativo);
      if (ativo) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
  }

  window.addEventListener('hashchange', () => abrir(location.hash.slice(1)));
  abrir(location.hash.slice(1));
})();
