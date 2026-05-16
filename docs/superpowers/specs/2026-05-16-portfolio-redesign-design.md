# Portfolio Redesign — Design Spec

**Date:** 2026-05-16
**Author:** Aymane Belassiria
**Status:** Approved (sections 1–4)

## Goal

Align the deployed portfolio with the owner's real CV and GitHub work, replace the mode-toggle UI with terminal-driven mode switching, unify two divergent terminal implementations, and add a clickable "commands-as-files" model backed by a virtual filesystem.

## Problems with the current state

1. A three-button mode toggle (Terminal / Desktop / Projects) is visible on every page. The owner wants mode switching done through the terminal itself.
2. Default page should be the terminal; there is no `desktop` command to switch views.
3. `src/data/mockData.js` and `src/components/ProjectCards.jsx` contain placeholder data ("Tech Company", "Weather App", "Task Manager") that have nothing to do with the owner's real experience or repos.
4. The resume PDF is not visible on the desktop view.
5. Terminal output is static text; there is no way for a visitor to click a result and open it as a file.
6. The desktop-mode terminal (`src/components/Terminal.jsx`) is a separate implementation from the standalone terminal (`src/components/Input` + `src/components/Outputs`). It has a different (smaller) command set and a visual gap between the prompt and the input.
7. The GitHub project list shown in the UI does not reflect the owner's real (and best) repos.

## High-level architecture

**Mode switching via terminal commands.** `App.tsx` keeps `mode` state (`'terminal' | 'desktop'`), but the toggle UI is removed. The terminal accepts a `desktop` command to enter desktop mode and a `terminal` command to leave it. The third mode (`projects`) is retired — ProjectCards becomes a windowed component reachable via `projects --grid` in the terminal, or is removed entirely (see "Open question" below).

**One unified terminal engine.** A single React component (working name `Terminal`) implements all commands and is used both in standalone mode and inside desktop Window instances. The legacy `Input` + `Outputs` + `commands.ts` flow and the desktop-only `Terminal.jsx` are both replaced by this engine.

**One virtual filesystem.** An in-memory tree rooted at `/home/aymane/portfolio` is the single source of truth for terminal `ls/cd/cat/pwd` and the desktop File Explorer.

**One typed data module.** `src/data/portfolio.ts` (replacing `mockData.js`) holds the owner's CV experience, education, contact, skills, and curated projects. The filesystem's `.md` file contents are generated from this module at load time.

## Component-level design

### 1. Virtual filesystem (`src/utils/filesystem.js` — extend existing)

Tree:

```
/home/aymane/portfolio/
├── about.md
├── contact.md
├── skills.md
├── resume.pdf              # special node: opens PDFViewer, not text viewer
├── experience/
│   ├── polymorpho.md
│   ├── youcode.md
│   ├── quipnex.md
│   ├── ocp.md
│   ├── sahwa.md
│   ├── mchain.md
│   └── kipinia.md
├── education/
│   ├── youcode.md
│   └── cadi-ayyad.md
└── projects/
    ├── README.md
    ├── booky.md
    ├── tighalin.md
    ├── spring-resource.md
    ├── file-rouge.md
    ├── docker-workshop.md
    ├── youquiz-ng.md
    ├── dalle-clone.md
    ├── blockchain-js.md
    ├── uniswap-clone.md
    ├── monsalonline.md
    ├── youstream.md
    ├── go-contractor.md
    ├── rust-mini-projects.md
    └── nft-mint.md
```

Each `.md` node carries a `kind` field so the file viewer knows how to render it (`'about' | 'experience' | 'project' | 'education' | 'skills' | 'contact'`). `resume.pdf` carries `kind: 'pdf'` and resolves to the asset path `/aymane belassiria.pdf` (already in `public/`).

`getFileContent` returns the generated markdown for `.md` files and a special sentinel `{ pdf: true, path: '/aymane belassiria.pdf' }` for the resume.

### 2. Data module (`src/data/portfolio.ts` — new, replaces `mockData.js`)

Typed module exporting:

```ts
export type Experience = {
  slug: string;          // 'polymorpho'
  company: string;
  role: string;
  type: string;          // 'full-time' | 'part-time' | 'internship' | 'freelance' | 'volunteer'
  location: string;
  period: string;        // '08/2025 - Current'
  summary: string;
  bullets: string[];
  stack: string[];
};

export type Project = {
  slug: string;
  name: string;
  description: string;
  stack: string[];
  status: 'done' | 'in-progress' | 'discontinued';
  stars: number;
  repo: string;
  highlight: string;
};

export const contact: { name; email; linkedin; github; website; location };
export const about: string;
export const skills: { languages; frontend; backend; devops; tools };
export const experience: Experience[];
export const education: Education[];
export const projects: Project[];
```

**Experience entries (all 7 from CV):**

| Slug | Company | Role | Period | Key stack |
|------|---------|------|--------|-----------|
| polymorpho | Polymorpho | GoLang developer (full-time) | 08/2025 – Current | Go, Wails, Docker, monorepo, smart contracts, Railgun, ZK-proofs |
| youcode | YouCode | Full Stack developer (full-time) | 09/2024 – 08/2025 | Go (Docker SDK), Kubernetes, React/TS, Spring Boot, Spring AI, Ansible, Langchain, RAG, native PHP |
| quipnex | Quipnex | Full Stack developer (part-time, remote) | 02/2024 – 09/2024 | Angular 15→18, Spring Boot, Bitbucket |
| ocp | OCP Maintenance Solutions | Full Stack internship (hybrid) | 06/2024 – 09/2024 | Laravel, React, native PHP, Webpack→Vite, Docker, Figma |
| sahwa | Sahwa (open source) | Full Stack volunteer (remote) | 05/2024 – Current | Next.js, security/arch decisions, ClickUp |
| mchain | Mchain | Back-end internship (remote) | 05/2023 – 08/2023 | HyperLedger Fabric, gRPC, Docker, RabbitMQ, Metabase, GitHub Actions |
| kipinia | Kipinia | Full-stack freelance (remote) | 06/2021 – 10/2021 | Node.js/Express, MongoDB Atlas, EJS/jQuery/Bootstrap, Heroku, Trello |

**Education entries (2):** YouCode Web & Mobile dev (09/2022–04/2024), Cadi-Ayyad Bachelor CS (09/2018–06/2021).

**Curated projects (15, all "sexy"):**

| Slug | Name | Stack | Status | Stars |
|------|------|-------|--------|-------|
| booky | Booky | Go (cloud-native) | done | 10 |
| tighalin | tighalin | Go (interpreter for a custom language) | done | 9 |
| spring-resource | spring-resource | Go (Spring Boot resource CLI) | done | 8 |
| file-rouge | file-rouge | PHP (end-of-studies platform) | done | 7 |
| docker-workshop | docker-workshop | Dockerfile (workshop) | done | 6 |
| youquiz-ng | YouQuiz-NG | Angular/TS (kahoot-style UI) | done | 3 |
| dalle-clone | dall.e-clone | React/Vue/TS | done | 2 |
| monsalonline | MonSalonline | Vue (barber appointments) | done | 2 |
| go-contractor | go-contractor | Go (data contracts between teams) | in-progress | 1 |
| rust-mini-projects | rust-mini-projects | Rust | in-progress | 1 |
| blockchain-js | blockchain-js | vanilla JS blockchain | done | 1 |
| youstream | YouStream | Java/Spring Boot (live streaming) | done | 1 |
| uniswap-clone | uniswap-clone | React + GraphQL + Solidity | done | 0 |
| nft-mint | nft-mint | Solidity (NFT minting) | done | 0 |
| rust-crawler | (Polymorpho internal) Rust Web Crawler & Scraper | Rust | discontinued | — |

The Rust crawler comes from the CV's Polymorpho section and is not a public repo, so it's listed without a `repo` URL.

**Markdown generation:** small pure functions (`experienceToMarkdown`, `projectToMarkdown`, etc.) take a typed entry and return a markdown string. Called once at filesystem init.

### 3. Unified terminal engine (`src/components/Terminal.jsx` — rewrite)

**Commands implemented:**

Shell-like:
- `ls [path]` — list directory contents (folders first).
- `cd [path]` — change directory; `cd` alone returns to `/home/aymane/portfolio`.
- `pwd` — print current directory.
- `cat <file>` — print file content. In desktop mode, also opens the file in a FileViewer window (PDFViewer for `resume.pdf`).
- `clear` — clear terminal output.
- `help` — list all commands.

Portfolio aliases (all resolve to a `cat`/`ls` under the hood, but accept no args):
- `about` → `cat ~/portfolio/about.md`
- `experience` → `ls ~/portfolio/experience/`
- `projects` → `ls ~/portfolio/projects/`
- `skills` → `cat ~/portfolio/skills.md`
- `contact` → `cat ~/portfolio/contact.md`
- `whoami` → single-line output `aymane belassiria — fullstack developer`
- `github` → opens (or prints) the GitHub URL
- `linkedin` → opens (or prints) the LinkedIn URL
- `email` → prints contact email

Mode-switch:
- `desktop` — transitions App to desktop mode (no-op if already there).
- `terminal` — transitions App to terminal mode (used from a terminal opened inside a desktop window).

Optional:
- `projects --grid` — opens ProjectCards in a window (desktop mode only); in standalone mode it prints a notice telling the user to enter `desktop` first.

**Mode-switch wiring:** the Terminal component receives an `onModeChange(mode)` prop from App (passed down through Desktop). When the user types `desktop` or `terminal`, the engine calls this callback.

**FileViewer wiring:** the Terminal component receives an `onFileOpen(filePath, content)` prop. When `cat` runs on a `.md` file and the prop is defined (desktop mode), it both prints the content AND calls the callback. In standalone mode the prop is undefined and only the print happens.

**Prompt format:** `aymane@aymane:~/portfolio$ ` (current path rendered relative to home where possible). The prompt and the input live in one flex row, `align-items: baseline`, with `padding: 0` and `margin: 0` on the input — fixing the visible gap in the current desktop terminal.

**Command history:** existing up/down arrow behavior preserved.

### 4. Desktop view (`src/components/Desktop.jsx` — extend)

**Top menu bar buttons:** `Files`, `New Terminal`, `Resume`, `Back to Terminal` (the last triggers `onModeChange('terminal')`).

**Desktop icon grid** (new, replaces empty desktop area):
- 📄 Resume → opens PDFViewer window
- 📁 Experience → opens File Explorer window rooted at `~/portfolio/experience/`
- 📁 Projects → opens File Explorer window rooted at `~/portfolio/projects/`
- 📄 About → opens FileViewer window with `about.md`
- 📄 Skills → opens FileViewer window with `skills.md`
- 📄 Contact → opens FileViewer window with `contact.md`
- 💻 Terminal → opens Terminal window

Single-click on mobile, double-click on desktop. Icons are absolutely positioned in a grid on the left side of the desktop area.

**Auto-open on first entry into desktop mode:** one PDFViewer window for the resume, opened centered-right.

**Window types:** existing `terminal`, `resume` kept; add `file` (FileViewer with `filePath`) and `explorer` (FileExplorer with optional `rootPath`). The `files` placeholder window content (currently `"Files Browser"`) is replaced by the real FileExplorer.

**Taskbar:** unchanged behavior.

### 5. File Explorer (`src/components/FileExplorer.jsx` — extend)

Add a `rootPath` prop (default `/`). When provided, the explorer cannot navigate above that path (the `↑` button is hidden or disabled at the root). Used by the `Experience` and `Projects` icons to scope the view.

Clicking a `.md` file calls `onFileOpen(filePath, content)`, which Desktop turns into a new FileViewer window. Clicking `resume.pdf` opens a PDFViewer window instead.

### 6. File Viewer (`src/components/FileViewer.jsx` — extend)

Currently renders `content` inside a `<pre>` tag. Add minimal markdown rendering: headings, lists, links, code spans, bold/italic. (Simple regex-based renderer is fine — the markdown is generated by us, so we know what features to handle.) No new dependency needed; ~50 LOC.

The viewer also displays a small header with the file path and a "kind" badge (`experience` / `project` / `about` / etc.) so the visitor knows what they're looking at.

### 7. App.tsx (rewrite)

```tsx
function App() {
  const [mode, setMode] = useState<'terminal' | 'desktop'>('terminal');
  return (
    <main className="w-screen font-dejavu">
      {mode === 'terminal' && <TerminalView onModeChange={setMode} />}
      {mode === 'desktop' && <Desktop onModeChange={setMode} />}
    </main>
  );
}
```

`TerminalView` is a thin wrapper that places the unified Terminal in the full-screen green-on-black layout that exists today (no window chrome, no taskbar). The mode-toggle div and the `'projects'` mode are removed.

## Files changed

| File | Change |
|------|--------|
| `src/App.tsx` | Rewrite: drop toggle UI, drop `'projects'` mode, pass `onModeChange` |
| `src/App.css` | Remove `.mode-toggle`, `.mode-btn` styles |
| `src/data/portfolio.ts` | **New** — typed CV + projects data module |
| `src/data/mockData.js` | **Delete** |
| `src/data/markdown.ts` | **New** — `experienceToMarkdown`, `projectToMarkdown`, etc. |
| `src/utils/filesystem.js` | Extend: tree reflects portfolio structure, content from `portfolio.ts` |
| `src/components/Terminal.jsx` | Rewrite: unified engine with all commands + mode-switch |
| `src/components/Input/` | **Delete** (replaced by Terminal) |
| `src/components/Outputs/` | **Delete** (replaced by Terminal) |
| `src/components/Init/` | Keep (ASCII art banner used by Terminal on first render) |
| `src/assets/commands.ts` | **Delete** (data moves to `portfolio.ts`) |
| `src/components/TerminalView.jsx` | **New** — full-screen wrapper around Terminal |
| `src/components/Desktop.jsx` | Add icon grid, auto-open resume, wire `onModeChange`, replace files placeholder |
| `src/components/Window.jsx` | Unchanged |
| `src/components/FileExplorer.jsx` | Add `rootPath` prop; handle `resume.pdf` click |
| `src/components/FileViewer.jsx` | Add minimal markdown rendering + kind badge |
| `src/components/PDFViewer.jsx` | Unchanged |
| `src/components/ProjectCards.jsx` | Read from `portfolio.ts`; reachable via `projects --grid` |
| `src/context/terminal.context.tsx` | Either remove (state moves into Terminal) or repurpose to hold mode |
| `src/styles/desktop.css` | Add icon-grid styles |
| `src/styles/terminal.css` | Fix prompt-input gap, align tokens with standalone style |

## Testing

- Existing tests: `src/components/Terminal.test.js`, `src/utils/filesystem.test.js`, `src/utils/pdfParser.test.js`, `src/App.test.tsx`. Update Terminal.test.js to cover the new command set (ls, cd, cat, about, experience, projects, desktop, terminal mode-switch). Update filesystem.test.js for the new tree.
- New tests: markdown generator (`markdown.test.ts` — round-trip a couple of entries), mode-switch (Terminal calls `onModeChange` when given `desktop`).
- Manual verification: run `npm start`, walk through `help → about → experience → cd experience → ls → cat polymorpho.md → desktop → click Resume icon → open terminal window → type ls → type terminal`.

## Open questions

1. **ProjectCards retention.** Section 3 keeps it behind `projects --grid`. Alternative: delete it entirely and rely solely on the Projects folder + project `.md` files. Marked for review.
2. **Mobile desktop interactions.** Single-click vs. double-click on icons differs by viewport width; needs a small media-query check. Not blocking — handled during implementation.

## Non-goals

- Live GitHub API integration (curated static list chosen).
- Real shell features beyond `ls/cd/cat/pwd/clear/help` (no piping, redirection, globbing, env vars).
- Authentication, contact forms, analytics, blog/CMS.
- Visual redesign beyond the icon grid and the prompt gap fix. The existing color palette and fonts stay.
