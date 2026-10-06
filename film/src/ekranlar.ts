/** Film oynatıcı: kapak (başlık + Oynat), oynatma (duraklat / devam, ses), sonda öğüt kartı */
import { konus } from '../../src/audio/ses';
import { uygulamaPlatformu } from '../../src/kabuk/ortam';
import { arkaPlanDinle, yonIste } from '../../src/kabuk/yon';
import { h, svg, TEST_MODU } from '../../src/ui/dom';
import { IKON } from '../../src/ui/ikonlar';
import { sesDugmesi, yuvarlakDugme } from '../../src/ui/ortak';
import type { Ekran, Uygulama } from '../../src/uygulama';
import { diziSuresi, dudakDizisi } from '../../src/audio/dudak';
import { Film, KAYIT, konusSecenegi, sesGunlugeYaz, type FilmDosya } from './motor';
import { katalog } from './katalog';
import { dosyaTamponu, filmMuzik, KAPANIS_SURESI } from './muzik';
import { baglam } from '../../src/audio/motor';
import { acilisKur, acilisOnYukle, type Acilis } from './acilis';

/** Jenerikler (film-acilis / film-kapanis) film müziğiyle birlikte: test modunda kapalı, süreler film hızıyla kısalır */
const MUZIK = !TEST_MODU;
const HIZ = TEST_MODU ? 12 : 1;

const FILMLER = import.meta.glob<FilmDosya>('../../content/film/*.json', { eager: true, import: 'default' });
export const filmBul = (ad: string) => FILMLER[`../../content/film/${ad}.json`];

/** Yazısız "telefonu yan çevir" simgesi: telefon dikeyden yataya döner (CSS animasyonu) */
const CEVIR = '<svg viewBox="0 0 64 64" aria-hidden="true"><g class="fl-cevir-tel"><rect x="20" y="8" width="24" height="44" rx="6" fill="#fff" stroke="#5a3617" stroke-width="4"/><rect x="25" y="14" width="14" height="28" rx="2" fill="#ffd28a"/><circle cx="32" cy="46" r="2.5" fill="#5a3617"/></g><path class="fl-cevir-ok" d="M50 16a22 22 0 0 1 4 18" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round"/><path class="fl-cevir-ok" d="M50 34l4 1 1-5" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>';

const DURAKLAT = '<svg viewBox="0 0 48 48"><rect x="12" y="10" width="8" height="28" rx="3" fill="currentColor"/><rect x="28" y="10" width="8" height="28" rx="3" fill="currentColor"/></svg>';

export function filmEkrani(app: Uygulama, p?: { ad?: string; oynat?: boolean }): Ekran {
  const q = new URLSearchParams(location.search);
  const ad = p?.ad ?? q.get('film') ?? 'mino-karpuz';
  const dosya = filmBul(ad);
  if (!dosya) throw new Error(`Film yok: ${ad}`);
  const sessiz = q.has('sessiz');
  // MP4 kaydı: düğmeler gizli, altyazı büyük; ?kadraj=dolu: 16:9 yerine ekranın tamamı (dikey / kare çıktılar)
  if (KAYIT) document.body.dataset.kayit = '1';
  if (q.get('kadraj') === 'dolu') document.body.dataset.kadraj = 'dolu';
  let film: Film | null = null;

  const oynatDugme = h('button.dugme.fl-oynat', { type: 'button' }, svg(IKON.oyna), 'Oynat');
  // kapak: filmin kendi karesi (assets/film/kapak) arkada, üstünde başlık ve Oynat; film listesi Çizgi Filmler ekranında
  const resim = katalog().find((f) => f.ad === ad)?.kapak;
  const kapak = h('div.fl-kapak', { style: resim ? `--kapak:url("${resim}")` : undefined }, h('h1.fl-baslik', {}, dosya.baslik), oynatDugme);
  const duraklatDegistir = () => {
    if (!film) return;
    film.duraklatDegistir();
    duraklatDugme.querySelector('.ikon')!.innerHTML = film.duraklatildi ? IKON.oyna : DURAKLAT;
    duraklatDugme.setAttribute('aria-label', film.duraklatildi ? 'Devam' : 'Duraklat');
  };
  const duraklatDugme = yuvarlakDugme(DURAKLAT, 'Duraklat', duraklatDegistir, 'kucuk');
  duraklatDugme.hidden = true;
  // uygulamada: film açıkken ekran yatay kilitlenir (çıkınca serbest); uygulama arka plana geçince film duraklar
  yonIste('yatay');
  const arkaPlanBirak = arkaPlanDinle((arkada) => {
    if (arkada && film && !film.duraklatildi && !duraklatDugme.hidden) duraklatDegistir();
  });
  /** Çizgi Filmler ekranına döner (adres filmsiz olur; bu film listede ortada görünür) */
  const listeyeDon = () => {
    history.replaceState(null, '', `?${new URLSearchParams([...q].filter(([k]) => k !== 'film' && k !== 'oto'))}`);
    app.git('katalog', { sec: ad });
  };
  const ust = h('div.ust-cubuk.fl-ust', {}, yuvarlakDugme(IKON.geri, 'Çizgi Filmler', listeyeDon, 'kucuk'), h('div.ust-grup', {}, duraklatDugme, sesDugmesi()));
  const sahneKap = h('div.fl-sahne-kap');
  // "telefonu çevir" simgesi yalnız web sitesinde: uygulamada telefon hep yatay, tablette film yatay kilitler
  const cevir = uygulamaPlatformu() ? null : h('div.fl-cevir', { 'aria-hidden': 'true', html: CEVIR });
  const el = h('div.fl-ekran', {}, sahneKap, cevir, kapak, ust);

  // zamanlayıcılar (ekrandan çıkınca temizlenir)
  // kapandıktan sonra yeni zamanlayıcı kurulmaz (ör. öğüt konuşması ekrandan çıkınca çözülür: jenerik sonraki ekranda çalmasın)
  let kapandi = false;
  const zamanlar: number[] = [];
  const sonra = (sn: number, is: () => void) => {
    if (!kapandi) zamanlar.push(window.setTimeout(is, sn * 1000));
  };

  /** Kapanış jeneriği (film-kapanis, 5 sn): öğüt söylendikten sonra; bitince ekran "tamam" olur (MP4 kaydı bununla biter) */
  const kapanisJenerigi = (bekle: number) => {
    sonra(bekle, () => {
      if (MUZIK) filmMuzik.dosyaCal({ ad: 'film-kapanis', ses: 0.85, gec: 0.05 });
      sonra(KAPANIS_SURESI / HIZ, () => (el.dataset.tamam = '1'));
    });
  };

  const ogutKarti = (metin: string) => {
    const tekrar = h('button.dugme', { type: 'button', style: '--r:var(--yesil)' }, svg(IKON.tekrar), 'Tekrar izle');
    tekrar.addEventListener('click', () => app.git('film', { ad, oynat: true }));
    const liste = h('button.dugme', { type: 'button', style: '--r:var(--mavi)' }, svg(IKON.izgara), 'Çizgi Filmler');
    liste.addEventListener('click', listeyeDon);
    const kart = h('div.fl-ogut', {}, h('p', {}, metin), h('div.fl-ogut-dugmeler', {}, tekrar, liste));
    el.append(kart);
    // öğüdü karakter filmin sonunda kendisi söylediyse (Mino kameraya) kart yeniden okumaz; jenerik hemen (kısa bekleyişle)
    if (film?.el.dataset.sonSoz === metin) return kapanisJenerigi(0.8 / HIZ);
    sesGunlugeYaz('konus', metin);
    if (!sessiz && !TEST_MODU) {
      // öğüt bitince jenerik (konuşma sesi iptal edilirse de çözülür)
      void konus(metin).then(() => kapanisJenerigi(0.4), () => kapanisJenerigi(0.4));
      return;
    }
    // sessiz oynatma / MP4 kaydı: söz süresi tahmini (kayıtta ağız dizisinin süresi)
    const dizi = KAYIT ? dudakDizisi(metin, konusSecenegi('').karakter) : null;
    const sn = dizi ? diziSuresi(dizi) : 0.8;
    kapanisJenerigi(sn + 0.5);
  };

  /** Filmi kurar (görseller yüklenmeye başlar; açılış kartı sürerken hazır olsun) */
  const hazirla = () => {
    film = new Film(dosya, {
      ses: !sessiz && !TEST_MODU,
      bitti: () => {
        const son = dosya.sahneler.find((s) => 'ogut' in s) as { ogut: string } | undefined;
        duraklatDugme.hidden = true;
        if (son) ogutKarti(son.ogut);
      },
    });
    sahneKap.replaceChildren(film.el);
    return film;
  };
  const baslatFilm = () => {
    duraklatDugme.hidden = false;
    void (film ?? hazirla()).oynat();
  };

  /**
   * Açılış: ortak Çizgi Filmler açılışı (perde açılır, Mino ve Kino zıplar, MINKINO logosu düşer, kurdelede film adı; dokununca geçilir;
   * uzunu günde bir kez, sonra kısası), bitince film başlar. ?uzun=1 ve MP4 kaydı: her zaman uzun açılış.
   */
  let acilis: Acilis | null = null;
  // açılışın büyük resimleri kapak ekranındayken inmeye başlar (Oynat'a basılınca sahne boş kalmasın)
  acilisOnYukle();
  // jenerikler de önceden çözülür (geç inen jenerik atlandıktan sonra çalmasın, açılış kartıyla aynı anda başlasın)
  const sb = MUZIK ? baglam() : null;
  if (sb) for (const j of ['film-acilis', 'film-kapanis']) void dosyaTamponu(sb, j);
  const basla = () => {
    kapak.classList.add('gizli');
    // ?kartsiz=1: açılış ve jenerik atlanır (geliştirme / ekran görüntüsü; ürün oynatmasında yok)
    if (q.has('kartsiz')) return baslatFilm();
    hazirla();
    acilis = acilisKur(dosya.baslik, { hiz: HIZ, muzik: MUZIK, zorlaUzun: KAYIT || q.has('uzun'), bitti: baslatFilm });
    el.append(acilis.el);
  };
  oynatDugme.addEventListener('click', basla);
  // Çizgi Filmler ekranında karta dokunuldu: film hemen açılış kartıyla başlar
  if (p?.oynat) basla();
  else if (q.has('oto')) setTimeout(basla, 50);

  return {
    el,
    kapat() {
      kapandi = true;
      yonIste('serbest');
      arkaPlanBirak();
      zamanlar.forEach((z) => clearTimeout(z));
      acilis?.kapat();
      film?.kapat();
      filmMuzik.dur(0.5);
    },
  };
}
