import { useState, type ReactNode } from 'react';
import {
  ARCADE_GAMES,
  clearSession,
  LANG_NAMES,
  LANGS,
  resetStats,
  Tooth,
  useDental,
  useKitMessages,
  useLang,
  useMessages,
  type ArcadeTheme,
} from '@arcade/kit';
import { PORTAL_MESSAGES } from './i18n';
import { nicknameLimits, setNickname } from './services/nickname';

type SettingsProps = {
  theme: ArcadeTheme;
  setTheme: (t: ArcadeTheme) => void;
  nickname: string | null;
  onNicknameChange: (next: string | null) => void;
};

export function Settings({ theme, setTheme, nickname, onNicknameChange }: SettingsProps) {
  const t = useMessages(PORTAL_MESSAGES);
  const kit = useKitMessages();
  const [lang, setLang] = useLang();
  const [dental, setDental] = useDental();
  const [draft, setDraft] = useState(nickname ?? '');
  const [savedFlash, setSavedFlash] = useState(false);

  const draftIsValid =
    draft.trim().length >= nicknameLimits.min && draft.trim().length <= nicknameLimits.max;
  const changed = draft.trim() !== (nickname ?? '');

  const saveNick = () => {
    const cleaned = setNickname(draft);
    if (cleaned === null) return;
    onNicknameChange(cleaned);
    setDraft(cleaned);
    setSavedFlash(true);
    window.setTimeout(() => setSavedFlash(false), 1200);
  };

  return (
    <div>
      <div className="section-head">
        <h2>{t('titleSettings')}</h2>
        <span>{t('storedLocally')}</span>
      </div>
      <div className="arc-panel" style={{ display: 'grid', gap: 14, maxWidth: 620 }}>
        <Row label={t('nickname')} hint={t('nicknameHint', { min: nicknameLimits.min, max: nicknameLimits.max })}>
          <form
            style={{ display: 'flex', gap: 8, flex: 1 }}
            onSubmit={(e) => {
              e.preventDefault();
              if (draftIsValid && changed) saveNick();
            }}
          >
            <input
              className="portal-input"
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              maxLength={nicknameLimits.max}
              placeholder={t('nicknamePlaceholder')}
              aria-label={t('nickname')}
            />
            <button type="submit" className={`arc-btn ${draftIsValid && changed ? 'arc-btn--primary' : ''}`} disabled={!draftIsValid || !changed}>
              {savedFlash ? t('saved') : t('save')}
            </button>
          </form>
        </Row>

        <Row label={kit('language')} hint={t('languageHint')}>
          <div className="arc-segmented" role="group" aria-label={kit('language')}>
            {LANGS.map((l) => (
              <button key={l} type="button" lang={l} aria-pressed={lang === l} onClick={() => setLang(l)}>
                {LANG_NAMES[l]}
              </button>
            ))}
          </div>
        </Row>

        <Row label={kit('dental')} hint={kit('dentalDesc')}>
          <button
            type="button"
            role="switch"
            aria-checked={dental}
            aria-label={kit('dental')}
            className={`arc-dental-toggle${dental ? ' arc-dental-toggle--on' : ''}`}
            onClick={() => setDental(!dental)}
          >
            <span className="arc-dental-toggle__icon" aria-hidden="true">
              <Tooth size={18} />
              {dental && (
                <svg className="arc-dental-toggle__check" width="10" height="10" viewBox="0 0 10 10">
                  <path d="M1.5 5.2 4 7.6 8.6 2.4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </span>
            <span>{dental ? t('on') : t('off')}</span>
          </button>
        </Row>

        <Row label={t('theme')} hint={t('themeHint')}>
          <div className="arc-segmented" role="group" aria-label={t('theme')}>
            {(['dark', 'light'] as const).map((mode) => (
              <button key={mode} type="button" aria-pressed={theme === mode} onClick={() => setTheme(mode)}>
                {t(mode)}
              </button>
            ))}
          </div>
        </Row>

        <Row label={t('savedGames')} hint={t('savedGamesHint')}>
          <ConfirmButton
            label={t('deleteSaves')}
            confirmLabel={t('deleteSavesConfirm')}
            onConfirm={() => ARCADE_GAMES.forEach((g) => clearSession(g.id))}
          />
        </Row>

        <Row label={t('statistics')} hint={t('statisticsHint')}>
          <ConfirmButton label={t('resetStats')} confirmLabel={t('resetStatsConfirm')} onConfirm={() => resetStats()} />
        </Row>
      </div>
    </div>
  );
}

/** Two-step destructive button: first click arms it, second confirms. */
function ConfirmButton({ label, confirmLabel, onConfirm }: { label: string; confirmLabel: string; onConfirm: () => void }) {
  const t = useMessages(PORTAL_MESSAGES);
  const [armed, setArmed] = useState(false);
  const [done, setDone] = useState(false);
  if (done) return <span style={{ color: 'var(--text-mute)', fontSize: 13 }}>{t('done')}</span>;
  return (
    <>
      <button
        type="button"
        className="arc-btn arc-btn--danger"
        onClick={() => {
          if (!armed) {
            setArmed(true);
            return;
          }
          onConfirm();
          setDone(true);
        }}
      >
        {armed ? confirmLabel : label}
      </button>
      {armed && (
        <button type="button" className="arc-btn arc-btn--ghost" onClick={() => setArmed(false)}>
          {t('cancel')}
        </button>
      )}
    </>
  );
}

function Row({ label, hint, children }: { label: string; hint: string; children: ReactNode }) {
  return (
    <div className="settings-row">
      <div>
        <div className="settings-row__label">{label}</div>
        <div className="settings-row__hint">{hint}</div>
      </div>
      <div className="settings-row__control">{children}</div>
    </div>
  );
}
