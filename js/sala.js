/* ==========================================================================
   SALA SECRETA — porta trancada por 3 fragmentos espalhados pelo site.
   A senha é a frase formada pelos fragmentos, em ordem.
   O conteúdo da sala fica em sala.html (#sala-conteudo).
   ========================================================================== */

(function () {
  const SENHA = 'still here 33';

  const porta = document.getElementById('sala-porta');
  const conteudo = document.getElementById('sala-conteudo');
  const form = document.getElementById('sala-form');
  const campo = document.getElementById('sala-senha');
  const resposta = document.getElementById('sala-resposta');
  const slots = document.querySelectorAll('.fragmento-slot');
  if (!porta || !form) return;

  const normalizar = (t) => t.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

  let aberta = false;
  try { aberta = localStorage.getItem('k4pu-sala') === 'aberta'; } catch (e) { /* ok */ }

  /* mostra os fragmentos que a pessoa já achou */
  const achados = window.k4puFragmentos ? window.k4puFragmentos() : [];
  achados.forEach(({ n, palavra }) => {
    const slot = slots[n - 1];
    if (slot) {
      slot.textContent = palavra;
      slot.classList.add('achado');
    }
  });
  const dica = document.getElementById('sala-dica');
  if (dica) {
    dica.textContent = achados.length === 3
      ? 'você tem os três. a ordem importa.'
      : `você tem ${achados.length} de 3 fragmentos. eles estão espalhados pelo site.`;
  }

  function abrir(comAnimacao) {
    aberta = true;
    try { localStorage.setItem('k4pu-sala', 'aberta'); } catch (e) { /* ok */ }
    if (comAnimacao) {
      porta.classList.add('abrindo');
      setTimeout(() => {
        porta.hidden = true;
        conteudo.hidden = false;
        if (window.k4puNulo) window.k4puNulo.falar('você entrou. bem-vindo à sala.', 5000);
      }, 1100);
    } else {
      porta.hidden = true;
      conteudo.hidden = false;
    }
  }

  if (aberta) abrir(false);

  let tentativas = 0;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (normalizar(campo.value) === SENHA) {
      resposta.textContent = 'clique.';
      abrir(true);
      return;
    }
    tentativas++;
    porta.classList.remove('tremendo');
    void porta.offsetWidth;
    porta.classList.add('tremendo');
    const respostas = [
      'nada acontece.',
      'a porta nem se mexe.',
      'errado. mas foi uma tentativa bonita.',
      'dica: o rodapé do site sabe mais do que parece.'
    ];
    resposta.textContent = respostas[Math.min(tentativas - 1, respostas.length - 1)];
    campo.select();
  });

  const fechar = document.getElementById('sala-trancar');
  if (fechar) {
    fechar.addEventListener('click', () => {
      try { localStorage.removeItem('k4pu-sala'); } catch (e) { /* ok */ }
      location.reload();
    });
  }
})();
