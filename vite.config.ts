import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  base: mode === 'production' ? '/ThoDucQueToi/' : '/',
  build: { sourcemap: true },
  test: {
    environment: 'node',
    include: ['tests/unit/**/*.test.ts'],
    coverage: { reporter: ['text', 'html'] },
  },
}));
