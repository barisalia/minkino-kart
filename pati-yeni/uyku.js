const pozlar = import.meta.glob('../assets/pati-yeni/uyku/*.webp',{eager:true,query:'?url',import:'default'});

// The puppy sheet follows Fındık's floppy ears and tan coat. Customised dogs keep their own rig.
export function uykuCizimi(model,kopek) {
  const findik = model.id === 'kopek' && kopek.kulakTip === 'sarkik'
    && kopek.tuy === '#f0c78b' && kopek.kulak === '#9d684b' && kopek.acik === '#fff7e6'
    && kopek.kuyruk === 'uzun' && kopek.desen === 'alacali';
  const tekir = model.tur === 'kedi' && model.temel === 0;
  if (!findik && !tekir) return '';
  const kok = findik ? 'findik' : 'tekir';
  const kareler = Array.from({length:4},(_,i)=>{
    const url=pozlar['../assets/pati-yeni/uyku/'+kok+'-'+i+'.webp'];
    return `<img src="${url}" alt="" class="uyku-karesi">`;
  });
  return `<div class="cizili-uyku ${kok}" role="img" aria-label="${model.ad} uyuyor">${kareler.join('')}</div>`;
}

export async function uykuyaGec(sahne,eskiYatak) {
  if (!sahne || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const yatak=sahne.querySelector('.yatak');
  if(eskiYatak && yatak){
    const yeni=yatak.getBoundingClientRect();
    const x=eskiYatak.left+eskiYatak.width/2-yeni.left-yeni.width/2;
    const y=eskiYatak.bottom-yeni.bottom;
    const baslangic=`translate(${x}px,${y}px) scale(${eskiYatak.width/yeni.width})`;
    for(const kat of sahne.querySelectorAll('.yatak,.yatak-kenari,.buyuk')){
      kat.animate([{transform:baslangic,transformOrigin:'50% 100%'},{transform:'none',transformOrigin:'50% 100%'}],{duration:480,easing:'cubic-bezier(.2,.65,.3,1)'});
    }
  }
  const resimler = [...sahne.querySelectorAll('.uyku-karesi')];
  try { await Promise.all(resimler.map(img=>img.decode())); } catch { return; }
  if (!sahne.isConnected) return;
  sahne.classList.add('yeni-uyku');
}
