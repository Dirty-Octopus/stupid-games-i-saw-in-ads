import { motion, useReducedMotion } from 'motion/react';
import type { Cell } from './core/types';
import { art } from './art';

/** Visual timer pressure only. The rule engine still owns every bite and collision. */
export function Monster({ tail, pressure, biting, eventId }: { tail: Cell; pressure: number; biting: boolean; eventId: number }) {
  const reduced = useReducedMotion();
  return <motion.g className="chase-monster" initial={false}
    animate={{ x: tail.x - 5.7 + pressure * 0.65, y: tail.y - 2.4 }}
    transition={reduced ? { duration: 0 } : { type: 'spring', stiffness: 230, damping: 28 }}>
    <ellipse cx="2.8" cy="3.5" rx="2.3" ry="0.2" fill="#25192c" opacity="0.24" />
    <motion.g key={eventId} initial={false} style={{ transformOrigin: '4.9px 2.6px' }}
      animate={biting && !reduced ? { x: [0, 0.65, -0.15, 0], scaleX: [1, 1.13, 0.98, 1], scaleY: [1, 0.91, 1.03, 1] } : { x: 0, scaleX: 1, scaleY: 1 }}
      transition={{ duration: reduced ? 0 : 0.38, times: [0, 0.2, 0.65, 1] }}>
      <image href={art.monster} x="0" y="0" width="5.9" height="3.7" />
    </motion.g>
    {!reduced && pressure > 0.72 && <motion.path d="M5.35 1.42L5.65 1.34M5.28 1.11L5.54 0.96" stroke="#e8a56c" strokeWidth="0.07" strokeLinecap="round" initial={{ opacity: 0 }} animate={{ opacity: 0.75 }} />}
  </motion.g>;
}
