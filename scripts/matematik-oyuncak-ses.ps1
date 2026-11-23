# Matematik Atölyesi · oyuncak sözleri (matematik/src/sozler.json → assets/matematik/ses/ses-N.mp3), Ceren Öğretmen'in sesiyle.
# Dosya adı sözün sırasıdır (ses-96.mp3 = sozler[96]); boş sözler üretilmez.
# Her söz ayrı istek (KULLANICI-KURALLARI: ElevenLabs'ta replik uzunluğu).
# Kullanım (aynı PowerShell işleminde):  . ./scripts/elevenlabs-ortam.ps1; ./scripts/matematik-oyuncak-ses.ps1 -Sira 96,97 [-Liste] [-Cikti <klasör>]
# -Cikti: kayıtları önce başka klasöre (scratchpad) yazar; denetimden sonra assets/matematik/ses/ içine tek seferde kopyalanır
# (dev sunucusunun izleyicisi yazılırken dosyayı tutup çökmesin).
param([int[]]$Sira, [switch]$Liste, [string]$Cikti)
$ErrorActionPreference = 'Stop'
$kok = Split-Path -Parent $PSScriptRoot
$oyuncular = Get-Content -Raw -Encoding utf8 (Join-Path $kok 'content/film2/sesler.json') | ConvertFrom-Json
$kitapSes = Get-Content -Raw -Encoding utf8 (Join-Path $kok 'content/kitap-ses.json') | ConvertFrom-Json
$ses = $oyuncular.sesler.($kitapSes.kimler.ogretmen.ses)
if (!$ses) { throw 'Ceren Öğretmen sesi bulunamadı.' }
# Etkin ElevenLabs hesabındaki karşılığı (18 Kasım 2026: yeni hesapta Ceren kayıtlarından kuruldu; content/elevenlabs-hesap.json)
$hesap = Join-Path $kok 'content/elevenlabs-hesap.json'
if (Test-Path $hesap) { $esleme = (Get-Content -Raw -Encoding utf8 $hesap | ConvertFrom-Json).esleme; if ($esleme.$ses) { $ses = $esleme.$ses } }
$sozler = Get-Content -Raw -Encoding utf8 (Join-Path $kok 'matematik/src/sozler.json') | ConvertFrom-Json
if (!$Sira) { throw 'Üretilecek sözlerin sırası gerekli (-Sira 96,97).' }
foreach ($i in $Sira) { if ($i -lt 0 -or $i -ge $sozler.Count -or !$sozler[$i]) { throw "Boş ya da olmayan söz: $i" } }
if ($Liste) {
  foreach ($i in $Sira) { Write-Output ("{0,-4} {1}" -f $i, $sozler[$i]) }
  return
}
if (!$env:ELEVENLABS_API_KEY) { throw 'ELEVENLABS_API_KEY gerekli.' }
$hedef = if ($Cikti) { New-Item -ItemType Directory -Force $Cikti | Out-Null; $Cikti } else { Join-Path $kok 'assets/matematik/ses' }
foreach ($i in $Sira) {
  $adres = "https://api.elevenlabs.io/v1/text-to-speech/$ses`?output_format=mp3_44100_128"
  $istek = @{
    text = [string]$sozler[$i]
    model_id = 'eleven_v4'
    language_code = 'tr'
    voice_settings = @{ stability=0.5; similarity_boost=0.8; style=0.4; use_speaker_boost=$true }
  } | ConvertTo-Json -Compress
  $dosya = Join-Path $hedef "ses-$i.mp3"
  Invoke-WebRequest -Method Post -Uri $adres -Headers @{'xi-api-key'=$env:ELEVENLABS_API_KEY} -ContentType 'application/json; charset=utf-8' -Body ([Text.Encoding]::UTF8.GetBytes($istek)) -OutFile $dosya -UseBasicParsing
  if ((Get-Item $dosya).Length -lt 3000) { throw "ses-$i kaydı eksik." }
  Write-Output "ses-$i hazır"
}
