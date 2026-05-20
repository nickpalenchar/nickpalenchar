#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WARN_BYTES = 300 * 1024;

const postsDir = path.join(__dirname, "..", "src", "content", "posts");
const publicDir = path.join(__dirname, "..", "public");

const files = fs
  .readdirSync(postsDir)
  .filter((f) => f.endsWith(".md") || f.endsWith(".mdx"));

let warnings = 0;

for (const file of files) {
  const content = fs.readFileSync(path.join(postsDir, file), "utf-8");
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (!frontmatterMatch) continue;

  const bannerMatch = frontmatterMatch[1].match(/^banner:\s*(.+)$/m);
  if (!bannerMatch) continue;

  const bannerPath = bannerMatch[1].trim().replace(/^['"]|['"]$/g, "");
  if (!bannerPath) continue;

  const imagePath = path.join(publicDir, bannerPath);

  if (!fs.existsSync(imagePath)) {
    console.warn(`⚠  Banner not found: ${bannerPath} (in ${file})`);
    warnings++;
    continue;
  }

  const { size } = fs.statSync(imagePath);
  if (size > WARN_BYTES) {
    const kb = Math.round(size / 1024);
    console.warn(
      `⚠  Banner is ${kb}KB (limit 300KB for WhatsApp): ${bannerPath} (in ${file})`
    );
    warnings++;
  }
}

if (warnings > 0) {
  console.warn(`\n  ${warnings} banner warning(s) above — WhatsApp silently drops images over 300KB.\n`);
} else {
  console.log("✓  Banner images OK");
}
