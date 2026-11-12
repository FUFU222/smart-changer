import './lib/trustedTypes';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
// ロゴの欧文だけに使う。日本語の Web フォントは CSS だけで数百KBになり表示を遅らせるため、本文は端末のフォントを使う
import '@fontsource/zen-old-mincho/latin-400.css';
import './style/App.css';
import App from './App';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
