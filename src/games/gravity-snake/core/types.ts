export interface Cell { x: number; y: number; }
export type Direction = 'up' | 'right' | 'down' | 'left';
export type MealPart = 'head' | 'body' | 'tail';
export interface Level {
  id: string;
  version: number;
  name: string;
  hint: string;
  width: number;
  height: number;
  terrain: Cell[];
  snake: Cell[];
  apples: Cell[];
  exit: Cell;
  chase?: { intervalMs: number; biteSize: number };
  solution: Direction[];
}
export interface GameState {
  snake: Cell[];
  apples: Cell[];
  pendingGrowth: number;
  score: number;
  collected: number;
  moves: number;
  actions: string[];
  status: 'playing' | 'won' | 'dead';
  deathCause?: 'fall' | 'monster' | 'trapped';
  lastMeal?: { part: MealPart; points: number; cell: Cell };
}
export type GameEvent = 'move' | 'blocked' | 'eat' | 'fall' | 'land' | 'expand' | 'die' | 'win' | 'bite';
export interface Frame { state: GameState; events: GameEvent[]; }
export interface Transition { state: GameState; frames: Frame[]; }
export const directions: Record<Direction, Cell> = {
  up: { x: 0, y: -1 }, right: { x: 1, y: 0 }, down: { x: 0, y: 1 }, left: { x: -1, y: 0 },
};
export const key = (cell: Cell) => `${cell.x},${cell.y}`;
export const equal = (a: Cell, b: Cell) => a.x === b.x && a.y === b.y;
export const add = (a: Cell, b: Cell): Cell => ({ x: a.x + b.x, y: a.y + b.y });
export const rulesVersion = 'gravity-snake-2';
