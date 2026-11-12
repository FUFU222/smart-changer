import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import FormatSelector from './FormatSelector';

describe('FormatSelector', () => {
  test('書き出せる形式をワンタップで選べる', () => {
    const onChange = vi.fn();
    render(<FormatSelector value="jpeg" onChange={onChange} />);

    const group = screen.getByRole('group', { name: '変換後の形式' });
    expect(group).toBeInTheDocument();
    expect(screen.getAllByRole('radio').map((radio) => radio.value)).toEqual(['jpeg', 'png', 'webp']);
    expect(screen.getByRole('radio', { name: 'JPEG' })).toBeChecked();

    fireEvent.click(screen.getByRole('radio', { name: 'WEBP' }));
    expect(onChange).toHaveBeenCalledWith('webp');
  });
});
