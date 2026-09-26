# Parti.cs'yi bir kez derler (aynı oturumda tekrar yüklemez)
$yol = Join-Path $PSScriptRoot 'Parti.cs'
if (-not ([System.Management.Automation.PSTypeName]'Parti').Type) {
  Add-Type -AssemblyName System.Drawing
  Add-Type -Path $yol -ReferencedAssemblies System.Drawing
}
# WIC ile webp'yi okuyup BGRA bayt dizisi döndürür (doğrulama için)
function WebpPiksel([string]$yol) {
  Add-Type -AssemblyName PresentationCore
  $d = [System.Windows.Media.Imaging.BitmapDecoder]::Create([Uri]$yol, 'PreservePixelFormat', 'OnLoad')
  $c = New-Object System.Windows.Media.Imaging.FormatConvertedBitmap($d.Frames[0], [System.Windows.Media.PixelFormats]::Bgra32, $null, 0)
  $w = $c.PixelWidth; $h = $c.PixelHeight; $b = New-Object byte[] ($w * $h * 4); $c.CopyPixels($b, $w * 4, 0)
  return @{ W = $w; H = $h; P = $b }
}
function PngPiksel([string]$yol) {
  $r = [Rgba]::Oku($yol); return @{ W = $r.W; H = $r.H; P = $r.P }
}
function Dogrula([string]$png, [string]$webp) {
  $a = PngPiksel $png; $b = WebpPiksel $webp
  if ($a.W -ne $b.W -or $a.H -ne $b.H) { return "BOYUT FARKLI $($a.W)x$($a.H) / $($b.W)x$($b.H)" }
  $fark = 0
  for ($i = 0; $i -lt $a.P.Length; $i += 4) {
    if ($a.P[$i + 3] -eq 0 -and $b.P[$i + 3] -eq 0) { continue }
    if ($a.P[$i] -ne $b.P[$i] -or $a.P[$i + 1] -ne $b.P[$i + 1] -or $a.P[$i + 2] -ne $b.P[$i + 2] -or $a.P[$i + 3] -ne $b.P[$i + 3]) { $fark++ }
  }
  return "dogrulama: $fark farkli piksel"
}
