import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { AnalyticsScripts } from './components/AnalyticsScripts';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AnalyticsScripts />
    <App />
  </StrictMode>,
);
