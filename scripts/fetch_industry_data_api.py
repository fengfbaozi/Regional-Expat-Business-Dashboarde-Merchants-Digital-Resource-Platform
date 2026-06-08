#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
通过火山方舟「数据获取」chat/completions 生成特色产业 JSON，写入 date/industry_ark.json。

配置仅来自 date/volc-ark-apis.json：dataApiKey、ARK_DATA_CHAT_DEFAULTS / DATA_ACQUISITION_ARK。
勿使用 qiaozhuangApiKey（侨壮壮 Bot）或翻译 /responses。

运行（项目根目录）：
  py -3 scripts/fetch_industry_data_api.py

环境变量：
  ARK_API_KEY / ARK_ENDPOINT / ARK_MODEL   覆盖 JSON（见 scripts/volc_keys.py）
  ARK_OUTPUT_LANG   zh 或 en：JSON 内面向用户的文案语言（默认 zh）
"""

import json
import os
import re
import sys
from pathlib import Path

from deps_bootstrap import ensure_requests

ensure_requests()

import requests

from volc_keys import get_data_acquisition_runtime

ROOT = Path(__file__).resolve().parent.parent


def _output_lang_instruction() -> str:
    lang = (os.environ.get("ARK_OUTPUT_LANG") or "zh").strip().lower()
    if lang in ("en", "english", "en-us"):
        return (
            "\n\n[Output language] All descriptive/user-visible text in the JSON must be in English."
        )
    return (
        "\n\n【输出语言】JSON 中所有面向用户展示的说明性文字必须使用简体中文。"
    )


def _configure_stdio_utf8() -> None:
    for stream in (sys.stdout, sys.stderr):
        if hasattr(stream, "reconfigure"):
            try:
                stream.reconfigure(encoding="utf-8", errors="replace")
            except Exception:
                pass


def parse_json_from_model_text(text: str) -> list[dict]:
    """从模型回复中解析 items 数组。"""
    s = (text or "").strip()
    if not s:
        return []
    fence = re.search(r"```(?:json)?\s*([\s\S]*?)```", s, re.I)
    if fence:
        s = fence.group(1).strip()
    try:
        obj = json.loads(s)
    except json.JSONDecodeError:
        m = re.search(r"\{[\s\S]*\}", s)
        if not m:
            return []
        try:
            obj = json.loads(m.group(0))
        except json.JSONDecodeError:
            return []
    if isinstance(obj, list):
        items = obj
    else:
        items = obj.get("items") or obj.get("industries") or obj.get("data") or []
    if not isinstance(items, list):
        return []
    return items


def call_ark(
    api_key: str,
    endpoint: str,
    model: str,
    *,
    temperature: float,
    max_tokens: int,
) -> str:
    system = (
        "你是玉林侨务数字平台「数据获取」结构化助理（chat/completions，"
        "非侨壮壮对话 Bot、非翻译接口）。只输出合法 JSON，不要 Markdown 说明。"
        "用户需要可展示的特色产业数据字段。"
    )
    user = """请整理广西玉林的特色产业信息，包括陶瓷、芒编、香料、番薯等产业。

严格输出一个 JSON 对象，格式如下（不要其它文字）：
{"items":[{"name":"产业名称","summary":"产业简介","status":"产业状态","resource":"资源优势","market":"市场与定位","supply_chain":"产业链与能力","opportunity":"出海机会","image":"图片路径"}]}

要求：
- items 含 4～6 个特色产业；
- name 为产业名称；
- summary 为产业简介，50-100字；
- status 为产业发展状态；
- resource 为资源优势；
- market 为市场定位；
- supply_chain 为产业链与能力；
- opportunity 为出海机会；
- image 为图片路径，使用相对路径如 "images/industry/ceramics.svg"。""" + _output_lang_instruction()

    payload: dict = {
        "model": model,
        "messages": [
            {"role": "system", "content": system},
            {"role": "user", "content": user},
        ],
        "temperature": float(temperature),
        "max_tokens": int(max_tokens),
    }
    headers = {
        "Authorization": "Bearer " + api_key,
        "Content-Type": "application/json",
    }
    r = requests.post(endpoint, headers=headers, json=payload, timeout=120)
    r.raise_for_status()
    data = r.json()
    choices = data.get("choices") or []
    if not choices:
        raise RuntimeError("API 未返回 choices")
    msg = choices[0].get("message") or {}
    content = msg.get("content")
    if isinstance(content, str):
        return content
    if isinstance(content, list):
        parts = []
        for block in content:
            if isinstance(block, dict) and block.get("type") == "text":
                parts.append(block.get("text") or "")
        return "".join(parts)
    return str(content or "")


def main() -> int:
    _configure_stdio_utf8()
    rt = get_data_acquisition_runtime()
    if not rt.get("enabled", True):
        print("volc-ark-apis.json 中 DATA_ACQUISITION_ARK.enabled 为 false，已中止。", file=sys.stderr)
        return 1
    api_key = (rt.get("api_key") or "").strip()
    if not api_key:
        print("未配置 API Key：请在 date/volc-ark-apis.json 填写 dataApiKey，或设置环境变量 ARK_API_KEY", file=sys.stderr)
        return 1

    endpoint = (rt.get("endpoint") or "").strip()
    model = (rt.get("model") or "").strip()
    temp = float(rt.get("temperature") or 0.35)
    mt = int(rt.get("max_tokens") or 8192)
    mt = max(4096, min(mt, 16384))
    out_path = Path(os.environ.get("OUT", str(ROOT / "date" / "industry_ark.json"))).resolve()

    try:
        raw_text = call_ark(api_key, endpoint, model, temperature=temp, max_tokens=mt)
    except Exception as e:
        print("调用方舟 API 失败：" + str(e), file=sys.stderr)
        return 1

    parsed = parse_json_from_model_text(raw_text)
    if not parsed:
        print("模型未返回有效条目，原始片段：\n" + raw_text[:1200], file=sys.stderr)
        return 1

    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(
        json.dumps(parsed, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    print(f"已写入 {out_path} ，共 {len(parsed)} 条特色产业数据", file=sys.stderr)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())