#!/bin/bash
set -euo pipefail
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

echo "removing export-ignore.md"
rm ./src/content/posts/export-ignore.md || true
rm -rf ./src/content/posts/templater || true