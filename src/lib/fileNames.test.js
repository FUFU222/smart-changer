import { describe, expect, test } from 'vitest';
import { createUniqueNamer, sanitizeBaseName, toOutputName } from './fileNames';

describe('toOutputName', () => {
  test('拡張子を変換後の形式に置き換える', () => {
    expect(toOutputName('IMG_0001.HEIC', 'webp')).toBe('IMG_0001.webp');
    expect(toOutputName('photo.final.png', 'jpg')).toBe('photo.final.jpg');
    expect(toOutputName('noext', 'png')).toBe('noext.png');
  });

  test('パス区切りや制御文字を除去する', () => {
    expect(toOutputName('../../etc/passwd.png', 'jpg')).toBe('passwd.jpg');
    expect(toOutputName('a\u0000b.png', 'jpg')).toBe('a_b.jpg');
  });
});

describe('createUniqueNamer', () => {
  test('同じ名前が重なったら連番を付ける', () => {
    const unique = createUniqueNamer();
    expect(unique('a.jpg')).toBe('a.jpg');
    expect(unique('a.jpg')).toBe('a (2).jpg');
    expect(unique('A.jpg')).toBe('A (3).jpg');
    expect(unique('b.jpg')).toBe('b.jpg');
  });
});

describe('sanitizeBaseName', () => {
  test('日本語・英数字・ハイフン・アンダースコアは残す', () => {
    expect(sanitizeBaseName('ブログ用_2026-11')).toBe('ブログ用_2026-11');
  });

  test('ファイル名に使えない文字は置き換える', () => {
    expect(sanitizeBaseName('a/b:c*?')).toBe('a_b_c__');
  });

  test('空なら null を返す', () => {
    expect(sanitizeBaseName('   ')).toBeNull();
  });

  test('長すぎる名前は切り詰める', () => {
    expect(sanitizeBaseName('a'.repeat(80))).toHaveLength(50);
  });
});
