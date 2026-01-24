---
title: My Blog Workflow - 2025
date: 2025-12-13
description: ''
tags:
- blog
external: false
draft: true
---

A quick overview of how I publish my blog.

### SSR

My blog is a static site, and uses [Astro]()

### Blog Editor

In my heart of hearts I love the idea of just editing plain text files (such as astro's markdown), committing and pushing to git, and seeing the page live. The biggest problem for me is the hassle of dealing with images--manually linking/saving them in my repository is just too cumbersome.

I had tried vibe coding a local nodeJS app alongside my blog, which I could spin up, visit on localhost, and have an interface for writing blog posts and editing their files. Importantly, it had a feature where I could paste in an image, and the app would write that to my repo and link it appropriately in the astro file.

While I find personal tools to be some of the better [Uses for AI](What%20I%20find%20AI%20helpful%20for%20in%202025.md), it was still too cumbersome. I had to `cd` into that directory on my local site and start it up.

I recently switched to [Obsidian](https://obsidian.md), which I am loving more and more. It's an open source markdown based editor with a rich text preview that also handles the image problem automatically (among other great feature like managing tables, an element thats a pain in raw markdown).

I pay for
