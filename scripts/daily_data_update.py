#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
数据更新调度脚本：每天更新一次特色产业、侨乡文化数据。
侨情快照可另运行：py -3 scripts/fetch_qiaowu_to_date.py（写入 date/qiaowu-news.json）。
一键串联（含 CSV 同步与侨情）：根目录 one-click-update.py。

运行（项目根目录）：
  py -3 scripts/daily_data_update.py
"""

import json
import os
import subprocess
import sys
from datetime import datetime, timedelta
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = ROOT / "date"
TIMESTAMP_FILE = DATA_DIR / "last_update_timestamp.json"


def _configure_stdio_utf8() -> None:
    for stream in (sys.stdout, sys.stderr):
        if hasattr(stream, "reconfigure"):
            try:
                stream.reconfigure(encoding="utf-8", errors="replace")
            except Exception:
                pass


def load_last_update() -> datetime | None:
    """读取上次更新时间"""
    if not TIMESTAMP_FILE.is_file():
        return None
    try:
        data = json.loads(TIMESTAMP_FILE.read_text(encoding="utf-8"))
        last_str = data.get("last_update")
        if last_str:
            return datetime.fromisoformat(last_str)
    except Exception:
        pass
    return None


def save_last_update() -> None:
    """保存更新时间"""
    try:
        TIMESTAMP_FILE.write_text(
            json.dumps({"last_update": datetime.now().isoformat()}, ensure_ascii=False, indent=2),
            encoding="utf-8",
        )
    except Exception as e:
        print(f"保存更新时间失败: {e}", file=sys.stderr)


def should_update() -> bool:
    """检查是否需要更新（距离上次更新超过24小时）"""
    last_update = load_last_update()
    if not last_update:
        print("首次运行，需要更新数据", file=sys.stderr)
        return True
    
    time_since_update = datetime.now() - last_update
    if time_since_update >= timedelta(hours=24):
        print(f"距离上次更新已过 {time_since_update}，需要更新数据", file=sys.stderr)
        return True
    
    print(f"距离上次更新仅 {time_since_update}，无需更新", file=sys.stderr)
    return False


def run_script(script_name: str) -> bool:
    """运行指定脚本"""
    script_path = ROOT / "scripts" / script_name
    if not script_path.is_file():
        print(f"脚本不存在: {script_path}", file=sys.stderr)
        return False
    
    try:
        print(f"运行 {script_name}...", file=sys.stderr)
        # 子脚本多为 UTF-8 输出；Windows 上 text=True 若不指定 encoding 会用 GBK 读管道，触发 _readerthread 解码异常
        child_env = os.environ.copy()
        child_env.setdefault("PYTHONIOENCODING", "utf-8")
        result = subprocess.run(
            [sys.executable, str(script_path)],
            cwd=ROOT,
            capture_output=True,
            text=True,
            encoding="utf-8",
            errors="replace",
            env=child_env,
            timeout=300,
        )
        
        if result.returncode == 0:
            print(f"{script_name} 运行成功", file=sys.stderr)
            if result.stdout:
                print(result.stdout, file=sys.stderr)
            return True
        else:
            print(f"{script_name} 运行失败，返回码: {result.returncode}", file=sys.stderr)
            if result.stderr:
                print(result.stderr, file=sys.stderr)
            return False
    except subprocess.TimeoutExpired:
        print(f"{script_name} 运行超时", file=sys.stderr)
        return False
    except Exception as e:
        print(f"运行 {script_name} 时出错: {e}", file=sys.stderr)
        return False


def main() -> int:
    _configure_stdio_utf8()
    
    if not should_update():
        return 0
    
    print("开始更新数据...", file=sys.stderr)

    # 更新特色产业数据
    success = run_script("fetch_industry_data_api.py")
    if not success:
        print("特色产业数据更新失败", file=sys.stderr)
    
    # 更新侨乡文化数据
    success = run_script("fetch_culture_data_api.py")
    if not success:
        print("侨乡文化数据更新失败", file=sys.stderr)
    
    # 保存更新时间
    save_last_update()
    
    print("数据更新完成", file=sys.stderr)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())