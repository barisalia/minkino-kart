param([string]$Ayar)
# Genel yerleştirme: normal + pozlar ortak tuvale. Ölçek: ayak tabanı–göz hizası mesafesi normalle eşit (poz "olcek" verirse o).
# Tuval: tüm pozları 8 px payla içine alan, yüz ortasına göre simetrik en küçük kutu. Normal tam sayı kaydırılır (bulanıklık yok).
# Çıktı: tuval/<poz>.png + oyun için oran, boy ve şapka değerleri.
$ErrorActionPreference = 'Stop'
$sp = $PSScriptRoot
. "$sp/yukle.ps1"
$a = Get-Content -Raw $Ayar | ConvertFrom-Json
$ad = $a.ad
$n = $a.normal
$nAyakGoz = $n.ayak - $n.gy
$PAY = 8
# göreli uzantılar (göz ortası x ve ayak tabanına göre, tuval pikselinde)
$minX = 0.0; $maxX = 0.0; $minY = 0.0
$nr = [Rgba]::Oku("$sp/$ad-normal.png"); $nb = $nr.Sinir(8)
$minX = [Math]::Min($minX, $nb[0] - $n.gx); $maxX = [Math]::Max($maxX, $nb[2] + 1 - $n.gx); $minY = [Math]::Min($minY, $nb[1] - $n.ayak)
$olcekler = @{}
foreach ($p in $a.pozlar) {
  $s = if ($p.olcek) { [double]$p.olcek } else { $nAyakGoz / ($p.ayak - $p.gy) }
  $olcekler[$p.ad] = $s
  $r = [Rgba]::Oku("$sp/$ad-$($p.ad)-seffaf.png"); $b = $r.Sinir(8)
  $minX = [Math]::Min($minX, ($b[0] - $p.gx) * $s); $maxX = [Math]::Max($maxX, ($b[2] + 1 - $p.gx) * $s); $minY = [Math]::Min($minY, ($b[1] - $p.ayak) * $s)
}
$yari = [Math]::Ceiling([Math]::Max(-$minX, $maxX)) + $PAY
$TW = [int](2 * $yari)
$YA = [int]([Math]::Ceiling(-$minY) + $PAY)          # ayak tabanının tuvaldeki y'si
$TH = $YA + $PAY
# normal: tam sayı kaydırma; göz ortası tuval ortasına en yakın tam sayı konuma
$dx = [int][Math]::Round($yari - $n.gx); $dy = $YA - [int]$n.ayak
$XC = $n.gx + $dx
New-Item -ItemType Directory -Force "$sp/tuval" | Out-Null
Get-ChildItem "$sp/tuval" -Filter *.png | Remove-Item
[Parti]::Yerlestir("$sp/$ad-normal.png", "$sp/tuval/normal.png", $TW, $TH, 1.0, 0, 0, $dx, $dy)
foreach ($p in $a.pozlar) {
  [Parti]::Yerlestir("$sp/$ad-$($p.ad)-seffaf.png", "$sp/tuval/$($p.ad).png", $TW, $TH, $olcekler[$p.ad], $p.gx, $p.ayak, $XC, $YA)
  "{0,-11} olcek={1:N4}" -f $p.ad, $olcekler[$p.ad]
}
$eskiW = $nr.W; $eskiH = $nr.H
"TUVAL {0}x{1}  (eski {2}x{3})  normal kaydirma +{4},+{5}  goz ortasi x={6:N1} goz y={7:N1} ayak y={8}" -f $TW, $TH, $eskiW, $eskiH, $dx, $dy, $XC, ($n.gy + $dy), $YA
$boy = $a.boy * $TW / $eskiW
"OYUN: boy {0:N2} (eski {1}), oran {2}/{3}" -f $boy, $a.boy, $TW, $TH
if ($a.sapka) {
  $sx = ($a.sapka.x / 100 * $eskiW + $dx) / $TW * 100; $sy = ($a.sapka.y / 100 * $eskiH + $dy) / $TH * 100; $sw = $a.sapka.w / 100 * $eskiW / $TW * 100
  "OYUN: sapka {{ x: {0:N1}, y: {1:N1}, w: {2:N1}, d: {3} }}" -f $sx, $sy, $sw, $a.sapka.d
}
@{ TW = $TW; TH = $TH; XC = $XC; GY = $n.gy + $dy; YA = $YA } | ConvertTo-Json | Set-Content "$sp/tuval/_olcu.json"
