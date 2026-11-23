# Paket Doktor-K1 kaynak klasörü

Astra'nın ham çizimleri ve sayfaları buraya konur. Bağlama betiği bu klasörü okur, zemini temizler ve `assets/doktor/zipzip-diz/<ad>.webp` yazar:

```powershell
npx vite-node doktor/araclar/bagla.ts
```

- Tek çizim: brief'teki adla (`zipzip-tirman-0.png`).
- Sayfa: çağrının anahtarıyla (`a1.png` … `a5.png`, `b1.png` … `b8.png`, `c1.png` … `c5.png`, `d1.png` … `d4.png`). Izgara gerekirse adda: `a1@3x2.png`.
- Zemin şeffaf ya da düz macenta. Beyaz zemin işlenmez.
- `yerlesim.json` (isteğe bağlı): sayfadan kesilen pozların ölçeği ve tuvaldeki yeri.

Ayrıntı: `doktor/araclar/OKU.md`. Bitmiş, tuval boyutunda `.webp` doğrudan `assets/doktor/zipzip-diz/` içine de konabilir; betik onu da denetler.
