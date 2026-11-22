/* ==========================================================================
   Gera versões leves das fotos da galeria.
   Uso:  npm run fotos

   Para cada foto listada em js/galeria-dados.js cria:
     imagens/mini/<nome>.webp    → miniatura da grade (600px)
     imagens/grande/<nome>.webp  → versão do lightbox (1600px)
   Os originais ficam intactos. Fotos já convertidas são puladas
   (use  npm run fotos -- --refazer  para refazer tudo).
   ========================================================================== */

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const sharp = require('sharp');

const RAIZ = path.join(__dirname, '..');
const refazer = process.argv.includes('--refazer');

const VERSOES = [
  { pasta: 'mini', lado: 600, qualidade: 70 },
  { pasta: 'grande', lado: 1600, qualidade: 80 }
];

function lerFotos() {
  const codigo = fs.readFileSync(path.join(RAIZ, 'js/galeria-dados.js'), 'utf8');
  const contexto = {};
  vm.runInNewContext(codigo + '\nthis.FOTOS = FOTOS;', contexto);
  return contexto.FOTOS;
}

function kb(bytes) {
  return (bytes / 1024).toFixed(0) + 'KB';
}

async function main() {
  const fotos = lerFotos();
  let antes = 0;
  let depois = 0;

  for (const foto of fotos) {
    const original = path.join(RAIZ, foto.src);
    if (!fs.existsSync(original)) {
      console.log('!! não achei', foto.src);
      continue;
    }
    const nome = path.parse(foto.src).name + '.webp';
    antes += fs.statSync(original).size;

    for (const v of VERSOES) {
      const destino = path.join(RAIZ, 'imagens', v.pasta, nome);
      fs.mkdirSync(path.dirname(destino), { recursive: true });

      if (refazer || !fs.existsSync(destino)) {
        await sharp(original, { failOn: 'none' })
          .rotate() // respeita a orientação do celular (EXIF)
          .resize(v.lado, v.lado, { fit: 'inside', withoutEnlargement: true })
          .webp({ quality: v.qualidade })
          .toFile(destino);
      }
      if (v.pasta === 'mini') depois += fs.statSync(destino).size;
    }
    console.log('ok', foto.src);
  }

  console.log(`\n${fotos.length} fotos | grade antes: ${kb(antes)} → agora: ${kb(depois)}`);
}

main().catch((erro) => {
  console.error(erro);
  process.exit(1);
});
