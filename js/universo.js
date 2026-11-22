/* ==========================================================================
   UNIVERSO 33 — navegação em forma de sistema solar.
   O sol é a home; cada planeta é uma página. Pra adicionar um planeta,
   inclua um item em PLANETAS (raio = distância do centro, em %).
   ========================================================================== */

(function () {
  const palco = document.getElementById('palco');
  const info = document.getElementById('universo-info');
  if (!palco) return;

  const semMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const contar = (lista) => (Array.isArray(lista) ? lista.length : 0);

  let salaAberta = false;
  try { salaAberta = localStorage.getItem('k4pu-sala') === 'aberta'; } catch (e) { /* ok */ }

  const PLANETAS = [
    {
      nome: 'diário', href: 'diario.html', raio: 17, tamanho: 26, periodo: 38, inicio: 0.15,
      classe: 'planeta-diario',
      info: `${contar(typeof POSTAGENS !== "undefined" && POSTAGENS)} posts escritos de madrugada`
    },
    {
      nome: 'galeria', href: 'galeria.html', raio: 26, tamanho: 34, periodo: 55, inicio: 0.6,
      classe: 'planeta-galeria', anel: true,
      info: `${contar(typeof FOTOS !== "undefined" && FOTOS)} fotos. a 33ª é especial.`
    },
    {
      nome: 'rádio', href: 'radio.html', raio: 34, tamanho: 24, periodo: 70, inicio: 0.35,
      classe: 'planeta-radio',
      info: 'estações geradas ao vivo. sintoniza aí.'
    },
    {
      nome: 'tools', href: 'ferramentas.html', raio: 30, tamanho: 16, periodo: 62, inicio: 0.1,
      classe: 'planeta-tools',
      info: '10 ferramentas úteis. a calculadora gosta do 33.'
    },
    {
      nome: 'terminal', href: 'terminal.html', raio: 41, tamanho: 20, periodo: 88, inicio: 0.85,
      classe: 'planeta-terminal',
      info: 'kapu@33:~$ digite help'
    },
    {
      nome: '???', href: 'corrompido.html', raio: 48, tamanho: 22, periodo: 120, inicio: 0.05,
      classe: 'planeta-corrompido',
      info: 'sinal corrompido. setor danificado: 33%',
      lua: {
        nome: salaAberta ? 'sala' : 'porta?',
        href: 'sala.html',
        info: salaAberta ? 'a sala secreta. você já tem a chave.' : 'uma porta trancada orbitando o nada.'
      }
    }
  ];

  /* ---------- montar planetas ---------- */

  palco.insertAdjacentHTML('beforeend', PLANETAS.map((p) => `
    <div class="orbita" style="--raio:${p.raio}%; --periodo:${p.periodo}s; --inicio:${(-p.periodo * p.inicio).toFixed(1)}s">
      <div class="planeta-ancora">
        <div class="planeta-dentro">
          <a class="planeta ${p.classe}" href="${p.href}" data-info="${p.info}" style="--tamanho:${p.tamanho}px">
            <span class="planeta-corpo">${p.anel ? '<span class="planeta-anel"></span>' : ''}</span>
            <span class="planeta-nome">${p.nome}</span>
          </a>
          ${p.lua ? `
          <div class="lua-orbita">
            <a class="lua${salaAberta ? ' aberta' : ''}" href="${p.lua.href}" data-info="${p.lua.info}">
              <span class="lua-corpo"></span><span class="planeta-nome">${p.lua.nome}</span>
            </a>
          </div>` : ''}
        </div>
      </div>
    </div>
  `).join(''));

  /* ---------- info ao passar o mouse / focar ---------- */

  const textoPadrao = info.textContent;
  palco.addEventListener('pointerover', (e) => {
    const alvo = e.target.closest('[data-info]');
    if (alvo) info.textContent = `${alvo.querySelector('.planeta-nome').textContent} — ${alvo.dataset.info}`;
  });
  palco.addEventListener('pointerout', (e) => {
    if (e.target.closest('[data-info]')) info.textContent = textoPadrao;
  });
  palco.addEventListener('focusin', (e) => {
    const alvo = e.target.closest('[data-info]');
    if (alvo) info.textContent = `${alvo.querySelector('.planeta-nome').textContent} — ${alvo.dataset.info}`;
  });

  /* fragmentos no HUD */
  const hudFragmentos = document.getElementById('universo-fragmentos');
  if (hudFragmentos && window.k4puFragmentos) {
    const achados = window.k4puFragmentos().length;
    hudFragmentos.textContent = salaAberta ? 'sala: aberta' : `fragmentos: ${achados}/3`;
  }

  /* ---------- estrelas ---------- */

  const ceu = document.getElementById('estrelas');
  const ctx = ceu.getContext('2d');
  let estrelas = [];
  let mouseX = 0;
  let mouseY = 0;
  let velocidade = 0;

  function criarEstrelas() {
    const escala = window.devicePixelRatio || 1;
    ceu.width = innerWidth * escala;
    ceu.height = innerHeight * escala;
    ctx.setTransform(escala, 0, 0, escala, 0, 0);
    const quantidade = Math.min(320, Math.floor(innerWidth * innerHeight / 4500));
    estrelas = Array.from({ length: quantidade }, () => ({
      x: Math.random() * innerWidth,
      y: Math.random() * innerHeight,
      z: Math.random() * 0.9 + 0.1, // profundidade
      fase: Math.random() * Math.PI * 2
    }));
  }

  function corEstrela() {
    return getComputedStyle(ceu).getPropertyValue('--cor-estrela').trim() || '#ffffff';
  }

  let cor = '#ffffff';
  function desenharCeu(t) {
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    ctx.fillStyle = cor;
    const cx = innerWidth / 2;
    const cy = innerHeight / 2;
    for (const s of estrelas) {
      const px = s.x - mouseX * s.z * 18;
      const py = s.y - mouseY * s.z * 18;
      const brilho = 0.35 + 0.65 * Math.abs(Math.sin(t / 900 + s.fase)) * s.z;
      ctx.globalAlpha = brilho;
      if (velocidade > 0) {
        // efeito de dobra: estrelas viram riscos saindo do centro
        const dx = px - cx;
        const dy = py - cy;
        ctx.strokeStyle = cor;
        ctx.lineWidth = s.z * 1.6;
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(px + dx * velocidade * s.z, py + dy * velocidade * s.z);
        ctx.stroke();
      } else {
        const r = s.z * 1.4;
        ctx.fillRect(px, py, r, r);
      }
    }
    ctx.globalAlpha = 1;
  }

  function loop(t) {
    desenharCeu(t);
    requestAnimationFrame(loop);
  }

  criarEstrelas();
  cor = corEstrela();
  if (semMovimento) desenharCeu(0);
  else requestAnimationFrame(loop);

  window.addEventListener('resize', () => { criarEstrelas(); if (semMovimento) desenharCeu(0); });
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX / innerWidth - 0.5;
    mouseY = e.clientY / innerHeight - 0.5;
  }, { passive: true });
  new MutationObserver(() => { cor = corEstrela(); if (semMovimento) desenharCeu(0); })
    .observe(document.documentElement, { attributes: true, attributeFilter: ['data-tema'] });

  /* ---------- viajar: zoom no planeta e troca de página ---------- */

  document.addEventListener('click', (e) => {
    const destino = e.target.closest('.planeta, .lua, .sol');
    if (!destino || e.ctrlKey || e.metaKey || e.shiftKey || semMovimento) return;
    e.preventDefault();

    const caixaPalco = palco.getBoundingClientRect();
    const caixa = destino.getBoundingClientRect();
    const ox = caixa.left + caixa.width / 2 - caixaPalco.left;
    const oy = caixa.top + caixa.height / 2 - caixaPalco.top;
    palco.style.transformOrigin = `${ox}px ${oy}px`;
    document.body.classList.add('viajando');
    info.textContent = `viajando para ${destino.querySelector('.planeta-nome, .sol-nome').textContent}...`;

    const inicio = performance.now();
    (function acelerar(agora) {
      velocidade = Math.min(0.9, (agora - inicio) / 700);
      if (velocidade < 0.9) requestAnimationFrame(acelerar);
    })(inicio);

    try { sessionStorage.setItem('k4pu-transicao', 'dobra'); } catch (err) { /* ok */ }
    setTimeout(() => { window.location.href = destino.getAttribute('href'); }, 750);
  });

  // voltar pelo botão do navegador não deixa a página presa no zoom
  window.addEventListener('pageshow', () => {
    document.body.classList.remove('viajando');
    velocidade = 0;
  });
})();
