# Theming

## Current: dark mode (default)

The site uses **`data-theme="dark"`** on `<html>`: black page chrome (`#000`) with Inter for navigation and UI.

**Recent blog posts** use flat inverted prose on the black background (unchanged from the original layout).

**Archived blog posts** (>18 months old) use the **library reading panel** — parchment card, serif typography, warm prose, and the historian callout. Styles live in:

- `src/styles/library-reading.css` — canonical tokens and classes (`.library-reading`, `.library-prose`, …)
- `src/components/LibraryReadingStyles.astro` — loads the stylesheet on archived posts only

## Planned: light mode

The library reading styles are intended to become the **site-wide light theme**: same parchment palette and serif stack. When adding light mode, reuse `library-reading.css` and set `data-theme="light"` on `<html>`.

## Archive posts (>18 months)

See `src/utils/post-age.ts` (`isArchivedPost`). Archive-only UI: library panel + `ArchivedPostCallout.astro`.

## Default dark prose (recent posts)

```html
<article class="prose prose-invert prose-a:text-blue-300 prose-p:text-[#e5e5e5]">
```

Other sections (favs, cooking-corner, diet) use the same inverted pattern until migrated.
