/**
 * Vite eklentisi: `virtual:ingilizce-dosyalar` modülü, assets/ingilizce altındaki çizim (.webp) ve ses (.mp3)
 * dosyalarının adres tablosunu verir: { "kelime/cow.webp": adres, "ses/en/w-cow.mp3": adres, … }.
 *
 * Neden: uygulama bir dosyanın var olup olmadığına bakarak dersleri açar (ingilizce/src/varlik.ts). Bunu
 * `import.meta.glob` ile yapmak geliştirme sunucusunda bin beş yüz dosyanın her birini ayrı modül olarak çözdürüyor,
 * sayfanın ilk açılışı dakikalar sürüyordu (17 Kasım 2026: ses sayısı 130'dan 690'a çıkınca sayfa açılmaz oldu).
 * Burada klasör doğrudan okunur (birkaç milisaniye):
 *   - geliştirme sunucusunda adres dosyanın kendi yoludur; dosya eklenip silinince tablo yenilenir ve açık sayfa
 *     kendiliğinden yeniden yüklenir;
 *   - derlemede her dosya `?url` ile içe aktarılır, yani paketlenir ve adresi derlemenin verdiği adres olur.
 */
import fs from 'node:fs';
import path from 'node:path';
import type { Plugin } from 'vite';

const AD = 'virtual:ingilizce-dosyalar';
const COZULMUS = `\0${AD}`;

function listele(kok: string): string[] {
  const liste: string[] = [];
  const gez = (klasor: string, onEk: string) => {
    let girdiler: fs.Dirent[];
    try { girdiler = fs.readdirSync(klasor, { withFileTypes: true }); } catch { return; }
    for (const g of girdiler) {
      if (g.isDirectory()) gez(path.join(klasor, g.name), `${onEk}${g.name}/`);
      else if (/\.(webp|mp3)$/.test(g.name)) liste.push(onEk + g.name);
    }
  };
  gez(kok, '');
  return liste.sort();
}

export function ingilizceDosyalari(): Plugin {
  let klasor = '', sunucuda = false, taban = '/';
  return {
    name: 'minkino-ingilizce-dosyalar',
    configResolved(ayar) {
      klasor = path.resolve(ayar.root, 'assets/ingilizce');
      sunucuda = ayar.command === 'serve';
      taban = ayar.base.startsWith('/') ? ayar.base : '/';
    },
    resolveId(id) { return id === AD ? COZULMUS : undefined; },
    load(id) {
      if (id !== COZULMUS) return undefined;
      const liste = listele(klasor);
      if (sunucuda) return `export default ${JSON.stringify(Object.fromEntries(liste.map((yol) => [yol, `${taban}assets/ingilizce/${yol}`])))};`;
      const satirlar = liste.map((yol, i) => `import d${i} from ${JSON.stringify(`/assets/ingilizce/${yol}?url`)};`);
      return `${satirlar.join('\n')}\nexport default {${liste.map((yol, i) => `${JSON.stringify(yol)}:d${i}`).join(',')}};`;
    },
    configureServer(sunucu) {
      let zaman: NodeJS.Timeout | undefined;
      const yenile = (dosya: string) => {
        if (!dosya.replace(/\\/g, '/').includes('/assets/ingilizce/') || !/\.(webp|mp3)$/.test(dosya)) return;
        // ses üretimi dosyaları art arda yazar: her biri için ayrı yenileme yapılmaz
        clearTimeout(zaman);
        zaman = setTimeout(() => {
          const modul = sunucu.moduleGraph.getModuleById(COZULMUS);
          if (!modul) return;
          sunucu.moduleGraph.invalidateModule(modul);
          sunucu.ws.send({ type: 'full-reload' });
        }, 800);
      };
      sunucu.watcher.on('add', yenile);
      sunucu.watcher.on('unlink', yenile);
    },
  };
}
