import React from 'react';
import Terminal from './Terminal';
import '../styles/terminal-view.css';

// Full-screen, header-less wrapper around the Terminal for the standalone
// "boot into terminal" mode. The Terminal handles all commands and emits
// `onModeChange('desktop')` when the user wants to enter the desktop view.

const TerminalView = ({ onModeChange }) => {
  return (
    <div className="terminal-view">
      <Terminal
        variant="fullscreen"
        showBanner
        initialMessage={`Welcome to my portfolio. Type \`help\` to see all commands, or \`desktop\` to switch to the desktop view.`}
        onModeChange={onModeChange}
      />
    </div>
  );
};

export default TerminalView;
