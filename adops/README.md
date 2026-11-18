# adops：AI広告制作の営業台帳ツール

外部への送信・課金はしません。DMと納品は本人が手で送り、その事実を記録します。
実データは `data/`（git管理外）に入ります。Python 3 だけで動きます。

## 毎日の流れ
```
python3 adops/adops.py add --name 店名 --ig アカウント --category 飲食 --area 地域 --source-url 見たURL --reason 提案理由
python3 adops/adops.py draft S001          # 画像プロンプト・DM案・チェック欄を data/shops/ に出力
python3 adops/adops.py approve S001 --count 2   # 生成してよい枚数を承認
python3 adops/adops.py gen S001 --count 2       # 生成した事実を記録（承認枚数を超えると拒否）
#   → 画像を data/shops/S001_*/outputs/ に置く
python3 adops/adops.py qc S001 --file a.png --artifact ok --text ok --match ok
python3 adops/adops.py ready S001 && python3 adops/adops.py queue   # 送信前の一括確認
python3 adops/adops.py sent S001           # 手で送った後に記録
python3 adops/adops.py reply S001 --text "返信の本文"   # 分類と返答案（未送信）
python3 adops/adops.py time S001 --min 15 --kind 営業
python3 adops/adops.py report
```
受注後：`order` → `deliver`（改名・ZIP・納品文）→ `delivered` → `paid`。
複数の候補は `import 候補.csv`（列: name,ig,category,area,source_url,reason）でまとめて登録できます。

## 守っていること
- 同じInstagramアカウントは二重登録できない。送信済み以降の店には新しい提案を作らない。
- 素材承認がないと生成を記録できない。承認枚数を超える生成は拒否。失敗は `gen --failed` で記録し、自動で再試行しない。
- 品質確認（破綻・文字・実物との相違）に全画像が合格するまで送信準備に進めない。
- 写真の利用許可（permit）と素材承認（approve）は別の項目。
- 料金の文言・無料サンプル枚数・固定費は `config.json` だけで管理。null は未確認・未決定。

動作確認：`adops/test_dummy.sh`
