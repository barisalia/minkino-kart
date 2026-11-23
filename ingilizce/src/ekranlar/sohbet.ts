/**
 * Karakterle sohbet (23 Kasım 2026; veri: sohbet-veri.ts). Ana ekranda bir karaktere dokununca açılır, sınıfın üstünde.
 *
 * Akış: karakter selam verir; dört tur boyunca sorar ("What fruit do you like?"), çocuk üç resimli cevaptan birine dokunur
 * (soru sürerken de). Seçilen resim zıplar ve karaktere uçar, karakter sevinir; varsa hayvanın ya da taşıtın sesi, sonra
 * karakter cevaba göre konuşmayı sürdürür. Son tur bir davet (Yes / No; ikisi de sevinçle biter). Sonda karakter vedalaşır,
 * sohbet kapanır. Yanlış cevap yoktur. Karaktere dokununca soru yinelenir; kapat düğmesi ve dışarı dokunuş her an çıkarır.
 *
 * Polly'nin ağzı konuşmayı izler (konuşma kareleri). Oturan karakterlerin (Mino, Zıpzıp, Lokum) çizimleri ana ekranın
 * sahne parçalarıdır (sahne-ana/<ad>-N): konuşurken hafifçe sallanırlar, sevince sevinç karesine geçip zıplarlar.
 */
import { h, TEST_MODU } from '../../../src/ui/dom';
import { kelimeBul } from '../icerik';
import { cizim, dugme, hareket, ipucuKur, kelimeResmi, kisi, kutla, simgeDugme, ucur, ziplat } from '../kit';
import { efektCal, konus, sesHazirla, sus, tik } from '../ses';
import { resim, sesAdresi } from '../varlik';
import { SOHBETLER, acilisSesi, cevapSesi, kapanisSesi, sohbetSesleri, sohbetTurlari, soruSesi, type Sohbet, type SohbetCevabi, type SohbetKarakteri, type SohbetSorusu } from '../sohbet-veri';

/** Bayraklar: hangi karakterin sohbeti açık (kayıtları gelmeden hiçbiri açılmaz) */
export const SOHBET_ACIK: Readonly<Record<SohbetKarakteri, boolean>> = { polly: true, mino: true, zipzip: true, lokum: true };
export const sohbetHazir = (k: SohbetKarakteri = 'polly'): boolean =>
  SOHBET_ACIK[k] && (TEST_MODU || sohbetSesleri(SOHBETLER[k]).every((id) => !!sesAdresi(id)));

const bekle = (ms: number) => new Promise<void>((r) => setTimeout(r, TEST_MODU ? Math.min(ms, 15) : ms));

/** Oturan karakterlerin sahne kareleri: duruş, selam (el sallama ya da bakış), sevinç */
const KARELER: Partial<Record<SohbetKarakteri, { dur: string; selam: string; sevin: string }>> = {
  mino: { dur: 'sahne-ana/mino-0', selam: 'sahne-ana/mino-1', sevin: 'sahne-ana/mino-1' },
  zipzip: { dur: 'sahne-ana/zipzip-2', selam: 'sahne-ana/zipzip-2', sevin: 'sahne-ana/zipzip-1' },
  lokum: { dur: 'sahne-ana/lokum-0', selam: 'sahne-ana/lokum-1', sevin: 'sahne-ana/lokum-2' },
};

/** Ana ekran açılınca sohbetlerin kayıtları önceden indirilir (ilk dokunuşta karakter hemen konuşsun) */
export function sohbetHazirla() {
  for (const k of Object.keys(SOHBETLER) as SohbetKarakteri[]) if (sohbetHazir(k)) sesHazirla(sohbetSesleri(SOHBETLER[k]));
}

type Hal = 'dur' | 'selam' | 'sevin' | 'dans';
/** Karakter görünüşü: Polly konuşan kişi, öbürleri sahne kareleri */
function karakterGorunusu(k: Sohbet): { el: HTMLElement; hal(x: Hal): void } {
  if (k.karakter === 'polly') {
    const el = kisi('polly', 'ing-shb-polly');
    return { el, hal: (x) => { if (x === 'selam') void hareket('polly', 'selam'); else if (x === 'sevin') void hareket('polly', 'sevin'); else if (x === 'dans') void hareket('polly', 'sarki', 2); } };
  }
  const k2 = KARELER[k.karakter]!;
  const img = h('img', { src: resim(k2.dur) ?? '', alt: '', draggable: 'false' });
  const el = h('span.ing-shb-karakter', { 'data-karakter': k.karakter }, img);
  let zaman = 0;
  return {
    el,
    hal: (x) => {
      clearTimeout(zaman);
      const yol = x === 'dur' ? k2.dur : x === 'selam' ? k2.selam : k2.sevin;
      img.src = resim(yol) ?? img.src;
      el.classList.remove('ing-shb-zipla', 'ing-shb-dans'); void el.offsetWidth;
      if (x === 'sevin' || x === 'selam') el.classList.add('ing-shb-zipla');
      if (x === 'dans') el.classList.add('ing-shb-dans');
      if (x !== 'dur') zaman = window.setTimeout(() => { img.src = resim(k2.dur) ?? img.src; el.classList.remove('ing-shb-dans'); }, x === 'dans' ? 2400 : 1400);
    },
  };
}

/** Sohbeti açar; kapanınca `bitti` çağrılır */
export function sohbetAc(kok: HTMLElement, karakter: SohbetKarakteri = 'polly', bitti: () => void = () => {}): void {
  // çift dokunuş: sohbet zaten açıksa ikincisi açılmaz (iki panel üst üste açılıp birbirinin sözünü kesiyordu)
  if (kok.querySelector('.ing-shb')) return;
  const k = SOHBETLER[karakter];
  let acik = true;
  const turlar = sohbetTurlari(k);
  const gorunus = karakterGorunusu(k);
  const karakterDugme = dugme('ing-shb-polly-dugme', `${k.ad}’yi yeniden dinle`, () => { tik.dokun(); if (bekliyor) void soyle(soruSesi(k, turlar[no])); }, gorunus.el);
  const ingilizce = h('strong', { lang: 'en-US' });
  const turkce = h('small', { lang: 'tr' });
  const balon = h('div.ing-shb-balon', {}, ingilizce, turkce);
  const cevaplar = h('div.ing-shb-cevaplar');
  const noktalar = h('div.ing-shb-noktalar', { 'aria-hidden': 'true' }, ...turlar.map(() => h('i')));
  const kapat = simgeDugme('kapat', 'Sohbeti kapat', () => { tik.dokun(); kapan(); }, 'ing-shb-kapat');
  const panel = h('section.ing-shb-panel', { role: 'dialog', 'aria-label': `${k.ad} ile sohbet` }, h('div.ing-shb-sol', {}, karakterDugme), h('div.ing-shb-sag', {}, balon, cevaplar), noktalar, kapat);
  const ortu = h('div.ing-shb', { 'data-karakter': k.karakter }, panel);
  kok.append(ortu);
  let no = 0, bekliyor = false;

  const yaz = (en: string, tr: string) => {
    ingilizce.textContent = en; turkce.textContent = tr;
    balon.classList.remove('ing-shb-yeni'); void balon.offsetWidth; balon.classList.add('ing-shb-yeni');
  };
  // oturan karakter konuşurken hafifçe sallanır (ağız karesi yok)
  const soyle = async (...idler: string[]) => {
    if (!acik) return false;
    gorunus.el.classList.add('ing-shb-konusuyor');
    await konus(...idler);
    gorunus.el.classList.remove('ing-shb-konusuyor');
    return acik;
  };

  function kapan() {
    if (!acik) return;
    acik = false;
    sus();
    ipucuKur(undefined);
    ortu.classList.add('ing-shb-gidiyor');
    window.setTimeout(() => { ortu.remove(); bitti(); }, TEST_MODU ? 0 : 320);
  }
  ortu.addEventListener('click', (e) => { if (e.target === ortu) { tik.dokun(); kapan(); } });

  function cevapKarti(s: SohbetSorusu, cvp: SohbetCevabi): HTMLButtonElement {
    const evetHayir = cvp.id === 'yes' || cvp.id === 'no';
    const w = evetHayir ? null : kelimeBul(cvp.id);
    const gorsel = evetHayir ? (cizim(cvp.id === 'yes' ? 'ui/evet' : 'ui/hayir') ?? h('span')) : (w ? kelimeResmi(w) : h('span'));
    const ad = evetHayir ? (cvp.id === 'yes' ? 'Yes' : 'No') : (w?.en ?? cvp.id);
    const d = dugme(`ing-shb-kart${evetHayir ? ` ing-shb-${cvp.id}` : ''}`, ad, () => void sec(s, cvp, d), h('span.ing-shb-resim', {}, gorsel), h('b', { lang: 'en-US' }, ad));
    d.dataset.cevap = cvp.id;
    return d;
  }

  async function sor() {
    const s = turlar[no];
    bekliyor = false;
    ortu.dataset.tur = String(no);
    delete ortu.dataset.bekliyor;
    noktalar.querySelectorAll('i').forEach((n, i) => n.classList.toggle('ing-dolu', i < no));
    yaz(s.en, s.tr);
    cevaplar.replaceChildren(...s.cevaplar.map((cvp, i) => { const kart = cevapKarti(s, cvp); kart.style.setProperty('--n', String(i)); return kart; }));
    gorunus.hal('selam');
    // kartlar gelir gelmez seçilebilir: çocuk sorunun bitmesini beklemez (seçince karakter susar, cevaba geçer)
    bekliyor = true;
    ortu.dataset.bekliyor = '1';
    const buTur = no;
    await soyle(soruSesi(k, s));
    if (!acik || no !== buTur || !bekliyor) return;
    ipucuKur(() => cevaplar.firstElementChild, 6000);
  }

  async function sec(s: SohbetSorusu, cvp: SohbetCevabi, d: HTMLElement) {
    if (!bekliyor || !acik) return;
    bekliyor = false;
    delete ortu.dataset.bekliyor;
    ipucuKur(undefined);
    sus();
    tik.sec();
    // seçilen kart zıplar ve karaktere uçar; öbürleri çekilir
    cevaplar.querySelectorAll<HTMLElement>('.ing-shb-kart').forEach((x) => { if (x !== d) x.classList.add('ing-shb-cekil'); });
    d.classList.add('ing-shb-secildi');
    const w = kelimeBul(cvp.id);
    void ziplat(d.querySelector<HTMLElement>('.ing-resim'), w ?? undefined);
    kutla(d);
    const adSesi = w ? [`en/w-${w.id}`] : [];
    await bekle(260);
    if (!acik) return;
    void ucur(d, gorunus.el, { sure: 520, kucul: 0.35 });
    yaz(cvp.en, cvp.tr);
    gorunus.hal(cvp.id === 'yes' && s === k.son ? 'dans' : 'sevin');
    if (cvp.efekt) { await Promise.race([efektCal(cvp.efekt), bekle(1100)]); if (!acik) return; }
    if (!(await soyle(...adSesi, cevapSesi(k, s, cvp)))) return;
    if (cvp.id === 'no') tik.konfeti(true);
    await bekle(350);
    if (!acik) return;
    no++;
    if (no < turlar.length) { void sor(); return; }
    // veda: noktalar dolar, yıldızlar, karakter el sallar
    noktalar.querySelectorAll('i').forEach((n) => n.classList.add('ing-dolu'));
    cevaplar.replaceChildren();
    yaz(k.kapanis.en, k.kapanis.tr);
    kutla(gorunus.el);
    ortu.dataset.bitti = '1';
    gorunus.hal('selam');
    if (!(await soyle(kapanisSesi(k)))) return;
    await bekle(500);
    kapan();
  }

  void (async () => {
    yaz(k.acilis.en, k.acilis.tr);
    gorunus.hal('sevin');
    if (!(await soyle(acilisSesi(k)))) return;
    void sor();
  })();
}
