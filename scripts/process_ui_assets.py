"""
从 reference/ 读取首页背景与产业展示图，裁切边缘以弱化常见 AI 角标/底栏水印，输出到 images/。
调整裁切比例时修改 CROP_HOME / CROP_CARD 即可。
"""
from __future__ import annotations

import sys
from pathlib import Path

from deps_bootstrap import ensure_pillow

ensure_pillow()

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
REF = ROOT / "reference"

# 相对宽高百分比：裁掉四周（水印多在底部与右下角）
CROP_HOME = {"left": 0.02, "top": 0.02, "right": 0.97, "bottom": 0.88}
CROP_CARD = {"left": 0.02, "top": 0.02, "right": 0.97, "bottom": 0.90}


def crop_pct(im: Image.Image, spec: dict) -> Image.Image:
    w, h = im.size
    l = int(w * spec["left"])
    t = int(h * spec["top"])
    r = int(w * spec["right"])
    b = int(h * spec["bottom"])
    r = max(l + 2, r)
    b = max(t + 2, b)
    return im.crop((l, t, r, b))


def save_png(im: Image.Image, path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    im.save(path, "PNG", optimize=True)


def main() -> None:
    home_src = REF / "首页背景图" / "1775043328990.png"
    if not home_src.is_file():
        print(
            "未找到旧版首页背景原图：reference/首页背景图/1775043328990.png\n"
            "请把该 PNG 放回上述路径后重新运行：py -3 scripts/process_ui_assets.py\n"
            "（当前 reference 里若只有「壮锦…」图，不会自动用作首页背景。）",
            file=sys.stderr,
        )
        raise SystemExit(1)

    home_out = ROOT / "images" / "backgrounds" / "home-bg.png"
    im = Image.open(home_src).convert("RGBA")
    save_png(crop_pct(im, CROP_HOME), home_out)
    print("Wrote", home_out)

    mapping = [
        ("产业板块展示图/香料展示图.png", "spice-hero.png"),
        ("产业板块展示图/陶瓷展示图生.png", "ceramics-hero.png"),
        ("产业板块展示图/番薯展示图.png", "sweet-potato-hero.png"),
        ("产业板块展示图/芒编展示图生.png", "mangweaving-hero.png"),
    ]
    out_dir = ROOT / "images" / "industry"
    for rel, name in mapping:
        parts = rel.split("/")
        src = REF / parts[0] / parts[1]
        if not src.is_file():
            raise SystemExit(f"Missing: {src}")
        card = Image.open(src).convert("RGBA")
        dst = out_dir / name
        save_png(crop_pct(card, CROP_CARD), dst)
        print("Wrote", dst)


if __name__ == "__main__":
    main()
