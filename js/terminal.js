/* ==========================================================================
   TERMINAL INTERATIVO
   Simulação de terminal 100% front-end, sem eval() e sem backend. Só compara
   o texto digitado com a lista de comandos no objeto COMANDOS, lá embaixo.

   Pra editar as respostas (about, whoami, mensagens aleatórias, música,
   links, contato), mexa só nos blocos de dados logo abaixo — não precisa
   tocar no resto do arquivo.
   ========================================================================== */

(function () {
  const janela = document.getElementById("terminal-janela");
  const corpo = document.getElementById("terminal-corpo");
  const input = document.getElementById("terminal-input");
  const digitado = document.getElementById("terminal-digitado");

  if (!janela || !corpo || !input || !digitado) return;

  /* ---------- conteúdo editável ---------- */

  const SOBRE = [
    "KAPU", "",
    "somewhere in Brazil",
    "learning code",
    "making music",
    "building things", "",
    "still figuring things out."
  ];

  const WHOAMI = ["you are a visitor.", "", "that's all I know."];

  const ALEATORIAS = [
    "you weren't supposed to find this.",
    "go outside.",
    "there is nothing here.",
    "still here?",
    "this terminal has seen things.",
    "404: motivation not found."
  ];

  const MUSICA = {
    titulo: "Na Hora do Almoço",
    artista: "Belchior",
    url: "https://www.youtube.com/watch?v=Bm2Eg2X4kZA"
  };

  const LINKS = [
    "pictures  -> galeria.html",
    "diary     -> diario.html",
    "discord   -> kapuxn"
  ];

  const CONTATO = ["discord: kapuxn", "", "esse é o jeito mais rápido de falar comigo."];

  const AJUDA = [
    "AVAILABLE COMMANDS", "",
    "about      — sobre mim",
    "diary      — acessar o diário",
    "pictures   — visualizar fotos",
    "radio      — rádio 33",
    "universo   — navegar pelo universo 33",
    "tools      — ferramentas úteis",
    "music      — músicas",
    "links      — links",
    "contact    — contato",
    "date       — data atual",
    "whoami     — informações do usuário",
    "random     — mensagem aleatória",
    "clear      — limpar terminal",
    "sudo       — comando secreto",
    "help       — mostrar comandos"
  ];

  /* ---------- saída na tela ---------- */

  function rolarParaFinal() {
    corpo.scrollTop = corpo.scrollHeight;
  }

  function imprimirLinhas(linhas, opcoes) {
    const bloco = document.createElement("div");
    bloco.className = "terminal-saida fade-in";
    (linhas && linhas.length ? linhas : [""]).forEach((linha) => {
      const p = document.createElement("p");
      if (opcoes && opcoes.classe) p.classList.add(opcoes.classe);
      p.textContent = linha;
      bloco.appendChild(p);
    });
    corpo.appendChild(bloco);
    rolarParaFinal();
  }

  function imprimirComando(valorDigitado) {
    const bloco = document.createElement("div");
    bloco.className = "terminal-saida";
    const p = document.createElement("p");
    p.className = "linha-comando";
    p.textContent = valorDigitado;
    bloco.appendChild(p);
    corpo.appendChild(bloco);
    rolarParaFinal();
  }

  /* ---------- comandos ---------- */

  const COMANDOS = {
    help: () => imprimirLinhas(AJUDA),

    about: () => imprimirLinhas(SOBRE),

    whoami: () => imprimirLinhas(WHOAMI),

    date: () => {
      const agora = new Date();
      const semana = agora.toLocaleDateString("en-US", { weekday: "long" });
      const mes = agora.toLocaleDateString("en-US", { month: "long" });
      const dia = agora.getDate();
      const ano = agora.getFullYear();
      const hora = String(agora.getHours()).padStart(2, "0");
      const minuto = String(agora.getMinutes()).padStart(2, "0");
      const segundo = String(agora.getSeconds()).padStart(2, "0");
      imprimirLinhas([
        `${semana}, ${mes} ${dia} ${ano}`,
        `${hora}:${minuto}:${segundo}`
      ]);
    },

    random: () => {
      const escolha = ALEATORIAS[Math.floor(Math.random() * ALEATORIAS.length)];
      imprimirLinhas([escolha]);
    },

    sudo: () => imprimirLinhas(["permission denied.", "", "nice try."], { classe: "aviso" }),

    clear: () => { corpo.innerHTML = ""; },

    links: () => imprimirLinhas(LINKS),

    contact: () => imprimirLinhas(CONTATO),

    music: () => {
      imprimirLinhas([`playing: ${MUSICA.titulo}`, MUSICA.artista]);
      window.open(MUSICA.url, "_blank", "noopener");
    },

    diary: () => {
      imprimirLinhas(["opening diary..."], { classe: "destaque" });
      setTimeout(() => { (window.k4puNavegar || ((u) => { window.location.href = u; }))("diario.html"); }, 650);
    },

    pictures: () => {
      imprimirLinhas(["opening pictures..."], { classe: "destaque" });
      setTimeout(() => { (window.k4puNavegar || ((u) => { window.location.href = u; }))("galeria.html"); }, 650);
    },

    /* ---------- secretos: não aparecem no help ---------- */

    ls: () => imprimirLinhas(["index.html  diario.html  galeria.html  radio.html  universo.html  terminal.html"]),

    "ls -a": () => imprimirLinhas([".  ..  .segredos  .corrompido/  index.html  diario.html  galeria.html", "radio.html  universo.html  terminal.html  sala.html (trancado)"]),

    "cd .corrompido": () => {
      imprimirLinhas(["entrando em setor danificado..."], { classe: "erro" });
      setTimeout(() => { (window.k4puNavegar || ((u) => { window.location.href = u; }))("corrompido.html"); }, 800);
    },

    radio: () => {
      imprimirLinhas(["sintonizando..."], { classe: "destaque" });
      setTimeout(() => { (window.k4puNavegar || ((u) => { window.location.href = u; }))("radio.html"); }, 650);
    },

    universo: () => {
      imprimirLinhas(["decolando..."], { classe: "destaque" });
      setTimeout(() => { (window.k4puNavegar || ((u) => { window.location.href = u; }))("universo.html"); }, 650);
    },

    tools: () => {
      imprimirLinhas(["abrindo a oficina..."], { classe: "destaque" });
      setTimeout(() => { (window.k4puNavegar || ((u) => { window.location.href = u; }))("ferramentas.html"); }, 650);
    },

    nulo: () => {
      imprimirLinhas(["chamando o nulo..."], { classe: "destaque" });
      if (window.k4puNulo) window.k4puNulo.mostrar("me chamou? tô aqui embaixo.");
    },

    "cat .segredos": () => imprimirLinhas([
      "# coisas escondidas por aí",
      "- digite 'matrix' aqui",
      "- digite 'k4pu' ou 'sono' em qualquer página (fora do terminal)",
      "- clica na palavra 'exist' lá na home",
      "- o status da home não é bem o que parece",
      "- ↑ ↑ ↓ ↓ ← → ← → b a",
      "- existe uma porta. ela precisa de 3 fragmentos.",
      "- o universo tem um planeta que não devia estar lá",
      "- tem mais, mas aí já é contar demais"
    ], { classe: "destaque" }),

    matrix: () => {
      imprimirLinhas(["wake up, kapu..."], { classe: "destaque" });
      if (window.k4puMatrix) setTimeout(window.k4puMatrix, 500);
    },

    "33": () => imprimirLinhas(["still here."], { classe: "destaque" }),

    exit: () => imprimirLinhas(["não tem saída. só F5."], { classe: "aviso" }),

    "sudo rm -rf /": () => imprimirLinhas(["deletando tudo...", "", "brincadeira. já tá tudo quebrado mesmo."], { classe: "erro" })
  };

  function executar(entrada) {
    const bruto = entrada.trim();
    imprimirComando(entrada);
    if (bruto === "") return;

    const comando = bruto.toLowerCase();
    if (Object.prototype.hasOwnProperty.call(COMANDOS, comando)) {
      COMANDOS[comando]();
    } else {
      imprimirLinhas([
        `command not found: ${bruto}`, "",
        `type "help" for available commands.`
      ], { classe: "erro" });
    }
  }

  /* ---------- entrada, histórico e atalhos ---------- */

  const historico = [];
  let indiceHistorico = -1;

  function atualizarVisivel() {
    digitado.textContent = input.value;
  }

  function moverCursorParaFinal() {
    requestAnimationFrame(() => {
      input.setSelectionRange(input.value.length, input.value.length);
    });
  }

  input.addEventListener("input", atualizarVisivel);

  input.addEventListener("keydown", (evento) => {
    if (evento.key === "Enter") {
      evento.preventDefault();
      const valor = input.value;
      if (valor.trim() !== "") historico.push(valor);
      indiceHistorico = historico.length;
      executar(valor);
      input.value = "";
      atualizarVisivel();
      return;
    }

    if (evento.key === "ArrowUp") {
      if (historico.length === 0) return;
      evento.preventDefault();
      indiceHistorico = Math.max(0, indiceHistorico - 1);
      input.value = historico[indiceHistorico] || "";
      atualizarVisivel();
      moverCursorParaFinal();
      return;
    }

    if (evento.key === "ArrowDown") {
      if (historico.length === 0) return;
      evento.preventDefault();
      indiceHistorico = Math.min(historico.length, indiceHistorico + 1);
      input.value = historico[indiceHistorico] || "";
      atualizarVisivel();
      moverCursorParaFinal();
      return;
    }

    if (evento.ctrlKey && evento.key.toLowerCase() === "l") {
      evento.preventDefault();
      corpo.innerHTML = "";
    }
  });

  janela.addEventListener("click", () => input.focus());

  /* ---------- boas-vindas ---------- */

  imprimirLinhas([
    "welcome to k4pu terminal.",
    `type "help" to see available commands.`
  ], { classe: "destaque" });

  input.focus({ preventScroll: true });
})();