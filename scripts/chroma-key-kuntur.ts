// Chroma key por distancia al color de fondo muestreado de las esquinas.
// Robusto para fondos de color sólido con cualquier tono (verde lima en este caso).
import sharp from 'sharp';
import { renameSync, statSync } from 'fs';

const MOODS = [
  { src: 'upload/condor_2d_01_feliz (1).png', name: 'feliz' },
  { src: 'upload/condor_2d_02_enamorado.png', name: 'enamorado' },
  { src: 'upload/condor_2d_03_triste.png', name: 'triste' },
  { src: 'upload/condor_2d_04_enojado.png', name: 'enojado' },
  { src: 'upload/condor_2d_05_sorprendido.png', name: 'sorprendido' },
  { src: 'upload/condor_2d_06_guino.png', name: 'guino' },
  { src: 'upload/condor_2d_07_timido.png', name: 'timido' },
  { src: 'upload/condor_2d_10_risa.png', name: 'risa' },
];

const OUT_DIR = 'public/kuntur';
const HARD_DIST = 45;   // distancia < esto → totalmente transparente
const SOFT_DIST = 75;   // distancia < esto → semi-transparente (anti-alias)

// Muestrea el color de fondo promedio de las 4 esquinas (10x10 cada una)
async function sampleBgColor(img) {
  const { data, info } = await img.clone()
    .extract({ left: 0, top: 0, width: 10, height: 10 })
    .raw().toBuffer({ resolveWithObject: true });
  let r = 0, g = 0, b = 0, n = 0;
  for (let i = 0; i < data.length; i += info.channels) {
    r += data[i]; g += data[i+1]; b += data[i+2]; n++;
  }
  return { r: Math.round(r/n), g: Math.round(g/n), b: Math.round(b/n) };
}

async function removeBg(inputPath, outputPath) {
  const baseImg = sharp(inputPath).resize({ width: 400, withoutEnlargement: true });
  const meta = await baseImg.metadata();
  const bg = await sampleBgColor(baseImg);

  const { data, info } = await baseImg.raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  const out = Buffer.alloc(width * height * 4);

  for (let i = 0, j = 0; i < data.length; i += channels, j += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    // Distancia euclidiana al color de fondo
    const dr = r - bg.r, dg = g - bg.g, db = b - bg.b;
    const dist = Math.sqrt(dr*dr + dg*dg + db*db);

    let alpha = 255;
    if (dist < HARD_DIST) {
      alpha = 0;
    } else if (dist < SOFT_DIST) {
      // Anti-aliasing suave
      const t = (dist - HARD_DIST) / (SOFT_DIST - HARD_DIST);
      alpha = Math.round(255 * t);
    }
    out[j] = r;
    out[j + 1] = g;
    out[j + 2] = b;
    out[j + 3] = alpha;
  }

  await sharp(out, { raw: { width, height, channels: 4 } })
    .png({ compressionLevel: 9 })
    .toFile(outputPath + '.tmp');
  renameSync(outputPath + '.tmp', outputPath);

  // Verificar transparencia
  const check = await sharp(outputPath).raw().toBuffer({ resolveWithObject: true });
  let transparent = 0;
  for (let i = 3; i < check.data.length; i += check.info.channels) {
    if (check.data[i] === 0) transparent++;
  }
  const pct = (transparent / (check.info.width * check.info.height) * 100).toFixed(1);
  return { size: statSync(outputPath).size, pct, bg };
}

async function main() {
  for (const mood of MOODS) {
    const t0 = Date.now();
    const { size, pct, bg } = await removeBg(mood.src, `${OUT_DIR}/${mood.name}.png`);
    console.log(`✓ ${mood.name}: ${(size/1024).toFixed(0)} KB | transparente: ${pct}% | bg RGB(${bg.r},${bg.g},${bg.b}) | ${((Date.now()-t0)/1000).toFixed(1)}s`);
  }
  console.log('\n✅ Chroma key completado!');
}

main().catch((e) => { console.error('FATAL:', e); process.exit(1); });
