param([string]$Ad, [string]$Klasor, [string]$Cikti, [string[]]$Pozlar, [double]$GozY, [double]$AyakY)
# normal + pozlar yan yana; üst sıra açık, alt sıra koyu zemin; ayak tabanı (yeşil) ve göz hizası (mavi) kılavuzları
Add-Type -AssemblyName System.Drawing
$ilk = [System.Drawing.Image]::FromFile("$Klasor/$($Pozlar[0]).png"); $W = $ilk.Width; $H = $ilk.Height; $ilk.Dispose()
$bas = 28; $n = $Pozlar.Count
$o = New-Object System.Drawing.Bitmap ($W * $n), (($H + $bas) * 2)
$gr = [System.Drawing.Graphics]::FromImage($o)
$gr.InterpolationMode = 'HighQualityBicubic'
$acik = [System.Drawing.Color]::FromArgb(236, 232, 226); $koyu = [System.Drawing.Color]::FromArgb(40, 34, 48)
$yazi = New-Object System.Drawing.Font 'Arial', 13, ([System.Drawing.FontStyle]::Bold)
$yesil = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(200, 40, 170, 60)), 1
$mavi = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(200, 40, 110, 230)), 1
for ($sira = 0; $sira -lt 2; $sira++) {
  $y0 = $sira * ($H + $bas)
  $zemin = if ($sira -eq 0) { $acik } else { $koyu }
  $gr.FillRectangle((New-Object System.Drawing.SolidBrush $zemin), 0, $y0, $W * $n, $H + $bas)
  for ($i = 0; $i -lt $n; $i++) {
    $im = [System.Drawing.Image]::FromFile("$Klasor/$($Pozlar[$i]).png")
    $gr.DrawImage($im, $i * $W, $y0 + $bas, $W, $H); $im.Dispose()
    $renk = if ($sira -eq 0) { [System.Drawing.Brushes]::Black } else { [System.Drawing.Brushes]::White }
    $gr.DrawString($Pozlar[$i], $yazi, $renk, $i * $W + 6, $y0 + 5)
    if ($i -gt 0) { $gr.DrawLine((New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(90, 128, 128, 128)), 1), $i * $W, $y0, $i * $W, $y0 + $H + $bas) }
  }
  $gr.DrawLine($yesil, 0, [float]($y0 + $bas + $AyakY), $W * $n, [float]($y0 + $bas + $AyakY))
  $gr.DrawLine($mavi, 0, [float]($y0 + $bas + $GozY), $W * $n, [float]($y0 + $bas + $GozY))
}
$o.Save($Cikti); $gr.Dispose(); $o.Dispose()
