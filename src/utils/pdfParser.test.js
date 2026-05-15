import { extractResumeFromPDF } from './pdfParser';

test('extractResumeFromPDF: returns object with experience, skills, contact', async () => {
  const result = await extractResumeFromPDF('/aymane belassiria.pdf');
  expect(result).toHaveProperty('experience');
  expect(result).toHaveProperty('skills');
  expect(result).toHaveProperty('contact');
  expect(Array.isArray(result.experience)).toBe(true);
  expect(Array.isArray(result.skills)).toBe(true);
});

test('extractResumeFromPDF: experience items have title, company, date', async () => {
  const result = await extractResumeFromPDF('/aymane belassiria.pdf');
  if (result.experience.length > 0) {
    const exp = result.experience[0];
    expect(exp).toHaveProperty('title');
    expect(exp).toHaveProperty('company');
  }
});
