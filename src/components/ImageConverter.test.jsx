import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import ImageConverter from './ImageConverter';
import { convertImage } from '../lib/convert';
import { downloadAsZip, downloadFile, downloadFilesOneByOne } from '../lib/download';

vi.mock('../lib/convert', async (importOriginal) => ({
  ...(await importOriginal()),
  convertImage: vi.fn(),
}));

vi.mock('../lib/download', async (importOriginal) => ({
  ...(await importOriginal()),
  downloadAsZip: vi.fn(),
  downloadFile: vi.fn(),
  downloadFilesOneByOne: vi.fn(),
}));

const png = (name) => new File(['x'], name, { type: 'image/png', lastModified: 1 });

const toJpeg = async (file) => new File(['y'], file.name.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg' });

const setup = () => {
  const user = userEvent.setup({ applyAccept: false });
  const view = render(<ImageConverter />);
  const input = () => view.container.querySelector('input[type="file"]');
  return { user, view, input };
};

const addAndConvert = async ({ user, input }, files) => {
  await user.upload(input(), files);
  await user.click(await screen.findByRole('button', { name: `${files.length}枚を変換する` }));
  return screen.findByRole('heading', { name: new RegExp(`変換が完了しました（${files.length}枚）`) });
};

describe('ImageConverter', () => {
  beforeEach(() => {
    vi.mocked(convertImage).mockReset().mockImplementation(toJpeg);
    vi.mocked(downloadAsZip).mockReset().mockResolvedValue();
    vi.mocked(downloadFile).mockReset();
    vi.mocked(downloadFilesOneByOne).mockReset().mockResolvedValue();
  });

  test('画像がないうちは変換ボタンを押せない', () => {
    setup();
    expect(screen.getByRole('button', { name: '画像を追加すると変換できます' })).toBeDisabled();
  });

  test('既定では ZIP でまとめてダウンロードする', async () => {
    const ctx = setup();
    await addAndConvert(ctx, [png('a.png'), png('b.png')]);

    await ctx.user.click(screen.getByRole('button', { name: 'ZIPでダウンロード（2枚）' }));

    expect(downloadAsZip).toHaveBeenCalledTimes(1);
    const [files, baseName] = vi.mocked(downloadAsZip).mock.calls[0];
    expect(files.map((f) => f.name)).toEqual(['a.jpg', 'b.jpg']);
    expect(baseName).toMatch(/^smart-changer_\d{8}$/);
  });

  test('ワンタップで「1枚ずつ」に切り替えて個別にダウンロードできる', async () => {
    const ctx = setup();
    await addAndConvert(ctx, [png('a.png'), png('b.png')]);

    await ctx.user.click(screen.getByRole('radio', { name: '1枚ずつ' }));
    expect(screen.queryByLabelText('ZIPのファイル名')).not.toBeInTheDocument();

    await ctx.user.click(screen.getByRole('button', { name: '2枚をダウンロード' }));

    expect(downloadFilesOneByOne).toHaveBeenCalledTimes(1);
    expect(vi.mocked(downloadFilesOneByOne).mock.calls[0][0].map((f) => f.name)).toEqual(['a.jpg', 'b.jpg']);
    expect(downloadAsZip).not.toHaveBeenCalled();
  });

  test('選んだ保存方法は次回も引き継がれる', async () => {
    const first = setup();
    await addAndConvert(first, [png('a.png'), png('b.png')]);
    await first.user.click(screen.getByRole('radio', { name: '1枚ずつ' }));
    first.view.unmount();

    const second = setup();
    await addAndConvert(second, [png('a.png'), png('b.png')]);
    expect(screen.getByRole('radio', { name: '1枚ずつ' })).toBeChecked();
  });

  test('変換後の画像は1枚ずつ個別にも保存できる', async () => {
    const ctx = setup();
    await addAndConvert(ctx, [png('a.png'), png('b.png')]);

    await ctx.user.click(screen.getByRole('button', { name: 'b.jpgをダウンロード' }));

    expect(downloadFile).toHaveBeenCalledWith(expect.objectContaining({ name: 'b.jpg' }));
  });

  test('変換後のファイル名が重なっても上書きしない', async () => {
    const ctx = setup();
    await addAndConvert(ctx, [png('photo.png'), new File(['z'], 'photo.webp', { type: 'image/webp' })]);

    const list = screen.getByRole('list', { name: '変換後の画像' });
    expect(within(list).getByText('photo.jpg')).toBeInTheDocument();
    expect(within(list).getByText('photo (2).jpg')).toBeInTheDocument();
  });

  test('一部の画像が失敗しても、成功した分は保存できる', async () => {
    const { ConversionError } = await import('../lib/convert');
    vi.mocked(convertImage).mockImplementation(async (file) => {
      if (file.name === 'bad.png') throw new ConversionError('bad.png：画像を読み込めませんでした');
      return toJpeg(file);
    });
    const ctx = setup();
    await ctx.user.upload(ctx.input(), [png('ok.png'), png('bad.png')]);
    await ctx.user.click(await screen.findByRole('button', { name: '2枚を変換する' }));

    expect(await screen.findByRole('heading', { name: /変換が完了しました（1枚）/ })).toBeInTheDocument();
    const alerts = screen.getAllByRole('alert');
    expect(alerts).toHaveLength(1);
    expect(alerts[0]).toHaveTextContent('1枚を変換できませんでした');
    expect(alerts[0]).toHaveTextContent('bad.png：画像を読み込めませんでした');
  });

  test('非対応の形式は理由を示して追加しない', async () => {
    const ctx = setup();
    await ctx.user.upload(ctx.input(), [new File(['g'], 'anim.gif', { type: 'image/gif' })]);

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('ファイルを追加できませんでした');
    expect(alert).toHaveTextContent('anim.gif：対応していない形式です');
    expect(screen.getByRole('button', { name: '画像を追加すると変換できます' })).toBeDisabled();
  });

  test('同じファイルは二重に追加しない', async () => {
    const ctx = setup();
    // 同じファイルを選び直すと、中身が同じ別の File オブジェクトになる
    await ctx.user.upload(ctx.input(), [png('a.png')]);
    await ctx.user.upload(ctx.input(), [png('a.png')]);

    expect(await screen.findByRole('alert')).toHaveTextContent('重複分は追加しませんでした');
    expect(screen.getByRole('button', { name: '1枚を変換する' })).toBeEnabled();
  });

  test('選んだサイズを既定にすると、次に開いたときもそのサイズになる', async () => {
    const first = setup();
    const select = screen.getByLabelText('変換後のサイズ');
    expect(select).toHaveValue('blog');
    expect(screen.getByText('次回もこのサイズで開きます')).toBeInTheDocument();

    await first.user.selectOptions(select, 'square');
    await first.user.click(screen.getByRole('button', { name: 'このサイズを既定にする' }));
    expect(screen.getByText('次回もこのサイズで開きます')).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /1080×1080.*［既定］/ })).toBeInTheDocument();
    first.view.unmount();

    setup();
    expect(screen.getByLabelText('変換後のサイズ')).toHaveValue('square');
  });

  test('既定を変えずにサイズを選んだだけなら、次回は元の既定に戻る', async () => {
    const first = setup();
    await first.user.selectOptions(screen.getByLabelText('変換後のサイズ'), 'hd');
    expect(screen.getByRole('button', { name: 'このサイズを既定にする' })).toBeInTheDocument();
    first.view.unmount();

    setup();
    expect(screen.getByLabelText('変換後のサイズ')).toHaveValue('blog');
  });

  test('保存された既定値が不正なら標準のサイズを使う', () => {
    window.localStorage.setItem('smart-changer:default-size', 'nope');
    setup();
    expect(screen.getByLabelText('変換後のサイズ')).toHaveValue('blog');
  });

  test('続けて追加しても先に追加した画像は消えない', async () => {
    const ctx = setup();
    await ctx.user.upload(ctx.input(), [png('a.png')]);
    await ctx.user.upload(ctx.input(), [png('b.png'), png('c.png')]);

    expect(await screen.findByRole('button', { name: '3枚を変換する' })).toBeEnabled();
  });

  test('設定を変えたら古い変換結果は消える', async () => {
    const ctx = setup();
    await addAndConvert(ctx, [png('a.png')]);

    await ctx.user.click(screen.getByRole('radio', { name: 'PNG' }));

    expect(screen.queryByRole('heading', { name: /変換が完了しました/ })).not.toBeInTheDocument();
  });
});
