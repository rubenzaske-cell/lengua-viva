import sharp from 'sharp';
const samples = [
  { left: 5, top: 5, width: 25, height: 25 },
  { left: 354, top: 5, width: 25, height: 25 },
  { left: 5, top: 338, width: 25, height: 25 },
  { left: 354, top: 338, width: 25, height: 25 },
];
for (const s of samples) {
  const { data, info } = await sharp('/tmp/celeb-frame0.png').extract(s).raw().toBuffer({ resolveWithObject: true });
  let r = 0, g = 0, b = 0, n = 0;
  for (let i = 0; i < data.length; i += info.channels) { r += data[i]; g += data[i+1]; b += data[i+2]; n++; }
  console.log(`(${s.left},${s.top}): RGB(${Math.round(r/n)}, ${Math.round(g/n)}, ${Math.round(b/n)}) hex=#${Math.round(r/n).toString(16).padStart(2,'0')}${Math.round(g/n).toString(16).padStart(2,'0')}${Math.round(b/n).toString(16).padStart(2,'0')}`);
}
