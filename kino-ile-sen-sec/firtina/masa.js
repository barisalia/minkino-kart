'use strict';
const masaResimleri = new Map();
const sarilmaSuresi = d => (d.kuzu === 'kuru' ? 1640 : 0) + 2960;
function masaSahnesi(id) {
  return id === 'F5A' || id === 'E3' || id === 'S2';
}
async function masaHazirla(id, d) {
  const adlar = ['decor', 'giris', 'kino', d.kuzu === 'kuru' ? 'kuzu' : 'lokum'];
  if (d.mino) adlar.push('mino');
  if (id === 'E3') {
    adlar.push('sokulma-kino','sokulma-lokum','ilk-temas','kucak-dirsek','kucak-omuz','embrace','yanak-yana','kucak-replik-kino','kucak-replik-lokum');
    if (d.kuzu === 'kuru') adlar.push('birak','kuzu-yerde');
  }
  if (id === 'S2') {
    adlar.push('fort1','fort2','fort3','fort4','fort','kuzu','kale-ortu','kale-ortu-adim','kale-pay','kale-ekmek-al','kale-uyku','kuzu-yerde');
    adlar.push('ortu-tut','ortu-kaldir','ortu-ac','ortu-ser','ortu-duzelt','ortu-bitir');
    if(d.mino) adlar.push('kale-piknik');
    if(d.kuzu!=='kuru') adlar.push('kale-kuzu-al','kale-kuzu-getir');
    if(d.kaleIsigi==='lamba') adlar.push('kale-lamba');
  }
  await pozlariHazirla(adlar);
}
async function pozlariHazirla(adlar) {
  await Promise.all(adlar.map(ad => {
    if (!masaResimleri.has(ad)) {
      const im = new Image();
      im.src = 'medya/' + (masaKareleri[ad].page || masaKareleri[ad]) + '.webp';
      masaResimleri.set(ad, {im, hazir: im.decode().catch(err => { masaResimleri.delete(ad); throw err; })});
    }
    return masaResimleri.get(ad).hazir;
  }));
}
function ciziliHareket(ad,i,x,taban,h) {
  const sheet=masaKareleri[ad],k=sheet.frames[i];
  const scale=h/sheet.referenceHeight;
  ctx.drawImage(masaResimleri.get(ad).im,...k,x-k[2]*scale/2,taban-k[3]*scale,k[2]*scale,k[3]*scale);
  return taban-k[3]*scale;
}
function hareketKaresi(p) {return Math.min(7,Math.floor(aralik(p)*8))}
function kaleOyunculari(d,satir) {
  const germe = plan.mod==='action' || plan.mod==='gesture';
  const p = plan.kalePoz ?? 0;
  const i = hareketKaresi(p);
  const paylas = satir==='S2-3' || satir==='S2-4';
  const uclu = d.mino && (satir==='S2-5' || satir==='S2-3');
  const son = satir==='S2-11';
  const elindeKuzu = d.kuzu==='kuru' || /^S2-(8|9|10|11)$/.test(satir);
  const minder = d.hazirlik==='minder';
  if (minder) parca('minder',940,734,50);
  if (satir==='S2-1') parca('baba-lamba',458,723,364);
  if (satir==='S2-2') ciziliHareket('kale-lamba',i,493,722,293);
  if (d.mino) {
    if (uclu) ciziliHareket('kale-piknik',i,1140,713,194);
    else masaKaresi('mino',masaAgzi('mino'),1148,708,136);
  }
  if (germe) {
    const yuru=aralik(plan.oran/.23);
    if(yuru<1)ciziliHareket('kale-ortu-adim',hareketKaresi(yuru),393+107*yuru,656,345);
    else ciziliHareket('kale-ortu',Math.min(3,Math.floor((plan.oran-.23)*44)),500,656,345);
  } else if(paylas) {
    ciziliHareket('kale-pay',hareketKaresi(aralik(p/.72)),816,716,201);
  } else if(satir!=='S2-6') {
    masaKaresi('kino',masaAgzi('kino'),758,714,107);
  }
  if(satir==='S2-6'){
    ctx.save();ctx.translate(775,0);ctx.scale(-1,1);
    ciziliHareket('kale-kuzu-getir',i,0,720,257);ctx.restore();
  }
  let ust;
  if (paylas) {
    if(elindeKuzu)ctx.drawImage(masaResimleri.get('kuzu-yerde').im,979,663,50,57);
    ust=masaKaresi('kale-ekmek-al',hareketKaresi(aralik((p-.26)/.74)),933,720,108);
  } else if (satir==='S2-7') {
    ust=masaKaresi('kale-kuzu-al',i,933,720,108);
  } else if (son) {
    ust=masaKaresi('kale-uyku',i,933,720,108);
  } else {
    ust=masaKaresi(elindeKuzu?'kuzu':'lokum',masaAgzi('lokum'),933,720,108);
  }
  if(d.kaptan)parca('kaptan-sapka',935,ust+7,35);
  if(!germe) {
    if(d.kaleIsigi==='fener')parca('yalniz-fener',1030,537,43);
    else if(satir && !['S2-1','S2-2'].includes(satir))parca('handlight',561,722,74);
    if(/^S2-(5|8|9|10|11)$/.test(satir)&&!uclu)parca(d.ekmek==='tam'?'iki-dilim':'ekmek-dilim',1039,736,40);
  }
}
function masaKaresi(ad, kare, merkez, taban, basOlcusu) {
  const [x,y,w,h,bas,span] = masaKareleri[ad].frames[kare];
  const oran = basOlcusu / span;
  ctx.drawImage(masaResimleri.get(ad).im, x,y,w,h, merkez-bas*oran,taban-h*oran,w*oran,h*oran);
  return taban-h*oran;
}
function masaAgzi(kisi) {
  const ses = plan.konus;
  if (ses?.who !== kisi || !ses.player) return 0;
  let poz = 0;
  for (const [t,k] of sesPozlari[ses.audio] || []) {
    if (t > ses.player.currentTime) break;
    poz = k;
  }
  return [0,1,3][poz] || 0;
}
function masaGirisKaresi(p) {
  const zaman = [0,.14,.24,.34,.46,.59,.72,.87,1];
  const yer = [452,480,520,569,632,689,735,758,758];
  const i = Math.max(0, zaman.findIndex((_,k) => p < zaman[k+1]));
  if (p >= 1) return [7,758];
  const t = (p-zaman[i])/(zaman[i+1]-zaman[i]);
  return [i, yer[i]+(yer[i+1]-yer[i])*t];
}
function sarilmaCiz(d, ms) {
  const kuru = d.kuzu === 'kuru';
  const birak = kuru ? 1640 : 0;
  if (ms < birak) {
    masaKaresi('kino',0,758,714,107);
    const ust = masaKaresi('birak',Math.min(7,Math.floor(ms/205)),933,720,108);
    if (d.kaptan) parca('kaptan-sapka',933,ust+7,35);
    return;
  }
  const t = ms - birak;
  if (kuru) ctx.drawImage(masaResimleri.get('kuzu-yerde').im,960,662,50,58);
  if (t < 1680) {
    const beats = [220,430,635,850,1085,1300,1505,1680];
    const i = beats.findIndex(end => t < end);
    const into = yumusak(aralik((t-400)/1280));
    masaKaresi('sokulma-kino',i,758+50*into,714,107);
    const x = 933-48*into;
    const ust = masaKaresi('sokulma-lokum',i,x,720,108);
    if (d.kaptan) parca('kaptan-sapka',x+2,ust+7,35);
    return;
  }
  let poz='embrace';
  if(t<1840)poz='ilk-temas';
  else if(t<2010)poz='kucak-dirsek';
  else if(t<2200)poz='kucak-omuz';
  else if(['E3-3','E3-4'].includes(plan.satir))poz='yanak-yana';
  const im = masaResimleri.get(poz).im;
  ctx.drawImage(im,747,501,198,216);
  if(poz==='embrace'){
    // Both mouth drawings are registered to the embrace cel. Keep arms and feet planted.
    const speaker=masaAgzi('kino')?'kino':masaAgzi('lokum')?'lokum':null;
    if(speaker){
      const face=masaResimleri.get('kucak-replik-'+speaker).im;
      const [x,y,w,h]=speaker==='kino'?[.34,.305,.18,.145]:[.52,.42,.14,.13];
      ctx.drawImage(face,x*face.width,y*face.height,w*face.width,h*face.height,
        747+x*198,501+y*216,w*198,h*216);
    }
  }
  if (d.kaptan) parca('kaptan-sapka',889,570,35);
}
function masaCiz() {
  const {id,d,mod,satir} = plan;
  let dekor = 'decor';
  const kale = id === 'S2';
  if (kale) {
    const germe=mod==='gesture'||mod==='action';
    if(germe && plan.oran>=.32){
      const keys=['ortu-tut','ortu-kaldir','ortu-ac','ortu-ser','ortu-duzelt','ortu-bitir'];
      const idx=Math.min(5,Math.floor((plan.oran-.32)/.68*6));
      ctx.drawImage(masaResimleri.get(keys[idx]).im,0,0,1600,900);
      boya('rgba(34,43,86,.09)');return;
    }
    dekor=germe?'fort1':'fort';
  }
  const kucak = id === 'E3';
  const ms = (plan.masaSarilma ?? 1) * sarilmaSuresi(d);
  const babaKonusuyor = kucak && satir === 'E3-3';
  // One camera throughout the under-table scene, including Dad's line.
  ctx.save();
  ctx.translate(800,450);ctx.scale(1.64,1.64);ctx.translate(-838,-538);
  const fon = masaResimleri.get(dekor).im;
  ctx.drawImage(fon,0,0,1600,900);
  if(kale) {
    kaleOyunculari(d,satir);ctx.restore();boya('rgba(34,43,86,.09)');return;
  }
  const giriyor = id === 'F5A' && plan.masaGiris < 1;
  const kuzuVar = d.kuzu === 'kuru';
  const lokumAd = kuzuVar ? 'kuzu' : 'lokum';
  if (d.mino) masaKaresi('mino',masaAgzi('mino'),1148,708,136);
  if (kucak) {
    sarilmaCiz(d,ms);
  } else {
    if (giriyor) {
      const [i,x] = masaGirisKaresi(plan.masaGiris);
      masaKaresi('giris',i,x,714,109);
      const sx = fon.naturalWidth/1600, sy = fon.naturalHeight/900;
      ctx.drawImage(fon,557*sx,470*sy,38*sx,254*sy,557,470,38,254);
    } else {
      masaKaresi('kino',masaAgzi('kino'),758,714,107);
    }
    const top = masaKaresi(lokumAd,masaAgzi('lokum'),933,720,108);
    if (d.kaptan) parca('kaptan-sapka',935,top+7,35);
  }
  if (babaKonusuyor) parca('baba-lamba',458,724,369);
  ctx.restore();
  boya('rgba(34,43,86,.09)');
}
