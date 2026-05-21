# Theming

## Current: dark mode (default)

The site uses **`data-theme="dark"`** on `<html>`: black page chrome (`#000`) with Inter for navigation and UI.

Blog posts use the **library reading panel** — parchment card, serif typography, warm prose. That panel is the default reading experience in dark mode (light content on a dark surround). Styles live in:

- `src/styles/library-reading.css` — canonical tokens and classes (`.library-reading`, `.library-prose`, …)
- `src/components/LibraryReadingStyles.astro` — loads the stylesheet globally on blog posts

## Planned: light mode

The library reading styles are intended to become the **site-wide light theme**: same parchment palette and serif stack, without the black outer frame. When adding light mode:

1. Set `data-theme="light"` on `<html>` (toggle or `prefers-color-scheme`).
2. Reuse `library-reading.css` for page background, body text, and prose (may drop or soften the card shadow when the whole page is parchment).
3. Point chrome (header, nav, home) at light-theme variables; keep `Layout.astro` UI on Inter until light tokens exist.

## Archive posts (>18 months)

Posts older than 18 months still use the library panel (same as every post) plus the **historian callout** (`ArchivedPostCallout.astro`) — only the callout is archive-specific.

## Legacy flat dark prose (reference)

Before library reading was the default, posts used inverted Tailwind prose on the black background:

```html
<article class="prose prose-invert prose-a:text-blue-300 prose-p:text-[#e5e5e5]">
```

Other sections (favs, cooking-corner, diet) may still use that pattern until migrated.
