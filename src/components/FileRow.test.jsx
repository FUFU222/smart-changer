import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import FileRow from './FileRow';

describe('FileRow', () => {
  test('ファイルごとに名前付きの操作ボタンを持つ', () => {
    const onClick = vi.fn();
    const file = new File(['x'.repeat(2048)], 'sample.png', { type: 'image/png' });

    render(
      <ul>
        <FileRow file={file} action={{ label: 'sample.pngを削除', icon: null, onClick }} />
      </ul>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'sample.pngを削除' }));

    expect(onClick).toHaveBeenCalledTimes(1);
    expect(screen.getByText('2 KB')).toBeInTheDocument();
  });
});
