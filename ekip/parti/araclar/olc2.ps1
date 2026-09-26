param([string]$Ad, [string]$Pozlar, [int]$GozYaricapNormal = 3, [int]$GozYaricapPoz = 12)
# normal + pozlar: gözbebeği merkezleri, sınır kutusu ve göz hizasında kafa eni (merkezden sola/sağa ilk saydam piksel)
$sp = $PSScriptRoot
. "$sp/yukle.ps1"
function KafaEn([string]$png, [int]$y, [int]$x) {
  $r = [Rgba]::Oku($png); $sol = $x; while ($sol -gt 0 -and $r.P[($y * $r.W + $sol) * 4 + 3] -gt 40) { $sol-- }
  $sag = $x; while ($sag -lt $r.W - 1 -and $r.P[($y * $r.W + $sag) * 4 + 3] -gt 40) { $sag++ }
  return "$sol-$sag ($($sag - $sol))"
}
"== normal"; [Parti]::KoyuMerkezler("$sp/$Ad-normal.png", $GozYaricapNormal, 0.95, 0, 0, 10000, 280)
foreach ($p in ($Pozlar -split ',')) { "== $p"; [Parti]::KoyuMerkezler("$sp/$Ad-$p-seffaf.png", $GozYaricapPoz, 0.95, 0, 0, 2047, 1000) }
