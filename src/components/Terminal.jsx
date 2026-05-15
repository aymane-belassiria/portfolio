import React, { useState, useRef, useEffect } from 'react';
import { initializeFilesystem, navigateFS, listDirectory, getFileContent } from '../utils/filesystem';
import '../styles/terminal.css';

const Terminal = ({ onFileOpen }) => {
  const [filesystem, setFilesystem] = useState(() => initializeFilesystem());
  const [currentPath, setCurrentPath] = useState('/home/aymane');
  const [output, setOutput] = useState([]);
  const [input, setInput] = useState('');
  const [commandHistory, setCommandHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const inputRef = useRef(null);
  const outputRef = useRef(null);

  // Auto-focus input on mount and click
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output]);

  const executeCommand = (command) => {
    const trimmed = command.trim();
    if (!trimmed) return;

    // Add to history
    setCommandHistory([...commandHistory, trimmed]);
    setHistoryIndex(-1);

    // Add command to output
    const newOutput = [...output, { type: 'command', content: trimmed }];

    // Parse command
    const parts = trimmed.split(/\s+/);
    const cmd = parts[0];
    const args = parts.slice(1).join(' ');

    let result = [];

    switch (cmd) {
      case 'ls': {
        const contents = listDirectory(filesystem, currentPath);
        if (contents.length === 0) {
          result = [{ type: 'output', content: '' }];
        } else {
          const formatted = contents
            .map(item => {
              const suffix = item.type === 'dir' ? '/' : '';
              return `${item.name}${suffix}`;
            })
            .join('  ');
          result = [{ type: 'output', content: formatted }];
        }
        break;
      }

      case 'pwd': {
        result = [{ type: 'output', content: currentPath }];
        break;
      }

      case 'cd': {
        if (!args) {
          setCurrentPath('/home/aymane');
        } else {
          const newPath = navigateFS(filesystem, currentPath, args);
          setCurrentPath(newPath);
        }
        result = [{ type: 'output', content: '' }];
        break;
      }

      case 'cat': {
        if (!args) {
          result = [{ type: 'output', content: 'Usage: cat <filename>' }];
        } else {
          const filePath = args.startsWith('/') ? args : `${currentPath === '/' ? '' : currentPath}/${args}`;
          const content = getFileContent(filesystem, filePath);
          if (content === null) {
            result = [{ type: 'output', content: `cat: ${args}: No such file or directory` }];
          } else {
            result = [{ type: 'output', content: content }];
            if (onFileOpen) {
              onFileOpen(filePath, content);
            }
          }
        }
        break;
      }

      case 'clear': {
        setOutput([]);
        setInput('');
        return;
      }

      case 'help': {
        result = [
          {
            type: 'output',
            content: `Available commands:
  cd [dir]    - Change directory
  ls          - List directory contents
  pwd         - Print working directory
  cat [file]  - Display file contents
  clear       - Clear terminal
  help        - Show this help message`
          }
        ];
        break;
      }

      default: {
        result = [{ type: 'output', content: `bash: ${cmd}: command not found` }];
      }
    }

    setOutput([...newOutput, ...result]);
    setInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      executeCommand(input);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const newIndex = historyIndex + 1;
      if (newIndex < commandHistory.length) {
        setHistoryIndex(newIndex);
        setInput(commandHistory[commandHistory.length - 1 - newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setInput(commandHistory[commandHistory.length - 1 - newIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInput('');
      }
    }
  };

  return (
    <div className="terminal" onClick={() => inputRef.current?.focus()}>
      <div className="terminal-header">
        <span className="terminal-title">Terminal</span>
        <div className="terminal-buttons">
          <span className="terminal-button minimize">-</span>
          <span className="terminal-button maximize">□</span>
          <span className="terminal-button close">×</span>
        </div>
      </div>
      <div className="terminal-output" ref={outputRef}>
        {output.map((line, idx) => (
          <div key={idx} className={`terminal-line terminal-${line.type}`}>
            {line.type === 'command' ? (
              <>
                <span className="terminal-prompt">{currentPath}$ </span>
                <span className="terminal-command">{line.content}</span>
              </>
            ) : (
              <span>{line.content}</span>
            )}
          </div>
        ))}
        <div className="terminal-line terminal-prompt">
          {currentPath}$ 
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="terminal-input"
            autoFocus
          />
        </div>
      </div>
    </div>
  );
};

export default Terminal;
