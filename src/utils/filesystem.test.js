// src/utils/filesystem.test.js
import { initializeFilesystem, navigateFS, listDirectory, getFileContent } from './filesystem';

test('navigateFS: cd to existing directory returns new path', () => {
  const fs = initializeFilesystem();
  const newPath = navigateFS(fs, '/', 'home');
  expect(newPath).toBe('/home');
});

test('navigateFS: cd to nonexistent directory returns current path', () => {
  const fs = initializeFilesystem();
  const samePath = navigateFS(fs, '/', 'nonexistent');
  expect(samePath).toBe('/');
});

test('navigateFS: parent directory (..) navigation', () => {
  const fs = initializeFilesystem();
  const path1 = navigateFS(fs, '/', 'home');
  expect(path1).toBe('/home');
  const path2 = navigateFS(fs, path1, '..');
  expect(path2).toBe('/');
});

test('navigateFS: parent directory (..) from root stays at root', () => {
  const fs = initializeFilesystem();
  const path = navigateFS(fs, '/', '..');
  expect(path).toBe('/');
});

test('navigateFS: relative path from nested directory', () => {
  const fs = initializeFilesystem();
  const path1 = navigateFS(fs, '/', 'home');
  const path2 = navigateFS(fs, path1, 'aymane');
  expect(path2).toBe('/home/aymane');
  const path3 = navigateFS(fs, path2, 'documents');
  expect(path3).toBe('/home/aymane/documents');
});

test('navigateFS: absolute path navigation', () => {
  const fs = initializeFilesystem();
  const path = navigateFS(fs, '/home/aymane', '/bin');
  expect(path).toBe('/bin');
});

test('listDirectory: ls / returns root contents', () => {
  const fs = initializeFilesystem();
  const items = listDirectory(fs, '/');
  expect(items).toContainEqual(expect.objectContaining({ name: 'home', type: 'dir' }));
  expect(items).toContainEqual(expect.objectContaining({ name: 'bin', type: 'dir' }));
});

test('listDirectory: ls nonexistent path returns empty', () => {
  const fs = initializeFilesystem();
  const items = listDirectory(fs, '/fake');
  expect(items).toEqual([]);
});

test('listDirectory: items have size property', () => {
  const fs = initializeFilesystem();
  const items = listDirectory(fs, '/');
  items.forEach(item => {
    expect(item).toHaveProperty('size');
  });
});

test('listDirectory: directories have size "-" and files have numeric size', () => {
  const fs = initializeFilesystem();
  const items = listDirectory(fs, '/home/aymane');
  const dirItem = items.find(i => i.name === 'documents');
  const fileItem = items.find(i => i.name === 'experience.txt');
  expect(dirItem.size).toBe('-');
  expect(typeof fileItem.size).toBe('number');
  expect(fileItem.size).toBeGreaterThan(0);
});

test('getFileContent: returns file content for valid file', () => {
  const fs = initializeFilesystem();
  const content = getFileContent(fs, '/home/aymane/experience.txt');
  expect(content).toBe('Senior Developer\n5+ years experience');
});

test('getFileContent: returns null for nonexistent file', () => {
  const fs = initializeFilesystem();
  const content = getFileContent(fs, '/home/aymane/nonexistent.txt');
  expect(content).toBeNull();
});

test('getFileContent: returns null for directory path', () => {
  const fs = initializeFilesystem();
  const content = getFileContent(fs, '/home/aymane');
  expect(content).toBeNull();
});

test('getFileContent: returns file content from nested directory', () => {
  const fs = initializeFilesystem();
  const content = getFileContent(fs, '/home/aymane/projects/projects.txt');
  expect(content).toBe('Project 1\nProject 2\nProject 3');
});

test('filesystem structure: required files exist', () => {
  const fs = initializeFilesystem();
  expect(getFileContent(fs, '/home/aymane/experience.txt')).not.toBeNull();
  expect(getFileContent(fs, '/home/aymane/projects/projects.txt')).not.toBeNull();
  expect(getFileContent(fs, '/home/aymane/documents/aymane belassiria.pdf')).not.toBeNull();
  expect(getFileContent(fs, '/bin/gh')).not.toBeNull();
});
