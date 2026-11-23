# Matematik Atölyesi · Ceren Öğretmen replikleri (Aşama 1: Sayılar 1–10).
# Metinler: matematik/src/ceren-sozler.json (kod ve denetim betiği de oradan okur).
# Ceren'in sesi kitaplardaki öğretmen sesi (content/kitap-ses.json → ogretmen).
# Her replik ayrı istek (KULLANICI-KURALLARI: ElevenLabs'ta replik uzunluğu).
# Kullanım (aynı PowerShell işleminde):  . ./scripts/elevenlabs-ortam.ps1; ./scripts/matematik-ceren-ses.ps1 [-Replik ad1,ad2] [-Liste]
#   -Liste: hiçbir şey üretmez, seçilen repliklerin metnini ve harf sayısını yazar.
#   -SozDosyasi: başka dersin söz dosyası (ör. matematik/src/ders-sekiller-sozler.json); -Cikti: kayıtların yazılacağı klasör
#   (yeni kayıtlar önce scratchpad'e üretilir, denetlenir, sonra dersin ses klasörüne tek seferde kopyalanır).
param([string[]]$Replik, [switch]$Liste, [string]$SozDosyasi = 'matematik/src/ceren-sozler.json', [string]$Cikti)
$ErrorActionPreference = 'Stop'
$kok = Split-Path -Parent $PSScriptRoot
$oyuncular = Get-Content -Raw -Encoding utf8 (Join-Path $kok 'content/film2/sesler.json') | ConvertFrom-Json
$kitapSes = Get-Content -Raw -Encoding utf8 (Join-Path $kok 'content/kitap-ses.json') | ConvertFrom-Json
$ses = $oyuncular.sesler.($kitapSes.kimler.ogretmen.ses)
# Etkin ElevenLabs hesabındaki karşılığı (18 Kasım 2026: yeni hesapta Ceren kayıtlarından kuruldu; content/elevenlabs-hesap.json)
$hesap = Join-Path $kok 'content/elevenlabs-hesap.json'
if (Test-Path $hesap) { $esleme = (Get-Content -Raw -Encoding utf8 $hesap | ConvertFrom-Json).esleme; if ($esleme.$ses) { $ses = $esleme.$ses } }
$json = Get-Content -Raw -Encoding utf8 (Join-Path $kok $SozDosyasi) | ConvertFrom-Json
$sozler = [ordered]@{}
foreach ($p in $json.PSObject.Properties) { $sozler[$p.Name] = [string]$p.Value }

$secili = if ($Replik) { $Replik } else { @($sozler.Keys) }
foreach ($ad in $secili) { if (!$sozler.Contains($ad)) { throw "Bilinmeyen replik: $ad" } }
if ($Liste) {
  $toplam = 0
  foreach ($ad in $secili) { $toplam += $sozler[$ad].Length; Write-Output ("{0,-12} {1}" -f $ad, $sozler[$ad]) }
  Write-Output "$($secili.Count) replik, $toplam harf"
  return
}
if (!$env:ELEVENLABS_API_KEY) { throw 'ELEVENLABS_API_KEY gerekli.' }
$hedef = if ($Cikti) { $Cikti } else { Join-Path $kok 'assets/matematik/ceren/ses' }
New-Item -ItemType Directory -Force $hedef | Out-Null
foreach ($ad in $secili) {
  $adres = "https://api.elevenlabs.io/v1/text-to-speech/$ses`?output_format=mp3_44100_128"
  $istek = @{
    text = $sozler[$ad]
    model_id = 'eleven_v4'
    language_code = 'tr'
    voice_settings = @{ stability=0.5; similarity_boost=0.8; style=0.4; use_speaker_boost=$true }
  } | ConvertTo-Json -Compress
  $dosya = Join-Path $hedef "$ad.mp3"
  Invoke-WebRequest -Method Post -Uri $adres -Headers @{'xi-api-key'=$env:ELEVENLABS_API_KEY} -ContentType 'application/json; charset=utf-8' -Body ([Text.Encoding]::UTF8.GetBytes($istek)) -OutFile $dosya -UseBasicParsing
  if ((Get-Item $dosya).Length -lt 3000) { throw "$ad kaydı eksik." }
  Write-Output "$ad hazır"
}
