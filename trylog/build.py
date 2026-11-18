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
VV_DIR = ROOT / ".tools" / "voicevox"            # setup_voice.sh で入る。無ければ Open JTalk の仮の声
VV_STYLE, VV_NAME = 2, "VOICEVOX:四国めたん（ノーマル）"
VV_SPEED, VV_PAUSE = 1.0, 1.25                   # 話速 / 読点・句点の間の倍率
LEAD, TAIL, END_HOLD = 0.35, 0.55, 1.2      # 声の前の間 / 後の間 / 最後の余韻（秒）
VOICE_RATE = 1.0                             # 合成音声の話速（1.0が標準）
SFX_GAIN, VOICE_GAIN = 0.20, 0.95
BGM_GAIN = 0.045                             # --bgm を付けたときだけ入る。声よりかなり小さく


_syn = None
def voicevox():
    global _syn
    if _syn is None:
        from voicevox_core.blocking import Onnxruntime, OpenJtalk, Synthesizer, VoiceModelFile
        lib = next(VV_DIR.glob("voicevox_onnxruntime-*/lib/libvoicevox_onnxruntime.so.*"))
        _syn = Synthesizer(Onnxruntime.load_once(filename=str(lib)), OpenJtalk(DIC))
        with VoiceModelFile.open(str(VV_DIR / "0.vvm")) as m:
            _syn.load_voice_model(m)
    return _syn


def tts_voicevox(text, cue_words, out):
    """声を合成し、合図の言葉が実際に読まれる時刻（秒）を音の長さの内訳から求める。"""
    syn = voicevox()
    aq = syn.create_audio_query(text, VV_STYLE)
    aq.speed_scale = VV_SPEED
    starts, t = [], aq.pre_phoneme_length
    for ap in aq.accent_phrases:
        for m in ap.moras:
            starts.append(t); t += (m.consonant_length or 0) + m.vowel_length
        if ap.pause_mora:
            pm = ap.pause_mora
            if isinstance(pm, dict):
                pm["vowel_length"] *= VV_PAUSE; t += pm["vowel_length"]
            else:
                pm.vowel_length *= VV_PAUSE; t += pm.vowel_length
    cues = {}
    for k, word in cue_words.items():
        pos = text.find(word)
        if pos < 0:
            sys.exit(f"合図の言葉「{word}」が台本にありません")
        n = sum(len(ap.moras) for ap in syn.create_audio_query(text[:pos], VV_STYLE).accent_phrases) if pos else 0
        cues[k] = starts[min(n, len(starts) - 1)] / VV_SPEED
    out.write_bytes(syn.synthesis(aq, VV_STYLE))
    return cues, aq.kana


def read_wav(p, trim=True):
    tmp = p.with_suffix(".48k.wav")
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(p), "-ac", "1", "-ar", str(SR), "-c:a", "pcm_s16le", str(tmp)], check=True)
    with wave.open(str(tmp)) as w:
        a = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768
    tmp.unlink()
    if not trim:
        return a
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
    if kind == "zip":                           # ファスナーの「ジーッ」：細かいカチカチの連続
        n = int(SR * .8); out = np.zeros(n)
        for i in range(16):
            a = int(i * .045 * SR); m = int(SR * .02); tt = np.arange(m) / SR
            out[a:a + m] += rng.standard_normal(m) * np.exp(-tt / .004) * .5 + np.sin(2 * np.pi * (1500 + i * 60) * tt) * np.exp(-tt / .006) * .5
        return out * .7
    if kind == "tick":                          # 時計・タイマーの小さな「コッ」
        n = int(SR * .12); t = np.arange(n) / SR
        return np.sin(2 * np.pi * 1250 * t) * env(n, .001, .018) * .8
    raise ValueError(kind)


def bgm(total):
    """自作のBGM：ゆっくりした和音のパッド（第三者の音源は不使用）。"""
    n = int(total * SR); t = np.arange(n) / SR; out = np.zeros(n, dtype=np.float32)
    chords = [(220.0, 261.63, 329.63, 392.0), (174.61, 220.0, 261.63, 329.63),
              (130.81, 196.0, 246.94, 329.63), (196.0, 246.94, 293.66, 392.0)]   # Am7 / Fmaj7 / Cmaj7 / G
    bar = 4.0
    for i in range(int(total / bar) + 1):
        a, b = int(i * bar * SR), min(int((i * bar + bar + 1.5) * SR), n)       # 1.5秒重ねてなめらかに
        if a >= n:
            break
        tt = t[: b - a]; e = np.minimum(tt / 1.5, 1) * np.minimum((tt[-1] - tt) / 1.5, 1)
        for f in chords[i % 4]:
            out[a:b] += (np.sin(2 * np.pi * f * tt) + np.sin(2 * np.pi * f * 1.004 * tt) + .25 * np.sin(2 * np.pi * 2 * f * tt)) * e / 9
    return out * np.minimum(t / 1.5, 1) * np.minimum((total - t) / 2.0, 1).clip(0, 1)


def main(name):
    d = ROOT / name
    tl = json.loads((d / "timeline.json").read_text(encoding="utf-8"))
    global VV_SPEED, LEAD, TAIL                  # 動画ごとに timeline.json の "speed" "lead" "tail" で変えられる
    VV_SPEED, LEAD, TAIL = tl.get("speed", VV_SPEED), tl.get("lead", LEAD), tl.get("tail", TAIL)
    b = d / "build"; (b / "voice").mkdir(parents=True, exist_ok=True)
    timing, voices, t0 = [], [], 0.0
    for i, s in enumerate(tl["scenes"], 1):
        say = s.get("read", s["narration"])     # read: 読み間違いを避けるための読み上げ用の書き方（任意）
        for k, v in tl.get("readings", {}).items():   # readings: 動画全体での読み替え（例 "一文": "いちぶん"）
            say = say.replace(k, v); s["cues"] = {c: w.replace(k, v) for c, w in s["cues"].items()}
        custom = d / "voice_custom" / f"s{i:02d}.wav"
        out, kana, cues = b / "voice" / f"s{i:02d}.wav", "", None
        if custom.exists():
            v, src = read_wav(custom), "差し替え音声"
        elif (VV_DIR / "0.vvm").exists():
            c, kana = tts_voicevox(say, s["cues"], out)
            v, src = read_wav(out, trim=False), VV_NAME
            cues = {k: round(LEAD + x, 3) for k, x in c.items()}
        else:
            tts(say, out)
            v, src = read_wav(out), "仮の合成音声（Open JTalk）"
        vd = len(v) / SR
        if cues is None:                        # 声の内訳が分からない場合は文字位置からの概算
            cues = {}
            for k, word in s["cues"].items():
                pos = say.find(word)
                if pos < 0:
                    sys.exit(f"場面{i}: 合図の言葉「{word}」が台本にありません")
                cues[k] = round(LEAD + vd * pos / len(say), 3)
        if kana:
            print(f"   読み s{i:02d}: {kana}")
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
    use_bgm = "--bgm" in sys.argv
    if use_bgm:
        mixbuf += bgm(total)[: len(mixbuf)] * BGM_GAIN
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
    out = d / f"{name}{tl.get('suffix', '_v2')}{'_bgm' if use_bgm else ''}.mp4"
    w, h = tl.get("size", [1080, 1920])          # 横型は timeline.json に "size": [1920, 1080]
    subprocess.run(["node", str(ROOT / "render.js"), str(d / "index.html"), str(b / "audio.wav"), str(out), str(w), str(h)], check=True)
    print("完成:", out)


if __name__ == "__main__":
    main(sys.argv[1])
