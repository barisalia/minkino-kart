/**
 * Kelimelerim: çıkartma albümü ve resimli sözlük. Her ünite bir sayfa, her öğrenilen kelime bir çıkartma.
 * Çıkartmaya dokununca kelime kartı açılır: kelime, yavaş söyleyişi ve cümlesi dinlenir.
 */
import { h } from '../../../src/ui/dom';
import { UNITELER, cumle, type Kelime, type Unite } from '../icerik';
import { oku } from '../ilerleme';
import { cikartmaResmi, cizim, dugme, harfleriYak, hareket, kelimeBandi, kisi, simgeDugme, ziplat } from '../kit';
import { konus, sesAcikMi, tik } from '../ses';
import { acikKelimeler, uniteHazir } from '../varlik';
import type { Gezinme } from './ders';
import { miniAnimasyon } from '../mini-animasyon';
import { kelimeninAnimasyonu } from '../mini-animasyon-veri';

export function albumEkrani(kok: HTMLElement, git: Gezinme): () => void {
  const kayit = oku();
  const sayfalar = UNITELER.filter(uniteHazir);
  const kazanilan = new Set(kayit.cikartmalar);
  // albüm, en son çıkartma kazanılan ünitenin sayfasında açılır
  const son = kayit.cikartmalar[kayit.cikartmalar.length - 1];
  let sayfa = Math.max(0, sayfalar.findIndex((u) => u.kelimeler.some((w) => w.id === son)));

  const sayac = h('div.ing-sayac', {}, cizim('ui/yildiz'), h('strong', {}, `${kayit.cikartmalar.length}`));
  const ust = h('header.ing-ust', {},
    simgeDugme('geri', 'Ana ekrana dön', () => git.ana(), 'ing-geri'),
    h('div.ing-ust-orta', {}, h('h1.ing-baslik', {}, 'Kelimelerim')),
    h('div.ing-ust-sag', {}, sayac),
  );
  const baslik = h('h2.ing-album-baslik');
  const yapraklar = h('div.ing-album-yaprak');
  // ünite sekmeleri: her ünitenin küçük resmi; dokununca o sayfa açılır (çıkartması olmayan ünite soluk durur)
  const sekmeler = h('div.ing-album-sekmeler', { role: 'tablist', 'aria-label': 'Üniteler' });
  const sekmeDugmeleri = sayfalar.map((u, i) => {
    const adet = acikKelimeler(u).filter((w) => kazanilan.has(w.id)).length;
    const d = dugme('ing-album-sekme', `${u.tr}, ${adet} / ${acikKelimeler(u).length} çıkartma`, () => { tik.dokun(); sayfa = i; ciz(); }, cikartmaResmi(u.kelimeler[0]));
    d.setAttribute('role', 'tab');
    d.style.setProperty('--renk', u.renk);
    if (!adet) d.classList.add('ing-bos');
    else if (adet === acikKelimeler(u).length) d.classList.add('ing-tam');
    return d;
  });
  sekmeler.append(...sekmeDugmeleri);
  const onceki = simgeDugme('geri', 'Önceki sayfa', () => { sayfa--; ciz(); }, 'ing-sayfa-ok ing-sayfa-geri');
  const sonraki = simgeDugme('geri', 'Sonraki sayfa', () => { sayfa++; ciz(); }, 'ing-sayfa-ok ing-sayfa-ileri');
  const kartYeri = h('div.ing-panel-yeri');
  const defter = h('section.ing-album', {}, h('div.ing-album-defter', {}, sekmeler, baslik, yapraklar), onceki, sonraki, kartYeri);
  kok.append(ust, defter);

  function ciz() {
    sayfa = Math.max(0, Math.min(sayfalar.length - 1, sayfa));
    const u: Unite | undefined = sayfalar[sayfa];
    onceki.hidden = sayfa === 0;
    sonraki.hidden = sayfa >= sayfalar.length - 1;
    sekmeDugmeleri.forEach((d, i) => { d.setAttribute('aria-selected', String(i === sayfa)); });
    sekmeler.hidden = sayfalar.length < 2;
    if (!u) { baslik.textContent = 'Henüz çıkartma yok'; yapraklar.replaceChildren(); return; }
    defter.style.setProperty('--renk', u.renk);
    baslik.replaceChildren(h('span', { lang: 'en-US' }, u.en), h('small', {}, u.tr));
    yapraklar.dataset.adet = String(acikKelimeler(u).length);
    yapraklar.replaceChildren(...acikKelimeler(u).map((w, i) => {
      const var_ = kazanilan.has(w.id);
      const d = dugme('ing-yuva', var_ ? `${w.en}, ${w.tr}` : 'Henüz kazanılmadı', () => { if (var_) { tik.sec(); kartAc(w); } else { d.classList.remove('ing-salla'); void d.offsetWidth; d.classList.add('ing-salla'); tik.dokun(); } },
        cikartmaResmi(w, var_ ? 'ing-cikartma' : 'ing-cikartma ing-golge'),
        h('small', { lang: 'en-US' }, var_ ? w.en : '?'));
      d.style.setProperty('--n', String(i));
      if (!var_) d.classList.add('ing-bos');
      return d;
    }));
  }

  function kartAc(w: Kelime) {
    const kapat = () => { kartYeri.replaceChildren(); kartYeri.classList.remove('ing-acik'); };
    // hareketi olan kelimede resmin yerine mini animasyon: kart açılınca oynar, dokununca bir tur daha (22 Kasım 2026)
    const ma = kelimeninAnimasyonu(w.id);
    const mini = ma ? miniAnimasyon(ma) : null;
    const resimEl = cikartmaResmi(w, 'ing-kart-buyuk-resim');
    if (mini) resimEl.replaceChildren(mini.el);
    const bant = kelimeBandi(w);
    const soyle = () => { harfleriYak(bant, 600); if (mini) mini.oynat(1); else void ziplat(resimEl); void hareket('polly', 'selam'); void konus(`en/w-${w.id}`); };
    const kart = h('div.ing-kelime-karti', { role: 'dialog', 'aria-label': w.en },
      simgeDugme('kapat', 'Kapat', kapat, 'ing-panel-kapat'),
      dugme('ing-kart-resim-dugme', `${w.en} kelimesini dinle`, soyle, resimEl),
      kisi('polly', 'ing-kart-polly'),
      h('div.ing-kart-alt', {}, bant, h('p.ing-cumle', { lang: 'en-US' }, cumle(w)),
        h('div.ing-kart-dugmeler', {},
          simgeDugme('hoparlor', 'Kelimeyi dinle', soyle),
          dugme('ing-yavas', 'Yavaş söyle', () => { tik.dokun(); void konus(`en/w-${w.id}-yavas`); }, cizim('ui/kaplumbaga')),
          dugme('ing-cumle-dugme', 'Cümleyi dinle', () => { tik.dokun(); void konus(`en/c-${w.id}`); }, 'Cümle'),
        )),
    );
    kartYeri.replaceChildren(kart);
    kartYeri.classList.add('ing-acik');
    kartYeri.onclick = (e) => { if (e.target === kartYeri) kapat(); };
    harfleriYak(bant, 600);
    void konus(`en/w-${w.id}`, `tr/k-${w.id}`);
  }

  ciz();
  if (sesAcikMi() && kayit.cikartmalar.length) window.setTimeout(() => void konus('tr/c-album'), 300);
  return () => {};
}
