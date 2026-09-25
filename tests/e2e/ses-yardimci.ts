import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

/** Chrome'un sahte mikrofonuna verilecek WAV (48 kHz, 16 bit, mono) */
const SR = 48000;
function rastgele(tohum: number) {
  let s = tohum >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 2 ** 32) * 2 - 1;
}
export const sessiz = (sn: number) => {
  const r = rastgele(1);
  return Array.from({ length: Math.round(sn * SR) }, () => r() * 0.0008);
};
export const alkis = (t: number) => {
  const r = rastgele(t);
  return Array.from({ length: Math.round(0.06 * SR) }, (_, i) => r() * 0.7 * Math.exp(-i / (0.012 * SR)));
};
export const ufleme = (sn: number) => {
  const r = rastgele(9);
  let y = 0;
  const n = Math.round(sn * SR);
  return Array.from({ length: n }, (_, i) => {
    y = y * 0.97 + r() * 0.3;
    return Math.min(1, i / 2400, (n - i) / 2400) * 0.3 * y;
  });
};
export const ton = (sn: number, f: number) => {
  const n = Math.round(sn * SR);
  let faz = 0;
  return Array.from({ length: n }, (_, i) => {
    faz += (2 * Math.PI * f) / SR;
    return Math.min(1, i / 480, (n - i) / 480) * 0.2 * (Math.sin(faz) + 0.5 * Math.sin(2 * faz) + 0.3 * Math.sin(3 * faz));
  });
};
export function wav(ad: string, ...parcalar: number[][]) {
  const x = parcalar.flat();
  const b = Buffer.alloc(44 + x.length * 2);
  b.write('RIFF', 0);
  b.writeUInt32LE(36 + x.length * 2, 4);
  b.write('WAVE', 8);
  b.write('fmt ', 12);
  b.writeUInt32LE(16, 16);
  b.writeUInt16LE(1, 20);
  b.writeUInt16LE(1, 22);
  b.writeUInt32LE(SR, 24);
  b.writeUInt32LE(SR * 2, 28);
  b.writeUInt16LE(2, 32);
  b.writeUInt16LE(16, 34);
  b.write('data', 36);
  b.writeUInt32LE(x.length * 2, 40);
  x.forEach((v, i) => b.writeInt16LE(Math.round(Math.max(-1, Math.min(1, v)) * 32767), 44 + i * 2));
  const klasor = resolve('test-results/ses');
  mkdirSync(klasor, { recursive: true });
  const yol = resolve(klasor, `${ad}.wav`);
  writeFileSync(yol, b);
  return yol;
}

