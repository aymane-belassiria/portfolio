import React from 'react';
import { renderMarkdown } from '../utils/markdown';
import '../styles/fileviewer.css';

const KIND_LABEL = {
  experience: 'experience',
  project: 'project',
  education: 'education',
  about: 'about',
  contact: 'contact',
  skills: 'skills',
  blog: 'blog',
};

const FileViewer = ({ filePath, content, kind }) => {
  const text = content || '';
  const blocks = renderMarkdown(text);
  const label = KIND_LABEL[kind];

  return (
    <div className="file-viewer">
      <div className="file-info">
        <span className="file-path">{filePath || 'untitled'}</span>
        {label && <span className={`file-kind kind-${kind}`}>{label}</span>}
      </div>
      <div className="file-content">{blocks}</div>
    </div>
  );
};

export default FileViewer;
