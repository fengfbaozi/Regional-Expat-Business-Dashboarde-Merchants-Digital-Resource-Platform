"""
将 images/bg 下用于全页背景的 PNG/JPEG 做「裁掉右下常见 AI 角标区 → 缩放回原尺寸」，
弱化水印而不叠浏览器蒙版。依赖: pip install pillow

用法（项目根目录）:
  py -3 scripts/process_page_backgrounds.py
  py -3 scripts/process_page_backgrounds.py --right 0.12 --bottom 0.14

输出: images/bg/processed/<同名>.png（CSS 已指向该目录）
"""
from __future__ import annotations

import argparse
from pathlib import Path

from deps_bootstrap import ensure_pillow

ensure_pillow()

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SRC_DIR = ROOT / "images" / "bg"
OUT_DIR = ROOT / "images" / "bg" / "processed"


def process_file(path: Path, right_pct: float, bottom_pct: float) -> Path | None:
    if path.parent.name == "processed":
        return None
    im = Image.open(path).convert("RGBA")
    w, h = im.size
    if w < 32 or h < 32:
        return None
    x2 = max(1, int(w * (1 - right_pct)))
    y2 = max(1, int(h * (1 - bottom_pct)))
    cropped = im.crop((0, 0, x2, y2))
    out_im = cropped.resize((w, h), Image.Resampling.LANCZOS)
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    out_path = OUT_DIR / f"{path.stem}.png"
    out_im.save(out_path, optimize=True)
    print(f"OK {path.name} -> {out_path.relative_to(ROOT)} ({w}x{h})")
    return out_path


def main() -> None:
    parser = argparse.ArgumentParser(description="裁切右下后缩放回原尺寸，去除常见角标区")
    parser.add_argument("--right", type=float, default=0.10, help="从右侧裁掉的比例 0~0.3")
    parser.add_argument("--bottom", type=float, default=0.12, help="从下侧裁掉的比例 0~0.3")
    args = parser.parse_args()
    if not SRC_DIR.is_dir():
        print(f"源目录不存在: {SRC_DIR}")
        return
    right_pct = max(0.0, min(0.35, args.right))
    bottom_pct = max(0.0, min(0.35, args.bottom))
    count = 0
    for pattern in ("*.png", "*.jpg", "*.jpeg", "*.webp"):
        for path in sorted(SRC_DIR.glob(pattern)):
            if path.is_file() and process_file(path, right_pct, bottom_pct):
                count += 1
    if count == 0:
        print(f"未找到可处理文件，请将背景图放在 {SRC_DIR}")
    else:
        print(f"共处理 {count} 个文件 -> {OUT_DIR}")


if __name__ == "__main__":
    main()
