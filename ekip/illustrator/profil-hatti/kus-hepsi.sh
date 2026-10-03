#!/bin/bash
SP="C:/Users/Minkex/AppData/Local/Temp/claude/C--Users-Minkex-Desktop-Minkino-Games/dfb36210-e147-43ba-989a-0a95cd2b7646/scratchpad/musteri"
cd "$SP" && node kus-ayar.cjs && powershell.exe -NoProfile -ExecutionPolicy Bypass -File kus-calistir.ps1 -Iskelet 2>&1 | tail -3
cd "C:/Users/Minkex/Desktop/Minkino Games"; T=ekip/pazar-musteri/taslak
node "$SP/poz.cjs" $T/kus-profil.svg $T/kus-profil.json "$SP/../dedektif/kus-tam.png" "dinlenme|evre-1|evre-3|ac:kanat-on=-25|ac2:kanat-on=22|kuyruk|kafa:kafa=6" "420 360 1160 1560" 480
node "$SP/poz.cjs" $T/kus-profil.svg $T/kus-profil.json "$SP/../dedektif/kus-bacak-poz.png" "dinlenme|evre-1|evre-3" "840 1440 760 480" 520 "#7aa"
node "$SP/poz.cjs" $T/kus-profil.svg $T/kus-profil.json "$SP/../dedektif/kus-kanat-poz.png" "dinlenme|ac:kanat-on=-25|ac2:kanat-on=22" "580 880 800 620" 520 "#7aa"
echo HAZIR
