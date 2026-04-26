import { useMemo } from 'react';
import type { Position } from '../logic/types';
import styles from './GameBoard.module.css';

type Props = {
  gridSize: number;
  snake: Position[];
  food: Position;
};

type CellKind = 'empty' | 'head' | 'body' | 'food';

export function GameBoard({ gridSize, snake, food }: Props) {
  const cells = useMemo(() => {
    const grid: CellKind[][] = Array.from({ length: gridSize }, () =>
      Array.from({ length: gridSize }, () => 'empty' as CellKind),
    );

    snake.forEach((segment, index) => {
      if (segment.y < 0 || segment.y >= gridSize) return;
      if (segment.x < 0 || segment.x >= gridSize) return;
      grid[segment.y][segment.x] = index === 0 ? 'head' : 'body';
    });

    if (food.y >= 0 && food.y < gridSize && food.x >= 0 && food.x < gridSize) {
      if (grid[food.y][food.x] === 'empty') {
        grid[food.y][food.x] = 'food';
      }
    }

    return grid;
  }, [gridSize, snake, food]);

  return (
    <div
      className={styles.board}
      style={{
        gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
        gridTemplateRows: `repeat(${gridSize}, 1fr)`,
      }}
      role="grid"
      aria-label="Snake game board"
    >
      {cells.flatMap((row, y) =>
        row.map((kind, x) => (
          <div
            key={`${x}-${y}`}
            className={`${styles.cell} ${styles[kind]}`}
            role="gridcell"
          />
        )),
      )}
    </div>
  );
}
