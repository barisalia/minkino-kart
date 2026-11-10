/* Vector embroidery drawn on a 24-unit square. These elements never inherit
   the torso's horizontal or vertical deformation. */
const path=(d,fill)=>`<path d="${d}" fill="${fill}"/>`;
const ring=(x,y,r,fill)=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}"/>`;
const cream='#fff2cc', gold='#ffca53', leaf='#498d68', pink='#ed7773';
export const motifs={
 knot:path('M12 11 Q7 5 3 5 Q1 10 2 16 Q7 17 12 13 Q17 17 22 16 Q23 10 21 5 Q17 5 12 11Z',pink)+ring(12,11,2.3,gold),
 leaf:path('M3 19 Q1 4 21 3 Q22 19 8 20Z',leaf)+path('M5 21 Q13 11 17 8','none'),
 star:path('M12 2 L15 8.6 22 9.5 17 15 18 22 12 18.5 5.5 22 7 15 2 9.5 9 8.6Z',gold),
 moon:path('M17 3 A9 9 0 1 0 21 17 Q9 19 10 9 Q11 5 17 3Z',cream),
 anchor:ring(12,5,2.4,cream)+path('M12 8V21 M7 11H17 M2 15 Q5 21 12 21 Q19 21 22 15 M2 15 L2 19 M22 15 L22 19','none'),
 bell:path('M4 16 Q7 13 7 10 Q7 5 12 5 Q18 5 18 11 Q18 14 21 17 Q13 20 4 17Z',gold)+path('M10 19 Q13 24 16 19','none'),
 flower:[0,72,144,216,288].map(a=>`<ellipse cx="12" cy="6.2" rx="3.8" ry="5" transform="rotate(${a} 12 12)" fill="${cream}"/>`).join('')+ring(12,12,3.4,gold),
 carrot:path('M4 21 Q6 12 11 7 Q14 4 18 8 Q22 12 17 15 Q11 19 4 21Z','#ff9c4d')+path('M16 7 Q15 1 17 1 Q20 2 19 6 Q22 1 23 4 Q24 7 18 9Z',leaf),
 acorn:path('M5 11 Q6 19 13 22 Q21 18 20 10Z','#e7a658')+path('M3 11 Q3 4 11 4 Q18 2 21 8 L21 11 Q11 14 3 11Z','#a86546')+path('M12 4 Q11 2 15 1','none'),
 berry:path('M4 9 Q6 4 12 7 Q18 3 21 10 Q22 15 12 22 Q3 16 4 9Z',pink)+path('M7 6 L10 6 10 2 13 5 17 3 16 7 20 8 14 10Z',leaf),
 fish:path('M2 12 Q9 2 17 10 L22 6 21 17 17 14 Q9 22 2 12Z',cream)+ring(7,11,1,'#282526'),
 compass:ring(12,12,9,cream)+path('M16.5 5 L14 14 7 19 10 10Z','#e7785e'),
 cloud:path('M5 18 Q0 17 2 12 Q3 9 6 10 Q7 3 13 4 Q17 4 18 9 Q24 9 23 15 Q22 19 17 18Z',cream),
 wing:path('M3 19 Q3 12 9 9 L22 4 Q23 10 15 13 L19 12 Q18 17 11 18 Q8 21 3 19Z',cream),
 paint:path('M3 13 Q2 4 12 3 Q22 3 22 11 Q22 14 18 14 Q14 13 14 17 Q15 21 12 21 Q5 22 3 13Z','#ffd79a')+ring(8,10,1.6,pink)+ring(14,7,1.6,'#5eabaf'),
 sun:ring(12,12,5,gold)+path('M12 1V4 M12 20V23 M1 12H4 M20 12H23 M4 4L6 6 M18 18L20 20 M4 20L6 18 M18 6L20 4','none'),
 drop:path('M12 2 Q14 7 19 13 Q24 23 12 23 Q1 22 5 14Z','#76c9de'),
 paw:path('M5 17 Q6 14 9 13 Q12 9 16 13 Q23 16 20 20 Q18 22 13 20 Q5 23 5 17Z',cream)+ring(5,10,2.6,cream)+ring(11,6,2.7,cream)+ring(18,7,2.7,cream),
 sprout:path('M12 21V11 M12 15 Q1 15 2 5 Q12 4 12 15Z M12 12 Q12 2 22 3 Q23 12 12 12Z',leaf)
};
export const speciesMarks={
 kopek:['knot','anchor','paw','sun','paw','leaf','moon','star'],kedi:['bell','knot','fish','flower','berry','leaf','moon','star'],
 tavsan:['leaf','carrot','sprout','flower','berry','sprout','flower','moon'],hamster:['knot','leaf','berry','knot','flower','acorn','acorn','star'],
 kus:['leaf','knot','flower','knot','berry','wing','moon','star'],civciv:['knot','sun','sprout','flower','berry','sprout','flower','sun'],
 ordek:['anchor','anchor','sun','knot','flower','compass','moon','star'],kirpi:['acorn','leaf','leaf','flower','berry','acorn','moon','star'],
 geko:['knot','drop','leaf','leaf','berry','compass','moon','star'],kaplumbaga:['sun','drop','flower','leaf','flower','leaf','moon','sun']
};
export const signatureMarks={
 kopek:['cloud','wing','compass','star','flower','leaf'],kedi:['bell','paint','star','drop','flower','sun'],
 tavsan:['leaf','berry','flower','carrot','flower','sprout'],hamster:['acorn','sprout','acorn','berry'],kus:['leaf','drop','flower','sun','flower','wing'],
 civciv:['flower','berry','sprout'],ordek:['anchor','compass','flower','flower','anchor','drop'],kirpi:['berry','drop','leaf'],
 geko:['leaf','compass','drop'],kaplumbaga:['flower','drop','sun']
};
