param([string]$Ad)
# assets/parti/<ad>.webp → <ad>-normal.png (kenar halesi temizlenmiş)
$sp = $PSScriptRoot
. "$sp/yukle.ps1"
& "$sp/webp-oku.ps1" -Girdi "C:/Users/Minkex/Desktop/Minkino Games/assets/parti/$Ad.webp" -Cikti "$sp/$Ad-normal-ham.png"
[Parti]::KenarTemizle("$sp/$Ad-normal-ham.png", "$sp/$Ad-normal.png")
