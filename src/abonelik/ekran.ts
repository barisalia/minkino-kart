/**
 * Abonelik ekranı (Minkino Premium): ebeveyn kapısından SONRA açılır. Mino ve Kino kartın üstünde oturur.
 * Aylık ve yıllık plan (fiyatlar mağazadan, yerel para birimiyle), deneme yazısı (paketten), "Satın alımları geri
 * yükle", mağazanın zorunlu otomatik yenileme metni, gizlilik ve kullanım koşulları bağlantıları.
 * Metinler: ekip/uygulama/MAGAZA-METINLERI.md §7.
 *
 * Sağlayıcı yoksa (anahtar yok) fiyat yerine yer tutucu ve "Yakında" görünür; ekran çökmez.
 */
import '../styles/mino.css';
import '../karakter/karakter.css';
import './abonelik.css';
import { efekt } from '../audio/ses';
import { premiumAyarla, premiumMu } from '../engine/erisim';
import { Karakter } from '../karakter/karakter';
import { Mino } from '../mino/mino';
import { GIZLILIK_ADRESI, ILETISIM_EPOSTA, SARTLAR_ADRESI } from '../kabuk/ayar';
import { uygulamaPlatformu } from '../kabuk/ortam';
import { ebeveynKapisiAc } from '../ui/ebeveyn-kapisi';
import { h, sure, svg } from '../ui/dom';
import { IKON } from '../ui/ikonlar';
import { minkinoLogo } from '../ui/logo';
import { yuvarlakDugme } from '../ui/ortak';
import { kilitAniAc } from './kilit-ani';
import { saglayici, type Plan, type PlanId } from './satin';

/** Mağazaların zorunlu otomatik yenileme metinleri (MAGAZA-METINLERI.md §7) */
export const YENILEME_METNI = {
  ios: 'Ödeme, satın alma onaylandığında Apple Kimliği hesabınızdan alınır. Abonelik, mevcut dönem bitmeden en az 24 saat önce iptal edilmezse otomatik olarak yenilenir. Yenileme ücreti, dönem bitmeden önceki 24 saat içinde hesabınızdan alınır. Aboneliğinizi satın aldıktan sonra App Store hesap ayarlarınızdan yönetebilir ve iptal edebilirsiniz. Ücretsiz deneme süresinin kullanılmayan kısmı, abonelik satın alındığında geçersiz olur.',
  android:
    'Abonelik, iptal edilene kadar her dönem sonunda otomatik olarak yenilenir ve ücret Google Play hesabınızdan alınır. Ücretsiz deneme bitmeden iptal ederseniz ücret alınmaz. Aboneliğinizi istediğiniz zaman Google Play > Ödemeler ve abonelikler bölümünden yönetebilir ya da iptal edebilirsiniz.',
} as const;

/** Aynı metinlerin İngilizcesi (MAGAZA-METINLERI.md §7): inceleme ekipleri için Türkçenin altında küçük yazıyla */
export const YENILEME_METNI_EN = {
  ios: 'Payment will be charged to your Apple ID account at confirmation of purchase. The subscription automatically renews unless it is cancelled at least 24 hours before the end of the current period. Your account will be charged for renewal within 24 hours prior to the end of the current period. You can manage and cancel your subscriptions by going to your App Store account settings after purchase. Any unused portion of a free trial period will be forfeited when you purchase a subscription.',
  android:
    "Your subscription renews automatically at the end of each period until cancelled, and you will be charged through your Google Play account. If you cancel before the free trial ends, you won't be charged. You can manage or cancel your subscription anytime in Google Play > Payments & subscriptions.",
} as const;

/** Premium'la açılanlar (Kartlar zaten ücretsiz; bkz. src/engine/erisim.ts): ikon + renk + metin */
const ACILANLAR: { ikon: keyof typeof IKON; renk: string; yazi: string }[] = [
  { ikon: 'muzik', renk: 'var(--pembe)', yazi: 'Tüm Sesli Maceralar' },
  { ikon: 'oyna', renk: 'var(--mavi)', yazi: 'Bütün çizgi filmler' },
  { ikon: 'yildiz', renk: 'var(--turuncu)', yazi: 'Pazar, Pasta Otobüsü, Çiz Canlansın, Okula Hazırım' },
  { ikon: 'sihir', renk: 'var(--mor)', yazi: 'Yeni bölümler geldikçe' },
  { ikon: 'onay', renk: 'var(--yesil)', yazi: 'Reklam yok, güvenli' },
];

const DONEM: Record<PlanId, string> = { aylik: 'ay', yillik: 'yıl' };
const PLAN_AD: Record<PlanId, string> = { aylik: 'Aylık', yillik: 'Yıllık' };
/**
 * Mağaza yokken (anahtar yok, web) ya da mağazaya ulaşılamazken gösterilen fiyat (Barış'ın fiyatları, Türkiye).
 * Satın alma her zaman mağazanın kendi fiyatıyla olur; bu yalnız bilgi.
 */
export const YEDEK_FIYAT: Record<PlanId, string> = { aylik: '99 TL', yillik: '499 TL' };
const YEDEK_DENEME_GUN = 7;

/**
 * Kahraman görseli yuvası: assets/uygulama/abonelik-kahraman.webp (16:9; Mino ve Kino solda el sallar, yıldız ve
 * konfeti; orta ve sağ boş). Dosya gelince kendiliğinden kullanılır; yoksa canlı Mino ve Kino (bugünkü hâl).
 */
const KAHRAMAN = Object.values(
  import.meta.glob<string>('../../assets/uygulama/abonelik-kahraman.webp', { eager: true, query: '?url', import: 'default' }),
)[0] as string | undefined;

const AZ_HAREKET = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Kilitli içeriğe dokunulunca: önce çocuğa sakin kilit anı ("Bunu anne-babanla açabilirsin", src/abonelik/kilit-ani.ts);
 * yalnız "Büyükler için" düğmesiyle ebeveyn kapısı, kapı geçilince abonelik ekranı. Satın alma ekranı çocuğa hiçbir
 * zaman doğrudan gösterilmez (Google Play Aileler / Teacher Approved). Abonelik olduysa true.
 */
export async function kilitliIcerik(kok: HTMLElement): Promise<boolean> {
  if ((await kilitAniAc(kok)) !== 'buyuk') return false;
  if (!(await ebeveynKapisiAc(kok))) return false;
  return abonelikEkrani(kok);
}

/** Abonelik ekranını açar (ebeveyn kapısı geçilmiş olmalı); kapanınca abonelik var mı döner */
export function abonelikEkrani(kok: HTMLElement): Promise<boolean> {
  return new Promise((coz) => {
    const platform = uygulamaPlatformu() ?? 'ios';
    const zamanlar: number[] = [];
    const sonra = (ms: number, fn: () => void) => void zamanlar.push(window.setTimeout(fn, sure(ms)));

    // ---------------------------------------------------------------- Mino ve Kino (kartın üstünde)
    const mino = new Mino();
    const kino = new Karakter('kino', h('div'));
    const minoKap = h('div.ab-mino', { 'aria-hidden': 'true' }, mino.el);
    const kinoKap = h('div.ab-kino', { 'aria-hidden': 'true' }, h('div.ab-kino-ic', {}, kino.el));
    const sevin = () => {
      if (AZ_HAREKET) return;
      mino.tepki('zipla');
      void kino.oynat('sevin', 1200);
      if (kino.ifadeVar('heyecan')) kino.ifade('heyecan', 1200);
    };
    minoKap.addEventListener('pointerdown', () => !AZ_HAREKET && mino.tepki('gidik'));
    kinoKap.addEventListener('pointerdown', () => !AZ_HAREKET && void kino.oynat('huy', 1200));
    sonra(500, () => {
      if (AZ_HAREKET) return;
      mino.tepki('selam');
      void kino.oynat('bak', 900);
    });

    // ---------------------------------------------------------------- planlar
    let secili: PlanId = 'yillik';
    let planlar: Plan[] = [];
    const planDugme = (id: PlanId) => {
      const b = h(
        `button.ab-plan.ab-plan-${id}`,
        { type: 'button', role: 'radio', 'aria-checked': String(id === secili), 'data-plan': id },
        ...(id === 'yillik' ? [h('span.ab-avantaj', {}, 'En avantajlı')] : []),
        h('span.ab-plan-ad', {}, PLAN_AD[id]),
        h('span.ab-fiyat', {}, h('b', {}, '…'), h('small', {}, ` / ${DONEM[id]}`)),
        h('span.ab-aybasi'),
      );
      b.addEventListener('click', () => {
        if (b.classList.contains('bos')) return;
        efekt.secim();
        secili = id;
        planGoster();
      });
      return b;
    };
    const planEl: Record<PlanId, HTMLButtonElement> = { aylik: planDugme('aylik'), yillik: planDugme('yillik') };
    const planKutu = h('div.ab-planlar', { role: 'radiogroup', 'aria-label': 'Planlar' }, planEl.aylik, planEl.yillik);
    const deneme = h('p.ab-deneme');
    const basla = h('button.dugme.ab-basla', { type: 'button', disabled: true }, 'Ücretsiz denemeyi başlat');
    const sonraYazi = h('p.ab-sonra');
    const durumYazi = h('p.ab-durum', { role: 'status', 'aria-live': 'polite' });
    const geriYukle = h('button.ab-geri-yukle', { type: 'button' }, 'Satın alımları geri yükle');
    const tekrarDene = h('button.ince-dugme.ab-tekrar', { type: 'button', hidden: true }, 'Tekrar dene');

    const planGoster = () => {
      const p = planlar.find((x) => x.id === secili) ?? null;
      for (const id of ['aylik', 'yillik'] as const) {
        const b = planEl[id];
        const v = planlar.find((x) => x.id === id);
        b.classList.toggle('secili', id === secili);
        b.setAttribute('aria-checked', String(id === secili));
        b.classList.toggle('bos', !v);
        // mağaza fiyatı; yoksa (anahtarsız / mağazaya ulaşılamıyor) yedek fiyat bilgi olarak
        const fiyat = v?.fiyat ?? YEDEK_FIYAT[id];
        b.querySelector('.ab-fiyat b')!.textContent = !v && el.dataset.durum === 'yukleniyor' ? '…' : fiyat;
        b.querySelector('.ab-aybasi')!.textContent = v?.ayBasi ? `ayda ${v.ayBasi}` : '';
        b.setAttribute('aria-label', `${PLAN_AD[id]}: ${fiyat} / ${DONEM[id]}`);
      }
      if (!p) {
        deneme.textContent = `${YEDEK_DENEME_GUN} gün ücretsiz deneme`;
        deneme.hidden = false;
        return;
      }
      const gun = p.denemeGun;
      deneme.textContent = gun ? `${gun} gün ücretsiz dene` : '';
      deneme.hidden = !gun;
      basla.textContent = gun ? 'Ücretsiz denemeyi başlat' : 'Abone ol';
      sonraYazi.textContent = `${gun ? 'Deneme bitince ' : ''}${p.fiyat} / ${DONEM[p.id]}. İstediğin zaman iptal edebilirsin.`;
    };

    /** Mağaza yok (anahtar yok, web): yer tutucu fiyatlar ve "Yakında" */
    const yakinda = () => {
      el.dataset.durum = 'yakinda';
      planGoster();
      basla.textContent = 'Yakında';
      basla.setAttribute('disabled', '');
      geriYukle.setAttribute('disabled', '');
      sonraYazi.textContent = '';
      durumYazi.textContent = 'Abonelik çok yakında burada olacak. Şimdilik bütün oyunlar açık!';
    };

    const yukle = async () => {
      const s = await saglayici();
      if (!s) return yakinda();
      el.dataset.durum = 'yukleniyor';
      durumYazi.textContent = 'Fiyatlar yükleniyor…';
      tekrarDene.hidden = true;
      try {
        planlar = await s.planlar();
        if (!planlar.some((p) => p.id === secili)) secili = planlar[0].id;
        el.dataset.durum = 'hazir';
        durumYazi.textContent = '';
        basla.removeAttribute('disabled');
        geriYukle.removeAttribute('disabled');
        planGoster();
      } catch {
        el.dataset.durum = 'hata';
        planGoster();
        durumYazi.textContent = 'Mağazaya şu an ulaşılamıyor. İnternet bağlantınızı kontrol edip tekrar deneyin.';
        tekrarDene.hidden = false;
        geriYukle.removeAttribute('disabled');
      }
    };
    tekrarDene.addEventListener('click', () => void yukle());

    let mesgul = false;
    const isle = async (is: () => Promise<void>) => {
      if (mesgul) return;
      mesgul = true;
      el.classList.add('mesgul');
      try {
        await is();
      } finally {
        mesgul = false;
        el.classList.remove('mesgul');
      }
    };
    basla.addEventListener('click', () =>
      void isle(async () => {
        const s = await saglayici();
        if (!s || !planlar.length) return;
        efekt.secim();
        durumYazi.textContent = 'Mağaza açılıyor…';
        const sonuc = await s.satinAl(secili);
        if (sonuc === 'tamam') {
          premiumAyarla(true);
          basari();
        } else durumYazi.textContent = sonuc === 'iptal' ? '' : 'Satın alma tamamlanamadı. Lütfen tekrar deneyin.';
      }),
    );
    geriYukle.addEventListener('click', () =>
      void isle(async () => {
        const s = await saglayici();
        if (!s) return;
        durumYazi.textContent = 'Satın alımlar kontrol ediliyor…';
        try {
          if (await s.geriYukle()) {
            premiumAyarla(true);
            basari();
          } else durumYazi.textContent = 'Bu hesapta etkin bir abonelik bulunamadı.';
        } catch {
          durumYazi.textContent = 'Mağazaya şu an ulaşılamıyor. Lütfen tekrar deneyin.';
        }
      }),
    );

    // ---------------------------------------------------------------- başarı
    const basari = () => {
      el.dataset.durum = 'basari';
      efekt.dogru();
      sevin();
      const tamam = h('button.dugme.ab-tamam', { type: 'button' }, svg(IKON.oyna), 'Oynamaya başla');
      tamam.addEventListener('click', () => kapat());
      kartIc.replaceChildren(h('div.ab-basari', { role: 'status' }, svg(IKON.tac, 'ab-tac'), h('h2', {}, 'Teşekkürler!'), h('p', {}, 'Bütün oyunlar, maceralar ve filmler açıldı.'), tamam));
    };

    // ---------------------------------------------------------------- ekran
    const baglanti = (adres: string, yazi: string, en: string) =>
      h('a.ab-baglanti', { href: adres, target: '_blank', rel: 'noopener noreferrer' }, yazi, h('small', { lang: 'en' }, en));
    const kartIc = h(
      'div.ab-kart-ic',
      {},
      // başlık: asıl MINKINO logosu (krem kartta temiz sürüm), altında taçlı Premium
      h('h1.ab-baslik', {}, minkinoLogo('sade', 'ab-logo'), h('span.ab-premium', {}, svg(IKON.tac, 'ab-tac'), ' Premium')),
      h('p.ab-alt', {}, 'Bütün oyunlar, maceralar ve filmler.'),
      h('ul.ab-liste', {}, ...ACILANLAR.map((m) => h('li', { style: `--r:${m.renk}` }, svg(IKON[m.ikon], `ab-tik ab-tik-${m.ikon}`), m.yazi))),
      planKutu,
      deneme,
      basla,
      sonraYazi,
      durumYazi,
      tekrarDene,
      geriYukle,
      h('p.ab-yasal', {}, YENILEME_METNI[platform]),
      h('p.ab-yasal.ab-yasal-en', { lang: 'en' }, YENILEME_METNI_EN[platform]),
      h(
        'p.ab-baglantilar',
        {},
        baglanti(GIZLILIK_ADRESI, 'Gizlilik politikası', 'Privacy Policy'),
        h('span', { 'aria-hidden': 'true' }, ' · '),
        baglanti(SARTLAR_ADRESI, 'Kullanım koşulları', 'Terms of Use'),
      ),
      h('p.ab-iletisim', {}, 'Bize yazın: ', h('a', { href: `mailto:${ILETISIM_EPOSTA}` }, ILETISIM_EPOSTA)),
    );
    const kapatDugme = yuvarlakDugme(IKON.kapat, 'Kapat', () => kapat(), 'kucuk ab-kapat');
    const el = h(
      'div.ab-perde',
      { role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Minkino Premium', 'data-durum': 'yukleniyor' },
      h('div.ab-gok', { 'aria-hidden': 'true' }, h('i.ab-bulut.ab-bulut-1'), h('i.ab-bulut.ab-bulut-2')),
      h(
        'div.ab-ic',
        {},
        h('div.ab-ust', {}, kapatDugme, h('span.ab-not', {}, 'Bu ekran büyükler içindir.')),
        KAHRAMAN
          ? h('div.ab-kahraman', { 'aria-hidden': 'true' }, h('img', { src: KAHRAMAN, alt: '', draggable: 'false', decoding: 'async' }))
          : h('div.ab-ikili', {}, minoKap, kinoKap),
        h('div.ab-kart', {}, kartIc),
      ),
    );

    const klavye = (e: KeyboardEvent) => {
      if (e.key === 'Escape') kapat();
    };
    document.addEventListener('keydown', klavye);
    let kapandi = false;
    const kapat = () => {
      if (kapandi) return;
      kapandi = true;
      document.removeEventListener('keydown', klavye);
      zamanlar.forEach(clearTimeout);
      el.classList.add('cikiyor');
      window.setTimeout(() => {
        el.remove();
        mino.kapat();
        kino.kapat();
      }, sure(250));
      coz(premiumMu());
    };

    kok.append(el);
    planGoster();
    void yukle();
  });
}
