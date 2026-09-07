import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [react()],
  css: {
    postcss: false,
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './vitest.setup.js',
    css: false,
    execArgv: ['--experimental-require-module'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: [
        'src/Services/authService.js',
        'src/Services/inventoryService.js',
        'src/Services/invoicesService.js',
        'src/app/components/ConfirmModal.jsx',
        'src/app/components/Header.jsx',
        'src/app/components/Sidebar.jsx',
        'src/app/components/TotalPrice.jsx',
      ],
      thresholds: {
        statements: 80,
        branches: 65,
        functions: 80,
        lines: 80,
      },
      exclude: [
        'node_modules/**',
        '.next/**',
        'vitest.config.mjs',
        'vitest.setup.js',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
