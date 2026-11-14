import type { Player } from '../../engine';
import { BandiFigure } from './BandiFigure';
import { PlayerFigure } from './PlayerFigure';
import { TeriFigure } from './TeriFigure';

/** The portrait at a seat: 0 the player, 1 Bandi, 2 Teri; `dental` dresses them as dentist, hygienist and assistant. */
export function SeatFigure({ seat, dental, title }: { seat: Player; dental: boolean; title: string }) {
  if (seat === 0) return <PlayerFigure dental={dental} title={title} />;
  if (seat === 1) return <BandiFigure dental={dental} title={title} />;
  return <TeriFigure dental={dental} title={title} />;
}

export default SeatFigure;
