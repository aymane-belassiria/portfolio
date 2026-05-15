/**
 * ProjectCards Component
 * Displays a grid of GitHub projects with mock data
 */

import React from 'react';
import '../styles/projects.css';

const ProjectCards = () => {
  const projects = [
    {
      name: 'Terminal Portfolio',
      description: 'Interactive terminal-based portfolio with desktop environment mode',
      language: 'React',
      url: 'https://github.com/aymane-code/portfolio'
    },
    {
      name: 'Weather App',
      description: 'Real-time weather application with multiple location support',
      language: 'JavaScript',
      url: 'https://github.com/aymane-code/weather-app'
    },
    {
      name: 'Task Manager',
      description: 'Full-stack task management application with user authentication',
      language: 'MERN',
      url: 'https://github.com/aymane-code/task-manager'
    },
    {
      name: 'Blog Platform',
      description: 'Content management system with markdown support and comments',
      language: 'Node.js',
      url: 'https://github.com/aymane-code/blog-platform'
    },
    {
      name: 'E-commerce Store',
      description: 'Full-featured online store with shopping cart and payment integration',
      language: 'React',
      url: 'https://github.com/aymane-code/ecommerce-store'
    },
    {
      name: 'Code Editor',
      description: 'Lightweight web-based code editor with syntax highlighting',
      language: 'JavaScript',
      url: 'https://github.com/aymane-code/code-editor'
    }
  ];

  return (
    <div className="projects-container">
      <h2 className="projects-title">GitHub Projects</h2>
      <div className="projects-grid">
        {projects.map((project, index) => (
          <div key={index} className="project-card">
            <h3 className="project-name">{project.name}</h3>
            <p className="project-description">{project.description}</p>
            <div className="project-footer">
              <span className="language-tag">{project.language}</span>
              <a href={project.url} target="_blank" rel="noopener noreferrer" className="project-link">
                View
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectCards;
