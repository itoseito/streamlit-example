#!/usr/bin/env python3
"""TRY LOG 動画ビルド:  python3 build.py 01_vacuum
timeline.json（台本・字幕・合図）→ 音声 → タイミング → 効果音 → 映像 → MP4。

声の差し替え: <動画>/voice_custom/s01.wav … を置くと、その場面は合成せずにそのファイルを使う。
場面の長さと、絵が動く合図の時刻は、声の長さから自動で決まる。
"""
import json, subprocess, sys, wave
from pathlib import Path
import numpy as np

SR = 48000
ROOT = Path(__file__).resolve().parent
DIC = "/var/lib/mecab/dic/open-jtalk/naist-jdic"
VOICE = "/usr/share/hts-voice/nitech-jp-atr503-m001/nitech_jp_atr503_m001.htsvoice"
LEAD, TAIL, END_HOLD = 0.35, 0.55, 1.2      # 声の前の間 / 後の間 / 最後の余韻（秒）
VOICE_RATE = 1.0                             # 合成音声の話速（1.0が標準）
SFX_GAIN, VOICE_GAIN = 0.20, 0.95


def read_wav(p):
    tmp = p.with_suffix(".48k.wav")
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(p), "-ac", "1", "-ar", str(SR), "-c:a", "pcm_s16le", str(tmp)], check=True)
    with wave.open(str(tmp)) as w:
        a = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768
    tmp.unlink()
    nz = np.flatnonzero(np.abs(a) > 0.01)        # 前後の無音を切る
    return a[max(nz[0] - 480, 0): nz[-1] + 2400] if len(nz) else a


def tts(text, out):
    txt = out.with_suffix(".txt")
    txt.write_text(text, encoding="utf-8")
    subprocess.run(["open_jtalk", "-x", DIC, "-m", VOICE, "-r", str(VOICE_RATE), "-ow", str(out), str(txt)], check=True)
    txt.unlink()


def env(n, a=0.005, r=0.2):
    t = np.arange(n) / SR
    return np.minimum(t / a, 1) * np.exp(-np.maximum(t - a, 0) / r)


def sfx(kind):
    rng = np.random.default_rng(7)
    if kind == "pon":                           # 部品を指す、やわらかい「ポン」
        n = int(SR * .25); t = np.arange(n) / SR
        return np.sin(2 * np.pi * (520 * t + 60 * np.exp(-t * 30) / 30)) * env(n, .004, .06)
    if kind == "hiss":                          # 空気が抜ける「シュー」
        n = int(SR * 1.3); t = np.arange(n) / SR
        x = np.diff(rng.standard_normal(n + 1))  # 高域寄りのノイズ
        x = np.convolve(x, np.ones(6) / 6, "same")
        return x / np.abs(x).max() * np.minimum(t / .08, 1) * np.exp(-t / .45) * .8
    if kind == "thud":                          # 熱が止まる、低い「トン」
        n = int(SR * .35); t = np.arange(n) / SR
        return np.sin(2 * np.pi * (95 * t + 40 * (1 - np.exp(-t * 25)) / 25)) * env(n, .003, .09) * 1.3
    if kind == "ting":                          # 鏡面の「キラッ」
        n = int(SR * .9); t = np.arange(n) / SR
        return (np.sin(2 * np.pi * 2100 * t) + .5 * np.sin(2 * np.pi * 3150 * t)) * env(n, .002, .25) * .5
    if kind == "chime":                         # まとめの和音
        n = int(SR * 1.4); t = np.arange(n) / SR
        return sum(np.sin(2 * np.pi * f * t) for f in (660, 880, 1320)) / 3 * env(n, .01, .5) * .8
    raise ValueError(kind)


def main(name):
    d = ROOT / name
    tl = json.loads((d / "timeline.json").read_text(encoding="utf-8"))
    b = d / "build"; (b / "voice").mkdir(parents=True, exist_ok=True)
    timing, voices, t0 = [], [], 0.0
    for i, s in enumerate(tl["scenes"], 1):
        custom = d / "voice_custom" / f"s{i:02d}.wav"
        if custom.exists():
            v, src = read_wav(custom), "差し替え音声"
        else:
            out = b / "voice" / f"s{i:02d}.wav"
            tts(s["narration"], out)
            v, src = read_wav(out), "仮の合成音声"
        vd = len(v) / SR
        cues = {}
        for k, word in s["cues"].items():       # 合図＝その言葉が読まれるおおよその時刻
            pos = s["narration"].find(word)
            if pos < 0:
                sys.exit(f"場面{i}: 合図の言葉「{word}」が台本にありません")
            cues[k] = round(LEAD + vd * pos / len(s["narration"]), 3)
        dur = LEAD + vd + TAIL + (END_HOLD if i == len(tl["scenes"]) else 0)
        timing.append({"start": round(t0, 3), "dur": round(dur, 3), "voice": round(vd, 2), "cues": cues, "src": src})
        voices.append(v); t0 += dur
    total = round(t0, 3)
    mixbuf = np.zeros(int(total * SR) + SR, dtype=np.float32)
    for s, T, v in zip(tl["scenes"], timing, voices):
        a = int((T["start"] + LEAD) * SR); mixbuf[a:a + len(v)] += v * VOICE_GAIN
        for cue, kind in s["sfx"]:
            x = sfx(kind).astype(np.float32); a = int((T["start"] + T["cues"][cue]) * SR)
            mixbuf[a:a + len(x)] += x * SFX_GAIN
    mixbuf = mixbuf[: int(total * SR)]
    mixbuf /= max(1.0, np.abs(mixbuf).max() / .97)
    with wave.open(str(b / "audio.wav"), "w") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((mixbuf * 32767).astype(np.int16).tobytes())
    data = {**tl, "timing": timing, "total": total}
    (b / "data.js").write_text("window.DATA=" + json.dumps(data, ensure_ascii=False), encoding="utf-8")
    (b / "timing.json").write_text(json.dumps(timing, ensure_ascii=False, indent=1), encoding="utf-8")
    for i, (s, T) in enumerate(zip(tl["scenes"], timing), 1):
        print(f"s{i:02d} {T['start']:6.2f}s 長さ{T['dur']:5.2f}s 声{T['voice']:5.2f}s [{T['src']}] {s['head']}")
    print(f"合計 {total:.1f}秒")
    if "--audio-only" in sys.argv:
        return
    out = d / f"{name}_v2.mp4"
    subprocess.run(["node", str(ROOT / "render.js"), str(d / "index.html"), str(b / "audio.wav"), str(out)], check=True)
    print("完成:", out)


if __name__ == "__main__":
    main(sys.argv[1])
