import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { configureApiClient } from '@kinnijije/api';

// KinniJije fonts — Bebas Neue (display), Inter (chrome), JetBrains Mono (record).
import '@fontsource/bebas-neue/400.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import '@fontsource/inter/800.css';
import '@fontsource-variable/jetbrains-mono';

import { App } from './app.tsx';
import { registerServiceWorker } from '@shared/services/register-sw.ts';
import '@kinnijije/ui/styles.css';
import './styles.css';

const baseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:9093';
configureApiClient(baseUrl);

const rootEl = document.getElementById('root');
if (!rootEl) throw new Error('Missing #root element in index.html');

createRoot(rootEl).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

registerServiceWorker();
