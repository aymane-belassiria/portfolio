import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  initializeFilesystem,
  navigateFS,
  listDirectory,
  getFileContent,
  resolvePath,
  prettyPath,
  HOME_PATH,
} from '../utils/filesystem';
import { contact } from '../data/portfolio';
import '../styles/terminal.css';

const BANNER = String.raw`
     #                                         ######
    # #   #   # #    #   ##   #    # ######    #     # ###### #        ##    ####   ####  # #####    ##
   #   #   # #  ##  ##  #  #  ##   # #         #     # #      #       #  #  #      #      # #    #  #  #
  #     #   #   # ## # #    # # #  # #####     ######  #####  #      #    #  ####   ####  # #    # #    #
  #######   #   #    # ###### #  # # #         #     # #      #      ######      #      # # #####  ######
  #     #   #   #    # #    # #   ## #         #     # #      #      #    # #    # #    # # #   #  #    #
  #     #   #   #    # #    # #    # ######    ######  ###### ###### #    #  ####   ####  # #    # #    #
`;

const HELP_TEXT = `available commands:
  help                 show this help message
  about                about me
  experience           list work experience
  projects             list curated projects
  projects --grid      open the project gallery (desktop mode)
  skills               technical skills
  contact              contact info
  whoami               who is at the prompt
  github               open my GitHub profile
  linkedin             open my LinkedIn profile
  email                show contact email
  resume               open my resume PDF

  ls [path]            list directory contents
  cd [path]            change directory (no arg returns home)
  pwd                  print working directory
  cat <file>           display file contents
  clear                clear terminal

  desktop              switch to the desktop view
  terminal             switch to the standalone terminal view`;

const Terminal = ({
  onFileOpen,
  onResumeOpen,
  onProjectsGrid,
  onModeChange,
  variant = 'desktop',
  showBanner = false,
  initialMessage = null,
}) => {
  const [filesystem] = useState(() => initializeFilesystem());
  const [currentPath, setCurrentPath] = useState(HOME_PATH);
  const [output, setOutput] = useState(() => {
    const initial = [];
    if (showBanner) initial.push({ type: 'banner', content: BANNER });
    if (initialMessage) initial.push({ type: 'output', content: initialMessage });
    return initial;
  });
  const [input, setInput] = useState('');
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const inputRef = useRef(null);
  const outputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output]);

  const appendOutput = useCallback((entries) => {
    setOutput((prev) => [...prev, ...entries]);
  }, []);

  const printError = useCallback(
    (line) => appendOutput([{ type: 'error', content: line }]),
    [appendOutput]
  );
  const printLine = useCallback(
    (line) => appendOutput([{ type: 'output', content: line }]),
    [appendOutput]
  );
  const printLink = useCallback(
    (label, url) => appendOutput([{ type: 'link', content: label, url }]),
    [appendOutput]
  );

  const handleCat = useCallback(
    (target) => {
      if (!target) {
        printError('Usage: cat <file>');
        return;
      }
      const resolved = resolvePath(filesystem, currentPath, target);
      if (!resolved) {
        printError(`cat: ${target}: No such file or directory`);
        return;
      }
      const content = getFileContent(filesystem, resolved);
      if (content === null) {
        printError(`cat: ${target}: Is a directory`);
        return;
      }
      if (typeof content === 'object' && content.pdf) {
        printLine('[opening resume PDF…]');
        if (onResumeOpen) onResumeOpen();
        else printLink('Open resume.pdf', content.assetPath);
        return;
      }
      printLine(content);
      if (onFileOpen) onFileOpen(resolved, content);
    },
    [filesystem, currentPath, onFileOpen, onResumeOpen, printError, printLine, printLink]
  );

  const handleLs = useCallback(
    (target) => {
      const path = target
        ? resolvePath(filesystem, currentPath, target)
        : currentPath;
      if (!path) {
        printError(`ls: ${target}: No such file or directory`);
        return;
      }
      const items = listDirectory(filesystem, path);
      if (items.length === 0) {
        printLine('');
        return;
      }
      const sorted = [...items].sort((a, b) => {
        if (a.type !== b.type) return a.type === 'dir' ? -1 : 1;
        return a.name.localeCompare(b.name);
      });
      const formatted = sorted
        .map((item) => (item.type === 'dir' ? `${item.name}/` : item.name))
        .join('  ');
      printLine(formatted);
    },
    [filesystem, currentPath, printError, printLine]
  );

  const handleCd = useCallback(
    (target) => {
      const next = target
        ? navigateFS(filesystem, currentPath, target)
        : HOME_PATH;
      if (target && next === currentPath) {
        printError(`cd: ${target}: No such file or directory`);
        return;
      }
      setCurrentPath(next);
    },
    [filesystem, currentPath, printError]
  );

  const executeCommand = useCallback(
    (raw) => {
      const trimmed = raw.trim();
      if (!trimmed) {
        appendOutput([{ type: 'command', content: '', path: currentPath }]);
        return;
      }

      setHistory((h) => [...h, trimmed]);
      setHistoryIndex(-1);
      appendOutput([{ type: 'command', content: trimmed, path: currentPath }]);

      const [cmd, ...rest] = trimmed.split(/\s+/);
      const args = rest.join(' ');

      switch (cmd) {
        case 'help':
          printLine(HELP_TEXT);
          break;
        case 'clear':
          setOutput([]);
          break;
        case 'pwd':
          printLine(currentPath);
          break;
        case 'ls':
          handleLs(args);
          break;
        case 'cd':
          handleCd(args);
          break;
        case 'cat':
          handleCat(args);
          break;
        case 'about':
          handleCat(`${HOME_PATH}/about.md`);
          break;
        case 'skills':
          handleCat(`${HOME_PATH}/skills.md`);
          break;
        case 'contact':
          handleCat(`${HOME_PATH}/contact.md`);
          break;
        case 'experience':
          handleLs(`${HOME_PATH}/experience`);
          break;
        case 'projects': {
          if (rest[0] === '--grid') {
            if (onProjectsGrid) {
              printLine('[opening project gallery…]');
              onProjectsGrid();
            } else {
              printLine('Project gallery is available in desktop mode. Type `desktop` first.');
            }
          } else {
            handleLs(`${HOME_PATH}/projects`);
          }
          break;
        }
        case 'resume': {
          if (onResumeOpen) {
            printLine('[opening resume PDF…]');
            onResumeOpen();
          } else {
            printLink('Open resume.pdf', '/aymane belassiria.pdf');
          }
          break;
        }
        case 'whoami':
          printLine(`${contact.name} — full-stack developer`);
          break;
        case 'github':
          printLink('GitHub', contact.github);
          break;
        case 'linkedin':
          printLink('LinkedIn', contact.linkedin);
          break;
        case 'email':
          printLink(contact.email, `mailto:${contact.email}`);
          break;
        case 'desktop':
          if (onModeChange) {
            printLine('[switching to desktop view…]');
            onModeChange('desktop');
          } else {
            printLine('Already in desktop view.');
          }
          break;
        case 'terminal':
          if (onModeChange) {
            printLine('[switching to terminal view…]');
            onModeChange('terminal');
          } else {
            printLine('Already in terminal view.');
          }
          break;
        case 'echo':
          printLine(args);
          break;
        default:
          printError(`bash: ${cmd}: command not found`);
      }
    },
    [
      appendOutput,
      currentPath,
      handleCat,
      handleCd,
      handleLs,
      onModeChange,
      onProjectsGrid,
      onResumeOpen,
      printError,
      printLine,
      printLink,
    ]
  );

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      executeCommand(input);
      setInput('');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length === 0) return;
      const nextIndex = historyIndex + 1;
      if (nextIndex < history.length) {
        setHistoryIndex(nextIndex);
        setInput(history[history.length - 1 - nextIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const nextIndex = historyIndex - 1;
        setHistoryIndex(nextIndex);
        setInput(history[history.length - 1 - nextIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInput('');
      }
    }
  };

  const promptDisplay = prettyPath(currentPath);

  return (
    <div
      className={`terminal terminal-${variant}`}
      onClick={() => inputRef.current?.focus()}
    >
      {variant === 'desktop' && (
        <div className="terminal-header">
          <span className="terminal-title">Terminal</span>
          <div className="terminal-buttons">
            <span className="terminal-button minimize">-</span>
            <span className="terminal-button maximize">□</span>
            <span className="terminal-button close">×</span>
          </div>
        </div>
      )}
      <div className="terminal-output" ref={outputRef}>
        {output.map((line, idx) => {
          if (line.type === 'banner') {
            return (
              <pre key={idx} className="terminal-banner">
                {line.content}
              </pre>
            );
          }
          if (line.type === 'command') {
            return (
              <div key={idx} className="terminal-line">
                <Prompt path={line.path ? prettyPath(line.path) : promptDisplay} />
                <span className="terminal-command">{line.content}</span>
              </div>
            );
          }
          if (line.type === 'error') {
            return (
              <div key={idx} className="terminal-line">
                <pre className="terminal-error">{line.content}</pre>
              </div>
            );
          }
          if (line.type === 'link') {
            return (
              <div key={idx} className="terminal-line">
                <a
                  className="terminal-link"
                  href={line.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {line.content}
                </a>
              </div>
            );
          }
          return (
            <div key={idx} className="terminal-line">
              <pre className="terminal-text">{line.content}</pre>
            </div>
          );
        })}
        <div className="terminal-line terminal-input-row">
          <Prompt path={promptDisplay} />
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="terminal-input"
            spellCheck="false"
            autoCapitalize="off"
            autoCorrect="off"
            autoFocus
          />
        </div>
      </div>
    </div>
  );
};

const Prompt = ({ path }) => (
  <span className="terminal-prompt">
    <span className="prompt-user">aymane@aymane</span>
    <span className="prompt-sep">:</span>
    <span className="prompt-path">{path}</span>
    <span className="prompt-sep">$&nbsp;</span>
  </span>
);

export default Terminal;
