/**
 * Paket Doktor-A1 · denetim kaydı. Her kaynak çizim %100 boyda açılıp bakıldıktan sonra buraya yazılır:
 * ONAYLI olanları `a1-bagla.ts` oyuna bağlar; GERI olanlar Astra'ya dosya adıyla yazılmıştır (CLAUDE-ASTRA-MESAJLAR.md),
 * düzeltilmişi gelip yeniden bakılana dek bağlanmaz. Burada adı olmayan kare daha denetlenmemiştir.
 */
export const ONAYLI: readonly string[] = [
  // B · lavabo (23 Kasım 02:17 ve 02:25 denetimi)
  'patiler-camurlu', 'patiler-temiz', 'patiler-goster', 'patiler-damla',
  'ovma-0', 'ovma-1', 'ovma-2', 'ovma-3', 'ovma-4', 'ovma-5', 'ovma-6', 'ovma-7',
  'havlu-0', 'havlu-1', 'havlu-2', 'sabun-1',
  'su-sicrama-0', 'su-sicrama-1', 'su-sicrama-2', 'su-sicrama-3', 'su-damla-0', 'su-damla-1',
  'kabarcik-0', 'kabarcik-3', 'kabarcik-pat-0', 'kabarcik-pat-1', 'kabarcik-pat-2',
  'lavabo-su-0', 'lavabo-su-1',
  'kino-ayna-kahkaha', 'kino-ayna-kopuk', 'kino-ayna-mutlu', 'kino-ayna-kirp',
  // E · kol (02:30 denetimi)
  'diken-kopma-2', 'diken-izi', 'kase-su', 'sargi-rulo-0', 'pamuk-kuru', 'sargi-kat-4', 'bant-kagit-0',
  'zipzip-yakin-gozkisik', 'zipzip-yakin-oh', 'zipzip-yakin-gulme', 'zipzip-yakin-merak', 'zipzip-yakin-utangac', 'kino-basparmak', 'kino-alkis-hizli',
  // C · mikroplar (02:42 denetimi)
  'mikrop-0-k1', 'mikrop-0-k3', 'mikrop-1-k0', 'mikrop-1-k1', 'mikrop-1-k2', 'mikrop-1-k3', 'mikrop-2-k1', 'mikrop-2-k3', 'kopuk-fiskirma-0', 'kopuk-fiskirma-1', 'kopuk-fiskirma-2',
  // yeniden gelip onaylananlar (02:46)
  'su-akis-0', 'su-akis-1', 'su-akis-2', 'su-akis-3', 'sargi-kat-0', 'sargi-kat-1', 'sargi-kat-2', 'sargi-kat-3', 'cimbiz-yari',
  // yeniden gelip onaylananlar (02:58)
  'bant-kagit-1', 'kase-dalga-0', 'kase-dalga-1', 'mikrop-0-k0', 'mikrop-2-k0', 'mikrop-0-kork', 'mikrop-1-kork', 'mikrop-2-kork', 'pamuk-islak', 'pamuk-kir-0', 'pamuk-kir-1', 'pamuk-kir-2', 'pamuk-kir-3', 'sargi-rulo-1', 'sargi-rulo-2', 'sargi-rulo-3', 'sprey-basili',
  // A, D, G (03:10 denetimi)
  'gogus-fon', 'zipzip-gogus-korkulu', 'zipzip-gogus-merak', 'zipzip-gogus-kikir', 'zipzip-gogus-sakin', 'zipzip-gogus-kirp', 'stetoskop', 'stetoskop-basili', 'kino-dinle-0', 'kino-dinle-1', 'zipzip-zipla-0', 'zipzip-zipla-1', 'zipzip-zipla-2', 'zipzip-bekle-bak', 'zipzip-bekle-of', 'kino-karsila-0', 'kino-karsila-1', 'kino-dusun', 'kino-kahkaha', 'kino-ups', 'kino-yasasin-0', 'kino-yasasin-1', 'defter-fon',
  // F, G (03:15 denetimi)
  'cikartma-yildiz', 'cikartma-kalp', 'cikartma-pati', 'cikartma-gokkusagi', 'cikartma-havuc', 'cikartma-cicek', 'cikartma-kemik', 'cikartma-gunes', 'cikartma-soyulma-0', 'cikartma-soyulma-1', 'cikartma-soyulma-2', 'damga', 'damga-basili', 'damga-izi', 'defter-portre-mutlu', 'parilti-0', 'parilti-1', 'parilti-2', 'parilti-3', 'konfeti-1', 'konfeti-2', 'konfeti-3', 'konfeti-4', 'konfeti-5', 'yildiz-kuyruk', 'zipzip-dans-2', 'zipzip-dans-4', 'zipzip-dans-5', 'zipzip-dans-6',
  // yeniden gelip onaylananlar (02:31)
  'lavabo-fon', 'musluk-kol-0', 'musluk-kol-1', 'musluk-kol-2', 'sabun-0', 'sabun-2', 'kopurme-0', 'kopurme-1', 'kopurme-2', 'kopurme-3', 'kopurme-4', 'kopurme-5', 'kopuk-akan-0', 'kopuk-akan-1', 'kopuk-akan-2', 'kabarcik-1', 'kabarcik-2',
  // yeniden gelip onaylananlar (03:50)
  'diken-gergin-0', 'diken-gergin-1', 'diken-gergin-2', 'diken-kopma-0', 'diken-kopma-1', 'mikrop-0-k2', 'mikrop-2-k2', 'mikrop-0-kopukte', 'mikrop-1-kopukte', 'mikrop-2-kopukte', 'pof-2', 'pof-3', 'kalp-0', 'kalp-1', 'kalp-2', 'bant-kagit-2', 'bant-kirisik', 'bant-duz', 'sargi-serit', 'konfeti-0', 'kino-ayna-merak', 'kino-ayna-gidik', 'kino-kirp', 'kino-dans-0', 'kino-dans-1', 'kino-bak-0', 'kino-bak-1', 'zipzip-gogus-nefes-1',
  // üçüncü turda onaylananlar (04:05): paket tamam
  'zipzip-topal-0', 'zipzip-topal-1', 'zipzip-topal-2', 'zipzip-topal-3', 'zipzip-topal-4', 'zipzip-topal-5', 'zipzip-dans-0', 'zipzip-dans-1', 'zipzip-dans-3', 'zipzip-dans-7', 'zipzip-yakin-kirp', 'zipzip-gogus-nefes-0',
  // göğüs eki, iri Kino (06:20 denetimi): tek parça, başıboş piksel yok; dinle kareleri üst üste oturuyor
  'kino-gogus-uzan', 'kino-gogus-dinle-0', 'kino-gogus-dinle-1',
  // 08:15 denetimi (07:32 teslimi): uzun bekleme (etek tek parça), iki göz kırpma (yama izi yok), dik defter fonu
  'kino-gogus-bekle', 'kino-gogus-bekle-kirp', 'kino-gogus-uzan-kirp', 'defter-fon-dik',
];
/** Geri yazılanlar: ad → kusur (kısa). */
export const GERI: Readonly<Record<string, string>> = {
};
