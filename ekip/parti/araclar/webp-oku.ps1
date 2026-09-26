param([string]$Girdi, [string]$Cikti)
# WebP'yi (Windows kodeği) alfa korunarak PNG'ye çevirir
Add-Type -AssemblyName PresentationCore
$d = [System.Windows.Media.Imaging.BitmapDecoder]::Create([Uri]$Girdi, 'PreservePixelFormat', 'OnLoad')
$c = New-Object System.Windows.Media.Imaging.FormatConvertedBitmap($d.Frames[0], [System.Windows.Media.PixelFormats]::Bgra32, $null, 0)
$e = New-Object System.Windows.Media.Imaging.PngBitmapEncoder
$e.Frames.Add([System.Windows.Media.Imaging.BitmapFrame]::Create($c))
$fs = [System.IO.File]::Create($Cikti); $e.Save($fs); $fs.Close()
