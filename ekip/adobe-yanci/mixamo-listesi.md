# Mixamo klip listesi (MinkexGame robotu) — Blender oturumunun isteği

**Durum (2026-09-28):** Tamam. 29 FBX `Mixamo~` klasöründe, hepsi tam. Robot_Mudur_Olum Mixamo'da yok (oturarak ölme klibi bulunmuyor). Öldürme ikilisi Mixamo'nun gerçek eşli "Stealth Assassination From Behind" klipleri. Ayrıntılı liste ve süreler Blender'a gönderildi. Mixamo oturumu uygulama içi tarayıcıda zaman zaman düşüyor; girişi Barış yapar, şifre girilmez.

## Ayarlar (her klipte aynı)
- **Karakter:** Mixamo varsayılanı (Y Bot).
- **İndirme:** FBX for Unity (.fbx), Without Skin, 30 fps, Keyframe Reduction: none.
- **In Place:** yerinde oynayan kliplerde işaretli.
- **Kayıt yeri:** `C:\Users\Minkex\Desktop\MinkexGame\Assets\_Game\Art\Animasyonlar\Mixamo~\`. Klasörü biz oluştururuz. Başka proje klasörüne yazılmaz.
- **Rapor:** Her klibin Mixamo'daki tam adı ve süresi tek listede Blender'a yazılır. Uygun klip yoksa en yakını seçilir, notu düşülür.

## 1. öncelik: eğilme ve yüzüstü (05:30'da kodlanacak)
| Dosya | Mixamo'da ara |
|---|---|
| Robot_Comelme_Bekleme.fbx | Crouch Idle (döngü) |
| Robot_Comelme_Yurume.fbx | Crouch Walk, In Place (döngü). Varsa Robot_Comelme_Geri/_Sol/_Sag ayrı dosyalar |
| Robot_Surunme.fbx | Crawling / Prone Crawl, In Place (döngü) |
| Robot_Surunme_Bekleme.fbx | Prone Idle (döngü) |
| Robot_Comelme_Gecis.fbx | Stand To Crouch (tek sefer) |

## 1b. öncelik (Blender, 01:00: eğilmeden hemen sonra)
| Dosya | Mixamo'da ara |
|---|---|
| Robot_Olum_Kafadan.fbx | Headshot / Shot In The Head / Falling Back Death (kafa geriye seker, dizlerin üstüne ve yere yığılır) |

## 2. öncelik
| Dosya | Mixamo'da ara |
|---|---|
| Robot_SahteOlum_Yatis.fbx | Dying / Falling Back Death |
| Robot_SahteOlum_Kalkis.fbx | Getting Up / Stand Up (sırt üstünden) |
| Robot_Merdiven_Tirmanma.fbx | Climbing Ladder, In Place (döngü) |
| Robot_Merdiven_Ust.fbx | Climbing To Top |
| Robot_Kenar_Tirmanma.fbx | Climbing / Hop Over (~1 m kenar) |
| Robot_Kapak_Inme.fbx | Jump Down |
| Robot_Oturma_Sandalye.fbx | Sitting Idle (döngü) |
| Robot_Oturma_Yer.fbx | Sitting On Ground Idle / bağdaş (döngü) |
| Robot_Yeme.fbx | Eating (ayakta) |

## 3. öncelik (Yönetici 23:30 listesi; Müdür acil değil, bir sonraki moda kaldı)
| Dosya | Mixamo'da ara |
|---|---|
| Robot_Mudur_Oturma.fbx | Sitting / Sitting Idle (masada, döngü) |
| Robot_Mudur_ParmakVurma.fbx | Drumming Fingers / Typing |
| Robot_Mudur_Alkis.fbx | Slow Clap / Clapping |
| Robot_Mudur_Kikirdama.fbx | Chuckle / Laughing (oturarak varsa o) |
| Robot_Mudur_Sasirma.fbx | Sitting Surprised / Surprised / Startled (oturduğu yerde kapı açılınca irkilme) |
| Robot_Mudur_Olum.fbx | Sitting Death / Dying |
| Robot_Oldur_Vuran.fbx | Stabbing / Punching (eşleştirmeyi Blender Cascadeur'da yapar) |
| Robot_Oldur_Mudur.fbx | Hit Reaction (+ Sitting Death ayrı) |
| Robot_Uyanis.fbx | Waking Up / Getting Up / Stand Up (yataktan kalkış, kısa) |
