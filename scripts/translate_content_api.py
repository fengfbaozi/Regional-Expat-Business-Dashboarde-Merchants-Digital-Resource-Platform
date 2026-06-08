#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
批量多语翻译：走火山方舟 **翻译专用** /api/v3/responses（与 date/volc-ark-apis.json
中 ARK_TRANSLATION_RESPONSES_DEFAULTS、translationApiKey 一致；勿与 chat/completions 混用）。

配置：仅读 date/volc-ark-apis.json（translationApiKey 可空则回退 dataApiKey）。
可选覆盖：ARK_API_KEY、ARK_TRANSLATION_ENDPOINT、ARK_TRANSLATION_MODEL。

运行（项目根目录）：
  py -3 scripts/translate_content_api.py <输入文件> <目标语言代码>
"""

from __future__ import annotations

import json
import os
import sys
from pathlib import Path

from deps_bootstrap import ensure_requests

ensure_requests()

import requests

from volc_keys import get_translation_responses_runtime

ROOT = Path(__file__).resolve().parent.parent

SUPPORTED_LANGUAGES = {
    "zh": "中文",
    "en": "英文",
    "th": "泰语",
    "vi": "越南语",
    "ms": "马来语",
    "id": "印尼语",
    "fil": "菲律宾语",
}


def _configure_stdio_utf8() -> None:
    for stream in (sys.stdout, sys.stderr):
        if hasattr(stream, "reconfigure"):
            try:
                stream.reconfigure(encoding="utf-8", errors="replace")
            except Exception:
                pass


def _extract_responses_output_text(data: object) -> str:
    """与 js/i18n.js extractResponsesOutputText 对齐。"""
    if not isinstance(data, dict):
        return ""
    err = data.get("error")
    if err and isinstance(err, dict):
        raise RuntimeError(str(err.get("message") or err.get("code") or "API error"))
    ot = data.get("output_text")
    if isinstance(ot, str) and ot.strip():
        return ot.strip()
    out = data.get("output")
    if isinstance(out, list):
        acc: list[str] = []
        for block in out:
            if not isinstance(block, dict):
                continue
            cont = block.get("content")
            if isinstance(cont, list):
                for cpart in cont:
                    if not isinstance(cpart, dict):
                        continue
                    typ = cpart.get("type")
                    if typ in ("output_text", "text") and cpart.get("text") is not None:
                        acc.append(str(cpart.get("text") or ""))
            if isinstance(block.get("text"), str):
                acc.append(block["text"])
        if acc:
            return "".join(acc).strip()
    ch = (data.get("choices") or [{}])[0] if data.get("choices") else {}
    if isinstance(ch, dict):
        msg = ch.get("message") or {}
        if isinstance(msg, dict):
            content = msg.get("content")
            if isinstance(content, str):
                return content.strip()
    return ""


def _source_language_for_target(target_lang: str) -> str:
    """默认素材为中文；译回中文时假定源文为英文。"""
    if target_lang == "zh":
        return "en"
    return "zh"


def translate_text_responses(
    api_key: str,
    endpoint: str,
    model: str,
    text: str,
    target_lang: str,
) -> str:
    source_lang = _source_language_for_target(target_lang)
    body = {
        "model": model,
        "input": [
            {
                "role": "user",
                "content": [
                    {
                        "type": "input_text",
                        "text": str(text or ""),
                        "translation_options": {
                            "source_language": source_lang,
                            "target_language": target_lang,
                        },
                    },
                ],
            },
        ],
    }
    headers = {
        "Authorization": "Bearer " + api_key,
        "Content-Type": "application/json",
    }
    r = requests.post(endpoint, headers=headers, json=body, timeout=120)
    if not r.ok:
        code = getattr(r, "status_code", getattr(r, "status", "?"))
        raise RuntimeError(f"responses HTTP {code}: {r.text[:500]}")
    data = r.json()
    return _extract_responses_output_text(data)


def translate_dict(
    api_key: str,
    endpoint: str,
    model: str,
    data: dict,
    target_lang: str,
) -> dict:
    result = {}
    for key, value in data.items():
        if isinstance(value, str):
            try:
                result[key] = translate_text_responses(api_key, endpoint, model, value, target_lang)
            except Exception as e:
                print(f"翻译字段 {key} 失败：{e}", file=sys.stderr)
                result[key] = value
        elif isinstance(value, dict):
            result[key] = translate_dict(api_key, endpoint, model, value, target_lang)
        elif isinstance(value, list):
            result[key] = translate_list(api_key, endpoint, model, value, target_lang)
        else:
            result[key] = value
    return result


def translate_list(
    api_key: str,
    endpoint: str,
    model: str,
    data: list,
    target_lang: str,
) -> list:
    result = []
    for item in data:
        if isinstance(item, str):
            try:
                result.append(translate_text_responses(api_key, endpoint, model, item, target_lang))
            except Exception as e:
                print(f"翻译文本失败：{e}", file=sys.stderr)
                result.append(item)
        elif isinstance(item, dict):
            result.append(translate_dict(api_key, endpoint, model, item, target_lang))
        elif isinstance(item, list):
            result.append(translate_list(api_key, endpoint, model, item, target_lang))
        else:
            result.append(item)
    return result


def main() -> int:
    _configure_stdio_utf8()
    rt = get_translation_responses_runtime()
    if not rt.get("enabled", True):
        print("volc-ark-apis.json 中 TRANSLATION_ARK.enabled 为 false，已跳过翻译。", file=sys.stderr)
        return 1
    api_key = (rt.get("api_key") or "").strip()
    endpoint = (rt.get("endpoint") or "").strip()
    model = (rt.get("model") or "").strip()
    if not api_key:
        print(
            "未配置翻译/数据 Key：请在 date/volc-ark-apis.json 填写 translationApiKey 或 dataApiKey，"
            "或设置 ARK_API_KEY",
            file=sys.stderr,
        )
        return 1
    if not endpoint or not model:
        print(
            "未配置翻译接入点：请在 date/volc-ark-apis.json 填写 ARK_TRANSLATION_RESPONSES_DEFAULTS "
            "（endpoint、model）。",
            file=sys.stderr,
        )
        return 1

    if len(sys.argv) < 3:
        print("用法: py -3 scripts/translate_content_api.py <输入文件> <目标语言代码>", file=sys.stderr)
        print(f"支持的语言代码: {', '.join(SUPPORTED_LANGUAGES.keys())}", file=sys.stderr)
        print("示例: py -3 scripts/translate_content_api.py date/industry.csv en", file=sys.stderr)
        return 1

    input_file = Path(sys.argv[1])
    target_lang = sys.argv[2]

    if target_lang not in SUPPORTED_LANGUAGES:
        print(f"不支持的语言代码: {target_lang}", file=sys.stderr)
        print(f"支持的语言代码: {', '.join(SUPPORTED_LANGUAGES.keys())}", file=sys.stderr)
        return 1

    if not input_file.is_file():
        print(f"输入文件不存在: {input_file}", file=sys.stderr)
        return 1

    try:
        if input_file.suffix == ".json":
            payload = json.loads(input_file.read_text(encoding="utf-8-sig"))
        elif input_file.suffix == ".csv":
            import csv

            with open(input_file, "r", encoding="utf-8-sig") as f:
                payload = list(csv.DictReader(f))
        else:
            print(f"不支持的文件格式: {input_file.suffix}", file=sys.stderr)
            return 1
    except Exception as e:
        print(f"读取输入文件失败: {e}", file=sys.stderr)
        return 1

    print(
        f"开始通过 /responses 翻译到 {SUPPORTED_LANGUAGES[target_lang]} "
        f"（endpoint 来自 volc-ark-apis.json）…",
        file=sys.stderr,
    )
    try:
        if isinstance(payload, list):
            translated = translate_list(api_key, endpoint, model, payload, target_lang)
        else:
            translated = translate_dict(api_key, endpoint, model, payload, target_lang)
    except Exception as e:
        print(f"翻译失败: {e}", file=sys.stderr)
        return 1

    output_file = input_file.parent / f"{input_file.stem}_{target_lang}{input_file.suffix}"
    try:
        if input_file.suffix == ".json":
            output_file.write_text(json.dumps(translated, ensure_ascii=False, indent=2), encoding="utf-8")
        elif input_file.suffix == ".csv":
            import csv

            with open(output_file, "w", encoding="utf-8", newline="") as f:
                writer = csv.DictWriter(f, fieldnames=translated[0].keys() if translated else [])
                writer.writeheader()
                writer.writerows(translated)
        print(f"翻译完成，已保存到: {output_file}", file=sys.stderr)
    except Exception as e:
        print(f"保存翻译结果失败: {e}", file=sys.stderr)
        return 1

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
