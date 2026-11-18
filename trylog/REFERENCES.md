# 参考リポジトリ（制作の参考。TRY LOG の動画には、コードも素材も持ち込んでいない）

この環境では `/home/user/refs/` に浅く複製して読んでいる（コンテナは消えるので、ここに記録）。
もう一度複製するとき：`./setup_refs.sh`

| 名前 | リポジトリ | 複製した版 | ライセンス | 使い方 |
|---|---|---|---|---|
| MG styles | https://github.com/Vincentwei1021/mg-styles-15 | 128c083 | MIT | 15種類のモーションデザインの作風メモとプロンプトを参考にする。仕組み（`renderAt(t)` を1コマずつ撮って ffmpeg）は TRY LOG と同じ。 |
| animation base | https://github.com/JohnHeibel/ClaudeAnimationBase | 0ac8bf2 | MIT | `ANIMATION_GUIDE.md` の進め方（先に絵コンテ、1カットずつ作る、コンタクトシートで自己確認）を参考にする。**キャラクター「Clawd」は Anthropic のマスコットなので TRY LOG には使わない。** |
| pDOOMvideo | https://github.com/JohnHeibel/PDoomVideo | fa546a3 | **表記なし** | ライセンスが書かれていないので、コードは流用しない。読むだけ。 |
| awesome opus5.5 | https://github.com/yihui-dev/awesome-opus5-5-videos | 92aee2f | MIT | 話題になった動画と、そのプロンプトの一覧。企画とプロンプトの書き方の参考。 |
| awesome claude5.5 | https://github.com/athemeroy/awesome-claude-5-5-videos | cf97039 | CC BY 4.0 | 出典つきの動画制作ワークフロー集。引用するならクレジット表記が必要。 |

未実施：mg-styles-15 と ClaudeAnimationBase の依存パッケージのインストール（自動の安全確認で止められたため）。動かして試す必要が出たら、そのときに許可をもらって入れる。
