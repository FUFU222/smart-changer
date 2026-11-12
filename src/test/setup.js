import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

afterEach(() => {
  cleanup();
  window.localStorage.clear();
});

// jsdom は Blob URL と canvas を実装していないため、テスト用に最小限の代替を置く
if (!URL.createObjectURL) {
  let counter = 0;
  URL.createObjectURL = vi.fn(() => `blob:test/${(counter += 1)}`);
  URL.revokeObjectURL = vi.fn();
}

HTMLCanvasElement.prototype.toDataURL = function toDataURL(type = 'image/png') {
  return `data:${type};base64,`;
};
