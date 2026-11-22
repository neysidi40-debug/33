/* ==========================================================================
   ARQUIVOS CORROMPIDOS
   Cada arquivo começa ilegível e "decodifica" quando aberto.
   Pra escrever novos arquivos, edite a lista ARQUIVOS abaixo.
   ========================================================================== */

(function () {
  const ARQUIVOS = [
    {
      nome: 'memoria_01.txt',
      tamanho: '3,3 KB',
      linhas: [
        'eu lembro de pouca coisa daquele ano.',
        'lembro do barulho do ventilador.',
        'lembro de achar que tudo ia melhorar no mês seguinte.',
        'não melhorou. mas eu continuei aqui.'
      ]
    },
    {
      nome: 'diario_apagado.log',
      tamanho: '0 KB',
      linhas: [
        '[03:33] não consigo dormir de novo',
        '[03:41] fiquei olhando pro teto contando nada',
        '[04:02] apaguei tudo que eu tinha escrito',
        '[04:03] mas o log guardou. logs sempre guardam.'
      ]
    },
    {
      nome: 'IMG_0000.jpg',
      tamanho: '??? KB',
      imagem: 'imagens/artecodigo].jpg'
    },
    {
      nome: 'nulo.exe',
      tamanho: '12 KB',
      negado: true,
      linhas: ['acesso negado.', '', 'ele não gosta que mexam nas coisas dele.']
    },
    {
      nome: '33.dat',
      tamanho: '33 B',
      fragmento: 3,
      linhas: [
        '0x33 0x33 0x33 0x33',
        'setor recuperado.',
        '',
        'fragmento 3/3: "33"'
      ]
    },
    {
      nome: '????.???',
      tamanho: 'erro',
      aleatorio: true
    }
  ];

  const LIXO = '▓▒░█▄▀■□◊¤§¶ø∆µ#%&@$?!<>/\\|01';
  const semMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const lista = document.getElementById('lista-arquivos');
  const visor = document.getElementById('visor-arquivo');
  const tituloVisor = document.getElementById('visor-titulo');
  if (!lista || !visor) return;

  const lixo = (n) => Array.from({ length: n }, () => LIXO[(Math.random() * LIXO.length) | 0]).join('');

  /* ---------- lista de arquivos ---------- */

  lista.innerHTML = ARQUIVOS.map((a, i) => `
    <li>
      <button type="button" class="arquivo" data-indice="${i}">
        <span class="arquivo-nome" data-texto="${a.nome}">${a.nome}</span>
        <span class="arquivo-tamanho">${a.tamanho}</span>
      </button>
    </li>
  `).join('');

  /* nomes "piscam" corrompidos de vez em quando */
  if (!semMovimento) {
    setInterval(() => {
      const nomes = lista.querySelectorAll('.arquivo-nome');
      const alvo = nomes[(Math.random() * nomes.length) | 0];
      const original = alvo.dataset.texto;
      alvo.textContent = lixo(original.length);
      setTimeout(() => { alvo.textContent = original; }, 140);
    }, 1400);
  }

  /* ---------- decodificar texto ---------- */

  let animacao = null;

  function decodificar(linhas, aoTerminar) {
    clearInterval(animacao);
    const alvo = linhas.join('\n');
    let revelados = 0;

    if (semMovimento) {
      visor.textContent = alvo;
      if (aoTerminar) aoTerminar();
      return;
    }

    animacao = setInterval(() => {
      revelados += 2;
      let saida = '';
      for (let i = 0; i < alvo.length; i++) {
        const c = alvo[i];
        saida += i < revelados || c === '\n' || c === ' ' ? c : LIXO[(Math.random() * LIXO.length) | 0];
      }
      visor.textContent = saida;
      if (revelados >= alvo.length) {
        clearInterval(animacao);
        if (aoTerminar) aoTerminar();
      }
    }, 28);
  }

  /* ---------- imagem com glitch ---------- */

  function imagemGlitch(src) {
    clearInterval(animacao);
    visor.innerHTML = '<canvas class="visor-canvas" width="480" height="300"></canvas><p class="visor-nota">arquivo parcialmente recuperado.</p>';
    const canvas = visor.querySelector('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      const desenhar = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        // faixas deslocadas
        for (let i = 0; i < 9; i++) {
          const y = Math.random() * canvas.height;
          const h = 4 + Math.random() * 26;
          const dx = (Math.random() - 0.5) * 70;
          ctx.drawImage(canvas, 0, y, canvas.width, h, dx, y, canvas.width, h);
        }
        // canal de cor separado
        ctx.globalCompositeOperation = 'screen';
        ctx.fillStyle = 'rgba(255, 0, 60, 0.12)';
        ctx.fillRect((Math.random() - 0.5) * 8, 0, canvas.width, canvas.height);
        ctx.globalCompositeOperation = 'source-over';
        // pixels mortos
        ctx.fillStyle = '#090909';
        ctx.fillRect(0, canvas.height * (0.55 + Math.random() * 0.3), canvas.width, 3 + Math.random() * 30);
      };
      desenhar();
      if (!semMovimento) animacao = setInterval(desenhar, 180);
    };
    img.onerror = () => decodificar(['falha ao ler setor.', 'imagem perdida pra sempre.']);
    img.src = src;
  }

  /* ---------- abrir ---------- */

  lista.addEventListener('click', (e) => {
    const botao = e.target.closest('.arquivo');
    if (!botao) return;
    const arquivo = ARQUIVOS[Number(botao.dataset.indice)];

    lista.querySelectorAll('.arquivo').forEach((b) => b.classList.toggle('aberto', b === botao));
    tituloVisor.textContent = arquivo.nome;
    visor.classList.toggle('negado', !!arquivo.negado);
    visor.classList.remove('glitch-forte');
    void visor.offsetWidth;
    visor.classList.add('glitch-forte');

    if (arquivo.imagem) {
      imagemGlitch(arquivo.imagem);
    } else if (arquivo.aleatorio) {
      clearInterval(animacao);
      visor.textContent = Array.from({ length: 8 }, () => lixo(20 + ((Math.random() * 24) | 0))).join('\n');
    } else {
      decodificar(arquivo.linhas, () => {
        if (arquivo.fragmento && window.k4puFragmento) window.k4puFragmento(arquivo.fragmento);
        if (arquivo.negado && window.k4puNulo) window.k4puNulo.falar('ei. sai daí.');
      });
    }
  });

  /* setor danificado sobe e desce sozinho */
  const setor = document.getElementById('setor-danificado');
  if (setor && !semMovimento) {
    setInterval(() => {
      setor.textContent = (30 + Math.random() * 6).toFixed(1) + '%';
    }, 900);
  }
})();
