import { useState } from 'react';
import { formatNumber, useLang, useMessages } from '@arcade/kit';
import { PORTAL_MESSAGES } from './i18n';
import { nicknameLimits, setNickname } from './services/nickname';

type Props = {
  /** Set when a ranked run just ended without a nickname: the prompt offers to put this score on the board. */
  score?: number;
  onSet: (nick: string) => void;
  onSkip: () => void;
};

export function NicknamePrompt({ score, onSet, onSkip }: Props) {
  const t = useMessages(PORTAL_MESSAGES);
  const [lang] = useLang();
  const forScore = score !== undefined;
  const [draft, setDraft] = useState('');
  const valid = draft.trim().length >= nicknameLimits.min && draft.trim().length <= nicknameLimits.max;

  const submit = () => {
    if (!valid) return;
    const cleaned = setNickname(draft);
    if (cleaned !== null) onSet(cleaned);
  };

  return (
    <div className="portal-dialog" role="dialog" aria-modal="true" aria-labelledby="nick-title">
      <form
        className="arc-panel portal-dialog__card"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <div>
          <h2 id="nick-title">
            {forScore ? t('nickScoreTitle', { score: formatNumber(score, lang) }) : t('nickTitle')}
          </h2>
          <p>{forScore ? t('nickScoreBody') : t('nickBody')}</p>
        </div>

        <input
          autoFocus
          className="portal-input"
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          maxLength={nicknameLimits.max}
          placeholder={t('nickChars', { min: nicknameLimits.min, max: nicknameLimits.max })}
          aria-label={t('nickname')}
        />

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button type="button" className="arc-btn arc-btn--ghost" onClick={onSkip}>
            {forScore ? t('notNow') : t('playAnonymously')}
          </button>
          <button type="submit" className="arc-btn arc-btn--primary" disabled={!valid}>
            {t('save')}
          </button>
        </div>
      </form>
    </div>
  );
}
