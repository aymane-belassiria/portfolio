import React, { useState, useEffect } from 'react';
import '../styles/fileviewer.css';

const FileViewer = ({ filePath, content }) => {
  const [displayedContent, setDisplayedContent] = useState(content || '');

  useEffect(() => {
    if (content !== undefined) {
      setDisplayedContent(content);
    }
  }, [filePath, content]);

  return (
    <div className="file-viewer">
      <div className="file-info">
        <span className="file-path">{filePath || 'untitled'}</span>
      </div>
      <pre className="file-content">{displayedContent}</pre>
    </div>
  );
};

export default FileViewer;
