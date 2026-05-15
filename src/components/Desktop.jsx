/**
 * Desktop Component
 * Main desktop environment with window management
 */

import React, { useState, useEffect } from 'react';
import Window from './Window';
import Terminal from './Terminal';
import PDFViewer from './PDFViewer';
import {
  createWindow,
  updateWindowPosition,
  updateWindowSize,
  toggleMinimize,
  bringToFront,
} from '../utils/windowManager';
import '../styles/desktop.css';

const Desktop = ({ onFileOpen }) => {
  const [windows, setWindows] = useState([
    createWindow('terminal-1', 'Terminal', 'terminal', null),
  ]);
  const [draggingWindow, setDraggingWindow] = useState(null);
  const [resizingWindow, setResizingWindow] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Handle window drag
  useEffect(() => {
    if (!draggingWindow) return;

    const handleMouseMove = (e) => {
      setWindows((prevWindows) =>
        prevWindows.map((w) => {
          if (w.id === draggingWindow) {
            const newX = e.clientX - dragOffset.x;
            const newY = e.clientY - dragOffset.y;
            return updateWindowPosition(w, newX, newY);
          }
          return w;
        })
      );
    };

    const handleMouseUp = () => {
      setDraggingWindow(null);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggingWindow, dragOffset]);

  // Handle window resize
  useEffect(() => {
    if (!resizingWindow) return;

    const handleMouseMove = (e) => {
      setWindows((prevWindows) =>
        prevWindows.map((w) => {
          if (w.id === resizingWindow) {
            const newWidth = Math.max(300, e.clientX - w.x);
            const newHeight = Math.max(200, e.clientY - w.y);
            return updateWindowSize(w, newWidth, newHeight);
          }
          return w;
        })
      );
    };

    const handleMouseUp = () => {
      setResizingWindow(null);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [resizingWindow]);

  // Handle drag start
  const handleDragStart = (windowId, clientX, clientY) => {
    const window = windows.find((w) => w.id === windowId);
    if (!window) return;

    setDraggingWindow(windowId);
    setDragOffset({
      x: clientX - window.x,
      y: clientY - window.y,
    });

    // Bring window to front
    const maxZ = Math.max(...windows.map((w) => w.zIndex));
    setWindows((prevWindows) =>
      prevWindows.map((w) =>
        w.id === windowId ? bringToFront(w, maxZ) : w
      )
    );
  };

  // Handle resize start
  const handleResizeStart = (windowId, clientX, clientY) => {
    setResizingWindow(windowId);

    // Bring window to front
    const maxZ = Math.max(...windows.map((w) => w.zIndex));
    setWindows((prevWindows) =>
      prevWindows.map((w) =>
        w.id === windowId ? bringToFront(w, maxZ) : w
      )
    );
  };

  // Handle minimize
  const handleMinimize = (windowId) => {
    setWindows((prevWindows) =>
      prevWindows.map((w) =>
        w.id === windowId ? toggleMinimize(w) : w
      )
    );
  };

  // Handle close
  const handleClose = (windowId) => {
    setWindows((prevWindows) => prevWindows.filter((w) => w.id !== windowId));
  };

  // Handle opening new windows
  const handleNewTerminal = () => {
    const newId = `terminal-${Date.now()}`;
    const newWindow = createWindow(newId, 'Terminal', 'terminal', null);
    setWindows([...windows, newWindow]);
  };

  const handleNewFiles = () => {
    const newId = `files-${Date.now()}`;
    const newWindow = createWindow(newId, 'Files', 'files', null);
    setWindows([...windows, newWindow]);
  };

  const handleNewResume = () => {
    const newId = `resume-${Date.now()}`;
    const newWindow = createWindow(newId, 'Resume', 'resume', null);
    setWindows([...windows, newWindow]);
  };

  return (
    <div className="desktop">
      {/* Header/Menu Bar */}
      <div className="desktop-header">
        <div className="desktop-menu">
          <button className="menu-btn" onClick={handleNewTerminal}>
            New Terminal
          </button>
          <button className="menu-btn" onClick={handleNewFiles}>
            Files
          </button>
          <button className="menu-btn" onClick={handleNewResume}>
            Resume
          </button>
        </div>
      </div>

      {/* Desktop Area */}
      <div className="desktop-area">
        {/* Render all windows */}
        {windows.map((window) => (
          <Window
            key={window.id}
            id={window.id}
            title={window.title}
            x={window.x}
            y={window.y}
            width={window.width}
            height={window.height}
            zIndex={window.zIndex}
            minimized={window.minimized}
            onDragStart={handleDragStart}
            onResizeStart={handleResizeStart}
            onMinimize={handleMinimize}
            onClose={handleClose}
          >
            {window.type === 'terminal' && (
              <Terminal onFileOpen={onFileOpen} />
            )}
            {window.type === 'files' && (
              <div className="window-placeholder">Files Browser</div>
            )}
            {window.type === 'resume' && (
              <PDFViewer />
            )}
          </Window>
        ))}
      </div>

      {/* Taskbar */}
      <div className="taskbar">
        {windows.map((window) => (
          <button
            key={window.id}
            className={`taskbar-item ${window.minimized ? 'minimized' : ''}`}
            onClick={() => {
              if (window.minimized) {
                handleMinimize(window.id);
              }
            }}
          >
            {window.title}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Desktop;
