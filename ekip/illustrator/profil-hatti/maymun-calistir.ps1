param([string]$Hedef = 'ekip/pazar-musteri/taslak', [switch]$Iskelet)
# iskelet (isteğe bağlı) + son işlem + teslim (varsayılan hedef taslak; film/cizim json'u taslakta silinir)
$sp = $PSScriptRoot
if ($Iskelet) { & "$sp/iskelet.ps1" -Ayar "$sp/maymun-profil.json" | Select-String 'DOGRULA' }
& "$sp/maymun-profil-son.ps1" -Ayar "$sp/maymun-profil.json" | Out-Null
& "$sp/teslim.ps1" -Ayar "$sp/maymun-profil.json" -Hedef $Hedef | Select-Object -Last 3
if ($Hedef -like '*taslak*') { Remove-Item 'C:/Users/Minkex/Desktop/Minkino Games/ekip/film/cizim/maymun-profil.json' -ErrorAction SilentlyContinue }
