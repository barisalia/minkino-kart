import { dolumTezgahi, servisTakimi, suyuCiz } from './su-cizim';
import { efekt, sesiAc } from '../../src/audio/ses';
import { durum } from '../../src/engine/ilerleme';
import akisDosyasi from '../../assets/hazirlik/su-akisi.mp3?url';

interface SuOyunu {
  evde: boolean;
  miktar: number;
  kaydet: (miktar: number) => void;
  tamamla: () => void;
}

// Kısa dokunuş kendi kendine doldurur. Basılı tutup bırakmak suyu o seviyede keser.
export function suIstasyonu(alan: HTMLElement, oyun: SuOyunu) {
  const dugme = document.createElement('button');
  dugme.className = 'su-istasyonu';
  dugme.type = 'button';
  dugme.setAttribute('aria-label', oyun.evde ? 'Musluğu aç, matarayı doldur' : 'Mataradan bardağa su doldur');
  dugme.dataset.su = oyun.evde ? 'ev' : 'okul';
  dugme.innerHTML = oyun.evde ? dolumTezgahi(oyun.miktar) : servisTakimi(oyun.miktar);
  alan.removeAttribute('aria-hidden');
  alan.append(dugme);

  let miktar = oyun.miktar, egim = 0, acik = false, tamam = false;
  let kayitli = miktar;
  const suSesi=new Audio(akisDosyasi);
  suSesi.loop=true;
  let kare = 0, sonAn = 0, baslangic = 0, parmak: number | null = null;
  const hareketAz = matchMedia('(prefers-reduced-motion: reduce)').matches;
  function kaydet() {
    if (miktar === kayitli) return;
    kayitli = miktar;
    oyun.kaydet(miktar);
  }
  function ciz(an: number) {
    kare = 0;
    if (!dugme.isConnected) return;
    const ms = Math.min(48, an - sonAn);
    sonAn = an;
    const hiz = hareketAz ? 1 : ms / 240;
    egim = acik ? Math.min(1, egim + hiz) : Math.max(0, egim - hiz);
    const akiyor = acik && (oyun.evde || egim === 1);
    if (akiyor) miktar = Math.min(1, miktar + ms / 1350);
    if (miktar === 1 && !tamam) {
      acik = false;
      tamam = true;
      dugme.classList.remove('akiyor');
      suSesi.pause();
      kaydet();
      efekt.tink();
    }
    suyuCiz(dugme, oyun.evde, miktar, egim, akiyor && !tamam);
    if (acik || egim > 0) kare = requestAnimationFrame(ciz);
    else if (tamam) oyun.tamamla();
  }
  function ac() {
    if (tamam) return;
    sesiAc();
    if(durum.i.ayarlar.efekt && !acik) {
      suSesi.volume=durum.i.ayarlar.seviye*.27;
      void suSesi.play().catch(()=>{});
    }
    acik = true;
    dugme.classList.add('akiyor');
    if (!kare) { sonAn = performance.now(); kare = requestAnimationFrame(ciz) }
  }
  function kes() {
    acik = false;
    suSesi.pause();
    dugme.classList.remove('akiyor');
    kaydet();
  }
  dugme.addEventListener('pointerdown', e => {
    if (parmak !== null || e.button !== 0 || tamam) return;
    parmak = e.pointerId;
    baslangic = performance.now();
    dugme.setPointerCapture(parmak);
    ac();
  });
  dugme.addEventListener('pointerup', e => {
    if (e.pointerId !== parmak) return;
    parmak = null;
    if (performance.now() - baslangic > 230) kes();
  });
  dugme.addEventListener('pointercancel', () => { parmak = null; kes() });
  dugme.addEventListener('click', e => { if (e.detail === 0) ac() });
  // Dönüş, ekran yönü ve arka plana geçiş sırasında suyu olduğu yerde sakla.
  return () => { cancelAnimationFrame(kare); kare=0; parmak=null; kes() };
}
