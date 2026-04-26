/* App.jsx — top-level route + theme + session timer */
const { useState, useEffect, useRef } = React;
const { Sidebar, Header, GAMES } = window.Shell;
const { Tetris, Snake, Tw2048 } = window.Games;
const Landing = window.Landing;

function App() {
  const [route, setRoute] = useState({ view: 'home' });
  const [theme, setTheme] = useState('dark');
  const [collapsed, setCollapsed] = useState(false);
  const [status, setStatus] = useState('idle'); // running | paused | gameOver | idle
  const [sessionSeconds, setSessionSeconds] = useState(0);

  // theme on root
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // session timer (overall arcade time)
  useEffect(() => {
    const id = setInterval(() => setSessionSeconds(s => s + 1), 1000);
    return () => clearInterval(id);
  }, []);

  // reset status when entering a new game
  useEffect(() => {
    if (route.view === 'play') setStatus('running');
    else setStatus('idle');
  }, [route.view, route.gameId]);

  // global theme shortcut
  useEffect(() => {
    const onKey = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.key === 't' || e.key === 'T') setTheme(t => t === 'dark' ? 'light' : 'dark');
      if (e.key === 'p' || e.key === 'P') {
        if (route.view === 'play') setStatus(s => s === 'running' ? 'paused' : s === 'paused' ? 'running' : s);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [route.view]);

  const totals = { played: 47, score: 21895, seconds: sessionSeconds + 3742 };

  return (
    <div className="arcade" data-collapsed={collapsed ? 'true' : 'false'}>
      <Sidebar route={route} setRoute={setRoute} collapsed={collapsed} setCollapsed={setCollapsed} />
      <div className="content">
        <Header route={route} theme={theme} setTheme={setTheme} sessionSeconds={sessionSeconds} status={status} />
        <main className="content__body">
          {route.view === 'home'  && <Landing setRoute={setRoute} totals={totals} />}
          {route.view === 'play'  && route.gameId === 'tetris' && <Tetris status={status} setStatus={setStatus} />}
          {route.view === 'play'  && route.gameId === 'snake'  && <Snake  status={status} setStatus={setStatus} />}
          {route.view === 'play'  && route.gameId === '2048'   && <Tw2048 status={status} setStatus={setStatus} />}
          {route.view === 'leaderboard' && <Leaderboard />}
          {route.view === 'settings'    && <Settings theme={theme} setTheme={setTheme} />}
        </main>
      </div>
    </div>
  );
}

function Leaderboard() {
  const rows = [
    { rank: 1, game: 'Tetris', score: 12480, lines: 124, when: '2 days ago' },
    { rank: 2, game: '2048',   score:  4096, lines: '—',  when: '4 days ago' },
    { rank: 3, game: 'Snake',  score:    87, lines: '—',  when: 'Yesterday' },
    { rank: 4, game: 'Tetris', score:  9760, lines:  92, when: 'Last week' },
    { rank: 5, game: 'Tetris', score:  7320, lines:  71, when: 'Last week' },
  ];
  return (
    <div>
      <div className="section-head"><h2>Best runs</h2><span>Personal bests across all games</span></div>
      <div className="panel" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '60px 1fr 120px 100px 1fr', padding: '12px 18px', borderBottom: '1px solid var(--panel-border)', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-mute)' }}>
          <span>#</span><span>Game</span><span>Score</span><span>Lines</span><span>When</span>
        </div>
        {rows.map((r) => (
          <div key={r.rank} style={{ display: 'grid', gridTemplateColumns: '60px 1fr 120px 100px 1fr', padding: '12px 18px', borderBottom: '1px solid var(--panel-border)', fontSize: 13.5, alignItems: 'center' }}>
            <span style={{ color: r.rank === 1 ? 'var(--tetro-O)' : 'var(--text-mute)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{r.rank}</span>
            <span style={{ color: 'var(--text-strong)', fontWeight: 500 }}>{r.game}</span>
            <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-strong)' }}>{r.score.toLocaleString()}</span>
            <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-dim)' }}>{r.lines}</span>
            <span style={{ color: 'var(--text-dim)' }}>{r.when}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Settings({ theme, setTheme }) {
  return (
    <div>
      <div className="section-head"><h2>Settings</h2><span>Preferences are saved locally</span></div>
      <div className="panel" style={{ display: 'grid', gap: 14, maxWidth: 560 }}>
        <Row label="Theme" hint="Toggle between dark and light. Press T anywhere.">
          <button className={`btn ${theme==='dark'?'btn--primary':''}`} onClick={() => setTheme('dark')}>Dark</button>
          <button className={`btn ${theme==='light'?'btn--primary':''}`} onClick={() => setTheme('light')}>Light</button>
        </Row>
        <Row label="Reduced motion" hint="Limit board animations and transitions.">
          <button className="btn">Off</button>
          <button className="btn">On</button>
        </Row>
        <Row label="Reset high scores" hint="Clears local storage for all games.">
          <button className="btn" style={{ color: 'var(--tetro-Z)', borderColor: 'rgba(239,32,41,0.4)' }}>Reset</button>
        </Row>
      </div>
    </div>
  );
}
function Row({ label, hint, children }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', alignItems: 'center', gap: 16, padding: '4px 0' }}>
      <div>
        <div style={{ color: 'var(--text-strong)', fontWeight: 500, fontSize: 13.5 }}>{label}</div>
        <div style={{ color: 'var(--text-mute)', fontSize: 12 }}>{hint}</div>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>{children}</div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
