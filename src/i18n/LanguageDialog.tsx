import { motion, useReducedMotion } from 'motion/react';
import { ArrowRightIcon, GlobeHemisphereWestIcon } from '@phosphor-icons/react';
import { useLanguage } from './Language';
import { trapModalTab } from '../ui/modal';
import { softSpring } from '../ui/motion';

export function LanguageDialog() {
  const { setLanguage } = useLanguage();
  const reduced = useReducedMotion();
  return <div className="language-overlay">
    <motion.section className="language-dialog" role="dialog" aria-modal="true" aria-labelledby="language-title" onKeyDown={trapModalTab}
      initial={reduced ? false : { opacity: 0, y: 24, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={softSpring}>
      <span className="language-symbol" aria-hidden="true"><GlobeHemisphereWestIcon size={32} /></span>
      <h1 id="language-title"><span lang="zh-CN">选择语言</span><span lang="en">Choose your language</span></h1>
      <div className="language-options">
        <button autoFocus lang="zh-CN" onClick={() => setLanguage('zh')}><span><strong>中文</strong><small>使用中文游玩</small></span><ArrowRightIcon size={23} /></button>
        <button lang="en" onClick={() => setLanguage('en')}><span><strong>English</strong><small>Play in English</small></span><ArrowRightIcon size={23} /></button>
      </div>
      <p><span lang="zh-CN">之后可以在右上角更改。</span><span lang="en">You can change this at the top right.</span></p>
    </motion.section>
  </div>;
}
