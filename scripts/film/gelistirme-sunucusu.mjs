#!/usr/bin/env node
/**
 * Geçici port üzerinde ayrı bir Vite geliştirme sunucusu (bölüm önizleme ve testleri için; başka oturumun sunucusuyla
 * karışmaz): node scripts/film/gelistirme-sunucusu.mjs --port 4319
 */
import { sunucuBaslat } from './youtube-ortak.mjs';

const i = process.argv.indexOf('--port');
const port = Number(i >= 0 ? process.argv[i + 1] : 4319);
const s = await sunucuBaslat(port);
console.log(`hazır: ${s.adres}/film/bolum.html`);
const kapat = async () => {
  await s.kapat();
  process.exit(0);
};
process.on('SIGINT', kapat);
process.on('SIGTERM', kapat);
