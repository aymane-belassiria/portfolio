import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Terminal from './Terminal';

function typeAndEnter(container, text) {
  const input = container.querySelector('input[type="text"]');
  fireEvent.change(input, { target: { value: text } });
  fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
}

test('Terminal renders with portfolio prompt', () => {
  const { container } = render(<Terminal />);
  expect(container.textContent).toMatch(/aymane@aymane/);
  expect(container.textContent).toMatch(/~\/portfolio/);
});

test('help command prints command list', () => {
  const { container } = render(<Terminal />);
  typeAndEnter(container, 'help');
  expect(container.textContent).toMatch(/available commands/);
  expect(container.textContent).toMatch(/about/);
  expect(container.textContent).toMatch(/desktop/);
});

test('ls lists portfolio root contents', () => {
  const { container } = render(<Terminal />);
  typeAndEnter(container, 'ls');
  expect(container.textContent).toMatch(/about\.md/);
  expect(container.textContent).toMatch(/projects\//);
  expect(container.textContent).toMatch(/experience\//);
});

test('about alias prints about.md content', () => {
  const { container } = render(<Terminal />);
  typeAndEnter(container, 'about');
  expect(container.textContent).toMatch(/About/);
});

test('cd projects updates prompt path', () => {
  const { container } = render(<Terminal />);
  typeAndEnter(container, 'cd projects');
  expect(container.textContent).toMatch(/~\/portfolio\/projects/);
});

test('unknown command prints not-found error', () => {
  const { container } = render(<Terminal />);
  typeAndEnter(container, 'foobar');
  expect(container.textContent).toMatch(/foobar: command not found/);
});

test('desktop command invokes onModeChange("desktop")', () => {
  const onModeChange = jest.fn();
  const { container } = render(<Terminal onModeChange={onModeChange} />);
  typeAndEnter(container, 'desktop');
  expect(onModeChange).toHaveBeenCalledWith('desktop');
});

test('terminal command invokes onModeChange("terminal")', () => {
  const onModeChange = jest.fn();
  const { container } = render(<Terminal onModeChange={onModeChange} />);
  typeAndEnter(container, 'terminal');
  expect(onModeChange).toHaveBeenCalledWith('terminal');
});

test('cat on a markdown file calls onFileOpen', () => {
  const onFileOpen = jest.fn();
  const { container } = render(<Terminal onFileOpen={onFileOpen} />);
  typeAndEnter(container, 'cat about.md');
  expect(onFileOpen).toHaveBeenCalledWith(
    expect.stringContaining('about.md'),
    expect.any(String)
  );
});

test('resume command calls onResumeOpen', () => {
  const onResumeOpen = jest.fn();
  const { container } = render(<Terminal onResumeOpen={onResumeOpen} />);
  typeAndEnter(container, 'resume');
  expect(onResumeOpen).toHaveBeenCalled();
});

test('clear empties the output', () => {
  const { container } = render(<Terminal />);
  typeAndEnter(container, 'help');
  expect(container.textContent).toMatch(/available commands/);
  typeAndEnter(container, 'clear');
  expect(container.textContent).not.toMatch(/available commands/);
});

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
