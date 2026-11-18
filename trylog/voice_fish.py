#!/usr/bin/env python3
"""本人の声（Fish Audio・参照音声からの合成）で、動画のナレーションを作って確かめる。
  python3 voice_fish.py 08_first_30_days            # 無い場面だけ作り、音声認識で台本と照合する
  python3 voice_fish.py 08_first_30_days 6 15       # 6番と15番だけ作り直す
キーは環境の安全な保存先にあり、通信の途中で付く（このファイルにもリポジトリにも書かない）。"""
import difflib, json, re, subprocess, sys, time
from pathlib import Path
import httpx, msgpack

ROOT = Path(__file__).resolve().parent
REF, REF_TEXT = (ROOT / "voice_ref/ref.wav").read_bytes(), (ROOT / "voice_ref/ref.txt").read_text().strip()
H = {"Authorization": "Bearer proxy-injected"}
SAY = {"TRY LOG": "トライログ", "AI": "エーアイ", "Aさん": "エーさん", "SNS": "エスエヌエス"}   # 英字の読み


def tts(text, out, speed=1.35):
    body = msgpack.packb({"text": text, "references": [{"audio": REF, "text": REF_TEXT}], "format": "wav", "sample_rate": 44100,
                          "prosody": {"speed": speed}, "language": "ja"}, use_bin_type=True)
    for _ in range(5):
        try:
            r = httpx.post("https://api.fish.audio/v1/tts", headers={**H, "Content-Type": "application/msgpack", "model": "s2.1-pro-free"}, content=body, timeout=180)
            if r.status_code == 200 and len(r.content) > 10000:
                out.write_bytes(r.content); return True
        except httpx.HTTPError:
            pass
        time.sleep(5)
    return False


def asr(path):
    for _ in range(3):
        try:
            r = httpx.post("https://api.fish.audio/v1/asr", headers=H, files={"audio": path.read_bytes()}, data={"language": "ja", "ignore_timestamps": "true"}, timeout=120)
            return r.json().get("text", "")
        except Exception:
            time.sleep(4)
    return "（照合できず）"


def main(name, only):
    d = ROOT / name; tl = json.loads((d / "timeline.json").read_text()); (d / "voice_custom").mkdir(exist_ok=True)
    norm = lambda s: re.sub(r"[、。・？！?!「」“”\s]", "", s)
    for i, s in enumerate(tl["scenes"], 1):
        out = d / "voice_custom" / f"s{i:02d}.wav"
        if only and i not in only or (not only and out.exists()):
            continue
        text = s.get("say", s["narration"])            # say: 聞き間違えられた場面だけ、読み上げ用の書き方を別に持てる
        for a, b in SAY.items():
            text = text.replace(a, b)
        if not tts(text, out):
            print(f"s{i:02d} 失敗"); continue
        got = asr(out); want = s["narration"]
        for a, b in SAY.items():
            want = want.replace(a, b)
        r = difflib.SequenceMatcher(None, norm(want), norm(got)).ratio()
        print(f"s{i:02d} {r:.2f} {'OK ' if r > .85 else '要確認'} {got}", flush=True)


if __name__ == "__main__":
    main(sys.argv[1], [int(x) for x in sys.argv[2:]])
