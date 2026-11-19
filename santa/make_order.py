"""サンタ動画を1件作る（クレジット0・外部AIに送らない）
使い方: python3 santa/make_order.py <注文番号> <呼び名> <がんばったこと>
例:     python3 santa/make_order.py 001 ゆいちゃん "運動会で、最後まで走れた"
出力:   santa/orders/<注文番号>.mp4（orders/ はGitに入れない）
共通部分の映像は build/common.mp4（Klingの動く映像）があれば使い、無ければ止まった絵を使う。
"""
import subprocess, sys, json, re
from pathlib import Path
HERE = Path(__file__).resolve().parent; B = HERE / "build"; TL = HERE.parent / "trylog"
sys.path.insert(0, str(TL))
from build import DIC, VV_DIR
from voicevox_core.blocking import Onnxruntime, OpenJtalk, Synthesizer, VoiceModelFile

oid, name, praise = sys.argv[1], sys.argv[2], sys.argv[3].rstrip("。")
W = B / f"order_{oid}"; W.mkdir(parents=True, exist_ok=True)
SID, VVM = 53, "12.vvm"   # 麒ヶ島宗麟
LINES = {"p1": "メリークリスマス！サンタクロースじゃよ。今年も、世界中の子どもたちを、ちゃんと見ておったよ。",
         "p2": f"{name}。{praise}ね。サンタは、とってもうれしかったぞ。",
         "p3": "クリスマスの夜、すてきなプレゼントを持っていくからね。楽しみに、待っていておくれ。"}
DUR = {"p1": 7.6, "p2": 7.6, "p3": 6.6, "end": 3.2}

def run(*a): subprocess.run(a, check=True)

# 1) 声（パソコン内で合成）
lib = next(VV_DIR.glob("voicevox_onnxruntime-*/lib/libvoicevox_onnxruntime.so.*"))
syn = Synthesizer(Onnxruntime.load_once(filename=str(lib)), OpenJtalk(DIC))
with VoiceModelFile.open(str(VV_DIR / VVM)) as m: syn.load_voice_model(m)
for k, t in LINES.items():
    out = W / f"{k}.wav"
    if k != "p2" and (B / f"{k}.wav").exists(): out.write_bytes((B / f"{k}.wav").read_bytes()); continue
    q = syn.create_audio_query(t, SID); q.speed_scale = .95; q.pitch_scale = -.02; q.intonation_scale = 1.15; q.post_phoneme_length = .5
    out.write_bytes(syn.synthesis(q, SID))
d2 = float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(W / "p2.wav")]))
DUR["p2"] = max(7.6, round(d2 + .8, 1))

# 2) 手紙の場面（文字は自動で折り返し）
def wrap(s, n=11):
    parts, cur = [], ""
    for seg in re.split(r"(?<=、)", s):
        if len(cur) + len(seg) > n and cur: parts.append(cur); cur = ""
        cur += seg
        while len(cur) > n: parts.append(cur[:n]); cur = cur[n:]
    parts += [cur] if cur else []
    if len(parts) > 1 and len(parts[-1]) <= 3: parts[-2] += parts.pop()
    return parts
letter = "<br>".join(wrap(praise + "ね。"))
sub = f"{name}。<br>{praise}ね。" if len(praise) <= 16 else f"{name}。"
src = (B / "frames.js").read_text()
css = re.search(r"const css = `([\s\S]*?)`;", src).group(1)
html = (f'<meta charset=utf-8><style>{css}</style><div class="bg"></div><div class="dim"></div>'
        f'<div class="ai">AIで作成した動画です</div><div class="letter"><div class="to">{name}へ</div>'
        f'<div class="body">{letter}<br>サンタは、とっても<br>うれしかったぞ。</div><div class="from">サンタより</div></div>'
        f'<div class="sub">{sub}</div>')
(B / f"_order_{oid}.html").write_text(html)
run("node", "-e", f"""const {{chromium}}=require('playwright');(async()=>{{const b=await chromium.launch();const p=await b.newPage({{viewport:{{width:720,height:1280}}}});
await p.goto('file://{B}/_order_{oid}.html');await p.evaluate(()=>document.fonts.ready);await p.screenshot({{path:'{W}/p2.png'}});await b.close()}})()""")
(B / f"_order_{oid}.html").unlink()

# 3) 映像をつなぐ
def still(png, sec, out):
    n = int(sec * 30)
    run("ffmpeg", "-y", "-loglevel", "error", "-loop", "1", "-i", str(png), "-vf",
        f"scale=1440:2560,zoompan=z='1+0.04*on/{n}':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d={n}:s=720x1280:fps=30,format=yuv420p",
        "-frames:v", str(n), "-c:v", "libx264", "-crf", "20", str(out))
def moving(png_overlay, sec, out):   # Klingの映像（往復再生）に字幕などを重ねる
    run("ffmpeg", "-y", "-loglevel", "error", "-i", str(B / "common.mp4"), "-i", str(png_overlay), "-filter_complex",
        f"[0]scale=720:1280,setsar=1,fps=30,split[a][b];[b]reverse[r];[a][r]concat=n=2:v=1,loop=-1:32767,trim=0:{sec},setpts=PTS-STARTPTS[v];[v][1]overlay,format=yuv420p",
        "-t", str(sec), "-c:v", "libx264", "-crf", "20", str(out))
for k in ["p1", "p3"]:
    if (B / "common.mp4").exists(): moving(B / f"{k}_overlay.png", DUR[k], W / f"v_{k}.mp4")
    else: still(B / f"{k}.png", DUR[k], W / f"v_{k}.mp4")
still(W / "p2.png", DUR["p2"], W / "v_p2.mp4"); still(B / "end.png", DUR["end"], W / "v_end.mp4")
run("ffmpeg", "-y", "-loglevel", "error", "-i", str(W / "p1.wav"), "-i", str(W / "p2.wav"), "-i", str(W / "p3.wav"), "-filter_complex",
    f"[0]apad=whole_dur={DUR['p1']}[a];[1]apad=whole_dur={DUR['p2']}[b];[2]apad=whole_dur={DUR['p3']}[c];anullsrc=r=24000:cl=mono,atrim=0:{DUR['end']}[d];"
    "[a][b][c][d]concat=n=4:v=0:a=1,loudnorm=I=-16:TP=-1.5[o]", "-map", "[o]", "-ar", "48000", str(W / "a.wav"))
(W / "l.txt").write_text("".join(f"file v_{k}.mp4\n" for k in ["p1", "p2", "p3", "end"]))
O = HERE / "orders"; O.mkdir(exist_ok=True)
run("ffmpeg", "-y", "-loglevel", "error", "-f", "concat", "-i", str(W / "l.txt"), "-i", str(W / "a.wav"), "-map", "0:v", "-map", "1:a",
    "-c:v", "copy", "-c:a", "aac", "-b:a", "160k", "-shortest", "-movflags", "+faststart", str(O / f"{oid}.mp4"))
print("完成:", O / f"{oid}.mp4", f"{sum(DUR.values()):.1f}秒")
