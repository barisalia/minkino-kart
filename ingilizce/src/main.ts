/**
 * Ceren Öğretmen ile İngilizceye Merhaba · giriş.
 * Ekranlar: ana (karşılama + bölümler) · adalar (dersler) · ders (ders / oyun / günün tekrarı) · oyunlar · album · buyukler.
 * Plan: ekip/ingilizce/PLAN.html · Çizim işleri: ekip/ingilizce/CIZIM-ISLERI.md
 */
import { menuYasiOku } from '../../src/engine/menu-yas';
import { geriDinle } from '../../src/kabuk/yon';
import { adalarEkrani } from './ekranlar/adalar';
import { albumEkrani } from './ekranlar/album';
import { anaEkran } from './ekranlar/ana';
import { buyuklerEkrani } from './ekranlar/buyukler';
import { agacEviEkrani } from './ekranlar/agac-evi';
import { dersEkrani, type DersParametresi } from './ekranlar/ders';
import { oyunlarEkrani } from './ekranlar/oyunlar';
import { masallarEkrani } from './ekranlar/masallar';
import { abcEkrani } from './ekranlar/abc';
import { ipucuKur } from './kit';
import type { DersNo } from './icerik';
import type { Yas } from './plan';
import { sesKilidiAc, sus } from './ses';
import './stil.css';

const kok = document.querySelector<HTMLElement>('#ingilizce')!;
kok.classList.add('ing');

/** Yaş grubu ana menüdeki yaş seçiminden gelir; `?yas=2-3|4|5+` ile denenebilir */
function yasGrubu(): Yas {
  const secim = new URLSearchParams(location.search).get('yas');
  if (secim === '2-3' || secim === '4' || secim === '5+') return secim;
  const yas = menuYasiOku();
  if (yas === 2 || yas === 3) return '2-3';
  return yas === 4 ? '4' : '5+';
}

type Ekran = 'ana' | 'adalar' | 'ders' | 'oyunlar' | 'album' | 'buyukler' | 'masallar' | 'agac' | 'abc';
let ekran: Ekran = 'ana';
let birak: (() => void) | undefined;
let sonDers: DersParametresi | undefined;

function ac(ad: Ekran, kur: () => () => void) {
  birak?.();
  birak = undefined;
  sus();
  ipucuKur(undefined);
  ekran = ad;
  kok.dataset.ekran = ad;
  kok.replaceChildren();
  // ekran değişirken yumuşak açılış
  kok.classList.remove('ing-yeni');
  void kok.offsetWidth;
  kok.classList.add('ing-yeni');
  birak = kur();
}

const git = {
  yas: yasGrubu(),
  ana: () => ac('ana', () => anaEkran(kok, git)),
  adalar: (uniteId?: string) => ac('adalar', () => adalarEkrani(kok, git, uniteId)),
  oyunlar: () => ac('oyunlar', () => oyunlarEkrani(kok, git)),
  ders: (p: DersParametresi) => { sonDers = p; ac('ders', () => dersEkrani(kok, p, git)); },
  album: () => ac('album', () => albumEkrani(kok, git)),
  buyukler: () => ac('buyukler', () => buyuklerEkrani(kok, git)),
  masallar: () => ac('masallar', () => masallarEkrani(kok, git)),
  abc: () => ac('abc', () => abcEkrani(kok, git)),
  agacEvi: () => ac('agac', () => agacEviEkrani(kok, git)),
};

// Android geri tuşu: ana ekranda uygulama kabuğu karar verir (menüye döner); içeride bir üst ekrana çıkılır
geriDinle(() => {
  if (ekran === 'ana') return false;
  const panel = kok.querySelector<HTMLElement>('.ing-panel-yeri.ing-acik');
  if (panel) { panel.replaceChildren(); panel.classList.remove('ing-acik'); return true; }
  if (ekran === 'ders') { if (sonDers?.tur === 'ders') git.adalar(sonDers.uniteId); else if (sonDers?.tur === 'masal') git.masallar(); else if (sonDers?.tur === 'sarki') git.ana(); else git.oyunlar(); }
  else git.ana();
  return true;
});
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape' || e.repeat || ekran === 'ana') return;
  window.dispatchEvent(new Event('minkino:geri', { cancelable: true }));
});

// ses, çocuğun ilk dokunuşuyla açılır
document.addEventListener('pointerdown', sesKilidiAc, { capture: true, once: true });
document.addEventListener('keydown', sesKilidiAc, { capture: true, once: true });

// ?ekran=adalar|oyunlar|album ve ?ders=ciftlik-1 (1–9: üç seviyenin dokuz dersi) ile doğrudan açılış (deneme ve ekran görüntüsü için)
const sorgu = new URLSearchParams(location.search);
const dersSorgusu = /^([a-z][a-z0-9]*)-([1-9])$/.exec(sorgu.get('ders') ?? '');
if (dersSorgusu) git.ders({ tur: 'ders', uniteId: dersSorgusu[1], no: (Number(dersSorgusu[2]) - 1) as DersNo });
else if (sorgu.get('ekran') === 'adalar') git.adalar();
else if (sorgu.get('ekran') === 'oyunlar') git.oyunlar();
else if (sorgu.get('ekran') === 'album') git.album();
else if (sorgu.get('ekran') === 'masallar') git.masallar();
else if (sorgu.get('ekran') === 'abc') git.abc();
else if (sorgu.get('ekran') === 'agac') git.agacEvi();
else if (/^[a-z-]+$/.test(sorgu.get('sarki') ?? '')) git.ders({ tur: 'sarki', id: sorgu.get('sarki')! });
else if (/^[a-z][a-z0-9]*$/.test(sorgu.get('masal') ?? '')) git.ders({ tur: 'masal', uniteId: sorgu.get('masal')! });
else if (/^[a-z]+$/.test(sorgu.get('kitap') ?? '')) git.ders({ tur: 'kitap', ad: sorgu.get('kitap')! });
else git.ana();
