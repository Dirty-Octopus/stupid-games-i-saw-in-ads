import { add, directions, equal, key, type Cell, type Level } from './types';

export interface TailPath { cells: Cell[]; cost: number; optimal: boolean; visited: number; }
interface Node { point: Cell; path: Cell[]; used: Set<string>; cost: number; estimate: number; }

class MinHeap {
  private values: Node[] = [];
  private before(a: Node, b: Node) { return a.estimate < b.estimate || (a.estimate === b.estimate && a.path.length >= b.path.length); }
  get size() { return this.values.length; }
  push(node: Node) {
    let i = this.values.push(node) - 1;
    while (i > 0) {
      const parent = (i - 1) >> 1;
      if (this.before(this.values[parent], node)) break;
      this.values[i] = this.values[parent]; i = parent;
    }
    this.values[i] = node;
  }
  pop(): Node {
    const first = this.values[0];
    const end = this.values.pop()!;
    if (this.values.length) {
      let i = 0;
      while (i * 2 + 1 < this.values.length) {
        let child = i * 2 + 1;
        if (child + 1 < this.values.length && this.before(this.values[child + 1], this.values[child])) child++;
        if (this.before(end, this.values[child])) break;
        this.values[i] = this.values[child]; i = child;
      }
      this.values[i] = end;
    }
    return first;
  }
}

// A* over simple tail paths. Costs are additive and the lower bound is admissible.
// Head-adjacent and narrow cells are expensive; apples and the exit are protected.
// A deterministic node budget keeps unusually large growth from freezing input.
export function findTailPath(level: Level, snake: Cell[], apples: Cell[], count: number, budget = 18000): TailPath {
  if (!count) return { cells: [], cost: 0, optimal: true, visited: 0 };
  const walls = new Set(level.terrain.map(key));
  const occupied = new Set(snake.map(key));
  const appleSet = new Set(apples.map(key));
  const valid = (p: Cell) => p.x >= 0 && p.x < level.width && p.y >= 0 && p.y < level.height && !walls.has(key(p)) && !occupied.has(key(p));
  const costs = new Map<string, number>();
  const head = snake[0];
  for (let y = 0; y < level.height; y++) for (let x = 0; x < level.width; x++) {
    const p = { x, y };
    if (!valid(p)) continue;
    const distance = Math.abs(x - head.x) + Math.abs(y - head.y);
    const neighbors = Object.values(directions).filter((d) => valid(add(p, d))).length;
    costs.set(key(p), 1 + (distance < 4 ? (4 - distance) * 120 : 0) + (neighbors <= 2 ? 45 : 0) + (appleSet.has(key(p)) ? 800 : 0) + (equal(p, level.exit) ? 4000 : 0));
  }
  const target = Math.min(count, costs.size);
  if (!target) return { cells: [], cost: 0, optimal: true, visited: 0 };
  const minCost = Math.min(...costs.values());
  const heap = new MinHeap();
  heap.push({ point: snake[snake.length - 1], path: [], used: new Set(), cost: 0, estimate: target * minCost });
  let visited = 0;
  let best: Node | undefined;
  while (heap.size && visited < budget) {
    const node = heap.pop(); visited++;
    if (!best || node.path.length > best.path.length || (node.path.length === best.path.length && node.cost < best.cost)) best = node;
    if (node.path.length === target) return { cells: node.path, cost: node.cost, optimal: target === count, visited };
    const previous = node.path.length > 1 ? node.path[node.path.length - 2] : node.path.length ? snake[snake.length - 1] : snake[snake.length - 2];
    for (const delta of Object.values(directions)) {
      const next = add(node.point, delta);
      const k = key(next);
      if (!valid(next) || node.used.has(k)) continue;
      const bend = previous && (node.point.x - previous.x !== delta.x || node.point.y - previous.y !== delta.y) ? 2 : 0;
      const cost = node.cost + costs.get(k)! + bend;
      const path = [...node.path, next];
      heap.push({ point: next, path, used: new Set([...node.used, k]), cost, estimate: cost + (target - path.length) * minCost });
    }
  }
  return { cells: best?.path ?? [], cost: best?.cost ?? 0, optimal: false, visited };
}
