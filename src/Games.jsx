/* Games.jsx — playable mocks for Tetris, Snake, 2048 inside the portal shell */
const { useEffect, useMemo, useRef, useState, useCallback } = React;
const { IconPause, IconPlay, IconRestart, IconClock } = window.Icons;

const TETRO_COLORS = { I:'#31c7ef', O:'#f7d308', T:'#ad4d9c', S:'#42b642', Z:'#ef2029', J:'#5a65ad', L:'#ef7921' };

/* ───────── Tetris (mock with proper falling piece + line clears) ───────── */
const TETRO_SHAPES = {
  I: [[0,1],[1,1],[2,1],[3,1]],
  O: [[0,0],[1,0],[0,1],[1,1]],
  T: [[1,0],[0,1],[1,1],[2,1]],
  S: [[1,0],[2,0],[0,1],[1,1]],
  Z: [[0,0],[1,0],[1,1],[2,1]],
  J: [[0,0],[0,1],[1,1],[2,1]],
  L: [[2,0],[0,1],[1,1],[2,1]],
};
const T_KINDS = ['I','O','T','S','Z','J','L'];
function newPiece() {
  const k = T_KINDS[Math.floor(Math.random()*7)];
  return { k, x: 3, y: 0 };
}

function Tetris({ status, setStatus }) {
  const COLS = 10, ROWS = 20;
  const [grid, setGrid] = useState(() => Array.from({length: ROWS}, () => Array(COLS).fill(null)));
  const [piece, setPiece] = useState(newPiece);
  const [next, setNext] = useState(() => Array.from({length: 5}, newPiece));
  const [score, setScore] = useState(0);
  const [lines, setLines] = useState(0);
  const [level] = useState(1);

  const collide = useCallback((p, g) => {
    return TETRO_SHAPES[p.k].some(([dx, dy]) => {
      const x = p.x + dx, y = p.y + dy;
      return x < 0 || x >= COLS || y >= ROWS || (y >= 0 && g[y][x]);
    });
  }, []);

  const lock = useCallback((p, g) => {
    const ng = g.map(r => r.slice());
    TETRO_SHAPES[p.k].forEach(([dx, dy]) => {
      const x = p.x + dx, y = p.y + dy;
      if (y >= 0 && y < ROWS && x >= 0 && x < COLS) ng[y][x] = p.k;
    });
    let cleared = 0;
    const filtered = ng.filter(r => { const full = r.every(c => c); if (full) cleared++; return !full; });
    while (filtered.length < ROWS) filtered.unshift(Array(COLS).fill(null));
    if (cleared > 0) {
      const pts = [0,100,300,500,800][cleared] * level;
      setScore(s => s + pts);
      setLines(l => l + cleared);
    }
    return filtered;
  }, [level]);

  // gravity
  useEffect(() => {
    if (status !== 'running') return;
    const id = setInterval(() => {
      setPiece(p => {
        const np = { ...p, y: p.y + 1 };
        if (collide(np, grid)) {
          const ng = lock(p, grid);
          setGrid(ng);
          const fresh = next[0];
          setNext(n => [...n.slice(1), newPiece()]);
          if (collide(fresh, ng)) { setStatus('gameOver'); return p; }
          return fresh;
        }
        return np;
      });
    }, 380);
    return () => clearInterval(id);
  }, [status, grid, next, collide, lock, setStatus]);

  // controls
  useEffect(() => {
    const onKey = (e) => {
      if (status !== 'running') return;
      if (['ArrowLeft','ArrowRight','ArrowDown','ArrowUp',' '].includes(e.key)) e.preventDefault();
      setPiece(p => {
        if (e.key === 'ArrowLeft')  { const np = {...p, x: p.x-1}; return collide(np, grid) ? p : np; }
        if (e.key === 'ArrowRight') { const np = {...p, x: p.x+1}; return collide(np, grid) ? p : np; }
        if (e.key === 'ArrowDown')  { const np = {...p, y: p.y+1}; return collide(np, grid) ? p : (setScore(s=>s+1), np); }
        return p;
      });
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [status, grid, collide]);

  // ghost
  const ghostY = useMemo(() => {
    let y = piece.y;
    while (!collide({...piece, y: y+1}, grid)) y++;
    return y;
  }, [piece, grid, collide]);

  const cells = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const stk = grid[r][c];
      const onPiece = TETRO_SHAPES[piece.k].some(([dx, dy]) => piece.x + dx === c && piece.y + dy === r);
      const onGhost = !onPiece && !stk && TETRO_SHAPES[piece.k].some(([dx, dy]) => piece.x + dx === c && ghostY + dy === r);
      const k = onPiece ? piece.k : stk;
      cells.push(
        <div key={`${r}-${c}`}
          className={k ? 'f' : (onGhost ? 'g' : '')}
          style={k ? { backgroundColor: TETRO_COLORS[k] } : (onGhost ? { color: TETRO_COLORS[piece.k] } : undefined)} />
      );
    }
  }

  return (
    <div className="play">
      <aside className="play__side">
        <div className="panel">
          <div className="panel-title">Hold</div>
          <PiecePreview kind={null} />
        </div>
        <div className="panel">
          <div className="panel-title">Score</div>
          <div className="score-grid">
            <StatCard label="Score" value={score.toLocaleString()} />
            <StatCard label="Lines" value={lines} />
            <StatCard label="Level" value={level} />
            <StatCard label="Best"  value="12,480" />
          </div>
        </div>
      </aside>

      <section className="play__center">
        <div className="tboard">{cells}</div>
        <ControlsRow status={status} setStatus={setStatus} onRestart={() => {
          setGrid(Array.from({length: ROWS}, () => Array(COLS).fill(null)));
          setPiece(newPiece()); setScore(0); setLines(0);
        }} />
      </section>

      <aside className="play__side">
        <div className="panel">
          <div className="panel-title">Next</div>
          <div className="next-list">{next.slice(0,5).map((p, i) => <PiecePreview key={i} kind={p.k} />)}</div>
        </div>
        <div className="panel">
          <div className="panel-title">Controls</div>
          <div className="controls-list">
            <div><span>Move</span><span><span className="kbd">←</span> <span className="kbd">→</span></span></div>
            <div><span>Soft drop</span><span className="kbd">↓</span></div>
            <div><span>Rotate</span><span className="kbd">↑</span></div>
            <div><span>Hard drop</span><span className="kbd">Space</span></div>
            <div><span>Hold</span><span className="kbd">C</span></div>
          </div>
        </div>
      </aside>
    </div>
  );
}

function PiecePreview({ kind }) {
  const cells = Array(16).fill(false);
  if (kind) {
    TETRO_SHAPES[kind].forEach(([dx, dy]) => {
      const x = dx + 1, y = dy + 1;
      if (x >= 0 && x < 4 && y >= 0 && y < 4) cells[y*4 + x] = true;
    });
  }
  return (
    <div className="preview-grid">
      {cells.map((on, i) => <div key={i} className={on ? 'f' : ''} style={on ? { backgroundColor: TETRO_COLORS[kind] } : undefined} />)}
    </div>
  );
}

/* ───────── Snake ───────── */
function Snake({ status, setStatus }) {
  const N = 20;
  const [snake, setSnake] = useState(() => [[10,10],[9,10],[8,10],[7,10]]);
  const [dir, setDir] = useState([1, 0]);
  const dirRef = useRef(dir); dirRef.current = dir;
  const [food, setFood] = useState([15, 10]);
  const [score, setScore] = useState(0);

  useEffect(() => {
    const onKey = (e) => {
      const map = { ArrowUp:[0,-1], ArrowDown:[0,1], ArrowLeft:[-1,0], ArrowRight:[1,0],
                    w:[0,-1], s:[0,1], a:[-1,0], d:[1,0] };
      const nd = map[e.key];
      if (!nd) return;
      e.preventDefault();
      const cur = dirRef.current;
      if (cur[0] === -nd[0] && cur[1] === -nd[1]) return; // no reverse
      setDir(nd);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    if (status !== 'running') return;
    const id = setInterval(() => {
      setSnake(s => {
        const head = [s[0][0] + dirRef.current[0], s[0][1] + dirRef.current[1]];
        if (head[0] < 0 || head[0] >= N || head[1] < 0 || head[1] >= N || s.some(([x,y]) => x===head[0]&&y===head[1])) {
          setStatus('gameOver'); return s;
        }
        const ate = head[0] === food[0] && head[1] === food[1];
        if (ate) {
          setScore(sc => sc + 10);
          setFood([Math.floor(Math.random()*N), Math.floor(Math.random()*N)]);
          return [head, ...s];
        }
        return [head, ...s.slice(0, -1)];
      });
    }, 130);
    return () => clearInterval(id);
  }, [status, food, setStatus]);

  const cellSize = 100 / N;

  return (
    <div className="play">
      <aside className="play__side">
        <div className="panel">
          <div className="panel-title">Score</div>
          <div className="score-grid">
            <StatCard label="Score" value={score} />
            <StatCard label="Length" value={snake.length} />
            <StatCard label="Speed" value="1.0×" />
            <StatCard label="Best" value="87" />
          </div>
        </div>
        <div className="panel">
          <div className="panel-title">Mode</div>
          <div className="controls-list">
            <div><span>Wraparound</span><span className="kbd">Off</span></div>
            <div><span>Walls</span><span className="kbd">Solid</span></div>
            <div><span>Speed</span><span className="kbd">Normal</span></div>
          </div>
        </div>
      </aside>

      <section className="play__center">
        <div className="sboard" style={{ '--n': N }}>
          {snake.map(([x, y], i) => (
            <div key={i} className={i===0?'snake-head':'snake-cell'}
              style={{ position:'absolute', left:`${x*cellSize}%`, top:`${y*cellSize}%`,
                       width:`${cellSize}%`, height:`${cellSize}%`,
                       opacity: 1 - Math.min(0.45, i*0.02), transition:'left 110ms linear, top 110ms linear' }} />
          ))}
          <div className="snake-food" style={{
            position:'absolute',
            left:`${food[0]*cellSize+0.6}%`, top:`${food[1]*cellSize+0.6}%`,
            width:`${cellSize-1.2}%`, height:`${cellSize-1.2}%`,
          }}/>
        </div>
        <ControlsRow status={status} setStatus={setStatus} onRestart={() => {
          setSnake([[10,10],[9,10],[8,10],[7,10]]); setDir([1,0]); setScore(0);
          setFood([15,10]);
        }} />
      </section>

      <aside className="play__side">
        <div className="panel">
          <div className="panel-title">Controls</div>
          <div className="controls-list">
            <div><span>Move</span><span><span className="kbd">←</span><span className="kbd">→</span><span className="kbd">↑</span><span className="kbd">↓</span></span></div>
            <div><span>Pause</span><span className="kbd">P</span></div>
            <div><span>Restart</span><span className="kbd">R</span></div>
          </div>
        </div>
      </aside>
    </div>
  );
}

/* ───────── 2048 ───────── */
function compactMerge(line) {
  const filtered = line.filter(v => v);
  let gained = 0;
  for (let i = 0; i < filtered.length - 1; i++) {
    if (filtered[i] === filtered[i+1]) {
      filtered[i] *= 2; gained += filtered[i];
      filtered.splice(i+1, 1);
    }
  }
  while (filtered.length < 4) filtered.push(0);
  return { line: filtered, gained };
}
function rotate(g) { return g[0].map((_, c) => g.map(r => r[c]).reverse()); }
function spawn(g) {
  const empty = []; g.forEach((r,ri) => r.forEach((v,ci) => { if (!v) empty.push([ri,ci]); }));
  if (!empty.length) return g;
  const [r,c] = empty[Math.floor(Math.random()*empty.length)];
  const ng = g.map(r => r.slice()); ng[r][c] = Math.random() < 0.9 ? 2 : 4; return ng;
}

function Tw2048({ status, setStatus }) {
  const [grid, setGrid] = useState(() => spawn(spawn([[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]])));
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(4096);

  const move = useCallback((dir) => {
    setGrid(g => {
      let work = g;
      for (let i = 0; i < dir; i++) work = rotate(work);
      let total = 0; let changed = false;
      const merged = work.map(row => {
        const before = row.join(',');
        const { line, gained } = compactMerge(row);
        total += gained;
        if (line.join(',') !== before) changed = true;
        return line;
      });
      let result = merged;
      for (let i = 0; i < (4 - dir) % 4; i++) result = rotate(result);
      if (!changed) return g;
      setScore(s => { const ns = s + total; setBest(b => Math.max(b, ns)); return ns; });
      return spawn(result);
    });
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (status !== 'running') return;
      const map = { ArrowLeft: 0, ArrowUp: 1, ArrowRight: 2, ArrowDown: 3 };
      if (e.key in map) { e.preventDefault(); move(map[e.key]); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [status, move]);

  return (
    <div className="play">
      <aside className="play__side">
        <div className="panel">
          <div className="panel-title">Score</div>
          <div className="score-grid">
            <StatCard label="Score" value={score.toLocaleString()} />
            <StatCard label="Best" value={best.toLocaleString()} />
            <StatCard label="Moves" value="—" />
            <StatCard label="Tile max" value={Math.max(...grid.flat()) || 0} />
          </div>
        </div>
        <div className="panel">
          <div className="panel-title">How to play</div>
          <div className="controls-list">
            <div><span style={{maxWidth:160}}>Slide tiles. Equal numbers merge. Reach 2048.</span></div>
          </div>
        </div>
      </aside>

      <section className="play__center">
        <div className="twboard">
          {grid.flat().map((v, i) => (
            <div key={i} className={`tw-tile ${v ? '' : 'empty'}`} data-v={v || ''}>{v || ''}</div>
          ))}
        </div>
        <ControlsRow status={status} setStatus={setStatus} onRestart={() => {
          setGrid(spawn(spawn([[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]]))); setScore(0);
        }} />
      </section>

      <aside className="play__side">
        <div className="panel">
          <div className="panel-title">Controls</div>
          <div className="controls-list">
            <div><span>Slide</span><span><span className="kbd">←</span><span className="kbd">→</span><span className="kbd">↑</span><span className="kbd">↓</span></span></div>
            <div><span>Pause</span><span className="kbd">P</span></div>
            <div><span>Restart</span><span className="kbd">R</span></div>
          </div>
        </div>
      </aside>
    </div>
  );
}

/* ───────── Shared bits ───────── */
function StatCard({ label, value }) {
  return (
    <div className="stat-card">
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

function ControlsRow({ status, setStatus, onRestart }) {
  return (
    <div style={{ display:'flex', gap: 8, alignItems:'center' }}>
      {status === 'running' ? (
        <button className="btn" onClick={() => setStatus('paused')}><IconPause size={14}/> Pause</button>
      ) : (
        <button className="btn btn--primary" onClick={() => setStatus('running')}><IconPlay size={14}/> {status === 'gameOver' ? 'New game' : 'Play'}</button>
      )}
      <button className="btn" onClick={() => { onRestart(); setStatus('running'); }}><IconRestart size={14}/> Restart</button>
      {status === 'gameOver' && <span style={{ color: 'var(--tetro-Z)', fontSize: 13, marginLeft: 6 }}>Game over</span>}
      {status === 'paused'   && <span style={{ color: 'var(--text-mute)',  fontSize: 13, marginLeft: 6 }}>Paused</span>}
    </div>
  );
}

window.Games = { Tetris, Snake, Tw2048 };
