import React from 'react';
import { projects } from '../data/portfolio';
import '../styles/projects.css';

const STATUS_LABEL = {
  done: 'done',
  'in-progress': 'in progress',
  discontinued: 'discontinued',
};

const ProjectCards = () => {
  return (
    <div className="projects-container">
      <h2 className="projects-title">Curated Projects</h2>
      <p className="projects-subtitle">
        {projects.length} selected from 79+ public repos. ★ = GitHub stars.
      </p>
      <div className="projects-grid">
        {projects.map((p) => (
          <div key={p.slug} className={`project-card status-${p.status}`}>
            <div className="project-card-header">
              <h3 className="project-name">{p.name}</h3>
              <span className={`project-status status-${p.status}`}>
                {STATUS_LABEL[p.status]}
              </span>
            </div>
            <p className="project-highlight">{p.highlight}</p>
            <p className="project-description">{p.description}</p>
            <div className="project-stack">
              {p.stack.map((tech) => (
                <span key={tech} className="stack-tag">
                  {tech}
                </span>
              ))}
            </div>
            <div className="project-footer">
              <span className="project-stars">★ {p.stars}</span>
              {p.repo ? (
                <a
                  href={p.repo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="project-link"
                >
                  View on GitHub
                </a>
              ) : (
                <span className="project-link disabled" title="Internal — not public">
                  Internal
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectCards;
