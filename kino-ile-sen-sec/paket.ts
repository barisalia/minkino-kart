import { cp, mkdir, readdir } from 'node:fs/promises';
import sharp from 'sharp';
import { resolve } from 'node:path';
import type { Plugin } from 'vite';

/** Klasik oyuncunun göreli dosya adları çevrimdışı ve mağaza sürümlerinde de aynıdır. */
export function secimliFilmPaketi(): Plugin {
  let kaynak: string;
  return {
    name: 'kino-secimli-film-paketi',
    apply: 'build',
    configResolved(config) {
      kaynak = resolve(config.root, 'ekip/film/kino-okul-ui-fikirleri');
    },
    async writeBundle({ dir }) {
      const hedef = resolve(dir!, 'kino-ile-sen-sec/film');
      await mkdir(hedef, { recursive: true });
      const dosyalar = ['Oyna.html', 'nunito-tr-black.woff2', 'Nunito-OFL.txt'];
      const oyuncu = await readdir(resolve(kaynak, 'bir-gun'));
      dosyalar.push(...oyuncu.filter(ad => /\.(css|js)$/.test(ad)).map(ad => 'bir-gun/' + ad));
      for (const ad of [...dosyalar, 'bir-gun/ses']) {
        await cp(resolve(kaynak, ad), resolve(hedef, ad), { recursive: true });
      }
      // Çizimler kayıpsız ve çok büyük (159 MB): pakette aynı piksel boyutunda kayıplı webp (~25 MB).
      // Boyut değişmez; atlas koordinatları (cizimler.js) aynen geçerli. Kaynak dosyalara dokunulmaz.
      await mkdir(resolve(hedef, 'bir-gun/medya'), { recursive: true });
      for (const ad of await readdir(resolve(kaynak, 'bir-gun/medya'))) {
        const giris = resolve(kaynak, 'bir-gun/medya', ad), cikis = resolve(hedef, 'bir-gun/medya', ad);
        if (ad.endsWith('.webp')) await sharp(giris).webp({ quality: 88, alphaQuality: 100, effort: 4 }).toFile(cikis);
        else await cp(giris, cikis);
      }
    },
  };
}
