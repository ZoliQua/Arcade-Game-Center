import type { HSuit } from '../cards';
import { P, type Costume } from './parts';

/** Each suit dresses its Alsó, Felső and Király in its own colours. */
export const COSTUME: Record<HSuit, Costume> = {
  piros: { main: P.brick, trim: P.ochreLight, hose: P.olive, hat: P.brown, feather: P.linen },
  tok: { main: P.ochre, trim: P.brickDark, hose: P.brick, hat: P.oliveDark, feather: P.brick },
  zold: { main: P.olive, trim: P.ochreLight, hose: P.brickDark, hat: P.brick, feather: P.ochreLight },
  makk: { main: P.brownLight, trim: P.olive, hose: P.brick, hat: P.brown, feather: P.ochre },
};
