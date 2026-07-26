// Generates the .md text shown by the FileViewer and printed by `cat`.

import {
  contact,
  about,
  skills,
  experience,
  education,
  projects,
  Experience,
  Project,
  Education,
} from './portfolio';

const stackLine = (stack: string[]) => stack.map((s) => `\`${s}\``).join(' · ');

export function aboutToMarkdown(): string {
  return `# About\n\n${about}\n\n**Currently:** GoLang Developer at Polymorpho.\n**Location:** ${contact.location}.\n`;
}

export function contactToMarkdown(): string {
  return [
    '# Contact',
    '',
    `**Name:** ${contact.name}`,
    `**Email:** ${contact.email}`,
    `**LinkedIn:** ${contact.linkedin}`,
    `**GitHub:** ${contact.github}`,
    `**Location:** ${contact.location}`,
    '',
  ].join('\n');
}

export function skillsToMarkdown(): string {
  return [
    '# Skills',
    '',
    `**Languages:** ${skills.languages.join(', ')}`,
    `**Frontend:** ${skills.frontend.join(', ')}`,
    `**Backend:** ${skills.backend.join(', ')}`,
    `**DevOps / Data:** ${skills.devops.join(', ')}`,
    `**Tools:** ${skills.tools.join(', ')}`,
    '',
  ].join('\n');
}

export function experienceToMarkdown(exp: Experience): string {
  const lines = [
    `# ${exp.company}`,
    '',
    `**${exp.role}** — *${exp.type}* — ${exp.location}`,
    `**${exp.period}**`,
    '',
    exp.summary,
    '',
    '## What I did',
    '',
    ...exp.bullets.map((b) => `- ${b}`),
    '',
    '## Stack',
    '',
    stackLine(exp.stack),
    '',
  ];
  return lines.join('\n');
}

export function projectToMarkdown(p: Project): string {
  const statusBadge: Record<Project['status'], string> = {
    done: '✅ Done',
    'in-progress': '🚧 In progress',
    discontinued: '🗃️ Discontinued',
  };
  const lines = [
    `# ${p.name}`,
    '',
    `**Status:** ${statusBadge[p.status]}   **★** ${p.stars}`,
    '',
    `> ${p.highlight}`,
    '',
    p.description,
    '',
    '## Stack',
    '',
    stackLine(p.stack),
    '',
  ];
  if (p.repo) {
    lines.push(`## Repo`, '', p.repo, '');
  }
  return lines.join('\n');
}

export function educationToMarkdown(ed: Education): string {
  return [
    `# ${ed.school}`,
    '',
    `**${ed.degree}**`,
    `${ed.location}`,
    `${ed.period}`,
    '',
  ].join('\n');
}

export function projectsReadmeMarkdown(): string {
  const lines = [
    '# Projects',
    '',
    `${projects.length} curated projects from my GitHub.`,
    `Open any \`<slug>.md\` to see details, or run \`projects --grid\` in the terminal for a card view.`,
    '',
    '| Project | Status | ★ | Stack |',
    '|---|---|---|---|',
    ...projects.map(
      (p) => `| ${p.name} | ${p.status} | ${p.stars} | ${p.stack.slice(0, 3).join(', ')} |`
    ),
    '',
  ];
  return lines.join('\n');
}

export function experienceIndex(): string {
  return [
    '# Experience',
    '',
    `${experience.length} roles across full-time, part-time, freelance, internship, and open-source volunteer positions.`,
    '',
    '| Company | Role | Period |',
    '|---|---|---|',
    ...experience.map((e) => `| ${e.company} | ${e.role} | ${e.period} |`),
    '',
  ].join('\n');
}

export function educationIndex(): string {
  return [
    '# Education',
    '',
    ...education.map((e) => `- **${e.degree}** — ${e.school} (${e.period})`),
    '',
  ].join('\n');
}

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
