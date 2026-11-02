import type { GameEvent } from '../games/gravity-snake/core/types';
/** Shared by live playback and the frame-accurate sound-design reference exporter. */
export function frameHoldMs(events: readonly GameEvent[], last = false) {
  if (last) return 100;
  return events.includes('move') ? 105 : events.includes('land') ? 90 : 65;
}
