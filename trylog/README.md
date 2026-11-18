# TRY LOG 動画ソース

```
python3 build.py 01_vacuum --bgm   # → 01_vacuum/01_vacuum_v2_bgm.mp4（1080×1920・30fps）。--bgm を外すとBGMなし
python3 build.py 02_zipper --bgm
python3 build.py 03_windows --bgm
python3 build.py 05_when_where --bgm    # 横型 → 05_when_where/05_when_where_bgm.mp4
python3 build.py 04_two_minute --bgm   # 横型 → 04_two_minute/04_two_minute_bgm.mp4（1920×1080・30fps）
```
- `01_vacuum/timeline.json`：見出し・字幕・ナレーション・合図の言葉・効果音。文言の修正はここだけ。
- `<動画>/art.js`：その動画の絵とアニメーション（SVG）。
- `common.js` / `common.css`：全動画共通の枠・色・文字・場面切り替え。色は `common.css` 冒頭の `:root`。
- 横型16:9：`timeline.json` に `"size": [1920, 1080]` を書き、`index.html` で `common_wide.css` も読み込む（配置だけ上書き。色と文字は共通）。
- 出どころの表示：場面に `"src": "author"` / `"trylog"` を書くと、画面右上に「著者の主張」「TRY LOGの応用例」が出る（文言は `badges`）。
- 読み間違い対策：場面に `"read"` を書くと、声はその書き方で読む（台本の `narration` はそのまま）。
- 話す速さと間：`timeline.json` の `"speed"`（1.45 で早口）、`"lead"` `"tail"`（場面の前後の間・秒）。
- 動画全体の読み替え：`"readings": {"一文": "いちぶん"}`。
- `kit_wide.js`：横型の動画で共通に使う絵の部品（部屋、メーター用の枠、アイコン、輪など）。05 以降の `art.js` から使う。
- `build.py`：音声の合成、場面の長さと合図の計算、効果音の生成、書き出し。
- 声の差し替え：`01_vacuum/voice_custom/s01.wav`〜`s09.wav` を置いて再ビルドすると、長さと絵のタイミングが自動で合う。

必要なもの：Python 3（numpy）、Node.js（playwright）、ffmpeg、VOICEVOX（`setup_voice.sh`）。

## 素材と利用条件
- フォント：Noto Sans JP（SIL Open Font License 1.1、`fonts/LICENSE-NotoSansJP.txt`）。表記義務なし。
- ナレーション：VOICEVOX（四国めたん・ノーマル）で合成。商用・非商用とも利用可。**公開時は説明欄などに「VOICEVOX:四国めたん」のクレジット表記が必要。** 規約は `.tools/voicevox/TERMS.txt` と https://zunko.jp/con_ongen_kiyaku.html 。
- VOICEVOX本体と声のデータ（約58MB）はリポジトリに入れていない。`./setup_voice.sh` で入る。入っていない環境では Open JTalk の仮の声（CC BY 3.0、要クレジット）で代用される。
- 効果音：`build.py` 内で波形から生成した自作音。第三者素材は不使用。
- ChatGPT版の音声・効果音・参考資料は受け取っていないため、本ソースには含まれていない。

## 出典と注記（ChatGPT版 Batch 01 の POSTING.md から引き継ぎ）
- 水筒の参考：サーモス「魔法びんのひみつ」 https://www.thermos.jp/craftmanships/
- 説明欄の注記：「構造と熱移動を簡略化した模式図です。製品によって構造・性能は異なります。完全に熱移動を止めるものではありません。」
- 参考ページの画像・動画・ロゴは転載していない。図はオリジナル。
- 元の説明欄にある「36秒」は v2 では長さが変わるため、公開時に書き換えること。
- ファスナーの参考：YKK「ファスナーの仕組み」 https://www.ykk.com/ykk/tech/01.html
- 飛行機の窓の参考：Smithsonian NASM "How Things Fly" https://howthingsfly.si.edu/ask-an-explainer/why-are-pressurized-windows-rounded-corners
- 参考ページ2件はこの環境から接続できず、今回は内容を再確認していない（ChatGPT版の確認日は2026-11-18）。

## 04 / 2分ルール
- 台本は `04_two_minute/script.md`、出典・著者の主張と応用例の区別・確認できていない点・説明欄の案は `04_two_minute/SOURCES.md`。

## 05 / いつ・どこで
- 台本 `05_when_where/script.md`、出典と確認できていない点 `05_when_where/SOURCES.md`、投稿文 `05_when_where/POSTING.md`。
