// "Dikenli Pati" · ödül: çıkartma defteri. Çıkartma tabakadan çekilirken soyulur, Zıpzıp'ın sayfasındaki yuvaya
// yapıştırılır; sonra pati damgası basılır. Seçilen çıkartmalar sayfada kalır.
// Çizimler: Paket Doktor-A1, G grubu. Biri eksikse sahne oyunda yoktur.
import { A1, A1_EK, CIKARTMA_SAYISI, DAMGA_BASMA_MS, damgaOturur, defterDuzeni, defterKadraji, soyulmaKaresi, yuvaBul } from './a1';
import { golgeYap } from './etki';
import { KareDizisi, Surukle, belir, el, hop, koy, ortala, uzak, ziplat, type AltSahne, type Ortam } from './parca';
import { SAHNE, type Nokta } from './veri';

/** damganın kutudaki ucu (çizimde (300, 520) / 600) */
const DAMGA_UCU: readonly [number, number] = [0.5, 520 / 600];

export function defterKur(o: Ortam): AltSahne & { ust: HTMLElement; ipucu(): void; secilenler(): string[]; yerel(p: Nokta): Nokta } {
  const hedef = CIKARTMA_SAYISI[o.yas];
  const gorunum = el('div', 'vk-gorunum vk-defter vk-altta');
  const ust = el('div', 'vk-katman vk-ust');
  // Kadraj: defter ekranı doldursun diye bütün içerik kitabın merkezi çevresinde büyütülür (ekrana göre; defterKadraji).
  // Sürükleme ve test noktaları bu büyütmeye göre çevrilir: içerideki her şey sahne ölçüsünde kalır.
  const kadraj = el('div', 'df-kadraj');
  // yerleşim ekrana göre seçilir: iPad'de dik fon (4:3), telefonda yatay fon
  const DEFTER = defterDuzeni(SAHNE.g + 2 * o.tasma.yan, SAHNE.y + 2 * o.tasma.dik, o.varMi(A1_EK.defterFonDik));
  const M = { x: DEFTER.kitap.sol + DEFTER.kitap.g / 2, y: DEFTER.kitap.ust + DEFTER.kitap.y / 2 };
  kadraj.style.transformOrigin = `${M.x}px ${M.y}px`;
  let buyutme = 1;
  const kadrajla = () => {
    const k = defterKadraji(SAHNE.g + 2 * o.tasma.yan, SAHNE.y + 2 * o.tasma.dik, DEFTER);
    if (Math.abs(k - buyutme) < 0.001) return;
    buyutme = k; kadraj.style.transform = `scale(${k.toFixed(4)})`;
  };
  const yerel = (p: Nokta): Nokta => ({ x: M.x + (p.x - M.x) / buyutme, y: M.y + (p.y - M.y) / buyutme });
  const ekrana = (p: Nokta | null): Nokta | null => (p ? { x: M.x + (p.x - M.x) * buyutme, y: M.y + (p.y - M.y) * buyutme } : null);
  const oS: Ortam = { ...o, noktaya: e => yerel(o.noktaya(e)) };
  kadrajla();
  gorunum.append(kadraj);
  const dolu = DEFTER.yuvalar.map(() => false);
  const secilen: string[] = [];
  let adim: 'cikartma' | 'damga' | 'bitti' = 'cikartma';
  let bitti: (() => void) | null = null;

  const fon = o.resim(DEFTER.fon, 'vk-katman'); koy(fon, DEFTER.fonKutu); fon.style.pointerEvents = 'none';
  kadraj.append(fon);
  // gülen portre (onay notundaki ek kare): son çıkartma yapışınca kaygılı resmin üstünde belirir
  const portre = o.varMi(A1_EK.defterPortre) ? o.resim(A1_EK.defterPortre, 'vk-katman df-portre df-gizli') : null;
  if (portre) { ortala(portre, DEFTER.portre, DEFTER.portreBoyu, DEFTER.portreBoyu); kadraj.append(portre); }
  const portreGul = () => {
    if (!portre) return;
    portre.classList.remove('df-gizli');
    portre.animate([{ scale: '.9', opacity: 0 }, { scale: '1.06', opacity: 1, offset: 0.6 }, { scale: '1', opacity: 1 }], { duration: o.sure(320), easing: 'ease-out' });
    o.parilti(DEFTER.portre, 300, ust);
  };
  const yildizlar = o.yildizHavuzu(ust, 12);
  // çıkartmalar: tabakadaki yerinden çekilirken soyulur
  const cikartmalar = A1.cikartma.map((ad, i) => {
    const yer = DEFTER.tabaka[i], B = DEFTER.hucre;
    const kutu = el('div', 'vk-katman df-cikartma');
    const soyulma = new KareDizisi(o, A1.soyulma, 'df-soyulma df-gizli');
    kutu.append(o.resim(ad, 'df-resim'), soyulma.kutu);
    let yapisti = false, cirt = false;
    const s = new Surukle(oS, kutu, { sol: yer.x - B / 2, ust: yer.y - B / 2, g: B, y: B }, {
      izin: () => adim === 'cikartma' && !yapisti,
      // sırası geçti (damga zamanı): çıkartma yerinde bir tur döner, "vuu"; sonra damga zıplar
      reddedildi: () => { if (!yapisti) { kutu.animate([{ rotate: '0deg', scale: '1' }, { rotate: '180deg', scale: '1.15', offset: 0.5 }, { rotate: '360deg', scale: '1' }], { duration: o.sure(420), easing: 'ease-in-out' }); o.ses('e-vuu', 0.5, 1.6); setTimeout(() => { if (o.calisiyor()) ipucu(); }, o.sure(380)); } },
      kaldir: 20,
      basladi: () => { o.ses('e-tik', 0.7, 1.25); cirt = false; },
      tutulurken: m => {
        // tabakadan ayrılırken köşesi kalkar; yeterince çekilince "cırt" diye kopar
        const k = soyulmaKaresi(uzak(m, yer));
        soyulma.kutu.classList.toggle('df-gizli', k < 0 || k >= 2);
        if (k >= 0) soyulma.goster(k);
        if (k >= 2 && !cirt) { cirt = true; o.ses('d-cirt', 0.8, 0.95 + Math.random() * 0.15); }
      },
      birakildi: m => {
        soyulma.kutu.classList.add('df-gizli');
        const y = yuvaBul(m, dolu, DEFTER);
        if (y < 0) return false;
        dolu[y] = true; yapisti = true; secilen.push(ad);
        const hedefYer = DEFTER.yuvalar[y], olcek = DEFTER.yuvaCapi / B;
        s.konumla(hedefYer.x - B / 2, hedefYer.y - B / 2, olcek);
        kutu.classList.add('df-yapisti');
        kutu.animate([{ scale: '1.25' }, { scale: '.92', offset: 0.6 }, { scale: '1' }], { duration: o.sure(220), easing: 'ease-out' });
        o.ses('e-pat', 0.9, 1.1); o.ses('e-cin', 0.5, 1.2 + secilen.length * 0.1);
        o.yildizSac(yildizlar, hedefYer, 7, 170, 54);
        if (secilen.length === 1) o.soyle('z-cikartma');
        if (secilen.length >= hedef) { portreGul(); damgaAdimi(); }
        return true;
      },
    });
    kadraj.append(kutu);
    return { kutu, s, yapisti: () => yapisti };
  });
  // damga
  const B = DEFTER.damgaBoyu;
  const damgaKare = new KareDizisi(o, [A1.damga, A1.damgaBasili], 'vk-katman df-damga');
  const damgaGolge = golgeYap(o.cozulmus(A1.damga) ?? new Image(), B, B);
  const damgaUcu = (): Nokta => ({ x: damga.sol + DAMGA_UCU[0] * B, y: damga.ust + DAMGA_UCU[1] * B });
  const damga = new Surukle(oS, damgaKare.kutu, { sol: DEFTER.damgaYeri.x - B / 2, ust: DEFTER.damgaYeri.y - B * 0.8, g: B, y: B }, {
    // sırası gelmedi: damga sabırsızca iki kez "tak tak" zıplar, sonra boş bir çıkartma kendini gösterir
    izin: () => adim === 'damga', reddedildi: () => { damgaKare.kutu.animate([{ translate: '0 0', rotate: '0deg' }, { translate: '0 -34px', rotate: '-8deg', offset: 0.22 }, { translate: '0 0', rotate: '0deg', offset: 0.45 }, { translate: '0 -22px', rotate: '7deg', offset: 0.68 }, { translate: '0 0', rotate: '0deg' }], { duration: o.sure(460), easing: 'ease-in-out' }); [0.45, 1].forEach(k => setTimeout(() => o.ses('e-pat', 0.5, 1.5), o.sure(460) * k)); setTimeout(() => { if (o.calisiyor()) ipucu(); }, o.sure(420)); }, golge: damgaGolge, kaldir: 40,
    basladi: () => { o.ses('e-tik', 0.7, 1.1); damgaKare.kutu.classList.remove('vk-sirada'); },
    birakildi: () => {
      const uc = damgaUcu();
      if (!damgaOturur(uc, DEFTER)) { damgaKare.kutu.classList.add('vk-sirada'); return false; }
      void bas(uc);
      return true;
    },
  });
  kadraj.append(damgaGolge, damgaKare.kutu, ust);

  function damgaAdimi() {
    adim = 'damga'; o.asamaYaz('defter-damga');
    damgaKare.kutu.classList.add('vk-sirada');
    ziplat(o, damgaKare.kutu);
    o.ses('e-cin', 0.4, 1.4);
  }
  async function bas(uc: Nokta) {
    adim = 'bitti'; o.asamaYaz('defter-bitti');
    damgaKare.goster(1);
    o.ses('d-damga', 1);
    try { navigator.vibrate?.(20); } catch { /* titreşim yoksa yalnız görüntü */ }
    await o.bekle(DAMGA_BASMA_MS);
    damgaKare.goster(0);
    const iz = o.resim(A1.damgaIzi, 'vk-katman df-iz'); ortala(iz, uc, DEFTER.izBoyu, DEFTER.izBoyu); iz.style.rotate = Math.round(-14 + Math.random() * 20) + 'deg';
    damgaKare.kutu.before(iz);
    belir(o, iz, 160);
    o.parilti(uc, 220, ust);
    o.yildizSac(yildizlar, uc, 8, 220, 60);
    damga.eve();
    await o.bekle(560);
    bitti?.(); bitti = null;
  }
  function ipucu() {
    if (adim === 'cikartma') { const bos = cikartmalar.filter(c => !c.yapisti()); if (bos.length) ziplat(o, bos[Math.floor(Math.random() * bos.length)].kutu); }
    else if (adim === 'damga') ziplat(o, damgaKare.kutu);
  }

  return {
    gorunum, ust, ipucu, yerel,
    kare: (_an: number, dt: number) => { kadrajla(); for (const c of cikartmalar) c.s.kare(dt); damga.kare(dt); },
    oyna: () => new Promise<void>(r => {
      bitti = r; adim = 'cikartma'; o.asamaYaz('defter');
      o.soyle('k-defter');
      cikartmalar.forEach((c, i) => setTimeout(() => { if (o.calisiyor()) hop(o, c.kutu, 12, 220); }, o.sure(120 + i * 60)));
    }),
    secilenler: () => [...secilen],
    nokta: (ad: string, i = 0): Nokta | null => ekrana(ad === 'cikartma' ? cikartmalar[i]?.s.merkez ?? null : ad === 'yuva' ? DEFTER.yuvalar[i] ?? null : ad === 'damga' ? damga.merkez : ad === 'damga-ucu' ? damgaUcu() : ad === 'damga-hedefi' ? DEFTER.damgaHedefi : null),
    sayim: () => ({ adim, yapisan: secilen.length, hedef, duzen: DEFTER.fon, buyutme: Math.round(buyutme * 1000) / 1000, secilen: [...secilen], portre: !!portre && !portre.classList.contains('df-gizli') }),
  };
}
