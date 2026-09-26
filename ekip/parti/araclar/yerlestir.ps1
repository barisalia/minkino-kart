# Ada: normal + 5 poz ortak tuvale (345x622, oran 284/512 ile aynı). Ölçü: ayak tabanı–göz hizası mesafesi normalle eşit.
$sp = $PSScriptRoot
. "$sp/yukle.ps1"
$TW = 345; $TH = 622; $XC = 172.9; $YA = 614.0
$NORMAL_AYAK_GOZ = 504.0 - 109.2
# poz: kaynak dosya, göz ortası x, göz hizası y, ayak tabanı alt kenarı (son opak satır + 1)
# olcek verilirse o kullanılır: kafa eni (kulaktan kulağa) normalle karşılaştırılarak düzeltildi
#   alkis: Gemini kafayı gövdeye göre büyük çizmiş; boya göre kafa %17 iri, kafaya göre boy %15 kısa → ortası
#          (0.2955 ile 0.2511'in ortalaması: kafa ~%7 iri, boy ~%7 kısa)
#   sapkali: kafa %6 iri çıkıyordu → yarı yarıya (kafa %3 iri, göz hizası 12 px aşağıda)
$pozlar = @(
  @{ ad = 'sapkali'; gx = 1015.25; gy = 694.5; ayak = 2002; olcek = 0.2929 },
  @{ ad = 'alkis';   gx = 1012.0;  gy = 675.0; ayak = 2011; olcek = 0.2733 },
  @{ ad = 'saskin';  gx = 1009.85; gy = 451.0; ayak = 2011 },
  @{ ad = 'dilek';   gx = 1009.85; gy = 451.0; ayak = 2011 },   # saskin ile aynı kaynaktan (kafa yeri birebir)
  @{ ad = 'dans';    gx = 770.0;   gy = 544.0; ayak = 1516 }    # 1536 px kaynak
)
New-Item -ItemType Directory -Force "$sp/tuval" | Out-Null
# normal: tam sayı kaydırma (bulanıklık olmasın): +32, +110
[Parti]::Yerlestir("$sp/ada-normal.png", "$sp/tuval/normal.png", $TW, $TH, 1.0, 0, 0, 32, 110)
foreach ($p in $pozlar) {
  $s = if ($p.olcek) { $p.olcek } else { $NORMAL_AYAK_GOZ / ($p.ayak - $p.gy) }
  [Parti]::Yerlestir("$sp/ada-$($p.ad)-seffaf.png", "$sp/tuval/$($p.ad).png", $TW, $TH, $s, $p.gx, $p.ayak, $XC, $YA)
  $r = [Rgba]::Oku("$sp/tuval/$($p.ad).png"); $b = $r.Sinir(8)
  "{0}: olcek={1:N4} sinir={2},{3}-{4},{5}" -f $p.ad, $s, $b[0], $b[1], $b[2], $b[3]
}
$r = [Rgba]::Oku("$sp/tuval/normal.png"); $b = $r.Sinir(8); "normal: sinir={0},{1}-{2},{3}" -f $b[0], $b[1], $b[2], $b[3]
