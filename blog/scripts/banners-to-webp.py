#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.11"
# dependencies = ["Pillow"]
# ///

"""Convert all banner images to WebP and update post frontmatter references."""

import re
import sys
from pathlib import Path

from PIL import Image

SCRIPT_DIR = Path(__file__).parent
ROOT = SCRIPT_DIR.parent
BANNERS_DIR = ROOT / "public" / "banners"
POSTS_DIR = ROOT / "src" / "content" / "posts"

QUALITY = 80  # good balance of size vs. quality


def convert(src: Path) -> Path:
    dest = src.with_suffix(".webp")
    if dest == src:
        return src
    img = Image.open(src)
    img.save(dest, "WEBP", quality=QUALITY, method=6)
    kb_before = src.stat().st_size // 1024
    kb_after = dest.stat().st_size // 1024
    print(f"  {src.name} → {dest.name}  ({kb_before}KB → {kb_after}KB)")
    src.unlink()
    return dest


def update_frontmatter(post: Path, old_path: str, new_path: str) -> None:
    text = post.read_text()
    updated = text.replace(f"banner: {old_path}", f"banner: {new_path}")
    if updated != text:
        post.write_text(updated)
        print(f"  updated {post.name}")


def main() -> None:
    if not BANNERS_DIR.exists():
        print("No public/banners/ directory found — nothing to do.")
        sys.exit(0)

    images = [
        f for f in BANNERS_DIR.iterdir()
        if f.suffix.lower() in {".jpg", ".jpeg", ".png", ".gif"} and f.is_file()
    ]

    if not images:
        print("No convertible images found in public/banners/.")
        sys.exit(0)

    print(f"Converting {len(images)} image(s) to WebP (quality={QUALITY})...")
    for src in images:
        dest = convert(src)
        old_ref = f"/banners/{src.name}"
        new_ref = f"/banners/{dest.name}"
        if old_ref != new_ref:
            print("Updating frontmatter references...")
            for post in POSTS_DIR.glob("*.md"):
                update_frontmatter(post, old_ref, new_ref)
            for post in POSTS_DIR.glob("*.mdx"):
                update_frontmatter(post, old_ref, new_ref)

    print("Done.")


if __name__ == "__main__":
    main()
