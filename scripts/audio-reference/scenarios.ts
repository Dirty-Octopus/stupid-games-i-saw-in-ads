import manifest from '../../public/Audio/manifest.json';
import { levels } from '../../src/games/gravity-snake/levels';
import { createState, step, bite } from '../../src/games/gravity-snake/core/engine';
import type { Direction, GameEvent, GameState, Level, Transition } from '../../src/games/gravity-snake/core/types';
import { frameHoldMs } from '../../src/ui/game-timing';

export const FPS = 60;
export const START = 120;
export const DURATION = 360;
export type SceneKind = 'game' | 'confirm' | 'back' | 'ending';
export interface Cue {
  id: string; wav: string; title: string; purpose: string; note: string;
  kind: SceneKind; start: number; end: number; action: string;
  level: Level; initial: GameState;
  frames: { at: number; state: GameState; events: string[] }[];
}
const descriptions: Record<string, [string, string, number]> = {
  'ui.confirm': ['确认进入', '点击游戏入口，进入棋盘。', 9],
  'ui.back': ['返回游戏架', '点击返回，离开当前游戏。', 9],
  'ui.ending': ['片尾入场', '白光亮起，随后出现感谢文字。', 90],
  move: ['移动', '一次有效的逐格移动。适合短促、可连续播放的声音。', 6],
  blocked: ['碰撞阻挡', '撞到身体或地块，位置不变，不会因此死亡。', 9],
  eat: ['吃到苹果', '接触苹果的这一帧触发，苹果消失并增加身体。', 15],
  fall: ['开始下落', '失去最后一处支撑，整条蛇开始下落；一次连续下落只触发一次。', 20],
  land: ['落地', '下落结束，身体重新受到地块支撑。', 12],
  die: ['失败', '掉出地图，或被咬后不足两格；共用同一个失败声音。', 36],
  win: ['关卡通关', '蛇头接触出口，出现本关结算。', 60],
  restart: ['重新开始', '重置关卡，蛇身、苹果和分数恢复初始状态。', 15],
  expand: ['尾部展开', '叠在尾部的身体找到空位，沿合法路径展开。', 21],
  bite: ['怪物咬尾', '怪物扑咬，尾部一次减少三格。', 23],
};

function gameplayTake(event: string): {level: Level; initial: GameState; transition: Transition; action: string} {
  if (event === 'move') {
    const level = levels[0], initial = createState(level);
    return {level, initial, transition: step(level, initial, 'up'), action: '↑ 向上移动一格'};
  }
  if (event === 'blocked') {
    const level = levels[0], initial = createState(level);
    return {level, initial, transition: step(level, initial, 'left'), action: '← 向身体移动，触发阻挡'};
  }
  if (event === 'restart') {
    const level = levels[0]; let initial = createState(level);
    for (const action of ['right', 'up', 'up'] as Direction[]) initial = step(level, initial, action).state;
    return {level, initial, transition: {state: createState(level), frames: []}, action: 'R 重新开始当前关卡'};
  }
  if (event === 'die') {
    const level = levels[9], initial = createState(level);
    return {level, initial, transition: bite(level, initial), action: '尾巴被咬后不足两格，触发失败'};
  }
  if (event === 'bite') {
    const level = levels[9]; let initial = createState(level);
    for (let i = 0; i < 14; i++) initial = step(level, initial, 'right').state;
    return {level, initial, transition: bite(level, initial), action: '每 5 秒咬掉尾部 3 格'};
  }
  // Capture a real transition from one of the shipped levels, without changing its map.
  for (const level of levels) {
    let state = createState(level);
    for (const direction of level.solution) {
      const transition = step(level, state, direction);
      if (transition.frames.some(f => f.events.includes(event as GameEvent)) && (event !== 'move' || !transition.frames[0].events.includes('eat'))) {
        return { level, initial: state, transition, action: `${{up:'↑',down:'↓',left:'←',right:'→'}[direction]} ${level.name}` };
      }
      state = transition.state;
    }
  }
  throw new Error(`No real gameplay example for ${event}`);
}
export function buildCues(): Cue[] {
  return manifest.sounds.map(sound => {
    const event = sound.id.replace('gravity-snake.', '');
    const [title, purpose, duration] = descriptions[event];
    const common = {id:sound.id, wav:sound.file, title, purpose, start:START, end:START+duration,
      note:'结束点为建议尾音；可按听感调整。参考片无音轨。'};
    if (sound.id.startsWith('ui.')) return {...common,kind:event.split('.')[1] as SceneKind, level:levels[0], initial:createState(levels[0]),frames:[],action:purpose};
    const take = gameplayTake(event);
    if (event === 'restart') return {...common,kind:'game',...take,frames:[{at:START,state:take.transition.state,events:['restart']}]};
    let ms = 0;
    const timed = take.transition.frames.map((f,i)=>{
      const at = Math.round(ms * FPS / 1000);
      ms += frameHoldMs(f.events,i===take.transition.frames.length-1);
      return {...f,at};
    });
    const target = timed.find(f => f.events.includes(event as GameEvent))!;
    const offset = START-target.at;
    const frames = timed.map(f=>({...f,at:f.at+offset}));
    const end = event === 'fall' ? frames.find(f=>f.events.includes('land'))?.at ?? common.end : common.end;
    return {...common,kind:'game',...take,end,frames};
  });
}
export const cues = buildCues();
export const timecode = (frame:number) => `00:00:${String(Math.floor(frame/FPS)).padStart(2,'0')}:${String(frame%FPS).padStart(2,'0')}`;
