import React from 'react';
import { createRoot } from 'react-dom/client';
import { MotionConfig } from 'motion/react';
import { LanguageProvider } from './i18n/Language';
import { App } from './app/App';
import './styles.css';

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <MotionConfig reducedMotion="user">
      <LanguageProvider><App /></LanguageProvider>
    </MotionConfig>
  </React.StrictMode>,
);
