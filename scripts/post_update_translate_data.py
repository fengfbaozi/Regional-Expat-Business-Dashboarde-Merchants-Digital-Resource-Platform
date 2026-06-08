#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
数据更新后的离线多语填充（火山方舟 /responses，与 translate_content_api.py 同配置）。

- date/qiaowu-news.json：为每条 items 写入 i18n.{en-US,th,id,vi,ms,fil}.title/summary，并同步 title_en/summary_en。
- date/merchants-i18n.json：按「city|country|merchant_name」键写入各语言 merchant_name / merchant_desc（CSV 原文为中文基线）。

仅补缺：某语言字段非空则跳过，减少重复计费。商户条数多时可设 --max-merchants。

用法（项目根）：
  py -3 scripts/post_update_translate_data.py
  py -3 scripts/post_update_translate_data.py --no-merchants
  YXQ_SKIP_POST_I18N=1 py -3 one-click-update.py   # 跳过本步需在 one-click 内识别
"""
from __future__ import annotations

import argparse
import csv
import json
import sys
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
if str(ROOT / "scripts") not in sys.path:
    sys.path.insert(0, str(ROOT / "scripts"))

from translate_content_api import (  # noqa: E402
    SUPPORTED_LANGUAGES,
    translate_text_responses,
    _configure_stdio_utf8,
)
from volc_keys import get_translation_responses_runtime  # noqa: E402

QIAOWU_PATH = ROOT / "date" / "qiaowu-news.json"
MERCHANTS_CSV = ROOT / "date" / "merchants.csv"
MERCHANTS_I18N_PATH = ROOT / "date" / "merchants-i18n.json"

# (bundle_locale, api_lang_code) 与 js/i18n.js 一致
# 注意：fil（菲律宾语）已移除，因为翻译 API 不支持该语言
LOCALE_PAIRS: list[tuple[str, str]] = [
    ("en-US", "en"),
    ("th", "th"),
    ("id", "id"),
    ("vi", "vi"),
    ("ms", "ms"),
]


def _sleep_soft() -> None:
    time.sleep(0.06)


def _ensure_tr(api_key: str, endpoint: str, model: str, text: str, api_lang: str) -> str:
    t = (text or "").strip()
    if not t:
        return ""
    if api_lang not in SUPPORTED_LANGUAGES:
        raise ValueError(f"不支持的目标语言 API 码: {api_lang}")
    return translate_text_responses(api_key, endpoint, model, t, api_lang)


def patch_qiaowu_items(
    items: list[dict],
    api_key: str,
    endpoint: str,
    model: str,
    max_rows: int,
) -> tuple[list[dict], int]:
    calls = 0
    out_rows: list[dict] = []
    for idx, row in enumerate(items):
        if not isinstance(row, dict):
            out_rows.append(row)
            continue
        if max_rows > 0 and idx >= max_rows:
            out_rows.append(row)
            continue
        title_zh = str(row.get("title") or "").strip()
        summary_zh = str(row.get("summary") or "").strip()
        if not title_zh:
            out_rows.append(row)
            continue
        i18n: dict = dict(row.get("i18n")) if isinstance(row.get("i18n"), dict) else {}
        for loc, api_lang in LOCALE_PAIRS:
            block = i18n.get(loc) if isinstance(i18n.get(loc), dict) else {}
            need_title = title_zh and not str(block.get("title") or "").strip()
            need_sum = summary_zh and not str(block.get("summary") or "").strip()
            if not need_title and not need_sum:
                if block:
                    i18n[loc] = block
                continue
            new_b = dict(block)
            if need_title:
                new_b["title"] = _ensure_tr(api_key, endpoint, model, title_zh, api_lang)
                calls += 1
                _sleep_soft()
            if need_sum:
                new_b["summary"] = _ensure_tr(api_key, endpoint, model, summary_zh, api_lang)
                calls += 1
                _sleep_soft()
            i18n[loc] = new_b
        nrow = dict(row)
        if i18n:
            nrow["i18n"] = i18n
        en_b = i18n.get("en-US") if isinstance(i18n.get("en-US"), dict) else {}
        if str(en_b.get("title") or "").strip():
            nrow["title_en"] = str(en_b["title"]).strip()
        if str(en_b.get("summary") or "").strip():
            nrow["summary_en"] = str(en_b["summary"]).strip()
        out_rows.append(nrow)
    return out_rows, calls


def _merchant_row_key(city: str, country: str, name: str) -> str:
    return "|".join(
        [
            str(city or "").strip(),
            str(country or "").strip(),
            str(name or "").strip(),
        ]
    )


def patch_merchants_sidecar(
    api_key: str,
    endpoint: str,
    model: str,
    max_rows: int,
) -> int:
    if not MERCHANTS_CSV.is_file():
        print(f"[skip] 无 {MERCHANTS_CSV}", file=sys.stderr)
        return 0
    existing: dict = {}
    if MERCHANTS_I18N_PATH.is_file():
        try:
            raw = json.loads(MERCHANTS_I18N_PATH.read_text(encoding="utf-8"))
            if isinstance(raw, dict) and isinstance(raw.get("keys"), dict):
                existing = raw["keys"]
        except (OSError, json.JSONDecodeError):
            existing = {}
    calls = 0
    with open(MERCHANTS_CSV, "r", encoding="utf-8-sig", newline="") as f:
        reader = csv.DictReader(f)
        rows = list(reader)
    if max_rows > 0:
        rows = rows[:max_rows]
    for r in rows:
        city = str(r.get("city") or "").strip()
        country = str(r.get("country") or "").strip()
        name = str(r.get("merchant_name") or "").strip()
        desc = str(r.get("merchant_desc") or "").strip()
        if not city or not country or not name:
            continue
        key = _merchant_row_key(city, country, name)
        bucket: dict = existing.get(key) if isinstance(existing.get(key), dict) else {}
        for loc, api_lang in LOCALE_PAIRS:
            lb = bucket.get(loc) if isinstance(bucket.get(loc), dict) else {}
            need_n = name and not str(lb.get("merchant_name") or "").strip()
            need_d = desc and not str(lb.get("merchant_desc") or "").strip()
            if not need_n and not need_d:
                bucket[loc] = lb
                continue
            nlb = dict(lb)
            if need_n:
                nlb["merchant_name"] = _ensure_tr(api_key, endpoint, model, name, api_lang)
                calls += 1
                _sleep_soft()
            if need_d:
                nlb["merchant_desc"] = _ensure_tr(api_key, endpoint, model, desc, api_lang)
                calls += 1
                _sleep_soft()
            bucket[loc] = nlb
        existing[key] = bucket
    payload = {"version": 1, "keys": existing}
    MERCHANTS_I18N_PATH.write_text(
        json.dumps(payload, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    print(f"[ok] 已写入 {MERCHANTS_I18N_PATH}（{len(existing)} 个键）", file=sys.stderr)
    return calls


def main() -> int:
    _configure_stdio_utf8()
    ap = argparse.ArgumentParser(description="更新后批量写入 qiaowu/merchants 多语字段")
    ap.add_argument("--no-qiaowu", action="store_true", help="跳过侨情 JSON")
    ap.add_argument("--no-merchants", action="store_true", help="跳过商户侧写")
    ap.add_argument("--max-qiaowu", type=int, default=0, help="最多处理侨情条数，0 表示全部")
    ap.add_argument("--max-merchants", type=int, default=0, help="最多处理 CSV 前 N 行，0 表示全部")
    args = ap.parse_args()

    rt = get_translation_responses_runtime()
    if not rt.get("enabled", True):
        print("翻译能力已禁用（volc-ark-apis），跳过。", file=sys.stderr)
        return 0
    api_key = (rt.get("api_key") or "").strip()
    endpoint = (rt.get("endpoint") or "").strip()
    model = (rt.get("model") or "").strip()
    if not api_key or not endpoint or not model:
        print("未配置 translation Api：跳过 post_update_translate_data。", file=sys.stderr)
        return 0

    total_calls = 0
    if not args.no_qiaowu and QIAOWU_PATH.is_file():
        try:
            data = json.loads(QIAOWU_PATH.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError) as e:
            print(f"读取 qiaowu-news 失败: { e }", file=sys.stderr)
            return 1
        items = data.get("items") if isinstance(data, dict) else data
        if not isinstance(items, list):
            print("qiaowu-news.json 格式非 items 列表", file=sys.stderr)
            return 1
        new_items, c = patch_qiaowu_items(items, api_key, endpoint, model, args.max_qiaowu)
        total_calls += c
        out_obj = {"items": new_items} if isinstance(data, dict) else new_items
        if isinstance(data, dict):
            QIAOWU_PATH.write_text(json.dumps(out_obj, ensure_ascii=False, indent=2), encoding="utf-8")
        else:
            QIAOWU_PATH.write_text(json.dumps(new_items, ensure_ascii=False, indent=2), encoding="utf-8")
        print(f"[ok] 已更新 {QIAOWU_PATH}，约 {c} 次翻译调用", file=sys.stderr)
    elif not args.no_qiaowu:
        print(f"[skip] 无 {QIAOWU_PATH}", file=sys.stderr)

    if not args.no_merchants:
        total_calls += patch_merchants_sidecar(api_key, endpoint, model, args.max_merchants)

    print(f"完成，累计约 {total_calls} 次 /responses 翻译调用。", file=sys.stderr)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
