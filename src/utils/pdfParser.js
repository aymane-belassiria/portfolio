import * as pdfjsLib from 'pdfjs-dist';
import { defaultResumeData } from '../data/mockData';

// Set up the worker from CDN
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

/**
 * Main function to extract resume data from PDF
 * @param {string} filePath - Path to the PDF file
 * @returns {Promise<Object>} - Extracted resume data with experience, skills, and contact
 */
export async function extractResumeFromPDF(filePath) {
  try {
    // Handle both absolute and relative paths
    let pdfPath = filePath;
    if (!pdfPath.startsWith('/')) {
      pdfPath = `/${pdfPath}`;
    }

    // Load the PDF
    const pdf = await pdfjsLib.getDocument(pdfPath).promise;

    // Extract text from all pages
    let fullText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item) => item.str)
        .join(' ');
      fullText += pageText + '\n';
    }

    // Parse the extracted text
    const resumeData = parseResumeText(fullText);
    return resumeData;
  } catch (error) {
    console.warn('Error parsing PDF, falling back to default data:', error.message);
    return defaultResumeData;
  }
}

/**
 * Parse resume text and extract structured data
 * @param {string} text - Raw text from PDF
 * @returns {Object} - Structured resume data
 */
export function parseResumeText(text) {
  return {
    contact: {
      name: extractName(text),
      email: extractEmail(text),
      phone: extractPhone(text),
      location: extractLocation(text)
    },
    experience: extractExperience(text),
    skills: extractSkills(text),
    education: extractEducation(text)
  };
}

/**
 * Extract name from text (usually at the beginning)
 * @param {string} text - Resume text
 * @returns {string} - Extracted name or default
 */
export function extractName(text) {
  // Simple heuristic: first line with multiple capital letters
  const lines = text.split('\n').slice(0, 5);
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed && /^[A-Z][a-z]+\s+[A-Z][a-z]+/.test(trimmed)) {
      return trimmed;
    }
  }
  return defaultResumeData.contact.name;
}

/**
 * Extract email address from text
 * @param {string} text - Resume text
 * @returns {string} - Extracted email or default
 */
export function extractEmail(text) {
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
  const match = text.match(emailRegex);
  return match ? match[0] : defaultResumeData.contact.email;
}

/**
 * Extract phone number from text
 * @param {string} text - Resume text
 * @returns {string} - Extracted phone or default
 */
export function extractPhone(text) {
  // Match various phone formats
  const phoneRegex = /(?:\+\d{1,3}[-.\s]?)?\(?(\d{3})\)?[-.\s]?(\d{3})[-.\s]?(\d{4})/;
  const match = text.match(phoneRegex);
  if (match) {
    // Return the matched phone in a normalized format
    return match[0];
  }
  return defaultResumeData.contact.phone;
}

/**
 * Extract location from text
 * @param {string} text - Resume text
 * @returns {string} - Extracted location or default
 */
export function extractLocation(text) {
  // Look for city, state or city, country patterns
  const locationRegex = /(?:Location|Based in|From|Address)?:?\s*([A-Z][a-z]+),\s*([A-Z]{2}|[A-Z][a-z]+)/;
  const match = text.match(locationRegex);
  if (match) {
    return `${match[1]}, ${match[2]}`;
  }
  return defaultResumeData.contact.location;
}

/**
 * Extract work experience from text
 * @param {string} text - Resume text
 * @returns {Array} - Array of experience objects
 */
export function extractExperience(text) {
  const experiences = [];

  // Common patterns for experience sections
  const experienceSection = text.match(
    /(?:Experience|Work Experience|Professional Experience)([\s\S]*?)(?:Education|Skills|$)/i
  );

  if (!experienceSection) {
    return defaultResumeData.experience;
  }

  const expText = experienceSection[1];

  // Look for job entries - simple heuristic: uppercase company names followed by titles
  const jobRegex = /([A-Z][A-Za-z\s&,]*?)\s*\n\s*([A-Z][A-Za-z\s,]*?)\s*\n\s*([\d\s\-]*(?:20\d{2}|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[^\n]*)/gmi;

  let match;
  while ((match = jobRegex.exec(expText)) !== null) {
    experiences.push({
      title: match[2].trim(),
      company: match[1].trim(),
      duration: match[3].trim(),
      description: ''
    });
  }

  return experiences.length > 0 ? experiences : defaultResumeData.experience;
}

/**
 * Extract skills from text
 * @param {string} text - Resume text
 * @returns {Array} - Array of skill strings
 */
export function extractSkills(text) {
  const skills = [];

  // Look for skills section
  const skillsSection = text.match(
    /(?:Skills|Technical Skills|Core Competencies)([\s\S]*?)(?:Experience|Education|$)/i
  );

  if (!skillsSection) {
    return defaultResumeData.skills;
  }

  const skillsText = skillsSection[1];

  // Split by common delimiters and clean up
  const skillList = skillsText
    .split(/[,•\n|–-]/)
    .map((skill) => skill.trim())
    .filter((skill) => skill.length > 0 && skill.length < 50);

  // Filter out common noise words
  const noiseWords = ['and', 'with', 'the', 'of', 'a', 'an', 'to', 'for'];
  const filteredSkills = skillList.filter(
    (skill) => !noiseWords.includes(skill.toLowerCase()) && skill.length > 2
  );

  return filteredSkills.length > 0 ? filteredSkills : defaultResumeData.skills;
}

/**
 * Extract education from text
 * @param {string} text - Resume text
 * @returns {Array} - Array of education objects
 */
export function extractEducation(text) {
  const education = [];

  // Look for education section
  const eduSection = text.match(/(?:Education)([\s\S]*?)(?:Experience|Skills|$)/i);

  if (!eduSection) {
    return defaultResumeData.education;
  }

  const eduText = eduSection[1];

  // Look for degree patterns
  const degreeRegex = /(Bachelor|Master|PhD|B\.S\.|M\.S\.|B\.A\.|M\.A\.|Associate)[^\n]*\n\s*([^\n]*)/gi;

  let match;
  while ((match = degreeRegex.exec(eduText)) !== null) {
    education.push({
      degree: match[1].trim(),
      field: match[2].trim(),
      school: '',
      year: ''
    });
  }

  return education.length > 0 ? education : defaultResumeData.education;
}
