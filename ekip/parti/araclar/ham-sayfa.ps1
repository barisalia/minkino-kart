param([string]$Ad, [string]$Pozlar, [string]$Cikti)
# normal (sol) + seffaf pozlar koyu zeminde, her biri kendi sınır kutusuna göre ölçeklenmiş (ilk bakış için)
Add-Type -AssemblyName System.Drawing
$sp = $PSScriptRoot
$liste = @("$sp/$Ad-normal.png") + (($Pozlar -split ',') | ForEach-Object { "$sp/$Ad-$_-seffaf.png" })
$h = 520; $w = 300
$o = New-Object System.Drawing.Bitmap ($w * $liste.Count), $h
$gr = [System.Drawing.Graphics]::FromImage($o); $gr.Clear([System.Drawing.Color]::FromArgb(40, 34, 48)); $gr.InterpolationMode = 'HighQualityBicubic'
for ($i = 0; $i -lt $liste.Count; $i++) {
  $im = [System.Drawing.Image]::FromFile($liste[$i])
  $s = [Math]::Min($w / $im.Width, $h / $im.Height)
  $gr.DrawImage($im, [float]($i * $w + ($w - $im.Width * $s) / 2), [float](0), [float]($im.Width * $s), [float]($im.Height * $s)); $im.Dispose()
}
$o.Save($Cikti); $gr.Dispose(); $o.Dispose()
