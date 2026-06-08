#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
本地预览「玉校桥」站点：启动静态服务器并自动打开首页。

用法（任选其一）：
  - 双击本文件（需已安装 Python 3，且「.py」默认用 python 打开）
  - 在项目根目录执行：py -3 打开网页.py

关闭本黑窗口即停止服务。勿关闭窗口则网站可继续访问。
"""
import os
import sys
import threading
import webbrowser
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from typing import Optional

ROOT = Path(__file__).resolve().parent
HOST = "127.0.0.1"
PORT_START = 8765
PORT_TRY = 20


def _stdio_utf8() -> None:
    for stream in (sys.stdout, sys.stderr):
        if hasattr(stream, "reconfigure"):
            try:
                stream.reconfigure(encoding="utf-8", errors="replace")
            except Exception:
                pass


def main() -> int:
    _stdio_utf8()
    os.chdir(ROOT)

    httpd: Optional[ThreadingHTTPServer] = None
    port_used = 0
    for port in range(PORT_START, PORT_START + PORT_TRY):
        try:
            httpd = ThreadingHTTPServer((HOST, port), SimpleHTTPRequestHandler)
            port_used = port
            break
        except OSError:
            continue

    if httpd is None:
        print(f"无法在 {HOST}:{PORT_START}~{PORT_START + PORT_TRY - 1} 上启动服务（端口可能被占用）。", file=sys.stderr)
        input("按回车键退出…")
        return 1

    url = f"http://{HOST}:{port_used}/index.html"

    def _open_later() -> None:
        import time

        time.sleep(0.35)
        webbrowser.open(url)

    threading.Thread(target=_open_later, daemon=True).start()

    print("——————————————————————————————")
    print("  本地站点已启动")
    print(f"  首页地址: {url}")
    print("  说明: 可把这个地址发给本机浏览器手动打开。")
    print("  停止: 直接关闭本窗口，或按 Ctrl+C")
    print("——————————————————————————————")

    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n已停止服务。")
    finally:
        try:
            httpd.shutdown()
        except Exception:
            pass
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
