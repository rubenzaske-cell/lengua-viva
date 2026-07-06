import ZAI from 'z-ai-web-dev-sdk';
import { readFileSync, writeFileSync } from 'fs';

async function main() {
  const zai = await ZAI.create();
  const buf = readFileSync('upload/condor_2d_01_feliz (1).png');
  const b64 = buf.toString('base64');
  const dataUrl = `data:image/png;base64,${b64}`;

  console.log('Editando imagen de prueba (feliz)...');
  const t0 = Date.now();
  const resp = await zai.images.generations.edit({
    prompt: 'Remove the solid green background completely and make it fully transparent. Keep the cute 2D cartoon condor bird character exactly the same — same colors, expression, pose and style. Only the green background becomes transparent. Output PNG with transparency.',
    images: [{ url: dataUrl }],
    size: '1024x1024',
  });
  console.log(`OK en ${((Date.now()-t0)/1000).toFixed(1)}s`);
  const outB64 = resp.data[0].base64;
  writeFileSync('/tmp/kuntur_test_feliz.png', Buffer.from(outB64, 'base64'));
  console.log('Guardado en /tmp/kuntur_test_feliz.png');
  console.log('Tamaño:', (Buffer.from(outB64, 'base64').length / 1024).toFixed(0), 'KB');
}

main().catch((e) => { console.error('ERROR:', e); process.exit(1); });
