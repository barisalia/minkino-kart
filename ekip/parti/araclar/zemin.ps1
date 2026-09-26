param([string]$Ad, [string]$Pozlar, [string]$Sil = '', [switch]$Sayfa)
# Gemini PNG'lerinin zeminini siler → <ad>-<poz>-seffaf.png
# Yalnız kenara bağlı beyaz otomatik silinir; kapalı beyaz boşluklar (göz akı, diş, ayakkabı, kol-gövde arası) korunur.
# -Sil "poz:13,14;poz2:30"  → o pozda o numaralı kapalı boşluklar (zemin olanlar) da silinir.
# -Sayfa → 600 px'ten büyük tüm kapalı boşlukları numaralı kırpımlarla <ad>-bosluklar.png olarak gösterir (karar için).
$sp = $PSScriptRoot
. "$sp/yukle.ps1"
$kaynak = "C:/Users/Minkex/Desktop/minkino-parti-gemini/ekip/gemini/parti/$Ad"
$silHarita = @{}
foreach ($parca in ($Sil -split ';')) { if ($parca -match '^(\w+):(.+)$') { $silHarita[$Matches[1]] = $Matches[2] } }
$bosluklar = @()
foreach ($p in ($Pozlar -split ',')) {
  $r = [Parti]::ZeminSil("$kaynak/$p.png", "$sp/$Ad-$p-seffaf.png", 232, 1000000000, "", [string]$silHarita[$p])
  "== $p"; $r
  foreach ($satir in ($r -split "`n")) {
    if ($satir -match 'bosluk#(\d+) alan=(\d+) kutu=(\d+),(\d+)-(\d+),(\d+)') {
      $bosluklar += , @($p, [int]$Matches[1], [int]$Matches[3], [int]$Matches[4], [int]$Matches[5], [int]$Matches[6])
    }
  }
}
if ($Sayfa -and $bosluklar.Count) {
  Add-Type -AssemblyName System.Drawing
  $k = 200; $sutun = 8; $satirSay = [Math]::Ceiling($bosluklar.Count / $sutun)
  $o = New-Object System.Drawing.Bitmap ($k * $sutun), ($k * $satirSay)
  $gr = [System.Drawing.Graphics]::FromImage($o); $gr.Clear([System.Drawing.Color]::FromArgb(40, 34, 48)); $gr.InterpolationMode = 'HighQualityBicubic'
  $kalem = New-Object System.Drawing.Pen ([System.Drawing.Color]::Magenta), 2
  $yazi = New-Object System.Drawing.Font 'Arial', 11, ([System.Drawing.FontStyle]::Bold)
  $acik = @{}
  for ($i = 0; $i -lt $bosluklar.Count; $i++) {
    $e = $bosluklar[$i]
    if (-not $acik.ContainsKey($e[0])) { $acik[$e[0]] = [System.Drawing.Image]::FromFile("$kaynak/$($e[0]).png") }
    $im = $acik[$e[0]]
    $cx = ($e[2] + $e[4]) / 2; $cy = ($e[3] + $e[5]) / 2; $r = [Math]::Max(($e[4] - $e[2]), ($e[5] - $e[3])) / 2 + 70
    $x = ($i % $sutun) * $k; $y = [Math]::Floor($i / $sutun) * $k
    $gr.DrawImage($im, (New-Object System.Drawing.RectangleF ([float]$x), ([float]$y), ([float]$k), ([float]$k)), (New-Object System.Drawing.RectangleF ([float]($cx - $r)), ([float]($cy - $r)), ([float](2 * $r)), ([float](2 * $r))), [System.Drawing.GraphicsUnit]::Pixel)
    $f = $k / (2 * $r)
    $gr.DrawRectangle($kalem, [float]($x + ($e[2] - ($cx - $r)) * $f), [float]($y + ($e[3] - ($cy - $r)) * $f), [float](($e[4] - $e[2]) * $f), [float](($e[5] - $e[3]) * $f))
    $gr.FillRectangle([System.Drawing.Brushes]::Black, [float]$x, [float]$y, 120, 18)
    $gr.DrawString("$($e[0]) #$($e[1])", $yazi, [System.Drawing.Brushes]::Yellow, [float]($x + 2), [float]($y + 1))
  }
  foreach ($im in $acik.Values) { $im.Dispose() }
  $o.Save("$sp/$Ad-bosluklar.png"); $gr.Dispose(); $o.Dispose()
  "sayfa: $sp/$Ad-bosluklar.png"
}
