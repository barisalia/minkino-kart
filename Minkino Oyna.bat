@echo off
cd /d "%~dp0"
title Minkino - derlenmis kopya
echo.
echo  Minkino aciliyor (derlenmis kopya, ekipten bagimsiz).
echo  Bu pencere acik kaldikca oyun calisir. Kapatinca oyun da kapanir.
echo.
echo  Ana menu  : http://localhost:4180/
echo  Turkce    : http://localhost:4180/alfabe/
echo  Matematik : http://localhost:4180/matematik/
echo  Ingilizce : http://localhost:4180/ingilizce/
echo.
if not exist "dist-baris\index.html" (
  echo  Kopya henuz hazir degil: dist-baris klasoru yok.
  pause
  exit /b 1
)
start "" cmd /c "timeout /t 4 >nul & start http://localhost:4180/"
call npx vite preview --outDir dist-baris --port 4180 --strictPort
echo.
echo  Sunucu kapandi. 4180 baska bir pencerede aciksa once onu kapat.
pause
