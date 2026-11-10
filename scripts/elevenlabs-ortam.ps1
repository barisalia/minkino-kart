# Dot-source ile kullanin: . ./scripts/elevenlabs-ortam.ps1
# Anahtari yazdirmaz; yalniz bu surecin ve onun baslattigi islemlerin ortamina alir.
param([string]$AnahtarDosyasi = (Join-Path ([Environment]::GetFolderPath('Desktop')) 'api key elevenlabs.txt'))
$elevenMetin = (Get-Content -LiteralPath $AnahtarDosyasi -Raw -ErrorAction Stop).Trim()
$elevenEslesme = [regex]::Match($elevenMetin, 'sk_[A-Za-z0-9_-]+')
$env:ELEVENLABS_API_KEY = if ($elevenEslesme.Success) { $elevenEslesme.Value } else { $elevenMetin }
if (-not $env:ELEVENLABS_API_KEY) { throw 'ElevenLabs anahtar dosyasi bos.' }
Remove-Variable elevenMetin, elevenEslesme
