import React, { useState, useEffect } from 'react';
import { initializeFilesystem, navigateFS, listDirectory, getFileContent } from '../utils/filesystem';
import '../styles/fileexplorer.css';

const FileExplorer = ({ onFileOpen }) => {
  const [fs] = useState(initializeFilesystem());
  const [currentPath, setCurrentPath] = useState('/');
  const [expandedDirs, setExpandedDirs] = useState(new Set());
  const [items, setItems] = useState([]);

  // Load items when current path changes
  useEffect(() => {
    const dirItems = listDirectory(fs, currentPath);
    setItems(dirItems.sort((a, b) => {
      // Folders first, then files
      if (a.type === 'dir' && b.type === 'file') return -1;
      if (a.type === 'file' && b.type === 'dir') return 1;
      return a.name.localeCompare(b.name);
    }));
  }, [fs, currentPath]);

  const handleNavigate = (targetPath) => {
    const newPath = navigateFS(fs, currentPath, targetPath);
    setCurrentPath(newPath);
  };

  const handleItemClick = (item) => {
    if (item.type === 'dir') {
      // Navigate to folder
      handleNavigate(item.name);
    } else {
      // Open file
      const filePath = currentPath === '/' ? `/${item.name}` : `${currentPath}/${item.name}`;
      const content = getFileContent(fs, filePath);
      if (onFileOpen) {
        onFileOpen(filePath, content);
      }
    }
  };

  const handleParentNav = () => {
    handleNavigate('..');
  };

  return (
    <div className="file-explorer">
      <div className="explorer-header">
        <button className="up-button" onClick={handleParentNav} title="Go to parent directory">
          ↑
        </button>
        <span className="current-path">{currentPath}</span>
      </div>
      <div className="file-list">
        {items.length === 0 ? (
          <div className="empty-directory">Empty directory</div>
        ) : (
          items.map((item, index) => (
            <div
              key={index}
              className={`file-item ${item.type}`}
              onClick={() => handleItemClick(item)}
            >
              <span className="item-icon">
                {item.type === 'dir' ? '📁' : '📄'}
              </span>
              <span className="item-name">{item.name}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default FileExplorer;
