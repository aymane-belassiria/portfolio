// Virtual filesystem backing the terminal commands (ls/cd/cat/pwd) and the
// desktop File Explorer. Content for .md files is generated from
// src/data/portfolio.ts so there's a single source of truth.

import { experience, projects, education } from '../data/portfolio';
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
} from '../data/markdown';

export const HOME_PATH = '/home/aymane/portfolio';
export const RESUME_ASSET_PATH = '/aymane belassiria.pdf';

const file = (content, kind) => ({ type: 'file', content, kind });
const dir = (children) => ({ type: 'dir', children });
const pdf = (assetPath) => ({ type: 'file', kind: 'pdf', assetPath, content: '' });

function buildExperienceDir() {
  const children = { 'README.md': file(experienceIndex(), 'experience') };
  for (const exp of experience) {
    children[`${exp.slug}.md`] = file(experienceToMarkdown(exp), 'experience');
  }
  return dir(children);
}

function buildProjectsDir() {
  const children = { 'README.md': file(projectsReadmeMarkdown(), 'project') };
  for (const p of projects) {
    children[`${p.slug}.md`] = file(projectToMarkdown(p), 'project');
  }
  return dir(children);
}

function buildEducationDir() {
  const children = { 'README.md': file(educationIndex(), 'education') };
  for (const ed of education) {
    children[`${ed.slug}.md`] = file(educationToMarkdown(ed), 'education');
  }
  return dir(children);
}

export function initializeFilesystem() {
  return {
    root: {
      home: dir({
        aymane: dir({
          portfolio: dir({
            'about.md': file(aboutToMarkdown(), 'about'),
            'contact.md': file(contactToMarkdown(), 'contact'),
            'skills.md': file(skillsToMarkdown(), 'skills'),
            'resume.pdf': pdf(RESUME_ASSET_PATH),
            experience: buildExperienceDir(),
            projects: buildProjectsDir(),
            education: buildEducationDir(),
          }),
        }),
      }),
    },
  };
}

// Resolve an absolute or relative path string against a current working
// directory, returning a normalized absolute path string. Returns `null` if
// the path does not exist OR is outside `rootPath` (when provided).
export function resolvePath(fs, currentPath, target, rootPath = null) {
  if (target === undefined || target === null || target === '') {
    return currentPath;
  }
  let segments;
  if (target.startsWith('/')) {
    segments = target.split('/').filter(Boolean);
  } else if (target === '~' || target.startsWith('~/')) {
    const rest = target === '~' ? '' : target.slice(2);
    segments = (HOME_PATH + (rest ? '/' + rest : '')).split('/').filter(Boolean);
  } else {
    segments = currentPath.split('/').filter(Boolean);
    for (const piece of target.split('/')) {
      if (piece === '' || piece === '.') continue;
      if (piece === '..') {
        segments.pop();
      } else {
        segments.push(piece);
      }
    }
  }

  const candidate = '/' + segments.join('/');
  const node = nodeAt(fs, segments);
  if (!node) return null;

  if (rootPath) {
    const normalizedRoot = rootPath.endsWith('/') ? rootPath.slice(0, -1) : rootPath;
    if (candidate !== normalizedRoot && !candidate.startsWith(normalizedRoot + '/')) {
      return null;
    }
  }
  return candidate;
}

function nodeAt(fs, segments) {
  let current = fs.root;
  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    if (!current[seg]) return null;
    if (i === segments.length - 1) return current[seg];
    if (current[seg].type !== 'dir') return null;
    current = current[seg].children;
  }
  // empty segments => root
  return { type: 'dir', children: fs.root };
}

export function navigateFS(fs, currentPath, targetDir, rootPath = null) {
  const resolved = resolvePath(fs, currentPath, targetDir, rootPath);
  if (!resolved) return currentPath;
  const segments = resolved.split('/').filter(Boolean);
  const node = nodeAt(fs, segments);
  if (!node || node.type !== 'dir') return currentPath;
  return resolved;
}

export function listDirectory(fs, path) {
  const segments = path.split('/').filter(Boolean);
  const node = nodeAt(fs, segments);
  if (!node || node.type !== 'dir') return [];
  return Object.entries(node.children).map(([name, child]) => ({
    name,
    type: child.type,
    kind: child.kind,
    size: child.type === 'dir' ? '-' : (child.content || '').length,
  }));
}

export function getNode(fs, path) {
  const segments = path.split('/').filter(Boolean);
  return nodeAt(fs, segments);
}

export function getFileContent(fs, path) {
  const node = getNode(fs, path);
  if (!node || node.type !== 'file') return null;
  if (node.kind === 'pdf') {
    return { pdf: true, assetPath: node.assetPath };
  }
  return node.content || '';
}

// Convenience: turn an absolute path into "~/portfolio/..." for display.
export function prettyPath(path) {
  if (path === HOME_PATH) return '~/portfolio';
  if (path.startsWith(HOME_PATH + '/')) return '~/portfolio' + path.slice(HOME_PATH.length);
  return path;
}
