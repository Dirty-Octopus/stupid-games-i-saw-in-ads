import { createPortal } from 'react-dom';
import { type ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ArrowDownIcon, ArrowLeftIcon, ArrowRightIcon, ArrowUpIcon, ArrowUUpLeftIcon, ArrowsClockwiseIcon, CheckIcon, InfoIcon, PauseIcon, PlayIcon, XIcon } from '@phosphor-icons/react';
import { useLanguage } from '../../i18n/Language';
import { levelCopy } from '../../i18n/levels';
import { levels } from './levels';
import { art } from './art';
import { Board } from './Board';
import { useGame } from './useGame';
import type { Direction } from './core/types';
import { rulesVersion } from './core/types';
import { playSound, stopSounds } from '../../audio/audio';
import type { GameServices } from '../../services/game-services';
import { spring } from '../../ui/motion';
import { trapModalTab } from '../../ui/modal';

function OverlayLayer({ portal, children }: { portal: boolean; children: ReactNode }) {
  return portal ? createPortal(children, document.body) : children;
}

const keys: Record<string, Direction> = { ArrowUp: 'up', KeyW: 'up', ArrowRight: 'right', KeyD: 'right', ArrowDown: 'down', KeyS: 'down', ArrowLeft: 'left', KeyA: 'left' };
const arrows = { up: ArrowUpIcon, right: ArrowRightIcon, down: ArrowDownIcon, left: ArrowLeftIcon };

function DirectionPad({ move, disabled }: { move: (direction: Direction) => void; disabled: boolean }) {
  const { t } = useLanguage();
  const hold = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const stop = useCallback(() => clearTimeout(hold.current), []);
  useEffect(() => {
    window.addEventListener('blur', stop);
    document.addEventListener('visibilitychange', stop);
    return () => { stop(); window.removeEventListener('blur', stop); document.removeEventListener('visibilitychange', stop); };
  }, [stop]);
  useEffect(() => { if (disabled) stop(); }, [disabled, stop]);
  return <div className="direction-pad" role="group" aria-label={t('移动方向', 'Move direction')}>
    {(['up', 'left', 'down', 'right'] as Direction[]).map((direction) => {
      const Icon = arrows[direction];
      return <motion.button key={direction} className={`direction direction-${direction}`} aria-label={t(`向${{ up: '上', right: '右', down: '下', left: '左' }[direction]}移动`, `Move ${direction}`)} disabled={disabled} whileTap={{ scale: 0.88 }} transition={spring}
        onPointerDown={(event) => {
          if (disabled) return;
          event.preventDefault(); stop(); event.currentTarget.setPointerCapture(event.pointerId); move(direction);
          const repeat = () => { move(direction); hold.current = setTimeout(repeat, 145); };
          hold.current = setTimeout(repeat, 260);
        }} onPointerUp={stop} onPointerCancel={stop} onLostPointerCapture={stop}
        onClick={(event) => { if (event.detail === 0) move(direction); }}>
        <Icon size={24} weight="bold" />
      </motion.button>;
    })}
  </div>;
}

export default function Game({ onBack, onComplete, services }: { onBack: () => void; onComplete: () => void; services: GameServices }) {
  const { language, t } = useLanguage();
  const [levelIndex, setLevelIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [rules, setRules] = useState(false);
  const [compact, setCompact] = useState(() => window.innerWidth < 700);
  const level = levels[levelIndex];
  const copy = levelCopy(level, language);
  const { state, move, reset, effect, started, start, timeLeft, animating } = useGame(level, paused || rules);
  const reduced = useReducedMotion();
  const backButton = useRef<HTMLButtonElement>(null);
  const dialogButton = useRef<HTMLButtonElement>(null);
  const runId = useRef(crypto.randomUUID());
  const submitted = useRef('');

  const restart = useCallback(() => { stopSounds(); runId.current = crypto.randomUUID(); reset(); setPaused(false); void playSound('gravity-snake.restart'); }, [reset]);
  const changeLevel = (index: number) => { stopSounds(); runId.current = crypto.randomUUID(); setPaused(false); setRules(false); setLevelIndex(index); };
  const terminal = state.status !== 'playing';
  const overlay = terminal || paused || rules || !started;
  useEffect(() => {
    if (overlay) dialogButton.current?.focus();
  }, [overlay, rules, paused, state.status, started]);
  useEffect(() => {
    if (state.status !== 'won' || levelIndex !== levels.length - 1) return;
    const timer = setTimeout(onComplete, 1000);
    return () => clearTimeout(timer);
  }, [state.status, levelIndex, onComplete]);
  useEffect(() => {
    const media = window.matchMedia('(max-width: 699px)');
    const change = () => setCompact(media.matches);
    media.addEventListener('change', change);
    return () => media.removeEventListener('change', change);
  }, []);
  useEffect(() => {
    const keydown = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLElement && /^(INPUT|SELECT|TEXTAREA)$/.test(event.target.tagName)) return;
      const direction = keys[event.code];
      if (direction) { event.preventDefault(); if (!overlay) move(direction); }
      if (event.key === 'Escape' && rules) { event.preventDefault(); setRules(false); backButton.current?.focus(); return; }
      if (event.code === 'KeyR' && !rules) { event.preventDefault(); restart(); }
      if ((event.code === 'KeyP' || event.key === 'Escape') && !terminal && started) {
        event.preventDefault(); if (rules) setRules(false); else setPaused((value) => !value);
      }
    };
    const visibility = () => { if (document.hidden && started && !terminal) setPaused(true); };
    window.addEventListener('keydown', keydown);
    document.addEventListener('visibilitychange', visibility);
    return () => { window.removeEventListener('keydown', keydown); document.removeEventListener('visibilitychange', visibility); };
  }, [move, overlay, restart, rules, terminal, started]);
  useEffect(() => {
    if (!terminal || submitted.current === runId.current) return;
    submitted.current = runId.current;
    const controller = new AbortController();
    void services.submitRun({ schemaVersion: 1, runId: runId.current, gameId: 'gravity-snake', levelId: level.id, levelVersion: level.version, rulesVersion, outcome: state.status as 'won' | 'dead', applesCollected: state.collected, score: state.score, actions: state.actions }, controller.signal);
    return () => controller.abort();
  }, [terminal, services, level, state]);

  return <motion.main className="game-page page-width" initial={{ opacity: 0, y: reduced ? 0 : 18 }} animate={{ opacity: 1, y: 0 }} transition={spring}>
    <div className="game-breadcrumb"><button className="text-button" onClick={onBack} ref={backButton}><ArrowLeftIcon size={17} />{t('游戏架', 'Games')}</button><span>/</span><span>{t('重力贪吃蛇', 'gravity snake')}</span></div>
    <div className="game-heading"><div><p className="eyebrow">{t("重力 · 解谜", "Gravity · Puzzle")}</p><h1>{t('重力贪吃蛇', 'gravity snake')}</h1></div><button className="button icon-button" aria-label={t('查看玩法', 'Show rules')} onClick={() => setRules(true)}><InfoIcon size={23} /></button></div>
    <div className="game-layout">
      <section className="game-stage" aria-label={t('游戏区域', 'Game board')}>
        <div className="stage-toolbar"><div className="level-label"><select aria-label={t('选择关卡', 'Choose level')} value={levelIndex} onChange={(event) => { changeLevel(Number(event.target.value)); event.currentTarget.blur(); }}>{levels.map((item, index) => <option value={index} key={item.id}>{String(index + 1).padStart(2, '0')} / {levelCopy(item, language).name}</option>)}</select><span className="level-count">{levelIndex + 1} / {levels.length}</span></div><div className="stage-actions"><button className="button icon-button small" aria-label={t('重新开始当前关卡', 'Restart level')} onClick={restart}><ArrowsClockwiseIcon size={20} /></button><button className="button icon-button small" aria-label={paused ? t('继续游戏', 'Resume game') : t('暂停游戏', 'Pause game')} disabled={terminal || !started} onClick={() => setPaused((value) => !value)}>{paused ? <PlayIcon size={20} /> : <PauseIcon size={20} />}</button></div></div>
        {level.chase && <div className={`chase-bar ${timeLeft < 1500 && started && !overlay ? 'chase-danger' : ''}`}><span>{t('下一口', 'Next bite')} <strong>{(timeLeft / 1000).toFixed(1)}{t('秒', 's')}</strong></span><span>{t('尾巴 −3', 'Tail −3')}</span><span>{t(`终点还有 ${Math.max(0, level.exit.x - state.snake[0].x)} 格`, `${Math.max(0, level.exit.x - state.snake[0].x)} cells to go`)}</span><span className="chase-time" style={{ transform: `scaleX(${timeLeft / level.chase.intervalMs})` }} /></div>}
        <div className="board-wrap" aria-busy={animating} data-input-ready={!animating && !overlay}>
          <motion.div animate={!reduced && effect.events.includes('bite') ? { x: [0, -6, 4, -2, 0] } : effect.events.includes('blocked') && !reduced ? { x: [0, -3, 3, -2, 0] } : { x: 0 }}  transition={{ duration: 0.17 }}>
            <Board level={level} state={state} compact={compact} biting={effect.events.includes('bite')} pressure={level.chase && started && !overlay ? 1 - timeLeft / level.chase.intervalMs : 0} effect={effect} />
          </motion.div>
          <AnimatePresence>
            {overlay && <OverlayLayer portal={rules}><motion.div className={`game-overlay ${rules ? 'rules-overlay' : ''}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, pointerEvents: 'none' }}>
              <motion.div className="game-dialog" role="dialog" aria-modal="true" aria-labelledby="game-dialog-title" onKeyDown={trapModalTab} initial={{ y: reduced ? 0 : 20, scale: reduced ? 1 : 0.94 }} animate={{ y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }} transition={spring}>
                {rules ? <><div className="dialog-heading"><h2 id="game-dialog-title">{t('怎么活下来', 'How to survive')}</h2><button ref={dialogButton} className="button icon-button small" aria-label={t('关闭玩法', 'Close rules')} onClick={() => { setRules(false); backButton.current?.focus(); }}><XIcon size={20} /></button></div><ul className="rules-list"><li>{t('逐格移动。撞墙或身体会停住；四个方向都无法移动时失败。', 'Move one cell at a time. Walls and your body block moves. If no direction is available, the run ends.')}</li><li>{t('任意一格被地块托住，整条蛇就不掉。苹果接不住你。', 'One supported segment holds up the entire snake. Apples provide no support.')}</li><li>{t('哪一节碰到苹果都能吃。身体 10 分，头 15 分，尾巴 30 分。', 'Any segment can eat an apple: body 10 points, head 15, tail 30.')}</li><li>{t('下落增长叠在尾格，数字包含尾格本身。落地后自动找空位展开。', 'Growth stacks at the tail while falling. The number includes the tail itself. It unfolds into free space after landing.')}</li><li>{t('蛇头碰到漩涡就过关，不用吃完苹果。', 'Reach the portal with your head to finish. You do not need every apple.')}</li><li>{t('最后一关每 5 秒被咬掉 3 格，不足 2 格就结束。', 'In the last level, you lose three tail segments every five seconds. Fewer than two segments ends the run.')}</li></ul></> : paused ? <><span className="dialog-symbol">Ⅱ</span><h2 id="game-dialog-title">{t('已暂停', 'Paused')}</h2><button ref={dialogButton} className="button primary" onClick={() => setPaused(false)}><PlayIcon size={19} weight="fill" />{t('继续', 'Resume')}</button><button className="text-button" onClick={restart}>{t('重新开始', 'Restart')}</button></> : !started ? <><img className="monster-preview" src={art.monster} alt="" /><h2 id="game-dialog-title">{t('后面有东西', 'Something behind you')}</h2><p>{t('怪物每隔 5 秒吃掉尾部的 3 格身体。', 'The monster eats three tail segments every five seconds.')}<br />{t('地图上只有 9 颗苹果，沿途收集并尽快抵达右侧出口。', 'Collect the nine apples along the way and reach the exit on the right quickly.')}</p><button ref={dialogButton} className="button primary" onClick={start}>{t('开始追逐', 'Start chase')}<ArrowRightIcon size={19} /></button></> : state.status === 'dead' ? <><span className="dialog-symbol">:(</span><h2 id="game-dialog-title">{state.deathCause === 'trapped' ? t('无路可走', 'No moves left') : state.deathCause === 'monster' ? t('尾巴没了', 'Out of tail') : t('掉下去了', 'You fell')}</h2><p>{t(`这次吃了 ${state.collected} 颗，拿到 ${state.score} 分。`, `You ate ${state.collected} apples and scored ${state.score} points.`)}</p><button ref={dialogButton} className="button primary" onClick={restart}><ArrowsClockwiseIcon size={19} />{t('再来一次', 'Try again')}</button><button className="text-button" onClick={onBack}>{t('回到游戏架', 'Back to games')}</button></> : <><span className="success-mark"><CheckIcon size={35} weight="bold" /></span><h2 id="game-dialog-title">{t('通关', 'Level complete')}</h2><div className="result-score">{state.score}<small>{t('分', 'pts')}</small></div><p>{t(`吃掉 ${state.collected} / ${level.apples.length} 颗苹果`, `${state.collected} / ${level.apples.length} apples eaten`)}</p><button ref={dialogButton} className="button primary" onClick={() => levelIndex === levels.length - 1 ? onComplete() : changeLevel(levelIndex + 1)}>{levelIndex === levels.length - 1 ? t('看看是谁做的', 'Meet the makers') : t('下一关', 'Next level')}<ArrowRightIcon size={19} /></button><button className="text-button" onClick={restart}>{t('再试一次，多吃点', 'Try again for more apples')}</button></>}
              </motion.div>
            </motion.div></OverlayLayer>}
          </AnimatePresence>
        </div>
        <div className="stage-caption"><span>{copy.hint}</span><span className="keyboard-shortcut"><kbd>R</kbd> {t('重开', 'Restart')} <kbd>P</kbd> {t('暂停', 'Pause')}</span></div>
      </section>
      <aside className="game-sidebar">
        <div className="score-panel"><span className="eyebrow">{t('本关得分', 'Level score')}</span><motion.strong key={state.score} initial={reduced ? false : { scale: 1.13 }} animate={{ scale: 1 }} transition={spring}>{state.score}</motion.strong><div className="game-stats"><span>{t('苹果', 'Apples')}<strong>{state.collected}<small> / {level.apples.length}</small></strong></span><span>{t('身体', 'Body')}<strong>{state.snake.length + state.pendingGrowth}<small> {t('格', 'cells')}</small></strong></span></div><div className="multipliers"><span>{t('身体', 'Body')} <b>×1</b></span><span>{t('头', 'Head')} <b>×1.5</b></span><span>{t('尾巴', 'Tail')} <b>×3</b></span></div><div className="meal-feedback" aria-live="polite">{state.lastMeal ? <span key={`${state.collected}`}>{state.lastMeal.part === 'head' ? t('头', 'Head') : state.lastMeal.part === 'tail' ? t('尾巴', 'Tail') : t('身体', 'Body')} +{state.lastMeal.points}</span> : <span></span>}</div></div>
        <div className="controls-panel"><p>{t('方向键 / 屏幕按钮', 'Arrow keys / WASD')}</p><DirectionPad move={move} disabled={overlay} /><span className="control-note">{t('按住可以连续走', 'Hold to keep moving')}</span></div>
        <button className="text-button rules-button" onClick={() => setRules(true)}><InfoIcon size={18} />{t('玩法说明', 'How to play')}</button>
      </aside>
    </div>
    <p className="session-note"><ArrowUUpLeftIcon size={15} />{t('刷新页面不会保留本局进度。', 'Refreshing the page resets this run.')}</p>
  </motion.main>;
}
