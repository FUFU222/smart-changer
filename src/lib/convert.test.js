import { beforeEach, describe, expect, test, vi } from 'vitest';
import { computeCoverCrop, decodeImage, fitWithinPixelLimit } from './convert';

const heicTo = vi.fn();
vi.mock('heic-to/csp', () => ({ heicTo: (...args) => heicTo(...args) }));

describe('computeCoverCrop', () => {
  test('横長の元画像は左右を均等に切り落とす', () => {
    expect(computeCoverCrop(4000, 2000, 1000, 1000)).toEqual({ sx: 1000, sy: 0, sw: 2000, sh: 2000 });
  });

  test('縦長の元画像は上下を均等に切り落とす', () => {
    expect(computeCoverCrop(1000, 3000, 1000, 1000)).toEqual({ sx: 0, sy: 1000, sw: 1000, sh: 1000 });
  });

  test('比率が同じなら切り落とさない', () => {
    expect(computeCoverCrop(1920, 1080, 1280, 720)).toEqual({ sx: 0, sy: 0, sw: 1920, sh: 1080 });
  });
});

describe('fitWithinPixelLimit', () => {
  test('上限以下ならそのまま', () => {
    expect(fitWithinPixelLimit(4000, 3000, 16_777_216)).toEqual({ width: 4000, height: 3000 });
  });

  test('上限を超えたら比率を保って縮小する', () => {
    const { width, height } = fitWithinPixelLimit(8064, 6048, 16_777_216);
    expect(width * height).toBeLessThanOrEqual(16_777_216);
    expect(width / height).toBeCloseTo(8064 / 6048, 2);
  });
});

describe('decodeImage', () => {
  beforeEach(() => {
    heicTo.mockReset();
  });

  test('ブラウザが HEIC を直接読めない場合は heic-to でビットマップに変換する', async () => {
    const bitmap = { width: 10, height: 10, close: vi.fn() };
    vi.stubGlobal('createImageBitmap', vi.fn().mockRejectedValue(new Error('cannot decode')));
    heicTo.mockResolvedValue(bitmap);

    const file = new File(['x'], 'IMG_0001.HEIC', { type: 'image/heic' });
    await expect(decodeImage(file)).resolves.toBe(bitmap);

    // 出力形式に関係なく、HEIC はビットマップとして読み込む（WEBP を直接要求しない）
    expect(heicTo).toHaveBeenCalledWith({ blob: file, type: 'bitmap' });
  });

  test('ブラウザが HEIC を直接読める場合は heic-to を使わない', async () => {
    const bitmap = { width: 10, height: 10, close: vi.fn() };
    vi.stubGlobal('createImageBitmap', vi.fn().mockResolvedValue(bitmap));

    const file = new File(['x'], 'IMG_0001.HEIC', { type: 'image/heic' });
    await expect(decodeImage(file)).resolves.toBe(bitmap);
    expect(heicTo).not.toHaveBeenCalled();
  });
});
