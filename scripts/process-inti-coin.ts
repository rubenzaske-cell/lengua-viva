// Procesa la moneda Inti: quita fondo blanco y optimiza para la app
import sharp from 'sharp';
import { renameSync, statSync } from 'fs';

const INPUT = '/tmp/inti-coin-raw.png';
const OUT_DIR = 'public/kuntur';
const OUTPUT = `${OUT_DIR}/inti-coin.png`;

// Muestrea el color de fondo de las esquinas
async function sampleBg(img) {
  const meta = await img.metadata();
  const sample = img.clone().extract({ left: 0, top: 0, width: 20, height: 20 });
  const { data, info } = await sample.raw().toBuffer({ resolveWithObject: true });
  let r = 0, g = 0, b = 0, n = 0;
  for (let i = 0; i < data.length; i += info.channels) {
    r += data[i]; g += data[i+1]; b += data[i+2]; n++;
  }
  return { r: Math.round(r/n), g: Math.round(g/n), b: Math.round(b/n) };
}

async function main() {
  // Redimensionar a 512px (buen tamaño para iconos)
  const baseImg = sharp(INPUT).resize({ width: 512, withoutEnlargement: true });
  const bg = await sampleBg(baseImg);
  console.log(`Fondo muestreado: RGB(${bg.r}, ${bg.g}, ${bg.b})`);

  const { data, info } = await baseImg.raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  const out = Buffer.alloc(width * height * 4);

  // Umbrales de distancia al blanco de fondo
  const HARD_DIST = 50;   // totalmente transparente
  const SOFT_DIST = 90;   // anti-alias

  for (let i = 0, j = 0; i < data.length; i += channels, j += 4) {
    const r = data[i], g = data[i+1], b = data[i+2];
    const dr = r - bg.r, dg = g - bg.g, db = b - bg.b;
    const dist = Math.sqrt(dr*dr + dg*dg + db*db);
    let alpha = 255;
    if (dist < HARD_DIST) {
      alpha = 0;
    } else if (dist < SOFT_DIST) {
      const t = (dist - HARD_DIST) / (SOFT_DIST - HARD_DIST);
      alpha = Math.round(255 * t);
    }
    out[j] = r; out[j+1] = g; out[j+2] = b; out[j+3] = alpha;
  }

  await sharp(out, { raw: { width, height, channels: 4 } })
    .png({ compressionLevel: 9 })
    .toFile(OUTPUT + '.tmp');
  renameSync(OUTPUT + '.tmp', OUTPUT);

  // Verificar transparencia
  const check = await sharp(OUTPUT).raw().toBuffer({ resolveWithObject: true });
  let transparent = 0;
  for (let i = 3; i < check.data.length; i += check.info.channels) {
    if (check.data[i] === 0) transparent++;
  }
  const pct = (transparent / (check.info.width * check.info.height) * 100).toFixed(1);
  const size = statSync(OUTPUT).size;
  console.log(`✓ Moneda Inti: ${(size/1024).toFixed(0)} KB | transparente: ${pct}% | ${width}x${height}`);
}

main().catch((e) => { console.error('FATAL:', e); process.exit(1); });
