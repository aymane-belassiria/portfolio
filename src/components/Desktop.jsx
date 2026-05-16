import React, { useState, useEffect, useRef } from 'react';
import Window from './Window';
import Terminal from './Terminal';
import PDFViewer from './PDFViewer';
import FileExplorer from './FileExplorer';
import FileViewer from './FileViewer';
import ProjectCards from './ProjectCards';
import { initializeFilesystem, getFileContent, getNode, HOME_PATH } from '../utils/filesystem';
import {
  createWindow,
  updateWindowPosition,
  updateWindowSize,
  toggleMinimize,
  bringToFront,
} from '../utils/windowManager';
import '../styles/desktop.css';

const buildWindow = (overrides) => ({ ...createWindow(overrides.id, overrides.title, overrides.type, null), ...overrides });

const Desktop = ({ onModeChange }) => {
  const filesystemRef = useRef(initializeFilesystem());
  const [windows, setWindows] = useState(() => [
    buildWindow({
      id: 'resume-initial',
      title: 'resume.pdf',
      type: 'resume',
      x: 360,
      y: 40,
      width: 720,
      height: 560,
      zIndex: 2,
    }),
  ]);
  const [draggingWindow, setDraggingWindow] = useState(null);
  const [resizingWindow, setResizingWindow] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!draggingWindow) return;
    const handleMouseMove = (e) => {
      setWindows((prev) =>
        prev.map((w) =>
          w.id === draggingWindow
            ? updateWindowPosition(w, e.clientX - dragOffset.x, e.clientY - dragOffset.y)
            : w
        )
      );
    };
    const handleMouseUp = () => setDraggingWindow(null);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggingWindow, dragOffset]);

  useEffect(() => {
    if (!resizingWindow) return;
    const handleMouseMove = (e) => {
      setWindows((prev) =>
        prev.map((w) =>
          w.id === resizingWindow
            ? updateWindowSize(
                w,
                Math.max(300, e.clientX - w.x),
                Math.max(200, e.clientY - w.y)
              )
            : w
        )
      );
    };
    const handleMouseUp = () => setResizingWindow(null);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [resizingWindow]);

  const handleDragStart = (windowId, clientX, clientY) => {
    const win = windows.find((w) => w.id === windowId);
    if (!win) return;
    setDraggingWindow(windowId);
    setDragOffset({ x: clientX - win.x, y: clientY - win.y });
    const maxZ = Math.max(...windows.map((w) => w.zIndex));
    setWindows((prev) =>
      prev.map((w) => (w.id === windowId ? bringToFront(w, maxZ) : w))
    );
  };

  const handleResizeStart = (windowId) => {
    setResizingWindow(windowId);
    const maxZ = Math.max(...windows.map((w) => w.zIndex));
    setWindows((prev) =>
      prev.map((w) => (w.id === windowId ? bringToFront(w, maxZ) : w))
    );
  };

  const handleMinimize = (windowId) => {
    setWindows((prev) =>
      prev.map((w) => (w.id === windowId ? toggleMinimize(w) : w))
    );
  };

  const handleClose = (windowId) => {
    setWindows((prev) => prev.filter((w) => w.id !== windowId));
  };

  const focusWindow = (windowId) => {
    const maxZ = Math.max(...windows.map((w) => w.zIndex), 0);
    setWindows((prev) =>
      prev.map((w) =>
        w.id === windowId
          ? { ...bringToFront(w, maxZ), minimized: false }
          : w
      )
    );
  };

  const openWindow = (overrides) => {
    const id = overrides.id || `win-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setWindows((prev) => {
      const existing = prev.find((w) => w.id === id);
      if (existing) {
        const maxZ = Math.max(...prev.map((w) => w.zIndex), 0);
        return prev.map((w) =>
          w.id === id ? { ...bringToFront(w, maxZ), minimized: false } : w
        );
      }
      const offset = (prev.length % 6) * 24;
      const maxZ = Math.max(...prev.map((w) => w.zIndex), 0);
      return [
        ...prev,
        buildWindow({
          id,
          x: 80 + offset,
          y: 60 + offset,
          width: 600,
          height: 420,
          zIndex: maxZ + 1,
          ...overrides,
        }),
      ];
    });
  };

  const openTerminal = () =>
    openWindow({ title: 'Terminal', type: 'terminal' });

  const openResume = () =>
    openWindow({
      id: 'resume',
      title: 'resume.pdf',
      type: 'resume',
      width: 720,
      height: 560,
    });

  const openExplorer = (rootPath = HOME_PATH) =>
    openWindow({
      title: `Files — ${rootPath.replace(HOME_PATH, '~/portfolio')}`,
      type: 'explorer',
      rootPath,
      width: 480,
      height: 380,
    });

  const openFile = (filePath, contentArg) => {
    const node = getNode(filesystemRef.current, filePath);
    if (!node) return;
    if (node.kind === 'pdf') {
      openResume();
      return;
    }
    const content = contentArg ?? getFileContent(filesystemRef.current, filePath);
    if (typeof content !== 'string') return;
    const fileName = filePath.split('/').pop();
    openWindow({
      title: fileName,
      type: 'file',
      filePath,
      fileContent: content,
      fileKind: node.kind,
      width: 640,
      height: 480,
    });
  };

  const openProjectsGrid = () =>
    openWindow({
      id: 'projects-grid',
      title: 'Project Gallery',
      type: 'grid',
      width: 820,
      height: 560,
    });

  const handleModeBack = () => onModeChange && onModeChange('terminal');

  const icons = [
    { id: 'icon-resume', label: 'Resume', emoji: '📄', onOpen: openResume },
    {
      id: 'icon-experience',
      label: 'Experience',
      emoji: '📁',
      onOpen: () => openExplorer(`${HOME_PATH}/experience`),
    },
    {
      id: 'icon-projects',
      label: 'Projects',
      emoji: '📁',
      onOpen: () => openExplorer(`${HOME_PATH}/projects`),
    },
    {
      id: 'icon-about',
      label: 'About',
      emoji: '📄',
      onOpen: () => openFile(`${HOME_PATH}/about.md`),
    },
    {
      id: 'icon-skills',
      label: 'Skills',
      emoji: '📄',
      onOpen: () => openFile(`${HOME_PATH}/skills.md`),
    },
    {
      id: 'icon-contact',
      label: 'Contact',
      emoji: '📄',
      onOpen: () => openFile(`${HOME_PATH}/contact.md`),
    },
    { id: 'icon-terminal', label: 'Terminal', emoji: '💻', onOpen: openTerminal },
  ];

  return (
    <div className="desktop">
      <div className="desktop-header">
        <div className="desktop-menu">
          <button className="menu-btn" onClick={() => openExplorer(HOME_PATH)}>
            Files
          </button>
          <button className="menu-btn" onClick={openTerminal}>
            New Terminal
          </button>
          <button className="menu-btn" onClick={openResume}>
            Resume
          </button>
          <button className="menu-btn menu-btn-accent" onClick={handleModeBack}>
            Back to Terminal
          </button>
        </div>
      </div>

      <div className="desktop-area">
        <div className="desktop-icons">
          {icons.map((icon) => (
            <DesktopIcon key={icon.id} icon={icon} />
          ))}
        </div>

        {windows.map((win) => (
          <Window
            key={win.id}
            id={win.id}
            title={win.title}
            x={win.x}
            y={win.y}
            width={win.width}
            height={win.height}
            zIndex={win.zIndex}
            minimized={win.minimized}
            onDragStart={handleDragStart}
            onResizeStart={handleResizeStart}
            onMinimize={handleMinimize}
            onClose={handleClose}
            onFocus={focusWindow}
          >
            {win.type === 'terminal' && (
              <Terminal
                variant="desktop"
                onFileOpen={openFile}
                onResumeOpen={openResume}
                onProjectsGrid={openProjectsGrid}
                onModeChange={onModeChange}
              />
            )}
            {win.type === 'resume' && <PDFViewer />}
            {win.type === 'file' && (
              <FileViewer
                filePath={win.filePath}
                content={win.fileContent}
                kind={win.fileKind}
              />
            )}
            {win.type === 'explorer' && (
              <FileExplorer
                rootPath={win.rootPath || HOME_PATH}
                onFileOpen={openFile}
              />
            )}
            {win.type === 'grid' && <ProjectCards />}
          </Window>
        ))}
      </div>

      <div className="taskbar">
        {windows.map((win) => (
          <button
            key={win.id}
            className={`taskbar-item ${win.minimized ? 'minimized' : ''}`}
            onClick={() => focusWindow(win.id)}
          >
            {win.title}
          </button>
        ))}
      </div>
    </div>
  );
};

const DesktopIcon = ({ icon }) => {
  const clickTimer = useRef(null);
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  const handleClick = () => {
    if (isMobile) {
      icon.onOpen();
      return;
    }
    // On desktop, first click arms the timer; second click within 350ms opens.
    if (clickTimer.current) {
      clearTimeout(clickTimer.current);
      clickTimer.current = null;
      icon.onOpen();
    } else {
      clickTimer.current = setTimeout(() => {
        clickTimer.current = null;
        // single click — no action for icons
      }, 350);
    }
  };

  return (
    <button
      className="desktop-icon"
      onClick={handleClick}
      title={`Double-click to open ${icon.label}`}
    >
      <span className="desktop-icon-emoji">{icon.emoji}</span>
      <span className="desktop-icon-label">{icon.label}</span>
    </button>
  );
};

export default Desktop;
