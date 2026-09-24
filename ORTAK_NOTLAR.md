# ORTAK NOTLAR — Minkino Kartlar

Bu dosya oturumlar arası ortak defterdir. **Kural:** baştan yazılmaz; her oturum sadece en alta tarihli satırlar ekler.

- Canlı test linki (telefonda aç): https://barisalia.github.io/minkino-kart/
- Repo: https://github.com/barisalia/minkino-kart

---

## 2026-09-24 — Oturum 1 (başlangıç)

- 2026-09-24 Repo boştu; Vite + TypeScript (çerçevesiz) iskelet kuruldu. Klasörler: src/engine, src/screens, src/audio, src/ui, content/, assets/, tests/.
- 2026-09-24 Deploy: GitHub Actions (`.github/workflows/yayinla.yml`) her push'ta build alıp `gh-pages` dalına yayınlar.
- 2026-09-24 Görseller Recraft ile üretildi (70 görsel, 3 kredi/görsel: üretim + arka plan kaldırma). Bu bulut makinesinin ağ politikası `img.recraft.ai` adresini engellediği için görsel URL'leri `assets/recraft/*.json` dosyalarına yazıldı; GitHub Actions bunları indirip 512×512 WebP yapar ve repoya geri kaydeder (`scripts/gorsel-indir.mjs`).
- 2026-09-24 KARAR (Barış'ın mesajı üzerine): Oyun kitaplara/QR'a bağlı DEĞİL; kendi başına, abonelikle satılacak bir oyun. "Kitap kodu gir" kaldırıldı, ebeveyn köşesinde yalnızca "Minkino Premium" abonelik ekranı (şimdilik görünüm) var.
- 2026-09-24 KARAR (Barış'ın mesajı üzerine): Bu oyun ileride içinde çok sayıda oyun olan bir Minkino uygulamasına "tıkla-aç" mini oyun olarak eklenecek. Bu yüzden oyun kendi içinde kapalı bir modül: tek giriş noktası (`oyunuBaslat(kok, secenekler)`), tüm CSS `.mk-kok` altında, kayıt anahtarı `minkino-kartlar-v1`, ana uygulamaya dönüş için `cikis` geri çağrısı.
