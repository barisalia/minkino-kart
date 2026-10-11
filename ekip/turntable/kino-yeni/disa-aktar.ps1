# Açık Illustrator belgesini (Dönen tabla sonrası, düzenleme modu KAPALIYKEN) PNG (%200, şeffaf) ve SVG olarak dışa aktarır.
# Kullanım: powershell -File disa-aktar.ps1 -Ad yan
param([string]$Ad)
$hedef = "C:\Users\Minkex\Desktop\Minkino Games\ekip\turntable\kino-yeni"
$j = Start-Job -ArgumentList $hedef, $Ad {
  param($hedef, $Ad)
  $ai = New-Object -ComObject Illustrator.Application
  $d = $ai.ActiveDocument
  $png = New-Object -ComObject Illustrator.ExportOptionsPNG24
  $png.HorizontalScale = 200; $png.VerticalScale = 200; $png.Transparency = $true; $png.ArtBoardClipping = $true; $png.AntiAliasing = $true
  $d.Export("$hedef\kino-$Ad.png", 5, $png)
  $svg = New-Object -ComObject Illustrator.ExportOptionsSVG
  $d.Export("$hedef\kino-$Ad.svg", 3, $svg)
  "tamam $Ad"
}
if (Wait-Job $j -Timeout 120) { Receive-Job $j } else { "ZAMAN ASIMI" }
