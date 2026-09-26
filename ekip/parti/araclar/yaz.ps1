param([string]$Ad, [string]$Pozlar, [switch]$Kayipsiz)
# Tuvaldeki PNG'leri assets/parti-ifade/<ad>/<poz>.webp olarak yazar.
# Varsayılan: sharp ile kayıplı (quality 88, alphaQuality 100; ~30 KB). -Kayipsiz: kendi VP8L kodlayıcı (Node yoksa).
$ErrorActionPreference = 'Stop'
$sp = $PSScriptRoot
$proje = 'C:/Users/Minkex/Desktop/Minkino Games'
$hedef = "$proje/assets/parti-ifade/$Ad"
New-Item -ItemType Directory -Force $hedef | Out-Null
$env:Path = [Environment]::GetEnvironmentVariable('Path', 'Machine') + ';' + [Environment]::GetEnvironmentVariable('Path', 'User')
if ($Kayipsiz) { . "$sp/yukle.ps1" }
foreach ($p in ($Pozlar -split ',')) {
  $girdi = "$sp/tuval/$p.png"; $cikti = "$hedef/$p.webp"
  if ($Kayipsiz) {
    $boyut = [Parti]::WebpYaz($girdi, $cikti)
    "{0,-10} {1}  {2}" -f $p, $boyut, (Dogrula $girdi $cikti)
  } else {
    Push-Location $proje
    node -e "require('sharp')(process.argv[1]).webp({quality:88,alphaQuality:100,effort:6}).toFile(process.argv[2]).then(i=>console.log(process.argv[3].padEnd(10), i.width+'x'+i.height, Math.round(i.size/1024)+' KB'))" $girdi $cikti $p
    Pop-Location
  }
}
