param([string]$Ayar)
# İnek profil son işlem (köpek/ayı/maymun standardı): boyun, kol omuz kapağı, gövde altı yuvarlak, ön bacak kalça başlığı, uzak bacak kapsülü
$ErrorActionPreference = 'Stop'
$sp = $PSScriptRoot; $a = Get-Content -Raw $Ayar | ConvertFrom-Json; $k = "$sp/katman/$($a.ad)"
Add-Type -AssemblyName System.Drawing
if (-not ([System.Management.Automation.PSTypeName]'Profil').Type) { Add-Type -Path "$sp/../mprofil/Profil.cs" -ReferencedAssemblies System.Drawing }
$KONR = $a.konturRenk
# 1) boyun: kafanın altında gövde yukarı uzar (kafa dönünce yarık görünmez)
"BOYUN dol " + [Profil]::Doldur("$k/govde.png", "png:!$k/govde.png|M912,1044 L1285,1062 L1290,1112 L1150,1102 L1000,1076 L912,1064 Z", 'inek', "$k/govde.png")
# 2) yakın kol: gövdede kolun örttüğü yer dolar (kol değişmeden ÖNCE); sonra kolun üstü yuvarlak kapak
"GOVDE kol alti " + [Profil]::Doldur("$k/govde.png", "png:~$k/kol-on.png|M920,1100 L1160,1100 L1160,1600 L920,1600 Z", 'inek', "$k/govde.png")
$KAPAK = 'M958,1215 C960,1160 1010,1132 1050,1132 C1100,1134 1130,1165 1128,1215'
"KOL ust sil " + [Profil]::Sil("$k/kol-on.png", "M930,1100 L1160,1100 L1160,1215 L1128,1215 C1130,1165 1100,1134 1050,1132 C1010,1132 960,1160 958,1215 L930,1215 Z", "$k/kol-on.png")
"KOL kapak " + [Profil]::Cizgi("$k/kol-on.png", $KAPAK, 12, $KONR, "$k/kol-on.png")
# 3) gövdenin altı: yuvarlak alt eğri (sağda mevcut kontura bağlanır)
$EGRI = 'M900,1632 C945,1668 1045,1678 1146,1656'
$DOL = 'M880,1540 L1150,1540 L1150,1656 C1045,1680 945,1670 900,1634 L880,1634 Z'
"GOVDE dol " + [Profil]::Doldur("$k/govde.png", "png:!$k/govde.png|$DOL", 'inek', "$k/govde.png")
# (gövde alt konturu yok: orijinalde ön bacak gövdeyle çizgisiz birleşik; çizgi çizilirse dinlenmede bacak üstünden geçer)
# 4) yakın bacak: yuvarlak kalça başlığı (bacağın dış kenarlarının İÇİNDE; dinlenmede görünen alan değişmez)
$zo = [Profil]::Zarf(1032, 1650, 90, '942,1706 1120,1706')
"ON kok " + [Profil]::Kok("$k/bacak-on.png", $zo, 'M900,1480 L1150,1480 L1150,1672 L900,1672 Z', 12, $KONR, "$k/bacak-on.png")
# 5) uzak bacak: ön bacağın ve gövdenin arkasında TEK kapsül (kalça diski + baldır + toynak); üst beyaz, toynak siyah
$GZA = "png:~$k/bacak-on.png+~$k/govde.png"
$BZA = "$GZA|M1090,1560 L1340,1560 L1340,1900 L1090,1900 Z"
$zk = [Profil]::Zarf(1225, 1656, 58, '1110,1700 1108,1760 1110,1830 1116,1850 1128,1864 1150,1872 1230,1874 1280,1868 1304,1850 1314,1824 1286,1790 1272,1740')
Copy-Item "$k/bacak-arka.png" "$k/_t.png" -Force
[void][Profil]::Sil("$k/bacak-arka.png", "$BZA", "$k/bacak-arka.png")
[void][Profil]::Boya("$k/_t.png", $zk, '#ECEBE7', "$k/_t.png")
[void][Profil]::Boya("$k/_t.png", "M1090,1806 L1250,1796 L1330,1812 L1330,1900 L1090,1900 Z", '#1A191D', "$k/_t.png")
"ARKA dol " + [Profil]::AltinaKopyala("$k/bacak-arka.png", "$k/_t.png", "$GZA|$zk", "$k/bacak-arka.png")
[IO.File]::Delete("$k/_t.png")
"ARKA kok " + [Profil]::Kok("$k/bacak-arka.png", $zk, $BZA, 12, $KONR, "$k/bacak-arka.png")
