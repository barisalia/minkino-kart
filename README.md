# Minkino Kartlar

3-6 yaş için sesli, eğitici kart oyunu. Çocuk soruyu sesli duyar, doğru kartı bulur; doğru kart uçup albümüne yapışır.

**Canlı sürüm (telefonda aç):** https://barisalia.github.io/minkino-kart/

## Geliştirme

```bash
npm install
npm run dev        # yerel sunucu
npm test           # birim + içerik doğrulama testleri
npm run e2e        # Playwright uçtan uca testler (ekran görüntüleri tests/screens/)
npm run build      # dist/ (Capacitor'a hazır, göreli yollar)
```

## Yapı

| Klasör | İçerik |
|---|---|
| `src/engine` | Soru tipleri, tur oluşturma, ödül/yıldız, ilerleme kaydı |
| `src/screens` | Ekranlar (açılış, yaş, tema, oyun, tur sonu, albüm, ebeveyn) |
| `src/audio` | Konuşma (Web Speech tr-TR), sentez efektler, müzik |
| `src/ui` | Kart çizimi, ikonlar, konfeti, animasyonlar |
| `content/` | Tüm içerik JSON'ları — yeni soru eklemek kod gerektirmez (bkz. `content/README.md`) |
| `assets/` | WebP görseller |
| `tests/` | Vitest birim testleri, Playwright uçtan uca testler |

Ortak çalışma defteri: [ORTAK_NOTLAR.md](ORTAK_NOTLAR.md)
