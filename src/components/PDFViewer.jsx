import React, { useState, useEffect } from 'react';
import { extractResumeFromPDF } from '../utils/pdfParser';
import '../styles/pdfviewer.css';

export default function PDFViewer() {
  const [resumeData, setResumeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [view, setView] = useState('overview'); // overview, experience, skills, contact

  useEffect(() => {
    const loadResume = async () => {
      try {
        // PDF should be in public folder
        const data = await extractResumeFromPDF('/aymane belassiria.pdf');
        setResumeData(data);
      } catch (err) {
        console.error('Error loading resume:', err);
        setError('Failed to load resume PDF');
      } finally {
        setLoading(false);
      }
    };

    loadResume();
  }, []);

  if (loading) {
    return <div className="pdf-viewer"><div className="loading">Loading resume...</div></div>;
  }

  if (error || !resumeData) {
    return <div className="pdf-viewer"><div className="error">{error || 'No resume data'}</div></div>;
  }

  return (
    <div className="pdf-viewer">
      <div className="pdf-tabs">
        <button
          className={`tab ${view === 'overview' ? 'active' : ''}`}
          onClick={() => setView('overview')}
        >
          Overview
        </button>
        <button
          className={`tab ${view === 'experience' ? 'active' : ''}`}
          onClick={() => setView('experience')}
        >
          Experience
        </button>
        <button
          className={`tab ${view === 'skills' ? 'active' : ''}`}
          onClick={() => setView('skills')}
        >
          Skills
        </button>
        <button
          className={`tab ${view === 'contact' ? 'active' : ''}`}
          onClick={() => setView('contact')}
        >
          Contact
        </button>
      </div>

      <div className="pdf-content">
        {view === 'overview' && (
          <div className="pdf-section">
            <h1>{resumeData.contact.name}</h1>
            <p className="intro">Full-stack developer portfolio</p>
          </div>
        )}

        {view === 'experience' && (
          <div className="pdf-section">
            <h2>Experience</h2>
            {(resumeData.experience || []).map((exp, idx) => (
              <div key={idx} className="experience-item">
                <h3>{exp.title}</h3>
                <p className="company">{exp.company} · {exp.duration}</p>
                {exp.description && <p>{exp.description}</p>}
              </div>
            ))}
          </div>
        )}

        {view === 'skills' && (
          <div className="pdf-section">
            <h2>Skills</h2>
            <div className="skills-list">
              {(resumeData.skills || []).map((skill, idx) => (
                <span key={idx} className="skill-tag">{skill}</span>
              ))}
            </div>
          </div>
        )}

        {view === 'contact' && (
          <div className="pdf-section">
            <h2>Contact</h2>
            <p><strong>Name:</strong> {resumeData.contact?.name}</p>
            {resumeData.contact?.email && (
              <p><strong>Email:</strong> <a href={`mailto:${resumeData.contact.email}`}>{resumeData.contact.email}</a></p>
            )}
            {resumeData.contact?.phone && (
              <p><strong>Phone:</strong> {resumeData.contact.phone}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
