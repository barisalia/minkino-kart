import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { expect, it } from 'vitest';

// Ses metni doğruyken oynatılan eski MP3 bu heceleri kısaltma olarak okuyordu.
it.each([
  ['mon', 'Pazartesi', '614854df5ff248ac40b7ae9413bd9641fc7a9c4481099251588ff9daede9ec1f'],
  ['ör', 'Örneğin', '58116e20d651fd3680cb34a979470786c3e3163a9e418e2a957d8a353d1b55d2'],
])('%s hecesinde “%s” kaydına geri dönülmez', (hece, _, eskiOzet) => {
  const ses = readFileSync('assets/alfabe/ses/pano-hece-' + hece + '.mp3');
  expect(createHash('sha256').update(ses).digest('hex')).not.toBe(eskiOzet);
});
