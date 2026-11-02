import { useId } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { useLanguage } from '../../i18n/Language';
import { levelCopy } from '../../i18n/levels';
import { type GameState, type Level, type GameEvent } from './core/types';
import { SnakeEyes } from './SnakeEyes';
import { Monster } from './Monster';
import { art } from './art';

export function Board({ level, state, preview = false, compact = false, biting = false, pressure = 0, effect }: {
  level: Level; state: GameState; preview?: boolean; compact?: boolean; biting?: boolean; pressure?: number; effect?: { id: number; events: GameEvent[] };
}) {
  const { language, t } = useLanguage();
  const uid = useId().replaceAll(':', '');
  const reduced = useReducedMotion();
  const columns = level.chase ? compact ? 15 : 23 : level.width;
  // Leave enough room behind the head for the monster's full silhouette.
  const camera = level.chase ? Math.max(0, Math.min(level.width - columns, state.snake[0].x - columns * 0.6)) : 0;
  const head = state.snake[0];
  const viewHeight = level.chase ? 8 : level.height;
  const cameraY = level.chase ? Math.max(0, Math.min(level.height - viewHeight, head.y - 4)) : 0;
  const neck = state.snake[1] ?? { x: head.x - 1, y: head.y };
  const angle = Math.atan2(head.y - neck.y, head.x - neck.x) * 180 / Math.PI;
  const tail = state.snake.at(-1)!;
  const transition = reduced ? { duration: 0 } : effect?.events.includes('fall') ? { duration: 0.065, ease: 'easeIn' as const } : { type: 'spring' as const, stiffness: 560, damping: 32, mass: 0.5 };
  return <svg className={`board ${preview ? 'board-preview' : ''}`} viewBox={`-0.5 -0.5 ${columns + 1} ${viewHeight + 0.2}`} role="img"
    aria-label={t(`${level.name}，蛇长 ${state.snake.length + state.pendingGrowth} 格，已吃 ${state.collected} 个苹果，${state.score} 分`, `${levelCopy(level, language).name}, snake length ${state.snake.length + state.pendingGrowth}, ${state.collected} apples, ${state.score} points`)}>
    <defs>
      <pattern id={`${uid}-grid`} width="1" height="1" patternUnits="userSpaceOnUse"><circle cx="0.5" cy="0.5" r="0.024" className="board-grid-dot" /></pattern>
      <linearGradient id={`${uid}-depth`} x1="0" y1="0" x2="0" y2="1"><stop stopColor="#ffffff" stopOpacity="0.06" /><stop offset="1" stopColor="#142c28" stopOpacity="0.12" /></linearGradient>
      <linearGradient id={`${uid}-danger`}><stop stopColor="#b74443" stopOpacity="0.55" /><stop offset="0.42" stopColor="#b74443" stopOpacity="0" /></linearGradient>
    </defs>
    <rect x="-1" y="-1" width={columns + 2} height={viewHeight + 2} className="board-sky" />
    <rect x="-1" y="-1" width={columns + 2} height={viewHeight + 2} fill={`url(#${uid}-depth)`} />
    <motion.g animate={{ x: -camera, y: -cameraY }} transition={reduced ? { duration: 0 } : { type: 'spring', stiffness: 190, damping: 30 }}>
      <rect x="0" y="0" width={level.width} height={level.height} fill={`url(#${uid}-grid)`} />
      {level.terrain.map((cell) => <g key={`${cell.x},${cell.y}`} transform={`translate(${cell.x},${cell.y})`}>
        <rect x="0" y="0.04" width="1" height="1" rx="0.06" fill="#69412b" />
        <image href={art.block} x="-0.065" y="-0.065" width="1.13" height="1.13" />
      </g>)}
      <g transform={`translate(${level.exit.x + 0.5},${level.exit.y + 0.5})`}>
        <ellipse cy="0.45" rx="0.5" ry="0.13" fill="#15291d" opacity="0.22" />
        <image href={art.portal} x="-0.64" y="-0.64" width="1.28" height="1.28" />
      </g>
      {state.apples.map((cell) => <g key={`${cell.x},${cell.y}`} transform={`translate(${cell.x},${cell.y})`}>
        <ellipse cx="0.5" cy="0.85" rx="0.28" ry="0.07" fill="#603c2d" opacity="0.18" />
        <image href={art.apple} x="0.06" y="-0.025" width="0.88" height="0.88" />
      </g>)}
      {level.chase && !preview && <Monster tail={tail} pressure={pressure} biting={biting} eventId={effect?.id ?? 0} />}
      {state.snake.length > 1 && <motion.path animate={{ d: state.snake.map((cell, i) => `${i ? 'L' : 'M'}${cell.x + 0.5},${cell.y + 0.55}`).join(' ') }} initial={false} transition={transition} stroke="#5c9f24" strokeWidth="0.76" strokeLinejoin="round" strokeLinecap="round" fill="none" />}
      {[...state.snake].reverse().map((cell, reverseIndex) => {
        const index = state.snake.length - reverseIndex - 1;
        return <motion.g key={index} animate={{ x: cell.x, y: cell.y }} initial={false} transition={transition}>
          <motion.g animate={!reduced && effect?.events.includes('land') ? { scaleX: [1.04, 1], scaleY: [0.91, 1] } : { scaleX: 1, scaleY: 1 }} transition={{ duration: reduced ? 0 : 0.2, ease: 'easeOut' }} style={{ transformOrigin: '0.5px 0.9px' }}>
            <rect x="0.08" y="0.15" width="0.84" height="0.82" rx="0.26" fill="#426824" opacity="0.6" />
            <image href={art.body} x="-0.055" y="-0.055" width="1.11" height="1.11" />
            {index === 0 && <SnakeEyes angle={angle} />}
          </motion.g>
        </motion.g>;
      })}
      {!preview && !reduced && effect?.events.includes('eat') && <motion.g key={`meal-${effect.id}`} initial={{ opacity: 1, y: 0 }} animate={{ opacity: 0, y: -0.8 }} transition={{ duration: 0.55 }}>
        <text x={state.lastMeal?.cell.x !== undefined ? state.lastMeal.cell.x + 0.5 : head.x + 0.5} y={(state.lastMeal?.cell.y ?? head.y) - 0.25} textAnchor="middle" fontSize="0.48" fontWeight="900" className="board-points">+{state.lastMeal?.points}</text>
      </motion.g>}
      {state.pendingGrowth > 0 && <g transform={`translate(${tail.x + 0.5},${tail.y + 0.45})`}><rect x="-0.4" y="-0.29" width="0.8" height="0.58" rx="0.18" fill="#26352a" /><text y="0.11" textAnchor="middle" fontSize="0.42" fontWeight="900" fill="#f2f8e7">{state.pendingGrowth + 1}</text></g>}
    </motion.g>
    <path d={`M-0.5 ${level.height - cameraY - 0.6}Q${columns / 3} ${level.height - cameraY - 1} ${columns + 0.5} ${level.height - cameraY - 0.5}V${level.height - cameraY}H-0.5Z`} className="board-bottom" />
    {level.chase && <rect x="-0.5" y="-0.5" width={columns + 1} height={viewHeight + 1} fill={`url(#${uid}-danger)`} opacity={Math.max(0, (pressure - 0.65) / 0.35)} pointerEvents="none" />}
  </svg>;
}
