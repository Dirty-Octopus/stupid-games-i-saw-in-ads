import { bite, createState, step } from '../src/games/gravity-snake/core/engine';
import type { Level } from '../src/games/gravity-snake/core/types';

/** Includes the visual frame delays used by useGame; time advances through bite feedback too. */
export function simulateRoute(level: Level, inputIntervalMs = 180) {
  let state = createState(level), elapsedMs = 0, bites = 0;
  let nextBite = level.chase?.intervalMs ?? Infinity;
  for (const direction of level.solution) {
    if (state.status !== 'playing') break;
    const transition = step(level, state, direction);
    state = transition.state;
    elapsedMs += transition.frames.slice(0, -1).reduce((sum, frame) =>
      sum + (frame.events.includes('move') ? 105 : frame.events.includes('land') ? 90 : 65), 0) + Math.max(100, inputIntervalMs);
    while (elapsedMs >= nextBite && state.status === 'playing') {
      state = bite(level, state).state;
      nextBite += level.chase!.intervalMs;
      bites++;
      elapsedMs += 100;
    }
  }
  return { state, elapsedMs, bites };
}
