import { levels } from '../src/games/gravity-snake/levels';
import { validateLevel } from '../src/games/gravity-snake/core/engine';
import { simulateRoute } from './simulate-route';

let failed = false;
for (const level of levels) {
  const errors = validateLevel(level);
  const { state, elapsedMs, bites } = simulateRoute(level);
  const passed = errors.length === 0 && state.status === 'won';
  console.log(`${passed ? 'PASS' : 'FAIL'} ${level.id}: ${level.name}; ${state.status}; apples=${state.collected}; score=${state.score}; moves=${state.moves}; bites=${bites}; simulatedMs=${elapsedMs}${errors.length ? `; errors=${errors.join(', ')}` : ''}`);
  if (!passed) failed = true;
}
if (failed) process.exitCode = 1;
