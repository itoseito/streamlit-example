#!/usr/bin/env python3
"""本編から「続きは本編で」の縦型ショートを作る準備をする。
  python3 make_short.py 09_shutdown 1,2,4,6,7 "合言葉のあと、どうするか。続きは、本編で。"
→ 09_shutdown_short/ に timeline.json・声（本編の声をそのまま使う）・index.html ができる。
そのあと: python3 voice_fish.py 09_shutdown_short（締めの一言だけ新しく作る）→ python3 build.py 09_shutdown_short --bgm"""
import json, shutil, sys
from pathlib import Path
ROOT = Path(__file__).resolve().parent
name, picks, cta = sys.argv[1], [int(x) for x in sys.argv[2].split(",")], sys.argv[3]
src, dst = ROOT / name, ROOT / f"{name}_short"; (dst / "voice_custom").mkdir(parents=True, exist_ok=True)
tl = json.loads((src / "timeline.json").read_text())
scenes = [dict(tl["scenes"][i - 1]) for i in picks]
for n, i in enumerate(picks, 1):
    shutil.copy(src / "voice_custom" / f"s{i:02d}.wav", dst / "voice_custom" / f"s{n:02d}.wav")
first = cta.replace("、", "。").split("。")[0]
scenes.append({"id": "cta", "art": "big", "head": "続きは、本編で。", "caption": tl["title"], "narration": cta, "cues": {"c1": first}, "sfx": [["c1", "chime"]],
               "kicker": "この先は", "text": "続きは本編で", "sub": "TRY LOG のチャンネルへ", "col": "orange"})
(dst / "voice_custom" / f"s{len(scenes):02d}.wav").unlink(missing_ok=True)
out = {**tl, "size": [1080, 1920], "tag": "ショート｜" + tl["tag"].split("/")[-1].strip(), "more": "▶ 続きは本編で", "scenes": scenes}
out.pop("thumb", None)
(dst / "timeline.json").write_text(json.dumps(out, ensure_ascii=False, indent=1) + "\n")
(dst / "index.html").write_text("""<!doctype html>
<html lang="ja"><head><meta charset="utf-8"><link rel="stylesheet" href="../common.css"><link rel="stylesheet" href="../common_short.css"></head><body>
<div id="stage">
  <div id="brand">TRY LOG<i></i></div><div id="tag"></div><div id="badge"></div>
  <div id="head"></div>
  <svg id="art" viewBox="0 0 960 360"></svg>
  <div id="cap"></div><div id="more"></div><div id="note"></div><div id="bar"><b></b></div>
</div>
<script src="build/data.js"></script><script src="../common.js"></script><script src="../kit_wide.js"></script><script src="../kit_scenes.js"></script>
<script>document.getElementById("more").textContent = D.more; renderAt(0);</script>
</body></html>
""")
print(dst.name, len(scenes), "場面")
