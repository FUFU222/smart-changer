import JSZip from 'jszip';
import { describe, expect, test, vi } from 'vitest';
import { createZip, downloadFilesOneByOne } from './download';

const image = (name) => new File([name], name, { type: 'image/jpeg' });

describe('createZip', () => {
  test('変換後のファイル名のまま ZIP に格納する', async () => {
    const blob = await createZip([image('a.jpg'), image('b.jpg')]);
    const zip = await JSZip.loadAsync(await blob.arrayBuffer());

    expect(Object.keys(zip.files).sort()).toEqual(['a.jpg', 'b.jpg']);
    expect(await zip.file('a.jpg').async('string')).toBe('a.jpg');
  });
});

describe('downloadFilesOneByOne', () => {
  test('1枚ずつ間隔をあけてダウンロードを開始する', async () => {
    const clicked = [];
    const click = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(function record() {
        clicked.push(this.download);
      });
    const wait = vi.fn().mockResolvedValue();

    await downloadFilesOneByOne([image('a.jpg'), image('b.jpg'), image('c.jpg')], { wait });

    expect(clicked).toEqual(['a.jpg', 'b.jpg', 'c.jpg']);
    expect(wait).toHaveBeenCalledTimes(2);
    click.mockRestore();
  });

  test('進捗を通知する', async () => {
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
    const onProgress = vi.fn();

    await downloadFilesOneByOne([image('a.jpg'), image('b.jpg')], {
      wait: () => Promise.resolve(),
      onProgress,
    });

    expect(onProgress.mock.calls).toEqual([[1, 2], [2, 2]]);
  });
});
