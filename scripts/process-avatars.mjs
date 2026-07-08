import sharp from 'sharp';
import { readdirSync, renameSync } from 'fs';

const files = readdirSync('public/avatars').filter(f => f.endsWith('.png'));
for (const f of files) {
  const input = `public/avatars/${f}`;
  const resized = await sharp(input).resize(256, 256, { fit: 'contain' }).raw().toBuffer({ resolveWithObject: true });
  const { data, info } = resized;
  const bgR = data[0], bgG = data[1], bgB = data[2];
  
  const out = Buffer.alloc(info.width * info.height * 4);
  for (let i = 0, j = 0; i < data.length; i += info.channels, j += 4) {
    const r = data[i], g = data[i+1], b = data[i+2];
    const dist = Math.sqrt((r-bgR)**2 + (g-bgG)**2 + (b-bgB)**2);
    let alpha = 255;
    if (dist < 50) alpha = 0;
    else if (dist < 80) alpha = Math.round(255 * (dist - 50) / 30);
    out[j] = r; out[j+1] = g; out[j+2] = b; out[j+3] = alpha;
  }
  
  await sharp(out, { raw: { width: info.width, height: info.height, channels: 4 } })
    .png({ compressionLevel: 9 })
    .toFile(input + '.tmp');
  renameSync(input + '.tmp', input);
  console.log(`✓ ${f}`);
}
