import { render, screen, fireEvent } from '@testing-library/react';
import Terminal from './Terminal';

test('Terminal renders with home directory prompt', () => {
  render(<Terminal />);
  expect(screen.getByText(/\$\s*$/)).toBeInTheDocument();
});

test('Terminal executes ls command and displays contents', async () => {
  const { container } = render(<Terminal />);
  const input = container.querySelector('input[type="text"]');

  fireEvent.change(input, { target: { value: 'ls' } });
  fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

  expect(screen.getByText(/home/i)).toBeInTheDocument();
});

test('Terminal executes cd command and updates path', async () => {
  const { container } = render(<Terminal />);
  const input = container.querySelector('input[type="text"]');

  fireEvent.change(input, { target: { value: 'cd home' } });
  fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

  expect(screen.getByText(/\/home\s*\$\s*$/)).toBeInTheDocument();
});
