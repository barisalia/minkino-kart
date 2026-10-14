# Aile Turntable kaynaklarını düzleştirir: <ad>-tt-raster.png (aile-raster.cjs) → "16 Renk" iz → ekip/turntable/<ad>/<ad>-tt-duz.ai + kontrol PNG'si.
# Illustrator açık, BOŞ ve Dönen tabla nesnesi içeren belge AÇIK DEĞİLKEN çalıştırın (o belgede COM Illustrator'ı kilitler).
# Kullanım: powershell -File ekip/turntable/aile-duzlestir.ps1 anne baba ...
param([string[]]$Adlar = @('anne', 'baba', 'lokum', 'babaanne', 'dede'))
$root = 'C:/Users/Minkex/Desktop/Minkino Games'
$jsx = Get-Content -Raw -Encoding utf8 "$root/ekip/illustrator/vektorlestir-duz.jsx"
foreach ($ad in $Adlar) {
  $kl = "$root/ekip/turntable/$ad"
  $sat = (Get-Content -Encoding utf8 "$kl/$ad-tt-maske.txt")
  $o = $sat[0].Split(','); $maske = $sat[1]
  $on = "var GIRDI='$kl/$ad-tt-raster.png'; var CIKTI='$kl/$ad-tt-duz.ai'; var W=$($o[0]); var H=$($o[1]); var MW=$($o[2]); var MH=$($o[3]); var IZ=$($o[4]); var MASKE='$maske'; "
  $j = Start-Job -ArgumentList $on, $jsx, $kl, $ad {
    param($on, $jsx, $kl, $ad)
    $ai = New-Object -ComObject Illustrator.Application
    $s = $ai.DoJavaScript($on + $jsx)
    $ai.DoJavaScript("var d=app.activeDocument; var o=new ExportOptionsPNG24(); o.transparency=true; o.artBoardClipping=true; o.horizontalScale=50; o.verticalScale=50; d.exportFile(new File('$kl/$ad-tt-duz-kontrol.png'), ExportType.PNG24, o); d.close(SaveOptions.DONOTSAVECHANGES); 'kapandi'") | Out-Null
    $s
  }
  if (Wait-Job $j -Timeout 600) { "$ad -> $(Receive-Job $j)" } else { "$ad -> ZAMAN ASIMI"; break }
}
