import type { ComponentType } from 'react';
import { ARCADE_GAMES, type ArcadeGameId, type ArcadeGameInfo } from '@arcade/kit';
import {
  Icon2048,
  IconBreakout,
  IconConnectFour,
  IconGomoku,
  IconInvaders,
  IconNutSort,
  IconPacman,
  IconSnake,
  IconTetris,
  IconTicTacToe,
} from './Icons';

type IconCmp = ComponentType<{ size?: number; color?: string }>;

export const GAME_ICONS: Record<ArcadeGameId, IconCmp> = {
  tetris: IconTetris,
  snake: IconSnake,
  '2048': Icon2048,
  pacman: IconPacman,
  gomoku: IconGomoku,
  tictactoe: IconTicTacToe,
  breakout: IconBreakout,
  invaders: IconInvaders,
  connect4: IconConnectFour,
  nutsort: IconNutSort,
};

export type PortalGame = ArcadeGameInfo & { Icon: IconCmp; color: string };

/** Registry entries enriched with portal icons and colour values. */
export const GAMES: PortalGame[] = ARCADE_GAMES.map((g) => ({
  ...g,
  Icon: GAME_ICONS[g.id],
  color: `var(${g.colorVar})`,
}));

export const APP_VERSION = '2.2';

