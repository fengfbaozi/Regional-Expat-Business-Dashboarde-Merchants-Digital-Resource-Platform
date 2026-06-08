#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
检查并安装 Python 依赖（供根目录 one-click-update.py、手工环境准备）。

项目根目录运行：
  py -3 scripts/ensure_deps.py
  py -3 scripts/ensure_deps.py --group ark
  py -3 scripts/ensure_deps.py --group images
  py -3 scripts/ensure_deps.py --group rembg
  py -3 scripts/ensure_deps.py --group all
  py -3 scripts/ensure_deps.py --check-ffmpeg
"""
from __future__ import annotations

import argparse
import subprocess
import sys

from deps_bootstrap import (
    ensure_pillow,
    ensure_rembg,
    ensure_requests,
    require_ffmpeg_or_exit,
    which_ffmpeg,
)


def _configure_stdio_utf8() -> None:
    for stream in (sys.stdout, sys.stderr):
        if hasattr(stream, "reconfigure"):
            try:
                stream.reconfigure(encoding="utf-8", errors="replace")
            except Exception:
                pass


def main() -> int:
    _configure_stdio_utf8()
    ap = argparse.ArgumentParser(description="安装/检查脚本依赖")
    ap.add_argument(
        "--group",
        action="append",
        choices=("ark", "images", "rembg", "all"),
        help="可多次指定；all = ark + images + rembg",
    )
    ap.add_argument(
        "--check-ffmpeg",
        action="store_true",
        help="仅检测 ffmpeg 是否在 PATH（不安装）",
    )
    args = ap.parse_args()

    if args.check_ffmpeg:
        p = which_ffmpeg()
        if p:
            print(f"[OK] ffmpeg: {p}", file=sys.stderr)
            return 0
        print("[FAIL] 未找到 ffmpeg", file=sys.stderr)
        return 2

    groups: set[str] = set(args.group or ["ark"])
    if "all" in groups:
        groups = {"ark", "images", "rembg"}

    try:
        if "ark" in groups:
            ensure_requests()
        if "images" in groups:
            ensure_pillow()
        if "rembg" in groups:
            ensure_rembg()
    except subprocess.CalledProcessError as e:
        print(f"pip 安装失败（退出码 {e.returncode}）。请检查网络与权限。", file=sys.stderr)
        return e.returncode or 1
    except Exception as e:
        print(f"依赖处理异常: {e}", file=sys.stderr)
        return 1

    print("[OK] Python 依赖已就绪:", file=sys.stderr)
    if "ark" in groups:
        print("  - requests", file=sys.stderr)
    if "images" in groups:
        print("  - Pillow", file=sys.stderr)
    if "rembg" in groups:
        print("  - rembg[cpu]", file=sys.stderr)
    return 0


# 供其它模块需要时静默拉 ffmpeg 检查
__all__ = ["main"]

if __name__ == "__main__":
    raise SystemExit(main())
