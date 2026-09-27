# Ada ek pozlar (dans2, mutlu): eski Ada tuvaline (345x622) aynı yerleştirme; eski pozlar da kontrol için yeniden üretilir.
#   dans2: göz–ayak ölçeği 0.2972 kafayı %4 iri gösteriyordu → kafa enine göre 0.2857 ile ortası (sapkali gibi yarı yarıya)
#   mutlu: zıplıyor (ayak havada) → ölçek kafa eninden (kulaktan kulağa 469 px ↔ normal 134 px); yer = çizili gölgenin ortası (y 1972),
#          çizili gölge silinir (oyun kendi gölgesini çiziyor)
$sp = $PSScriptRoot
. "$sp/yukle.ps1"
& "$sp/yerlestir.ps1"
$TW = 345; $TH = 622; $XC = 172.9; $YA = 614.0
$r = [Rgba]::Oku("$sp/ada-mutlu-seffaf.png"); for ($i = 1920 * $r.W * 4; $i -lt $r.P.Length; $i++) { $r.P[$i] = 0 }; $r.Yaz("$sp/ada-mutlu-golgesiz.png")
[Parti]::Yerlestir("$sp/ada-dans2-seffaf.png", "$sp/tuval/dans2.png", $TW, $TH, 0.2914, 1029.6, 2027, $XC, $YA)
[Parti]::Yerlestir("$sp/ada-mutlu-golgesiz.png", "$sp/tuval/mutlu.png", $TW, $TH, 0.2857, 1030.0, 1972, $XC, $YA)
foreach ($p in 'dans2', 'mutlu') { $b = ([Rgba]::Oku("$sp/tuval/$p.png")).Sinir(8); "{0}: sinir={1},{2}-{3},{4}" -f $p, $b[0], $b[1], $b[2], $b[3] }
