#!/bin/bash
# 1本を書き出す: BGMあり → BGMなし（映像は同じ）→ build/ をBGMありに戻す
set -e; cd "$(dirname "$0")"; v=$1
python3 build.py $v --bgm | tail -1
python3 build.py $v --audio-only | tail -1
ffmpeg -y -loglevel error -i $v/${v}_bgm.mp4 -i $v/build/audio.wav -map 0:v -map 1:a -c:v copy -af loudnorm=I=-16:TP=-1.5:LRA=11 -ar 48000 -c:a aac -b:a 160k -shortest -movflags +faststart $v/$v.mp4
python3 build.py $v --bgm --audio-only | tail -1
echo "DONE $v"
