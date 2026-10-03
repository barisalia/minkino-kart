param([string]$Ayar)
# Ayı profil son işlem (köpek/tavşan standardı): boyun/omuz, kol omuz kapağı, gövde altı yuvarlak, kalça kökleri (yalnız pivot çevresi), uzak bacak kapsülü + pati
$ErrorActionPreference = 'Stop'
$sp = $PSScriptRoot; $a = Get-Content -Raw $Ayar | ConvertFrom-Json; $k = "$sp/katman/$($a.ad)"
Add-Type -AssemblyName System.Drawing
if (-not ([System.Management.Automation.PSTypeName]'Profil').Type) { Add-Type -Path "$sp/../mprofil/Profil.cs" -ReferencedAssemblies System.Drawing }
$KONR = $a.konturRenk
# 0) boyun: kafadaki iki yan kontur kırıntısı ve kolun gövde kenarı kırıntısı silinir; gövde kafanın altında yukarı uzar (kafa dönünce yarık yok); gövdenin sol ve sağ dış kontur çizgisi yol olarak çizilir (ölçülen siluet)
"BOYUN kafa sil " + [Profil]::Sil("$k/kafa.png", 'M800,1196 L828,1196 L828,1240 L800,1240 Z;M1146,1190 L1176,1190 L1176,1240 L1146,1240 Z', "$k/kafa.png")
"BOYUN kol sil " + [Profil]::Sil("$k/kol-on.png", 'M740,1190 L820,1190 L820,1345 L740,1345 Z', "$k/kol-on.png")
"BOYUN sol serit " + [Profil]::Kopyala("$k/govde.png", "$k/_kaynak.png", "png:!$k/kafa.png|M760,1186 L826,1186 L828,1262 L826,1345 L752,1345 Z", "$k/govde.png")
"BOYUN dol " + [Profil]::Doldur("$k/govde.png", "png:!$k/govde.png|M826,1110 L1160,1110 L1160,1200 L1199,1290 L826,1290 Z", 'ayi', "$k/govde.png")
"BOYUN sag cizgi " + [Profil]::Cizgi("$k/govde.png", 'M1160,1196 C1168,1216 1182,1250 1199,1292', 14, $KONR, "$k/govde.png")
# 0b) yakın kulak: kulak çokgeninin içinde kafaya düşmüş pikseller kulağa geçer (kulak dönünce dikey şerit eksik kalmaz); altındaki kafa harmonik kürkle dolar, kafa dış çizgisi (elips yayı) yalnız kulağın örttüğü yerde çizilir
$KC = 'p:640,640,640,540,655,470,700,410,760,375,830,366,900,380,945,420,968,490,970,575,935,610,900,650,860,700,800,722,720,725,670,690'
"KULAK tasi " + [Profil]::Tasi("$k/kafa.png", "$k/kulak-on.png", $KC, 'hepsi')
"KAFA kulak alti " + [Profil]::Doldur("$k/kafa.png", "png:~$k/kulak-on.png|e:995,875,376,416", 'ayikurk', "$k/kafa.png")
Copy-Item "$k/kafa.png" "$k/_t.png" -Force
[void][Profil]::Cizgi("$k/_t.png", 'M651,698 L672,650 L698,606 L730,572 L768,544 L810,523 L855,508 L905,499 L965,497', 16, $KONR, "$k/_t.png")
"KAFA kulak kontur " + [Profil]::Kopyala("$k/kafa.png", "$k/_t.png", "png:~$k/kulak-on.png|e:995,875,386,426", "$k/kafa.png")
[IO.File]::Delete("$k/_t.png")
# 1) yakın kol: gövdede kolun örttüğü yer kürkle dolar (kol değişmeden ÖNCE); sonra kolun üstü yuvarlak kapak
"GOVDE kol alti " + [Profil]::Doldur("$k/govde.png", "png:~$k/kol-on.png|M800,1150 L1040,1150 L1040,1650 L800,1650 Z", 'ayi', "$k/govde.png")
$KAPAK = 'M836,1262 C838,1228 880,1214 930,1216 C985,1218 1016,1245 1019,1292'
"KOL ust sil " + [Profil]::Sil("$k/kol-on.png", "M790,1170 L1050,1170 L1050,1292 L1019,1292 C1016,1245 985,1218 930,1216 C880,1214 838,1228 836,1262 L790,1262 Z", "$k/kol-on.png")
"KOL kapak " + [Profil]::Cizgi("$k/kol-on.png", $KAPAK, 14, $KONR, "$k/kol-on.png")
# 2) gövdenin altı: yuvarlak alt eğri; altı kürkle dolar, eğrinin altı silinir, eğri boyunca kontur
$EGRI = 'M800,1596 C840,1652 930,1678 1000,1670 C1030,1665 1050,1658 1068,1648'
$DOL = 'M770,1540 L1090,1540 L1090,1650 C1050,1662 1030,1668 1000,1674 C930,1684 840,1656 800,1600 L770,1600 Z'
"GOVDE dol " + [Profil]::Doldur("$k/govde.png", "png:!$k/govde.png|$DOL", 'ayi', "$k/govde.png")
"GOVDE sil " + [Profil]::Sil("$k/govde.png", "M770,1596 L800,1596 C840,1652 930,1678 1000,1670 C1030,1665 1050,1658 1068,1648 L1100,1646 L1100,1800 L770,1800 Z", "$k/govde.png")
"GOVDE egri " + [Profil]::Cizgi("$k/govde.png", $EGRI, 14, $KONR, "$k/govde.png")
# 3) yakın bacak: üst kök yalnız pivot (910,1665) çevresinde ve gövdenin örttüğü yerde kürkle dolar (bacak dönünce kök gövde dışına çıkmaz)
"ON kok " + [Profil]::Doldur("$k/bacak-on.png", "png:~$k/govde.png|e:910,1665,90,90", 'ayi', "$k/bacak-on.png")
# 3b) yakın pati: sağında kalan uzak pati kontur çubuğu silinir
"ON cubuk " + [Profil]::Tasi("$k/bacak-on.png", "$k/bacak-arka.png", 'M1109,1828 L1210,1828 L1210,1885 L1109,1885 Z', 'hepsi')
# 4) uzak bacak: ön bacağın ve gövdenin arkasında kapsül (uyluk + baldır) ve uzak pati: boşluklar komşu kürk renginden harmonik dolar, kontur yeni silüet boyunca (dinlenme değişmez)
$GZA = "png:~$k/bacak-on.png+~$k/govde.png"
$BZA = "$GZA|M990,1560 L1280,1560 L1280,1930 L990,1930 Z"
$za = [Profil]::Zarf(1100, 1640, 52, '1015,1745 1030,1785 1140,1785 1139,1735 1168,1612')
$zt = [Profil]::Zarf(1150, 1815, 42, '1062,1805 1070,1845 1214,1812 1208,1850 1100,1856')
"ARKA sil " + [Profil]::Sil("$k/bacak-arka.png", "$BZA", "$k/bacak-arka.png")
"ARKA dol " + [Profil]::Doldur("$k/bacak-arka.png", "png:!$k/bacak-arka.png|$za;$zt", 'ayi', "$k/bacak-arka.png")
"ARKA kok " + [Profil]::Kok("$k/bacak-arka.png", "$za;$zt", $BZA, 14, $KONR, "$k/bacak-arka.png")
