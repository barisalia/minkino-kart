import {
  BIRIM,
  DUSUS,
  GOZ,
  KAT,
  giris,
  ilkPlan,
  pim,
  planOku,
  raylar,
  sigar,
  yon,
  type Nokta,
  type Parca,
  type Tip,
} from './misket-geometri';
import { konum, modSimgesi, parkurCiz, rayKullan, yol, stokYerleri, rafY } from './misket-cizim';
import { misketiYuvarla, type Yer } from './misket-hareket';
import { oyunSesi } from '../../alfabe/src/oyun-sesi';
import { sesiAc } from '../../src/audio/ses';
import './misket.css';

type Mod = 'atolye' | 'serbest';
type Asama = 'kur' | 'yuklu' | 'akiyor' | 'dustu' | 'caldi';
type Sahne = {
  kok: HTMLElement;
  ileri: string;
  anlat: (i: number) => void;
  sustur: () => void;
  devam: (basardi: boolean) => void;
};
const adlar: Record<Mod, string> = { atolye: 'Hazır parkuru tamamla', serbest: 'Kendi parkurunu kur' };
const anahtarYer = (p: Yer) => p.kat + ':' + p.goz;
const kumanda = (e: Event) => (e.target as Element)?.closest<SVGElement>('[role="button"]');

export function misketParkuru({ kok, ileri, anlat, sustur, devam }: Sahne) {
  const anahtar = 'minkino-misket-v1-buyuk';
  let mod: Mod = 'atolye';
  const planlar: Record<Mod, Parca[]> = { atolye: ilkPlan(), serbest: [] };
  const basarilar = { atolye: false, serbest: false };
  const gecmis: Record<Mod, Parca[][]> = { atolye: [], serbest: [] };
  try {
    const kayit = JSON.parse(localStorage.getItem(anahtar) || 'null');
    if (kayit) {
      for (const k of ['atolye', 'serbest'] as const) {
        planlar[k] = planOku(kayit[k]) ?? planlar[k];
        basarilar[k] = kayit.basarilar?.[k] === true;
      }
      if (kayit.mod === 'serbest') mod = 'serbest';
    }
  } catch {}
  function kaydet() {
    try {
      localStorage.setItem(anahtar, JSON.stringify({ mod, ...planlar, basarilar }));
    } catch {}
  }
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 1120 630');
  svg.setAttribute('aria-label', 'Misket Şelalesi, üç katlı ray atölyesi');
  svg.classList.add('mk-makine');
  svg.innerHTML = parkurCiz();
  kok.append(svg);
  const bul = (s: string) => svg.querySelector<SVGElement>(s)!;
  const rayKatmani = bul('.mk-yol'),
    hedefler = bul('.mk-hedefler'),
    oniz = bul('.mk-oniz');
  const top = bul('.mk-top-konum'),
    donen = bul('.mk-top-donus');
  const duyuru = document.createElement('span');
  duyuru.className = 'mk-okuyucu';
  duyuru.setAttribute('role', 'status');
  kok.append(duyuru);
  const modlar = document.createElement('div');
  modlar.className = 'mk-modlar';
  modlar.setAttribute('role', 'group');
  modlar.setAttribute('aria-label', 'Parkur seçimi');
  for (const k of ['atolye', 'serbest'] as const) {
    const b = document.createElement('button');
    b.type = 'button';
    b.dataset.mod = k;
    b.setAttribute('aria-label', adlar[k]);
    b.title = adlar[k];
    b.innerHTML = modSimgesi(k);
    b.onclick = () => degistir(k);
    modlar.append(b);
  }
  kok.append(modlar);
  const gec = document.createElement('button');
  gec.type = 'button';
  gec.className = 'mk-devam';
  gec.innerHTML = ileri;
  gec.setAttribute('aria-label', 'Diğer ölçü oyunlarına geç');
  gec.onclick = () => {
    sesiAc();
    devam(basarilar.atolye || basarilar.serbest);
  };
  kok.append(gec);

  let asama: Asama = 'kur',
    secili: Tip | null = null,
    bekleyen: Yer | null = null,
    sonBos: Yer | null = null;
  let hareketiKes: (() => void) | undefined,
    geriBildirim = 0,
    tikEngeli = 0,
    rehberSaati = 0;
  const rehber = bul('.mk-rehber');
  let tutus: { id: number; ilk: Nokta; tip: Tip | 'top' | 'kol'; tasindi: boolean } | null = null;
  const plan = () => planlar[mod];
  function rehberiSil() {
    clearTimeout(rehberSaati);
    rehber.getAnimations().forEach((a) => a.cancel());
    rehber.replaceChildren();
  }
  function yardimBekle() {
    rehberiSil();
    if (asama !== 'kur') return;
    rehberSaati = window.setTimeout(() => {
      if (tutus || !svg.isConnected || document.hidden || asama !== 'kur') return;
      const yuvalar = Array.from(svg.querySelectorAll<SVGElement>('[data-yuva]'));
      const hedef = yuvalar
        .map((el) => el.dataset.yuva!.split(':').map(Number))
        .map(([kat, goz]) => ({ kat, goz }))
        .find((yer) => !secili || sigar(plan(), { ...yer, tip: secili }));
      if (!hedef && yuvalar.length) return;
      const tip = secili ?? 'kisa';
      const kaynak = hedef ? { x: stokYerleri[tip], y: rafY(tip) } : { x: 100, y: 541 };
      const son = hedef ? pim(hedef.kat, hedef.goz) : { x: 105, y: 81 };
      if (hedef && yon(hedef.kat) < 0) kaynak.x += raylar[tip].birim * BIRIM;
      const cizim = hedef
        ? '<g transform="scale(' + yon(hedef.kat) + ' 1)">' + rayKullan(tip) + '</g>'
        : '<use href="#mk-misket"/>';
      rehber.innerHTML = cizim;
      if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
        rehber.setAttribute('transform', 'translate(' + son.x + ' ' + son.y + ')');
        return;
      }
      rehber.removeAttribute('transform');
      const anim = rehber.animate(
        [
          { transform: 'translate(' + kaynak.x + 'px,' + kaynak.y + 'px)', opacity: 0 },
          { transform: 'translate(' + kaynak.x + 'px,' + kaynak.y + 'px)', opacity: 0.55, offset: 0.16 },
          { transform: 'translate(' + son.x + 'px,' + son.y + 'px)', opacity: 0.55, offset: 0.78 },
          { transform: 'translate(' + son.x + 'px,' + son.y + 'px)', opacity: 0 },
        ],
        { duration: 1700, iterations: 2, easing: 'ease-in-out' },
      );
      anim.onfinish = () => rehber.replaceChildren();
    }, 6500);
  }
  function durum(a: Asama) {
    asama = a;
    svg.dataset.asama = a;
    bul('.mk-stok-top').setAttribute('visibility', a === 'kur' ? 'visible' : 'hidden');
  }
  function topuKoy(n: Nokta, aci = 0) {
    top.setAttribute('visibility', 'visible');
    top.setAttribute('transform', 'translate(' + n.x + ' ' + n.y + ')');
    donen.setAttribute('transform', 'rotate(' + aci + ')');
  }
  function geriDon() {
    hareketiKes?.();
    hareketiKes = undefined;
    clearTimeout(geriBildirim);
    oniz.replaceChildren();
    svg.setAttribute('viewBox', '0 0 1120 630');
    top.setAttribute('visibility', 'hidden');
    svg.classList.remove('mk-zil-cal', 'mk-kol-cek');
    durum('kur');
  }
  function degistir(k: Mod) {
    if (k === mod) return;
    sesiAc();
    tutusuBirak();
    geriDon();
    mod = k;
    secili = null;
    bekleyen = null;
    sonBos = null;
    kaydet();
    ciz();
    anlat(k === 'serbest' ? 90 : 89);
  }
  function planDegistir(yeni: Parca[], sakla = true) {
    if (sakla) {
      gecmis[mod].push(plan());
      if (gecmis[mod].length > 50) gecmis[mod].shift();
    }
    planlar[mod] = yeni;
    secili = null;
    bekleyen = null;
    sonBos = null;
    kaydet();
    ciz();
  }
  function uygunYer(yer: Yer, tip: Tip) {
    for (let i = 0; i < raylar[tip].birim; i++) {
      const p = { kat: yer.kat, goz: yer.goz - i, tip };
      if (sigar(plan(), p)) return p;
    }
    return null;
  }
  function ciz() {
    const dolu = plan();
    rayKatmani.innerHTML = dolu
      .map((p) => {
        const n = raylar[p.tip].birim;
        return `<g transform="${konum(p)}" role="button" tabindex="0" class="mk-ray mk-kumanda" data-ray="${anahtarYer(p)}" aria-label="${p.kat + 1}. sıradaki ${p.goz + 1}. rayı çıkar">
        ${rayKullan(p.tip)}${p.tip === 'vadi' ? '<path class="mk-titresim" d="M51 53l-4 5m18 -1 -1 6m26 -8 3 5" fill="none" stroke="#bb7651" stroke-width="3" stroke-linecap="round"/>' : ''}
        <path d="M0 4l${n * BIRIM} ${n * DUSUS}" stroke="transparent" stroke-width="52"/></g>`;
      })
      .join('');
    let yuvalar = '';
    for (let kat = 0; kat < KAT; kat++)
      for (let goz = 0; goz < GOZ; goz++) {
        const yer = { kat, goz };
        if (!sigar(dolu, { ...yer, tip: 'kisa' })) continue;
        const a = pim(kat, goz),
          b = pim(kat, goz + 1),
          d = yol([a, b]);
        const hedef = bekleyen ?? sonBos;
        const sec = hedef?.kat === kat && hedef.goz === goz;
        const uygun = secili && uygunYer(yer, secili);
        yuvalar += `<g class="mk-yuva mk-kumanda${sec ? ' mk-hedef' : ''}${uygun ? ' mk-uygun' : ''}" role="button" tabindex="0" data-yuva="${anahtarYer(yer)}" aria-label="${kat + 1}. sıra ${goz + 1}. boş bağlantı">
        <path class="mk-yuva-alt" d="${d}"/><path class="mk-yuva-iz" d="${d}"/>
        <circle cx="${a.x}" cy="${a.y}" r="4.4"/><circle cx="${b.x}" cy="${b.y}" r="4.4"/>
        <path d="${d}" stroke="transparent" stroke-width="58" fill="none"/></g>`;
      }
    hedefler.innerHTML = yuvalar;
    svg.dataset.mod = mod;
    svg.dataset.tamam = String(!yuvalar);
    for (const e of svg.querySelectorAll<SVGElement>('.mk-stok'))
      e.setAttribute('aria-pressed', String(e.dataset.tip === secili));
    for (const e of modlar.querySelectorAll('button'))
      e.setAttribute('aria-pressed', String(e.dataset.mod === mod));
    bul('.mk-geri').setAttribute('aria-disabled', String(!gecmis[mod].length));
    yardimBekle();
  }
  function tak(yer: Yer, tip: Tip) {
    const p = uygunYer(yer, tip);
    if (!p) {
      oyunSesi('geri');
      anlat(94);
      return;
    }
    oyunSesi('miknatis');
    sustur();
    planDegistir([...plan(), p]);
    duyuru.textContent = raylar[tip].birim + ' birimlik ray takıldı.';
    svg.querySelector('[data-ray="' + anahtarYer(p) + '"]')?.classList.add('mk-oturdu');
    if (svg.dataset.tamam === 'true' && asama === 'kur') anlat(91);
  }
  function yukle() {
    if (asama !== 'kur') return;
    secili = null;
    bekleyen = null;
    durum('yuklu');
    ciz();
    oyunSesi('kutu');
    topuKoy({ x: giris[0].x, y: giris[0].y - 10 });
    anlat(92);
  }
  function tekrarAnlat() {
    if (asama === 'akiyor') return;
    anlat(
      asama === 'yuklu'
        ? 92
        : asama === 'caldi'
          ? 95
          : sonBos
            ? 93
            : svg.dataset.tamam === 'true'
              ? 91
              : mod === 'serbest'
                ? 90
                : 89,
    );
  }
  function gonder() {
    if (asama !== 'yuklu') return;
    sustur();
    durum('akiyor');
    bekleyen = null;
    sonBos = null;
    secili = null;
    ciz();
    svg.classList.add('mk-kol-cek');
    oyunSesi('miknatis');
    hareketiKes = misketiYuvarla(svg, plan(), topuKoy, (bos) => {
      svg.classList.remove('mk-kol-cek');
      if (bos) {
        sonBos = bos;
        durum('dustu');
        ciz();
        anlat(93);
      } else {
        durum('caldi');
        basarilar[mod] = true;
        kaydet();
        svg.classList.add('mk-zil-cal');
        duyuru.textContent = 'Misket zili çaldı.';
      }
      geriBildirim = window.setTimeout(
        () => {
          geriDon();
          ciz();
          if (!bos) anlat(95);
        },
        bos ? 800 : 1250,
      );
    });
  }
  function bas(e: SVGElement) {
    if (asama === 'akiyor' || asama === 'dustu') return;
    if (asama === 'caldi') geriDon();
    sesiAc();
    if (e.dataset.is === 'gonder') {
      if (asama === 'yuklu') gonder();
      else anlat(91);
      return;
    }
    if (e.dataset.is === 'top' || e.dataset.is === 'yukle') {
      yukle();
      return;
    }
    if (e.dataset.is === 'geri') {
      const once = gecmis[mod].pop();
      if (once) {
        oyunSesi('kutu');
        planDegistir(once, false);
      }
      return;
    }
    const tip = e.dataset.tip as Tip | undefined;
    if (tip) {
      if (bekleyen) {
        tak(bekleyen, tip);
        return;
      }
      secili = secili === tip ? null : tip;
      oyunSesi('kutu');
      ciz();
      return;
    }
    const deger = e.dataset.yuva ?? e.dataset.ray;
    if (!deger) return;
    const [kat, goz] = deger.split(':').map(Number),
      yer = { kat, goz };
    if (e.dataset.ray) {
      const kalan = plan().filter((p) => p.kat !== kat || p.goz !== goz);
      if (secili) {
        const yeni = { kat, goz, tip: secili };
        if (!sigar(kalan, yeni)) {
          oyunSesi('geri');
          anlat(94);
          return;
        }
        oyunSesi('miknatis');
        planDegistir([...kalan, yeni]);
      } else {
        oyunSesi('kutu');
        planDegistir(kalan);
      }
      return;
    }
    if (secili) {
      tak(yer, secili);
      return;
    }
    bekleyen = yer;
    ciz();
  }
  function yerel(x: number, y: number): Nokta {
    return new DOMPoint(x, y).matrixTransform(svg.getScreenCTM()!.inverse());
  }
  function yakindaki(n: Nokta, tip: Tip): Yer | null {
    for (let kat = 0; kat < KAT; kat++) {
      const oran = ((n.x - pim(kat, 0).x) * yon(kat)) / BIRIM;
      if (oran < -0.15 || oran > GOZ + 0.15) continue;
      const goz = Math.max(0, Math.min(GOZ - 1, Math.floor(oran)));
      if (Math.abs(n.y - pim(kat, goz + 0.5).y) > 47 || !sigar(plan(), { kat, goz, tip: 'kisa' })) continue;
      const en = raylar[tip].birim;
      let bas = goz,
        enYakin = Infinity;
      for (let i = goz - en + 1; i <= goz; i++) {
        const uzaklik = Math.abs(i + en / 2 - oran);
        if (uzaklik < enYakin && sigar(plan(), { kat, goz: i, tip })) {
          bas = i;
          enYakin = uzaklik;
        }
      }
      return { kat, goz: bas };
    }
    return null;
  }
  function tutusuBirak() {
    const eski = tutus;
    tutus = null;
    if (eski && svg.hasPointerCapture(eski.id)) svg.releasePointerCapture(eski.id);
    oniz.replaceChildren();
    if (asama === 'kur') bul('.mk-stok-top').setAttribute('visibility', 'visible');
  }
  svg.onpointerdown = (e) => {
    rehberiSil();
    tikEngeli = 0;
    if (tutus || !e.isPrimary || e.button !== 0 || asama === 'akiyor' || asama === 'dustu') return;
    const el = kumanda(e),
      tip = el?.dataset.tip as Tip | undefined;
    const nesne = tip ?? (el?.dataset.is === 'top' ? 'top' : el?.dataset.is === 'gonder' ? 'kol' : null);
    if (!nesne || (nesne === 'top' && asama === 'yuklu')) return;
    if (asama === 'caldi') geriDon();
    sesiAc();
    tutus = { id: e.pointerId, ilk: yerel(e.clientX, e.clientY), tip: nesne, tasindi: false };
  };
  svg.onpointermove = (e) => {
    if (!tutus || tutus.id !== e.pointerId) return;
    const n = yerel(e.clientX, e.clientY);
    if (!tutus.tasindi && Math.hypot(n.x - tutus.ilk.x, n.y - tutus.ilk.y) < 7) return;
    if (!tutus.tasindi) svg.setPointerCapture(e.pointerId);
    tutus.tasindi = true;
    if (tutus.tip === 'kol') {
      svg.classList.add('mk-kol-cek');
      return;
    }
    if (tutus.tip === 'top') {
      bul('.mk-stok-top').setAttribute('visibility', 'hidden');
      oniz.innerHTML = '<use href="#mk-misket" transform="translate(' + n.x + ' ' + n.y + ')"/>';
      return;
    }
    const yer = yakindaki(n, tutus.tip),
      p = yer && uygunYer(yer, tutus.tip);
    const x = n.x - (raylar[tutus.tip].birim * BIRIM) / 2;
    oniz.innerHTML =
      '<g class="' +
      (p ? 'mk-tam-otur' : 'mk-elde') +
      '" transform="' +
      (p ? konum(p) : 'translate(' + x + ' ' + n.y + ')') +
      '">' +
      rayKullan(tutus.tip) +
      '</g>';
  };
  svg.onpointerup = (e) => {
    if (!tutus || tutus.id !== e.pointerId) return;
    const { tip, tasindi } = tutus,
      n = yerel(e.clientX, e.clientY);
    tutusuBirak();
    if (!tasindi) return;
    tikEngeli = performance.now() + 350;
    if (tip === 'kol') {
      svg.classList.remove('mk-kol-cek');
      bas(bul('.mk-kol'));
      return;
    }
    if (tip === 'top') {
      if (Math.hypot(n.x - 105, n.y - 81) < 80) yukle();
      else anlat(91);
      return;
    }
    const yer = yakindaki(n, tip);
    if (yer) tak(yer, tip);
  };
  svg.onpointercancel = () => {
    tutusuBirak();
    svg.classList.remove('mk-kol-cek');
  };
  svg.onlostpointercapture = (e) => {
    if (e.target === svg && tutus?.tasindi) tutusuBirak();
  };
  svg.onpointerleave = () => {
    if (tutus && !tutus.tasindi) tutusuBirak();
  };
  svg.onclick = (e) => {
    const el = kumanda(e);
    if (el && performance.now() > tikEngeli) bas(el);
  };
  svg.onkeydown = (e) => {
    if (e.key !== ' ' && e.key !== 'Enter') return;
    e.preventDefault();
    const el = kumanda(e);
    if (el && !e.repeat) bas(el);
  };
  durum('kur');
  ciz();
  tekrarAnlat();
  return {
    kapat: () => {
      tutusuBirak();
      geriDon();
      rehberiSil();
    },
    tekrarAnlat,
  };
}
