import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';

test('App boots into terminal view with portfolio prompt', () => {
  const { container } = render(<App />);
  expect(container.textContent).toMatch(/aymane@aymane/);
  expect(container.textContent).toMatch(/~\/portfolio/);
});
