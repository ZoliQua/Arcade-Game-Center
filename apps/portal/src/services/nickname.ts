const KEY = 'arcade.nickname';
const MIN = 1;
const MAX = 32;

export function getNickname(): string | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const trimmed = raw.trim();
    return trimmed.length >= MIN && trimmed.length <= MAX ? trimmed : null;
  } catch {
    return null;
  }
}

export function setNickname(nick: string): string | null {
  const cleaned = sanitizeNickname(nick);
  if (cleaned === null) return null;
  try {
    localStorage.setItem(KEY, cleaned);
  } catch {
    /* ignore quota / private mode errors */
  }
  return cleaned;
}

export function sanitizeNickname(nick: string): string | null {
  const trimmed = nick.trim();
  if (trimmed.length < MIN || trimmed.length > MAX) return null;
  return trimmed;
}

export const nicknameLimits = { min: MIN, max: MAX };
