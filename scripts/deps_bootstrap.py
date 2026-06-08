# -*- coding: utf-8 -*-
"""脚本入口依赖自检：缺失时自动 pip install（需联网）。仅用标准库，可被任意 scripts/*.py 引用。"""
from __future__ import annotations

import importlib.util
import shutil
import subprocess
import sys


def _has_import_name(name: str) -> bool:
    return importlib.util.find_spec(name) is not None


def _pip_install(*specs: str) -> None:
    cmd = [
        sys.executable,
        "-m",
        "pip",
        "install",
        "--disable-pip-version-check",
    ]
    # 打包移植常见：无预装 wheel，放宽超时
    cmd.extend(["--timeout", "120"])
    cmd.extend(list(specs))
    subprocess.check_call(cmd, stdout=sys.stderr)


def ensure_requests() -> None:
    if _has_import_name("requests"):
        return
    print("未检测到 requests，正在执行: pip install requests …", file=sys.stderr)
    _pip_install("requests>=2.28.0,<3")


def ensure_pillow() -> None:
    if _has_import_name("PIL"):
        return
    print("未检测到 Pillow，正在执行: pip install Pillow …", file=sys.stderr)
    _pip_install("Pillow>=10.0.0,<12")


def ensure_rembg() -> None:
    ensure_pillow()
    if _has_import_name("rembg"):
        return
    print("未检测到 rembg，正在执行: pip install rembg[cpu] …（体积较大）", file=sys.stderr)
    _pip_install("rembg[cpu]>=2.0.50")


def which_ffmpeg() -> str | None:
    return shutil.which("ffmpeg")


def require_ffmpeg_or_exit() -> str:
    """返回 ffmpeg 可执行路径；缺失则打印说明并退出。"""
    path = which_ffmpeg()
    if path:
        return path
    print(
        "未在 PATH 中找到 ffmpeg，无法处理视频。\n"
        "请安装 ffmpeg 并加入系统 PATH，例如：\n"
        "  - https://ffmpeg.org/download.html\n"
        "  - 或使用 winget：winget install ffmpeg\n",
        file=sys.stderr,
    )
    raise SystemExit(2)
