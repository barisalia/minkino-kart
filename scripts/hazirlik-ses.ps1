# Hadi Hazırlanalım için "Kino Karanlıktan Korkmuyor Ki" bölümündeki ses ayarları.
# Anahtar scripts/elevenlabs-ortam.ps1 ile aynı PowerShell işlemine yüklenir.
param([string[]]$Replik)
$ErrorActionPreference = 'Stop'
$kok = Split-Path -Parent $PSScriptRoot
$oyuncular = Get-Content -Raw -Encoding utf8 (Join-Path $kok 'content/film2/sesler.json') | ConvertFrom-Json
$sozler = [ordered]@{
  basla = '[happy] Hadi hazırlanalım! Bugün hangisini giysem?'
  mutfak = '[curious] Sandviçimin içine ne koyalım?'
  kutu = '[happy] Sandviçim hazır! Yanına bir de meyve seçelim.'
  matara = '[happy] Bir de suyumu alayım. Mataramı dolduralım!'
  canta = 'Beslenme kutum çantama tam sığar.'
  aski = '[excited] İşte okulum! Yıldızlı askı benim.'
  sofra = '[curious] Karnım acıktı. Bakalım ne hazırlamıştık?'
  son = '[happy] Mmm! Bunu biz yaptık. Ellerine sağlık!'
  topla = 'Birazı da sonraya kalsın. Kutuma koyalım.'
  ders = '[warmly] Hoş geldiniz çocuklar! Bugün defterimize bir balon çizelim. Kino, defterini açar mısın?'
  cizgi = 'Önce balonun ipini çizelim. Parmağını kâğıda koy, aşağı doğru bir çizgi çek.'
  yuvarlak = 'Şimdi ipin ucuna bir yuvarlak çiz. Dön, dolaş, başladığın yere gel!'
  balon = '[happy] İşte benim balonum!'
  buyume_tohum = 'Bu ayçiçeği nasıl büyümüş? Önce tohumun olduğu saksıyı bul. Sonra nasıl değiştiğini sırayla göster.'
  buyume_filiz = 'Tohum toprakta. Şimdi iki küçük yaprağı olan filizi bul.'
  buyume_cicek = 'Filiz büyüdü. Şimdi çiçek açmış saksıyı bul.'
  buyume_tekrar = 'Bir daha bakalım. Önce tohum, sonra filiz, en son çiçek.'
  buyume_kesfet = 'Kino, bu saksının resimlerini farklı günlerde çekmiş. Sence hangisini ilk gün çekti? En eskiden en yeniye dizelim.'
  buyume_sonraki = 'Biraz zaman geçmiş. Sence sıradaki resim hangisi?'
  buyume_ipucu = 'Koyduğun son resme bak. Bitki biraz daha büyüyünce ne değişir?'
  ritim_ikinci = 'İlk ezgiyi çaldın! Şimdi biraz daha uzun bir ezgi dinleyelim. Borazana dokun. Aynı sesi iki kez duyabilirsin.'
  mino_ritim_bitti = 'Davula iki kere vurdum. Sonra çanı çaldım!'
  say_kendin = 'Şimdi sen say. İstersen eşyalara dokunabilirsin. Hazır olunca o kadar noktası olan kartı seç.'
  say_kontrol = 'Bir daha saymak ister misin? Sayarken her eşyaya bir kez dokunabilirsin.'
  dizi_eksik = 'Bu sıradan bazı parçalar düşmüş! Sırayı gözünle takip et. Sarı boşluğa hangi parça gelmeli?'
  ritim_dinle = 'Şimdi müzik zamanı! Küçük borazana dokun ve çalgıları dinle. Sonra aynı sırayla sen çal.'
  ritim_sende = 'Şimdi senin sıran!'
  ritim_yeniden = 'O sesi bir daha dinleyelim. Borazana dokunabilirsin.'
  zip_tohum = 'Önce küçücük bir tohumdu. Bak, kocaman bir ayçiçeği oldu!'
  mino_ritim = 'Davul, marakas, çan! Birlikte çaldık!'
  mino_buyume = 'Ben küçük yaprakları tohumdan sonra koydum.'
  zip_buyume = 'Çiçek en son açıyor!'
  mino_ritim_ipucu = 'Çalgının sesini dinlerken hangisinin hareket ettiğine de bak.'
  zip_ritim_ipucu = 'Borazana dokunursan yine çalar!'
  kino_atolye = 'Ayçiçeğinin nasıl büyüdüğünü buldum. Sonra arkadaşlarımla müzik yaptım!'
  sec_meyve = 'Meyve sepetimizi açalım. Hangi meyveyi saymak istersin?'
  sec_muzik = 'Müzik köşesindeyiz. Masaya hangi çalgıyı koyalım?'
  sec_kalemlik = 'Kalemliğime bakın çocuklar! Saymak için bir eşya seç.'
  say_dokun = 'Her birine sırayla dokunalım. Birlikte sayalım.'
  kac = 'Kaç tane saydın? Aynı sayıda noktası olan kartı göster.'
  say_yeniden = 'Gel, nesnelerin altındaki noktalarla kartın noktalarını bir daha karşılaştıralım.'
  say_1 = 'Bir.'
  say_2 = 'İki.'
  say_3 = 'Üç.'
  say_4 = 'Dört.'
  bul_yuvarlak = 'Tahtaya bir çember çizdim. Kenarı yuvarlak olan üç eşyayı bulabilir misin?'
  bul_ucgen = 'Bu bir üçgen. Üç köşesi var. Masada üçgene benzeyen üç eşyayı bulalım.'
  bul_kare = 'Bu bir kare. Dört kenarı da aynı boyda. Kareye benzeyen üç eşyayı göster.'
  tekrar_yuvarlak = 'Parmağını kenarında gezdir. Bir köşeye geldin mi? Köşesi olmayanı arıyoruz.'
  tekrar_ucgen = 'Üç köşe arıyoruz. Tahtadaki üçgenin kenarlarına bak.'
  tekrar_kare = 'Dört kenarı aynı boyda olan şekli arıyoruz. Tahtadaki kareye bak.'
  ciz_ucgen = 'Şimdi defterini aç. Üç çizgiyi birleştirip bir üçgen çatı çizelim.'
  ciz_kare = 'Çatımız hazırdı. Altına dört kenarlı bir ev çizelim. Köşeleri birleştir.'
  dizi_bahce = 'Mino çiçekleri dizmiş. Bir lale, bir papatya. Boş yerlere hangi çiçekler gelir?'
  dizi_deniz = 'Bu kez deniz kabuğu, denizyıldızı, burgulu kabuk. Sırayı sen devam ettir.'
  dizi_orman = 'İki yaprak, bir palamut. İki yaprak, bir palamut. Şimdi sıra sende.'
  dizi_tekrar = 'En başa bak. Hangi resimler birlikte tekrar ediyor? Boş yere geleni seç.'
  mino_say = 'Ben saydıklarıma birer nokta koyuyorum. Böylece iki kere saymıyorum!'
  mino_bul = 'Ben önce kenarlarına bakıyorum. Tahtadaki şekle benziyor mu?'
  mino_dizi = 'İlk resimleri parmağımla takip ediyorum. Sonra aynı sırayı tekrar ediyorum.'
  zip_dogru = 'Buldun! Şimdi sıra bende mi, öğretmenim?'
  mino_meyve = 'Ben de iki tane saydım! Bir, iki.'
  zip_yuvarlak = 'Saat, düğme, tekerlek! Üçü de yuvarlak!'
  mino_bahce = 'Laleden sonra papatya geliyor. Sonra yine lale!'
  zip_muzik = 'Ben de üç tane saydım öğretmenim! Bir, iki, üç!'
  mino_ucgen = 'Çatının üç köşesi var. Parmağımla üçünü de buldum!'
  zip_deniz = 'Deniz tarağı, denizyıldızı, burgulu kabuk! Sırayı buldum!'
  mino_kalemlik = 'Dört tane! Her birine bir kez dokundum.'
  zip_kare = 'Kare evin üstüne üçgen çatı! Ben de böyle bir ev çizeceğim.'
  mino_orman = 'İki yaprağın arkasından bir palamut geliyor. Tamamladık!'
  kino_ev = 'Şimdi defterdeki evime bak! Önce çatısını, sonra duvarlarını çizdim.'
  zip_say = 'Ben de sayıyorum! Aynı eşyaya iki kere dokunmayalım.'
  zip_bul = 'Şu köşelere bak! Tahtadaki şekle benzeyenleri arıyoruz.'
  zip_dizi = 'En baştakileri aklımda tuttum. Şimdi sıra hangisinde?'
  mino_dogru = 'Ben de aynı cevabı buldum!'
  kino_son = 'Balonumu da evimi de defterime ben çizdim!'
  son_ders = 'Bugün saydık, şekilleri bulduk ve sıraları tamamladık. Haydi defterimize bakalım.'
  atolye_son = 'Bugün bir tohumun nasıl büyüdüğünü keşfettik. Birlikte müzik de yaptık. Haydi defterimize bakalım.'
  defter_harf = 'Mino için bir kart hazırlayalım. Adı M sesiyle başlıyor. Yeşil noktadan başla. Yukarı çık, ortaya in, tekrar yukarı çık ve aşağı in. İstersen kalemini kaldırabilirsin.'
  defter_resim = 'Şimdi kartına bir bahçe çizelim. Bahçende ne olsun? Bir çiçek, bir güneş, belki de bir uğur böceği! Bitirince yeşil oka dokun.'
  mino_harf = 'Benim adımın ilk harfi! Bak, ortasında küçük bir çukur var.'
  zip_harf = 'Ben parmağımla noktaların üzerinden geçiyorum!'
  mino_resim = 'Bahçende ne var, çok merak ediyorum!'
  zip_resim = 'Ben bahçeme kocaman bir güneş çizerdim!'
  defter_kapanis = 'Kartın hazır! Solda yazdığın harf, sağda çizdiğin bahçe var. Şimdi yeşil oka dokun. Sınıf panosu için resim yapacağız.'
  pano_basla = 'Çocuklar, herkes balon şenliği için bir resim çizsin! İki balon çizin. İçlerini farklı renklere boyayın. İkisine de birer ip çizin. Bunları yapanın resmini sınıf panosuna asacağım. Hazır olunca yeşil oka dokunun.'
  pano_ciz = 'Kalemle iki balon çiz. Çizgiyi başladığın yerde birleştir. İplerini de ekle.'
  pano_boya = 'Bir renk seç. Fırçayı gezdirerek boya. İstersen kovayla balonun içine dokunup doldurabilirsin.'
  pano_acik = 'Boya dışarı taşabilir. Kalemle balonun çevresindeki açıklığı kapat, sonra içine dokun.'
  pano_dolu = 'Kâğıdında pek çok çizgi var. Öğretmenine gösterebilirsin. Bir yeri değiştirmek istersen geri okuna dokun.'
  pano_sekil = 'Resmin henüz panoya hazır değil. İki balon arıyorum. Kalemi alıp iki kapalı balon çiz. İstersen noktalı örneği açabilirsin.'
  pano_eksik_boya = 'Balonları buldum. İkisinin içini de boyayalım. İstersen kovayı seç, sonra balonun içine dokun.'
  pano_ayni = 'İki balon da boyalı. Panomuz için renkleri farklı olacaktı. Başka bir renk seçip birini değiştirebilirsin.'
  pano_ip = 'Renkler tamam! İki balonu da tutabilmek için altlarına birer ip gerekiyor. Kalemle eksik ipi ekleyebilirsin.'
  pano_kazandi = 'İşte iki farklı renkte balon, ikisinin de ipi var! Kino, balon şenliğinin kazananı sensin. Senin resmini sınıf panomuza asıyorum.'
  pano_diger = "Bugün panoya Mino’nun resmini astım. İki balonu farklı renklerde ve ikisinin de ipi var. Senin resmin masanda duruyor."
  mino_pano = 'Ben balonlarıma iki ayrı renk seçtim. Bakalım sen hangi renkleri seçeceksin?'
  zip_pano = 'Benim balonum uçmasın! Altına kıvrıla kıvrıla giden bir ip çizdim.'
  kino_kart = 'Mino, bu kart senin için! Baş harfini yazdım, yanına da bir bahçe çizdim.'
  defter_harf_bitti = 'M harfin hazır! Yeşil oka dokun, kartın öbür sayfasına geçelim.'
  dinle = 'Hazır mısınız çocuklar? Bugün biraz sayacağız, biraz da şekillerle çizeceğiz.'
  balondan_sonra = 'Resmin hazır, Kino. Şimdi meyvelerimizi sayalım. Hazırsan oka dokun.'
  dogru_iki = 'Evet, iki tane!'
  dogru_uc = 'Evet, üç tane!'
  dogru_dort = 'Evet, dört tane!'
  ciz_yeniden = 'Bir kenar daha var. Noktaları takip ederek kaldığın yerden devam edebilirsin.'
}
if (!$env:ELEVENLABS_API_KEY) { throw 'ELEVENLABS_API_KEY gerekli.' }
$hedef = Join-Path $kok 'assets/hazirlik/ses'
$gecici = New-TemporaryFile
try {
  $kitapSes = Get-Content -Raw -Encoding utf8 (Join-Path $kok 'content/kitap-ses.json') | ConvertFrom-Json
  $kayitlar = @{}
  $secili = if ($Replik) { $Replik } else { $sozler.Keys }
  foreach ($ad in $secili) {
    if (!$sozler.Contains($ad)) { throw "Bilinmeyen replik: $ad" }
    $rol = if ($ad -like 'mino_*') { 'mino' }
      elseif ($ad -like 'zip_*') { 'zipzip' }
      elseif ($ad -like 'kino_*' -or $ad -in @('basla','mutfak','kutu','matara','canta','aski','sofra','son','topla','balon')) { 'kino' }
      else { $kitapSes.kimler.ogretmen.ses }
    $adres = 'https://api.elevenlabs.io/v1/text-to-speech/' + $oyuncular.sesler.$rol + '/with-timestamps?output_format=mp3_44100_128'
    $istek = @{
      text = $sozler[$ad]
      model_id = 'eleven_v4'
      language_code = 'tr'
      voice_settings = @{ stability=0.5; similarity_boost=0.8; style=0.4; use_speaker_boost=$true }
    } | ConvertTo-Json -Compress
    $yanit = Invoke-RestMethod -Method Post -Uri $adres -Headers @{'xi-api-key'=$env:ELEVENLABS_API_KEY} -ContentType 'application/json; charset=utf-8' -Body ([Text.Encoding]::UTF8.GetBytes($istek))
    $veri = [Convert]::FromBase64String($yanit.audio_base64)
    if ($veri.Length -lt 5000 -or !$yanit.alignment.character_end_times_seconds) { throw "$ad kaydı eksik." }
    $kayitlar[$ad] = $veri
    Write-Output "$ad hazır"
  }
  foreach ($ad in $secili) {
    [IO.File]::WriteAllBytes($gecici.FullName, $kayitlar[$ad])
    [IO.File]::Copy($gecici.FullName, (Join-Path $hedef "$ad.mp3"), $true)
  }
} finally {
  Remove-Item -LiteralPath $gecici.FullName
}
