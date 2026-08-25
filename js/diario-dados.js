/* ==========================================================================
   DADOS DO DIÁRIO
   Para adicionar uma nova postagem, copie um dos objetos abaixo, cole no
   TOPO da lista (fica em primeiro no site) e edite os campos:

   - id：um texto único, sem espaços (ex: "2026-08-24-dia-corrido")
   - data: any texto, ex: "24 de agosto de 2026"
   - titulo: título da postagem
   - resumo: um resumo curto (aparece na lista da home e do diário)
   - tags: lista de palavras-chave, pode deixar []
   - corpo: lista de parágrafos — cada item vira um parágrafo na página
     da postagem completa
   ========================================================================== */

const POSTAGENS = [
  {
    id: "2026-08-24-comecando-o-blog",
    data: "24 de agosto de 2026",
    titulo: "começando isso aqui",
    resumo: "primeiro post. sem grande apresentação, só deixando isso aqui antes que eu mude de ideia.",
    humor: "era exatamente isso que faltava para os meus problemas: outro site.",
    tags: ["primeiro", "diário"],
    corpo: [
      "Eu queria um lugar que não parecesse outro feed. Só um canto para deixar pensamentos, fotos e ideias inacabadas.",
      "Nada aqui é muito organizado. Essa é meio que a ideia.",
      "Ainda tentando descobrir no que isso vai dar."
    ]
  },
  {
    id: "2026-08-20-um-dia-qualquer",
    data: "20 de agosto de 2026",
    titulo: "mais um dia normal",
    resumo: "nada de especial aconteceu. mesmo assim, eu quis lembrar dele.",
    humor: "nada aconteceu, então obviamente eu fiz um post sobre isso.",
    tags: ["vida"],
    corpo: [
      "Alguns dias são só barulho, café e tempo demais pensando em coisas que não importam.",
      "Talvez isso já seja o bastante para um post."
    ]
  }
];
