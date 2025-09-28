#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const args = process.argv.slice(2);
const title = args[0];

if (!title) {
  console.error('Usage: npm run new-project "Your Project Title"');
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
description: "A brief description of your project"
date: ${currentDate}
url: "https://github.com/yourusername/project"
image: ""
draft: false
---

Write your project description here...`;

const projectsDir = path.join(__dirname, '..', 'src', 'content', 'projects');
const filePath = path.join(projectsDir, `${slug}.md`);

if (fs.existsSync(filePath)) {
  console.error(`Project "${slug}.md" already exists!`);
  process.exit(1);
}

fs.writeFileSync(filePath, template);
console.log(`✅ Created new project: ${slug}.md`);
console.log(`📝 Edit at: ${filePath}`);
