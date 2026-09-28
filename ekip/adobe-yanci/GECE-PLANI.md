# Adobe yancısı — gece planı (2026-09-27 → 28)

Rol: Barış'ın bilgisayarına masaüstü kontrolüyle (computer-use) bağlanıp Illustrator 2026'yı ARAYÜZDEN kullanan oturum. Betikle yapılamayan Firefly işleri (Konseptten Vektör, Dönen tabla/Turntable, Generative Recolor/Expand) burada yapılır. İş isteyen: tasarımcı oturumu "adobe" (SendMessage ile `adobe`).

## Saat
- Barış için "gece" = sabaha karşı 05:00-05:30 (02:00'de hâlâ uyanık). Zamanlanmış görev: 2026-09-28 11:30 (Barış 05:30'dan öğlene aldı).

## Ön koşullar (Barış)
- Bilgisayar KİLİTLİ OLMAMALI, ekran kapanmamalı (kilitliyken ekran görüntüsü alınamıyor; şifre girmem yasak).
- Illustrator açık olsun ya da ben açarım. Unity/Chrome kapalı olursa odak çalması azalır.
- Bilinen engeller: Lenovo `FnHotkeyUtility` görünmez penceresi öne geçip tıklamayı engelliyor → PowerShell ile Illustrator'ı öne alan yardımcı betik (scratchpad `one.ps1`, SetForegroundWindow). Pano yazımı bazen başka oturumca eziliyor → yolu `Set-Clipboard` ile koyup Ctrl+V.
- Dosya iletişim kutusunda yalnız "Dosya adı" kutusuna yazılabilir; tür açılır menüsü tıklanarak seçilir (Dışa Aktar'da varsayılan PDF → SVG seçilmeli).

## Görev 1 — tavşan (KAPANDI)
- "Konseptten Vektör" (Gemini 3.0 Nano Banana Pro, 40 kredi) denendi → cikti/tavsan-iz.ai. Tasarımcı (adobe) 2026-09-27: yeter, SVG'ye gerek yok; tavşanı kendi yöntemiyle (piksel iskelet) yapıyor. Bu göreve dokunma.

## Görev 2 — Turntable (Dönen tabla) — GECENİN TEK ÖNCELİĞİ
- En önemli ölçü: stilin birebir kalması (kalın kahve kontur, renkler, fular). Yönetici sonucu Mino'nun mevcut yan profiliyle karşılaştıracak: ekip/mino/mino-profil-onizleme.png (işe başlamadan bak).
- girdi/mino-on.svg aç → tümünü seç → Özellikler panelindeki "Dönen tabla" → tam yan (sağa bakan profil) ve 3/4 görünüm üret; her birini ayrı belge olarak kaydet: cikti/mino-yan.ai/.svg, cikti/mino-34.ai/.svg. Varyasyonlar *-v2.
- Aynısı girdi/kino-on.svg → cikti/kino-yan.*, cikti/kino-34.*.
- Kaydetme: Farklı Kaydet (Ctrl+Shift+S) .ai; SVG için Dışa Aktar (yukarıdaki ayarlar).

## Kurallar
- Yalnız kendi açtığım belgeler; başkasının belgesine dokunma. Git'e dokunma (commit/push yok).
- Uzun Illustrator işine başlarken ve bitirince `adobe` oturumuna tek satır haber (çakışma olmasın).
- Kredi: Adobe kredisi serbest, israf etme, harcananı yaz (şimdiye kadar 40).
- Bitince `adobe`ya rapor: dosya yolları, harcanan kredi, iyi/kötü çıkanlar, Illustrator'da görülen üretken özellikler (menü/panel adlarıyla). Barış'a kısa Türkçe özet + ekran görüntüsü. ORTAK_NOTLAR.md'ye tarihli satır ekle.

## Görülen üretken özellikler (Illustrator 2026, Türkçe arayüz)
- Karşılama ekranı: "Vektör oluştur" (metinden vektör), "İlham görüntüleri oluşturun", "Panolar ile fikir üretme"; Öne çıkanlar: Konseptten Vektör, Yeniden Yaz, Dönen tabla.
- Resim seçiliyken Özellikler > Hızlı İşlemler: Konseptten Vektör (iş ortağı modelleri: GPT Image / 1.5 / 2, Gemini 2.5 / 3.0 / 3.1, FLUX 2 Pro; 40 kredi), Görüntü İzleme (klasik), Arka Planı Kaldır, Görüntüyü Kırp, Firefly Panolar'da Düzenle; Dönüştür bölümünde Dönen tabla.
