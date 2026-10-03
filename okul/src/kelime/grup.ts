/**
 * Kelime Köprüsü 5 · Hangi grup? (kategoriler). Resimler karışık; çocuk her resmi kendi sepetine sürükler: meyve,
 * hayvan, taşıt (sepetin üstünde o grubun simgesi; sepete dokununca grubun adı söylenir). Doğru sepette resim sepete
 * girer, adı söylenir; yanlışta yumuşakça geri döner, Mino grubunu söyler ("Bu bir hayvan!"); 2 yanlıştan sonra doğru
 * sepet parlar. Sürükleme: surukle.ts (Mino'nun Pazarı'nın kodu).
 * Kino (başta): balığı taşıt sepetine atar: "Balık yüzer, taşıt olur!" Mino: "Balık bir hayvan Kino!"
 */
import K from '../../../content/okul-kelime.json';
import { h } from '../../../src/ui/dom';
import { oynat } from '../efekt';
import { etkinlikKaydet } from '../etkinlik';
import { Ipucu } from '../sahne';
import { ses } from '../sesler';
import { geriGonder, hedefliSurukle } from '../surukle';
import { grubaUyar, grupResimleri, kelime, kelimeSozu, KATEGORI_SIMGE, KATEGORILER, KINO_GRUP, type Kategori } from './model';
import { KA, KK, KM, simge } from './ortak';
import { kelimeEl } from './resim';

const KL = K.kelimeler as Record<string, string>;

etkinlikKaydet({
  id: 'kelime-grup',
  bolge: 'kelime',
  ad: KA.etkinlikler['kelime-grup'],
  simge: () => simge(['pazar/sepet', 'ok-ks-sepet'], ['meyveler/elma', 'ok-ks-elma'], ['tasitlar/araba', 'ok-ks-araba']),
  async oyna(s) {
    const resimler = grupResimleri(s.yas, s.rnd);
    s.turlar(1);
    s.tur(0);
    // sepetler: arka yüz, içindekiler, ön yüz (resimler sepetin içinde görünür), üstünde grubun simgesi
    const sepetler = new Map<Kategori, { el: HTMLElement; ic: HTMLElement }>();
    for (const k of KATEGORILER) {
      const ic = h('div.ok-k-sepet-ic');
      const el = h(
        'div.ok-k-sepet',
        { 'data-kategori': k, role: 'button', 'aria-label': KL[k] },
        kelimeEl('sepet', 'ok-k-sepet-arka'),
        ic,
        h('span.ok-k-etiket', {}, kelimeEl(KATEGORI_SIMGE[k])),
      );
      el.addEventListener('click', () => {
        oynat(el, 'ok-parla');
        void s.soyle(`${KL[k]}!`);
      });
      sepetler.set(k, { el, ic });
    }
    const yigin = h('div.ok-k-yigin', { 'data-n': String(resimler.length) });
    const ogeler = resimler.map((id, i) => {
      const b = h('button.ok-k-oge.ok-k-gel', { type: 'button', 'data-kelime': id, 'data-kategori': kelime(id).kategori ?? '', style: `--i:${i}`, 'aria-label': kelime(id).ad }, kelimeEl(id));
      yigin.append(h('div.ok-k-oge-yuva', {}, b));
      return b;
    });
    s.alan.replaceChildren(h('div.ok-k-grup', {}, yigin));
    s.secim.replaceChildren(h('div.ok-k-sepetler', {}, ...[...sepetler.values()].map((x) => x.el)));
    await s.soyle(KM.grup.giris);

    // Kino balığı taşıt sepetine atar
    const balik = ogeler.find((o) => o.dataset.kelime === KINO_GRUP);
    const tasit = sepetler.get('tasit')!;
    if (balik) {
      await s.kinoHata({
        kino: KK.grup,
        once: async () => {
          const icerik = kelimeEl(KINO_GRUP, 'ok-k-ucan-oge');
          balik.classList.add('ok-k-gitti');
          await s.efekt.ucur(icerik, s.efekt.merkez(balik), s.efekt.merkez(tasit.el, 0.5, 0.45), { ms: 600, kavis: -80, boy1: 0.7 });
          ses.dus();
          oynat(tasit.el, 'ok-yapis');
          const mini = kelimeEl(KINO_GRUP, 'ok-k-mini');
          tasit.ic.append(mini);
          tasit.el.dataset.kino = '1';
        },
        mino: KM.grup.yakala,
        sonra: async () => {
          // balık sepetten zıplar, yerine döner
          tasit.ic.querySelector('.ok-k-mini')?.remove();
          delete tasit.el.dataset.kino;
          await s.efekt.ucur(kelimeEl(KINO_GRUP, 'ok-k-ucan-oge'), s.efekt.merkez(tasit.el, 0.5, 0.45), s.efekt.merkez(balik), { ms: 520, kavis: -70, boy0: 0.7 });
          balik.classList.remove('ok-k-gitti');
          oynat(balik, 'ok-zipla');
        },
        kinoSon: KK.grup_son,
      });
    }
    s.adim('surukle');

    let kalan = ogeler.length;
    let mesgul = false;
    await new Promise<void>((coz) => {
      for (const o of ogeler) {
        const kat = o.dataset.kategori as Kategori;
        const ipucu = new Ipucu(() => [sepetler.get(kat)?.el]);
        const kapat = hedefliSurukle({
          el: o,
          hedefler: () => [...sepetler.values()].map((x) => x.el),
          aktif: () => !mesgul && !s.kapandi() && !o.dataset.yerlesti,
          birak: async (hedef) => {
            if (!hedef) return geriGonder(o);
            const sk = hedef.dataset.kategori as Kategori;
            if (!grubaUyar(o.dataset.kelime ?? '', sk)) {
              geriGonder(o);
              mesgul = true;
              s.nazik(hedef);
              ipucu.yanlis();
              await s.soyle(KM.grup[kat]);
              mesgul = false;
              return;
            }
            // sepete girer
            o.dataset.yerlesti = '1';
            ipucu.sifirla();
            const sp = sepetler.get(sk)!;
            const mini = kelimeEl(o.dataset.kelime ?? '', 'ok-k-mini');
            mini.style.setProperty('--k', String(sp.ic.children.length));
            o.style.transition = 'none';
            o.style.transform = '';
            sp.ic.append(mini);
            o.classList.add('ok-k-gitti');
            ses.dus();
            ses.tik();
            oynat(sp.el, 'ok-yapis');
            const [x, y] = s.efekt.merkez(sp.el);
            s.efekt.parilti(x, y, 6);
            kalan--;
            void s.soyle(kelimeSozu(o.dataset.kelime ?? ''));
            if (!kalan) coz();
          },
        });
        s.kapaninca(kapat);
      }
    });
    s.tur(1);
    await s.soyle(KM.grup.bitti);
    await s.ovgu(s.secim);
  },
});
