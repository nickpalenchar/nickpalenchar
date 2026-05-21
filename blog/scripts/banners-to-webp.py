#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.11"
# dependencies = ["Pillow"]
# ///

"""
Convert banner images to WebP for fast page display, while keeping a JPEG
copy for social sharing (og:image). LinkedIn and WhatsApp don't reliably
support WebP in og:image tags.

Frontmatter written:
  banner:   /banners/foo.webp   ← <img> on the page
  bannerOg: /banners/foo.jpg   ← og:image meta tag
"""

import re
import sys
from pathlib import Path

from PIL import Image

SCRIPT_DIR = Path(__file__).parent
ROOT = SCRIPT_DIR.parent
BANNERS_DIR = ROOT / "public" / "banners"
POSTS_DIR = ROOT / "src" / "content" / "posts"

WEBP_QUALITY = 80
OG_QUALITY = 85
OG_MAX_WIDTH = 1200  # LinkedIn recommended og:image width


def to_webp(src: Path) -> Path:
    dest = src.with_suffix(".webp")
    if dest == src:
        return src
    img = Image.open(src)
    img.save(dest, "WEBP", quality=WEBP_QUALITY, method=6)
    kb_before = src.stat().st_size // 1024
    kb_after = dest.stat().st_size // 1024
    print(f"  {src.name} → {dest.name}  ({kb_before}KB → {kb_after}KB)")
    return dest


def ensure_og_jpeg(webp_path: Path) -> Path:
    """Create a JPEG og copy from a WebP if one doesn't already exist."""
    jpg_path = webp_path.with_suffix(".jpg")
    if jpg_path.exists():
        return jpg_path
    img = Image.open(webp_path).convert("RGB")
    if img.width > OG_MAX_WIDTH:
        ratio = OG_MAX_WIDTH / img.width
        img = img.resize((OG_MAX_WIDTH, int(img.height * ratio)), Image.LANCZOS)
    img.save(jpg_path, "JPEG", quality=OG_QUALITY, optimize=True)
    kb = jpg_path.stat().st_size // 1024
    print(f"  created og JPEG: {jpg_path.name} ({kb}KB)")
    return jpg_path


def set_frontmatter_fields(post: Path, fields: dict[str, str]) -> None:
    text = post.read_text()
    changed = False
    for key, value in fields.items():
        new_line = f"{key}: {value}"
        pattern = re.compile(rf"^{re.escape(key)}:.*$", re.MULTILINE)
        if pattern.search(text):
            updated = pattern.sub(new_line, text)
        else:
            updated = re.sub(r"(\n---(?:\r?\n|$))", f"\n{new_line}\\1", text, count=1)
        if updated != text:
            text = updated
            changed = True
    if changed:
        post.write_text(text)
        print(f"  updated {post.name}")


def all_posts():
    return [*POSTS_DIR.glob("*.md"), *POSTS_DIR.glob("*.mdx")]


def main() -> None:
    if not BANNERS_DIR.exists():
        print("No public/banners/ directory — nothing to do.")
        sys.exit(0)

    # Phase 1: convert new JPEG/PNG → WebP; keep original as the og image
    new_images = [
        f for f in BANNERS_DIR.iterdir()
        if f.suffix.lower() in {".jpg", ".jpeg", ".png", ".gif"} and f.is_file()
    ]
    if new_images:
        print(f"Converting {len(new_images)} image(s) to WebP...")
        for src in new_images:
            webp = to_webp(src)
            webp_ref = f"/banners/{webp.name}"
            og_ref = f"/banners/{src.name}"
            for post in all_posts():
                if f"/banners/{src.name}" in post.read_text():
                    set_frontmatter_fields(post, {"banner": webp_ref, "bannerOg": og_ref})

    # Phase 2: ensure every existing WebP has a JPEG og copy
    for webp in BANNERS_DIR.glob("*.webp"):
        jpg = ensure_og_jpeg(webp)
        jpg_ref = f"/banners/{jpg.name}"
        webp_ref = f"/banners/{webp.name}"
        for post in all_posts():
            text = post.read_text()
            if f"banner: {webp_ref}" in text and "bannerOg:" not in text:
                set_frontmatter_fields(post, {"bannerOg": jpg_ref})

    print("Done.")


if __name__ == "__main__":
    main()
