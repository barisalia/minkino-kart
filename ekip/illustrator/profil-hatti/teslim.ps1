param([string]$Ayar, [string]$Hedef = '')
# Ä°skelet katmanlarÄ±ndan SVG (her katman <g id> iÃ§inde gÃ¶mÃ¼lÃ¼ WebP), Ã¶nizleme, hareket testi, katman sayfasÄ± ve dÃ¶nme JSON'u
$ErrorActionPreference = 'Stop'
$sp = $PSScriptRoot
$proje = 'C:/Users/Minkex/Desktop/Minkino Games'
Add-Type -AssemblyName System.Drawing
Add-Type -Path "$sp/Sahne.cs" -ReferencedAssemblies System.Drawing
$env:Path = [Environment]::GetEnvironmentVariable('Path', 'Machine') + ';' + [Environment]::GetEnvironmentVariable('Path', 'User')
$a = Get-Content -Raw $Ayar | ConvertFrom-Json
$ad = $a.ad; $k = "$sp/katman/$ad"; $hedef = if ($Hedef) { "$proje/$Hedef" } else { "$proje/ekip/pazar-musteri" }; New-Item -ItemType Directory -Force $hedef, "$proje/ekip/film/cizim", "$k/_kirp" | Out-Null
$don = Get-Content -Raw "$k/_donme.json" | ConvertFrom-Json
$sira = $a.sira -split ','
$gizliler = @(if ($a.gizli) { $a.gizli -split ',' } else { 'goz-kapali', 'agiz-acik', 'agiz-kapali' })
# 1) SVG
$sb = New-Object Text.StringBuilder
[void]$sb.AppendLine('<?xml version="1.0" encoding="UTF-8"?>')
[void]$sb.AppendLine('<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="2048" height="2048" viewBox="0 0 2048 2048">')
Push-Location $proje
foreach ($p in $sira) {
  $kutu = [Sahne]::Kirp("$k/$p.png", "$k/_kirp/$p.png", 2)
  if (-not $kutu) { continue }
  node -e "require('sharp')(process.argv[1]).webp({quality:90,alphaQuality:100,effort:6}).toFile(process.argv[2]).then(()=>{})" "$k/_kirp/$p.png" "$k/_kirp/$p.webp"
  $b64 = [Convert]::ToBase64String([IO.File]::ReadAllBytes("$k/_kirp/$p.webp"))
  $v = $kutu -split ','
  $gorun = if ($gizliler -contains $p) { ' display="none"' } else { '' }
  [void]$sb.AppendLine("  <g id=""$p""$gorun>")
  [void]$sb.AppendLine("    <image x=""$($v[0])"" y=""$($v[1])"" width=""$($v[2])"" height=""$($v[3])"" xlink:href=""data:image/webp;base64,$b64""/>")
  [void]$sb.AppendLine('  </g>')
}
Pop-Location
[void]$sb.AppendLine('</svg>')
[IO.File]::WriteAllText("$hedef/$ad.svg", $sb.ToString(), (New-Object Text.UTF8Encoding $false))
# 2) dÃ¶nme JSON (film standardÄ±) + baÄŸlÄ±lÄ±k ve sÄ±ra
$pivot = [ordered]@{}; foreach ($d in $don.PSObject.Properties) { $pivot[$d.Name] = $d.Value }
$json = [ordered]@{ ad = $ad; boyut = 2048; sira = $sira; gizli = @($sira | Where-Object { $gizliler -contains $_ }); bagli = $a.bagli; donme = $pivot }
$json | ConvertTo-Json -Depth 5 | Set-Content "$proje/ekip/film/cizim/$ad.json" -Encoding UTF8
Copy-Item "$proje/ekip/film/cizim/$ad.json" "$hedef/$ad.json" -Force
# 3) Ã¶nizleme + hareket testi
$pv = ($don.PSObject.Properties | ForEach-Object { "$($_.Name)=$($_.Value[0]),$($_.Value[1])" }) -join ';'
$bg = ($a.bagli.PSObject.Properties | ForEach-Object { "$($_.Name)=$($_.Value)" }) -join ';'
$sirastr = $sira -join ','
$gizliVar = @($gizliler + 'gaga-ic' | Where-Object { $sira -contains $_ }) -join ','
$pozlar = @('dinlenme') + @($a.test | ForEach-Object { $_.ad })
$f = New-Object System.Drawing.Font 'Arial', 16, ([System.Drawing.FontStyle]::Bold)
foreach ($z in @(@('', '#FFFFFF', 'Black'), @('-koyu', '#2A2230', 'White'))) {
  [Sahne]::Ciz($k, $sirastr, $gizliVar, '', $pv, $bg, '', $z[1], "$k/_poz-dinlenme$($z[0]).png", 700)
  foreach ($t in $a.test) { $tg = $t.gizli; if ($a.gizli) { $gos = @("$($t.goster)" -split ','); $tg = (@($gizliler) + @("$($t.gizli)" -split ',') | Where-Object { $_ -and ($gos -notcontains $_) } | Select-Object -Unique) -join ',' }; [Sahne]::Ciz($k, $sirastr, $tg, $t.aci, $pv, $bg, $t.olcek, $z[1], "$k/_poz-$($t.ad)$($z[0]).png", 700) }
  $o = New-Object System.Drawing.Bitmap (700 * $pozlar.Count), 740
  $g = [System.Drawing.Graphics]::FromImage($o); $g.Clear([System.Drawing.ColorTranslator]::FromHtml($z[1]))
  $firca = if ($z[2] -eq 'White') { [System.Drawing.Brushes]::White } else { [System.Drawing.Brushes]::Black }
  for ($i = 0; $i -lt $pozlar.Count; $i++) { $im = [System.Drawing.Image]::FromFile("$k/_poz-$($pozlar[$i])$($z[0]).png"); $g.DrawImage($im, $i * 700, 40, 700, 700); $im.Dispose(); $g.DrawString($pozlar[$i], $f, $firca, $i * 700 + 10, 8) }
  $o.Save("$hedef/$ad-hareket-testi$($z[0]).png"); $g.Dispose(); $o.Dispose()
}
Copy-Item "$k/_poz-dinlenme.png" "$hedef/$ad-onizleme.png" -Force
# 4) katman sayfasÄ± (her katman ayrÄ±, koyu zeminde: gizli kalan tamamlanmÄ±ÅŸ kÄ±sÄ±mlar gÃ¶rÃ¼nÃ¼r)
$n = $sira.Count; $sut = 6; $sat = [Math]::Ceiling($n / $sut)
$o = New-Object System.Drawing.Bitmap ($sut * 340), ($sat * 360)
$g = [System.Drawing.Graphics]::FromImage($o); $g.Clear([System.Drawing.Color]::FromArgb(40, 34, 48)); $g.InterpolationMode = 'HighQualityBicubic'
for ($i = 0; $i -lt $n; $i++) { $im = [System.Drawing.Image]::FromFile("$k/$($sira[$i]).png"); $x = ($i % $sut) * 340; $y = [Math]::Floor($i / $sut) * 360
  $g.DrawImage($im, (New-Object System.Drawing.Rectangle -ArgumentList $x, ($y + 24), 340, 340), (New-Object System.Drawing.Rectangle -ArgumentList 0, 150, 2048, 2048), [System.Drawing.GraphicsUnit]::Pixel); $im.Dispose()
  $g.DrawString($sira[$i], $f, [System.Drawing.Brushes]::White, $x + 6, $y + 2) }
$o.Save("$hedef/$ad-katmanlar.png"); $g.Dispose(); $o.Dispose()
Get-ChildItem $hedef -Filter "$ad*" | Select-Object Name, Length | Format-Table -AutoSize | Out-String

