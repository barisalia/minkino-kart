param([string]$Ayar)
# Ayar JSON'undan iskelet katmanlarÄ±nÄ± Ã¼retir: katman/<ad>/<parca>.png, dinlenme doÄŸrulamasÄ±, dÃ¶nme noktalarÄ± (tuval)
$ErrorActionPreference = 'Stop'
$sp = $PSScriptRoot
Add-Type -AssemblyName System.Drawing
Add-Type -Path "$sp/Rig.cs" -ReferencedAssemblies System.Drawing
$a = Get-Content -Raw $Ayar | ConvertFrom-Json
$S = [double]$a.olcek; $OX = [double]$a.ox; $OY = [double]$a.oy
$inv = [Globalization.CultureInfo]::InvariantCulture
function Tuval([string]$sekil) {
  # kaynak koordinatlÄ± "e:..;p:.." â†’ tuval koordinatÄ±
  $parca = foreach ($t in ($sekil -split ';')) { $t = $t.Trim(); if ($t.Length -lt 3) { continue }
    $tip = $t.Substring(0, 1); $v = $t.Substring(2) -split ',' | ForEach-Object { [double]::Parse($_, $inv) }
    if ($tip -eq 'e') { $y = @(($v[0] * $S + $OX), ($v[1] * $S + $OY), ($v[2] * $S), ($v[3] * $S)) }
    else { $y = for ($i = 0; $i -lt $v.Count; $i++) { if ($i % 2 -eq 0) { $v[$i] * $S + $OX } else { $v[$i] * $S + $OY } } }
    $tip + ':' + (($y | ForEach-Object { $_.ToString('0.##', $inv) }) -join ',') }
  return ($parca -join ';')
}
function TuvalEgri([string]$egri) {
  $q = @($egri -split ',' | ForEach-Object { [double]::Parse($_, $inv) })
  return (0..($q.Count - 1) | ForEach-Object { $(if ($_ % 2 -eq 0) { $q[$_] * $S + $OX } else { $q[$_] * $S + $OY }).ToString('0.##', $inv) }) -join ','
}
$r = New-Object Rig ("$sp/" + $a.kaynak), ([float]$S), ([float]$OX), ([float]$OY)
$cik = "$sp/katman/$($a.ad)"; New-Item -ItemType Directory -Force $cik | Out-Null
Get-ChildItem $cik -Filter *.png -ErrorAction SilentlyContinue | Remove-Item
$r.KaynakYaz("$cik/_kaynak.png")
$r.Sira($a.sira)
foreach ($p in $a.parcalar) { $r.Parca($p.ad, (Tuval $p.sekil), [bool]$p.ozel, [bool]$p.kes) }
if ($a.sert) { foreach ($z in $a.sert) { $r.Sert($z.ad, (Tuval $z.sekil)) } }
if ($a.zorla) { foreach ($z in $a.zorla) { $r.Zorla($z.ad, (Tuval $z.sekil)) } }
if ($a.tohumPay) { $r.Pay = [int]$a.tohumPay }
if ($null -ne $a.konturSicak) { $r.KonturSicak = [int]$a.konturSicak }
if ($null -ne $a.kenarLum) { $r.KenarLum = [int]$a.kenarLum }
$W = [int][Math]::Round($a.konturW * $S)
$WA = if ($a.konturAl) { [int][Math]::Round($a.konturAl * $S) } else { [int][Math]::Round($W * 1.5) }
"ATA: " + $r.Ata($a.varsayilan, [int]$a.koyuEsik, $WA, [double]$a.pay)
$r.Harita("$cik/_harita.png"); "LEJANT: " + $r.Lejant()
if ($a.egriKes) { foreach ($c in $a.egriKes) { "EGRIKES " + $r.EgriKes($c.on, $c.arka, (Tuval $c.sekil), (TuvalEgri $c.egri)) } }
foreach ($y in $a.yumusat) { "YUMUSAT " + $r.Yumusat($y[0], $y[1], [int][Math]::Round([double]$y[2] * $S)) }
foreach ($t in $a.tamamla) { $wt = if ($t.PSObject.Properties.Name -contains 'kontur' -and -not $t.kontur) { 0 } else { $W }; "TAMAMLA " + $r.Tamamla($t.ad, (Tuval $t.sekil), $t.renk, $a.konturRenk, $wt) }
if ($a.ikiRenk) { foreach ($c in $a.ikiRenk) { "IKIRENK " + $r.IkiRenk($c.ad, (Tuval $c.sekil), (TuvalEgri $c.egri)) } }
if ($a.kapak) { foreach ($c in $a.kapak) { "KAPAK " + $r.Kapak($c.ad, (Tuval $c.sekil), [int][Math]::Round([double]$c.bant * $S)) } }
foreach ($y in $a.yaylar.PSObject.Properties) {
  $v = $y.Value -split ';' | ForEach-Object { $q = $_ -split ',' | ForEach-Object { [double]::Parse($_, $inv) }
    (@(($q[0] * $S + $OX), ($q[1] * $S + $OY), ($q[2] * $S + $OX), ($q[3] * $S + $OY), ($q[4] * $S)) | ForEach-Object { $_.ToString('0.#', $inv) }) -join ',' }
  $r.Yay($y.Name, ($v -join ';'), $a.konturRenk, [float]($a.konturW * $S * 1.1))
}
if ($a.boya) { foreach ($b in $a.boya) { $r.Boya($b.ad, (Tuval $b.sekil), $b.dolgu, $b.kontur, [float]($b.kalinlik * $S)) } }
$gizliEk = if ($a.gizli) { @($a.gizli -split ',') } else { @('goz-kapali', 'agiz-acik', 'agiz-kapali') }
$gorunur = ($a.sira -split ',' | Where-Object { $gizliEk -notcontains $_ }) -join ','
"DOGRULA " + $r.Dogrula($gorunur, "$cik/_dinlenme.png")
foreach ($ad in ($a.sira -split ',')) { [void]$r.KatmanYaz($ad, "$cik/$ad.png") }
# dÃ¶nme noktalarÄ± (tuval)
$don = [ordered]@{}; foreach ($d in $a.donme.PSObject.Properties) { $don[$d.Name] = @(([Math]::Round($d.Value[0] * $S + $OX)), ([Math]::Round($d.Value[1] * $S + $OY))) }
$don | ConvertTo-Json -Compress | Set-Content "$cik/_donme.json" -Encoding UTF8
"katmanlar: $cik"




