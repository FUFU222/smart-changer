import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, test } from 'vitest';
import App from './App';

const renderAt = (path) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );

describe('App', () => {
  test('トップページに変換フォームを表示する', () => {
    renderAt('/');
    expect(screen.getByRole('region', { name: '画像の変換' })).toBeInTheDocument();
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
  });

  test('規約ページへ移動できる', () => {
    renderAt('/terms-of-service');
    expect(screen.getByRole('heading', { level: 1, name: '利用規約' })).toBeInTheDocument();
  });

  test('存在しないページでは案内を表示する', () => {
    renderAt('/nope');
    expect(screen.getByRole('heading', { name: 'ページが見つかりません' })).toBeInTheDocument();
  });
});
