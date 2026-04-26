import {
  cloneElement,
  isValidElement,
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type Dispatch,
  type ReactElement,
  type SetStateAction,
} from 'react';
import { GAMES, fmtTime, type Route } from '@arcade/ui';

const TETRO: Record<string, string> = {
  I: '#31c7ef',
  O: '#f7d308',
  T: '#ad4d9c',
  S: '#42b642',
  Z: '#ef2029',
  J: '#5a65ad',
  L: '#ef7921',
};

type MiniProps = { active?: boolean };

function useTetrisPreview(active: boolean) {
  const [piece, setPiece] = useState<{ k: string; x: number; y: number }>({
    k: 'T',
    x: 4,
    y: 0,
  });

  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => {
      setPiece((p) => {
        const next = { ...p, y: p.y + 1 };
        if (next.y > 14) {
          const kinds = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];
          return {
            k: kinds[Math.floor(Math.random() * kinds.length)],
            x: Math.floor(Math.random() * 8) + 1,
            y: 0,
          };
        }
        return next;
      });
    }, 220);
    return () => clearInterval(id);
  }, [active]);

  const stack = useMemo(() => {
    const rows = 16;
    const cols = 10;
    const grid: (string | null)[][] = Array.from({ length: rows }, () =>
      Array(cols).fill(null),
    );
    const fillRows = [
      { r: 15, fill: 0.85 },
      { r: 14, fill: 0.7 },
      { r: 13, fill: 0.5 },
      { r: 12, fill: 0.3 },
    ];
    const kinds = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];
    fillRows.forEach(({ r, fill }) => {
      for (let c = 0; c < cols; c++) {
        if (Math.random() < fill) grid[r][c] = kinds[(r * 7 + c * 3) % kinds.length];
      }
    });
    return grid;
  }, []);

  return { piece, stack };
}

function TetrisMini({ active = false }: MiniProps) {
  const { piece, stack } = useTetrisPreview(active);
  const cells: ReactElement[] = [];
  for (let r = 0; r < 16; r++) {
    for (let c = 0; c < 10; c++) {
      const stk = stack[r][c];
      const isPiece =
        (r === piece.y && c === piece.x) ||
        (piece.k === 'I' && r === piece.y && c >= piece.x && c < piece.x + 4);
      const k = isPiece ? piece.k : stk;
      cells.push(
        <div
          key={`${r}-${c}`}
          className={k ? 'f' : ''}
          style={k ? { backgroundColor: TETRO[k] } : undefined}
        />,
      );
    }
  }
  return <div className="tetris-mini">{cells}</div>;
}

function SnakeMini({ active = false }: MiniProps) {
  const N = 16;
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => setTick((t) => t + 1), 160);
    return () => clearInterval(id);
  }, [active]);

  const path = useMemo(() => {
    const p: [number, number][] = [];
    for (let x = 2; x < N - 2; x++) p.push([x, 4]);
    for (let y = 4; y < 9; y++) p.push([N - 3, y]);
    for (let x = N - 3; x >= 3; x--) p.push([x, 9]);
    for (let y = 9; y < 13; y++) p.push([3, y]);
    for (let x = 3; x < N - 2; x++) p.push([x, 13]);
    return p;
  }, []);

  const len = 8;
  const body = Array.from(
    { length: len },
    (_, i) => path[(tick - i + path.length * 100) % path.length],
  );
  const food: [number, number] = [11, 7];
  const cellSize = 100 / N;

  return (
    <div className="snake-mini" aria-hidden="true">
      {body.map(([x, y], i) => (
        <div
          key={i}
          className={i === 0 ? 'snake-head' : 'snake-cell'}
          style={{
            position: 'absolute',
            left: `${x * cellSize}%`,
            top: `${y * cellSize}%`,
            width: `${cellSize}%`,
            height: `${cellSize}%`,
            opacity: 1 - i * 0.07,
            transition: 'left 130ms linear, top 130ms linear',
          }}
        />
      ))}
      <div
        className="snake-food"
        style={{
          position: 'absolute',
          left: `${food[0] * cellSize + 1}%`,
          top: `${food[1] * cellSize + 1}%`,
          width: `${cellSize - 2}%`,
          height: `${cellSize - 2}%`,
        }}
      />
    </div>
  );
}

function Tw2048Mini({ active = false }: MiniProps) {
  const [pulse, setPulse] = useState(0);
  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => setPulse((p) => p + 1), 900);
    return () => clearInterval(id);
  }, [active]);

  const layouts = useMemo(
    () => [
      [
        [2, 4, 8, 2],
        [4, 16, 2, 8],
        [2, 8, 32, 4],
        [8, 2, 16, 128],
      ],
      [
        [4, 2, 16, 4],
        [8, 32, 4, 2],
        [2, 16, 64, 8],
        [4, 8, 2, 256],
      ],
      [
        [2, 8, 4, 2],
        [16, 4, 32, 8],
        [4, 64, 128, 16],
        [2, 4, 8, 512],
      ],
    ],
    [],
  );
  const grid = layouts[pulse % layouts.length];

  return (
    <div className="tw-mini">
      {grid.flat().map((v, i) => (
        <div key={i} className={`tw-tile ${v ? '' : 'empty'}`} data-v={v || ''}>
          {v || ''}
        </div>
      ))}
    </div>
  );
}

type GameCardProps = {
  name: string;
  color: string;
  best: number;
  desc: string;
  tag: string;
  onPlay: () => void;
  children: ReactElement<MiniProps>;
};

function GameCard({ name, color, best, desc, tag, onPlay, children }: GameCardProps) {
  const [hover, setHover] = useState(false);
  const preview = isValidElement(children)
    ? cloneElement(children, { active: hover })
    : children;
  return (
    <article
      className="game-card"
      style={{ ['--game-color' as string]: color } as CSSProperties}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={onPlay}
    >
      <div className="game-card__preview">{preview}</div>
      <div className="game-card__body">
        <div className="game-card__title-row">
          <span className="game-card__title">{name}</span>
          <span className="game-card__chip">{tag}</span>
        </div>
        <p className="game-card__desc">{desc}</p>
        <div className="game-card__meta">
          <span>
            Best <strong>{best.toLocaleString()}</strong>
          </span>
          <span style={{ flex: 1 }} />
          <span>Press to play →</span>
        </div>
      </div>
    </article>
  );
}

type LandingProps = {
  setRoute: Dispatch<SetStateAction<Route>>;
  totals: { played: number; score: number; seconds: number };
};

const META = {
  tetris: {
    tag: 'Arcade',
    desc: 'Stack falling blocks, clear lines, chase a Tetris. SRS rotation, 7-bag, hold.',
  },
  snake: {
    tag: 'Reflex',
    desc: "Eat, grow, don't bite yourself. Classic grid. Wraparound off by default.",
  },
  '2048': {
    tag: 'Puzzle',
    desc: 'Slide tiles, merge equal numbers. Get to 2048 — and beyond.',
  },
} as const;

const PREVIEWS = {
  tetris: <TetrisMini />,
  snake: <SnakeMini />,
  '2048': <Tw2048Mini />,
} as const;

export function Landing({ setRoute, totals }: LandingProps) {
  return (
    <>
      <section className="landing__hero">
        <div>
          <h1>Three classics, one home.</h1>
          <p>
            Welcome back. Pick a game to play, or pick up where you left off — your high
            scores follow you across sessions.
          </p>
        </div>
        <dl className="landing__hero-stats">
          <div className="stat-card">
            <dt>Games played</dt>
            <dd>{totals.played}</dd>
          </div>
          <div className="stat-card">
            <dt>Total score</dt>
            <dd>{totals.score.toLocaleString()}</dd>
          </div>
          <div className="stat-card">
            <dt>Time on arcade</dt>
            <dd>{fmtTime(totals.seconds)}</dd>
          </div>
        </dl>
      </section>

      <div className="section-head">
        <h2>Games</h2>
        <span>3 available · keyboard-first</span>
      </div>

      <div className="cards">
        {GAMES.map((g) => (
          <GameCard
            key={g.id}
            name={g.name}
            color={g.color}
            best={g.best}
            desc={META[g.id].desc}
            tag={META[g.id].tag}
            onPlay={() => setRoute({ view: 'play', gameId: g.id })}
          >
            {PREVIEWS[g.id]}
          </GameCard>
        ))}
      </div>
    </>
  );
}
