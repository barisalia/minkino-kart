# Dedektif Mino · Yeniden yapım (Barış 2026-11-16)

> Barış: "Senaryosu fena değil; sesler, karakterler, tasarım eski. Yeniden yap. Astra ile birlikte yapın, ben ellemeyeceğim."
> Oyun yapım bitene kadar arşivde (uygulama/src/oyunlar.ts → dedektif `arsiv: true`), menüde görünmez.

## Ne kalıyor, ne değişiyor
- **Kalan:** Vaka senaryoları (Vaka 1 `dedektif-mino.md`, Vaka 3 `dedektif-vaka3.md`, Vaka 2 kodda) ve oynanış:
  büyüteçle ipucu bul → 3 kart → doğru kartı ipucuna sürükle → "Demek ki…" → sonunda 4 kareli çizgi roman.
- **Yeni:**
  1. Karakterler: yeni Mino (turuncu tekir, mavi önlük, kırmızı fular) ve yeni Kino (beyaz, turuncu kulak, lacivert
     fular, yeşil tişört), dedektif şapkası ve büyüteçle. Eski kodla çizilen Mino (src/mino) ve iskelet Kino kalkar,
     yerine Astra'nın poz çizimleri gelir. Pamuk da yeni çizgide.
  2. Sahneler ve eşyalar: Okula Hazırlanalım çizgisinde (`assets/hazirlik/oda.webp`, `sinif.webp`).
  3. Sesler: güncel Mino ve Kino sesleriyle bütün cümleler yeniden (ElevenLabs; Barış onayı olmadan okutulmaz).
  4. Ekran tasarımı: yeni uygulama dili (Okula Hazırlanalım düğmeleri, yuvarlak ses düğmesi, alt dosya paneli).
- **Sıra:** önce yalnız Vaka 1 "Devrilen Lamba". Barış beğenince Vaka 2 ve 3 aynı yoldan.

## Görev paylaşımı
- **Astra:** bütün çizimler (iş emri: `CLAUDE-ASTRA-MESAJLAR.md`, 2026-11-16 "Dedektif Mino yeniden"). Dosyalar
  `assets/dedektif-yeni/` klasörüne; eski `assets/dedektif/` dokunulmaz (yeni sürüm bitene kadar eski oyun bozulmasın).
- **Claude:** cümle listesi, ses okutma (onaydan sonra), kod (yeni sahne düzeni, pozların bağlanması, ekranlar), test.

## Vaka 1 cümleleri (seslendirilecek, ≤ 8 kelime)
Senaryodaki "Cümleler" bölümü aynen kullanılır (`dedektif-mino.md`, ~35 cümle, ~900 karakter):
Mino ~17, Kino ~8, kart karakterleri ~7 (zürafa, ördek, siyah kedi, yastık), Pamuk 3.
Pamuk'un sesi: Mino sesinin ince tonu değil, ayrı yumuşak bir kedi sesi önerisi (Barış seçer).

## Durum
- [x] Astra: Vaka 1 çizimleri (48 + açılış odası + Vaka 1 kapağı)
- [x] Claude: Vaka 1 sahne düzeni, poz bağlama, açılış ve Vaka Dosyam panoda (2026-11-17)
- [x] Sesler geri açık (Sürüm 6 hazırlığında kapatılmıştı): mevcut kayıtlar çalıyor; Mino şimdilik anlatıcı sesiyle
- [x] Barış'a Vaka 1 gösterimi: "devam" (2026-11-17)
- [x] Mino'nun kendi sesi (Barış: "Okut", 2026-11-17): Vaka 1'in 32 cümlesi (762 harf) `content/film2/sesler.json → mino` sesiyle `public/ses/mino/`. Kayıtlar anlatıcıdan ~9 dB kısık geldi; hepsi anlatıcı/Kino seviyesine (~-13,7 LUFS, ±0,5) eşitlendi (ffmpeg-static, ses rengi değişmez). Oyunda `SES.mino = { karakter: 'mino' }`: kaydı olan cümle Mino'nun sesiyle, olmayan (Vaka 2-3) anlatıcı sesiyle. `cumleler.ts → dedektifMinoCumleleri()` yalnız Vaka 1. Kart ve Pamuk sözleri anlatıcı sesinde kaldı.
- [x] Telefonda yürüme karesi hatası (`/dedektif/undefined` 404): `adim.ts` rAF zamanı eksi sıra veriyordu, düzeldi
- [x] Telefon finali: kamera pencereye/masaya yaklaşınca Pamuk lambanın önüne binerse sola çekilir (`oyuncular.ts → pamukKenaraCek`, Mino'ya değmez; iPad'de çakışma yok, kımıldamaz)
- [x] Poz geçişi (Mino rahat, Kino sevinç, Pamuk el sallama…): yeni resim çizilmeye hazır olana dek (en çok 500 ms) önceki görünüm ekranda kalır; yavaş cihazda karakter bir an kaybolmaz (`poz.ts → bekleyen`)
- [x] Gerçek hızda (test modu yok, sesli) Vaka 1 baştan sona: 1024×768, 844×390, 932×430, 667×375; Mino'nun 32 cümlesinden duruma bağlı olmayan hepsi kendi sesiyle, anlatıcı yedeğine düşen yok, konsol hatası yok
- [ ] Astra: Vaka 1 çizgi roman 1 ve 2 düzeltmesi, Vaka 2 (32 çizim) ve Vaka 3 (30 çizim): iş emri `CLAUDE-ASTRA-MESAJLAR.md`, 2026-11-17
- [x] Vaka 2 (2026-11-17 22:45): Astra'nın 32 çiziminden 28'i bağlandı (`resimler.ts → TABLO2_YENI`: yeni varsa o, yoksa eski; yeni yatay zemin varken eski dikey kullanılmaz). Gerçek hızda sesli iPad + telefon baştan sona geçti (44 kayıt, eksik dosya yok)
- [ ] Astra: Vaka 2 geri dönen 4 çizim (`_geri/v2/`: ip-mavi, iplik-kirmizi yarı boy; ordek-izi izler seçilmiyor; kart-kopek Kino'ya benziyor) + Ada ve mavi balon yeni çizgide (sayfa V2-G, 6 çizim)
- [ ] Claude: Ada yeni çizimi gelince Ada'yı poz olarak bağla (şu an eski iskelet)
- [x] Vaka 2 Mino sesi (Barış "devam", 2026-11-17): 22 cümle Mino'nun kendi sesiyle (`dedektifMinoCumleleri` Vaka 1 + 2), 671 harf. Scribe 22/22 ("Bir iz! Kimin ayağı tam uyar?" Mino'nun sesinde "ayağa" gibi çıkıyordu: okunuş ipucuyla "Kimin ayağı, tam uyar?" okutulup aynı dosyaya kondu; ekrandaki yazı aynı). Mino'nun 54 kaydı projenin biçiminde (mp3 44,1 kHz, 64 kbps, mono), ortalama -13,9 LUFS. Kilitli klasör cümleleri de (`M2.kilitli`, `M3.kilitli`) Mino'nun sesiyle. Gerçek hızda sesli iPad + telefon geçti
- [ ] ElevenLabs kotası 17 Kasım 23:00'te bitti (kalan 1 harf), 24 Kasım'da yenilenir: Vaka 3'te Mino'nun sesi o zamana kalır
- [x] Konuşma balonları kaldırıldı (Barış 18 Kasım: "gerek yok konuşma balonlarına"); ses ve ağız yeter. Not: Vaka 3'te yalnız balonla konuşan konuklar (`kim: 'balon'`: kuş, tavşan, kirpi, baykuş) artık hiç duyulmuyor/görünmüyor; 24 Kasım'da seslendirilmeli
- [ ] Ağızlar (Barış: "ağızlar oynamıyor"): kök sebep 16 Kasım'da iskeletin gizlenip tek parça çizimlerin (`assets/dedektif-oyuncular/*-dur/-sapka/-mercek`) konması; ağız çizime gömülü. Kod hazır (`cizgi-agiz.ts`): `assets/dedektif-oyuncular/agiz/<temel>-agiz-<az|orta|yuvarlak|dis>.webp` gelince sese göre oynar (geçici dosyayla denendi: Mino ve Kino katmanı sesle değişti). Astra iş emri 18 Kasım (A1–A4, 24 çizim)
- [ ] Kino'nun yönü (Barış: "yanlış yönü gösteriyor"): bütün Kino çizimleri sağa dönük, Kino ekranın sağında. Kod hazır: `kino-dur-sol`, `kino-otur-sol`, `kino-tahmin-sol`, `kino-koklama-sol`, `kino-adim-sol-*` gelince Kino baktığı / gösterdiği şeye (kart, Mino, ipucu) dönük; yürüyüşte aynalama kalkar (Mino için `mino-adim-sol-*`). Astra iş emri 18 Kasım (K1–K3, M1)
- [ ] Claude: Vaka 3 çizimleri geldikçe bağlama (`assets/dedektif-yeni/v3`)
- [ ] Oyun arşivden çıkar (Barış onayıyla)
