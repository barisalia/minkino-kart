# Hayvan yan profil iskeleti hattı (ayı, maymun, inek, kuş; köpek/tavşan/ördek standardı)

Kaynak: Gemini yan çizimleri (`minkino-film-gemini/hayvan-yan/<ad>-yan.png`, 2048 tuval, şeffaf). Bu klasördeki betikler Windows PowerShell + .NET (System.Drawing) + Node (sharp, playwright) ile çalışır; **Illustrator gerekmez**.
Çalışma klasörü olarak `scratchpad/musteri/` düzeni varsayılır (kaynaklar `../hyan/`, `../mprofil/Profil.cs`); dosyaları orada toplayıp çalıştırın.

- `iskelet.ps1 -Ayar <ad>-profil.json`: Rig.cs ile parçalama (dinlenme farkı 0 hedeftir); `<ad>-ayar.cjs` JSON'u üretir (ölçülen siluet/kontur çokgenleri, pivotlar).
- `<ad>-profil-son.ps1`: Profil.cs ile onarım (kol omuz kapağı, gövde altı, kalça başlığı, uzak bacak kapsülü, boyun/kulak altı dolgusu); `Profil.cs` içinde hayvana özel renk süzgeçleri: ayi, ayikurk, maymun, inek, kus.
- `<ad>-calistir.ps1 [-Iskelet] [-Hedef <klasör>]`: iskelet + son işlem + `teslim.ps1` (SVG/JSON/önizleme); varsayılan hedef `ekip/pazar-musteri/taslak` (taslakta `ekip/film/cizim` json'u silinir). Gerçek teslim: `-Hedef ekip/pazar-musteri`, sonra `node scripts/karakter/iskelet-al.mjs`.
- `poz.cjs <svg> <json> <çıkış.png> "<pozlar>" "<viewBox>" <yükseklik> <zemin>`: pozları büyük çizer. Pozlar: `dinlenme|evre-1|evre-3|kulak|kuyruk` hazır, özel poz `ad:katman=açı;katman=açı`.
- `kirp-izgara.cjs <png> x y w h ölçek <çıkış>`: koordinat ızgaralı büyütme (çokgenleri ölçmek için).
- `turntable-yan-degistir.cjs`: ekip/turntable/<ad>/yan.png'yi Gemini profiliyle değiştirir, önizlemeyi yeniler.

Tuzaklar: `iskelet.ps1` yeniden çalıştırılınca elle düzeltmeler silinir → her zaman `-Iskelet` ile baştan (son işlem betiği her şeyi yeniden uygular). `Doldur` mask'ındaki piksellerin ÜSTÜNE yazar; yalnız boşluğu doldurmak için `png:!<katman>|<çokgen>` kullan. `Kok` (kontur çizen) kalça başlığında köpek zarfı ile dinlenmede taşma yapabilir: zarfı bacağın ölçülen kenarlarının İÇİNDE tut.
