param([string]$Ad, [string]$Pozlar, [int]$R = 110, [int]$G = 75, [int]$B = 65, [int]$Yn = 3, [int]$Yp = 9, [string]$NormalKutu = '0,60,300,260', [string]$PozKutu = '600,380,1450,900')
# Kahverengi gözbebekleri için gevşek eşikli ölçüm, yüz kutusu içinde
$sp = $PSScriptRoot
. "$sp/yukle.ps1"
$nk = $NormalKutu -split ',' | ForEach-Object { [int]$_ }; $pk = $PozKutu -split ',' | ForEach-Object { [int]$_ }
"== normal"; [Parti]::KoyuMerkezler("$sp/$Ad-normal.png", $Yn, 0.9, $nk[0], $nk[1], $nk[2], $nk[3], $R, $G, $B)
foreach ($p in ($Pozlar -split ',')) { "== $p"; [Parti]::KoyuMerkezler("$sp/$Ad-$p-seffaf.png", $Yp, 0.9, $pk[0], $pk[1], $pk[2], $pk[3], $R, $G, $B) }
