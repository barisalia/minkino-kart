param([string]$Yol)
$t = [System.IO.File]::ReadAllText($Yol, [System.Text.Encoding]::UTF8)
# 1) Geçici tuval çerçevesi
$t = [regex]::Replace($t, '\s*<g id="tuval">[\s\S]*?</g>', '')
# 2) Degrade kimlikleri ASCII (id ve url(#...) başvuruları), data-name kaldır
$t = [regex]::Replace($t, '\s+data-name="[^"]*"', '')
$t = [regex]::Replace($t, 'Ads[^_"#)]*_degrade', 'goz-degrade')
# 3) Ek katmanlar varsayılan gizli
foreach ($ad in 'goz-kapali', 'agiz-acik', 'agiz-kapali') { $t = $t.Replace("<g id=`"$ad`">", "<g id=`"$ad`" display=`"none`">") }
[System.IO.File]::WriteAllText($Yol, $t, (New-Object System.Text.UTF8Encoding $false))
$ids = ([regex]::Matches($t, '<g id="[^"]*"[^>]*>') | ForEach-Object { $_.Value }) -join "`n"
$ascii = ([regex]::Matches($t, '[^\x00-\x7F]')).Count
"katman gruplari:`n$ids`nASCII disi karakter: $ascii`ngradient id: " + (([regex]::Matches($t, 'linearGradient id="[^"]*"') | ForEach-Object { $_.Value }) -join ', ')
