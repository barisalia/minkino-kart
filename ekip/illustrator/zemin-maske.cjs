// şeffaf PNG → 128x128 zemin maskesi ('1' = hücrenin ortası şeffaf)
const s = require(require.resolve('sharp', { paths: [process.cwd()] }));
(async () => { const { data, info } = await s(process.argv[2]).ensureAlpha().raw().toBuffer({ resolveWithObject: true }); const N = 128, c = info.width / N; let m = '';
  for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) { const x = Math.floor((j + 0.5) * c), y = Math.floor((i + 0.5) * c); m += data[(y * info.width + x) * 4 + 3] < 20 ? '1' : '0'; }
  process.stdout.write(m); })();
