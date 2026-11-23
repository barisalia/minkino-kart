# Harf Atölyesi · Hece Evleri · Ceren Öğretmen'in replikleri ve 160 hece.
# Metinler alfabe/src/hece-evleri-veri.json içinde (oyun da aynı listeyi okur).
# Ceren'in sesi kitaplardaki öğretmen sesi (content/kitap-ses.json → kimler.ogretmen.ses → content/film2/sesler.json).
# Her replik ve her hece ayrı istek (KULLANICI-KURALLARI: ElevenLabs'ta replik uzunluğu, hece oyunlarının seslendirmesi).
# Kayıtlar assets/alfabe/ses/ içine yazılır; var olan kayıt yeniden üretilmez (kredi), yenilemek için -Yeniden.
# Kullanım (aynı PowerShell işleminde, önce Barış'ın kredi onayı):
#   . ./scripts/elevenlabs-ortam.ps1; ./scripts/hece-evleri-ceren-ses.ps1 [-Replik ev-giris,ev-m-a] [-Yeniden]
#   ./scripts/hece-evleri-ceren-ses.ps1 -Liste      # istek atmaz; kayıt adlarını, metinleri ve toplam karakteri yazar
param([string[]]$Replik, [switch]$Yeniden, [switch]$Liste)
$ErrorActionPreference = 'Stop'
$kok = Split-Path -Parent $PSScriptRoot
$veri = Get-Content -Raw -Encoding utf8 (Join-Path $kok 'alfabe/src/hece-evleri-veri.json') | ConvertFrom-Json

# Dosya adları ASCII. PowerShell'in büyük-küçük harf duyarsız karşılaştırması ı ile i'yi
# aynı sayabildiği için harfler kod noktasıyla ayrılır.
function Belirtec([string]$harf) {
  switch ([int][char]$harf) {
    0x00E7 { return 'cc' }  # ç
    0x015F { return 'ss' }  # ş
    0x0131 { return 'ii' }  # ı
    0x00F6 { return 'oo' }  # ö
    0x00FC { return 'uu' }  # ü
    default { return $harf }
  }
}

$sozler = [ordered]@{}
foreach ($ozellik in $veri.sozler.PSObject.Properties) { $sozler[$ozellik.Name] = $ozellik.Value }
foreach ($unsuz in $veri.unsuzler) {
  foreach ($unlu in $veri.unluler) {
    $sozler["ev-$(Belirtec $unsuz)-$(Belirtec $unlu)"] = "$unsuz$unlu"
  }
}

# Kısaltma ya da harf adı gibi okunan heceler için yalnız seslendirmede kullanılan yazım.
foreach ($ozellik in $veri.okunus.PSObject.Properties) { if ($sozler.Contains($ozellik.Name)) { $sozler[$ozellik.Name] = $ozellik.Value } }

$secili = if ($Replik) { $Replik } else { @($sozler.Keys) }
foreach ($ad in $secili) { if (!$sozler.Contains($ad)) { throw "Bilinmeyen replik: $ad" } }

if ($Liste) {
  $toplam = 0
  foreach ($ad in $secili) { $toplam += $sozler[$ad].Length; Write-Output ("{0,-14} {1}" -f $ad, $sozler[$ad]) }
  Write-Output "$($secili.Count) kayıt, $toplam karakter."
  return
}

if (!$env:ELEVENLABS_API_KEY) { throw 'ELEVENLABS_API_KEY gerekli (. ./scripts/elevenlabs-ortam.ps1).' }
$oyuncular = Get-Content -Raw -Encoding utf8 (Join-Path $kok 'content/film2/sesler.json') | ConvertFrom-Json
$kitapSes = Get-Content -Raw -Encoding utf8 (Join-Path $kok 'content/kitap-ses.json') | ConvertFrom-Json
$ses = $oyuncular.sesler.($kitapSes.kimler.ogretmen.ses)
if (!$ses) { throw 'Ceren Öğretmen sesi bulunamadı.' }
# Etkin ElevenLabs hesabındaki karşılığı (18 Kasım 2026: yeni hesapta sesler kayıtlardan kuruldu; content/elevenlabs-hesap.json)
$hesap = Join-Path $kok 'content/elevenlabs-hesap.json'
if (Test-Path $hesap) { $esleme = (Get-Content -Raw -Encoding utf8 $hesap | ConvertFrom-Json).esleme; if ($esleme.$ses) { $ses = $esleme.$ses } }
$hedef = Join-Path $kok 'assets/alfabe/ses'
$uretilen = 0
foreach ($ad in $secili) {
  $dosya = Join-Path $hedef "$ad.mp3"
  if ((Test-Path $dosya) -and !$Yeniden) { Write-Output "$ad var, atlandı"; continue }
  $adres = "https://api.elevenlabs.io/v1/text-to-speech/$ses`?output_format=mp3_44100_128"
  $istek = @{
    text = $sozler[$ad]
    model_id = 'eleven_v4'
    language_code = 'tr'
    voice_settings = @{ stability=0.5; similarity_boost=0.8; style=0.4; use_speaker_boost=$true }
  } | ConvertTo-Json -Compress
  $gecici = "$dosya.indiriliyor"
  Invoke-WebRequest -Method Post -Uri $adres -Headers @{'xi-api-key'=$env:ELEVENLABS_API_KEY} -ContentType 'application/json; charset=utf-8' -Body ([Text.Encoding]::UTF8.GetBytes($istek)) -OutFile $gecici -UseBasicParsing
  if ((Get-Item $gecici).Length -lt 2000) { Remove-Item $gecici; throw "$ad kaydı eksik." }
  Move-Item -Force $gecici $dosya
  $uretilen++
  Write-Output "$ad hazır"
}
Write-Output "$uretilen kayıt üretildi."
