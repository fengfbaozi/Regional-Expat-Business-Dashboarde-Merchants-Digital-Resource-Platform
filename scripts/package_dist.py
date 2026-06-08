#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
生成可拷贝至任意目录运行的离线包（ZIP）。

步骤: 先运行预打包校验，再将项目文件打入 dist/ 下 zip（排除虚拟环境、reference 演示等）。

用法（在项目根目录）:
  python scripts/package_dist.py
  python scripts/package_dist.py --name my-demo.zip
"""
from __future__ import annotations

import subprocess
import sys
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
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
SKIP_FILE_NAMES = {".DS_Store", "Thumbs.db"}


def should_skip(path: Path, root: Path) -> bool:
    rel = path.relative_to(root)
    for part in rel.parts:
        if part in SKIP_DIR_NAMES:
            return True
        if part.startswith(".") and part not in {".", ".."} and part != ".gitkeep":
            # 仍打包合理隐藏文件如 .editorconfig；跳过 .git 等已在 SKIP_DIR_NAMES
            pass
    if path.is_file() and path.name in SKIP_FILE_NAMES:
        return True
    return False


def main() -> int:
    import argparse

    ap = argparse.ArgumentParser()
    ap.add_argument(
        "--name",
        default="yuxiaoqiao-demo-portable.zip",
        help="输出 zip 文件名（位于 dist/ 下）",
    )
    args = ap.parse_args()

    check = ROOT / "scripts" / "prebundle_check.py"
    r = subprocess.run([sys.executable, str(check)], cwd=str(ROOT))
    if r.returncode != 0:
        print("已中止：请先修复预打包检查中的问题。", file=sys.stderr)
        return 1

    out_dir = ROOT / "dist"
    out_dir.mkdir(parents=True, exist_ok=True)
    out_zip = out_dir / args.name

    files: list[Path] = []
    for p in ROOT.rglob("*"):
        if not p.is_file():
            continue
        if should_skip(p, ROOT):
            continue
        files.append(p)

    files.sort(key=lambda x: str(x).lower())
    with zipfile.ZipFile(out_zip, "w", zipfile.ZIP_DEFLATED) as zf:
        for p in files:
            arc = p.relative_to(ROOT).as_posix()
            zf.write(p, arcname=arc)

    print(f"已生成: {out_zip}")
    print("使用说明: 解压后在本目录运行 scripts\\serve-static.bat，浏览器打开提示的地址。")
    return 0


if __name__ == "__main__":
    sys.exit(main())
