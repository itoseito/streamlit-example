#!/usr/bin/env python3
"""台本（script.md）と章の時刻を、timeline.json と build/timing.json から作る:  python3 make_docs.py 08_first_30_days 1,5,8,11,14,17,20
2つ目の引数は、説明欄の章にする場面の番号。章の行は標準出力に出る（POSTING.md に貼る）。"""
import json, sys
from pathlib import Path
d = Path(__file__).resolve().parent / sys.argv[1]
tl = json.loads((d / "timeline.json").read_text()); T = json.loads((d / "build/timing.json").read_text())
sf = {"pon": "ポン", "tick": "コッ", "ting": "キラッ", "thud": "トン", "chime": "和音"}
tot = T[-1]["start"] + T[-1]["dur"]; f = lambda t: "%d:%02d" % (t // 60, t % 60)
o = [f"# {tl['title']}　ナレーション台本\n", f"声：{tl.get('voice', 'VOICEVOX:四国めたん')}／横型16:9／長さ {f(tot)}\n",
     "「区分」は画面右上の表示と同じ。空欄は導入・注意書き・締め。登場人物はAIで作った架空の人物で、実際に試した記録ではありません。\n",
     "| # | 開始 | 区分 | 型 | 見出し | 字幕 | ナレーション | 効果音 |", "|---|---|---|---|---|---|---|---|"]
for i, (s, t) in enumerate(zip(tl["scenes"], T), 1):
    o.append(f"| {i} | {f(t['start'])} | {tl['badges'].get(s.get('src'), '')} | {s.get('art', '')} | {s['head']} | {s['caption']} | {s['narration']} | {'・'.join(sf[k] for _, k in s['sfx']) or 'なし'} |")
(d / "script.md").write_text("\n".join(o) + "\n")
print(f"長さ {f(tot)}")
for i in [int(x) for x in (sys.argv[2].split(",") if len(sys.argv) > 2 else [])]:
    print(f(T[i - 1]["start"]), tl["scenes"][i - 1]["head"])
