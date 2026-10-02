/**
 * Etkinlik 3 · Sepete koy (istenen kadarını seçme; Mino'nun Pazarı'nın sürükleme kodu). Tavşan pikniğe havuç ister;
 * çocuk havuçları sepete sürükler, her havuçta sayı söylenir; "Ver"e basınca tavşan bakar. Fazlaysa "Çok oldu!" deyip
 * birini geri verir. Kino (ilk tur): sepetten gizlice bir havuç yer. Mino: "Bir eksik! Bir tane daha koy."
 */
import O from '../../../content/okul.json';
import { h, svg, TEST_MODU } from '../../../src/ui/dom';
import { IKON } from '../../../src/ui/ikonlar';
import { gorsel } from '../cizim';
import { oynat } from '../efekt';
import { etkinlikKaydet } from '../etkinlik';
import { Ipucu, type Sahne } from '../sahne';
import { havucTurlari, kalipDoldur, sepetDurumu } from '../sayi';
import { ses } from '../sesler';
import { geriGonder, hedefliSurukle } from '../surukle';

const M = O.mino.sepete_koy;
const havucImg = () => h('img', { src: gorsel('meyveler/havuc'), alt: '', draggable: 'false' });

async function tur(s: Sahne, istenen: number, kinoTuru: boolean) {
  const tavsan = s.oyuncu('tavsan', 1.15);
  const istek = h('div.ok-istek', { 'aria-label': `${istenen} havuç` }, h('b', {}, String(istenen)), havucImg());
  const sepetIc = h('div.ok-e3-ic');
  const sayac = h('b.ok-e3-sayac', {}, '0');
  const sepet = h('div.ok-e3-sepet', {}, h('img.ok-sepet-resim', { src: gorsel('pazar/sepet'), alt: '', draggable: 'false' }), sepetIc, h('img.ok-sepet-resim.ok-sepet-on', { src: gorsel('pazar/sepet'), alt: '', draggable: 'false' }), sayac);
  const adet = Math.min(10, istenen + 2);
  const yigin = h('div.ok-e3-yigin');
  const havuclar: HTMLElement[] = [];
  const havucYap = (i: number) => {
    const b = h('button.ok-havuc', { type: 'button', 'aria-label': 'Havuç', style: `--i:${i}` }, havucImg());
    havuclar.push(b);
    return b;
  };
  for (let i = 0; i < adet; i++) yigin.append(h('div.ok-e3-yuva', {}, havucYap(i)));
  s.alan.replaceChildren(h('div.ok-e3', {}, h('div.ok-e3-tavsan', {}, istek, tavsan.el), sepet, yigin));
  const ver = h('button.dugme.ok-ver', { type: 'button', hidden: true }, svg(IKON.onay), O.arayuz.ver);
  s.secim.replaceChildren(ver);

  const sepetteki = () => sepetIc.children.length;
  const guncelle = () => {
    sayac.textContent = String(sepetteki());
    sepet.dataset.adet = String(sepetteki());
    ver.hidden = sepetteki() === 0;
  };
  guncelle();
  void tavsan.k.oynat('var', 700);
  await s.soyle(M.giris);
  await s.soyle(O.tavsan.istek, tavsan);
  await s.soyle(kalipDoldur(O.kalip.havuc, istenen), tavsan);
  s.adim('surukle');
  if (TEST_MODU) sepet.dataset.istenen = String(istenen);

  let mesgul = false;
  for (const b of havuclar) {
    const kapat = hedefliSurukle({
      el: b,
      hedefler: () => [sepet],
      aktif: () => !mesgul && !s.kapandi() && !b.dataset.sepette,
      birak: (hedef) => {
        if (!hedef) return geriGonder(b);
        b.dataset.sepette = '1';
        b.style.transition = 'none';
        b.style.transform = '';
        const k = sepetteki();
        sepetIc.append(h('span.ok-e3-havuc', { style: `--k:${k}` }, havucImg()));
        b.classList.add('ok-gitti');
        ses.dus();
        oynat(sepet, 'ok-yapis');
        guncelle();
        void s.say(sepetteki());
      },
    });
    s.kapaninca(kapat);
  }

  const ipucu = new Ipucu(() => [istek]);
  let kinoYedi = !kinoTuru;
  await new Promise<void>((coz) => {
    ver.addEventListener('click', async () => {
      if (mesgul || s.kapandi()) return;
      mesgul = true;
      const d = sepetDurumu(istenen, sepetteki());
      if (d === 'tam' && !kinoYedi) {
        kinoYedi = true;
        // Kino gizlice bir havuç yer
        const [x, y] = s.efekt.merkez(sepet, 0.5, 0.9);
        await s.kinoGit(x + 40, y);
        ses.ham();
        sepetIc.lastElementChild?.remove();
        guncelle();
        void s.kinoOynat('ye', 900);
        await s.kinoHata({ kino: O.kino.yedim, poz: null, mino: M.eksik });
        await s.kinoDon();
        mesgul = false;
        return;
      }
      if (d === 'tam') {
        ipucu.sifirla();
        void tavsan.k.oynat('sevin', 900);
        await s.soyle(O.tavsan.tamam, tavsan);
        await s.ovgu(sepet);
        coz();
        return;
      }
      s.nazik(sepet);
      ipucu.yanlis();
      if (d === 'fazla') {
        void tavsan.k.oynat('hayir', 800);
        await s.soyle(O.tavsan.cok, tavsan);
        // birini geri verir
        const fazla = sepetIc.lastElementChild;
        const geri = havuclar.filter((x) => x.dataset.sepette).pop();
        if (fazla && geri) {
          fazla.remove();
          delete geri.dataset.sepette;
          geri.classList.remove('ok-gitti');
          oynat(geri, 'ok-zipla');
          guncelle();
        }
      } else {
        await s.soyle(M.biraz);
        const ic = [...sepetIc.children];
        await s.sayarak(ic.length, (i) => oynat(ic[i - 1], 'ok-zipla'));
        await s.soyle(kalipDoldur(O.kalip.havuc, istenen), tavsan);
      }
      mesgul = false;
    });
  });
  s.secim.replaceChildren();
}

etkinlikKaydet({
  id: 'sepete-koy',
  bolge: 'sayi',
  ad: O.arayuz.etkinlikler['sepete-koy'],
  ucretsiz: true,
  async oyna(s) {
    const turlar = havucTurlari(s.yas, s.rnd);
    s.turlar(turlar.length);
    for (let i = 0; i < turlar.length; i++) {
      if (s.kapandi()) return;
      s.tur(i);
      await tur(s, turlar[i], i === 0);
    }
    s.tur(turlar.length);
  },
});
