import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from 'motion/react';
import { ArrowRightIcon, ArrowUpRightIcon, GameControllerIcon, GlobeHemisphereWestIcon, MoonIcon, SpeakerHighIcon, SpeakerSlashIcon, SunIcon } from '@phosphor-icons/react';
import { Brand } from './Brand';
import { Board } from '../games/gravity-snake/Board';
import { levels } from '../games/gravity-snake/levels';
import { createState } from '../games/gravity-snake/core/engine';
import { games } from '../games/registry';
import { playSound, setAudioEnabled, stopSounds, unlockAudio } from '../audio/audio';
import { noStorageServices } from '../services/game-services';
import { softSpring, spring } from '../ui/motion';
import { useLanguage, type Language } from '../i18n/Language';
import { LanguageDialog } from '../i18n/LanguageDialog';

const Game = lazy(() => import('../games/gravity-snake/Game'));
const Credits = lazy(() => import('../credits/Credits').then((module) => ({ default: module.Credits })));
const preview = createState(levels[0]);

export function App() {
  const { language, chosen, setLanguage, t } = useLanguage();
  const reduced = useReducedMotion();
  const [route, setRoute] = useState(window.location.hash);
  const [intro, setIntro] = useState(!window.location.hash && !window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [sound, setSound] = useState(true);
  const [dark, setDark] = useState(window.matchMedia('(prefers-color-scheme: dark)').matches);
  const [credits, setCredits] = useState(false);
  const homeButton = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const unlock = () => { void unlockAudio(); };
    window.addEventListener('pointerdown', unlock, { passive: true });
    window.addEventListener('keydown', unlock);
    return () => { window.removeEventListener('pointerdown', unlock); window.removeEventListener('keydown', unlock); };
  }, []);
  useEffect(() => {
    const change = () => { setRoute(window.location.hash); window.scrollTo(0, 0); };
    window.addEventListener('hashchange', change);
    return () => window.removeEventListener('hashchange', change);
  }, []);
  useEffect(() => {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#1b211e' : '#edefe7');
  }, [dark]);
  useEffect(() => {
    if (!intro || !chosen) return;
    const timer = setTimeout(() => setIntro(false), reduced ? 0 : 1750);
    return () => clearTimeout(timer);
  }, [intro, reduced, chosen]);
  useEffect(() => {
    if (!credits && chosen) return;
    const old = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = old; };
  }, [credits, chosen]);
  const home = useCallback(() => { stopSounds(); window.location.hash = '/'; void playSound('ui.back'); }, []);
  const openCredits = useCallback(() => setCredits(true), []);
  const closeCredits = useCallback(() => { stopSounds(); setCredits(false); window.location.hash = '/'; requestAnimationFrame(() => homeButton.current?.focus()); }, []);
  const inGame = route === '#/gravity-snake';
  const game = games[0];

  return <LayoutGroup>
    <div inert={!chosen || credits || intro} className="site-shell">
      <a className="skip-link" href="#main-content" onClick={(event) => { event.preventDefault(); document.getElementById('main-content')?.focus(); }}>{t('跳到内容', 'Skip to content')}</a>
      <header className="site-header page-width">
        <button ref={homeButton} className="brand-button" aria-label={t('返回游戏架', 'Back to games')} onClick={home}>{(!intro || !chosen) && <><Brand />{language === 'zh' && <span className="brand-subtitle">那些我在广告里看到的傻X小游戏</span>}</>}</button>
        <nav aria-label={t('全站导航', 'Site navigation')}>
          <label className="language-switch"><GlobeHemisphereWestIcon size={18} aria-hidden="true" /><select aria-label={t('界面语言', 'Interface language')} value={language} onChange={(event) => setLanguage(event.target.value as Language)}><option value="zh">{t('中文', 'Chinese')}</option><option value="en">{t('英语', 'English')}</option></select></label>
          <button className="button icon-button" aria-label={sound ? t('关闭声音', 'Mute sound') : t('开启声音', 'Enable sound')} aria-pressed={sound} onClick={() => { setSound(!sound); setAudioEnabled(!sound); void unlockAudio(); }}>{sound ? <SpeakerHighIcon size={21} /> : <SpeakerSlashIcon size={21} />}</button>
          <button className="button icon-button" aria-label={dark ? t('切换浅色主题', 'Use light theme') : t('切换深色主题', 'Use dark theme')} onClick={() => setDark(!dark)}>{dark ? <SunIcon size={21} /> : <MoonIcon size={21} />}</button>
        </nav>
      </header>
      <div id="main-content" tabIndex={-1}>
        {chosen && !credits && (inGame ? <Suspense fallback={<div className="loading-state">{t('正在加载棋盘…', 'Loading the board…')}</div>}><Game services={noStorageServices} onBack={home} onComplete={openCredits} /></Suspense> : <motion.main className="library page-width" initial={{ opacity: 0 }} animate={{ opacity: intro ? 0 : 1 }} transition={{ delay: intro || reduced ? 0 : 0.2, duration: reduced ? 0 : 0.3 }}>
          <div className="library-heading"><div><p className="eyebrow"><GameControllerIcon size={18} />{t('游戏架', 'The games')}</p><h1>{language === 'zh' ? <>那些我在广告里看到的<br className="desktop-break" /><span>傻X小游戏</span></> : <>stupid games<br /><span>i saw in ads</span></>}</h1></div><span className="library-count">{games.length} {t('个游戏', games.length === 1 ? 'game' : 'games')}</span></div>
          <motion.article className="game-card" initial={reduced ? false : { y: 26, scale: 0.985 }} animate={{ y: intro ? 26 : 0, scale: intro ? 0.985 : 1 }} transition={{ ...softSpring, delay: reduced ? 0 : 0.3 }}>
            <a href={game.href} className="card-art" aria-label={t('开始重力贪吃蛇', 'Play gravity snake')} onClick={() => void playSound('ui.confirm')}><div className="card-board"><Board level={levels[0]} state={preview} preview /></div><span className="art-open"><ArrowUpRightIcon size={23} /></span></a>
            <div className="card-info"><div className="card-tags"><span>{t('重力', 'Gravity')}</span><span>{t('解谜', 'Puzzle')}</span></div><h2>{t(game.name, game.englishName)}</h2><p className="card-description">{t(game.description, 'Snake with gravity. Ten levels to figure out.')}</p><div className="card-details"><span>{t('苹果可选', 'Optional apples')}</span><span>{t('键盘 / 触屏', 'Keyboard / touch')}</span></div><motion.a href={game.href} className="button primary play-button" whileHover={reduced ? {} : { y: -3 }} whileTap={reduced ? {} : { scale: 0.95 }} transition={spring} onClick={() => void playSound('ui.confirm')}>{t('开玩', 'Play')}<ArrowRightIcon size={22} weight="bold" /></motion.a></div>
          </motion.article>
          <div className="library-bottom"><p>{t('使用方向键或屏幕按钮移动。', 'Move with arrow keys, WASD or the on-screen buttons.')}</p><div><button className="text-button" onClick={openCredits}>{t('制作名单', 'Credits')}</button><a href="https://github.com/Dirty-Octopus/stupid-games-i-saw-in-ads" target="_blank" rel="noreferrer">{t('源代码', 'Source code')}<ArrowUpRightIcon size={15} /></a></div></div>
        </motion.main>)}
      </div>
    </div>
    {credits && <Suspense fallback={<div className="loading-state">{t('正在加载制作名单…', 'Loading credits…')}</div>}><Credits onClose={closeCredits} /></Suspense>}
    <AnimatePresence>{intro && chosen && <motion.div className="intro-screen" initial={false} exit={{ opacity: 0 }} transition={{ duration: reduced ? 0 : 0.25 }}><Brand intro />{language === 'zh' && <motion.span className="intro-caption" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.95 }}>那些我在广告里看到的傻X小游戏</motion.span>}<button className="intro-skip text-button" onClick={() => setIntro(false)}>{t('跳过', 'Skip')}<ArrowRightIcon size={16} /></button></motion.div>}</AnimatePresence>
    {!chosen && <LanguageDialog />}
  </LayoutGroup>;
}
