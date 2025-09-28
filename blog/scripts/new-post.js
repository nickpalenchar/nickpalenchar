#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const args = process.argv.slice(2);
const title = args[0];

if (!title) {
  console.error('Usage: npm run new-post "Your Post Title"');
  process.exit(1);
}

const slug = title
  .toLowerCase()
  .replace(/[^a-z0-9\s-]/g, '')
  .replace(/\s+/g, '-')
  .trim();

const currentDate = new Date().toISOString().split('T')[0];
const template = `---
title: "${title}"
date: ${currentDate}
description: ""
tags: []
external: false
draft: true
---

Write your blog post content here...`;

const postsDir = path.join(__dirname, '..', 'src', 'content', 'posts');
const filePath = path.join(postsDir, `${slug}.md`);

if (fs.existsSync(filePath)) {
  console.error(`Post "${slug}.md" already exists!`);
  process.exit(1);
}

fs.writeFileSync(filePath, template);
console.log(`✅ Created new post: ${slug}.md`);
console.log(`📝 Edit at: ${filePath}`);
