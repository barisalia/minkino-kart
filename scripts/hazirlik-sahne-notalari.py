"""Prepare four sung notes from each performer's original 'la' take (praat-parselmouth)."""
from pathlib import Path
import subprocess
import wave

import numpy as np
import parselmouth
from parselmouth.praat import call

root = Path(__file__).resolve().parents[1]
ffmpeg = root / "node_modules/ffmpeg-static/ffmpeg.exe"
asset = root / "assets/hazirlik"
out = asset / "gosteri-muzik/solfej"
out.mkdir(exist_ok=True)
rate = 44100
# Preserve the consonant and use the steady part of the first sustained vowel.
for actor, start, end, reference in (("kino", .21, 1.37, 278), ("zip", .045, 1.15, 345)):
    raw = subprocess.check_output([str(ffmpeg), "-v", "error", "-i", str(asset / f"ses/{actor}_sahne_la.mp3"),
                                   "-ac", "1", "-ar", str(rate), "-f", "f32le", "pipe:1"])
    source = parselmouth.Sound(np.frombuffer(raw, "<f4")[round(start*rate):round(end*rate)], rate)
    source = call(source, "Lengthen (overlap-add)", 80, 650, .53/source.duration)
    for lane, midi in enumerate((60, 64, 67, 69)):
        target = 440 * 2**((midi-69)/12)
        manipulation = call(source, "To Manipulation", .008, 80, 660)
        tier = call(manipulation, "Extract pitch tier")
        tuned = call("Create PitchTier", "sung", source.xmin, source.xmax)
        for i in range(1, call(tier, "Get number of points")+1):
            f0 = call(tier, "Get value at index", i)
            # Keep the natural pickup and a few cents of variation on the vowel.
            onset = call(tier, "Get time from index", i)
            color = .50 if onset < .12 else .22
            call(tuned, "Add point", onset, target*(f0/reference)**color)
        call([tuned, manipulation], "Replace pitch tier")
        clip = call(manipulation, "Get resynthesis (overlap-add)")
        samples = clip.values[0].copy()
        samples *= min(.64/np.max(abs(samples)), .105/np.sqrt(np.mean(samples**2)))
        samples[:220] *= np.linspace(0, 1, 220)
        samples[-1764:] *= np.linspace(1, 0, 1764)
        with wave.open(str(out / f"{actor}-{lane}.wav"), "wb") as wav:
            wav.setparams((1, 2, rate, 0, "NONE", "not compressed"))
            wav.writeframes(np.rint(samples*32767).astype("<i2").tobytes())
