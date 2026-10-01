# Turntable kaynaklarını "[16 Colors]" izle vektöre çevirir: cikti/turntable/<ad>-temiz16.ai (Illustrator açık olmalı, giriş yapılmış)
# Kullanım: powershell -File ekip/illustrator/turntable-hazirla.ps1 anne ayi inek ...
param([string[]]$Adlar = @('anne', 'ayi', 'inek', 'maymun', 'kus', 'kopek', 'tavsan', 'ordek'))
$root = 'C:/Users/Minkex/Desktop/Minkino Games'
$ai = New-Object -ComObject Illustrator.Application
$jsx = (Get-Content -Raw -Encoding utf8 "$root/ekip/illustrator/vektorlestir-maske.jsx").Replace('[High Fidelity Photo]', '[16 Colors]')
foreach ($ad in $Adlar) {
  $m = node "$root/ekip/illustrator/zemin-maske.cjs" "$root/ekip/adobe-yanci/girdi/turntable/$ad-on.png"
  $g = "$root/ekip/adobe-yanci/girdi/turntable/$ad-on-beyaz.png"; $c = "$root/ekip/adobe-yanci/cikti/turntable/$ad-temiz16.ai"
  $s = $ai.DoJavaScript("var GIRDI='$g'; var CIKTI='$c'; var MASKE='$m'; " + $jsx)
  $ai.DoJavaScript("app.activeDocument.close(SaveOptions.SAVECHANGES); 'kapandi'") | Out-Null
  "$ad -> $s"
}
