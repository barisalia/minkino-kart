// Saf kurallar (birim testi): ikinci içerik sırası ve 2–3 yaş boyama resimleri.

/** Adım bu harfte n kez bitmişse: tek sayıda yeni içerik, çift sayıda ilk içerik. */
export const yeniTurMu = (n: number) => n % 2 === 1;

/**
 * 2–3 yaş ikinci boyama resimleri (Paket Harf-H11, assets/alfabe/boyama-resim/<dosya>.png): her harfe sözcük
 * havuzundan bir sözcük; Ceren kaydı havuzdaki `ses` alanı. Harf kimliği → [dosya, ad, ses].
 */
export const BOYAMA_RESIMLERI: Record<string, readonly [string, string, string]> = {
  '01': ['ari', 'Arı', 'pano-ad-ari'], '02': ['balon', 'Balon', 'pano-ad-balon'], '03': ['ceket', 'Ceket', 'pano-ad-ceket'],
  '04': ['cicek', 'Çiçek', 'pano-ad-cicek'], '05': ['dinozor', 'Dinozor', 'pano-ad-dinozor'], '06': ['erik', 'Erik', 'pano-ad-erik'],
  '07': ['fare', 'Fare', 'pano-ad-fare'], '08': ['gitar', 'Gitar', 'pano-ad-gitar'], '09': ['agac', 'Ağaç', 'kutu-ad-agac'],
  '10': ['horoz', 'Horoz', 'pano-ad-horoz'], '11': ['irmak', 'Irmak', 'pano-ad-irmak'], '12': ['iplik', 'İplik', 'pano-ad-iplik'],
  '13': ['jip', 'Jip', 'pano-ad-jip'], '14': ['kus', 'Kuş', 'pano-ad-kus'], '15': ['lolipop', 'Lolipop', 'pano-ad-lolipop'],
  '16': ['maymun', 'Maymun', 'pano-ad-maymun'], '17': ['nilufer', 'Nilüfer', 'pano-ad-nilufer'], '18': ['okul', 'Okul', 'pano-ad-okul'],
  '19': ['odul', 'Ödül', 'pano-ad-odul'], '20': ['pasta', 'Pasta', 'pano-ad-pasta'], '21': ['roket', 'Roket', 'pano-ad-roket'],
  '22': ['salyangoz', 'Salyangoz', 'pano-ad-salyangoz'], '23': ['seker', 'Şeker', 'pano-ad-seker'], '24': ['tavsan', 'Tavşan', 'pano-ad-tavsan'],
  '25': ['ugur-bocegi', 'Uğur böceği', 'pano-ad-ugur-bocegi'], '26': ['utu', 'Ütü', 'pano-ad-utu'], '27': ['valiz', 'Valiz', 'pano-ad-valiz'],
  '28': ['yildiz', 'Yıldız', 'pano-ad-yildiz'], '29': ['zebra', 'Zebra', 'pano-ad-zebra'],
};
