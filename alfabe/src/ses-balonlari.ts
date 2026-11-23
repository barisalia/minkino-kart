// "Harfi keşfet" adımının yeni hâli (Paket Harf-H15, 22 Kasım 2026): Ses Balonları. 4 ve 5+ yaş.
// Gökyüzünde üç balon yükselir; her balonun sepetinde bir resim var. İkisinin adı dersin sesiyle başlar (Keşfet'in
// iki sözcüğü), biri başka sesle (dersin yanlış kartlarından). Ceren üçünü okur; çocuk farklı başlayanın balonunu
// patlatır. Kalan iki balon yan yana gelir, sözcüklerinin ilk harfi parlar ve rozetteki harfe uçar ("Buldun! İki sözcükte
// de aynı harfi gördük."). Yanlış balonda ceza yok: Ceren o sözcüğü yeniden söyler, ikincide doğru balon parlar.
// Astra'nın çizimleri (h14-cizimler.ts → SES_BALONU_CIZIMLERI) gelene kadar eski Keşfet oynar (main.ts).
import type dersler from './harfler.json';
import { dersKutuTurlari } from './ders-sozcukleri';
import { cerenSustur, cerenYuzu } from './konusma-dersi';
import { harfiKesfetKur } from './harfi-kesfet';
import { oyunSesi } from './oyun-sesi';
import { bosBekleyici } from './bos-bekle';
import { IKON } from '../../src/ui/ikonlar';
import { gunlukYanlis } from './gunluk';
import { An, azHareket, isikSac, kabaGore } from './canlanma';
import { sesBalonuCizimi } from './h14-cizimler';
import type { KutuKarti } from './harf-kutusu-kartlari';
import { balonDizisi } from './ses-balonu-kurali';
import './ses-balonlari.css';

type Ders = typeof dersler[number];
type Oku = (id: string, sonra?: () => void, oynarken?: (saniye: number) => void) => void;

export const BALON_YONERGE = 'balon-yonerge';
export const BALON_TEKRAR = 'balon-tekrar';

export function sesBalonlariKur(alan: HTMLElement, ders: Ders, oku: Oku, sonraki: () => void): () => void {
  const turlar = dersKutuTurlari(ders);
  const farkliKart = turlar[0]?.secenekler.find((k) => k.id !== turlar[0].hedef.id);
  // Ğ (sözcüğün içinde) ya da ikinci sözcük / yanlış kart yoksa eski Keşfet.
  if (ders.lower === 'ğ' || turlar.length < 2 || !farkliKart) return harfiKesfetKur(alan, ders, oku, sonraki);
  const balonlar = balonDizisi<KutuKarti>([turlar[0].hedef, turlar[1].hedef], farkliKart, Math.floor(Math.random() * 3));

  const ekran = document.createElement('section');
  ekran.className = 'sb-sahne';
  ekran.dataset.adim = 'dinle';
  ekran.setAttribute('aria-label', 'Ses balonları: farklı başlayanı patlat');
  ekran.innerHTML = '<div class="sb-hoca">' + cerenYuzu() + '</div>' +
    '<div class="sb-gok"><img class="sb-gok-resmi" src="' + sesBalonuCizimi('gokyuzu') + '" alt="" draggable="false">' +
    '<div class="sb-ust"><div class="sb-harf" aria-label="Büyük ve küçük harf">' + ders.upper + '<span>' + ders.lower + '</span></div>' +
    '<button type="button" class="sb-ses" aria-label="Ceren’i yeniden dinle">' + IKON.hoparlor + '</button></div>' +
    '<p class="sb-yon" role="status"></p><div class="sb-balonlar"></div></div>';
  const yon = ekran.querySelector<HTMLElement>('.sb-yon')!;
  const alanBalon = ekran.querySelector<HTMLElement>('.sb-balonlar')!;
  const ses = ekran.querySelector<HTMLButtonElement>('.sb-ses')!;
  const rozet = ekran.querySelector<HTMLElement>('.sb-harf')!;
  const an = new An();
  let kapali = false, hazir = false, tamam = false, yanlis = 0, konusma = 0;

  const dugmeler = balonlar.map((b, i) => {
    const d = document.createElement('button');
    d.type = 'button';
    d.className = 'sb-balon';
    d.dataset.no = String(i);
    if (b.farkli) d.dataset.farkli = 'evet';
    d.style.setProperty('--sb-gecikme', (i * .18).toFixed(2) + 's');
    d.setAttribute('aria-label', b.kart.ad + ' balonu');
    const ad = b.kart.ad.toLocaleLowerCase('tr');
    d.innerHTML = '<img class="sb-balon-resmi" src="' + sesBalonuCizimi((['balon-0', 'balon-1', 'balon-2'] as const)[i]) + '" alt="" draggable="false">' +
      '<img class="sb-sepet-resim" src="' + b.kart.gorsel + '" alt="" draggable="false">' +
      '<span class="sb-ad"><b class="sb-ilk">' + ad.charAt(0) + '</b>' + ad.slice(1) + '</span>';
    d.onclick = () => sec(i);
    alanBalon.append(d);
    return d;
  });

  // Ceren'in sözleri sırayla; her sözcükte o balon hafifçe zıplar.
  function zincir(parcalar: { ses: string; balon?: number }[], sonra?: () => void) {
    const sira = ++konusma;
    const ilerle = (i: number) => {
      if (kapali || sira !== konusma) return;
      dugmeler.forEach((d, n) => d.classList.toggle('sb-okunuyor', parcalar[i]?.balon === n));
      if (i === parcalar.length) { sonra?.(); return; }
      oku(parcalar[i].ses, () => ilerle(i + 1));
    };
    ilerle(0);
  }
  const tanit = () => [{ ses: BALON_YONERGE }, ...balonlar.map((b, n) => ({ ses: b.kart.ses, balon: n }))];
  const bos = bosBekleyici((kacinci) => {
    if (tamam || kapali) return;
    if (kacinci === 2) ekran.classList.add('sb-yardim');
    zincir(tanit(), bosBekle);
  });
  const bosBekle = () => { if (hazir && !tamam && !kapali) bos.kur(); };
  function baslat() {
    if (tamam || kapali) return;
    bos.dur();
    yon.textContent = 'Farklı başlayan balonu patlat.';
    zincir(tanit(), () => { hazir = true; ekran.dataset.adim = 'sec'; bosBekle(); });
  }

  function sec(i: number) {
    if (!hazir || tamam || kapali) return;
    bos.dur();
    const d = dugmeler[i], b = balonlar[i];
    if (!b.farkli) {
      yanlis++; gunlukYanlis(ders.id);
      if (yanlis >= 2) ekran.classList.add('sb-yardim');
      oyunSesi('geri');
      if (!azHareket()) an.hareket(d, [{ transform: 'none' }, { transform: 'rotate(-7deg)' }, { transform: 'rotate(6deg)' }, { transform: 'rotate(-3deg)' }, { transform: 'none' }], { duration: 520, easing: 'ease-in-out' });
      zincir([{ ses: b.kart.ses, balon: i }, { ses: BALON_TEKRAR }], bosBekle);
      return;
    }
    tamam = true;
    cerenSustur(); konusma++;
    ekran.classList.remove('sb-yardim');
    ekran.dataset.adim = 'patladi';
    for (const x of [...dugmeler, ses]) x.disabled = true;
    patlat(d);
    // kalan iki balon yan yana gelir, ilk harfleri parlar; Ceren iki sözcüğü söyler ve harfler rozete uçar
    an.sonra(azHareket() ? 0 : 750, () => {
      ekran.dataset.adim = 'bulundu';
      const kalan = dugmeler.filter((_, n) => n !== i);
      kalan.forEach((x, n) => { x.dataset.kalan = String(n); x.querySelector('.sb-ilk')!.classList.add('sb-parla'); });
      zincir([...kalan.map((x) => ({ ses: balonlar[Number(x.dataset.no)].kart.ses, balon: Number(x.dataset.no) })), { ses: 'kesif-bitti' }], () => {
        if (kapali) return;
        kalan.forEach((x, n) => an.sonra(n * 160, () => harfiUcur(x.querySelector<HTMLElement>('.sb-ilk')!)));
        an.sonra(azHareket() ? 200 : 1100, sonraki);
      });
    });
  }
  function patlat(d: HTMLElement) {
    oyunSesi('kutu');
    d.classList.add('sb-patladi');
    if (azHareket()) return;
    const r = kabaGore(alanBalon, d.querySelector('.sb-balon-resmi')!);
    const p = an.ekle(alanBalon, document.createElement('img'));
    p.className = 'sb-patlama'; p.alt = ''; p.draggable = false; p.src = sesBalonuCizimi('patlama-0');
    Object.assign(p.style, { left: r.cx + 'px', top: (r.y + r.h * .3) + 'px', width: r.w * 1.2 + 'px' });
    an.sonra(110, () => { p.src = sesBalonuCizimi('patlama-1'); });
    an.sonra(420, () => an.kaldir(p));
    isikSac(an, alanBalon, r.cx, r.y + r.h * .3, { adet: 7, uzaklik: r.w * .7, boy: Math.max(18, r.w * .16) });
  }
  function harfiUcur(h: HTMLElement) {
    const hedef = kabaGore(ekran, rozet), b = kabaGore(ekran, h);
    if (azHareket()) { rozet.classList.add('sb-rozet-parla'); return; }
    const ucan = an.ekle(ekran, document.createElement('span'));
    ucan.className = 'sb-ucan-harf'; ucan.textContent = h.textContent; ucan.setAttribute('aria-hidden', 'true');
    ucan.style.fontSize = getComputedStyle(h).fontSize;
    Object.assign(ucan.style, { left: b.cx + 'px', top: b.cy + 'px' });
    const dx = hedef.cx - b.cx, dy = hedef.cy - b.cy;
    an.hareket(ucan, [{ transform: 'translate(-50%,-50%) scale(1)', opacity: 1 },
      { transform: 'translate(calc(-50% + ' + dx * .5 + 'px), calc(-50% + ' + (dy * .5 - 30) + 'px)) scale(1.5)', opacity: 1, offset: .55 },
      { transform: 'translate(calc(-50% + ' + dx + 'px), calc(-50% + ' + dy + 'px)) scale(.8)', opacity: 0 }],
      { duration: 620, easing: 'cubic-bezier(.4,.1,.5,1)', fill: 'forwards' }).finished.then(() => {
      an.kaldir(ucan);
      oyunSesi('parilti');
      rozet.classList.add('sb-rozet-parla');
      an.hareket(rozet, [{ transform: 'scale(1)' }, { transform: 'scale(1.16) rotate(-3deg)', offset: .4 }, { transform: 'scale(1)' }], { duration: 440, easing: 'ease-out' });
      isikSac(an, ekran, hedef.cx, hedef.cy, { adet: 6, uzaklik: hedef.h * 1.2, boy: Math.max(18, hedef.h * .5) });
    }, () => {});
  }

  ses.onclick = baslat;
  alan.replaceChildren(ekran);
  baslat();
  return () => {
    kapali = true; konusma++;
    bos.kapat(); an.durdur(); cerenSustur();
    ekran.remove();
  };
}
