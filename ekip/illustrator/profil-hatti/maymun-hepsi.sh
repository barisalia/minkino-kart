#!/bin/bash
SP="C:/Users/Minkex/AppData/Local/Temp/claude/C--Users-Minkex-Desktop-Minkino-Games/dfb36210-e147-43ba-989a-0a95cd2b7646/scratchpad/musteri"
cd "$SP" && powershell.exe -NoProfile -ExecutionPolicy Bypass -File maymun-calistir.ps1 -Iskelet 2>&1 | tail -3
cd "C:/Users/Minkex/Desktop/Minkino Games"; T=ekip/pazar-musteri/taslak
node "$SP/poz.cjs" $T/maymun-profil.svg $T/maymun-profil.json "$SP/../dedektif/maymun-ayak.png" "dinlenme|evre-1|evre-3" "900 1560 520 380" 560 "#7aa"
node "$SP/poz.cjs" $T/maymun-profil.svg $T/maymun-profil.json "$SP/../dedektif/maymun-kuyruk.png" "dinlenme|kuyruk" "800 1380 300 300" 460 "#7aa"
node "$SP/poz.cjs" $T/maymun-profil.svg $T/maymun-profil.json "$SP/../dedektif/maymun-tam.png" "dinlenme|evre-1|evre-2|evre-3|evre-4" "440 380 1180 1540" 560
echo HAZIR
