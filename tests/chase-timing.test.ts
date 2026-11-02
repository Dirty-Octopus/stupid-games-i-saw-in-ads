import test from 'node:test';
import assert from 'node:assert/strict';
import { levels } from '../src/games/gravity-snake/levels';
import { simulateRoute } from '../scripts/simulate-route';

test('sparse chase has nine apples and remains winnable with real timed bites', () => {
  const level = levels[9];
  assert.equal(level.apples.length, 9);
  assert.equal(level.version, 2);
  for (const interval of [145, 160, 180, 190]) {
    const result = simulateRoute(level, interval);
    assert.equal(result.state.status, 'won', `${interval}ms input interval`);
    assert.equal(result.state.collected, 9);
    assert.ok(result.bites >= 2);
    assert.equal(result.state.snake.length + result.state.pendingGrowth, 11 - result.bites * 3);
  }
});
test('slow chase play now loses support after a timed bite instead of having surplus length', () => {
  const result = simulateRoute(levels[9], 250);
  assert.equal(result.state.status, 'dead');
  assert.equal(result.state.deathCause, 'fall');
  assert.ok(result.bites > 0);
});
