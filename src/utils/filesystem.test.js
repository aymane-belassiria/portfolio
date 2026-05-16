import {
  initializeFilesystem,
  navigateFS,
  listDirectory,
  getFileContent,
  getNode,
  resolvePath,
  HOME_PATH,
  prettyPath,
} from './filesystem';

test('home directory exists at /home/aymane/portfolio', () => {
  const fs = initializeFilesystem();
  const node = getNode(fs, HOME_PATH);
  expect(node).not.toBeNull();
  expect(node.type).toBe('dir');
});

test('about.md, contact.md, skills.md, resume.pdf exist in home', () => {
  const fs = initializeFilesystem();
  const items = listDirectory(fs, HOME_PATH);
  const names = items.map((i) => i.name);
  expect(names).toEqual(
    expect.arrayContaining(['about.md', 'contact.md', 'skills.md', 'resume.pdf'])
  );
});

test('experience directory contains all seven companies', () => {
  const fs = initializeFilesystem();
  const items = listDirectory(fs, `${HOME_PATH}/experience`);
  const names = items.map((i) => i.name);
  for (const slug of [
    'polymorpho',
    'youcode',
    'quipnex',
    'ocp',
    'sahwa',
    'mchain',
    'kipinia',
  ]) {
    expect(names).toContain(`${slug}.md`);
  }
});

test('projects directory contains curated project files', () => {
  const fs = initializeFilesystem();
  const items = listDirectory(fs, `${HOME_PATH}/projects`);
  const names = items.map((i) => i.name);
  for (const slug of ['booky', 'tighalin', 'spring-resource', 'docker-workshop']) {
    expect(names).toContain(`${slug}.md`);
  }
});

test('navigateFS: relative cd descends into a directory', () => {
  const fs = initializeFilesystem();
  const next = navigateFS(fs, HOME_PATH, 'experience');
  expect(next).toBe(`${HOME_PATH}/experience`);
});

test('navigateFS: absolute cd jumps anywhere', () => {
  const fs = initializeFilesystem();
  const next = navigateFS(fs, HOME_PATH, '/home/aymane/portfolio/projects');
  expect(next).toBe(`${HOME_PATH}/projects`);
});

test('navigateFS: nonexistent target leaves cwd unchanged', () => {
  const fs = initializeFilesystem();
  const next = navigateFS(fs, HOME_PATH, 'no-such-thing');
  expect(next).toBe(HOME_PATH);
});

test('navigateFS: parent (..) goes up', () => {
  const fs = initializeFilesystem();
  const next = navigateFS(fs, `${HOME_PATH}/projects`, '..');
  expect(next).toBe(HOME_PATH);
});

test('navigateFS respects rootPath scope: cannot escape', () => {
  const fs = initializeFilesystem();
  const root = `${HOME_PATH}/projects`;
  const tryEscape = navigateFS(fs, root, '..', root);
  expect(tryEscape).toBe(root);
});

test('getFileContent: returns markdown for .md file', () => {
  const fs = initializeFilesystem();
  const content = getFileContent(fs, `${HOME_PATH}/about.md`);
  expect(typeof content).toBe('string');
  expect(content).toMatch(/About/);
});

test('getFileContent: returns null for nonexistent file', () => {
  const fs = initializeFilesystem();
  expect(getFileContent(fs, `${HOME_PATH}/nope.md`)).toBeNull();
});

test('getFileContent: returns pdf sentinel for resume.pdf', () => {
  const fs = initializeFilesystem();
  const content = getFileContent(fs, `${HOME_PATH}/resume.pdf`);
  expect(content).toEqual({ pdf: true, assetPath: '/aymane belassiria.pdf' });
});

test('resolvePath: handles tilde', () => {
  const fs = initializeFilesystem();
  expect(resolvePath(fs, '/', '~')).toBe(HOME_PATH);
  expect(resolvePath(fs, '/', '~/projects')).toBe(`${HOME_PATH}/projects`);
});

test('prettyPath: collapses home to ~', () => {
  expect(prettyPath(HOME_PATH)).toBe('~/portfolio');
  expect(prettyPath(`${HOME_PATH}/experience`)).toBe('~/portfolio/experience');
  expect(prettyPath('/etc')).toBe('/etc');
});

test('experience file content references the company name', () => {
  const fs = initializeFilesystem();
  const content = getFileContent(fs, `${HOME_PATH}/experience/polymorpho.md`);
  expect(content).toMatch(/Polymorpho/);
});

test('project file content includes status and stack', () => {
  const fs = initializeFilesystem();
  const content = getFileContent(fs, `${HOME_PATH}/projects/tighalin.md`);
  expect(content).toMatch(/tighalin/i);
  expect(content).toMatch(/Stack/);
});
