"""Place the original Kino performances over the 96 BPM accompaniment."""
import subprocess
from pathlib import Path

import numpy as np

root = Path(__file__).resolve().parents[1]
ffmpeg = root / "node_modules/ffmpeg-static/ffmpeg.exe"
assets = root / "assets/hazirlik"
sample_rate = 48000
mix = np.zeros(40 * sample_rate, dtype=np.float32)

for index in range(8):
    source = assets / f"ses/kino_sarki_dize_{index + 1}.mp3"
    pcm = subprocess.check_output([ffmpeg, "-v", "error", "-i", source,
                                   "-ac", "1", "-ar", str(sample_rate), "-f", "f32le", "pipe:1"])
    phrase = np.frombuffer(pcm, "<f4")
    peak = np.max(np.abs(phrase))
    if not peak or len(phrase) > (5 - .28) * sample_rate:
        raise ValueError(f"Check the full take before mixing {source.name}")
    # Leave the phrasing, pitch, breaths and natural pauses of each take intact.
    start = round((index * 5 + .28) * sample_rate)
    mix[start:start + len(phrase)] = phrase * min(.85 / peak, 1.1)

destination = assets / "gosteri-muzik/kino-sahne-vokal.flac"
subprocess.run([ffmpeg, "-v", "error", "-y", "-f", "f32le", "-ar", str(sample_rate), "-ac", "1",
                "-i", "pipe:0", "-sample_fmt", "s32", "-bits_per_raw_sample", "24", destination],
               input=mix.tobytes(), check=True)
