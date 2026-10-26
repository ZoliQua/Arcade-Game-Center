import type { ComponentType } from 'react';
import type { ArcadeDemoProps, ArcadeGameId, ArcadeGameProps } from '@arcade/kit';
import { TetrisDemo, TetrisGame } from '@arcade/tetris';
import { SnakeDemo, SnakeGame } from '@arcade/snake';
import { Game2048, Game2048Demo } from '@arcade/2048';
import { PacmanDemo, PacmanGame } from '@arcade/pacman';
import { GomokuDemo, GomokuGame } from '@arcade/gomoku';
import { TicTacToeDemo, TicTacToeGame } from '@arcade/tictactoe';

export type GameModule = {
  Game: ComponentType<ArcadeGameProps>;
  Demo: ComponentType<ArcadeDemoProps>;
};

/** Every playable game and its landing-page attract-mode demo. */
export const GAME_MODULES: Record<ArcadeGameId, GameModule> = {
  tetris: { Game: TetrisGame, Demo: TetrisDemo },
  snake: { Game: SnakeGame, Demo: SnakeDemo },
  '2048': { Game: Game2048, Demo: Game2048Demo },
  pacman: { Game: PacmanGame, Demo: PacmanDemo },
  gomoku: { Game: GomokuGame, Demo: GomokuDemo },
  tictactoe: { Game: TicTacToeGame, Demo: TicTacToeDemo },
};
