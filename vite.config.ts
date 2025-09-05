import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
// Fix: Import 'process' to provide correct types for process.cwd() and resolve TS error.
import * as process from 'process';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    base: '/AI_mv_studio/',
    define: {
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
    },
  };
});
