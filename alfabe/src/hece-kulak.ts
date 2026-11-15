
import { heceler, parcaSesi, panoAdi, panoResmi } from './pano-sozcukleri';

import { cerenSustur } from './konusma-dersi';
import { oyunSesi } from './oyun-sesi';
import { IKON } from '../../src/ui/ikonlar';
import './hece-kulak.css';

type Oku = (id: string, sonra?: () => void) => void;
const rastgele = <T>(dizi: T[]) => dizi[Math.floor(Math.random() * dizi.length)];

/** Tamamlanan panodaki resimlerle oynanan, okumaya ihtiyaç duymayan 5+ dinleme finali. */
export function heceKulakKur(alan: HTMLElement, kartlar: string[], oku: Oku, bitir: () => void): () => void {
  const adaylar = [...new Set(kartlar)].filter(id => heceler[id]?.length && panoResmi(id));
  if (adaylar.length < 2) { bitir(); return () => {}; }
  const tumHeceler = [...new Set(adaylar.flatMap(id => heceler[id]))];
  const tekil = tumHeceler.filter(h => adaylar.filter(id => heceler[id].includes(h)).length === 1);
  const hece = rastgele(tekil.length ? tekil : tumHeceler);
  const ad = (id: string) => panoAdi(id);
  const oyun = document.createElement('section');
  oyun.className = 'hk-oyun';
  oyun.setAttribute('aria-label', 'Dinle ve bul');
  oyun.innerHTML = '<div class="hk-bas"><h2>Dinle ve bul</h2><span class="hk-sayac"></span></div>'+
    '<p class="hk-durum" role="status"></p><div class="hk-araclar"><button type="button" class="hk-dinle">'+IKON.hoparlor+'<span>Yeniden dinle</span></button>'+
    '<button type="button" class="hk-ipucu" aria-expanded="false">İpucunu göster</button><span class="hk-heceler" role="status" hidden></span></div>'+
    '<div class="hk-resimler" role="group" aria-label="Sözcüğü bul"></div><button type="button" class="hk-ileri" hidden></button>';
  alan.replaceChildren(oyun);
  const bul = <T extends HTMLElement>(s: string) => oyun.querySelector<T>(s)!;
  const durum = bul('.hk-durum'), kartYeri = bul('.hk-resimler'), sayac = bul('.hk-sayac');
  const dinle = bul<HTMLButtonElement>('.hk-dinle'), ileri = bul<HTMLButtonElement>('.hk-ileri');
  const ipucu = bul<HTMLButtonElement>('.hk-ipucu'), heceEtiketi = bul('.hk-heceler');
  let tur: 1 | 2 = 1, cevap = '', sozcuk = '', bitti = false, sesNo = 0, bekleme = 0;
  function kes() { sesNo++; window.clearTimeout(bekleme); cerenSustur(); dinle.removeAttribute('data-okuyor'); }
  function oynatmayiKilitle(aktif:boolean){
    dinle.disabled=aktif;ileri.disabled=aktif;
    for(const kart of kartYeri.querySelectorAll('button'))kart.disabled=aktif||!!cevap;
  }
  function sirayla(ids: string[], aralik = 230) {
    kes();
    if (document.hidden || bitti) return;
    const no = sesNo;
    dinle.dataset.okuyor = 'evet';
    oynatmayiKilitle(true);
    function yurut(i: number) {
      if (bitti || no !== sesNo) return;
      if (i >= ids.length) { dinle.removeAttribute('data-okuyor'); return; }
      oku(ids[i], () => {
        if (bitti || no !== sesNo) return;
        if (i === ids.length - 1) {dinle.removeAttribute('data-okuyor');oynatmayiKilitle(false);}
        else bekleme = window.setTimeout(() => yurut(i+1), aralik);
      });
    }
    yurut(0);
  }
  function dinlet(yonerge?: string) {
    const sesler = cevap ? ['pano-ad-'+cevap] : tur === 1 ? [parcaSesi(hece)] : heceler[sozcuk].map(parcaSesi);
    sirayla(yonerge ? [yonerge, ...sesler] : sesler);
  }
  function goster() {
    cevap = '';
    sayac.textContent = tur + ' / 2';
    durum.textContent = tur === 1 ? 'Bu heceyi hangi resmin adında duydun?' : 'Heceleri birleştir. Hangi sözcüğü duydun?';
    ileri.hidden = true;
    ipucu.hidden = false; ipucu.textContent = 'İpucunu göster'; ipucu.setAttribute('aria-expanded', 'false'); heceEtiketi.hidden = true;
    kartYeri.replaceChildren(...adaylar.map(id => {
      const dugme = document.createElement('button');
      dugme.type = 'button'; dugme.className = 'hk-resim';
      dugme.setAttribute('aria-label', ad(id)); dugme.dataset.nesne = id;
      dugme.innerHTML = '<img alt="" draggable="false" src="'+panoResmi(id)+'"><span></span>';
      dugme.onclick = () => {
        if (bitti || cevap) return;
        // Paylaşılan bir hece seçildiyse onu içeren her resim doğrudur.
        if (!(tur === 1 ? heceler[id].includes(hece) : id === sozcuk)) {
          durum.textContent = 'Bir daha dinle, sonra resmini seç.';
          oyunSesi('geri');
          dinlet('hece-kulak-tekrar');
          return;
        }
        cevap = id;
        ipucu.hidden = true; heceEtiketi.hidden = true;
        if (tur === 1) sozcuk = rastgele(adaylar.filter(k => k !== id));
        oyunSesi('birles');
        kartYeri.querySelectorAll('button').forEach(b => { b.disabled = true; });
        dugme.classList.add('hk-bulundu'); dugme.querySelector('span')!.textContent = ad(id);
        durum.textContent = tur === 1 ? ad(id) + ' sözcüğünde “' + hece + '” var.' : heceler[id].join(' · ') + ' → ' + ad(id);
        sirayla(tur === 1 ? [parcaSesi(hece), 'pano-ad-'+id] : [...heceler[id].map(parcaSesi), 'pano-ad-'+id]);
        ileri.hidden = false;
        ileri.textContent = tur === 1 ? 'Heceleri birleştir' : 'Tamam';
        ileri.focus({preventScroll:true});
      };
      return dugme;
    }));
    dinlet(tur === 1 ? 'hece-kulak-bul' : 'hece-kulak-birlestir');
  }
  dinle.onclick = () => dinlet();
  ipucu.onclick = () => {
    heceEtiketi.hidden = !heceEtiketi.hidden;
    ipucu.setAttribute('aria-expanded', String(!heceEtiketi.hidden));
    ipucu.textContent = heceEtiketi.hidden ? 'İpucunu göster' : 'İpucunu gizle';
    heceEtiketi.textContent = tur === 1 ? hece : heceler[sozcuk].join(' · ');
  };
  ileri.onclick = () => {
    if (!cevap || bitti) return;
    if (tur === 1) { tur = 2; goster(); dinle.focus({preventScroll:true}); }
    else { birak(); bitir(); }
  };
  function gorunurluk() {
    if (document.hidden) kes();
    else if (!bitti) dinlet();
  }
  function birak() {
    if (bitti) return;
    bitti = true;
    kes(); document.removeEventListener('visibilitychange', gorunurluk); oyun.remove();
  }
  document.addEventListener('visibilitychange', gorunurluk);
  goster();
  return birak;
}
