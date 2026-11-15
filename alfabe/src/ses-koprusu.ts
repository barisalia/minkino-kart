import dersler from './harfler.json';
import { resim } from './resimler';
import { oyunSesi } from './oyun-sesi';
import { cerenSustur } from './konusma-dersi';
import { IKON } from '../../src/ui/ikonlar';
import araba from '../../assets/alfabe/macera/kopru-araba.webp';
import zarf from '../../assets/hazirlik/kres/masal-zarf.webp';
import tahta from '../../assets/alfabe/macera/kopru-tahta.webp';
import './ses-koprusu.css';

const yollar = [
  ['06','01','24'], ['07','15','17'], ['05','15','17'], ['14','12','14'],
  ['12','14','12'], ['23','06','01'], ['10','04','14'], ['18','22','24'],
  ['26','16','29'], ['28','12','14'], ['21','24','17'], ['02','14','12'],
];
const ipuclari = new Set(['06','01','15','17','23','07','05','14','12']);
const kagitRenkleri = ['#c3f0cc','#f6d09b','#c3e1fc','#ebcef4','#ffe7a1','#f3c3c5'];
const kelime = (id: string) => dersler.find(h => h.id === id)!;
const kucult = (s: string) => s.toLocaleLowerCase('tr');
const cek = <T>(liste: T[]) => liste[Math.floor(Math.random() * liste.length)];

export function sesKoprusuKur(alan: HTMLElement, oku: (id: string, sonra?: () => void) => void, bitir: () => void, tercih?: string) {
  const uygun = yollar.filter(y => y.includes(tercih ?? ''));
  const yol = cek(uygun.length ? uygun : yollar);
  alan.innerHTML = `<section class="sk" data-asama="baslangic"><div class="sk-dekor" aria-label="Posta yolu">
    <button class="sk-kaynak" type="button" hidden></button>
    <div class="sk-acik"><div></div><div></div></div>
    <button type="button" class="sk-arac" aria-label="Kornayı çal, posta arabasını yola çıkar"><img src="${araba}" alt="" draggable="false"></button>
    <img src="${zarf}" class="sk-zarf" alt="" draggable="false">
  </div><div class="sk-secimler" role="group" aria-label="Köprüye yerleştirilecek tahtalar"></div>
  <button class="at-ses sk-dinle" type="button" aria-label="Ceren’i yeniden dinle">${IKON.hoparlor}</button></section>`;
  const ekran = alan.querySelector<HTMLElement>('.sk')!;
  const arac = alan.querySelector<HTMLButtonElement>('.sk-arac')!;
  const kaynak = alan.querySelector<HTMLButtonElement>('.sk-kaynak')!;
  const secimler = alan.querySelector<HTMLElement>('.sk-secimler')!;
  const tekrar = alan.querySelector<HTMLButtonElement>('.sk-dinle')!;
  const yuvalar = Array.from(alan.querySelectorAll<HTMLElement>('.sk-acik > div'));
  const sakin = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let sira = 0, sesNo = 0, zaman = 0, kapali = false;
  let hayalet: HTMLImageElement | undefined;
  let tutus: {id: number; x: number; y: number; dugme: HTMLButtonElement} | undefined;

  function konus(ids: string[], bitince?: () => void) {
    const bu = ++sesNo;
    function devam(i: number) {
      if (kapali || bu !== sesNo) return;
      if (i < ids.length) oku(ids[i], () => devam(i + 1));
      else bitince?.();
    }
    devam(0);
  }
  function ipucu() {
    const id = yol[sira];
    return ipuclari.has(id) ? 'kopru-ipucu-' + id : id + '-label';
  }
  function hedefSesi() {
    const son = kucult(kelime(yol[sira]).example).slice(-1);
    return 'mik-parca-' + son.codePointAt(0)!.toString(16);
  }
  function duyur() {
    if (ekran.dataset.asama === 'baslangic') konus(['kopru-basla']);
    if (ekran.dataset.asama === 'secim') konus([ipucu(), hedefSesi(), 'kopru-sec']);
  }
  function resimli(id: string, konum?: 'ilk' | 'son') {
    const ad = kelime(id).example;
    let yazi = ad;
    if (konum === 'son') yazi = ad.slice(0, -1) + '<b>' + ad.slice(-1) + '</b>';
    if (konum === 'ilk') yazi = '<b>' + ad[0] + '</b>' + ad.slice(1);
    return '<img draggable="false" src="' + resim(id) + '" alt=""><span>' + yazi + '</span>';
  }
  function kaynakGoster(id: string, son = true) {
    kaynak.hidden = false;
    kaynak.innerHTML = resimli(id, son ? 'son' : undefined) + IKON.hoparlor;
    kaynak.setAttribute('aria-label', kelime(id).example + ' kelimesini dinle');
  }
  function birak() {
    const t = tutus;
    tutus = undefined;
    if (t?.dugme.hasPointerCapture(t.id)) t.dugme.releasePointerCapture(t.id);
    hayalet?.remove();
    hayalet = undefined;
  }
  function kartiBagla(b: HTMLButtonElement) {
    let tasindi = false;
    b.onclick = e => {
      if (!tasindi || e.detail === 0) dene(b);
      tasindi = false;
    };
    b.onpointerdown = e => {
      if (tutus || e.button !== 0 || ekran.dataset.asama !== 'secim') return;
      tasindi = false;
      tutus = {id:e.pointerId, x:e.clientX, y:e.clientY, dugme:b};
      b.setPointerCapture(e.pointerId);
    };
    b.onpointermove = e => {
      if (tutus?.id !== e.pointerId || tutus.dugme !== b) return;
      if (!hayalet && Math.hypot(e.clientX-tutus.x, e.clientY-tutus.y) < 8) return;
      if (!hayalet) {
        tasindi = true;
        hayalet = b.querySelector('img')!.cloneNode() as HTMLImageElement;
        hayalet.className = 'sk-tasi';
        hayalet.alt = '';
        document.body.append(hayalet);
      }
      hayalet.style.left = e.clientX + 'px';
      hayalet.style.top = e.clientY + 'px';
    };
    b.onpointerup = e => {
      if (tutus?.id !== e.pointerId) return;
      birak();
      if (!tasindi) return;
      const r = yuvalar[sira].getBoundingClientRect();
      if (e.clientX >= r.left-20 && e.clientX <= r.right+20 && e.clientY >= r.top-44 && e.clientY <= r.bottom+44) dene(b);
    };
    b.onpointercancel = b.onlostpointercapture = e => {if (tutus?.id === e.pointerId) birak();};
  }
  function sor() {
    const bas = kelime(yol[sira]), dogru = kelime(yol[sira+1]);
    const son = kucult(bas.example).slice(-1);
    const renk = son.codePointAt(0)! % kagitRenkleri.length;
    ekran.style.setProperty('--ses-kagidi',kagitRenkleri[renk]);
    const aday = dersler.filter(h => h.id !== bas.id && kucult(h.example)[0] !== son);
    const secilen = [dogru];
    while (secilen.length < sira + 2) secilen.push(aday.splice(Math.floor(Math.random()*aday.length),1)[0]);
    for (let i = secilen.length-1; i > 0; i--) {
      const j = Math.floor(Math.random()*(i+1));
      [secilen[i],secilen[j]] = [secilen[j],secilen[i]];
    }
    kaynakGoster(bas.id);
    ekran.dataset.asama = 'secim';
    ekran.dataset.tur = String(sira+1);
    yuvalar[sira].className = 'sk-bekleyen';
    yuvalar[sira].innerHTML = '<b aria-hidden="true">' + son.toLocaleUpperCase('tr') + '</b>';
    secimler.innerHTML = secilen.map(d => '<button type="button" class="sk-tahta" data-kart="' + d.id +
      '" aria-label="' + d.example + '">' + resimli(d.id, 'ilk') + '</button>').join('');
    let fark = 0;
    for (const b of secimler.querySelectorAll<HTMLButtonElement>('button')) {
      if (b.dataset.kart !== dogru.id) b.style.setProperty('--ses-kagidi',kagitRenkleri[(renk + ++fark) % kagitRenkleri.length]);
      kartiBagla(b);
    }
    tekrar.disabled = false;
    duyur();
  }
  function dene(b: HTMLButtonElement) {
    if (kapali || ekran.dataset.asama !== 'secim') return;
    const id = b.dataset.kart!, once = yol[sira];
    if (id !== yol[sira+1]) {
      oyunSesi('geri');
      if (!sakin) b.animate([{transform:'translateX(0)'},{transform:'translateX(-7px)'},{transform:'translateX(4px)'},{transform:'none'}],{duration:300});
      konus([once+'-label',id+'-label','kopru-uymaz',ipucu()]);
      return;
    }
    birak();
    ekran.dataset.asama = 'gecis';
    tekrar.disabled = true;
    kaynak.disabled = true;
    secimler.replaceChildren();
    oyunSesi('kutu');
    yuvalar[sira].innerHTML = '<img src="' + tahta + '" alt="">';
    yuvalar[sira].className = 'sk-takildi';
    arac.style.left = sira === 0 ? '44%' : '82%';
    sira++;
    const son = sira === 2;
    if (son) {
      ekran.classList.add('sk-teslim');
      kaynakGoster(id, false);
    }
    // Çocuğun kurduğu bağlantı duyulmadan yeni sözcük veya sınıf sesi başlamasın.
    let sesBitti = false, hareketBitti = false;
    function tamamla() {
      if (kapali || !sesBitti || !hareketBitti) return;
      if (son) {bitir(); return;}
      kaynak.disabled = false;
      sor();
    }
    zaman = window.setTimeout(() => {hareketBitti = true; tamamla();}, sakin ? 220 : son ? 1800 : 740);
    konus([id+'-label', son ? 'kopru-son' : 'kopru-bir'], () => {sesBitti = true; tamamla();});
  }
  arac.onclick = () => {
    if (ekran.dataset.asama !== 'baslangic') return;
    arac.disabled = true;
    tekrar.disabled = true;
    ekran.dataset.asama = 'yola';
    arac.style.left = '22%';
    sesNo++;
    cerenSustur();
    oyunSesi('korna');
    zaman = window.setTimeout(sor, sakin ? 120 : 640);
  };
  kaynak.onclick = () => konus([yol[sira] + '-label', hedefSesi()]);
  tekrar.onclick = duyur;
  duyur();
  return () => {kapali = true; sesNo++; clearTimeout(zaman); birak(); cerenSustur();};
}
