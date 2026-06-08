#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
一键更新：依赖检查 → CSV/离线包同步 → 日更 API → 侨情 JSON。

原 one-click-update.bat 的 Python 版；请用当前解释器运行，例如：
  py -3 one-click-update.py
  python one-click-update.py
"""
from __future__ import annotations

import os
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
SCRIPTS = ROOT / "scripts"


def _stdio_utf8() -> None:
    for stream in (sys.stdout, sys.stderr):
        if hasattr(stream, "reconfigure"):
            try:
                stream.reconfigure(encoding="utf-8", errors="replace")
            except Exception:
                pass


def _run_step(label: str, cmd: list, exit_on_fail: bool) -> bool:
    print(f"\n===== {label} =====", flush=True)
    try:
        r = subprocess.run(cmd, cwd=str(ROOT))
    except OSError as e:
        print(f"[ERROR] 无法执行: {e}", file=sys.stderr, flush=True)
        if exit_on_fail:
            sys.exit(1)
        return False
    if r.returncode != 0:
        if exit_on_fail:
            print(f"[ERROR] 退出码 {r.returncode}。", file=sys.stderr, flush=True)
            sys.exit(r.returncode or 1)
        print(f"[WARN] 退出码 {r.returncode}，见上方输出。", file=sys.stderr, flush=True)
        return False
    return True


def main() -> None:
    _stdio_utf8()
    py = sys.executable
    if not (SCRIPTS / "ensure_deps.py").is_file():
        print(f"[ERROR] 缺失: {SCRIPTS / 'ensure_deps.py'}", file=sys.stderr)
        sys.exit(1)
    if not (SCRIPTS / "sync-data.ps1").is_file():
        print(f"[ERROR] 缺失: {SCRIPTS / 'sync-data.ps1'}", file=sys.stderr)
        sys.exit(1)

    # Step 0/5
    _run_step(
        "Step 0/5: Python 依赖 (requests；缺失则自动 pip install)",
        [py, str(SCRIPTS / "ensure_deps.py"), "--group", "ark"],
        exit_on_fail=True,
    )

    # Step 1/5 — ProjectRoot 传目录绝对路径（无尾部 \\）
    _run_step(
        "Step 1/5: Sync CSV + offline bundles (datasets.data.js, coord cache)",
        [
            "powershell",
            "-NoProfile",
            "-ExecutionPolicy",
            "Bypass",
            "-File",
            str(SCRIPTS / "sync-data.ps1"),
            "-ProjectRoot",
            str(ROOT),
        ],
        exit_on_fail=True,
    )

    # Step 2/5 — 非致命
    _run_step(
        "Step 2/5: Daily API data (industry, culture, 24h throttle — daily_data_update.py)",
        [py, str(SCRIPTS / "daily_data_update.py")],
        exit_on_fail=False,
    )

    # Step 3/5 — 非致命
    _run_step(
        "Step 3/5: Qiaowu news snapshot → date/qiaowu-news.json (fetch_qiaowu_to_date.py)",
        [py, str(SCRIPTS / "fetch_qiaowu_to_date.py")],
        exit_on_fail=False,
    )

    # Step 4/5 — 已默认跳过翻译（仅爬取权威新闻，不翻译）
    # 如需启用翻译，设置环境变量 YXQ_POST_I18N_ENABLE=1
    if (os.environ.get("YXQ_POST_I18N_ENABLE") or "").strip().lower() in ("1", "true", "yes"):
        post_cmd = [py, str(SCRIPTS / "post_update_translate_data.py")]
        mmerch = (os.environ.get("YXQ_POST_I18N_MAX_MERCHANTS") or "").strip()
        if mmerch.isdigit():
            post_cmd.extend(["--max-merchants", mmerch])
        mq = (os.environ.get("YXQ_POST_I18N_MAX_QIAOWU") or "").strip()
        if mq.isdigit():
            post_cmd.extend(["--max-qiaowu", mq])
        _run_step(
            "Step 4/5: Offline i18n for qiaowu JSON + merchants sidecar (/responses)",
            post_cmd,
            exit_on_fail=False,
        )
    else:
        print("\n[INFO] 已跳过 Step 4/5（默认不翻译，如需启用翻译请设置 YXQ_POST_I18N_ENABLE=1）。", flush=True)

    print("\n[OK] One-click update done (deps + CSV sync + daily API + qiaowu JSON).", flush=True)
    print("     Former entry: one-click-update.bat → one-click-update.py", flush=True)


if __name__ == "__main__":
    main()
