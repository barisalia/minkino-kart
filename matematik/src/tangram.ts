type Bicim = 'kare' | 'daire' | 'ucgen' | 'cubuk';
type Parca = { ad: string; bicim: Bicim; resim: string; x: number; y: number; en: number; boy: number; aci: number; renk: number };
const parca = (ad: string, bicim: Bicim, resim: string, x: number, y: number, en: number, boy: number, aci = 0, renk = 0): Parca =>
  ({ ad, bicim, resim, x, y, en, boy, aci, renk });
// Koordinatlar 360 × 240 tasarım alanında parçaların merkezidir.
const gezgin = [
  parca('Kabin', 'kare', 'gezgin-kabin', 228, 101, 82, 82),
  parca('Güneş paneli', 'kare', 'gezgin-panel', 80, 77, 53, 53, 45),
  ...[67, 172, 277].map((x, i) => parca(['Arka teker','Orta teker','Ön teker'][i], 'daire', 'ay-tekeri', x, 189, 67, 67)),
  parca('Küçük üçgen', 'ucgen', 'ucgen-yesil', 147, 120, 63, 44, 0, 28),
  parca('Burun', 'ucgen', 'ucgen', 295, 111, 63, 62),
  parca('Şasi', 'cubuk', 'dikdortgen', 177, 152, 287, 25),
  parca('Anten direği', 'cubuk', 'dikdortgen', 80, 122, 13, 41),
];
type Sahne = {
  kok: HTMLElement;
  resim: (id: string) => string;
  ucgenleriAra: boolean;
  kaydet: () => void;
  anlat: (i: number) => void;
  ses: (dogru: boolean) => void;
  tekrar: (fn: () => void) => void;
  bitir: () => void;
  sesiAc: () => void;
};

const aramalar = [
  { bicim: 'kare', resim: 'tas', soz: 79, ipucu: 86 },
  { bicim: 'daire', resim: 'daire', soz: 80, ipucu: 87 },
  { bicim: 'ucgen', resim: 'ucgen', soz: 81, ipucu: 88 },
] as const;

export function gezginOyna(bulunan: number[], s: Sahne) {
  const turlar = aramalar.slice(0, s.ucgenleriAra ? 3 : 2);
  const arac = document.createElement('div');
  arac.className = 'tg-model tg-arac';
  const panel = document.createElement('div');
  panel.className = 'tg-panel';
  panel.setAttribute('role', 'status');
  s.kok.append(panel, arac);
  let zaman = 0;
  let soz: number;

  const dugmeler = gezgin.map((p, i) => {
    const el = document.createElement('button');
    el.type = 'button';
    el.className = 'tg-parca';
    el.dataset.indis = String(i);
    el.dataset.bicim = p.bicim;
    el.setAttribute('aria-label', p.ad);
    el.style.left = (p.x / 360 * 100) + '%';
    el.style.top = (p.y / 240 * 100) + '%';
    el.style.width = (p.en / 360 * 100) + '%';
    el.style.height = (p.boy / 240 * 100) + '%';
    el.style.setProperty('--aci', p.aci + 'deg');
    el.style.setProperty('--renk', p.renk + 'deg');
    el.innerHTML = '<span class="tg-yuz">' + s.resim('matematik/' + p.resim) + '</span>';
    el.onclick = () => {
      s.sesiAc();
      const tur = turlar.find(t => t.soz === soz);
      if (!tur || bulunan.includes(i)) return;
      if (p.bicim !== tur.bicim) {
        s.ses(false);
        s.anlat(tur.ipucu);
        return;
      }
      bulunan.push(i);
      s.ses(true);
      s.kaydet();
      guncelle();
    };
    arac.append(el);
    return el;
  });

  function guncelle() {
    const tur = turlar.find(t => gezgin.some((p, i) => p.bicim === t.bicim && !bulunan.includes(i)));
    dugmeler.forEach((el, i) => {
      el.disabled = !tur || bulunan.includes(i);
      el.classList.toggle('tg-bulundu', !!tur && bulunan.includes(i));
    });
    if (!tur) {
      panel.hidden = true;
      arac.classList.add('tg-yola-cik');
      soz = 85;
      s.anlat(soz);
      zaman = window.setTimeout(s.bitir, 4300);
      return;
    }
    const hedef = gezgin.filter(p => p.bicim === tur.bicim).length;
    const adet = bulunan.filter(i => gezgin[i]?.bicim === tur.bicim).length;
    panel.setAttribute('aria-label', tur.bicim + ', ' + adet + ' / ' + hedef);
    panel.innerHTML = '<div class="tg-aranan">' + s.resim('matematik/' + tur.resim) +
      '</div><div class="tg-sayac">' + Array.from({ length: hedef }, (_, i) =>
        '<i class="' + (i < adet ? 'tg-dolu' : '') + '"></i>').join('') + '</div>';
    if (soz !== tur.soz) {
      soz = tur.soz;
      s.anlat(soz);
    }
  }
  s.tekrar(() => s.anlat(soz));
  guncelle();
  return () => clearTimeout(zaman);
}
