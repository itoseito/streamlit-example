#!/bin/bash
# VOICEVOX（無料の音声合成）を trylog/.tools/voicevox に入れる。GitHubのリリース配布に接続できる環境で実行。
set -e
D="$(dirname "$0")/.tools/voicevox"; mkdir -p "$D"; cd "$D"
B=https://github.com/VOICEVOX
curl -fsSLO $B/voicevox_core/releases/download/0.16.0/voicevox_core-0.16.0-cp310-abi3-manylinux_2_34_x86_64.whl
curl -fsSLO $B/onnxruntime-builder/releases/download/voicevox_onnxruntime-1.17.3/voicevox_onnxruntime-linux-x64-1.17.3.tgz
curl -fsSLO $B/voicevox_vvm/releases/download/0.16.0/0.vvm
curl -fsSLO $B/voicevox_vvm/releases/download/0.16.0/TERMS.txt
tar xzf voicevox_onnxruntime-linux-x64-1.17.3.tgz
pip install -q ./voicevox_core-0.16.0-cp310-abi3-manylinux_2_34_x86_64.whl
apt-get install -y --no-install-recommends open-jtalk-mecab-naist-jdic   # 読み方の辞書
echo "利用規約: $D/TERMS.txt （公開時は「VOICEVOX:四国めたん」のクレジット表記が必要）"
