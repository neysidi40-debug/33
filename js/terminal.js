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
      setTimeout(() => { window.location.href = "diario.html"; }, 650);
    },

    pictures: () => {
      imprimirLinhas(["opening pictures..."], { classe: "destaque" });
      setTimeout(() => { window.location.href = "galeria.html"; }, 650);
    }
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