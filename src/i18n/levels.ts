import type { Level } from '../games/gravity-snake/core/types';
import type { Language } from './Language';
const english = [
  ['The one from the ad', 'One segment supported by a block keeps the whole snake from falling.'],
  ['Long enough to cross', 'Keep your tail on the platform while you cross the gap.'],
  ['Growing upwards', 'Even when moving up, part of your body still needs support.'],
  ['A place to land', 'Leave the upper platform and the whole snake falls together.'],
  ['The tail can eat too', 'Apples touching your tail earn three times the base score.'],
  ['Go around', 'Go around blocked cells. If all four directions are blocked, the run ends.'],
  ['A little longer', 'Grow long enough to bridge the gap between the platforms.'],
  ['Catch the whole bunch', 'Growth stacks at the tail while falling, then unfolds after landing.'],
  ['One last bite', 'The exit is on the right. Collect as many apples as you like along the way.'],
  ['Something behind you', ''],
] as const;
export function levelCopy(level: Level, language: Language) {
  const index = Number(level.id.split('-').at(-1)) - 1;
  return language === 'zh' ? { name: level.name, hint: level.hint } : { name: english[index][0], hint: english[index][1] };
}
