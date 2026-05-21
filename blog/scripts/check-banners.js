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

function checkImage(filePath, label, file) {
  if (!fs.existsSync(filePath)) {
    console.warn(`⚠  ${label} not found: ${filePath} (in ${file})`);
    warnings++;
    return;
  }
  const { size } = fs.statSync(filePath);
  if (size > WARN_BYTES) {
    const kb = Math.round(size / 1024);
    console.warn(`⚠  ${label} is ${kb}KB (limit 300KB for WhatsApp): ${filePath} (in ${file})`);
    warnings++;
  }
}

for (const file of files) {
  const content = fs.readFileSync(path.join(postsDir, file), "utf-8");
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (!frontmatterMatch) continue;

  const fm = frontmatterMatch[1];

  const bannerMatch = fm.match(/^banner:\s*(.+)$/m);
  if (!bannerMatch) continue;
  const bannerPath = bannerMatch[1].trim().replace(/^['"]|['"]$/g, "");
  if (bannerPath) checkImage(path.join(publicDir, bannerPath), "banner", file);

  // bannerOg is what social platforms actually fetch — check it for WhatsApp
  const ogMatch = fm.match(/^bannerOg:\s*(.+)$/m);
  if (ogMatch) {
    const ogPath = ogMatch[1].trim().replace(/^['"]|['"]$/g, "");
    if (ogPath) checkImage(path.join(publicDir, ogPath), "bannerOg", file);
  }
}

if (warnings > 0) {
  console.warn(`\n  ${warnings} banner warning(s) above — WhatsApp silently drops images over 300KB.\n`);
} else {
  console.log("✓  Banner images OK");
}
