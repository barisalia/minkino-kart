// Minik Doktor girişi. Varsayılan (menüden açılış): bekleme odası (?oyun=klinik). Reddedilen ilk örnek (main.ts) silinmedi,
// yalnız ?oyun=ornek ile açılır.
// Baştan kurulan oyun "Zıpzıp'ın Dizi" (çekim listesi: ekip/senaryo/MINIK-DOKTOR-ZIPZIP-CEKIM-LISTESI.md):
//   ?oyun=zipzip-diz   sekiz sahne baştan sona, tek akışta (bütün çizimler gelince açılır)
//   ?sahne=<ad>        tek sahne: bahce (1), kapi (2), bekleme (3), once-kuzu (4–5), diz (6), odul (7), kapanis (8)
// Çizimler Astra'dan gelir (Paket Doktor-K1, K2, K3); çizim eksikken ekranda hiçbir görüntü olmaz.
import { kilitli } from '../../src/engine/erisim';
import { anaMenuyeDon } from '../../src/uygulama';

const kok = document.getElementById('doktor')!;
const p = new URLSearchParams(location.search);
const sahne = p.get('sahne');
// Menüden açılış (parametresiz): bekleme odası (?oyun=klinik). Barış 23 Kasım 2026: Minik Doktor menüde, tamamen premium.
// Odada yalnız çizimi tamam olan vaka oynanır (klinik/sahne.ts → eksikCizimler). Reddedilen ilk örnek (main.ts) artık
// yalnız ?oyun=ornek ile açılır.
const oyun = p.get('oyun') ?? (sahne ? null : 'klinik');
/** Mağaza uygulaması derlemesi: menüden açılmayan eski denemeler (ilk örnek, zincir sahneleri, eski kısa diş vakası) pakete
 *  girmez (Barış, 23 Kasım 2026). Koşul derleme anında sabittir; Rollup bu dalları ve çizimlerini paketten atar. */
const UYGULAMA = import.meta.env.MODE === 'uygulama';

/**
 * Tamamen premium: abonesi olmayan çocuk Doktor'un hiçbir vakasını açamaz (kilitler yalnız mağaza uygulamasında etkin;
 * web'de her şey açık: src/engine/erisim.ts). Menü kartı zaten kilitli; sayfaya doğrudan gelinirse burada öbür kilitli
 * oyunlardaki aynı kilit anı açılır ("Büyükler için" → ebeveyn kapısı → abonelik). Abonelik alınırsa sayfa yeniden
 * yüklenir ve oyun açılır; alınmazsa ana menüye dönülür.
 */
function kilitliGiris(): void {
  kok.replaceChildren();
  kok.dataset.durum = 'kilitli';
  const katman = document.createElement('div');
  katman.className = 'mk-kok mk-kilit-katmani';
  document.body.append(katman);
  void Promise.all([import('../../src/abonelik/kilit'), import('../../src/abonelik/ekran')])
    .then(([, e]) => e.kilitliIcerik(katman))
    .then(alindi => { katman.remove(); if (alindi && !kilitli('doktor')) location.reload(); else anaMenuyeDon(); }, () => anaMenuyeDon());
}
function ac(): void {
// Barış'ın seçtiği yeni yön (22 Kasım): ?oyun=vaka · "Zıpzıp'ın Dikenli Patisi" (vaka/; Paket Doktor-Y1)
// ?oyun=klinik · bekleme odası ve altı vakanın tek oyun akışı (klinik/; Paket Doktor-K1)
  if (oyun === 'vaka') void import('./vaka/sahne').then(v => v.baslat(kok, v.yasOku()));
  else if (oyun === 'klinik') void Promise.all([import('./klinik/sahne'), import('./vaka/sahne')]).then(([k, v]) => k.baslat(kok, v.yasOku()));
  else if (!UYGULAMA && oyun === 'dis') void Promise.all([import('./dis/sahne'), import('./vaka/sahne')]).then(([d, v]) => d.baslat(kok, v.yasOku()));
  else if (oyun === 'disler') void Promise.all([import('./vaka-dis/sahne'), import('./vaka/sahne')]).then(([d, v]) => d.baslat(kok, v.yasOku()));      // Y2'nin dokuz adımlı yeni hâli
  else if (oyun === 'ates') void Promise.all([import('./vaka-ates/sahne'), import('./vaka/sahne')]).then(([a, v]) => a.baslat(kok, v.yasOku()));
  else if (oyun === 'boya') void Promise.all([import('./vaka-boya/sahne'), import('./vaka/sahne')]).then(([b, v]) => b.baslat(kok, v.yasOku()));
  else if (oyun === 'hapsu') void Promise.all([import('./vaka-hapsu/sahne'), import('./vaka/sahne')]).then(([h, v]) => h.baslat(kok, v.yasOku()));
  else if (oyun === 'kanat') void Promise.all([import('./vaka-kanat/sahne'), import('./vaka/sahne')]).then(([k, v]) => k.baslat(kok, v.yasOku()));
  else if (oyun === 'karin') void Promise.all([import('./vaka-karin/sahne'), import('./vaka/sahne')]).then(([g, v]) => g.baslat(kok, v.yasOku()));
  else if (oyun === 'bocek') void Promise.all([import('./vaka-bocek/sahne'), import('./vaka/sahne')]).then(([b, v]) => b.baslat(kok, v.yasOku()));
  else if (oyun === 'kuzu') void Promise.all([import('./vaka-kuzu/sahne'), import('./vaka/sahne')]).then(([k, v]) => k.baslat(kok, v.yasOku()));
  else if (oyun === 'cingirak') void Promise.all([import('./vaka-cingirak/sahne'), import('./vaka/sahne')]).then(([c, v]) => c.baslat(kok, v.yasOku()));
  else if (!UYGULAMA && oyun === 'zipzip-diz') void import('./zincir').then(m => m.oyunuBaslat(kok));
  else if (!UYGULAMA && sahne) {
    void Promise.all([import('./zincir'), import('./zincir-veri')]).then(([z, v]) => {
      if ((v.SAHNE_SIRASI as readonly string[]).includes(sahne)) void z.sahneBaslat(kok, sahne as (typeof v.SAHNE_SIRASI)[number], z.yasOku());
      else void import('./main');
    });
  } else if (!UYGULAMA) void import('./main');
  else void Promise.all([import('./klinik/sahne'), import('./vaka/sahne')]).then(([k, v]) => k.baslat(kok, v.yasOku()));     // uygulamada tanınmayan yol: bekleme odası
}
if (kilitli('doktor')) kilitliGiris(); else ac();
