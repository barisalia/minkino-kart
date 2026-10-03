param([string]$Ayar)
# Kuş profil son işlem (köpek/ayı/maymun standardı): gövde kafanın ve kanadın altına uzanır, bacak üst kökleri (gövde altında), uzak ayağın gizli kısmı
$ErrorActionPreference = 'Stop'
$sp = $PSScriptRoot; $a = Get-Content -Raw $Ayar | ConvertFrom-Json; $k = "$sp/katman/$($a.ad)"
Add-Type -AssemblyName System.Drawing
if (-not ([System.Management.Automation.PSTypeName]'Profil').Type) { Add-Type -Path "$sp/../mprofil/Profil.cs" -ReferencedAssemblies System.Drawing }
$KONR = $a.konturRenk
# 1) gövde: kafanın ve kanadın altında kalan boş yer gövdenin kendi renginden (koyu mavi sırt, açık mavi karın) harmonik dolar; yalnız gövde silüetinin İÇİNDE (kanat ve kafa dönünce arkası boş görünmesin)
$GB = 'M930,915 L1300,918 L1312,950 L1318,985 L1330,1030 L1345,1100 L1345,1200 L1322,1320 L1272,1400 L1215,1462 L1140,1512 L1000,1535 L905,1500 L862,1468 L820,1420 L790,1350 L770,1250 L778,1160 L805,1100 L845,1035 L880,975 Z'
"GOVDE dol " + [Profil]::Doldur("$k/govde.png", "png:!$k/govde.png|$GB", 'kus', "$k/govde.png")
# 2) uzak ayağın yakın bacak/ayağın ve gövdenin arkasında kalan kısmı (parmaklar) bacak renginden dolar (kontur yok: ön ayak üstünden görünen kenar zaten çizili); bacak üst uçları gövde (uyluk tüyü) altında kalır, kök dolgusu yok
$zf = [Profil]::Zarf(1180, 1800, 24, '1100,1784 1106,1812 1300,1798 1304,1818')   # ayağın gerçek kalınlığı (~48 px, y 1776-1824)
$GZA = "png:~$k/bacak-on.png+~$k/govde.png"
Copy-Item "$k/bacak-arka.png" "$k/_t.png" -Force
[void][Profil]::Boya("$k/_t.png", $zf, '#E57A6C', "$k/_t.png")
"ARKA ayak dol " + [Profil]::AltinaKopyala("$k/bacak-arka.png", "$k/_t.png", "$GZA|$zf", "$k/bacak-arka.png")
[IO.File]::Delete("$k/_t.png")
