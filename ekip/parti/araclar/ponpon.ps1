param([string]$Ad, [string]$Poz, [string]$Kutu, [int]$R = 18)
# Tüylü ponponun zeminle silinen göbeğini geri koyar. Kutu: ponponu çevreleyen x0,y0,x1,y1 (kaynak pikseli)
$sp = $PSScriptRoot
. "$sp/yukle.ps1"
$k = $Kutu -split ',' | ForEach-Object { [int]$_ }
[Parti]::GeriKoy("$sp/$Ad-$Poz-seffaf.png", "C:/Users/Minkex/Desktop/minkino-parti-gemini/ekip/gemini/parti/$Ad/$Poz.png", $k[0], $k[1], $k[2], $k[3], $R)
