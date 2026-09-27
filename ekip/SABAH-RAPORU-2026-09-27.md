# Sabah raporu — 27 Eylül 2026 (gece çalışması)

Site: https://minkino-site.barisalidogan.workers.dev/ — sayfayı açınca bir kez yenile.

## Yayında olanlar (linkler)

| Ne | Link | Kısaca |
|---|---|---|
| **Ana menü** | /uygulama/ | Mino soldan yandan yürüyerek, Kino sağdan hoplayarak gelir, el sallaşırlar. 6 oyun kartı, yeni yan oyun rozetleri, parmakla derinlik. |
| **Şşş, Ege Uyuyor!** (yeni bölüm) | /macera/?bolum=ege | 9 sahne: battaniye, çıngırak, mama (üfle, peçeteyle sil), kuklalar (Ege konuşana döner), cee-ee, yatak (tavanda yıldızlar), ninni, Mino'nun burnu (hıpşu / HAPŞU), fısıltıyla iyi geceler. Seslendirildi. |
| **Mino Banyo Yapmıyor!** (yeni bölüm) | /macera/?bolum=banyo | 8 sahne: çamur, saklambaç, musluk (sıcak/soğuk), baloncuk (Mino küvete düşer), köpük, Kino ile uluma, kurulama (Kino silkelenir, ekran ıslanır), ayna. Mino sırılsıklam/pofuduk, Kino ifadeli. Seslendirildi. |
| **Mino'nun Karpuzu** (ilk film) | /film/ | ~60 sn, katmanlı arka plan, gerçek eşyalar, Mino yandan adım adım yürür, müzik, seslendirildi. |
| **Mino'nun Pazarı** | /pazar/ | Yaşayan sahne, terazi, 7 müşterinin hepsi parçalı ve kişilikli, yeni yan oyun **Meyve Suyu Köşesi** (renk karıştırma). |
| **Kartlar** | / | Mino kartları dağıtır, albüme uçuş, sayfa çevirme; yeni yan oyun **Hafıza Oyunu**. |
| **Çiz Canlansın** | /canlan/ | Mino eşlik eder, yıldız ödülü, sinematik canlanma; yeni yan oyun **Müzem**. |
| **Minik Sanatçı** | /sanatci/ | Mino sihirli değnekle bekler, perde açılışı; sunucu dolunca sihirli çerçeve. |

## Karakterler (Adobe + Gemini)
- **Kino** tasarlandı (Recraft 3 seçenek → gece geçici seçim 3.): renk, gölge, parçalar, 7 ifade + köpük saç. **Seçim senin** — `ekip/kino/secenekler/karsilastirma.png`.
- **Parçalı iskeletler:** Mino (önden + yandan + ifadeler + ıslak/pofuduk + burun), Kino, Ege (10 ifade + baş çevirme), anne (3 poz), 7 pazar hayvanı, 5 çocuk (Ada, Can, Elif, Deniz, Zeynep).
- **Yandan görünüşler** (Gemini): Mino, köpek, tavşan, ördek, Ada, Can, Elif, Deniz, Zeynep — Adobe iskeletliyor.

## Kredi (gece)
- Recraft: 56 / 100 kredi (Kino 36, banyo 6+2, Ege eşyaları 4, anne 6).
- ElevenLabs seslendirme: film 6 cümle, Pazar ~20 cümle, Ege 43 cümle, Banyo ~40 cümle, diğer küçük eklemeler (CI üretti).
- Adobe ve Gemini: bol kullanıldı (ek ücret yok).

## Senin kararın gerekenler
1. **Kino tasarımı:** 3 seçenekten hangisi? (Başka seçilirse aynı iş onunla tekrarlanır; kod değişmez.)
2. **Ninni ezgisi** "Dandini dandini dastana" kulaktan düzenlendi — bir dinle.
3. **Bebek sesleri / banyo efektleri** şu an kodla (Web Audio). Gerçekçi ElevenLabs sesleri istersen: Ege ~260, banyo ~200 kredi.
4. **2. film:** Senarist 3 fikir sundu (Maymun ve Meyve Kulesi / Ağır Sepet / Elif ve Kaydırak).
5. **Görünüm onayları:** Mino'nun kart oyunundaki yeri, Hafıza/Meyve Suyu/Müzem girişleri, blender görünümü, müze duvarı.

## Bilinen küçük sorunlar
- Kino'nun boynunda kafa çok eğilince (banyoda uluma) köşeli bir dolgu görünüyor — Adobe düzeltiyor; menüde geçici sınır var.
- Dikey telefonda bazı sahnelerde üstte boş duvar fazla; yatay tavsiye edilir.
- Mikrofonla (üfleme, fısıltı, uluma) gerçek telefonda deneme henüz yapılmadı.
