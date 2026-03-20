import path from 'path';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    const isParasymbioticMode = mode === 'parasymbiotic';

    return {
      plugins: [react()],
      define: {
        __PARASYMBIOTIC_MODE__: JSON.stringify(isParasymbioticMode),
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      server: {
        host: '0.0.0.0',
        port: isParasymbioticMode ? 4174 : 5173,
      },
      preview: {
        host: '0.0.0.0',
        port: isParasymbioticMode ? 4175 : 4173,
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
