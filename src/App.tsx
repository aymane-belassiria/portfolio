import React, { useState, useContext } from 'react';
import './App.css';
import Input from './components/Input';
import { Outputs } from './components/Outputs';
import { TerminalContext } from './context/terminal.context';
import Terminal from './components/Terminal';
import Desktop from './components/Desktop';
import ProjectCards from './components/ProjectCards';

function App() {
  const [mode, setMode] = useState('terminal'); // 'terminal', 'desktop', 'projects'
  const terminalContext = useContext(TerminalContext);
  console.log(terminalContext);

  return (
    <main className='w-[100vw] font-dejavu'>
      {/* Mode Toggle Buttons */}
      <div className="mode-toggle">
        <button
          className={`mode-btn ${mode === 'terminal' ? 'active' : ''}`}
          onClick={() => setMode('terminal')}
        >
          Terminal
        </button>
        <button
          className={`mode-btn ${mode === 'desktop' ? 'active' : ''}`}
          onClick={() => setMode('desktop')}
        >
          Desktop
        </button>
        <button
          className={`mode-btn ${mode === 'projects' ? 'active' : ''}`}
          onClick={() => setMode('projects')}
        >
          Projects
        </button>
      </div>

      {/* Mode Content */}
      {mode === 'terminal' && (
        <div className="mode-content">
          <Outputs />
          <section>
            <p className="font-dejavu text-[#64e986] font-extrabold font-12 absolute">
              aymane@aymane
              <span className="text-white">:</span>
              <span className="text-blue-400">~/portfolio</span>
              <span className='text-white'>$</span>
            </p>
            <Input />
          </section>
        </div>
      )}

      {mode === 'desktop' && (
        <div className="mode-content">
          <Desktop onFileOpen={undefined} />
        </div>
      )}

      {mode === 'projects' && (
        <div className="mode-content">
          <ProjectCards />
        </div>
      )}
    </main>
  );
}

export default App;
