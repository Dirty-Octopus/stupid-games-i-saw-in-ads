import { key, type Cell, type Direction, type Level } from './core/types';

const line = (x1: number, y1: number, x2: number, y2: number): Cell[] => {
  const result: Cell[] = [];
  const dx = Math.sign(x2 - x1), dy = Math.sign(y2 - y1);
  for (let x = x1, y = y1; ; x += dx, y += dy) { result.push({ x, y }); if (x === x2 && y === y2) break; }
  return result;
};
const unique = (cells: Cell[]) => [...new Map(cells.map((cell) => [key(cell), cell])).values()];
const repeat = (direction: Direction, count: number) => Array<Direction>(count).fill(direction);
const level = (input: Omit<Level, 'id' | 'version'>, index: number): Level => {
  const terrain = unique(input.terrain);
  const used = new Set([...terrain, ...input.snake, input.exit].map(key));
  return { ...input, id: `gravity-snake-${index}`, version: index === 10 ? 2 : 1, terrain, apples: unique(input.apples).filter((p) => !used.has(key(p))) };
};

const mainTerrain = [
  ...line(1, 2, 3, 2), ...line(3, 2, 3, 12), ...line(3, 12, 8, 12),
  ...line(10, 12, 15, 12), ...line(15, 2, 15, 12), ...line(15, 2, 18, 2),
  ...Array.from({ length: 9 }, (_, i) => ({ x: 6 + i, y: 2 + i })),
];
const mainApples: Cell[] = [
  ...line(6, 1, 18, 1), ...line(1, 3, 1, 13), ...line(3, 13, 8, 13),
  ...line(10, 13, 18, 13), ...line(6, 3, 6, 11), { x: 5, y: 3 }, { x: 5, y: 2 }, { x: 5, y: 1 },
];
for (let x = 7; x <= 14; x++) for (let y = 2; y <= x - 4; y++) mainApples.push({ x, y });
for (let x = 16; x <= 18; x++) for (let y = 3; y <= 12; y++) mainApples.push({ x, y });

export const levels: Level[] = [
  level({ name: '就是广告里那个', hint: '蛇身只要有一格受到地块支撑，就不会下落。', width: 20, height: 15,
    terrain: mainTerrain, apples: mainApples, snake: [{ x: 5, y: 11 }, { x: 4, y: 11 }], exit: { x: 1, y: 1 },
    solution: ['right', ...repeat('up', 8), 'left', 'up', 'up', ...repeat('left', 4)],
  }, 1),
  level({ name: '够长就过去了', hint: '跨越缺口时，可以让尾部留在原来的平台上。', width: 12, height: 10,
    terrain: [...line(1, 8, 4, 8), ...line(8, 8, 10, 8)], apples: line(4, 7, 7, 7),
    snake: [{ x: 3, y: 7 }, { x: 2, y: 7 }], exit: { x: 10, y: 7 }, solution: repeat('right', 7),
  }, 2),
  level({ name: '往上长', hint: '向上移动时，仍然需要身体下方有地块支撑。', width: 12, height: 12,
    terrain: [...line(2, 10, 8, 10), ...line(7, 5, 10, 5)], apples: [...line(3, 4, 3, 8), ...line(4, 4, 6, 4)],
    snake: [{ x: 3, y: 9 }, { x: 2, y: 9 }], exit: { x: 9, y: 4 }, solution: [...repeat('up', 5), ...repeat('right', 6)],
  }, 3),
  level({ name: '借个落点', hint: '离开上层平台后，整条蛇会一起落向下方的平台。', width: 14, height: 12,
    terrain: [...line(1, 4, 4, 4), ...line(6, 9, 12, 9)], apples: [...line(4, 3, 8, 3), { x: 8, y: 5 }, { x: 9, y: 6 }],
    snake: [{ x: 3, y: 3 }, { x: 2, y: 3 }], exit: { x: 11, y: 8 }, solution: repeat('right', 8),
  }, 4),
  level({ name: '尾巴也能吃', hint: '苹果接触到尾部时，可获得基础分的 3 倍。', width: 14, height: 10,
    terrain: [...line(1, 4, 4, 4), ...line(4, 8, 11, 8)], apples: [{ x: 5, y: 5 }, { x: 6, y: 6 }, { x: 8, y: 7 }, { x: 9, y: 7 }],
    snake: [{ x: 5, y: 3 }, { x: 4, y: 3 }], exit: { x: 11, y: 7 }, solution: repeat('right', 6),
  }, 5),
  level({ name: '绕一下', hint: '被挡住时可以绕行；四个方向都被堵住则失败。', width: 14, height: 12,
    terrain: [...line(1, 10, 12, 10), { x: 7, y: 9 }], apples: [{ x: 4, y: 9 }, { x: 4, y: 8 }, { x: 4, y: 7 }, { x: 5, y: 7 }, { x: 6, y: 7 }],
    snake: [{ x: 3, y: 9 }, { x: 2, y: 9 }], exit: { x: 11, y: 9 }, solution: [...repeat('right', 3), 'up', ...repeat('right', 5)],
  }, 6),
  level({ name: '再长一点', hint: '身体长度需要足以跨过平台之间的缺口。', width: 17, height: 12,
    terrain: [...line(1, 9, 5, 9), ...line(10, 9, 15, 9), ...line(7, 5, 9, 5)], apples: [...line(4, 8, 9, 8), ...line(7, 4, 9, 4)],
    snake: [{ x: 3, y: 8 }, { x: 2, y: 8 }], exit: { x: 15, y: 8 }, solution: repeat('right', 12),
  }, 7),
  level({ name: '接住这一串', hint: '下落中获得的身体会叠在尾格，落地后寻找空位展开。', width: 16, height: 13,
    terrain: [...line(1, 4, 4, 4), ...line(5, 11, 13, 11)], apples: [...line(5, 5, 5, 9), ...line(6, 10, 10, 10)],
    snake: [{ x: 4, y: 3 }, { x: 3, y: 3 }], exit: { x: 13, y: 10 }, solution: repeat('right', 9),
  }, 8),
  level({ name: '最后一口', hint: '出口在右侧，沿途的苹果可以自行选择是否收集。', width: 18, height: 11,
    terrain: [...line(1, 9, 5, 9), ...line(11, 9, 16, 9), { x: 14, y: 8 }], apples: [...line(4, 8, 10, 8), { x: 12, y: 7 }, { x: 13, y: 6 }],
    snake: [{ x: 3, y: 8 }, { x: 2, y: 8 }], exit: { x: 16, y: 8 }, solution: [...repeat('right', 10), 'up', ...repeat('right', 3), 'down'],
  }, 9),
  level({ name: '后面有东西', hint: '', width: 92, height: 14,
    terrain: [
      ...line(1, 11, 23, 11), ...line(28, 11, 46, 11), ...line(51, 11, 69, 11), ...line(74, 11, 90, 11),
      { x: 18, y: 10 }, { x: 41, y: 10 }, { x: 64, y: 10 },
    ],
    apples: [4, 9, 14, 21, 33, 39, 44, 57, 63].map((x) => ({ x, y: 10 })),
    snake: [{ x: 3, y: 10 }, { x: 2, y: 10 }], exit: { x: 89, y: 10 }, chase: { intervalMs: 5000, biteSize: 3 },
    solution: [
      ...repeat('right', 14), 'up', 'right', 'right', 'down',
      ...repeat('right', 21), 'up', 'right', 'right', 'down',
      ...repeat('right', 21), 'up', 'right', 'right', 'down', ...repeat('right', 24),
    ],
  }, 10),
];
