import { add, directions, equal, key, type Cell, type Direction, type Frame, type GameEvent, type GameState, type Level, type Transition } from './types';
import { findTailPath } from './tail-path';

export function createState(level: Level): GameState {
  const state: GameState = { snake: level.snake.map((p) => ({ ...p })), apples: level.apples.map((p) => ({ ...p })), pendingGrowth: 0, score: 0, collected: 0, moves: 0, actions: [], status: 'playing' };
  if (equal(state.snake[0], level.exit)) return { ...state, status: 'won' };
  return markTrapped(level, state);
}

/** The same collision predicate serves input and dead-end detection. Falling is resolved later. */
export function canMove(level: Level, state: GameState, direction: Direction): boolean {
  if (state.status !== 'playing') return false;
  const nextHead = add(state.snake[0], directions[direction]);
  const eats = state.apples.some((cell) => equal(cell, nextHead));
  const blockedBody = state.snake.slice(1, eats ? undefined : -1);
  return nextHead.x >= 0 && nextHead.x < level.width && nextHead.y >= 0
    && !(state.snake[1] && equal(nextHead, state.snake[1]))
    && !level.terrain.some((cell) => equal(cell, nextHead))
    && !blockedBody.some((cell) => equal(cell, nextHead));
}

export function hasLegalMove(level: Level, state: GameState): boolean {
  return (Object.keys(directions) as Direction[]).some((direction) => canMove(level, state, direction));
}

function markTrapped(level: Level, state: GameState): GameState {
  return state.status === 'playing' && !hasLegalMove(level, state)
    ? { ...state, status: 'dead', deathCause: 'trapped' } : state;
}

export function isSupported(level: Level, snake: Cell[]) {
  const terrain = new Set(level.terrain.map(key));
  return snake.some((p) => terrain.has(key({ x: p.x, y: p.y + 1 })));
}

function collect(state: GameState): { state: GameState; count: number } {
  let count = 0;
  let score = state.score;
  let lastMeal = state.lastMeal;
  const apples = state.apples.filter((apple) => {
    const partIndex = state.snake.findIndex((cell) => equal(cell, apple));
    if (partIndex < 0) return true;
    const part = partIndex === 0 ? 'head' : partIndex === state.snake.length - 1 ? 'tail' : 'body';
    const points = part === 'head' ? 15 : part === 'tail' ? 30 : 10;
    score += points; count++;
    lastMeal = { part, points, cell: { ...apple } };
    return false;
  });
  return { state: { ...state, apples, score, collected: state.collected + count, lastMeal }, count };
}

function resolve(level: Level, initial: GameState, frames: Frame[]): Transition {
  let state = initial;
  const record = (...events: GameEvent[]) => frames.push({ state, events });
  const finishAtExit = () => {
    if (!equal(state.snake[0], level.exit)) return false;
    state = { ...state, status: 'won' }; record('win'); return true;
  };
  if (finishAtExit()) return { state, frames };
  let falling = false;
  while (!isSupported(level, state.snake)) {
    state = { ...state, snake: state.snake.map((cell) => ({ x: cell.x, y: cell.y + 1 })) };
    const meal = collect(state);
    state = { ...meal.state, pendingGrowth: meal.state.pendingGrowth + meal.count };
    const events: GameEvent[] = falling ? [] : ['fall'];
    falling = true;
    if (meal.count) events.push('eat');
    if (state.snake.some((cell) => cell.y >= level.height)) {
      state = { ...state, status: 'dead', deathCause: 'fall' }; record(...events, 'die'); return { state, frames };
    }
    record(...events);
    if (finishAtExit()) return { state, frames };
  }
  if (falling) record('land');
  // Expanding may itself contact apples. Each pass removes apples, so this is finite.
  while (state.pendingGrowth > 0) {
    const path = findTailPath(level, state.snake, state.apples, state.pendingGrowth);
    if (!path.cells.length) break;
    state = { ...state, snake: [...state.snake, ...path.cells], pendingGrowth: state.pendingGrowth - path.cells.length };
    const meal = collect(state);
    state = { ...meal.state, pendingGrowth: meal.state.pendingGrowth + meal.count };
    record('expand', ...(meal.count ? ['eat' as const] : []));
    if (!meal.count) break;
  }
  state = markTrapped(level, state);
  if (state.status === 'dead') record('die');
  return { state, frames };
}

export function step(level: Level, previous: GameState, direction: Direction): Transition {
  if (previous.status !== 'playing') return { state: previous, frames: [] };
  const nextHead = add(previous.snake[0], directions[direction]);
  const eats = previous.apples.some((cell) => equal(cell, nextHead));
  if (!canMove(level, previous, direction)) {
    const state = markTrapped(level, previous);
    return { state, frames: [{ state, events: state.status === 'dead' ? ['die'] : ['blocked'] }] };
  }
  const snake = [nextHead, ...previous.snake.slice(0, eats ? undefined : -1)];
  let state: GameState = { ...previous, snake, moves: previous.moves + 1, actions: [...previous.actions, direction] };
  const meal = collect(state);
  state = meal.state;
  const frames: Frame[] = [{ state, events: ['move', ...(meal.count ? ['eat' as const] : [])] }];
  return resolve(level, state, frames);
}

export function bite(level: Level, previous: GameState): Transition {
  if (previous.status !== 'playing' || !level.chase) return { state: previous, frames: [] };
  const size = level.chase.biteSize;
  const fromStack = Math.min(previous.pendingGrowth, size);
  const snake = previous.snake.slice(0, Math.max(1, previous.snake.length - (size - fromStack)));
  const state: GameState = { ...previous, snake, pendingGrowth: previous.pendingGrowth - fromStack, actions: [...previous.actions, 'bite'] };
  if (snake.length + state.pendingGrowth < 2) {
    const dead: GameState = { ...state, status: 'dead', deathCause: 'monster' };
    return { state: dead, frames: [{ state: dead, events: ['bite', 'die'] }] };
  }
  return resolve(level, state, [{ state, events: ['bite'] }]);
}

export function validateLevel(level: Level): string[] {
  const problems: string[] = [];
  const terrain = new Set(level.terrain.map(key));
  const snake = new Set(level.snake.map(key));
  const apples = new Set(level.apples.map(key));
  const inside = (p: Cell) => p.x >= 0 && p.x < level.width && p.y >= 0 && p.y < level.height;
  if (terrain.size !== level.terrain.length || snake.size !== level.snake.length || apples.size !== level.apples.length) problems.push('duplicate cells');
  if (level.snake.length !== 2) problems.push('initial snake must be two cells');
  if (![...level.terrain, ...level.snake, ...level.apples, level.exit].every(inside)) problems.push('out of bounds');
  if (level.snake.some((p) => terrain.has(key(p))) || level.apples.some((p) => terrain.has(key(p)) || snake.has(key(p))) || terrain.has(key(level.exit))) problems.push('overlapping objects');
  if (!isSupported(level, level.snake)) problems.push('unsupported initial snake');
  for (let i = 1; i < level.snake.length; i++) if (Math.abs(level.snake[i].x - level.snake[i - 1].x) + Math.abs(level.snake[i].y - level.snake[i - 1].y) !== 1) problems.push('disconnected snake');
  return problems;
}
