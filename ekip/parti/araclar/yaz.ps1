param([string]$Ad, [string]$Pozlar)
$ErrorActionPreference = 'Stop'
$sp = $PSScriptRoot
. "$sp/yukle.ps1"
$hedef = "C:/Users/Minkex/Desktop/Minkino Games/assets/parti-ifade/$Ad"
New-Item -ItemType Directory -Force $hedef | Out-Null
foreach ($p in ($Pozlar -split ',')) {
  $boyut = [Parti]::WebpYaz("$sp/tuval/$p.png", "$hedef/$p.webp")
  "{0,-8} {1}  {2}" -f $p, $boyut, (Dogrula "$sp/tuval/$p.png" "$hedef/$p.webp")
}
