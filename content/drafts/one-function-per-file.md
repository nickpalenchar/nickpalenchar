---
title: "Consider one function per file"
date: 2022-11-16T10:59:34-05:00
draft: true
tags: ["javascript", "python", "coding style"]
---

rather strict with this

### filename/function name parity

Having all files named the same as functions makes searching for the function a breeze no 
matter what environment, [fd](https://lib.rs/crates/fd-find) 

### Smaller files

Who like scrolling up and down files 1000s of lines? No one!

### Less git conflicts

Depending on the project, number of engineers, etc, you might wind up with a few "hot" files, i.e. one
frequently edited on a branch. smaller files makes this 
