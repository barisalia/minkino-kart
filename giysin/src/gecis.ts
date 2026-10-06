/**
 * Mevsim geçişi (senaryo bölüm 4, ~3 sn): pencere manzarası büyük; eski mevsimin ağacı tanelerini döker
 * (kar erir, yapraklar sararıp düşer, çiçekler savrulur), sahne katman katman yeni mevsime döner, yeni ağaç
 * yaylanarak açar, mevsimin adı belirir. Sonra oda yeni mevsimde başlar.
 */
import { efekt } from '../../src/audio/efekt';
import { h } from '../../src/ui/dom';
import type { Ekran, Uygulama } from '../../src/uygulama';
import G from '../../content/giysin.json';
import { bekle, ms, oynat } from './anim';
import type { Mevsim } from './model';
import { taneKatmani } from './oda';
import { onYukle, resim } from './resimler';

const TANE: Record<Mevsim, 'kar' | 'cicek' | 'gunes' | 'yaprak'> = { kis: 'kar', ilkbahar: 'cicek', yaz: 'gunes', sonbahar: 'yaprak' };

export function gecisEkrani(app: Uygulama, param?: { den?: Mevsim; ye?: Mevsim }): Ekran {
  const den = param?.den ?? 'kis', ye = param?.ye ?? 'ilkbahar';
  onYukle(['oda-yatay', 'oda-dikey', ...[den, ye].flatMap((m) => [`pencere-${m}-arka`, `pencere-${m}-orta`, `pencere-${m}-on`])]);
  const katman = (m: Mevsim) => {
    const k = h(`div.gy-gecis-katman.${m}`, {}, h('img.gy-g-arka', { src: resim(`pencere-${m}-arka`), alt: '' }), h('img.gy-g-orta', { src: resim(`pencere-${m}-orta`), alt: '' }), h('img.gy-g-agac', { src: resim(`pencere-${m}-on`), alt: '' }));
    return k;
  };
  const eski = katman(den);
  const yeni = katman(ye);
  yeni.style.opacity = '0';
  const eskiTane = taneKatmani(26, 'yakin.dis', TANE[den]);
  const yeniTane = taneKatmani(22, 'yakin.dis', TANE[ye]);
  yeniTane.style.opacity = '0';
  const ad = h('div.gy-gecis-ad', {}, G.yazi[ye]);
  const el = h('div.gy-ekran.gy-gecis', {}, eski, eskiTane, yeni, yeniTane, ad);
  let kapandi = false;

  async function oyna() {
    void oynat(el, [{ opacity: 0 }, { opacity: 1 }], 400, { fill: 'forwards' });
    // eski ağaç sallanır, taneleri dökülür
    const agac0 = eski.querySelector('.gy-g-agac');
    void oynat(agac0, [{ transform: 'none' }, { transform: 'rotate(-2.5deg)' }, { transform: 'rotate(2deg)' }, { transform: 'rotate(-1deg)' }, { transform: 'none' }], 900, { easing: 'ease-in-out' });
    for (let i = 0; i < 16; i++) {
      const p = h(`i.gy-kar-puf.${den}.buyuk`, { style: `left:${58 + Math.random() * 30}%;top:${18 + Math.random() * 35}%` });
      el.append(p);
      void oynat(p, [{ transform: 'translateY(0) scale(0.7) rotate(0deg)', opacity: 1 }, { transform: `translate(${(Math.random() - 0.5) * 140}px, ${200 + Math.random() * 160}px) scale(1.1) rotate(${(Math.random() - 0.5) * 540}deg)`, opacity: 0 }], 1300, { delay: ms(i * 40), easing: 'ease-in' }).then(() => p.remove());
    }
    efekt.sayfa();
    await bekle(700);
    // zaman atlaması: gök, bahçe, ağaç sırayla yeni mevsime döner (parallax: arka önce)
    yeni.style.opacity = '1';
    const sira: [string, number][] = [['.gy-g-arka', 0], ['.gy-g-orta', 180], ['.gy-g-agac', 360]];
    for (const [s, d] of sira) {
      void oynat(yeni.querySelector(s), [{ opacity: 0, transform: s === '.gy-g-agac' ? 'scale(0.86, 0.7)' : 'translateX(-3%)' }, { opacity: 1, transform: s === '.gy-g-agac' ? 'scale(1.05, 1.08)' : 'none', offset: 0.7 }, { opacity: 1, transform: 'none' }], 700, { delay: ms(d), easing: 'cubic-bezier(.3,.7,.3,1)', fill: 'backwards' });
      void oynat(eski.querySelector(s), [{ opacity: 1 }, { opacity: 0 }], 700, { delay: ms(d), fill: 'forwards' });
    }
    void oynat(eskiTane, [{ opacity: 1 }, { opacity: 0 }], 600, { fill: 'forwards' });
    void oynat(yeniTane, [{ opacity: 0 }, { opacity: 1 }], 800, { delay: ms(500), fill: 'forwards' });
    await bekle(800);
    efekt.kilitAcildi();
    await oynat(ad, [{ transform: 'translate(-50%, 30%) scale(0.4)', opacity: 0 }, { transform: 'translate(-50%, 0) scale(1.1)', opacity: 1, offset: 0.7 }, { transform: 'translate(-50%, 0) scale(1)', opacity: 1 }], 520, { fill: 'forwards', easing: 'ease-out' });
    await bekle(1100);
    if (kapandi) return;
    app.git('oda', { mevsim: ye });
  }
  requestAnimationFrame(() => void oyna());
  return {
    el,
    kapat: () => {
      kapandi = true;
    },
  };
}
