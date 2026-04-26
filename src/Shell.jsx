/* Shell.jsx — Sidebar, Header, layout shell */
const { useState, useEffect, useRef } = React;
const { IconHome, IconTrophy, IconSettings, IconSun, IconMoon, IconChevron, IconLogo, IconTetris, IconSnake, Icon2048, IconKbd } = window.Icons;

const GAMES = [
  { id: 'tetris', name: 'Tetris',  Icon: IconTetris, color: 'var(--game-tetris)', best: 12480 },
  { id: 'snake',  name: 'Snake',   Icon: IconSnake,  color: 'var(--game-snake)',  best:    87 },
  { id: '2048',   name: '2048',    Icon: Icon2048,   color: 'var(--game-2048)',   best:  4096 },
];

function Sidebar({ route, setRoute, collapsed, setCollapsed }) {
  return (
    <aside className="sidebar">
      <div className="sidebar__brand" onClick={() => setRoute({ view: 'home' })} style={{ cursor: 'pointer' }}>
        <div className="sidebar__logo"><IconLogo /></div>
        <div className="sidebar__title">
          <strong>Zoltan's Arcade</strong>
          <span>Portal · v1.0</span>
        </div>
      </div>

      <div className="sidebar__section-label">Browse</div>
      <button
        className={`nav-item ${route.view === 'home' ? 'nav-item--active' : ''}`}
        onClick={() => setRoute({ view: 'home' })}
      >
        <span className="nav-item__icon"><IconHome /></span>
        <span className="nav-item__label">Home</span>
      </button>

      <div className="sidebar__section-label">Games</div>
      {GAMES.map((g) => (
        <button
          key={g.id}
          className={`nav-item ${route.view === 'play' && route.gameId === g.id ? 'nav-item--active' : ''}`}
          onClick={() => setRoute({ view: 'play', gameId: g.id })}
          style={{ '--game-color': g.color }}
        >
          <span className="nav-item__icon" style={{ color: route.view === 'play' && route.gameId === g.id ? g.color : undefined }}>
            <g.Icon />
          </span>
          <span className="nav-item__label">{g.name}</span>
          <span className="nav-item__badge">{g.best.toLocaleString()}</span>
        </button>
      ))}

      <div className="sidebar__section-label">More</div>
      <button className="nav-item" onClick={() => setRoute({ view: 'leaderboard' })}>
        <span className="nav-item__icon"><IconTrophy /></span>
        <span className="nav-item__label">Leaderboard</span>
      </button>
      <button className="nav-item" onClick={() => setRoute({ view: 'settings' })}>
        <span className="nav-item__icon"><IconSettings /></span>
        <span className="nav-item__label">Settings</span>
      </button>

      <div className="sidebar__spacer" />
      <div className="sidebar__footer">
        <button className="nav-item" onClick={() => setCollapsed(!collapsed)}>
          <span className="nav-item__icon" style={{ transform: collapsed ? 'rotate(0deg)' : 'rotate(180deg)' }}><IconChevron /></span>
          <span className="nav-item__label">{collapsed ? 'Expand' : 'Collapse'}</span>
        </button>
      </div>
    </aside>
  );
}

function fmtTime(s) {
  const m = Math.floor(s / 60), r = s % 60;
  return `${String(m).padStart(2,'0')}:${String(r).padStart(2,'0')}`;
}

function Header({ route, theme, setTheme, sessionSeconds, status }) {
  const game = GAMES.find((g) => g.id === route.gameId);
  return (
    <header className="header">
      <div className="header__crumbs">
        <strong>Zoltan's Arcade</strong>
        {route.view !== 'home' && (<><span className="sep">/</span><span>{
          route.view === 'play' ? game?.name :
          route.view === 'leaderboard' ? 'Leaderboard' :
          route.view === 'settings' ? 'Settings' : ''
        }</span></>)}
      </div>

      {route.view === 'play' && (
        <span className="header__chip" title="Status & elapsed time">
          <span className="header__chip-dot" style={{ background: status === 'paused' ? 'var(--text-mute)' : 'var(--game-snake)' }} />
          <strong style={{ color: 'var(--text)' }}>{status === 'paused' ? 'Paused' : status === 'gameOver' ? 'Game over' : 'Playing'}</strong>
          <span style={{ color: 'var(--text-mute)' }}>·</span>
          <span>{fmtTime(sessionSeconds)}</span>
        </span>
      )}

      <div className="header__actions">
        <button
          className="icon-btn"
          aria-label="Toggle theme"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          title="Toggle theme (T)"
        >
          {theme === 'dark' ? <IconSun /> : <IconMoon />}
        </button>
        <button className="icon-btn" aria-label="Keyboard shortcuts" title="Shortcuts (?)"><IconKbd /></button>
        <button className="icon-btn" aria-label="Settings" title="Settings"><IconSettings /></button>
      </div>
    </header>
  );
}

window.Shell = { Sidebar, Header, GAMES, fmtTime };
