#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""玉林侨务数字平台 — 环境检查脚本"""

import json
import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
CONFIG_PATH = ROOT / "date" / "volc-ark-apis.json"

HAS_ERROR = False


def _print_ok(msg: str) -> None:
    print(f"  [OK] {msg}")


def _print_warn(msg: str) -> None:
    print(f"  [!!] {msg}")


def _print_err(msg: str) -> None:
    global HAS_ERROR
    print(f"  [ERR] {msg}")
    HAS_ERROR = True


def _print_info(msg: str) -> None:
    print(f"       {msg}")


def _run(cmd: list[str]) -> tuple[int, str]:
    """运行命令，返回 (returncode, stdout)"""
    try:
        r = subprocess.run(cmd, capture_output=True, text=True)
        return r.returncode, r.stdout.strip()
    except FileNotFoundError:
        return -1, ""
    except Exception:
        return -2, ""


def check_python() -> None:
    print("[1/7] 检查 Python 环境...")
    v = sys.version_info
    if v < (3, 8):
        _print_err(f"Python 版本过低（{v.major}.{v.minor}），需要 Python 3.8+")
        _print_info("请从 https://www.python.org/downloads/ 下载安装")
        return
    _print_ok(f"Python {v.major}.{v.minor}.{v.micro}")


def check_pip() -> None:
    print()
    print("[2/7] 检查 pip 包管理器...")
    rc, out = _run([sys.executable, "-m", "pip", "--version"])
    if rc != 0:
        _print_err("pip 不可用")
        _print_info(f"尝试修复：{sys.executable} -m ensurepip --upgrade")
        return
    # out 格式: "pip x.y.z from ..."
    _print_ok(f"pip {out.split()[1]}")


def check_requests() -> None:
    print()
    print("[3/7] 检查 requests 包（API 数据抓取必需）...")
    try:
        import requests
        _print_ok(f"requests {requests.__version__}")
    except ImportError:
        _print_warn("requests 未安装 — 正在自动安装...")
        rc, out = _run([sys.executable, "-m", "pip", "install", "requests", "-q", "--disable-pip-version-check"])
        if rc != 0:
            _print_err("安装失败，请手动执行：pip install requests")
            _print_info("若网络问题：pip install requests -i https://pypi.tuna.tsinghua.edu.cn/simple")
            return
        try:
            import requests
            _print_ok(f"requests {requests.__version__} 安装成功")
        except ImportError:
            _print_err("安装后仍无法导入，请检查 Python 环境")


def check_pillow() -> None:
    print()
    print("[4/7] 检查 Pillow 包（图片处理，可选）...")
    try:
        from PIL import __version__ as pil_ver
        _print_ok(f"Pillow {pil_ver}")
    except ImportError:
        _print_info("[可选] Pillow 未安装（不影响日常使用，仅图片处理脚本需要）")
        _print_info("       如需使用：pip install Pillow")


def check_ffmpeg() -> None:
    print()
    print("[5/7] 检查 ffmpeg（视频转换，可选）...")
    if shutil.which("ffmpeg"):
        _print_ok("ffmpeg 已安装")
    else:
        _print_info("[可选] ffmpeg 未安装（不影响日常使用，仅视频转换脚本需要）")
        _print_info("       如需使用：https://ffmpeg.org/download.html")


def check_config_file() -> None:
    print()
    print("[6/7] 检查 API 配置文件...")
    if CONFIG_PATH.exists():
        _print_ok(f"date/volc-ark-apis.json 存在")
    else:
        _print_err("date/volc-ark-apis.json 缺失！")
        _print_info("这是核心配置文件，缺少会导致地图不显示、侨壮壮无法回复")


def check_api_keys() -> None:
    print()
    print("[7/7] 检查 API Key 是否已填写...")

    if not CONFIG_PATH.exists():
        _print_info("配置文件不存在，跳过 Key 检查")
        return

    try:
        data = json.loads(CONFIG_PATH.read_text(encoding="utf-8"))
    except json.JSONDecodeError as e:
        _print_err(f"配置文件 JSON 格式错误：{e}")
        _print_info("请用 https://www.json.cn/ 粘贴检查")
        return

    missing = []

    baidu_ak = data.get("baiduMapAk", "")
    data_key = data.get("dataApiKey", "")
    qz_key = data.get("qiaozhuangApiKey", "")
    style_id = data.get("baiduMapStyleId", "")

    if not baidu_ak:
        _print_err("baiduMapAk 为空 — 地图页将无法显示")
        missing.append("baiduMapAk")
    if not data_key:
        _print_err("dataApiKey 为空 — 侨情动态、数据生成将失败")
        missing.append("dataApiKey")
    if not qz_key:
        _print_err("qiaozhuangApiKey 为空 — 侨壮壮将无法回复")
        missing.append("qiaozhuangApiKey")
    if not style_id:
        _print_info("[可选] baiduMapStyleId 为空 — 地图将使用默认浅色样式（不影响功能）")

    if missing:
        print()
        _print_info(f"缺失的 Key：{'、'.join(missing)}")
        _print_info("请在 date/volc-ark-apis.json 中填写，详见 date/API修改指南.md")
        global HAS_ERROR
        HAS_ERROR = True
    else:
        _print_ok("关键 API Key 均已填写")


def main() -> None:
    print()
    print("=" * 44)
    print("  玉林侨务数字平台 — 环境检查")
    print("=" * 44)
    print()

    check_python()
    check_pip()
    check_requests()
    check_pillow()
    check_ffmpeg()
    check_config_file()
    check_api_keys()

    print()
    print("=" * 44)
    if HAS_ERROR:
        print("  [ERR] 环境检查未通过，请按以上提示修复后重试。")
        print()
        print("  必需步骤：")
        print("    1. 安装 Python 3.8+")
        print("    2. pip install requests")
        print("    3. 编辑 date/volc-ark-apis.json 填写 API Key")
        print("    4. 重新运行本脚本")
    else:
        print("  [OK] 环境检查全部通过！可以启动项目了。")
        print()
        print("  启动方式：")
        print("    - 双击 打开网页.py")
        print(f"    - 或命令行：{sys.executable} 打开网页.py")
        print()
        print("  数据更新：")
        print(f"    {sys.executable} 一键更新数据部分.py")
    print("=" * 44)
    print()

    if HAS_ERROR:
        sys.exit(1)


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n已取消")
        sys.exit(0)
