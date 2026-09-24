import { efekt } from '../../audio/ses';
import { refCoz } from '../../engine/katalog';
import { dogruIndeks } from '../../engine/soru';
import { h, svg, TEST_MODU } from '../../ui/dom';
import { IKON } from '../../ui/ikonlar';
import { izgaraSigdir, merkez } from '../../ui/hareket';
import { kartEl } from '../../ui/kart';
import type { SoruBaglam } from '../oyun';
import { dogruCumlesi } from '../../audio/cumleler';

/** EŞLEŞTİR: doğru kartı sürükleyip hedefe (gölge / yuva / renk sepeti) bırak. Dokunmak da kartı hedefe gönderir. */
export function eslestirCiz(b: SoruBaglam) {
  const s = b.soru;
  const hedefGirdi = s.gosterge?.[0] ?? s.kartlar[dogruIndeks(s)];
  const hedefKutu = h('div.izgara');
  let hedef = kartEl(hedefGirdi, { sinif: 'hedef giris' });
  hedefKutu.append(hedef);
  b.gosterge.append(hedefKutu);
  b.temizlik(izgaraSigdir(b.gosterge, hedefKutu, 1, { enBuyuk: 230 }));

  const dogru = dogruIndeks(s);
  const izgara = h('div.izgara.secenekler');
  const elemanlar: HTMLElement[] = [];
  let bitti = false;

  const ustunde = (x: number, y: number) => {
    const r = hedef.getBoundingClientRect();
    const pay = r.width * 0.25;
    return x > r.left - pay && x < r.right + pay && y > r.top - pay && y < r.bottom + pay;
  };

  function birak(i: number, el: HTMLElement, klon: HTMLElement | null) {
    if (bitti) {
      klon?.remove();
      return;
    }
    const g = s.kartlar[i];
    if (i === dogru) {
      bitti = true;
      efekt.yapis();
      const son = () => {
        tasiyici?.remove();
        el.style.visibility = 'hidden';
        const yeni = kartEl(g, { sinif: 'dogru-oldu' });
        hedef.replaceWith(yeni);
        hedef = yeni;
        elemanlar.forEach((e) => e !== el && e.classList.add('soluk'));
        b.dogru(yeni, dogruCumlesi(s, g));
      };
      let tasiyici: HTMLElement | null = klon;
      if (TEST_MODU) return son();
      const r = el.getBoundingClientRect();
      const hm = merkez(hedef);
      if (!tasiyici) {
        tasiyici = el.cloneNode(true) as HTMLElement;
        tasiyici.classList.remove('giris', 'isilti');
        tasiyici.classList.add('surukle-klon');
        Object.assign(tasiyici.style, { left: `${r.left}px`, top: `${r.top}px`, width: `${r.width}px`, transform: 'none' });
        b.app.kok.append(tasiyici);
      }
      el.style.visibility = 'hidden';
      const tx = hm.x - (r.left + r.width / 2);
      const ty = hm.y - (r.top + r.height / 2);
      tasiyici
        .animate([{ transform: tasiyici.style.transform || 'none' }, { transform: `translate(${tx}px, ${ty}px) scale(${hm.w / r.width})` }], {
          duration: 300,
          easing: 'cubic-bezier(.3,1.3,.5,1)',
          fill: 'forwards',
        })
        .finished.then(son, son);
    } else {
      // Yanlış: kart yerine döner
      const bitir = () => {
        klon?.remove();
        el.classList.remove('surukleniyor');
        b.yanlis(el, elemanlar[dogru]);
      };
      if (klon && !TEST_MODU) {
        klon
          .animate([{ transform: klon.style.transform }, { transform: 'translate(0,0) scale(1)' }], { duration: 320, easing: 'cubic-bezier(.3,1.3,.5,1)', fill: 'forwards' })
          .finished.then(bitir, bitir);
      } else bitir();
    }
  }

  s.kartlar.forEach((g, i) => {
    const el = kartEl(g, { sinif: 'secenek suruklenebilir giris' });
    el.style.setProperty('--i', String(i + 1));
    el.style.touchAction = 'none';
    el.dataset.sira = String(i);
    el.setAttribute('role', 'button');
    el.setAttribute('aria-label', refCoz(g).kart ?? refCoz(g).yazi ?? '');
    if (TEST_MODU && i === dogru) el.dataset.dogru = '1';

    el.addEventListener('pointerdown', (e) => {
      if (bitti || el.classList.contains('soluk')) return;
      e.preventDefault();
      el.setPointerCapture?.(e.pointerId);
      const r = el.getBoundingClientRect();
      const x0 = e.clientX;
      const y0 = e.clientY;
      let klon: HTMLElement | null = null;

      const hareket = (m: PointerEvent) => {
        const dx = m.clientX - x0;
        const dy = m.clientY - y0;
        if (!klon && Math.hypot(dx, dy) > 8) {
          klon = el.cloneNode(true) as HTMLElement;
          klon.classList.remove('giris', 'isilti');
          klon.classList.add('surukle-klon');
          Object.assign(klon.style, { left: `${r.left}px`, top: `${r.top}px`, width: `${r.width}px` });
          b.app.kok.append(klon);
          el.classList.add('surukleniyor');
          efekt.secim();
        }
        if (klon) {
          klon.style.transform = `translate(${dx}px, ${dy}px) scale(1.08) rotate(-3deg)`;
          hedef.classList.toggle('hedef-ustunde', ustunde(m.clientX, m.clientY));
        }
      };
      const son = (u: PointerEvent) => {
        el.removeEventListener('pointermove', hareket);
        el.removeEventListener('pointerup', son);
        el.removeEventListener('pointercancel', son);
        hedef.classList.remove('hedef-ustunde');
        if (!klon) return birak(i, el, null); // dokunma
        if (u.type !== 'pointercancel' && ustunde(u.clientX, u.clientY)) return birak(i, el, klon);
        const k = klon;
        const geri = () => {
          k.remove();
          el.classList.remove('surukleniyor');
        };
        if (TEST_MODU) return geri();
        k.animate([{ transform: k.style.transform }, { transform: 'translate(0,0) scale(1)' }], { duration: 300, easing: 'cubic-bezier(.3,1.3,.5,1)', fill: 'forwards' }).finished.then(geri, geri);
      };
      el.addEventListener('pointermove', hareket);
      el.addEventListener('pointerup', son);
      el.addEventListener('pointercancel', son);
    });
    elemanlar.push(el);
    izgara.append(el);
  });
  b.temizlik(() => b.app.kok.querySelectorAll('.surukle-klon').forEach((k) => k.remove()));

  // Küçük çocuklar için: kısa bir süre dokunulmazsa, kartı hedefe taşıyan el animasyonu
  if (!TEST_MODU) {
    const el = h('div.el-ipucu', { 'aria-hidden': 'true' }, svg(IKON.el));
    let zaman = window.setTimeout(goster, 4500);
    function goster() {
      if (bitti || !hedef.isConnected) return;
      const a = izgara.getBoundingClientRect();
      const t = hedef.getBoundingClientRect();
      const k = b.alan.getBoundingClientRect();
      el.style.setProperty('--x0', `${a.left + a.width / 2 - k.left}px`);
      el.style.setProperty('--y0', `${a.top + a.height / 2 - k.top}px`);
      el.style.setProperty('--x1', `${t.left + t.width / 2 - k.left}px`);
      el.style.setProperty('--y1', `${t.top + t.height / 2 - k.top}px`);
      b.alan.append(el);
      zaman = window.setTimeout(() => el.remove(), 3200);
    }
    const dur = () => {
      clearTimeout(zaman);
      el.remove();
    };
    b.alan.addEventListener('pointerdown', dur, { once: true });
    b.temizlik(dur);
  }
  b.temizlik(izgaraSigdir(b.secenek, izgara, s.kartlar.length, { enBuyuk: s.kartlar.length <= 2 ? 260 : 220 }));
  b.secenek.append(izgara);
}
