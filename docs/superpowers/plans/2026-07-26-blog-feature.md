# Blog Feature Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Blog posts authored as `.md` files in a repo-root `blogs/` folder, browsable in both terminal mode (`ls`/`cd`/`cat`, `blog` command) and desktop mode (Blogs icon → File Explorer → markdown viewer).

**Architecture:** A prebuild Node script parses `blogs/*.md` (optional YAML frontmatter: `title`, `date`, `tags`) into a gitignored `src/data/blogs.generated.js`. The existing virtual filesystem (`src/utils/filesystem.js`) mounts those posts as a `blogs/` directory under `~/portfolio`, which both the Terminal and the desktop File Explorer already know how to browse.

**Tech Stack:** CRA (react-scripts 5), React 18, Jest via `react-scripts test`. Generator is plain Node (CommonJS), no new dependencies.

## Global Constraints

- No new npm dependencies.
- Generator script is CommonJS (`require`/`module.exports`) — it runs under plain `node`, not the CRA build.
- `src/data/blogs.generated.js` is gitignored and must never be committed.
- The app must build and run when `blogs/` is missing or empty.
- Frontmatter fields are limited to `title`, `date`, `tags`. All optional.
- Spec: `docs/superpowers/specs/2026-07-26-blog-feature-design.md`.
- Test command: `CI=true npm test -- --testPathPattern=<pattern>` (non-interactive). Note `pretest` runs the generator once it's wired (Task 2).

---

### Task 1: Generator script — frontmatter parser, sorting, loader

**Files:**
- Create: `scripts/generate-blogs.js`
- Test: `src/utils/generateBlogs.test.js`

**Interfaces:**
- Produces (CommonJS exports from `scripts/generate-blogs.js`):
  - `parseFrontmatter(text: string) → { meta: { title: string|null, date: string|null, tags: string[] }, body: string }`
  - `sortPosts(posts) → posts` — newest-first by `date` (string compare on ISO dates), undated posts last, ties alphabetical by `slug`
  - `loadBlogs(dir: string) → [{ slug, title, date, tags, content }]` — `[]` if dir missing
  - CLI (`node scripts/generate-blogs.js`): writes `src/data/blogs.generated.js` exporting `export const blogs = [...]`

- [ ] **Step 1: Write the failing tests**

Create `src/utils/generateBlogs.test.js`:

```js
const {
  parseFrontmatter,
  sortPosts,
  loadBlogs,
} = require('../../scripts/generate-blogs');

test('parseFrontmatter: extracts title, date, and inline tags array', () => {
  const text = '---\ntitle: My first article\ndate: 2026-07-26\ntags: [go, backend]\n---\n\n# Hello\n\nBody text.\n';
  const { meta, body } = parseFrontmatter(text);
  expect(meta.title).toBe('My first article');
  expect(meta.date).toBe('2026-07-26');
  expect(meta.tags).toEqual(['go', 'backend']);
  expect(body).toBe('# Hello\n\nBody text.\n');
});

test('parseFrontmatter: no frontmatter returns whole text as body', () => {
  const text = '# Just a post\n\nNo metadata here.\n';
  const { meta, body } = parseFrontmatter(text);
  expect(meta).toEqual({ title: null, date: null, tags: [] });
  expect(body).toBe(text);
});

test('parseFrontmatter: partial fields fill only what is present', () => {
  const text = '---\ntitle: Only a title\n---\nBody.\n';
  const { meta, body } = parseFrontmatter(text);
  expect(meta.title).toBe('Only a title');
  expect(meta.date).toBeNull();
  expect(meta.tags).toEqual([]);
  expect(body).toBe('Body.\n');
});

test('parseFrontmatter: unclosed frontmatter treats whole file as body', () => {
  const text = '---\ntitle: Broken\n\n# Content\n';
  const { meta, body } = parseFrontmatter(text);
  expect(meta).toEqual({ title: null, date: null, tags: [] });
  expect(body).toBe(text);
});

test('parseFrontmatter: unknown keys are ignored', () => {
  const text = '---\ntitle: Hi\nauthor: someone\n---\nBody.\n';
  const { meta } = parseFrontmatter(text);
  expect(meta.title).toBe('Hi');
  expect(meta).not.toHaveProperty('author');
});

test('sortPosts: newest first, undated last, ties by slug', () => {
  const posts = [
    { slug: 'b-old', date: '2025-01-01' },
    { slug: 'undated-z', date: null },
    { slug: 'a-new', date: '2026-07-01' },
    { slug: 'undated-a', date: null },
  ];
  expect(sortPosts(posts).map((p) => p.slug)).toEqual([
    'a-new',
    'b-old',
    'undated-a',
    'undated-z',
  ]);
});

test('loadBlogs: missing directory returns empty list', () => {
  expect(loadBlogs('/no/such/dir')).toEqual([]);
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `CI=true npm test -- --testPathPattern=generateBlogs`
Expected: FAIL — `Cannot find module '../../scripts/generate-blogs'`

- [ ] **Step 3: Write the implementation**

Create `scripts/generate-blogs.js`:

```js
// Reads blogs/*.md (optional YAML frontmatter: title, date, tags) and writes
// src/data/blogs.generated.js for the virtual filesystem. Runs via the
// prestart/prebuild/pretest npm hooks; see the blog feature spec in docs/.

const fs = require('fs');
const path = require('path');

const BLOGS_DIR = path.join(__dirname, '..', 'blogs');
const OUTPUT_FILE = path.join(__dirname, '..', 'src', 'data', 'blogs.generated.js');

function parseFrontmatter(text) {
  const empty = { title: null, date: null, tags: [] };
  const lines = text.split('\n');
  if (lines[0].replace(/\r$/, '') !== '---') {
    return { meta: empty, body: text };
  }
  let closing = -1;
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].replace(/\r$/, '') === '---') {
      closing = i;
      break;
    }
  }
  if (closing === -1) {
    // Unclosed block: treat the whole file as body, no metadata.
    return { meta: empty, body: text };
  }
  const meta = { ...empty, tags: [] };
  for (const line of lines.slice(1, closing)) {
    const match = line.match(/^(title|date|tags):\s*(.*)$/);
    if (!match) continue;
    const key = match[1];
    const value = match[2].trim();
    if (key === 'tags') {
      meta.tags = value
        .replace(/^\[/, '')
        .replace(/\]$/, '')
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);
    } else {
      meta[key] = value;
    }
  }
  const body = lines.slice(closing + 1).join('\n').replace(/^\n+/, '');
  return { meta, body };
}

function sortPosts(posts) {
  return [...posts].sort((a, b) => {
    if (a.date && b.date) {
      if (a.date !== b.date) return a.date < b.date ? 1 : -1;
      return a.slug.localeCompare(b.slug);
    }
    if (a.date) return -1;
    if (b.date) return 1;
    return a.slug.localeCompare(b.slug);
  });
}

function loadBlogs(dir) {
  if (!fs.existsSync(dir)) return [];
  const files = fs.readdirSync(dir).filter((name) => name.endsWith('.md'));
  const posts = files.map((fileName) => {
    const slug = fileName.replace(/\.md$/, '');
    const raw = fs.readFileSync(path.join(dir, fileName), 'utf8');
    const { meta, body } = parseFrontmatter(raw);
    return {
      slug,
      title: meta.title || slug,
      date: meta.date,
      tags: meta.tags,
      content: body,
    };
  });
  return sortPosts(posts);
}

function main() {
  const posts = loadBlogs(BLOGS_DIR);
  const output =
    '// AUTO-GENERATED by scripts/generate-blogs.js — do not edit by hand.\n' +
    `export const blogs = ${JSON.stringify(posts, null, 2)};\n`;
  fs.writeFileSync(OUTPUT_FILE, output);
  console.log(`generate-blogs: wrote ${posts.length} post(s) to src/data/blogs.generated.js`);
}

if (require.main === module) {
  try {
    main();
  } catch (err) {
    console.error(`generate-blogs failed: ${err.message}`);
    process.exit(1);
  }
}

module.exports = { parseFrontmatter, sortPosts, loadBlogs };
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `CI=true npm test -- --testPathPattern=generateBlogs`
Expected: PASS (7 tests)

- [ ] **Step 5: Commit**

```bash
git add scripts/generate-blogs.js src/utils/generateBlogs.test.js
git commit -m "feat: blog generator script with frontmatter parsing"
```

---

### Task 2: Wire generator into npm lifecycle, sample post, gitignore

**Files:**
- Create: `blogs/hello-world.md`
- Modify: `package.json` (scripts section)
- Modify: `.gitignore`

**Interfaces:**
- Consumes: `scripts/generate-blogs.js` CLI from Task 1.
- Produces: `src/data/blogs.generated.js` exists after any `npm start`/`npm run build`/`npm test` (via `prestart`/`prebuild`/`pretest` hooks), exporting `blogs` — an array whose first entry is the hello-world post `{ slug: 'hello-world', title: 'Hello, world', date: '2026-07-26', tags: ['meta'], content: '# Hello, world\n...' }`. Later tasks import `{ blogs }` from `'../data/blogs.generated'`.

- [ ] **Step 1: Create the sample post**

Create `blogs/hello-world.md`:

```markdown
---
title: Hello, world
date: 2026-07-26
tags: [meta]
---

# Hello, world

Welcome to my blog. I write about Go, backend engineering, and things I
learn while building software.

To add a post, drop a `.md` file into the `blogs/` folder of this repo —
it shows up here on the next build. Frontmatter (`title`, `date`, `tags`)
is optional.
```

- [ ] **Step 2: Add npm lifecycle hooks**

In `package.json`, replace the `scripts` block:

```json
"scripts": {
  "generate-blogs": "node scripts/generate-blogs.js",
  "prestart": "npm run generate-blogs",
  "prebuild": "npm run generate-blogs",
  "pretest": "npm run generate-blogs",
  "start": "react-scripts start",
  "build": "react-scripts build",
  "test": "react-scripts test",
  "eject": "react-scripts eject"
},
```

- [ ] **Step 3: Gitignore the generated file**

Append to `.gitignore` (under the `# misc` section):

```
# generated
/src/data/blogs.generated.js
```

- [ ] **Step 4: Run the generator and verify output**

Run: `npm run generate-blogs`
Expected output: `generate-blogs: wrote 1 post(s) to src/data/blogs.generated.js`

Run: `node -e "const s=require('fs').readFileSync('src/data/blogs.generated.js','utf8'); console.log(s.includes(\"\\\"slug\\\": \\\"hello-world\\\"\") && s.includes('Hello, world'))"`
Expected: `true`

Run: `git status --porcelain -- src/data/blogs.generated.js`
Expected: empty output (file is ignored)

- [ ] **Step 5: Commit**

```bash
git add blogs/hello-world.md package.json .gitignore
git commit -m "feat: blogs folder with sample post, generator wired into npm lifecycle"
```

---

### Task 3: Mount blogs in the virtual filesystem

**Files:**
- Modify: `src/data/markdown.ts` (append at end)
- Modify: `src/utils/filesystem.js:1-67` (imports + `initializeFilesystem`)
- Test: `src/utils/filesystem.test.js` (append)

**Interfaces:**
- Consumes: `blogs` array from `src/data/blogs.generated.js` (Task 2); `file()`/`dir()` helpers already in `filesystem.js`.
- Produces:
  - `blogsIndex(posts: BlogPost[]): string` in `src/data/markdown.ts`, where `BlogPost = { slug: string; title: string; date: string | null; tags: string[]; content: string }`
  - Virtual FS directory `/home/aymane/portfolio/blogs` containing `README.md` plus `<slug>.md` per post, every file with `kind: 'blog'`. Terminal `ls`/`cat` and desktop File Explorer pick this up with no further changes.

- [ ] **Step 1: Write the failing tests**

Append to `src/utils/filesystem.test.js`:

```js
test('blogs directory exists under home with README index', () => {
  const fs = initializeFilesystem();
  const node = getNode(fs, `${HOME_PATH}/blogs`);
  expect(node).not.toBeNull();
  expect(node.type).toBe('dir');
  const names = listDirectory(fs, `${HOME_PATH}/blogs`).map((i) => i.name);
  expect(names).toContain('README.md');
});

test('blogs directory contains the sample hello-world post with kind blog', () => {
  const fs = initializeFilesystem();
  const items = listDirectory(fs, `${HOME_PATH}/blogs`);
  const entry = items.find((i) => i.name === 'hello-world.md');
  expect(entry).toBeDefined();
  expect(entry.kind).toBe('blog');
  const content = getFileContent(fs, `${HOME_PATH}/blogs/hello-world.md`);
  expect(content).toMatch(/Hello, world/);
  expect(content).not.toMatch(/^---/); // frontmatter stripped
});

test('blogs README lists post title and date', () => {
  const fs = initializeFilesystem();
  const readme = getFileContent(fs, `${HOME_PATH}/blogs/README.md`);
  expect(readme).toMatch(/# Blog/);
  expect(readme).toMatch(/Hello, world/);
  expect(readme).toMatch(/2026-07-26/);
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `CI=true npm test -- --testPathPattern=filesystem`
Expected: FAIL — the three new tests fail (`node` is null / entries missing); pre-existing tests still pass.

- [ ] **Step 3: Add `blogsIndex` to `src/data/markdown.ts`**

Append at the end of `src/data/markdown.ts`:

```ts
export interface BlogPost {
  slug: string;
  title: string;
  date: string | null;
  tags: string[];
  content: string;
}

export function blogsIndex(posts: BlogPost[]): string {
  if (posts.length === 0) {
    return ['# Blog', '', 'No posts yet — check back soon.', ''].join('\n');
  }
  return [
    '# Blog',
    '',
    `${posts.length} post(s). Open any \`<slug>.md\` to read, newest first.`,
    '',
    '| Post | Date | Tags |',
    '|---|---|---|',
    ...posts.map(
      (p) => `| ${p.title} (\`${p.slug}.md\`) | ${p.date || '—'} | ${p.tags.join(', ')} |`
    ),
    '',
  ].join('\n');
}
```

- [ ] **Step 4: Mount the directory in `src/utils/filesystem.js`**

Add `blogs` to the existing imports and pull in the generated data. The import block becomes:

```js
import { experience, projects, education } from '../data/portfolio';
import { blogs } from '../data/blogs.generated';
import {
  aboutToMarkdown,
  contactToMarkdown,
  skillsToMarkdown,
  experienceToMarkdown,
  projectToMarkdown,
  educationToMarkdown,
  projectsReadmeMarkdown,
  experienceIndex,
  educationIndex,
  blogsIndex,
} from '../data/markdown';
```

Add a builder next to `buildEducationDir()`:

```js
function buildBlogsDir() {
  const children = { 'README.md': file(blogsIndex(blogs), 'blog') };
  for (const post of blogs) {
    children[`${post.slug}.md`] = file(post.content, 'blog');
  }
  return dir(children);
}
```

Register it in `initializeFilesystem()` — the `portfolio` dir becomes:

```js
portfolio: dir({
  'about.md': file(aboutToMarkdown(), 'about'),
  'contact.md': file(contactToMarkdown(), 'contact'),
  'skills.md': file(skillsToMarkdown(), 'skills'),
  'resume.pdf': pdf(RESUME_ASSET_PATH),
  experience: buildExperienceDir(),
  projects: buildProjectsDir(),
  education: buildEducationDir(),
  blogs: buildBlogsDir(),
}),
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `CI=true npm test -- --testPathPattern=filesystem`
Expected: PASS (all tests, including the 3 new ones)

- [ ] **Step 6: Commit**

```bash
git add src/data/markdown.ts src/utils/filesystem.js src/utils/filesystem.test.js
git commit -m "feat: mount blogs directory in virtual filesystem"
```

---

### Task 4: Terminal `blog` command

**Files:**
- Modify: `src/components/Terminal.jsx:24-45` (HELP_TEXT) and `:180-266` (command switch)
- Test: `src/components/Terminal.test.js` (append)

**Interfaces:**
- Consumes: virtual FS `blogs/` dir from Task 3; existing `handleLs` helper in `Terminal.jsx`.
- Produces: terminal commands `blog` and `blogs`, both listing `~/portfolio/blogs`.

- [ ] **Step 1: Write the failing tests**

Append to `src/components/Terminal.test.js`:

```js
test('blog command lists blog posts', () => {
  const { container } = render(<Terminal />);
  typeAndEnter(container, 'blog');
  expect(container.textContent).toMatch(/hello-world\.md/);
});

test('blogs alias also lists blog posts', () => {
  const { container } = render(<Terminal />);
  typeAndEnter(container, 'blogs');
  expect(container.textContent).toMatch(/hello-world\.md/);
});

test('ls shows the blogs directory at portfolio root', () => {
  const { container } = render(<Terminal />);
  typeAndEnter(container, 'ls');
  expect(container.textContent).toMatch(/blogs\//);
});

test('help mentions the blog command', () => {
  const { container } = render(<Terminal />);
  typeAndEnter(container, 'help');
  expect(container.textContent).toMatch(/blog/);
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `CI=true npm test -- --testPathPattern=Terminal`
Expected: FAIL — `blog command lists blog posts`, `blogs alias also lists blog posts`, and `help mentions the blog command` fail (`command not found`); `ls shows the blogs directory` already passes thanks to Task 3.

- [ ] **Step 3: Implement the command**

In `src/components/Terminal.jsx`, add one line to `HELP_TEXT` after the `projects --grid` line:

```
  blog                 list blog posts
```

In the `executeCommand` switch, add after the `projects` case:

```js
case 'blog':
case 'blogs':
  handleLs(`${HOME_PATH}/blogs`);
  break;
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `CI=true npm test -- --testPathPattern=Terminal`
Expected: PASS (all tests)

- [ ] **Step 5: Commit**

```bash
git add src/components/Terminal.jsx src/components/Terminal.test.js
git commit -m "feat: terminal blog command"
```

---

### Task 5: Desktop icon, explorer icon, viewer label + full verification

**Files:**
- Modify: `src/components/Desktop.jsx:202-235` (icons array)
- Modify: `src/components/FileExplorer.jsx:47-56` (`iconFor`)
- Modify: `src/components/FileViewer.jsx:5-12` (`KIND_LABEL`)

**Interfaces:**
- Consumes: `openExplorer(rootPath)` in `Desktop.jsx`, virtual FS `blogs/` dir from Task 3.
- Produces: desktop "Blogs" icon opening File Explorer at `~/portfolio/blogs`; 📰 icon for `kind: 'blog'` files; `blog` chip label in the file viewer.

- [ ] **Step 1: Add the desktop icon**

In `src/components/Desktop.jsx`, add to the `icons` array after the `icon-projects` entry:

```js
{
  id: 'icon-blogs',
  label: 'Blogs',
  emoji: '📰',
  onOpen: () => openExplorer(`${HOME_PATH}/blogs`),
},
```

- [ ] **Step 2: Add the explorer file icon**

In `src/components/FileExplorer.jsx`, in `iconFor`, add after the `pdf` line:

```js
if (item.kind === 'blog') return '📰';
```

- [ ] **Step 3: Add the viewer kind label**

In `src/components/FileViewer.jsx`, add to `KIND_LABEL`:

```js
blog: 'blog',
```

- [ ] **Step 4: Run the full test suite**

Run: `CI=true npm test -- --watchAll=false`
Expected: PASS — all test suites (filesystem, generateBlogs, Terminal, App)

- [ ] **Step 5: Verify a production build**

Run: `npm run build`
Expected: `generate-blogs: wrote 1 post(s)...` printed first, then `Compiled successfully.` with no ESLint warnings.

- [ ] **Step 6: Manual smoke check (dev server)**

Run `npm start`, then verify in the browser:
- Terminal mode: `blog` lists `README.md  hello-world.md`; `cat blogs/hello-world.md` prints the post without frontmatter.
- Desktop mode: double-click the 📰 Blogs icon → File Explorer at `~/portfolio/blogs`; open `hello-world.md` → markdown window with a `blog` chip.

- [ ] **Step 7: Commit**

```bash
git add src/components/Desktop.jsx src/components/FileExplorer.jsx src/components/FileViewer.jsx
git commit -m "feat: blogs in desktop mode — icon, explorer, viewer label"
```
