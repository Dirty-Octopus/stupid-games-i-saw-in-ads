import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { motion, useAnimationFrame, useMotionValue, useReducedMotion } from 'motion/react';
import { ArrowRightIcon, FastForwardIcon } from '@phosphor-icons/react';
import { creditPairs } from './credits-data';
import { playSound } from '../audio/audio';
import { trapModalTab } from '../ui/modal';
import { useLanguage } from '../i18n/Language';

export function Credits({ onClose }: { onClose: () => void }) {
  const { language, t } = useLanguage();
  const reduced = useReducedMotion();
  const [rolling, setRolling] = useState(false);
  const [fast, setFast] = useState(false);
  const roll = useRef<HTMLDivElement>(null);
  const container = useRef<HTMLDivElement>(null);
  const endingPlayed = useRef(false);
  const distance = useRef(0);
  const viewportHeight = useRef(0);
  const position = useMotionValue(0);
  const progress = useMotionValue(0);
  const finished = useRef(false);
  const release = useCallback(() => setFast(false), []);
  const accelerate = useCallback(() => { setRolling(true); setFast(true); }, []);

  useEffect(() => { if (!endingPlayed.current) { endingPlayed.current = true; void playSound('ui.ending'); } }, []);
  useEffect(() => {
    const timer = setTimeout(() => setRolling(true), reduced ? 0 : 3100);
    const down = (event: KeyboardEvent) => {
      if (event.code === 'Space' || event.key === 'Escape') { event.preventDefault(); onClose(); }
      if (event.key === 'Enter') { event.preventDefault(); accelerate(); }
    };
    const up = (event: KeyboardEvent) => { if (event.key === 'Enter') { event.preventDefault(); release(); } };
    const visibility = () => { if (document.hidden) release(); };
    // Capture Enter before a focused skip button can activate.
    window.addEventListener('keydown', down, true);
    window.addEventListener('keyup', up, true);
    window.addEventListener('blur', release);
    document.addEventListener('visibilitychange', visibility);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', down, true); window.removeEventListener('keyup', up, true);
      window.removeEventListener('blur', release); document.removeEventListener('visibilitychange', visibility);
    };
  }, [onClose, reduced, accelerate, release]);
  useLayoutEffect(() => {
    if (!rolling || !roll.current || !container.current) return;
    const resize = () => {
      viewportHeight.current = container.current!.clientHeight;
      distance.current = roll.current!.scrollHeight;
    };
    resize();
    position.set(viewportHeight.current * 0.6);
    const observer = new ResizeObserver(resize);
    observer.observe(roll.current); observer.observe(container.current);
    return () => observer.disconnect();
  }, [rolling, position]);
  useAnimationFrame((_, delta) => {
    if (!rolling || document.hidden || finished.current || !container.current) return;
    const step = Math.min(delta, 50) / 1000 * (fast ? 512 : 64);
    if (reduced) {
      // Reduced motion is a readable, manually scrollable page. Only move while explicitly held.
      if (fast) container.current.scrollTop += step;
      return;
    }
    const next = position.get() - step;
    position.set(next);
    progress.set(Math.max(0, Math.min(1, (viewportHeight.current * 0.6 - next) / (distance.current + viewportHeight.current * 0.6))));
    if (next < -distance.current) { finished.current = true; onClose(); }
  });

  return <section className="credits-screen" role="dialog" aria-modal="true" aria-label={t('制作名单', 'Credits')} onKeyDown={trapModalTab}>
    {!reduced && <motion.div className="white-flash" initial={{ opacity: 0.85 }} animate={{ opacity: 0 }} transition={{ duration: 1.2, ease: 'easeOut' }} />}
    <div className="credits-toolbar">
      <span className="credits-label">{t('制作名单', 'Credits')}</span>
      <div>
        <button className={`button credits-speed ${fast ? 'is-fast' : ''}`} aria-label={t('按住加速', 'Hold to speed up')} aria-pressed={fast}
          onPointerDown={(event) => { event.preventDefault(); event.currentTarget.setPointerCapture(event.pointerId); accelerate(); }}
          onPointerUp={release} onPointerCancel={release} onLostPointerCapture={release} onBlur={release}
          onClick={(event) => { if (event.detail === 0) { setRolling(true); setFast((value) => !value); } }}>
          <FastForwardIcon size={18} weight={fast ? 'fill' : 'regular'} /><span>{fast ? '×8' : t('按住加速', 'Hold to speed up')}</span><kbd>{t('回车', 'Enter')}</kbd>
        </button>
        <button className="button credits-skip" onClick={onClose} autoFocus>{t('跳过', 'Skip')}<kbd>{t('空格', 'Space')}</kbd><ArrowRightIcon size={18} /></button>
      </div>
    </div>
    {rolling && <div className="credit-names"><strong>ChatGPT</strong><strong>Andy Yu</strong></div>}
    {!rolling ? <motion.div className="thanks" initial={{ opacity: 0, y: reduced ? 0 : 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: reduced ? 0 : 0.5, duration: 0.6 }}>
      <span className="thanks-dot">:)</span><h1>{language === 'zh' ? <>感谢你游玩<br />这个傻X游戏</> : <>thank you for playing<br />this stupid game</>}</h1>
    </motion.div> : <div className={`credits-viewport ${reduced ? 'credits-manual' : ''}`} ref={container} tabIndex={reduced ? 0 : -1}>
      <motion.div className="credits-roll" ref={roll} style={reduced ? undefined : { y: position }}>
        <p className="credits-heading">{t('做了这个游戏的人', 'The people who made this')}</p>
        <div className="credit-pairs">{creditPairs.map((pair, index) => <div className="credit-pair" key={index}><p>{pair.left[language]}</p><p>{pair.right[language]}</p></div>)}</div>
        <div className="credit-end"><span>:)</span><strong>{t('感谢你游玩这个傻X游戏', 'thank you for playing this stupid game')}</strong>{reduced && <button className="button primary" onClick={onClose}>{t('回到游戏架', 'Back to games')}</button>}</div>
      </motion.div>
    </div>}
    {!reduced && <motion.div className="credits-progress" style={{ scaleX: progress }} />}
  </section>;
}
