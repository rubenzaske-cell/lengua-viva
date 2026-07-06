import ZAI from 'z-ai-web-dev-sdk';
import { readFileSync, writeFileSync, existsSync, mkdirSync, renameSync, statSync } from 'fs';
import sharp from 'sharp';

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
const TMP_DIR = '/tmp/kuntur_raw';
if (!existsSync(TMP_DIR)) mkdirSync(TMP_DIR, { recursive: true });

const PROMPT = 'Remove the solid green background completely and make it fully transparent (alpha channel 0). Keep the cute 2D cartoon condor bird character exactly the same — same colors, same expression, same pose, same style, no changes to the character at all. Only the green background should become transparent. Output as PNG with transparency.';

async function processOne(zai, mood) {
  const buf = readFileSync(mood.src);
  const b64 = buf.toString('base64');
  const dataUrl = `data:image/png;base64,${b64}`;

  console.log(`[${mood.name}] editando...`);
  const t0 = Date.now();
  const resp = await zai.images.generations.edit({
    prompt: PROMPT,
    images: [{ url: dataUrl }],
    size: '1024x1024',
  });
  const outB64 = resp.data[0].base64;
  const rawPath = `${TMP_DIR}/${mood.name}.png`;
  writeFileSync(rawPath, Buffer.from(outB64, 'base64'));
  console.log(`[${mood.name}] edit OK en ${((Date.now()-t0)/1000).toFixed(1)}s`);

  // Optimizar con sharp: redimensionar a 400px, PNG optimizado
  const finalPath = `${OUT_DIR}/${mood.name}.png`;
  await sharp(rawPath)
    .resize({ width: 400, withoutEnlargement: true })
    .png({ quality: 90, compressionLevel: 9, palette: true })
    .toFile(finalPath + '.tmp');
  renameSync(finalPath + '.tmp', finalPath);
  const size = statSync(finalPath).size;
  console.log(`[${mood.name}] optimizado: ${(size/1024).toFixed(0)} KB`);
  return { name: mood.name, ok: true, size };
}

async function main() {
  const zai = await ZAI.create();
  const results = [];
  // Procesar en lotes de 2 para no saturar la API
  for (let i = 0; i < MOODS.length; i += 2) {
    const batch = MOODS.slice(i, i + 2);
    const batchResults = await Promise.allSettled(batch.map((m) => processOne(zai, m)));
    for (let j = 0; j < batchResults.length; j++) {
      const r = batchResults[j];
      if (r.status === 'fulfilled') {
        results.push(r.value);
      } else {
        console.error(`[${batch[j].name}] ERROR:`, r.reason?.message || r.reason);
        results.push({ name: batch[j].name, ok: false, error: r.reason?.message });
      }
    }
  }
  console.log('\n=== RESUMEN ===');
  for (const r of results) {
    console.log(r.ok ? `✓ ${r.name}: ${r.size} bytes` : `✗ ${r.name}: ${r.error}`);
  }
}

main().catch((e) => { console.error('FATAL:', e); process.exit(1); });
