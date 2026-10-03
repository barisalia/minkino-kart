#!/bin/bash
SP="C:/Users/Minkex/AppData/Local/Temp/claude/C--Users-Minkex-Desktop-Minkino-Games/dfb36210-e147-43ba-989a-0a95cd2b7646/scratchpad/musteri"
cd "$SP" && powershell.exe -NoProfile -ExecutionPolicy Bypass -File inek-calistir.ps1 -Iskelet 2>&1 | tail -3
cd "C:/Users/Minkex/Desktop/Minkino Games"; T=ekip/pazar-musteri/taslak
node "$SP/poz.cjs" $T/inek-profil.svg $T/inek-profil.json "$SP/../dedektif/inek-ayak.png" "dinlenme|evre-1|evre-3" "880 1560 480 360" 560 "#7aa"
node "$SP/poz.cjs" $T/inek-profil.svg $T/inek-profil.json "$SP/../dedektif/inek-kuyruk.png" "dinlenme|kuyruk" "540 1440 360 280" 460 "#7aa"
node "$SP/poz.cjs" $T/inek-profil.svg $T/inek-profil.json "$SP/../dedektif/inek-tam.png" "dinlenme|evre-1|evre-2|evre-3|evre-4" "500 360 1100 1560" 560
echo HAZIR
