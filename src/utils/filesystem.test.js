// src/utils/filesystem.test.js
import { initializeFilesystem, navigateFS, listDirectory } from './filesystem';

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

test('listDirectory: ls / returns root contents', () => {
  const fs = initializeFilesystem();
  const items = listDirectory(fs, '/');
  expect(items).toContainEqual(expect.objectContaining({ name: 'home', type: 'dir' }));
});

test('listDirectory: ls nonexistent path returns empty', () => {
  const fs = initializeFilesystem();
  const items = listDirectory(fs, '/fake');
  expect(items).toEqual([]);
});
