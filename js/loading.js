/* ==========================================================================
   Tela de loading — aparece uma vez por visita (por aba).
   Carregado no <head> de cada página, antes do resto.
   Para editar as frases do "boot", mexa em LINHAS_BOOT abaixo.
   ========================================================================== */

(function () {
  var LINHAS_BOOT = [
    ['acordando', 'ok'],
    ['procurando motivação', 'falhou'],
    ['carregando fotos', 'ok'],
    ['abrindo o diário', 'ok'],
    ['fingindo que tá tudo bem', 'ok']
  ];

  var CHAVE = 'k4pu-loading-visto';
  var raiz = document.documentElement;

  try {
    if (sessionStorage.getItem(CHAVE)) return;
    sessionStorage.setItem(CHAVE, '1');
  } catch (e) { /* sem storage: mostra mesmo assim */ }

  raiz.classList.add('carregando');

  var semMovimento = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var overlay = null;
  var fechado = false;
  var paginaPronta = document.readyState === 'complete';
  var seguranca = setTimeout(fechar, 12000); // nunca prende a pessoa aqui

  window.addEventListener('load', function () { paginaPronta = true; });

  function fechar() {
    if (fechado) return;
    fechado = true;
    clearTimeout(seguranca);
    raiz.classList.remove('carregando');
    if (!overlay) return;
    overlay.classList.add('saindo');
    setTimeout(function () { overlay.remove(); }, 450);
  }

  function barra(pct) {
    var cheio = Math.round(pct / 5);
    return '[' + '#'.repeat(cheio) + '.'.repeat(20 - cheio) + ']';
  }

  function adicionarLinha(log, texto, status) {
    var li = document.createElement('li');
    li.innerHTML = '<span class="loading-texto"></span>';
    li.firstChild.textContent = '> ' + texto + '...';
    if (status) {
      var s = document.createElement('span');
      s.className = 'loading-status loading-' + status;
      s.textContent = '[' + status + ']';
      li.appendChild(s);
    }
    log.appendChild(li);
  }

  function montar() {
    overlay = document.createElement('div');
    overlay.id = 'tela-loading';
    overlay.setAttribute('role', 'status');
    overlay.setAttribute('aria-label', 'carregando o site');
    overlay.innerHTML =
      '<div class="loading-janela">' +
        '<div class="loading-titulo">carregando &nbsp;/&nbsp; k4pu-33 &nbsp;/&nbsp; boot.log</div>' +
        '<ol class="loading-log"><li><span class="loading-comando">$ ./k4pu --iniciar</span></li></ol>' +
        '<div class="loading-progresso"><span class="loading-barra"></span> <span class="loading-pct">0%</span></div>' +
      '</div>';
    document.body.appendChild(overlay);

    var log = overlay.querySelector('.loading-log');
    var elBarra = overlay.querySelector('.loading-barra');
    var elPct = overlay.querySelector('.loading-pct');

    function mostrarPct(pct) {
      elBarra.textContent = barra(pct);
      elPct.textContent = pct + '%';
    }

    if (semMovimento) {
      LINHAS_BOOT.forEach(function (l) { adicionarLinha(log, l[0], l[1]); });
      mostrarPct(100);
      setTimeout(fechar, 900);
      return;
    }

    // linhas do log aparecendo uma a uma
    LINHAS_BOOT.forEach(function (l, i) {
      setTimeout(function () { if (!fechado) adicionarLinha(log, l[0], l[1]); }, 400 + i * 600);
    });

    // progresso: sobe aos poucos, dá uma parada no 33 e espera a página carregar
    var pct = 0;
    var pausa = 0;
    var parouNo33 = false;
    var inicio = Date.now();
    mostrarPct(0);

    var tique = setInterval(function () {
      if (fechado) { clearInterval(tique); return; }
      if (pausa > 0) { pausa--; return; }

      var tempo = Date.now() - inicio;
      var limite = (paginaPronta && tempo > 3600) || tempo > 7000 ? 100 : 92;
      pct = Math.min(limite, pct + 1 + Math.floor(Math.random() * 2));

      if (!parouNo33 && pct >= 33) { pct = 33; parouNo33 = true; pausa = 10; }
      mostrarPct(pct);

      if (pct === 100) {
        clearInterval(tique);
        var final = document.createElement('li');
        final.className = 'loading-final';
        final.textContent = 'pronto. still here';
        log.appendChild(final);
        setTimeout(fechar, 1000);
      }
    }, 60);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', montar);
  } else {
    montar();
  }
})();
