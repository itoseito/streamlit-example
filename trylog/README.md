# TRY LOG 動画ソース

```
python3 build.py 01_vacuum      # → 01_vacuum/01_vacuum_v2.mp4（1080×1920・30fps）
```
- `01_vacuum/timeline.json`：見出し・字幕・ナレーション・合図の言葉・効果音。文言の修正はここだけ。
- `01_vacuum/index.html`：絵とアニメーション（SVG）。色は冒頭の `:root` で変更。
- `build.py`：音声の合成、場面の長さと合図の計算、効果音の生成、書き出し。
- 声の差し替え：`01_vacuum/voice_custom/s01.wav`〜`s09.wav` を置いて再ビルドすると、長さと絵のタイミングが自動で合う。

必要なもの：Python 3（numpy）、Node.js（playwright）、ffmpeg、Open JTalk（仮の声を使う場合）。

## 素材と利用条件
- フォント：Noto Sans JP（SIL Open Font License 1.1、`fonts/LICENSE-NotoSansJP.txt`）。表記義務なし。
- 仮のナレーション：Open JTalk ＋ HTS voice "NIT ATR503 M001"（Creative Commons Attribution 3.0）。**この声のまま公開する場合はクレジット表記が必要。**
- 効果音：`build.py` 内で波形から生成した自作音。第三者素材は不使用。
- ChatGPT版の音声・効果音・参考資料は受け取っていないため、本ソースには含まれていない。

## 出典と注記（ChatGPT版 Batch 01 の POSTING.md から引き継ぎ）
- 水筒の参考：サーモス「魔法びんのひみつ」 https://www.thermos.jp/craftmanships/
- 説明欄の注記：「構造と熱移動を簡略化した模式図です。製品によって構造・性能は異なります。完全に熱移動を止めるものではありません。」
- 参考ページの画像・動画・ロゴは転載していない。図はオリジナル。
- 元の説明欄にある「36秒」は v2 では長さが変わるため、公開時に書き換えること。
