// TEMPORARY — stands in for @arcade/snapszer until the real game lands (Task 24 replaces this file).
import { gameName, useLang, useMessages } from '@arcade/kit';
import { IconSnapszer } from '@arcade/ui';
import { PORTAL_MESSAGES } from './i18n';

/** TEMPORARY: a "coming soon" panel in place of the Snapszer game. Never reports a score. */
export function SnapszerPlaceholderGame() {
  const [lang] = useLang();
  const t = useMessages(PORTAL_MESSAGES);
  return (
    <div className="arc-panel coming-soon">
      <span className="coming-soon__icon" aria-hidden="true">
        <IconSnapszer size={48} />
      </span>
      <h2>{t('comingSoon')}</h2>
      <p>{t('comingSoonBody', { name: gameName('snapszer', lang) })}</p>
    </div>
  );
}

/** TEMPORARY: a still card fan for the landing-page preview. */
export function SnapszerPlaceholderDemo() {
  return (
    <div className="coming-soon coming-soon--demo" aria-hidden="true">
      <IconSnapszer size={64} />
    </div>
  );
}
