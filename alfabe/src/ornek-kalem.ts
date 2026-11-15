import { kalemYollari } from './yollar';

const kalem = '<g class="uc" fill="#fc7656" stroke="#292722" stroke-width=".6">' +
  '<path d="M0 0L1 -4 11 -20Q12 -21 14 -20L15 -19Q16 -18 15 -17L5 -2Z"/>' +
  '<path d="M0 0L1 -4 5 -2Z" fill="#e9bb85"/><path d="M10 -18L14 -15" fill="none"/></g>';

export function kalemiGoster(alan: HTMLElement, harf: string, hareket: boolean, ses?:{araliklar:number[][]; zaman:()=>number}): () => void {
  const yollar = kalemYollari(harf);
  alan.innerHTML = '<svg viewBox="0 0 100 132" aria-label="Ceren’in ' + harf + ' örneği">' +
    yollar.map(d => '<path class="ornek-yol" d="' + d + '"/>').join('') +
    yollar.map(d => '<path class="ornek-kalem" d="' + d + '" pathLength="1"/>').join('') + kalem + '</svg>';
  const cizgiler = Array.from(alan.querySelectorAll<SVGPathElement>('.ornek-kalem'));
  const uc = alan.querySelector<SVGGElement>('.uc')!;
  if (!hareket) {
    uc.style.display = 'none';
    return () => {};
  }

  const uzunluklar = cizgiler.map(c => c.getTotalLength());
  for (const cizgi of cizgiler) {
    cizgi.style.strokeDasharray = '1';
    cizgi.style.strokeDashoffset = '1';
  }
  let son = 0;
  const araliklar = ses?.araliklar ?? uzunluklar.map(uzunluk => {
    const bas = son, bitis = bas + Math.max(.64, uzunluk * .014);
    son = bitis + .24;
    return [bas,bitis];
  });
  const baslangic = performance.now();
  let sira = 0, animasyon = 0;
  function kare(simdi: number) {
    const zaman = ses ? ses.zaman() : (simdi-baslangic)/1000;
    while (sira < cizgiler.length && zaman >= araliklar[sira][1]) {
      cizgiler[sira++].style.strokeDashoffset = '0';
    }
    if (sira === cizgiler.length) { uc.style.display='none'; return; }
    const [bas,bitis] = araliklar[sira];
    const oran = Math.max(0, (zaman-bas)/(bitis-bas));
    const cizgi=cizgiler[sira], nokta=cizgi.getPointAtLength(oran*uzunluklar[sira]);
    cizgi.style.strokeDashoffset=String(1-oran);
    uc.style.display=zaman < bas ? 'none' : '';
    uc.setAttribute('transform','translate('+nokta.x+' '+nokta.y+')');
    animasyon=requestAnimationFrame(kare);
  }
  animasyon = requestAnimationFrame(kare);
  return () => cancelAnimationFrame(animasyon);
}
