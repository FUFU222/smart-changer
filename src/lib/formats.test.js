import { describe, expect, test } from 'vitest';
import { findFormat, isHeicFile, validateInputFile, MAX_FILE_SIZE } from './formats';

const file = (name, type, size = 10) => {
  const f = new File(['x'], name, { type });
  Object.defineProperty(f, 'size', { value: size });
  return f;
};

describe('isHeicFile', () => {
  test.each([
    ['IMG_0001.HEIC', 'image/heic'],
    ['IMG_0001.heic', ''],
    ['IMG_0001.heif', 'image/heif'],
    ['photo.jpg', 'image/heic'],
  ])('%s (%s) は HEIC として扱う', (name, type) => {
    expect(isHeicFile(file(name, type))).toBe(true);
  });

  test('JPEG は HEIC ではない', () => {
    expect(isHeicFile(file('photo.jpg', 'image/jpeg'))).toBe(false);
  });
});

describe('validateInputFile', () => {
  test('対応形式は受け付ける', () => {
    expect(validateInputFile(file('a.png', 'image/png'))).toBeNull();
    expect(validateInputFile(file('a.webp', 'image/webp'))).toBeNull();
    expect(validateInputFile(file('a.HEIC', ''))).toBeNull();
  });

  test('非標準の JPEG MIME タイプも受け付ける', () => {
    expect(validateInputFile(file('a.jpg', 'image/jpg'))).toBeNull();
    expect(validateInputFile(file('a.jpeg', 'image/pjpeg'))).toBeNull();
  });

  test('非対応形式は理由を返す', () => {
    expect(validateInputFile(file('a.gif', 'image/gif'))).toMatch(/対応していない形式/);
    expect(validateInputFile(file('a.svg', 'image/svg+xml'))).toMatch(/対応していない形式/);
  });

  test('拡張子を偽装した非画像は受け付けない', () => {
    expect(validateInputFile(file('a.png', 'text/html'))).toMatch(/対応していない形式/);
  });

  test('サイズ上限を超えるファイルは受け付けない', () => {
    expect(validateInputFile(file('a.png', 'image/png', MAX_FILE_SIZE + 1))).toMatch(/大きすぎ/);
  });
});

describe('findFormat', () => {
  test('JPEG の拡張子は jpg', () => {
    expect(findFormat('jpeg').extension).toBe('jpg');
  });
});
