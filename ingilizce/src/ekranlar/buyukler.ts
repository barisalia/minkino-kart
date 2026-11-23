/**
 * Büyükler için (veli köşesi): ebeveyn kapısının arkasında. Çocuğun öğrendiği kelimeler ve durumları,
 * evde tekrar önerileri, mikrofon ayarı. Çocuk için değil; yazılıdır.
 */
import { h } from '../../../src/ui/dom';
import { ebeveynKapisiAc } from '../../../src/ui/ebeveyn-kapisi';
import { TUM_DERSLER, UNITELER, cumle, soru, type Unite } from '../icerik';
import { EVDE_CUMLELER, evdeSesKimligi } from '../evde-cumleler';
import { ANAHTAR, bosKayit, dersBittiMi, kelimeDuzeyi, oku, seri, siradakiDers, toplamYildiz, yaz, type Kayit } from '../ilerleme';
import { dugme, simgeDugme } from '../kit';
import { mikrofonTercihi, mikrofonTercihiYaz } from '../mikrofon';
import { konus, sus } from '../ses';
import { acikKelimeler, dersHazir, sesAdresi, uniteHazir } from '../varlik';
import type { Gezinme } from './ders';

/** Evde tekrar önerisi: ünitenin kalıbıyla günlük hayatta kısa bir oyun */
function oneri(u: Unite): string {
  const ornek = cumle(u.kelimeler[0]);
  switch (u.id) {
    case 'ciftlik': return `Hayvan sesi çıkarın, çocuğunuz İngilizcesini söylesin. Resimli kitapta hayvan görünce birlikte "${ornek}" deyin.`;
    case 'renkler': return 'Evde bir renk seçin ("Find something red!") ve o renkte üç eşya bulun.';
    case 'sayilar': return 'Merdiven çıkarken ya da meyve sayarken birlikte "one, two, three" diye sayın.';
    case 'yiyecekler': return `Sofrada yiyeceklerin İngilizcesini söyleyin. Sevdiği bir şey için "${ornek}" deyin.`;
    case 'oyuncaklar': return 'Oyuncakları toplarken her birini kutuya koymadan önce adını söyleyin: "It\'s my ball."';
    case 'ailem': return 'Aile fotoğrafına birlikte bakın; her kişiyi gösterip "This is my mom." gibi tanıtsın.';
    case 'yuzum': return 'Ayna karşısında "Touch your nose!" oyunu oynayın; sırayla siz söyleyin, o dokunsun, sonra o söylesin.';
    case 'kiyafetler': return 'Sabah giyinirken her parçayı İngilizce isteyin: "Put on your socks."';
    case 'odam': return 'Odasında bir eşyayı söyleyin, koşup dokunsun: "Where is the lamp?"';
    case 'tasitlar': return 'Yolda gördüğünüz taşıtları birlikte sayın: "I see a bus!"';
    case 'hareketler': return '"Polly diyor ki" oynayın: "Jump!" deyince birlikte zıplayın, "Sleep!" deyince uyur gibi yapın.';
    case 'vahsi': return 'Hayvan gibi yürüyüp ses çıkarın; hangi hayvan olduğunu İngilizce tahmin etsin: "I see a lion!"';
    default: return `Gün içinde bu kelimelerden birini görünce birlikte söyleyin: "${ornek}"`;
  }
}

/**
 * "Evde 3 İngilizce Cümle"nin üstte duracağı ada: çocuğun kelime derslerini (Seviye 1) bitirdiği en son ada;
 * henüz bitirdiği ada yoksa şu an öğrendiği ada.
 */
export function evdeAdasi(k: Kayit, acik: readonly Unite[]): { u: Unite; bitti: boolean } | null {
  const bitti = acik.filter((u) => {
    const dersler = TUM_DERSLER.filter((d) => d.unite === u && d.seviye === 1 && dersHazir(u, d.no));
    return dersler.length > 0 && dersler.every((d) => dersBittiMi(k, d.id));
  });
  if (bitti.length) return { u: bitti[bitti.length - 1], bitti: true };
  const sira = siradakiDers(k, (d) => dersHazir(d.unite, d.no));
  const u = (sira && acik.includes(sira.unite) ? sira.unite : undefined) ?? acik[0];
  return u ? { u, bitti: false } : null;
}

/** Bir adanın üç cümlesi: İngilizcesi, Türkçesi ve (kaydı varsa) Polly'nin sesiyle dinleme düğmesi */
function evdeListesi(u: Unite): HTMLElement {
  return h('ol.ing-evde-liste', {}, ...(EVDE_CUMLELER[u.id] ?? []).map((c, i) => {
    const id = evdeSesKimligi(u.id, i);
    const dinle = sesAdresi(id) ? simgeDugme('hoparlor', `"${c.en}" cümlesini Polly'den dinle`, () => { void konus(id); }, 'ing-evde-dinle') : null;
    if (dinle) dinle.dataset.ses = id;
    return h('li', {}, dinle, h('span', {}, h('b', { lang: 'en-US' }, c.en), h('small', {}, c.tr)));
  }));
}

const DUZEY_ADI = { yeni: 'yeni', ogreniyor: 'öğreniyor', ogrendi: 'öğrendi' } as const;

export function buyuklerEkrani(kok: HTMLElement, git: Gezinme): () => void {
  let kapandi = false;
  const katman = h('div.mk-kok.mk-kilit-katmani');
  document.body.append(katman);
  void ebeveynKapisiAc(katman).then((gecti) => {
    katman.remove();
    if (kapandi) return;
    if (!gecti) { git.ana(); return; }
    ciz();
  });

  function ciz() {
    const k = oku();
    const acikUniteler = UNITELER.filter(uniteHazir);
    const dersSayisi = TUM_DERSLER.filter((d) => dersHazir(d.unite, d.no)).length;
    const bitenDers = TUM_DERSLER.filter((d) => dersBittiMi(k, d.id)).length;
    const ust = h('header.ing-ust', {},
      simgeDugme('geri', 'Ana ekrana dön', () => git.ana(), 'ing-geri'),
      h('div.ing-ust-orta', {}, h('h1.ing-baslik', {}, 'Büyükler için')),
      h('div.ing-ust-sag'),
    );
    const ozet = h('div.ing-veli-ozet', {},
      h('div', {}, h('strong', {}, `${bitenDers} / ${dersSayisi}`), h('span', {}, 'ders')),
      h('div', {}, h('strong', {}, String(k.cikartmalar.length)), h('span', {}, 'kelime')),
      h('div', {}, h('strong', {}, String(toplamYildiz(k))), h('span', {}, 'yıldız')),
      h('div', {}, h('strong', {}, String(seri(k, Date.now()))), h('span', {}, 'gün üst üste')),
    );
    const evde = evdeAdasi(k, acikUniteler);
    const evdeKart = evde && EVDE_CUMLELER[evde.u.id] ? h('section.ing-evde', { 'data-ada': evde.u.id },
      h('h2', {}, 'Evde 3 İngilizce Cümle'),
      h('p', {}, evde.bitti ? `Çocuğunuzun son bitirdiği ada: ${evde.u.no}. ${evde.u.tr}. ` : `Çocuğunuzun şu an öğrendiği ada: ${evde.u.no}. ${evde.u.tr}. `,
        'Bu cümleleri gün içinde, uygun anda söyleyin. Hoparlöre dokunup önce Polly’den dinleyebilirsiniz.'),
      evdeListesi(evde.u)) : null;
    const liste = h('div.ing-veli-liste');
    for (const u of acikUniteler) {
      const satirlar = acikKelimeler(u).map((w) => {
        const kazanildi = k.cikartmalar.includes(w.id);
        const duzey = kazanildi ? kelimeDuzeyi(k.kelimeler[w.id]) : 'yeni';
        return h('li', { 'data-duzey': kazanildi ? duzey : 'yok' }, h('b', { lang: 'en-US' }, w.en), h('span', {}, w.tr), h('i', {}, kazanildi ? DUZEY_ADI[duzey] : 'henüz görmedi'));
      });
      liste.append(h('section.ing-veli-unite', {}, h('h2', {}, `${u.no}. ${u.tr}`, h('small', { lang: 'en-US' }, u.en)), h('ul', {}, ...satirlar),
        h('p.ing-veli-kalip', {}, h('b', {}, 'Cümle kalıbı: '), h('span', { lang: 'en-US' }, cumle(u.kelimeler[0])), ' · ', h('span', { lang: 'en-US' }, soru(u.kelimeler[1]))),
        h('p.ing-veli-oneri', {}, h('b', {}, 'Evde deneyin: '), oneri(u)),
        ...(EVDE_CUMLELER[u.id] ? [h('p.ing-veli-evde-baslik', {}, h('b', {}, 'Evde 3 cümle:')), evdeListesi(u)] : [])));
    }
    const mikAcik = mikrofonTercihi();
    const mik = dugme('ing-veli-ayar', 'Mikrofonla söyleme', () => { mikrofonTercihiYaz(!mikrofonTercihi()); kok.replaceChildren(); ciz(); },
      h('span', {}, h('strong', {}, 'Mikrofonla söyleme'), h('small', {}, 'Çocuk kelimeyi söyleyince çubuk dolar. Cihazınız destekliyorsa söylediği sözcük yalnız cihazın içinde tanınır; başka sözcük geçmez. Ses kaydedilmez, hiçbir yere gönderilmez.')),
      h('b.ing-anahtar', { 'data-acik': String(mikAcik) }, mikAcik ? 'Açık' : 'Kapalı'));
    let onay = false;
    const sifirla = dugme('ing-veli-sifirla', 'İlerlemeyi sıfırla', () => {
      if (!onay) { onay = true; sifirla.textContent = 'Emin misiniz? Bütün yıldızlar ve çıkartmalar silinir. Silmek için bir daha dokunun.'; return; }
      yaz(bosKayit());
      try { localStorage.removeItem(ANAHTAR); } catch { /* bellekteki kayıt zaten boşaltıldı */ }
      git.ana();
    }, 'İlerlemeyi sıfırla');
    const aciklama = h('p.ing-veli-aciklama', {},
      'Her adada üç seviye vardır: önce kelimeler (her derste 4 yeni kelime), sonra cümleler, en son soru–cevap, cümle kurma ve hikâye. Bir ders 5 dakika kadar sürer. Uygulama, unutulmak üzere olan kelimeleri kendiliğinden yeniden sorar. ',
      'En iyi sonuç için her gün bir ders ve Oyunlar bölümündeki Günün Tekrarı yeterlidir.');
    kok.append(ust, h('section.ing-veli', {}, ozet, evdeKart, aciklama, liste, mik, sifirla));
  }

  return () => { kapandi = true; katman.remove(); sus(); };
}
