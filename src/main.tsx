import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// 阻止默认的双指缩放等手势
document.addEventListener('gesturestart', (e) => e.preventDefault());
document.addEventListener('gesturechange', (e) => e.preventDefault());
document.addEventListener('gestureend', (e) => e.preventDefault());

// 阻止默认的下拉刷新
let lastTouchY = 0;
let preventPullToRefresh = false;

document.addEventListener('touchstart', (e) => {
  if (e.touches.length !== 1) return;
  lastTouchY = e.touches[0].clientY;
  preventPullToRefresh = window.pageYOffset === 0;
});

document.addEventListener('touchmove', (e) => {
  const touchY = e.touches[0].clientY;
  const touchYDelta = touchY - lastTouchY;
  lastTouchY = touchY;

  if (preventPullToRefresh && touchYDelta > 0) {
    e.preventDefault();
  }
}, { passive: false });

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// 注册 PWA（自动更新）
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      console.warn('PWA register failed');
    });
  });
}

