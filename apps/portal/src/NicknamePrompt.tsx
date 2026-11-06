import { useState } from 'react';
import { useMessages } from '@arcade/kit';
import { PORTAL_MESSAGES } from './i18n';
import { nicknameLimits, setNickname } from './services/nickname';

type Props = {
  onSet: (nick: string) => void;
  onSkip: () => void;
};

export function NicknamePrompt({ onSet, onSkip }: Props) {
  const t = useMessages(PORTAL_MESSAGES);
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
          <h2 id="nick-title">{t('nickTitle')}</h2>
          <p>{t('nickBody')}</p>
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
            {t('playAnonymously')}
          </button>
          <button type="submit" className="arc-btn arc-btn--primary" disabled={!valid}>
            {t('save')}
          </button>
        </div>
      </form>
    </div>
  );
}
