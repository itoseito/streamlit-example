#!/usr/bin/env python3
"""AI広告制作の営業〜納品〜収支を1つの台帳で回す最小ツール（標準ライブラリのみ）。

外部への送信・課金は一切しない。送信は本人が手で行い、その事実を記録する。
データは ADOPS_DATA（既定: リポジトリ直下の data/）に置き、git には入れない。
"""
import argparse
import csv
import datetime as dt
import json
import os
import re
import shutil
import sys
import zipfile
from pathlib import Path

HERE = Path(__file__).resolve().parent
DATA = Path(os.environ.get("ADOPS_DATA", HERE.parent / "data"))
SHOPS, EVENTS = DATA / "shops.csv", DATA / "events.csv"
CFG = json.loads((HERE / "config.json").read_text(encoding="utf-8"))
if (DATA / "config.json").exists():  # 個人名など公開しない設定はこちらで上書き
    CFG.update(json.loads((DATA / "config.json").read_text(encoding="utf-8")))

FIELDS = ["id", "name", "ig", "category", "area", "source_url", "checked_date", "reason",
          "status", "photo_permission", "assets_approved", "approved_count",
          "generated_count", "credits_used", "sent_date", "reply_date", "reply_class",
          "order_amount", "delivered_date", "paid_amount", "paid_date", "note"]
EV_FIELDS = ["ts", "shop_id", "action", "result", "detail", "minutes", "cost_yen"]
STATUS = ["候補", "下書き済", "送信承認待ち", "送信済", "返信あり", "受注", "納品済", "入金済", "見送り"]
IMG_EXT = {".png", ".jpg", ".jpeg", ".webp"}


def die(msg):
    sys.exit(f"中止: {msg}")


def today():
    return dt.date.today().isoformat()


def norm_ig(s):
    s = (s or "").strip().lower()
    s = re.sub(r"^https?://(www\.)?instagram\.com/", "", s)
    return s.split("?")[0].strip("/@ ")


def load():
    if not SHOPS.exists():
        return []
    with SHOPS.open(encoding="utf-8-sig", newline="") as f:
        return list(csv.DictReader(f))


def save(rows):
    DATA.mkdir(parents=True, exist_ok=True)
    tmp = SHOPS.with_suffix(".tmp")
    with tmp.open("w", encoding="utf-8-sig", newline="") as f:
        w = csv.DictWriter(f, FIELDS)
        w.writeheader()
        w.writerows(rows)
    tmp.replace(SHOPS)


def log(shop_id, action, result="実行", detail="", minutes=0, cost=0):
    DATA.mkdir(parents=True, exist_ok=True)
    new = not EVENTS.exists()
    with EVENTS.open("a", encoding="utf-8-sig", newline="") as f:
        w = csv.writer(f)
        if new:
            w.writerow(EV_FIELDS)
        w.writerow([dt.datetime.now().isoformat(timespec="seconds"), shop_id, action,
                    result, detail, minutes, cost])


def get(rows, sid):
    for r in rows:
        if r["id"] == sid:
            return r
    die(f"店ID {sid} は台帳にありません")


def after(r, status):
    return STATUS.index(r["status"]) >= STATUS.index(status) and r["status"] != "見送り"


def shop_dir(r):
    d = DATA / "shops" / f"{r['id']}_{norm_ig(r['ig']) or 'noig'}"
    for sub in ("assets", "outputs", "delivery"):
        (d / sub).mkdir(parents=True, exist_ok=True)
    return d


def outputs(r):
    return sorted(p for p in (shop_dir(r) / "outputs").iterdir() if p.suffix.lower() in IMG_EXT)


def qc_state(r):
    p = shop_dir(r) / "qc.json"
    return json.loads(p.read_text(encoding="utf-8")) if p.exists() else {}


# ---------- 候補の登録と重複除外 ----------
def add_one(rows, name, ig, category, area, source_url, reason):
    key = norm_ig(ig)
    if not source_url or not reason:
        return None, "情報源URLと提案理由は必須"
    for r in rows:
        if key and norm_ig(r["ig"]) == key:
            return None, f"重複（{r['id']} {r['name']}・状態:{r['status']}）"
        if not key and r["name"] == name and r["area"] == area:
            return None, f"重複（{r['id']} 同名・同エリア）"
    sid = f"S{len(rows) + 1:03d}"
    rows.append({**dict.fromkeys(FIELDS, ""), "id": sid, "name": name, "ig": key,
                 "category": category, "area": area, "source_url": source_url,
                 "checked_date": today(), "reason": reason, "status": "候補",
                 "photo_permission": "未確認", "assets_approved": "未",
                 "approved_count": "0", "generated_count": "0", "credits_used": "0"})
    return sid, "登録"


def cmd_add(a):
    rows = load()
    sid, msg = add_one(rows, a.name, a.ig, a.category, a.area, a.source_url, a.reason)
    log(sid or "-", "候補登録", "実行" if sid else "拒否", f"{a.name}: {msg}")
    if not sid:
        die(msg)
    if a.sent_date:
        r = rows[-1]
        r["status"], r["sent_date"], r["note"] = "送信済", a.sent_date, "ツール導入前に本人が送信"
        r["generated_count"], r["approved_count"] = str(a.sent_count), str(a.sent_count)
        log(sid, "送信記録", detail=f"導入前の送信を取り込み（{a.sent_date}・{a.sent_count}枚）")
    save(rows)
    print(f"{sid} を登録しました（{a.name}）")


def cmd_import(a):
    rows, ok = load(), 0
    with open(a.csv, encoding="utf-8-sig", newline="") as f:
        for c in csv.DictReader(f):
            sid, msg = add_one(rows, c.get("name", ""), c.get("ig", ""), c.get("category", ""),
                               c.get("area", ""), c.get("source_url", ""), c.get("reason", ""))
            log(sid or "-", "候補登録", "実行" if sid else "拒否", f"{c.get('name')}: {msg}")
            print(f"{sid or '--'}  {c.get('name')}: {msg}")
            ok += bool(sid)
    save(rows)
    print(f"{ok}件を登録")


# ---------- 下書き ----------
SCENES = {
    "飲食": ["看板メニューを主役にした、自然光の入るテーブルの俯瞰カット", "湯気や質感が伝わる寄りのカット", "店内の雰囲気が分かる引きのカット"],
    "美容": ["仕上がりの質感が伝わる、やわらかい光の横顔カット", "施術スペースの清潔感が伝わる引きのカット", "使用アイテムを並べた静物カット"],
    "物販": ["商品を主役にした、背景を整理した正面カット", "使っている場面が想像できる生活シーンのカット", "素材や細部が分かる寄りのカット"],
}


def cmd_draft(a):
    rows = load()
    r = get(rows, a.id)
    if after(r, "送信済") or r["status"] == "見送り":
        log(r["id"], "下書き", "拒否", f"状態:{r['status']}")
        die(f"{r['name']} は状態「{r['status']}」のため、新しい提案は作りません（重複提案の防止）")
    d = shop_dir(r)
    scenes = SCENES.get(r["category"], SCENES["物販"])
    has_photo = r["photo_permission"] == "許可あり"
    base = ("添付した店の実写真の被写体・色・形を変えずに、" if has_photo else
            "特定の実在商品に見えない一般的なイメージとして、")
    prompts = [f"{i}. {base}{s}。Instagramフィード用の縦長4:5、写実的な写真調。"
               f"文字・ロゴ・看板の文言は入れない。" for i, s in enumerate(scenes, 1)]
    n = CFG["free_sample_count"]
    sample = f"サンプル画像を{n}枚" if n else "サンプル画像を"
    sender = CFG["sender_name"] or "（名前：未設定）"
    dm = (f"{r['name']} ご担当者さま\n\n突然のご連絡失礼します。地元でお店の広告用画像を作っている{sender}です。\n"
          f"Instagramを拝見して、お店の雰囲気に合いそうな{sample}無料でお作りしました。よければご覧ください。\n"
          f"気に入っていただけた場合の制作は、{CFG['paid_terms']}。\n"
          f"不要でしたら返信なしで大丈夫です。")
    tpl = DATA / "dm_template.txt"
    if tpl.exists():
        dm = tpl.read_text(encoding="utf-8").format(name=r["name"], reason=r["reason"], n=n or "")
    brief = f"""# {r['id']} {r['name']}（{r['category']}・{r['area']}）
- Instagram: https://www.instagram.com/{r['ig']}/
- 情報源: {r['source_url']}（確認日 {r['checked_date']}）
- 提案理由: {r['reason']}
- 予算・購入意欲: 未確認（公開情報からは判断しない）
- 既存写真の利用許可: {r['photo_permission']}　／　素材の承認: {r['assets_approved']}（承認枚数 {r['approved_count']}）

## 画像プロンプト案
{chr(10).join(prompts)}

{'実写真を参照画像として使う。' if has_photo else '※写真の利用許可が未確認のため、店の写真は参照に使わない。実在の商品・内装の再現はしない。'}

## DM案（送信は本人が手動。未送信）
{dm}

## 送信前チェック（qc コマンドで記録）
- [ ] 画像の破綻（手・器・文字化け・不自然な形）がない
- [ ] 画像内に誤った文字・店名がない
- [ ] 実際の商品・店と違う内容を「この店のもの」として見せていない
- [ ] 写真利用許可と素材承認の状態を確認した
"""
    (d / "brief.md").write_text(brief, encoding="utf-8")
    (d / "dm.txt").write_text(dm, encoding="utf-8")
    if r["status"] == "候補":
        r["status"] = "下書き済"
    save(rows)
    log(r["id"], "下書き", detail=str(d / "brief.md"))
    print(f"下書きを作成: {d / 'brief.md'}")


# ---------- 素材・生成・品質 ----------
def cmd_permit(a):
    rows = load()
    r = get(rows, a.id)
    r["photo_permission"] = a.photo
    save(rows)
    log(r["id"], "写真利用許可", detail=a.photo)
    print(f"{r['name']}: 写真利用許可 = {a.photo}")


def cmd_approve(a):
    rows = load()
    r = get(rows, a.id)
    r["assets_approved"], r["approved_count"] = "済", str(a.count)
    save(rows)
    log(r["id"], "素材承認", detail=f"{a.count}枚まで {a.note}")
    print(f"{r['name']}: 生成は{a.count}枚まで承認")


def cmd_gen(a):
    """生成を実行した事実の記録。承認枚数を超える分は拒否する。"""
    rows = load()
    r = get(rows, a.id)
    done, cap = int(r["generated_count"]), int(r["approved_count"])
    if r["assets_approved"] != "済":
        log(r["id"], "生成", "拒否", "素材未承認")
        die("素材が未承認です（approve を先に）")
    if a.failed:
        log(r["id"], "生成", "失敗", f"{a.count}枚 {a.note}（自動再試行なし）")
        print("失敗を記録しました。再実行は本人が判断してください。")
        return
    if done + a.count > cap:
        log(r["id"], "生成", "拒否", f"承認{cap}枚・済{done}枚・要求{a.count}枚")
        die(f"承認枚数を超えます（承認{cap}・生成済{done}）")
    credits = a.credits if a.credits is not None else a.count * CFG["credit_per_image"]
    r["generated_count"] = str(done + a.count)
    r["credits_used"] = str(float(r["credits_used"]) + credits)
    save(rows)
    log(r["id"], "生成", detail=f"{a.count}枚 契約内クレジット{credits}（追加支出0円）")
    print(f"生成を記録: {a.count}枚 / クレジット{credits}。画像は {shop_dir(r) / 'outputs'} に置いてください")


def cmd_qc(a):
    rows = load()
    r = get(rows, a.id)
    names = [p.name for p in outputs(r)]
    if a.file not in names:
        die(f"outputs に {a.file} がありません（あるもの: {names}）")
    st = qc_state(r)
    ok = a.artifact == "ok" and a.text == "ok" and a.match == "ok"
    st[a.file] = {"破綻": a.artifact, "文字": a.text, "実物との相違": a.match, "合格": ok, "日付": today()}
    (shop_dir(r) / "qc.json").write_text(json.dumps(st, ensure_ascii=False, indent=1), encoding="utf-8")
    log(r["id"], "品質確認", "合格" if ok else "不合格", a.file)
    print(f"{a.file}: {'合格' if ok else '不合格（送信・納品に使えません）'}")


def passed(r):
    st = qc_state(r)
    return [p for p in outputs(r) if st.get(p.name, {}).get("合格")]


def cmd_ready(a):
    rows = load()
    r = get(rows, a.id)
    if after(r, "送信済"):
        die(f"状態「{r['status']}」です。二重送信防止のため進めません")
    d = shop_dir(r)
    problems = []
    if not (d / "dm.txt").exists():
        problems.append("DM下書きがない（draft）")
    if not outputs(r):
        problems.append("outputs に画像がない")
    if len(passed(r)) != len(outputs(r)):
        problems.append("品質確認が未実施または不合格の画像がある（qc）")
    if problems:
        log(r["id"], "送信準備", "拒否", "; ".join(problems))
        die(" / ".join(problems))
    r["status"] = "送信承認待ち"
    save(rows)
    log(r["id"], "送信準備")
    print(f"{r['name']} を送信承認待ちにしました。queue で一覧を確認してください")


def cmd_queue(a):
    rows = [r for r in load() if r["status"] == "送信承認待ち"]
    if not rows:
        print("送信承認待ちはありません")
    for r in rows:
        d = shop_dir(r)
        print(f"\n===== {r['id']} {r['name']} =====\n送信先: https://www.instagram.com/{r['ig']}/\n"
              f"写真利用許可: {r['photo_permission']} / 素材承認: {r['assets_approved']}\n"
              f"添付: {', '.join(p.name for p in passed(r))}（{d / 'outputs'}）\n金額: 無料サンプル（請求なし）\n"
              f"--- 文面 ---\n{(d / 'dm.txt').read_text(encoding='utf-8')}\n"
              f"→ 手で送ったら: adops.py sent {r['id']}")


# ---------- 送信・返信・受注・入金 ----------
def cmd_sent(a):
    rows = load()
    r = get(rows, a.id)
    if r["status"] != "送信承認待ち":
        log(r["id"], "送信記録", "拒否", f"状態:{r['status']}")
        die(f"状態「{r['status']}」です。送信承認待ちの店だけ記録できます")
    r["status"], r["sent_date"] = "送信済", a.date or today()
    save(rows)
    log(r["id"], "送信記録", detail="本人が手動送信")
    print(f"{r['name']}: 送信済（{r['sent_date']}）")


RULES = [("断り", ["結構", "不要", "間に合って", "遠慮", "お断り", "大丈夫です"]),
         ("価格の質問", ["料金", "いくら", "費用", "値段", "価格", "おいくら"]),
         ("興味あり", ["興味", "お願い", "ぜひ", "詳しく", "使いたい", "いいですね", "素敵"]),
         ("質問", ["？", "?", "教えて"])]
REPLY = {
    "断り": "ご返信ありがとうございます。承知しました。また機会があればよろしくお願いします。",
    "価格の質問": "ご返信ありがとうございます。料金は、{terms}。まずは使いたい場面（投稿・チラシなど）を教えていただければ、合わせてお作りします。",
    "興味あり": "ありがとうございます。使いたい場面と、載せたいメニューや商品を教えてください。お店の写真を使ってよければ、何枚か送っていただけると実物に合わせて作れます。料金は、{terms}。",
    "質問": "ご質問ありがとうございます。（質問への回答をここに書く）",
    "その他": "ご返信ありがとうございます。（内容を確認して返答を書く）",
}


def cmd_reply(a):
    rows = load()
    r = get(rows, a.id)
    if not after(r, "送信済"):
        die("未送信の店です。送信記録がない返信は登録できません")
    cls = next((c for c, ws in RULES if any(w in a.text for w in ws)), "その他")
    r["reply_date"], r["reply_class"] = a.date or today(), cls
    if r["status"] == "送信済":
        r["status"] = "見送り" if cls == "断り" else "返信あり"
    save(rows)
    draft = REPLY[cls].format(terms=CFG["paid_terms"])
    d = shop_dir(r)
    (d / "reply_draft.txt").write_text(f"[受信] {a.text}\n[分類] {cls}（自動・要確認）\n[返答案・未送信]\n{draft}\n", encoding="utf-8")
    log(r["id"], "返信記録", detail=f"{cls}: {a.text[:60]}")
    print(f"分類: {cls}（自動分類なので本人が確認）\n返答案（未送信）:\n{draft}")


def cmd_order(a):
    rows = load()
    r = get(rows, a.id)
    if not after(r, "送信済"):
        die("未送信の店に受注は記録できません")
    r["status"], r["order_amount"] = "受注", str(a.amount)
    save(rows)
    log(r["id"], "受注", detail=f"{a.amount}円（入金は別途記録）")
    print(f"{r['name']}: 受注 {a.amount}円（未入金）")


def cmd_deliver(a):
    rows = load()
    r = get(rows, a.id)
    if r["status"] not in ("受注", "納品済"):
        die("受注記録のある店だけ納品物をまとめられます")
    files = passed(r)
    if not files or len(files) != len(outputs(r)):
        die("品質確認に合格していない画像があります")
    d = shop_dir(r) / "delivery"
    stamp = today().replace("-", "")
    slug = norm_ig(r["ig"]) or r["id"]
    for old in d.iterdir():
        old.unlink()
    named = []
    for i, p in enumerate(files, 1):
        dst = d / f"{r['id']}_{slug}_{stamp}_{i:02d}{p.suffix.lower()}"
        shutil.copy2(p, dst)
        named.append(dst)
    zp = d / f"{r['id']}_{slug}_{stamp}.zip"
    with zipfile.ZipFile(zp, "w", zipfile.ZIP_DEFLATED) as z:
        for p in named:
            z.write(p, p.name)
    msg = (f"{r['name']} ご担当者さま\n\n画像{len(named)}枚が完成しました。添付をご確認ください。\n"
           f"修正したい点があれば遠慮なくお知らせください。\nお支払いは、{CFG['paid_terms']}。")
    (d / "delivery_message.txt").write_text(msg, encoding="utf-8")
    r["status"], r["delivered_date"] = "納品済", ""
    save(rows)
    log(r["id"], "納品物整理", detail=f"{zp.name}（納品の送信は未実施）")
    print(f"納品物: {zp}\n納品メッセージ（未送信）: {d / 'delivery_message.txt'}\n送ったら: adops.py delivered {r['id']}")


def cmd_delivered(a):
    rows = load()
    r = get(rows, a.id)
    if r["status"] != "納品済":
        die("deliver で納品物をまとめてから記録してください")
    r["delivered_date"] = a.date or today()
    save(rows)
    log(r["id"], "納品送信記録", detail="本人が手動送信")
    print(f"{r['name']}: 納品完了（{r['delivered_date']}）")


def cmd_paid(a):
    rows = load()
    r = get(rows, a.id)
    if not r["order_amount"]:
        die("受注記録がありません")
    r["status"], r["paid_amount"], r["paid_date"] = "入金済", str(a.amount), a.date or today()
    save(rows)
    log(r["id"], "入金", detail=f"{a.amount}円（本人が入金を確認）")
    print(f"{r['name']}: 入金 {a.amount}円")


def cmd_time(a):
    log(a.id, "作業時間", detail=a.kind, minutes=a.min)
    print(f"{a.min}分を記録（{a.kind}）")


def cmd_cost(a):
    log(a.id, "変動費", detail=a.note, cost=a.yen)
    print(f"変動費 {a.yen}円を記録")


# ---------- 集計 ----------
def cmd_report(a):
    rows, month = load(), a.month or today()[:7]
    ev = []
    if EVENTS.exists():
        with EVENTS.open(encoding="utf-8-sig", newline="") as f:
            ev = [e for e in csv.DictReader(f) if e["ts"].startswith(month)]
    minutes = sum(float(e["minutes"] or 0) for e in ev)
    var = sum(float(e["cost_yen"] or 0) for e in ev)
    sent = [r for r in rows if r["sent_date"].startswith(month)]
    replied = [r for r in sent if r["reply_date"]]
    sales = sum(float(r["order_amount"] or 0) for r in rows if r["order_amount"] and
                any(e["shop_id"] == r["id"] and e["action"] == "受注" for e in ev))
    cash = sum(float(r["paid_amount"] or 0) for r in rows if r["paid_date"].startswith(month))
    fixed_known = {k: v for k, v in CFG["fixed_costs_monthly_yen"].items() if v is not None}
    fixed_unknown = [k for k, v in CFG["fixed_costs_monthly_yen"].items() if v is None]
    fixed = sum(fixed_known.values())
    profit = sales - var - fixed
    credits = sum(float(r["credits_used"] or 0) for r in rows)
    print(f"""=== AI広告制作 {month} ===
台帳: {len(rows)}店（{', '.join(f'{s}{n}' for s in STATUS if (n := sum(r['status'] == s for r in rows)))}）
送信 {len(sent)} / 返信 {len(replied)} / 返信率 {f'{len(replied) / len(sent):.0%}' if sent else '—'}
売上（受注額）   {sales:,.0f}円
入金             {cash:,.0f}円
変動費（追加支出）{var:,.0f}円
固定費           {fixed:,.0f}円{'　※未確認のため未計上: ' + '、'.join(fixed_unknown) if fixed_unknown else ''}
営業利益         {profit:,.0f}円{'（固定費が未確認のため暫定）' if fixed_unknown else ''}
作業時間         {minutes / 60:.1f}時間
時間あたり利益   {f'{profit / (minutes / 60):,.0f}円/時' if minutes else '—（作業時間の記録なし）'}
契約内クレジット消費（累計・追加支出ではない） {credits:g}
失敗・拒否の記録 {sum(e['result'] in ('失敗', '拒否') for e in ev)}件（events.csv 参照）""")


def cmd_list(a):
    for r in load():
        print(f"{r['id']} [{r['status']}] {r['name']} @{r['ig']} 許可:{r['photo_permission']} 承認:{r['assets_approved']}")


def main():
    p = argparse.ArgumentParser(description=__doc__)
    s = p.add_subparsers(dest="cmd", required=True)

    def sub(name, fn, *args):
        sp = s.add_parser(name)
        for flags, kw in args:
            sp.add_argument(*flags, **kw)
        sp.set_defaults(fn=fn)

    ID = (("id",), {})
    DATE = (("--date",), {})
    sub("add", cmd_add, (("--name",), {"required": True}), (("--ig",), {"default": ""}),
        (("--category",), {"default": "物販", "choices": list(SCENES)}), (("--area",), {"default": ""}),
        (("--source-url",), {"required": True}), (("--reason",), {"required": True}),
        (("--sent-date",), {"help": "導入前に送信済みの店。日付が不明なら 不明"}), (("--sent-count",), {"type": int, "default": 0}))
    sub("import", cmd_import, (("csv",), {}))
    sub("list", cmd_list)
    sub("draft", cmd_draft, ID)
    sub("permit", cmd_permit, ID, (("--photo",), {"required": True, "choices": ["未確認", "許可あり", "不可"]}))
    sub("approve", cmd_approve, ID, (("--count",), {"type": int, "required": True}), (("--note",), {"default": ""}))
    sub("gen", cmd_gen, ID, (("--count",), {"type": int, "required": True}), (("--credits",), {"type": float}),
        (("--failed",), {"action": "store_true"}), (("--note",), {"default": ""}))
    OK = {"choices": ["ok", "ng"], "required": True}
    sub("qc", cmd_qc, ID, (("--file",), {"required": True}), (("--artifact",), OK), (("--text",), OK), (("--match",), OK))
    sub("ready", cmd_ready, ID)
    sub("queue", cmd_queue)
    sub("sent", cmd_sent, ID, DATE)
    sub("reply", cmd_reply, ID, (("--text",), {"required": True}), DATE)
    sub("order", cmd_order, ID, (("--amount",), {"type": int, "required": True}))
    sub("deliver", cmd_deliver, ID)
    sub("delivered", cmd_delivered, ID, DATE)
    sub("paid", cmd_paid, ID, (("--amount",), {"type": int, "required": True}), DATE)
    sub("time", cmd_time, ID, (("--min",), {"type": int, "required": True}), (("--kind",), {"default": "営業"}))
    sub("cost", cmd_cost, ID, (("--yen",), {"type": int, "required": True}), (("--note",), {"default": ""}))
    sub("report", cmd_report, (("--month",), {}))
    a = p.parse_args()
    a.fn(a)


if __name__ == "__main__":
    main()
