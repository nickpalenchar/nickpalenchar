#!/bin/bash
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/.."
CONTENT_DIR="$(pwd)/src/content"
# Exports the blog posts I now write in obsidian.

# obsidian-export (https://github.com/zoni/obsidian-export)

if [[ -z "$(which cargo)" ]]; then
    echo "installing cargo..."
    curl https://sh.rustup.rs -sSf | sh
fi

if [[ -z "$(which obsidian-export)" ]]; then
    echo "installing obsidian-export..."
    cargo install obsidian-export
fi

OBSIDIAN_DIR=$HOME/Documents/journal/journal

ls $OBSIDIAN_DIR/blog/

obsidian-export $OBSIDIAN_DIR  ./src/content/posts/ \
  --start-at $OBSIDIAN_DIR/blog/ \
  --ignore-file $OBSIDIAN_DIR/blog/export-ignore.md

while IFS= read -r -d '' img; do
  cp -f "$img" "$CONTENT_DIR/$(basename "$img")"
done < <(find "$OBSIDIAN_DIR" -type f \( \
  -iname '*.png' -o -iname '*.jpg' -o -iname '*.jpeg' -o \
  -iname '*.gif' -o -iname '*.webp' -o -iname '*.svg' \
\) -print0)

echo "removing export-ignore.md"
rm ./src/content/posts/export-ignore.md || true
rm -rf ./src/content/posts/templater || true