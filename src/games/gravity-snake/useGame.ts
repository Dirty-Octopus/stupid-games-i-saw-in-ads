import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { frameHoldMs } from '../../ui/game-timing';
import { playSound } from '../../audio/audio';
import { bite, createState, step } from './core/engine';
import type { Direction, GameEvent, Level, Transition } from './core/types';

export function useGame(level: Level, paused: boolean) {
  const [state, setState] = useState(() => createState(level));
  const current = useRef(state);
  const busy = useRef(false);
  const [animating, setAnimating] = useState(false);
  const generation = useRef(0);
  const frameTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [effect, setEffect] = useState<{ id: number; events: GameEvent[] }>({ id: 0, events: [] });
  const [started, setStarted] = useState(!level.chase);
  const [timeLeft, setTimeLeft] = useState(level.chase?.intervalMs ?? 0);
  const remaining = useRef(level.chase?.intervalMs ?? 0);

  const run = useCallback((transition: Transition) => {
    if (!transition.frames.length) return;
    current.current = transition.state;
    busy.current = true;
    setAnimating(true);
    const token = generation.current;
    let index = 0;
    const next = () => {
      if (token !== generation.current) return;
      const frame = transition.frames[index++];
      setState(frame.state);
      if (frame.events.length) {
        setEffect((previous) => ({ id: previous.id + 1, events: frame.events }));
        for (const event of frame.events) void playSound(`gravity-snake.${event}`);
      }
      if (index < transition.frames.length) frameTimer.current = setTimeout(next, frameHoldMs(frame.events));
      else frameTimer.current = setTimeout(() => { if (token === generation.current) { busy.current = false; setAnimating(false); } }, frameHoldMs(frame.events, true));
    };
    next();
  }, []);

  const reset = useCallback(() => {
    generation.current++;
    clearTimeout(frameTimer.current);
    current.current = createState(level);
    setState(current.current);
    busy.current = false;
    setAnimating(false);
    remaining.current = level.chase?.intervalMs ?? 0;
    setTimeLeft(remaining.current);
    setStarted(!level.chase);
    setEffect((previous) => ({ id: previous.id + 1, events: [] }));
  }, [level]);

  useLayoutEffect(() => { reset(); return () => { generation.current++; clearTimeout(frameTimer.current); }; }, [reset]);
  const move = useCallback((direction: Direction) => {
    if (!paused && started && !busy.current && current.current.status === 'playing') run(step(level, current.current, direction));
  }, [level, paused, started, run]);

  useEffect(() => {
    if (!level.chase || !started || paused || state.status !== 'playing') return;
    let previous = performance.now();
    const timer = setInterval(() => {
      const now = performance.now();
      remaining.current -= now - previous; previous = now;
      if (remaining.current <= 0 && !busy.current && current.current.status === 'playing') {
        remaining.current += level.chase!.intervalMs;
        run(bite(level, current.current));
      }
      setTimeLeft(Math.max(0, remaining.current));
    }, 100);
    return () => clearInterval(timer);
  }, [level, started, paused, state.status, run]);

  return { state, move, reset, effect, started, start: () => setStarted(true), timeLeft, animating };
}
