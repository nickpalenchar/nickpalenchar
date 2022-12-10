---
title: "Please Keep Your Webapp's State In The URL"
date: 2022-11-18T06:45:12-05:00
draft: true
---

Say I'm looking at some content on your web app and then I refresh the page. Will I see the exact same
content? ("exact same" is same amount, same order, same format).

If the answer is "no", "mostly", "sorta", or "yes, just click the sort by button on the top right and then
select how you filtered before", then you are not websiteing correctly. :grumpy man grumbles:

The entire state of the web app should be in the URL. If anything changes, the URL should change too.

For example, I have a page bookmarked, which is my own [pocket](getpocket.com) content with a certain
tag (the tech things I want to read). I want to read them oldest to newest, which Pocket has a sort-by button
for me to use. While it sorts it correctly, the new sort is not preserved in the URL:

```
getpocket.com/saves/tags/to read
```

The url preserves the fact that I'm looking at only a certain tag, but nothing is keeping track of how I'm sorting.

Why not use a query param to save the state?

```
getpocket.com/saves/tags/to read?sortBy=oldest
```

It could then be parsed by pocket on load.

```
// TODO 
```


