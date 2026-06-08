"""从 reference 抠图并输出 images/brand/qiaozhuang-mascot.png。依赖: pip install rembg[cpu] pillow（缺失时会自动 pip）"""
from pathlib import Path

from deps_bootstrap import ensure_rembg

ensure_rembg()

from PIL import Image
from rembg import remove

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "reference" / "桥壮壮图" / "1775044345664.png"
OUT = ROOT / "images" / "brand" / "qiaozhuang-mascot.png"
MAX_SIZE = (420, 630)


def main() -> None:
    OUT.parent.mkdir(parents=True, exist_ok=True)
    im = Image.open(SRC)
    out = remove(im)
    out.thumbnail(MAX_SIZE, Image.Resampling.LANCZOS)
    out.save(OUT, optimize=True)
    print(OUT, out.size)


if __name__ == "__main__":
    main()
