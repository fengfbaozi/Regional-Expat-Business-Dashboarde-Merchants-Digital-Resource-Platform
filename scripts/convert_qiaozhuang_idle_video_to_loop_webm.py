#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
将桥壮壮「待机图」MP4 转成透明通道循环 WebM。

输出：
  images/brand/qiaozhuang-mascot-loop.webm
  images/brand/qiaozhuang-mascot-loop-poster.png

实现：
1) 用 ffmpeg 按 fps 抽帧为 PNG
2) 用 rembg 对每帧做抠图（得到带 alpha 的 RGBA）
3) 将主体缩放并居中到固定画布（MAX_SIZE），保证编码尺寸一致
4) 用 ffmpeg 将 PNG 序列编码为 VP9 alpha 的 webm
"""

from __future__ import annotations

import argparse
import subprocess
import sys
from pathlib import Path

from deps_bootstrap import ensure_rembg, require_ffmpeg_or_exit

ensure_rembg()

from PIL import Image
from rembg import remove


ROOT = Path(__file__).resolve().parents[1]
REF_DIR = ROOT / "reference"

OUT_WEBM_DEFAULT = ROOT / "images" / "brand" / "qiaozhuang-mascot-loop.webm"
OUT_POSTER_DEFAULT = ROOT / "images" / "brand" / "qiaozhuang-mascot-loop-poster.png"

MAX_SIZE = (420, 630)
MAX_W, MAX_H = MAX_SIZE


def _configure_stdio_utf8() -> None:
    """Windows 控制台编码可能是 gbk；转换脚本避免因乱码路径打印报错。"""
    try:
        if hasattr(sys.stdout, "reconfigure"):
            sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        if hasattr(sys.stderr, "reconfigure"):
            sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        # ignore
        pass


def _find_source_mp4(ref_dir: Path) -> Path:
    mp4s = list(ref_dir.rglob("*.mp4"))
    if not mp4s:
        raise FileNotFoundError(f"未找到 reference 下的 mp4：{ref_dir}")
    mp4s.sort(key=lambda p: p.stat().st_size, reverse=True)
    return mp4s[0]


def _pick_source_mp4(ref_dir: Path, pick: str) -> Path:
    mp4s = list(ref_dir.rglob("*.mp4"))
    if not mp4s:
        raise FileNotFoundError(f"未找到 reference 下的 mp4：{ref_dir}")
    mp4s.sort(key=lambda p: p.stat().st_size, reverse=True)
    pick = (pick or "").strip().lower()
    if pick in ("largest", "max", "1"):
        return mp4s[0]
    if pick in ("smallest", "min", "0"):
        return mp4s[-1]
    raise ValueError("pick 仅支持 largest/smallest")


def _run(cmd: list[str]) -> None:
    subprocess.run(cmd, check=True)


def _extract_frames(input_mp4: Path, tmp_frames: Path, fps: int) -> None:
    tmp_frames.mkdir(parents=True, exist_ok=True)
    pattern = str(tmp_frames / "frame_%04d.png")

    # 预缩放一下，降低 rembg 开销；最终仍会缩放到 MAX_SIZE 画布
    vf = f"fps={fps},scale={MAX_W}:-1:force_original_aspect_ratio=decrease"
    _run(["ffmpeg", "-y", "-i", str(input_mp4), "-vf", vf, "-vsync", "0", "-an", pattern])


def _process_frame(png_path: Path, out_path: Path) -> None:
    im = Image.open(png_path).convert("RGBA")
    cut = remove(im)  # PIL RGBA with alpha

    cut.thumbnail(MAX_SIZE, Image.Resampling.LANCZOS)

    canvas = Image.new("RGBA", MAX_SIZE, (0, 0, 0, 0))
    x = (MAX_W - cut.size[0]) // 2
    y = (MAX_H - cut.size[1]) // 2
    canvas.paste(cut, (x, y), cut)
    canvas.save(out_path, optimize=True)


def _encode_webm_alpha(tmp_processed: Path, out_webm: Path, fps: int) -> None:
    pattern = str(tmp_processed / "proc_%04d.png")
    out_webm.parent.mkdir(parents=True, exist_ok=True)

    _run(
        [
            "ffmpeg",
            "-y",
            "-framerate",
            str(fps),
            "-i",
            pattern,
            "-c:v",
            "libvpx-vp9",
            "-pix_fmt",
            "yuva420p",
            "-auto-alt-ref",
            "0",
            "-b:v",
            "0",
            "-crf",
            "35",
            "-an",
            str(out_webm),
        ]
    )


def _make_poster(tmp_processed: Path, out_poster: Path) -> None:
    first = next(tmp_processed.glob("proc_*.png"), None)
    if not first:
        return
    out_poster.parent.mkdir(parents=True, exist_ok=True)
    Image.open(first).save(out_poster, optimize=True)


def main() -> int:
    _configure_stdio_utf8()
    ap = argparse.ArgumentParser()
    ap.add_argument("--source", type=str, default="", help="源 mp4 路径（可选；不填则自动取 reference 下最大 mp4）")
    ap.add_argument("--pick", type=str, default="", help="不传 source 时自动从 reference 中按大小选：largest/smallest")
    ap.add_argument("--fps", type=int, default=8, help="抽帧 fps（越小越快但越不平滑）")
    ap.add_argument("--keep-temp", action="store_true", help="保留临时目录（调试用）")
    ap.add_argument("--out-webm", type=str, default="", help="输出 webm 路径（相对项目根或绝对路径；不填用默认）")
    ap.add_argument("--out-poster", type=str, default="", help="输出 poster png 路径（相对项目根或绝对路径；不填用默认）")
    args = ap.parse_args()

    if args.source.strip():
        input_mp4 = Path(args.source)
    else:
        input_mp4 = _pick_source_mp4(REF_DIR, args.pick or "largest")

    require_ffmpeg_or_exit()

    tmp_root = ROOT / ".tmp_qiaozhuang_idle"
    tmp_frames = tmp_root / "frames"
    tmp_processed = tmp_root / "processed"

    if tmp_root.exists():
        for p in tmp_root.rglob("*"):
            try:
                if p.is_file():
                    p.unlink()
            except Exception:
                pass

    print(f"[INFO] 源视频：{input_mp4}")
    print(f"[INFO] 抽帧 fps：{args.fps}")

    _extract_frames(input_mp4, tmp_frames, fps=args.fps)

    frame_list = sorted(tmp_frames.glob("frame_*.png"))
    if not frame_list:
        raise RuntimeError("未抽取到任何帧")

    for idx, frame in enumerate(frame_list):
        out_path = tmp_processed / f"proc_{idx:04d}.png"
        out_path.parent.mkdir(parents=True, exist_ok=True)
        _process_frame(frame, out_path)
        if (idx + 1) % 5 == 0:
            print(f"[INFO] 已处理 {idx + 1}/{len(frame_list)} 帧")

    out_webm = Path(args.out_webm) if args.out_webm else OUT_WEBM_DEFAULT
    out_poster = Path(args.out_poster) if args.out_poster else OUT_POSTER_DEFAULT
    # 若传入的是相对路径，则以 ROOT 为基准
    if not out_webm.is_absolute():
        out_webm = ROOT / out_webm
    if not out_poster.is_absolute():
        out_poster = ROOT / out_poster

    _encode_webm_alpha(tmp_processed, out_webm, fps=args.fps)
    _make_poster(tmp_processed, out_poster)

    print(f"[OK] 已输出：{out_webm}")
    print(f"[OK] 已输出：{out_poster}")

    if not args.keep_temp:
        try:
            for p in tmp_root.rglob("*"):
                if p.is_file():
                    p.unlink()
        except Exception:
            pass
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

