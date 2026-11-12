import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import SizeSelector from './SizeSelector';

describe('SizeSelector', () => {
  test('ラベルとサイズの選択肢が結び付いている', () => {
    render(<SizeSelector value="blog" onChange={() => {}} />);

    const select = screen.getByLabelText('変換後のサイズ');
    expect(select).toHaveValue('blog');
    expect(screen.getByRole('option', { name: '元のサイズのまま（形式だけ変換）' })).toBeInTheDocument();
  });

  test('切り取りの説明を表示する', () => {
    render(<SizeSelector value="blog" onChange={() => {}} />);
    expect(screen.getByText(/はみ出した部分を切り取ります/)).toBeInTheDocument();
  });
});
