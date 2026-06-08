# -*- coding: utf-8 -*-
"""
从 date/volc-ark-apis.json 读取方舟与百度配置（与 docs/API说明.md 一致）。

四条能力必须分清，脚本禁止混用：
- dataApiKey + chat/completions（数据获取 / 结构化生成）
- translationApiKey（可空则回退 dataApiKey）+ /responses（翻译）
- qiaozhuangApiKey + bots/chat/completions（仅前端「侨壮壮」助手页；Python 批处理勿用）
- baiduMapAk（地图，一般由 PowerShell / 前端使用）
"""
from __future__ import annotations

import json
import os
import re
from pathlib import Path
from typing import Any

ROOT: Path = Path(__file__).resolve().parent.parent
CONFIG_JSON: Path = ROOT / "date" / "volc-ark-apis.json"


def load_volc_apis_dict() -> dict[str, Any]:
    """读取 date/volc-ark-apis.json；缺失或损坏时返回空 dict。"""
    if not CONFIG_JSON.is_file():
        return {}
    try:
        data = json.loads(CONFIG_JSON.read_text(encoding="utf-8"))
        return data if isinstance(data, dict) else {}
    except (OSError, json.JSONDecodeError):
        return {}


def load_data_api_key() -> str:
    """数据获取「数据侧」Key：环境变量 ARK_API_KEY 优先，否则 dataApiKey。"""
    k = (os.environ.get("ARK_API_KEY") or "").strip()
    if k:
        return k
    data = load_volc_apis_dict()
    cand = (data.get("dataApiKey") or "").strip()
    if cand and len(cand) > 8:
        return cand
    local = ROOT / "date" / "ark-api.local.json"
    if local.is_file():
        try:
            loc = json.loads(local.read_text(encoding="utf-8"))
            k2 = (loc.get("apiKey") or loc.get("api_key") or "").strip()
            if k2:
                return k2
        except (OSError, json.JSONDecodeError):
            pass
    js = ROOT / "js" / "ark-api-config.js"
    if js.is_file():
        try:
            text = js.read_text(encoding="utf-8", errors="replace")
            m = re.search(r"dataApiKey\s*:\s*[\"']([^\"']+)[\"']", text)
            if not m:
                m = re.search(r"dataApiKey\s*=\s*[\"']([^\"']+)[\"']", text)
            if m:
                cand = m.group(1).strip()
                if cand and len(cand) > 8:
                    return cand
        except OSError:
            pass
    return ""


def load_translation_api_key() -> str:
    """翻译专用 Key；translationApiKey 为空或非空字符串则回退 dataApiKey。"""
    data = load_volc_apis_dict()
    t = (data.get("translationApiKey") or "").strip()
    if t and len(t) > 8:
        return t
    return load_data_api_key()


def load_qiaozhuang_api_key() -> str:
    """侨壮壮 Bot 专用 Key（仅 bots/chat/completions）；批处理脚本一般不应调用。"""
    data = load_volc_apis_dict()
    return (data.get("qiaozhuangApiKey") or "").strip()


def load_baidu_map_ak() -> str:
    """百度地图浏览器端 AK（与 json 顶层 baiduMapAk 一致）。"""
    data = load_volc_apis_dict()
    ak = (data.get("baiduMapAk") or data.get("baidu_map_ak") or "").strip()
    return ak


def get_data_acquisition_runtime() -> dict[str, Any]:
    """
    数据获取：chat/completions。
    endpoint/model 取自 DATA_ACQUISITION_ARK 非空字段，否则 ARK_DATA_CHAT_DEFAULTS，
    最后回退 scripts/ark_defaults.py。
    """
    from ark_defaults import DEFAULT_ENDPOINT, DEFAULT_MODEL

    data = load_volc_apis_dict()
    base = data.get("ARK_DATA_CHAT_DEFAULTS") or {}
    da = data.get("DATA_ACQUISITION_ARK") or {}
    if not isinstance(base, dict):
        base = {}
    if not isinstance(da, dict):
        da = {}

    endpoint = (da.get("endpoint") or base.get("endpoint") or DEFAULT_ENDPOINT).strip() or DEFAULT_ENDPOINT
    model = (da.get("model") or base.get("model") or DEFAULT_MODEL).strip() or DEFAULT_MODEL
    endpoint = (os.environ.get("ARK_ENDPOINT") or "").strip() or endpoint
    model = (os.environ.get("ARK_MODEL") or "").strip() or model

    temperature = 0.35
    max_tokens = 12288
    if isinstance(da.get("temperature"), (int, float)):
        temperature = float(da["temperature"])
    if isinstance(da.get("max_tokens"), int) and da["max_tokens"] > 0:
        max_tokens = int(da["max_tokens"])

    enabled = da.get("enabled")
    if enabled is None:
        enabled = True

    api_key = load_data_api_key()

    return {
        "api_key": api_key,
        "endpoint": endpoint,
        "model": model,
        "temperature": temperature,
        "max_tokens": max_tokens,
        "enabled": bool(enabled),
    }


def get_translation_responses_runtime() -> dict[str, Any]:
    """
    翻译：/api/v3/responses（与前端 i18n.js callArkResponsesTranslate 一致）。
    translationApiKey；endpoint/model 取自 ARK_TRANSLATION_RESPONSES_DEFAULTS，
    TRANSLATION_ARK 中非空字段可覆盖。
    """
    data = load_volc_apis_dict()
    tdef = data.get("ARK_TRANSLATION_RESPONSES_DEFAULTS") or {}
    tro = data.get("TRANSLATION_ARK") or {}
    if not isinstance(tdef, dict):
        tdef = {}
    if not isinstance(tro, dict):
        tro = {}

    endpoint = (tro.get("endpoint") or tdef.get("endpoint") or "").strip()
    model = (tro.get("model") or tdef.get("model") or "").strip()
    endpoint = (os.environ.get("ARK_TRANSLATION_ENDPOINT") or "").strip() or endpoint
    model = (os.environ.get("ARK_TRANSLATION_MODEL") or "").strip() or model

    enabled = tro.get("enabled")
    if enabled is None:
        enabled = True

    api_key = load_translation_api_key()

    return {
        "api_key": api_key,
        "endpoint": endpoint,
        "model": model,
        "enabled": bool(enabled),
    }


def get_qiaozhuang_bot_runtime() -> dict[str, Any]:
    """
    侨壮壮：bots/chat/completions。供少数脚本自检或文档引用；勿与数据获取混用。
    """
    data = load_volc_apis_dict()
    qz = data.get("ARK_QIAOZHUANG_DEFAULTS") or {}
    if not isinstance(qz, dict):
        qz = {}
    endpoint = (qz.get("endpoint") or "").strip()
    if not endpoint:
        endpoint = "https://ark.cn-beijing.volces.com/api/v3/bots/chat/completions"
    model = (qz.get("model") or "").strip()
    return {
        "api_key": load_qiaozhuang_api_key(),
        "endpoint": endpoint,
        "model": model,
    }
