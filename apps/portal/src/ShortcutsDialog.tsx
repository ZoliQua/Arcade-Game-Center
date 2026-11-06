import { useEffect, useRef } from 'react';
import { gameName, KeyHelp, useLang, useMessages, type ArcadeGameId } from '@arcade/kit';
import { PORTAL_MESSAGES } from './i18n';

export function ShortcutsDialog({ gameId, onClose }: { gameId: ArcadeGameId | null; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const [lang] = useLang();
  const t = useMessages(PORTAL_MESSAGES);
  const globalKeys: [string, string][] = [
    ['T', t('keyTheme')],
    ['?', t('keyHelp')],
  ];
  const gameKeys: [string, string][] = [
    ['P Esc', t('keyPause')],
    ['R', t('keyRestart')],
    [`${t('keySpace')} Enter`, t('keyStart')],
  ];

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="portal-dialog" role="dialog" aria-modal="true" aria-label={t('shortcutsTitle')} onClick={onClose}>
      <div className="arc-panel portal-dialog__card" onClick={(e) => e.stopPropagation()}>
        <h2>{t('shortcutsTitle')}</h2>
        <section>
          <h3 className="arc-panel__title">{t('everywhere')}</h3>
          <KeyHelp rows={globalKeys} />
        </section>
        <section>
          <h3 className="arc-panel__title">{t('inEveryGame')}</h3>
          <KeyHelp rows={gameKeys} />
        </section>
        <p>
          {gameId
            ? t('gameKeysNote', { name: gameName(gameId, lang) })
            : t('gameKeysGeneric')}
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button ref={closeRef} type="button" className="arc-btn" onClick={onClose}>
            {t('close')}
          </button>
        </div>
      </div>
    </div>
  );
}
