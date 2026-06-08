import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { useUIStore } from '@/stores/useUIStore'

// 初始化主题（在 React 渲染前执行，避免闪烁）
useUIStore.getState().initTheme();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
