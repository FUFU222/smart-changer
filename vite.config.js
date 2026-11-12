import { readFileSync } from 'node:fs';
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// 本番（Vercel）と同じセキュリティヘッダーを `npm run preview` でも付け、CSP 違反を手元で確認できるようにする
const vercelConfig = JSON.parse(readFileSync(new URL('./vercel.json', import.meta.url), 'utf8'));
const productionHeaders = Object.fromEntries(
  vercelConfig.headers
    .find((rule) => rule.source === '/(.*)')
    .headers.filter(({ key }) => key !== 'Strict-Transport-Security')
    // http://localhost で確認するため、https への強制だけは外す
    .map(({ key, value }) => [key, value.replace(/\s*upgrade-insecure-requests\s*;?/, ' ').trim()]),
);

export default defineConfig({
  plugins: [react()],
  build: {
    sourcemap: false,
  },
  preview: {
    headers: productionHeaders,
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.js'],
    css: false,
    restoreMocks: true,
  },
});
