import React, { useState } from 'react';
import './App.css';
import TerminalView from './components/TerminalView';
import Desktop from './components/Desktop';

type Mode = 'terminal' | 'desktop';

function App() {
  const [mode, setMode] = useState<Mode>('terminal');

  return (
    <main className="app-root font-dejavu">
      {mode === 'terminal' && <TerminalView onModeChange={setMode} />}
      {mode === 'desktop' && <Desktop onModeChange={setMode} />}
    </main>
  );
}

export default App;
