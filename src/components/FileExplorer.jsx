import React, { useState, useEffect, useMemo } from 'react';
import {
  initializeFilesystem,
  navigateFS,
  listDirectory,
  getFileContent,
  HOME_PATH,
  prettyPath,
} from '../utils/filesystem';
import '../styles/fileexplorer.css';

const FileExplorer = ({ onFileOpen, rootPath = HOME_PATH }) => {
  const fs = useMemo(() => initializeFilesystem(), []);
  const [currentPath, setCurrentPath] = useState(rootPath);
  const [items, setItems] = useState([]);

  useEffect(() => {
    const dirItems = listDirectory(fs, currentPath);
    setItems(
      dirItems.sort((a, b) => {
        if (a.type !== b.type) return a.type === 'dir' ? -1 : 1;
        return a.name.localeCompare(b.name);
      })
    );
  }, [fs, currentPath]);

  const isAtRoot = currentPath === rootPath;

  const handleNavigate = (targetPath) => {
    const next = navigateFS(fs, currentPath, targetPath, rootPath);
    setCurrentPath(next);
  };

  const handleItemClick = (item) => {
    if (item.type === 'dir') {
      handleNavigate(item.name);
      return;
    }
    const filePath =
      currentPath === '/' ? `/${item.name}` : `${currentPath}/${item.name}`;
    const content = getFileContent(fs, filePath);
    if (onFileOpen) {
      onFileOpen(filePath, content);
    }
  };

  const iconFor = (item) => {
    if (item.type === 'dir') return '📁';
    if (item.kind === 'pdf') return '📕';
    if (item.kind === 'blog') return '📰';
    if (item.kind === 'project') return '🛠️';
    if (item.kind === 'experience') return '💼';
    if (item.kind === 'education') return '🎓';
    if (item.kind === 'about' || item.kind === 'skills' || item.kind === 'contact')
      return '📝';
    return '📄';
  };

  return (
    <div className="file-explorer">
      <div className="explorer-header">
        <button
          className="up-button"
          onClick={() => handleNavigate('..')}
          disabled={isAtRoot}
          title="Go to parent directory"
        >
          ↑
        </button>
        <span className="current-path">{prettyPath(currentPath)}</span>
      </div>
      <div className="file-list">
        {items.length === 0 ? (
          <div className="empty-directory">Empty directory</div>
        ) : (
          items.map((item, index) => (
            <button
              key={index}
              className={`file-item ${item.type}`}
              onClick={() => handleItemClick(item)}
              type="button"
            >
              <span className="item-icon">{iconFor(item)}</span>
              <span className="item-name">{item.name}</span>
            </button>
          ))
        )}
      </div>
    </div>
  );
};

export default FileExplorer;
