param([string]$Ayar)
# Maymun profil son işlem (köpek/ayı standardı): kulak altı kafa, boyun, kol omuz kapağı, gövde altı yuvarlak, kalça kökü, uzak bacak kapsülü + uzak pati
$ErrorActionPreference = 'Stop'
$sp = $PSScriptRoot; $a = Get-Content -Raw $Ayar | ConvertFrom-Json; $k = "$sp/katman/$($a.ad)"
Add-Type -AssemblyName System.Drawing
if (-not ([System.Management.Automation.PSTypeName]'Profil').Type) { Add-Type -Path "$sp/../mprofil/Profil.cs" -ReferencedAssemblies System.Drawing }
$KONR = $a.konturRenk
# 0) yakın kulağın altında kafa (kulak dönünce açığa çıkar): komşu kürk renginden harmonik dolgu
"KAFA kulak alti " + [Profil]::Doldur("$k/kafa.png", "png:~$k/kulak-on.png", 'maymun', "$k/kafa.png")
# 1) boyun: kafanın altında gövde yukarı uzar (kafa dönünce yarık görünmez)
"BOYUN dol " + [Profil]::Doldur("$k/govde.png", "png:!$k/govde.png|M1066,1110 L1285,1110 L1291,1166 L1036,1166 Z", 'maymun', "$k/govde.png")
# 2) yakın kol: gövdede kolun örttüğü yer kürkle dolar (kol değişmeden ÖNCE); sonra kolun üstü yuvarlak kapak
"GOVDE kol alti " + [Profil]::Doldur("$k/govde.png", "png:~$k/kol-on.png|M1000,1150 L1210,1150 L1210,1700 L1000,1700 Z", 'maymun', "$k/govde.png")
$KAPAK = 'M1040,1278 C1042,1228 1085,1208 1112,1210 C1150,1212 1172,1236 1173,1268'
"KOL ust sil " + [Profil]::Sil("$k/kol-on.png", "M990,1150 L1210,1150 L1210,1268 L1173,1268 C1172,1236 1150,1212 1112,1210 C1085,1208 1042,1228 1040,1278 L990,1278 Z", "$k/kol-on.png")
"KOL kapak " + [Profil]::Cizgi("$k/kol-on.png", $KAPAK, 14, $KONR, "$k/kol-on.png")
# 3) gövdenin altı: yuvarlak alt eğri (sağda mevcut kontura bağlanır); altı kürkle dolar, eğrinin altı silinir, eğri boyunca kontur
$EGRI = 'M1300,1618 L1244,1648 L1206,1656 C1160,1696 1062,1704 1010,1650'
$DOL = 'M990,1540 L1310,1540 L1310,1616 L1244,1646 L1206,1654 C1160,1694 1062,1702 1010,1648 L990,1648 Z'
"GOVDE dol " + [Profil]::Doldur("$k/govde.png", "png:!$k/govde.png|$DOL", 'maymun', "$k/govde.png")
"GOVDE sil " + [Profil]::Sil("$k/govde.png", "M980,1646 L1010,1648 C1062,1702 1160,1694 1206,1654 L1244,1646 L1310,1616 L1320,1616 L1320,1900 L980,1900 Z", "$k/govde.png")
"GOVDE egri " + [Profil]::Cizgi("$k/govde.png", $EGRI, 14, $KONR, "$k/govde.png")
# 4) yakın bacak: yuvarlak kalça kökü (zarf + kontur; gövdenin arkasında, bacak dönünce kalça kontürlü görünür)
$zo = [Profil]::Zarf(1112, 1650, 92, '1031,1706 1198,1706')   # bacağın ölçülen dış kenarlarının İÇİNDE (sol 1009→1027, sağ 1215→1203 arası), dinlenmede görünen alan değişmesin
"ON kok " + [Profil]::Kok("$k/bacak-on.png", $zo, 'M980,1480 L1240,1480 L1240,1706 L980,1706 Z', 14, $KONR, "$k/bacak-on.png")
# 4b) kuyruk kökünde gövdede kalan iki kontur kırıntısı kuyruğa geçer
"KUYRUK kirinti1 " + [Profil]::Tasi("$k/govde.png", "$k/kuyruk.png", 'M904,1506 L936,1506 L934,1534 L904,1534 Z', 'hepsi')
"KUYRUK kirinti2 " + [Profil]::Tasi("$k/govde.png", "$k/kuyruk.png", 'M930,1581 L947,1581 L947,1600 L930,1600 Z', 'hepsi')
# 5) uzak bacak: ön bacağın ve gövdenin arkasında TEK kapsül (kalça diski + baldır + yuvarlak pati); yalnız gizli yerde değişir (dinlenme değişmez). Üst yarı kürk, alt (pati) ten rengi; kontur yeni silüet boyunca
$GZA = "png:~$k/bacak-on.png+~$k/govde.png"
$BZA = "$GZA|M1190,1580 L1400,1580 L1400,1900 L1190,1900 Z"
$zk = [Profil]::Zarf(1252, 1668, 46, '1194,1700 1184,1745 1176,1780 1190,1812 1198,1840 1206,1854 1224,1862 1250,1864 1290,1864 1372,1857 1381,1832 1342,1792 1300,1700')
Copy-Item "$k/bacak-arka.png" "$k/_t.png" -Force
[void][Profil]::Sil("$k/bacak-arka.png", "$BZA", "$k/bacak-arka.png")
[void][Profil]::Boya("$k/_t.png", $zk, '#DE7430', "$k/_t.png")
[void][Profil]::Boya("$k/_t.png", "M1180,1790 L1300,1788 L1384,1806 L1384,1880 L1180,1880 Z", '#FCC08E', "$k/_t.png")
"ARKA dol " + [Profil]::AltinaKopyala("$k/bacak-arka.png", "$k/_t.png", "$GZA|$zk", "$k/bacak-arka.png")
[IO.File]::Delete("$k/_t.png")
"ARKA kok " + [Profil]::Kok("$k/bacak-arka.png", $zk, $BZA, 14, $KONR, "$k/bacak-arka.png")
