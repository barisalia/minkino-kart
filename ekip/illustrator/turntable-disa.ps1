# Açık belgedeki görünümü ekip/turntable/<ad>/<ad-görünüm>.png (200%) + .svg olarak dışa aktarır, seçimi kaldırır
# Kullanım: powershell -File ekip/illustrator/turntable-disa.ps1 <ad> <yan|uc-ceyrek|arka>
param([string]$Ad, [string]$Gorunum)
$out = "C:/Users/Minkex/Desktop/Minkino Games/ekip/turntable/$Ad"; New-Item -ItemType Directory -Force $out | Out-Null
$ai = New-Object -ComObject Illustrator.Application
$ai.DoJavaScript(@"
var d = app.activeDocument; d.selection = null;
var o = new ExportOptionsPNG24(); o.transparency = true; o.artBoardClipping = true; o.horizontalScale = 200; o.verticalScale = 200;
d.exportFile(new File('$out/$Gorunum.png'), ExportType.PNG24, o);
var s = new ExportOptionsSVG(); s.embedRasterImages = false; d.exportFile(new File('$out/$Gorunum.svg'), ExportType.SVG, s);
app.executeMenuCommand('selectall'); 'tamam';
"@)
