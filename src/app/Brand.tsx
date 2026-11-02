import { motion } from 'motion/react';
import { bubbleSpring } from '../ui/motion';

export const title = 'stupid games i saw in ads';

export function Brand({ intro = false }: { intro?: boolean }) {
  return <motion.div layoutId="site-title" className={`brand ${intro ? 'brand-intro' : ''}`} aria-label={title}>
    <span className="brand-words" aria-hidden="true">{title.split(' ').map((word, wordIndex) => <span className="brand-word" key={`${word}-${wordIndex}`}>{[...word].map((letter, i) => {
      const index = title.split(' ').slice(0, wordIndex).join(' ').length + i;
      return <motion.span className="brand-letter" style={{ color: `var(--brand-${(index % 5) + 1})` }} key={i} initial={intro ? { y: 35, scale: 0.05, opacity: 0, rotate: i % 2 ? 9 : -9 } : false} animate={{ y: 0, scale: 1, opacity: 1, rotate: 0 }} transition={{ ...bubbleSpring, delay: intro ? index * 0.026 : 0 }}>{letter}</motion.span>;
    })}</span>)}</span>
  </motion.div>;
}
