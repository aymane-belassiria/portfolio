/**
 * Window Component
 * Draggable and resizable window with title bar controls
 */

import React from 'react';
import '../styles/windows.css';

const Window = ({
  id,
  title,
  x,
  y,
  width,
  height,
  zIndex,
  minimized,
  onDragStart,
  onResizeStart,
  onMinimize,
  onClose,
  children,
}) => {
  return (
    <div
      className={`window ${minimized ? 'minimized' : ''}`}
      style={{
        left: `${x}px`,
        top: `${y}px`,
        width: `${width}px`,
        height: `${height}px`,
        zIndex,
      }}
      onClick={() => onDragStart && onDragStart(id, 0, 0)}
    >
      {/* Title Bar */}
      <div
        className="window-title-bar"
        onMouseDown={(e) => {
          if (onDragStart) {
            onDragStart(id, e.clientX, e.clientY);
          }
        }}
      >
        <span className="window-title">{title}</span>
        <div className="window-controls">
          <button
            className="window-btn minimize-btn"
            onClick={(e) => {
              e.stopPropagation();
              onMinimize(id);
            }}
            title="Minimize"
          >
            −
          </button>
          <button
            className="window-btn close-btn"
            onClick={(e) => {
              e.stopPropagation();
              onClose(id);
            }}
            title="Close"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Window Content */}
      <div className="window-content">
        {children}
      </div>

      {/* Resize Handle */}
      <div
        className="window-resize-handle"
        onMouseDown={(e) => {
          e.stopPropagation();
          if (onResizeStart) {
            onResizeStart(id, e.clientX, e.clientY);
          }
        }}
      />
    </div>
  );
};

export default Window;
