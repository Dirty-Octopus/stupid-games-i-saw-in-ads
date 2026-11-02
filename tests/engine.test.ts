import test from 'node:test';
import assert from 'node:assert/strict';
import { bite, createState, isSupported, step, validateLevel } from '../src/games/gravity-snake/core/engine';
import { findTailPath } from '../src/games/gravity-snake/core/tail-path';
import { equal, key, type Cell, type Level } from '../src/games/gravity-snake/core/types';
import { levels } from '../src/games/gravity-snake/levels';
import { credits, personalFacts } from '../src/credits/credits-data';
import { noStorageServices } from '../src/services/game-services';

const base: Level = {
  id: 'test', version: 1, name: 'test', hint: '', width: 12, height: 10,
  terrain: Array.from({ length: 12 }, (_, x) => ({ x, y: 8 })),
  snake: [{ x: 4, y: 7 }, { x: 3, y: 7 }], apples: [], exit: { x: 10, y: 7 }, solution: [],
};
const assertBody = (level: Level, snake: Cell[]) => {
  assert.equal(new Set(snake.map(key)).size, snake.length, 'no self overlap');
  for (let i = 1; i < snake.length; i++) assert.equal(Math.abs(snake[i].x - snake[i - 1].x) + Math.abs(snake[i].y - snake[i - 1].y), 1, 'body stays connected');
  assert.ok(!snake.some((p) => level.terrain.some((wall) => equal(p, wall))), 'no terrain overlap');
};

test('every level starts with two supported cells and valid objects', () => {
  assert.equal(levels.length, 10);
  for (const level of levels) assert.deepEqual(validateLevel(level), [], level.id);
});
test('a normal move preserves length, records action and does not mutate input', () => {
  const state = createState(base);
  const before = JSON.stringify(state);
  const result = step(base, state, 'right').state;
  assert.equal(result.snake.length, 2);
  assert.deepEqual(result.snake[0], { x: 5, y: 7 });
  assert.equal(JSON.stringify(state), before);
  assert.deepEqual(result.actions, ['right']);
});
test('head apple grows at the old tail and scores 1.5x', () => {
  const level = { ...base, apples: [{ x: 5, y: 7 }] };
  const result = step(level, createState(level), 'right').state;
  assert.equal(result.snake.length, 3);
  assert.deepEqual(result.snake[2], { x: 3, y: 7 });
  assert.equal(result.score, 15);
  assert.equal(result.collected, 1);
});
test('wall, neck and upper edge block without killing or advancing actions', () => {
  const level = { ...base, terrain: [...base.terrain, { x: 5, y: 7 }] };
  const state = createState(level);
  assert.equal(step(level, state, 'right').state, state);
  assert.equal(step(level, state, 'left').state, state);
  const high = { ...state, snake: [{ x: 4, y: 0 }, { x: 3, y: 0 }] };
  assert.equal(step(level, high, 'up').state, high);
});
test('one supported segment supports the entire snake; apples and body never support', () => {
  const level = { ...base, terrain: [{ x: 3, y: 8 }], apples: [{ x: 4, y: 8 }] };
  assert.equal(isSupported(level, level.snake), true);
  assert.equal(isSupported({ ...level, terrain: [] }, level.snake), false);
});
test('loss of all support falls rigidly and lands without crossing terrain', () => {
  const level = { ...base, terrain: [...base.terrain, { x: 3, y: 4 }], snake: [{ x: 4, y: 3 }, { x: 3, y: 3 }] };
  const result = step(level, createState(level), 'right');
  assert.deepEqual(result.state.snake, [{ x: 5, y: 7 }, { x: 4, y: 7 }]);
  assert.equal(result.frames.filter((f) => f.events.includes('fall')).length, 1);
  assert.equal(result.frames.filter((f) => f.events.includes('land')).length, 1);
  for (const frame of result.frames) assertBody(level, frame.state.snake);
});
test('falling tail scores 3x and shows a stack before landing expansion', () => {
  const level = { ...base, terrain: [...base.terrain, { x: 3, y: 4 }], snake: [{ x: 4, y: 3 }, { x: 3, y: 3 }], apples: [{ x: 4, y: 5 }] };
  const result = step(level, createState(level), 'right');
  assert.equal(result.state.score, 30);
  assert.equal(result.state.snake.length, 3);
  assert.ok(result.frames.some((f) => f.state.pendingGrowth === 1 && f.state.snake.at(-1)?.y === 5));
  assert.ok(result.frames.some((f) => f.events.includes('expand')));
  assertBody(level, result.state.snake);
});
test('falling head and intermediate body have distinct multipliers', () => {
  const level = { ...base, terrain: [...base.terrain, { x: 2, y: 4 }], snake: [{ x: 4, y: 3 }, { x: 3, y: 3 }, { x: 2, y: 3 }], apples: [{ x: 5, y: 5 }, { x: 4, y: 5 }] };
  const result = step(level, createState(level), 'right').state;
  assert.equal(result.collected, 2);
  assert.equal(result.score, 25);
  assert.equal(result.snake.length + result.pendingGrowth, 5);
  assertBody(level, result.snake);
});
test('15 falling apples show 16 in the tail stack and preserve total growth', () => {
  const level = { ...base, height: 24, snake: [{ x: 4, y: 1 }, { x: 3, y: 1 }], terrain: [{ x: 3, y: 2 }, ...Array.from({ length: 12 }, (_, x) => ({ x, y: 21 }))], apples: Array.from({ length: 15 }, (_, i) => ({ x: 4, y: 3 + i })) };
  const result = step(level, createState(level), 'right');
  assert.ok(result.frames.some((f) => f.state.pendingGrowth + 1 === 16));
  assert.equal(result.state.collected, 15);
  assert.equal(result.state.snake.length + result.state.pendingGrowth, 17);
  assertBody(level, result.state.snake);
});
test('no floor causes death, apples cannot create an invisible floor', () => {
  const level = { ...base, terrain: [{ x: 3, y: 8 }], apples: [{ x: 4, y: 8 }, { x: 5, y: 8 }] };
  const result = step(level, createState(level), 'right').state;
  assert.equal(result.status, 'dead');
  assert.equal(result.deathCause, 'fall');
});
test('optional apples do not prevent reaching the exit; terminal states ignore input', () => {
  const level = { ...base, exit: { x: 5, y: 7 }, apples: [{ x: 0, y: 0 }] };
  const result = step(level, createState(level), 'right').state;
  assert.equal(result.status, 'won');
  assert.equal(result.apples.length, 1);
  assert.equal(step(level, result, 'up').state, result);
});
test('monster removes three real tail cells and can remove supporting tail', () => {
  const level = { ...base, chase: { intervalMs: 5000, biteSize: 3 } };
  const state = { ...createState(level), snake: Array.from({ length: 6 }, (_, i) => ({ x: 7 - i, y: 7 })) };
  const result = bite(level, state).state;
  assert.equal(result.snake.length, 3);
  assert.deepEqual(result.snake[0], state.snake[0]);
  assert.equal(result.status, 'playing');
});
test('monster consumes stacked tail first; fewer than two cells is death', () => {
  const level = { ...base, chase: { intervalMs: 5000, biteSize: 3 } };
  const state = { ...createState(level), pendingGrowth: 4 };
  assert.equal(bite(level, state).state.snake.length + bite(level, state).state.pendingGrowth, 3);
  assert.equal(bite(level, createState(level)).state.deathCause, 'monster');
});
test('tail A* finds a legal minimum-cost route and retains growth if trapped', () => {
  const route = findTailPath(base, base.snake, [], 3, 100000);
  assert.equal(route.cells.length, 3);
  assert.equal(route.optimal, true);
  assertBody(base, [...base.snake, ...route.cells]);
  const trapped = { ...base, terrain: [...base.terrain, { x: 2, y: 7 }, { x: 3, y: 6 }] };
  assert.equal(findTailPath(trapped, trapped.snake, [], 5).cells.length, 0);
});
test('all ten authored routes preserve geometry and reach their exits', () => {
  for (const level of levels) {
    let state = createState(level);
    for (const direction of level.solution) {
      if (state.status !== 'playing') break;
      const result = step(level, state, direction);
      state = result.state;
      for (const frame of result.frames) if (frame.state.status !== 'dead') assertBody(level, frame.state.snake);

    }
    assert.equal(state.status, 'won', `${level.id}; head=${key(state.snake[0])}`);
  }
});
test('credits contain 300+ roles, coding first, and only supplied personal facts', () => {
  assert.ok(credits.length >= 300);
  assert.equal(credits[0].name, 'ChatGPT');
  const firstAndy = credits.findIndex((credit) => credit.name === 'Andy Yu');
  assert.ok(credits.slice(firstAndy).every((credit) => credit.name === 'Andy Yu'));
  for (const fact of personalFacts) assert.ok(credits.some((credit) => credit.role === fact && credit.name === 'Andy Yu'));
});
test('default backend adapter explicitly disables persistence', async () => {
  assert.deepEqual(noStorageServices.capabilities, { scores: false, leaderboard: false, progress: false });
  assert.deepEqual(await noStorageServices.loadProgress('gravity-snake'), { status: 'disabled' });
  assert.deepEqual(await noStorageServices.getLeaderboard('gravity-snake', '1'), { status: 'disabled' });
});

test('varied action sequences preserve body geometry and growth accounting', () => {
  const directions = ['up', 'right', 'down', 'left'] as const;
  let seed = 27491;
  const random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed; };
  for (const level of levels) {
    let state = createState(level);
    let eatenByMonster = 0;
    for (let i = 0; i < 180 && state.status === 'playing'; i++) {
      const result = level.chase && i > 0 && i % 20 === 0 ? bite(level, state) : step(level, state, directions[(random() >>> 16) % 4]);
      if (level.chase && i > 0 && i % 20 === 0) eatenByMonster += level.chase.biteSize;
      for (const frame of result.frames) if (frame.state.status !== 'dead') {
        assertBody(level, frame.state.snake);
        assert.equal(frame.state.snake.length + frame.state.pendingGrowth, 2 + frame.state.collected - eatenByMonster);
      }
      state = result.state;
    }
  }
});
