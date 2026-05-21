#!/usr/bin/env node

/**
 * Two-phase frontmatter merge for obsidian-sync.
 *
 * snapshot: saves each post's frontmatter blocks to a temp JSON file before
 *           obsidian-export overwrites the files.
 *
 * merge:    after obsidian-export, re-inserts any fields that existed in the
 *           old Astro file but are absent from the newly-exported Obsidian
 *           version. Fields present in both keep the Obsidian value.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const POSTS_DIR = path.join(__dirname, "..", "src", "content", "posts");
const SNAPSHOT_FILE = path.join(__dirname, "..", ".frontmatter-snapshot.json");

const [, , mode] = process.argv;

// ---------------------------------------------------------------------------
// YAML frontmatter helpers
// ---------------------------------------------------------------------------

function extractYaml(content) {
  const m = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  return m ? m[1] : null;
}

/**
 * Parse frontmatter into a map of { key -> raw lines[] }.
 * Handles simple values, quoted strings, and block sequences (arrays).
 */
function parseFrontmatterBlocks(yamlStr) {
  const lines = yamlStr.split("\n");
  const blocks = {};
  let currentKey = null;
  let currentLines = [];
  let isBlockArray = false;

  const flush = () => {
    if (currentKey) blocks[currentKey] = currentLines;
  };

  for (const line of lines) {
    // Top-level key: must start with a letter/underscore (not indented)
    const keyMatch = line.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\s*:(.*)/);
    if (keyMatch) {
      flush();
      currentKey = keyMatch[1];
      const rest = keyMatch[2].trim();
      currentLines = [line];
      isBlockArray = rest === "";
    } else if (currentKey) {
      // Indented continuation (multi-line strings, nested maps)
      if (line.startsWith("  ") || line.startsWith("\t")) {
        currentLines.push(line);
      // Unindented block-sequence items belong to an array key
      } else if (isBlockArray && line.startsWith("- ")) {
        currentLines.push(line);
      }
      // Any other unindented non-key line: shouldn't appear in valid YAML
    }
  }
  flush();

  return blocks;
}

function getKeys(blocks) {
  return new Set(Object.keys(blocks));
}

// ---------------------------------------------------------------------------
// snapshot
// ---------------------------------------------------------------------------

if (mode === "snapshot") {
  const posts = fs
    .readdirSync(POSTS_DIR)
    .filter((f) => f.endsWith(".md") || f.endsWith(".mdx"));

  const snapshot = {};

  for (const file of posts) {
    const content = fs.readFileSync(path.join(POSTS_DIR, file), "utf-8");
    const yaml = extractYaml(content);
    if (!yaml) continue;
    snapshot[file] = parseFrontmatterBlocks(yaml);
  }

  fs.writeFileSync(SNAPSHOT_FILE, JSON.stringify(snapshot, null, 2));
  console.log(`Snapshotted frontmatter for ${Object.keys(snapshot).length} post(s).`);

// ---------------------------------------------------------------------------
// merge
// ---------------------------------------------------------------------------
} else if (mode === "merge") {
  if (!fs.existsSync(SNAPSHOT_FILE)) {
    console.log("No snapshot found — skipping merge.");
    process.exit(0);
  }

  const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT_FILE, "utf-8"));
  let mergedCount = 0;

  for (const [file, oldBlocks] of Object.entries(snapshot)) {
    const filePath = path.join(POSTS_DIR, file);
    if (!fs.existsSync(filePath)) continue;

    const content = fs.readFileSync(filePath, "utf-8");
    const yaml = extractYaml(content);
    if (!yaml) continue;

    const newKeys = getKeys(parseFrontmatterBlocks(yaml));
    const missingKeys = Object.keys(oldBlocks).filter((k) => !newKeys.has(k));
    if (missingKeys.length === 0) continue;

    const linesToInsert = missingKeys.flatMap((k) => oldBlocks[k]).join("\n");

    // Insert before the closing --- of the frontmatter
    const updated = content.replace(/(\n---(?:\r?\n|$))/, `\n${linesToInsert}$1`);
    fs.writeFileSync(filePath, updated);

    console.log(`  ${file}: restored ${missingKeys.join(", ")}`);
    mergedCount++;
  }

  fs.unlinkSync(SNAPSHOT_FILE);
  if (mergedCount === 0) {
    console.log("No frontmatter fields needed restoring.");
  } else {
    console.log(`Merged Astro fields back into ${mergedCount} post(s).`);
  }

} else {
  console.error("Usage: node scripts/merge-astro-frontmatter.js [snapshot|merge]");
  process.exit(1);
}
