import { useEffect, useState } from 'react';
import { Sidebar, Header } from '@arcade/ui';
import type { Route, Theme, GameStatus } from '@arcade/ui';
import { TetrisGame } from '@arcade/tetris';
import { SnakeGame } from '@arcade/snake';
import { Game2048 } from '@arcade/2048';
import { PacmanGame } from '@arcade/pacman';
import { Landing } from './Landing';
import { Leaderboard } from './Leaderboard';
import { Settings } from './Settings';
import { NicknamePrompt } from './NicknamePrompt';
import { getNickname } from './services/nickname';
import { useScoreSubmitter } from './hooks/useScoreSubmitter';

const NICK_PROMPT_DISMISSED_KEY = 'arcade.nickPromptDismissed';

export default function App() {
  const [route, setRoute] = useState<Route>({ view: 'home' });
  const [theme, setTheme] = useState<Theme>('dark');
  const [collapsed, setCollapsed] = useState(false);
  const [status, setStatus] = useState<GameStatus>('idle');
  const [sessionSeconds, setSessionSeconds] = useState(0);

  const [nickname, setNickname] = useState<string | null>(() => getNickname());
  const [nickPromptOpen, setNickPromptOpen] = useState(() => {
    if (getNickname()) return false;
    try {
      return localStorage.getItem(NICK_PROMPT_DISMISSED_KEY) !== '1';
    } catch {
      return true;
    }
  });

  const submitScore = useScoreSubmitter();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    const id = setInterval(() => setSessionSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (route.view === 'play') setStatus('running');
    else setStatus('idle');
  }, [route.view, route.view === 'play' ? route.gameId : null]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return;
      if (e.key === 't' || e.key === 'T') {
        setTheme((t) => (t === 'dark' ? 'light' : 'dark'));
      }
      if (e.key === 'p' || e.key === 'P') {
        if (route.view === 'play') {
          setStatus((s) => (s === 'running' ? 'paused' : s === 'paused' ? 'running' : s));
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [route.view]);

  const totals = { played: 47, score: 21895, seconds: sessionSeconds + 3742 };

  return (
    <div className="arcade" data-collapsed={collapsed ? 'true' : 'false'}>
      <Sidebar
        route={route}
        setRoute={setRoute}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />
      <div className="content">
        <Header
          route={route}
          theme={theme}
          setTheme={setTheme}
          sessionSeconds={sessionSeconds}
          status={status}
        />
        <main className="content__body">
          {route.view === 'home' && <Landing setRoute={setRoute} totals={totals} />}
          {route.view === 'play' && route.gameId === 'tetris' && (
            <TetrisGame onGameOver={(s) => submitScore('tetris', s)} />
          )}
          {route.view === 'play' && route.gameId === 'snake' && (
            <SnakeGame onGameOver={(s) => submitScore('snake', s)} />
          )}
          {route.view === 'play' && route.gameId === '2048' && (
            <Game2048 onGameOver={(s) => submitScore('2048', s)} />
          )}
          {route.view === 'play' && route.gameId === 'pacman' && (
            <PacmanGame onGameOver={(s) => submitScore('pacman', s)} />
          )}
          {route.view === 'leaderboard' && <Leaderboard />}
          {route.view === 'settings' && (
            <Settings
              theme={theme}
              setTheme={setTheme}
              nickname={nickname}
              onNicknameChange={setNickname}
            />
          )}
        </main>
      </div>

      {nickPromptOpen && (
        <NicknamePrompt
          onSet={(nick) => {
            setNickname(nick);
            setNickPromptOpen(false);
          }}
          onSkip={() => {
            try {
              localStorage.setItem(NICK_PROMPT_DISMISSED_KEY, '1');
            } catch {
              /* ignore */
            }
            setNickPromptOpen(false);
          }}
        />
      )}
    </div>
  );
}
