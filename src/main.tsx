import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

const rootElement = document.getElementById('root');

if (rootElement) {
  try {
    const root = createRoot(rootElement);
    root.render(
      <StrictMode>
        <App />
      </StrictMode>
    );
  } catch (error) {
    console.error("Fatal render error in SEN AURA TECH:", error);
    rootElement.innerHTML = `
      <div style="min-height: 100vh; background-color: #020617; color: #f8fafc; display: flex; align-items: center; justify-content: center; font-family: sans-serif; text-align: center; padding: 20px;">
        <div style="max-width: 420px; background: #0f172a; border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 16px; padding: 32px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);">
          <div style="font-size: 32px; margin-bottom: 12px;">⚡</div>
          <h1 style="font-size: 20px; font-weight: bold; margin-bottom: 8px;">SEN AURA TECH</h1>
          <p style="font-size: 14px; color: #94a3b8; margin-bottom: 20px;">Chargement et initialisation de l'application...</p>
          <button onclick="window.location.reload()" style="background: linear-gradient(135deg, #f59e0b, #d97706); color: #020617; font-weight: bold; border: none; padding: 12px 24px; border-radius: 10px; cursor: pointer; width: 100%;">
            Recharger la page
          </button>
        </div>
      </div>
    `;
  }
}
