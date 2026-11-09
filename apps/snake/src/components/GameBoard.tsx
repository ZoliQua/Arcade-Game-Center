import { memo, useMemo, type ReactNode } from 'react';
import { PasteDrop, SmileTooth, Tooth } from '../arcade';
import type { Direction, Position } from '../logic/types';
import styles from './GameBoard.module.css';

type Props = {
  gridSize: number;
  snake: Position[];
  food: Position;
  /** `mini` renders the compact landing-page variant without ARIA grid roles. */
  variant?: 'full' | 'mini';
  /** Accessible name of the full board. */
  label?: string;
  /** Travel direction; turns the dental-mode head tooth. */
  direction?: Direction;
  /** Dental mode: smiling tooth head, tooth body, toothpaste-drop food. Presentation only. */
  dental?: boolean;
};

type CellKind = 'empty' | 'head' | 'body' | 'food';

/**
 * The head tooth always stays upright so its face reads correctly: it is never
 * rotated, only mirrored horizontally while the snake heads left.
 */
const headTransform = (direction: Direction) => (direction === 'LEFT' ? 'scaleX(-1) scale(1.18)' : 'scale(1.18)');

function DentalArt({ kind, direction }: { kind: CellKind; direction: Direction }): ReactNode {
  if (kind === 'head') {
    return (
      <SmileTooth
        size="100%"
        className={styles.art}
        style={{ transform: headTransform(direction) }}
      />
    );
  }
  if (kind === 'body') return <Tooth size="100%" className={styles.art} />;
  if (kind === 'food') return <PasteDrop size="100%" className={`${styles.art} ${styles.foodArt}`} />;
  return null;
}

const DENTAL_TEST_ID: Partial<Record<CellKind, string>> = {
  head: 'snake-head-tooth',
  body: 'snake-body-tooth',
  food: 'snake-food-paste',
};

export const GameBoard = memo(function GameBoard({
  gridSize,
  snake,
  food,
  variant = 'full',
  label = 'Snake game board',
  direction = 'RIGHT',
  dental = false,
}: Props) {
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

  const mini = variant === 'mini';

  return (
    <div
      className={`${styles.board} ${mini ? styles.mini : ''}`}
      style={{
        gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
        gridTemplateRows: `repeat(${gridSize}, 1fr)`,
      }}
      role={mini ? undefined : 'grid'}
      aria-label={mini ? undefined : label}
      aria-hidden={mini ? true : undefined}
      data-dental={dental}
    >
      {cells.flatMap((row, y) =>
        row.map((kind, x) =>
          dental && kind !== 'empty' ? (
            <div
              key={`${x}-${y}`}
              className={`${styles.cell} ${styles[kind]} ${styles.dentalCell}`}
              role={mini ? undefined : 'gridcell'}
              data-testid={DENTAL_TEST_ID[kind]}
              data-direction={kind === 'head' ? direction : undefined}
            >
              <DentalArt kind={kind} direction={direction} />
            </div>
          ) : (
            <div
              key={`${x}-${y}`}
              className={`${styles.cell} ${styles[kind]}`}
              role={mini ? undefined : 'gridcell'}
            />
          ),
        ),
      )}
    </div>
  );
});
