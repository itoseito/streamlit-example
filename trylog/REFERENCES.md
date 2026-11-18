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

## TikTokで紹介されていたツール（2026-11-18 に中身を確認。`/home/user/refs/tools/` に複製して読んだだけで、入れていない）

| 名前 | リポジトリ | 版 | ライセンス | 何ができるか | TRY LOGでの価値 |
|---|---|---|---|---|---|
| Archify | tt-a1i/archify | 4478129 | Apache-2.0 | 説明や計画から、動く図解（HTML）を作る。画像・動画への書き出しもある | **高い**。図解の質を上げられる可能性 |
| UI UX Pro Max | nextlevelbuilder/ui-ux-pro-max-skill | f2cc365 | MIT | 配色・書体・レイアウトの提案。バナーやスライド用のスキルもある | **中**。サムネと画面デザインの見直しに |
| karpathy skills | multica-ai/andrej-karpathy-skills | 2c60614 | **表記なし** | コードを書くときの4つの心得（1ファイル） | 低い。ライセンスがないので写さない |
| Caveman | JuliusBrussee/caveman | a192894 | Apache-2.0 | AIの返事を短くして消費を減らす。通信を中継する仕組みとフックを含む | 低い。説明が読みにくくなる |
| gstack | garrytan/gstack | bbf48aa | MIT | 開発チームの役割（レビュー、QAなど）を再現する71個のスキル | 低い。ソフト開発向け |
| Graphify | Graphify-Labs/graphify | 340268a | Apache-2.0 | 大きなコードや資料を知識グラフにする | 低い。TRY LOGのファイルは少ない |
| ECC | affaan-m/everything-claude-code | 3f14a10 | MIT | 計画→テスト→実装→レビューの開発手順。スキル多数とフック | 低い。ソフト開発向けで、量が多い |
| Matt Pocock skills | mattpocock/skills | 5863806 | MIT | エンジニア向けの39個のスキル | 低い。ソフト開発向け |
| Superpowers | obra/superpowers | 22f0b46 | MIT | ソフト開発の進め方一式。開始時に指示を差し込むフックあり | 低い。ソフト開発向け |

未実施：Archify を動かして試すこと（複製したプログラムの実行が、自動の安全確認で止められた）。使う場合は、ユーザーの許可設定が必要。
