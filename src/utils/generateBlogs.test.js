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
