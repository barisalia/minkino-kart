# Şşş, Ege Uyuyor! (Sesli Maceralar Bölüm 2): malzeme ve iş bölümü

Senaryo (Barış onaylı, 2026-09-27): [../senaryo/ege-uyuyor.md](../senaryo/ege-uyuyor.md)

**Kurallar:** Doğum Günü (`macera/src/dogumgunu.ts`) bulut yöneticinin; Bölüm 2 **yeni dosyalarda** yazılır (`macera/src/ege*.ts`, `content/macera-ege.json`). Ortak dosyalara (oyuncu.ts, sahne.ts, ekranlar.ts, kulak/gorev/analiz) yalnız **ekleme** yapılır, mevcut davranış değişmez; üfleme/mikrofon eşiklerine Barış onayı olmadan dokunulmaz. Seslendirme (~44 cümle ≈ 1.100 karakter) ve ElevenLabs efektleri (~260 kredi) **Barış onayından sonra**; o zamana kadar cihaz sesi ve Web Audio.

## Görseller (Gemini üretir → Adobe temizler/iskeletler)
Kayıt: `C:\Users\Minkex\Desktop\minkino-film-gemini\ege\<ad>.png` (2048, beyaz zemin). Stil referansı: `assets/parti/ada.webp`, `can.webp`, `elif.webp`, `koltuk.webp`, `assets/parti-sahne/oda.webp`.

| # | Görsel | Not | Durum |
|---|---|---|---|
| 1 | **Ege temel** (≈1 yaş, oturan, önden) | Ada'nın ailesi: ten/saç tonu uyumlu; kafa ayrı katman olacak (Adobe) | bekliyor |
| 2 | Ege yüz ifadeleri (temelle piksel hizalı, yalnız yüz) | ağlıyor, bakıyor, am (ağız açık), mamalı, kıkırdıyor, kahkaha, şaşkın "Ooo", dudak büzük, esniyor, uyuyor, uykuda gülümsüyor, bir göz açık | bekliyor |
| 3 | Ege başı sola ve sağa dönük (3/4) | kuklalara bakma; iskelette kafa dönüşü yetmezse | bekliyor |
| 4 | Ege yatan (beşikte, uyurken) | battaniyesiz; battaniye ayrı eşya | bekliyor |
| 5 | Anne: ayakta yorgun · kanepede uzanmış uyuyor · oturmuş uyanık gülümsüyor · sarılıyor | Ada'nın annesi, ev kıyafeti | bekliyor |
| 6 | Ada, Can, Elif: yüzü elleriyle kapalı · eller açık "Cee!" | parti normal çizimleriyle aynı çerçeve | bekliyor |
| 7 | Mino: burnu kaşınan yüz (ha-ha-haa) · iki patiyle burnunu tutan · şişkin "tutuyor" yüz | mino-final ile piksel hizalı | bekliyor |
| 8 | Eşyalar | beşik, mama sandalyesi, mama kasesi, kaşık, önlük, peçete, çıngırak, oyuncak sepeti, küp, top, kitap, lastik ördek, ayı el kuklası, civciv el kuklası, emzik, Ege battaniyesi, anne battaniyesi, gece lambası, perde (açık, kapalı) | bekliyor |

Kanepe: `assets/parti/koltuk.webp`. Arka plan: `assets/parti-sahne/oda.webp` (süssüz; akşam/gece ışığı kodla).

## Kod (kodcu)
- `macera/src/ege.ts` (+ gerekirse `ege-*.ts`): 9 sahne; `content/macera-ege.json`; `ekranlar.ts` açılışına Bölüm 2 kartı.
- Mekanikler: sürükle-bırak, sepette arama, silme (peçete: leke maskesi), beşik sallama (yön değişimi = salınım), basılı tut (burun). Ses: tık/alkış (çıngırak), üfleme (mama; 5-6 yaş yavaş), perde referanslı ince/kalın (kukla), neşeli ses (cee; 5-6 yaş yumuşak), kısık ses + melodi (ninni "Dandini dandini dastana"), sessizlik (ay dolar), fısıltı.
- Kısık ses/fısıltı eşikleri: `ses-testi/src/analiz.ts` seviye ölçümünden. Yeni algılayıcı gerekiyorsa **yeni** sınıf eklenir, eskiler değişmez.
- Her sesli görevin dokunarak karşılığı var; 2 deneme/12 sn'de parmak ipucu; 3-4 yaşta 3. denemede kabul; hiçbir yerde kilitlenme yok.
- Test: `tests/e2e/macera-ege.spec.ts` dokunarak baştan sona (3-4 ve 5-6 yaş), telefon + tablet.

## Adobe
- Ege iskeleti: kafa ayrı (sola/sağa dönüş), kollar, bacaklar; gizli yüz ekleri (2. satır).
- Kuklalar: el kuklası gövdesi + ağız (ayı çene, civciv gaga) ayrı katman.
- Eşyaların zemin temizliği, `assets/ege/<ad>.webp`.
