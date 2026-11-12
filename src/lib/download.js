// ダウンロード開始直後に Blob URL を破棄すると、Safari / Firefox で保存に失敗することがあるため少し待つ
const REVOKE_DELAY_MS = 60_000;
// 連続でダウンロードを始めると、ブラウザが2件目以降を取りこぼすことがあるため間隔をあける
const DOWNLOAD_INTERVAL_MS = 300;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const downloadFile = (file) => {
  const url = URL.createObjectURL(file);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = file.name;
  anchor.rel = 'noopener';
  anchor.style.display = 'none';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), REVOKE_DELAY_MS);
};

export const downloadFilesOneByOne = async (
  files,
  { wait = () => sleep(DOWNLOAD_INTERVAL_MS), onProgress } = {},
) => {
  for (let i = 0; i < files.length; i += 1) {
    downloadFile(files[i]);
    onProgress?.(i + 1, files.length);
    if (i < files.length - 1) {
      await wait();
    }
  }
};

export const createZip = async (files) => {
  // ZIP を使うときだけ読み込む
  const { default: JSZip } = await import('jszip');
  const zip = new JSZip();
  for (const file of files) {
    zip.file(file.name, file, { binary: true });
  }
  // 画像はすでに圧縮済みなので、再圧縮せず格納だけして速度を優先する
  return zip.generateAsync({ type: 'blob', compression: 'STORE', mimeType: 'application/zip' });
};

export const downloadAsZip = async (files, baseName) => {
  const blob = await createZip(files);
  downloadFile(new File([blob], `${baseName}.zip`, { type: 'application/zip' }));
};

/** スマートフォンの共有シート（「画像を保存」で写真に保存できる）が使えるか */
export const canShareFiles = (files) => {
  try {
    return (
      typeof navigator !== 'undefined' &&
      typeof navigator.canShare === 'function' &&
      files.length > 0 &&
      navigator.canShare({ files })
    );
  } catch {
    return false;
  }
};

export const shareFiles = (files) => navigator.share({ files });
