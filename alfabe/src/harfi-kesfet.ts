import type dersler from './harfler.json';
import { kutuTurlari } from './harf-kutusu-kartlari';
import { cerenSustur, cerenYuzu } from './konusma-dersi';
import { oyunSesi } from './oyun-sesi';
import { IKON } from '../../src/ui/ikonlar';
import sesMetinleri from '../ses-metinleri.json';
import './harfi-kesfet.css';

type Ders = typeof dersler[number];
type Oku = (id: string, sonra?: () => void, oynarken?: (saniye:number) => void) => void;
type Bolum = {ses:string; kart?:number; isaret?:'ornek'|'cevap'|'ikisi'; altYazi?:string; basla?:()=>void};
const replikler:Readonly<Record<string,string>>=sesMetinleri;

export function harfiKesfetKur(alan: HTMLElement, ders: Ders, oku: Oku, sonraki: () => void) {
  const kartlar = kutuTurlari(ders).map(t => t.hedef);
  const sesOrnegi = 'mik-parca-' + ders.lower.codePointAt(0)!.toString(16);
  const soru = ders.lower === 'ğ' ? 'kesif-sor-ic' : 'kesif-sor-ilk';
  const ekran = document.createElement('section');
  ekran.className = 'hf-kesif';
  ekran.setAttribute('aria-label', ders.upper + ' harfini iki sözcükte keşfet');
  ekran.innerHTML = '<div class="hf-hoca">' + cerenYuzu() + '</div>' +
    '<div class="hf-pano"><div class="hf-ust"><div class="hf-harf" aria-label="Büyük ve küçük harf">' +
    ders.upper + '<span>' + ders.lower + '</span></div>' +
    '<button type="button" class="hf-ses" aria-label="Ceren’i yeniden dinle">' + IKON.hoparlor + '</button></div>' +
    '<p class="hf-yon" role="status"></p><div class="hf-kartlar"></div></div>';
  const yon = ekran.querySelector<HTMLElement>('.hf-yon')!;
  const ara = ders.lower === 'ğ' ? 'Sözcüğün içindeki ğ’ye dokun.' : 'İkinci sözcüğün ilk harfine dokun.';
  const kartAlani = ekran.querySelector<HTMLElement>('.hf-kartlar')!;
  const ses = ekran.querySelector<HTMLButtonElement>('.hf-ses')!;
  const resimler: HTMLButtonElement[] = [];
  const harfler: HTMLElement[][] = [];
  const cevaplar:HTMLButtonElement[]=[];
  let kapali = false, konusma = 0, hazir = false, tamam = false;
  let yanlisSayisi=0;
  let hareket: Animation | undefined;
  const telaffuz = (metin: string) => metin.toLocaleLowerCase('tr');
  const hedefMi = (h: HTMLElement) => h.dataset.hedef === 'evet';
  function zincir(kayitlar: Bolum[], sonra?: () => void) {
    const sira = ++konusma;
    function ilerle(i: number) {
      if (kapali || sira !== konusma) return;
      if(i===kayitlar.length){sonra?.();return;}
      const bolum=kayitlar[i];
      let basladi=false;
      function goster(){
        if(basladi||kapali||sira!==konusma)return;
        basladi=true;
        for(const [n,kart] of Array.from(kartAlani.children).entries()){
          kart.classList.toggle('hf-okunuyor',bolum.kart===n);
          isaret(n,bolum.isaret==='ikisi'||(n===0?bolum.isaret==='ornek':bolum.isaret==='cevap'));
        }
        yon.textContent=bolum.altYazi??replikler[bolum.ses];
        bolum.basla?.();
      }
      // Ön yükleme gecikse bile renk gerçek sesle başlar. Ses açılamazsa metinle devam eder.
      oku(bolum.ses,()=>{goster();ilerle(i+1);},goster);
    }
    ilerle(0);
  }
  function isaret(i: number, ac: boolean) {
    harfler[i].filter(hedefMi).forEach(h => h.classList.toggle('hf-bulundu', ac));
  }
  function siraCocukta() {
    hazir = true;
    ekran.dataset.adim = 'bul';
    for(const t of cevaplar)t.disabled=false;
  }
  function hedefiDinle():Bolum {
    return {ses:kartlar[1].ses,kart:1,altYazi:kartlar[1].ad,basla:siraCocukta};
  }
  function dersSorusu():Bolum {
    return {ses:soru,kart:1};
  }
  function dinle(i: number) {
    if (tamam || kapali) return;
    const kayit:Bolum=i===0?{ses:kartlar[0].ses,kart:0,isaret:'ornek'}:hedefiDinle();
    // Resmin düğmesi yalnız kendi adını tekrarlar. İlk dinleyişi keserse görev sorusunu tamamla.
    if(hazir){zincir([kayit],()=>{kartAlani.children[i].classList.remove('hf-okunuyor');yon.textContent=ara;});return;}
    zincir(i===1?[kayit,dersSorusu()]:[kayit,hedefiDinle(),dersSorusu()]);
  }
  function karar(h: HTMLButtonElement) {
    if (!hazir || tamam || kapali) return;
    if (!hedefMi(h)) {
      yanlisSayisi++;
      if(yanlisSayisi===2)ekran.classList.add('hf-yardim');
      const yardim=ders.lower === 'ğ' ? 'Üstünde yay olan ğ’yi bul.' : 'Sözcüğün başladığı yere bak.';
      yon.textContent=yardim;
      hareket?.cancel();
      oyunSesi('geri');
      if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
        hareket = h.animate([{transform:'translateX(0)'},{transform:'translateX(-4px)'},{transform:'translateX(3px)'},{transform:'none'}],{duration:250});
      }
      zincir([{ses:'kesif-tekrar',kart:0},{ses:kartlar[0].ses,kart:0,isaret:'ornek'},
        {...hedefiDinle(),basla:undefined}],()=>{yon.textContent=yardim;});
      return;
    }
    tamam = true;
    ekran.classList.remove('hf-yardim');
    yon.textContent = kartlar[1].ad;
    ekran.dataset.adim = 'bulundu';
    isaret(1, true);
    for (const b of [...resimler, ...cevaplar, ses]) b.disabled = true;
    oyunSesi('birles');
    zincir([{ses:kartlar[1].ses,kart:1,isaret:'cevap'}, {ses:'kesif-bitti',isaret:'ikisi'}], sonraki);
  }
  for (const [i, kart] of kartlar.entries()) {
    const kartEl = document.createElement('div');
    kartEl.className = 'hf-kart';
    const resim = document.createElement('button');
    resim.type = 'button';
    resim.className = 'hf-resim';
    resim.setAttribute('aria-label', kart.ad + ' adını dinle');
    resim.innerHTML = '<img src="' + kart.gorsel + '" alt="" draggable="false">';
    resim.onclick = () => dinle(i);
    resimler.push(resim);
    const yazi = document.createElement('div');
    yazi.className = 'hf-yazi';
    yazi.setAttribute('role', 'group');
    yazi.setAttribute('aria-label', kart.ad);
    harfler.push([]);
    for (const [j, sozcuk] of kart.ad.split(/\s+/).entries()) {
      const satir = document.createElement('div');
      satir.className = 'hf-sozcuk';
      // Nokta ve boşluklar harflerden ayrı tutulur. “El arabası” iki gerçek sözcük olarak okunur.
      const harfDizisi = Array.from(telaffuz(sozcuk));
      for (const [n, h] of harfDizisi.entries()) {
        const tus = document.createElement(i===0?'span':'button');
        tus.className = 'hf-hucre';
        tus.dataset.harf = h;
        if (h === ders.lower && (ders.lower === 'ğ' || (j === 0 && n === 0))) tus.dataset.hedef = 'evet';
        tus.textContent = i === 0 && n === 0 && j === 0 ? h.toLocaleUpperCase('tr') : h;
        if(tus instanceof HTMLButtonElement){
          tus.type='button';tus.disabled=true;
          tus.setAttribute('aria-label',tus.textContent+', '+(harfler[i].length+1)+'. harf');
          tus.onclick=()=>karar(tus);
          cevaplar.push(tus);
        }else tus.setAttribute('aria-hidden','true');
        harfler[i].push(tus);
        satir.append(tus);
      }
      yazi.append(satir);
    }
    kartEl.append(resim, yazi);
    kartAlani.append(kartEl);
  }
  function baslat() {
    if (tamam || kapali) return;
    yon.textContent = hazir ? ara : 'İki sözcüğü dinle.';
    ekran.dataset.adim = hazir ? 'bul' : 'dinle';
    zincir([
      {ses:kartlar[0].ses,kart:0,isaret:'ornek'},
      {ses:sesOrnegi,kart:0,isaret:'ornek'},
      hedefiDinle(),dersSorusu()
    ]);
  }
  ses.onclick = baslat;
  alan.replaceChildren(ekran);
  baslat();
  return () => {
    kapali = true;
    konusma++;
    hareket?.cancel();
    cerenSustur();
    ekran.remove();
  };
}
