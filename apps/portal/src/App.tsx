import { useCallback, useEffect, useState, type CSSProperties } from 'react';
import {
  ARCADE_KEYS,
  gameInfo,
  isKey,
  readString,
  shouldIgnoreKey,
  useArcadeTheme,
  writeString,
  type ArcadeStatusInfo,
} from '@arcade/kit';
import { Header, Sidebar, type LiveStatus } from '@arcade/ui';
import { GAME_MODULES } from './games';
import { useAllStats, useSavedSessions } from './hooks/usePortalData';
import { useScoreSubmitter } from './hooks/useScoreSubmitter';
import { Landing } from './Landing';
import { Leaderboard } from './Leaderboard';
import { NicknamePrompt } from './NicknamePrompt';
import { useHashRoute } from './routes';
import { getNickname } from './services/nickname';
import { Settings } from './Settings';
import { ShortcutsDialog } from './ShortcutsDialog';

const NICK_PROMPT_DISMISSED_KEY = 'arcade.nickPromptDismissed';
const SIDEBAR_COLLAPSED_KEY = 'arcade.sidebarCollapsed';

export default function App() {
  const [route, navigate] = useHashRoute();
  const [theme, setTheme, toggleTheme] = useArcadeTheme();
  const [collapsed, setCollapsed] = useState(() => readString(SIDEBAR_COLLAPSED_KEY) === '1');
  const [live, setLive] = useState<LiveStatus>(null);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);

  const stats = useAllStats();
  const sessions = useSavedSessions();
  const submitScore = useScoreSubmitter();

  const [nickname, setNickname] = useState<string | null>(() => getNickname());
  const [nickPromptOpen, setNickPromptOpen] = useState(
    () => !getNickname() && readString(NICK_PROMPT_DISMISSED_KEY) !== '1',
  );

  const playingId = route.view === 'play' ? route.gameId : null;

  // The header chip mirrors whatever game is mounted; reset it on game switch.
  useEffect(() => setLive(null), [playingId]);

  useEffect(() => {
    document.title = playingId ? `${gameInfo(playingId).name} · Zoltan's Arcade` : "Zoltan's Arcade";
  }, [playingId]);

  const toggleCollapsed = useCallback(() => {
    setCollapsed((c) => {
      writeString(SIDEBAR_COLLAPSED_KEY, c ? '0' : '1');
      return !c;
    });
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (shouldIgnoreKey(e)) return;
      if (isKey(e, ARCADE_KEYS.theme)) toggleTheme();
      else if (e.key === '?') setShortcutsOpen((o) => !o);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [toggleTheme]);

  const onStatusChange = useCallback((info: ArcadeStatusInfo) => setLive(info), []);
  const onGameOver = useCallback(
    (score: number) => {
      if (playingId) submitScore(playingId, score);
    },
    [playingId, submitScore],
  );

  const Game = playingId ? GAME_MODULES[playingId].Game : null;

  return (
    <div className="arcade" data-collapsed={collapsed ? 'true' : 'false'}>
      <Sidebar
        route={route}
        navigate={navigate}
        collapsed={collapsed}
        onToggleCollapsed={toggleCollapsed}
        stats={stats}
        sessions={sessions}
      />
      <div className="content">
        <Header
          route={route}
          theme={theme}
          onToggleTheme={toggleTheme}
          onOpenShortcuts={() => setShortcutsOpen(true)}
          onOpenSettings={() => navigate({ view: 'settings' })}
          live={live}
        />
        <main className="content__body">
          {route.view === 'home' && <Landing navigate={navigate} stats={stats} sessions={sessions} />}
          {Game && playingId && (
            <div
              className="play-view"
              style={{ '--game-color': `var(${gameInfo(playingId).colorVar})` } as CSSProperties}
            >
              {/* key: a fresh instance per game, so each restores its own saved run */}
              <Game key={playingId} embedded onGameOver={onGameOver} onStatusChange={onStatusChange} />
            </div>
          )}
          {route.view === 'leaderboard' && <Leaderboard />}
          {route.view === 'settings' && (
            <Settings theme={theme} setTheme={setTheme} nickname={nickname} onNicknameChange={setNickname} />
          )}
        </main>
      </div>

      {shortcutsOpen && <ShortcutsDialog gameId={playingId} onClose={() => setShortcutsOpen(false)} />}

      {nickPromptOpen && (
        <NicknamePrompt
          onSet={(nick) => {
            setNickname(nick);
            setNickPromptOpen(false);
          }}
          onSkip={() => {
            writeString(NICK_PROMPT_DISMISSED_KEY, '1');
            setNickPromptOpen(false);
          }}
        />
      )}
    </div>
  );
}
