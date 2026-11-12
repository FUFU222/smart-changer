import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, test } from 'vitest';
import SegmentedControl from './SegmentedControl';

const OPTIONS = [
  { value: 'a', label: 'A' },
  { value: 'b', label: 'B' },
  { value: 'c', label: 'C' },
];

const Harness = ({ initial = 'a' }) => {
  const [value, setValue] = useState(initial);
  return <SegmentedControl legend="選択" name="test" options={OPTIONS} value={value} onChange={setValue} />;
};

const track = (container) => container.querySelector('.segmented__track');

describe('SegmentedControl', () => {
  test('選択中の背景は、選んだ項目の位置へ移る', async () => {
    const user = userEvent.setup();
    const { container } = render(<Harness />);

    expect(track(container).style.getPropertyValue('--segment-count')).toBe('3');
    expect(track(container).style.getPropertyValue('--segment-index')).toBe('0');

    await user.click(screen.getByRole('radio', { name: 'C' }));

    expect(screen.getByRole('radio', { name: 'C' })).toBeChecked();
    expect(track(container).style.getPropertyValue('--segment-index')).toBe('2');
  });

  test('どれも選ばれていなければ、選択中の背景は出さない', () => {
    const { container } = render(<Harness initial="none" />);
    expect(container.querySelector('.segmented__thumb')).toBeNull();
  });
});
