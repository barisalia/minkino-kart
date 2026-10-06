const sharp = require('sharp');
const fs = require('fs');
const S = 'C:/Users/Minkex/AppData/Local/Temp/claude/C--Users-Minkex-Desktop-Minkino-Games/1e20e77e-41bd-4088-b2d7-0758beec6cf4/scratchpad/';
let s = fs.readFileSync('assets/karakter-iskelet/kino.svg', 'utf8');
const d = require(process.cwd() + '/assets/karakter-iskelet/kino.json');
// gizliler svgde zaten display=none
fs.writeFileSync(S + 'kino-on.svg', s);
(async () => {
  await sharp(Buffer.from(s)).png().toFile(S + 'kino-on.png');
  await sharp(Buffer.from(s)).flatten({ background: '#ffffff' }).resize(1024).png().toFile(S + 'kino-on-beyaz.png');
  console.log(await sharp('ekip/kino/kino-final.png').metadata().then((m) => [m.width, m.height, m.hasAlpha]));
})();
