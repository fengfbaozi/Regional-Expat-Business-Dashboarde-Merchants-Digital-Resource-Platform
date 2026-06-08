#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
预打包校验：确认静态资源为相对路径、数据中的图片不依赖项目外 URL。

用法（在项目根目录）:
  python scripts/prebundle_check.py
  py -3 scripts/prebundle_check.py

退出码: 0 通过，1 发现问题。
"""
from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

# 不扫描的目录（演示包、虚拟环境、缓存等）
SKIP_DIR_NAMES = {
    ".venv",
    "venv",
    "node_modules",
    "reference",
    ".git",
    "__pycache__",
    ".cursor",
    "dist",
}

# 允许出现在源码中的外链（地图 SDK、DNS 预解析等），仅用于减少误报
ALLOWED_SUBSTRINGS = (
    "api.map.baidu.com",
    "webgl",
    "getscript",
    "volces.com",  # i18n 默认 Ark 端点（可选联网）
    "www.w3.org/2000/svg",  # data:image/svg 内 xmlns
)

# 根路径绝对引用（会破坏「拷贝到任意目录」）
ROOT_ABS_HTML = re.compile(
    r"""(?:src|href)\s*=\s*["']/(?!/)[^"']+["']""", re.I
)
ROOT_ABS_CSS = re.compile(r"""url\s*\(\s*['"]?/[^)/\s'"]+""", re.I)

# 项目外图片：JSON 里若用 http(s) 作为图片字段，离线包无法保证显示
JSON_IMG_HTTP = re.compile(
    r'"(?:image|photo|cover|icon|src|local|remote|image_url|imageUrl|cover_url|coverUrl)"\s*:\s*"https?://',
    re.I,
)

# 源码中显式加载外部图片（img src=http）
EXT_IMG_IN_CODE = re.compile(
    r"""<img[^>]+src\s*=\s*["']https?://""", re.I
)


def iter_files(root: Path, suffixes: frozenset[str]):
    for p in root.rglob("*"):
        if not p.is_file():
            continue
        parts = set(p.parts)
        if parts & SKIP_DIR_NAMES:
            continue
        if p.suffix.lower() not in suffixes:
            continue
        rel = p.relative_to(root)
        if rel.parts and rel.parts[0] in SKIP_DIR_NAMES:
            continue
        yield p


def is_allowed_line(line: str) -> bool:
    s = line.strip()
    if not s or s.startswith("//") or s.startswith("*") or s.startswith("<!--"):
        return True
    for a in ALLOWED_SUBSTRINGS:
        if a in line:
            return True
    return False


def check_html_css_js() -> list[str]:
    errors: list[str] = []
    for path in iter_files(ROOT, frozenset({".html", ".css", ".js"})):
        try:
            text = path.read_text(encoding="utf-8", errors="replace")
        except OSError as e:
            errors.append(f"[READ] {path}: {e}")
            continue
        rel = path.relative_to(ROOT)
        lines = text.splitlines()
        for i, line in enumerate(lines, 1):
            if is_allowed_line(line):
                continue
            if path.suffix == ".html" and ROOT_ABS_HTML.search(line):
                errors.append(f"{rel}:{i} 根路径引用: {line.strip()[:120]}")
            if path.suffix == ".css" and ROOT_ABS_CSS.search(line):
                errors.append(f"{rel}:{i} CSS 根路径 url: {line.strip()[:120]}")
        if path.suffix == ".html" and EXT_IMG_IN_CODE.search(text):
            for m in EXT_IMG_IN_CODE.finditer(text):
                errors.append(f"{rel}: <img> 使用 http(s) 外链图片（请改为项目内相对路径）")
                break
    return errors


def check_date_json() -> list[str]:
    errors: list[str] = []
    date_dir = ROOT / "date"
    if not date_dir.is_dir():
        return errors
    for path in sorted(date_dir.glob("*.json")):
        try:
            text = path.read_text(encoding="utf-8", errors="replace")
        except OSError as e:
            errors.append(f"[READ] {path}: {e}")
            continue
        rel = path.relative_to(ROOT)
        for i, line in enumerate(text.splitlines(), 1):
            if JSON_IMG_HTTP.search(line):
                # sources.url 等新闻链接允许 http，仅当键名像图片字段才报错
                if re.search(
                    r'"(?:image|photo|cover|icon|local|remote|src)"\s*:\s*"https?://',
                    line,
                    re.I,
                ):
                    errors.append(f"{rel}:{i} 数据图片字段含外链 URL: {line.strip()[:140]}")
    return errors


def main() -> int:
    errs = check_html_css_js() + check_date_json()
    if errs:
        print("预打包检查未通过：", file=sys.stderr)
        for e in errs:
            print(f"  - {e}", file=sys.stderr)
        print(
            "\n说明: 静态资源请使用相对路径（如 css/style.css、../images/...）；"
            "图片字段请放在 images/ 下并以相对路径写入 JSON。",
            file=sys.stderr,
        )
        return 1
    print("预打包检查通过：未发现根路径引用或 date/*.json 中图片字段的外链。")
    return 0


if __name__ == "__main__":
    sys.exit(main())
