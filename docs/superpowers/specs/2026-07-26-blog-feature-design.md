# Blog Feature Design

**Date:** 2026-07-26
**Status:** Approved

## Goal

Let the site owner publish blog articles by manually dropping `.md` files into a
`blogs/` folder at the repo root. Posts are browsable in both terminal mode
(`ls` / `cd` / `cat`) and desktop mode (File Explorer + markdown viewer window).

## Authoring workflow

- `blogs/` lives at the repo root; each post is one markdown file
  (e.g. `blogs/my-first-article.md`). The filename (minus `.md`) is the slug.
- Each file may start with an optional YAML frontmatter block:

  ```markdown
  ---
  title: My first article
  date: 2026-07-26
  tags: [go, backend]
  ---

  # My first article

  Content here...
  ```

- All frontmatter fields are optional. Fallbacks: `title` defaults to the slug;
  posts without a `date` sort after dated ones; `tags` defaults to empty.
- A starter post `blogs/hello-world.md` is committed as a working example.

## Build step

- New `scripts/generate-blogs.js` — plain Node, no new dependencies.
- Wired via npm `prestart` and `prebuild` hooks so it runs automatically before
  `npm start` and `npm run build`.
- Behavior:
  - Reads every `*.md` in `blogs/` (non-recursive).
  - Parses the frontmatter block with a small hand-rolled parser: a leading
    `---` line, `key: value` lines, closing `---`. `tags` accepts
    `[a, b]` inline-array syntax. The block is stripped from the body.
  - Writes `src/data/blogs.generated.js` exporting
    `blogs = [{ slug, title, date, tags, content }]`, sorted newest-first by
    `date` (undated posts last, then alphabetical by slug).
  - If `blogs/` is missing or empty, emits `blogs = []` — the app must still
    build and run.
- `src/data/blogs.generated.js` is gitignored. To see a newly added post during
  development, rerun the script (or restart the dev server).

## Virtual filesystem

- `src/utils/filesystem.js` gains a `blogs` directory under `~/portfolio`,
  built like the existing `experience`/`projects`/`education` dirs:
  - `README.md` — generated index: intro line + markdown table of
    title / date / tags, one row per post, linking readers to the `<slug>.md`
    files. Kind `blog`.
  - `<slug>.md` per post — content is the markdown body (frontmatter already
    stripped), kind `blog`.
- Index/markdown generation helpers live in `src/data/markdown.ts`
  (`blogsIndex()`), following the existing `projectsReadmeMarkdown()` pattern.

## Terminal mode

- Posts are automatically reachable via the existing `ls` / `cd` / `cat`
  commands once the FS has the `blogs/` dir.
- New `blog` command (alias `blogs`): lists the posts directory, same pattern
  as the `experience` command (`handleLs` of `~/portfolio/blogs`).
- `HELP_TEXT` updated with the new command.

## Desktop mode

- New desktop icon **Blogs** (📰) that opens the File Explorer rooted at
  `~/portfolio/blogs` — same pattern as the Experience/Projects icons in
  `Desktop.jsx`.
- `FileExplorer.iconFor`: kind `blog` → 📰.
- `FileViewer` `KIND_LABEL`: add `blog` chip label; posts render through the
  existing `renderMarkdown` pipeline in a normal file window.

## Error handling

- Missing/empty `blogs/` folder → empty blogs list, empty (but present)
  `blogs/` dir in the virtual FS showing "Empty directory" / blank `ls`.
- Malformed frontmatter (no closing `---`) → treat the whole file as body,
  no metadata.
- Generator failure must not be silent: the script exits non-zero with a clear
  message if it cannot read a file it found.

## Testing

- Frontmatter parser unit tests (exported from the script or a shared module):
  full frontmatter, no frontmatter, partial fields, inline tags array,
  unclosed frontmatter block.
- `filesystem.test.js`: blogs dir exists under `~/portfolio`, contains
  `README.md` plus one file per generated post, `cat`-able content.
- Generator behavior with empty/missing folder covered by parser-level tests
  or a temp-dir test.

## Out of scope

- No runtime fetching, pagination, RSS, comments, or search.
- No frontmatter fields beyond `title`, `date`, `tags`.
- No nested folders inside `blogs/`.
