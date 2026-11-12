export const OUTPUT_FORMATS = [
  { value: 'jpeg', label: 'JPEG', mime: 'image/jpeg', extension: 'jpg', supportsAlpha: false },
  { value: 'png', label: 'PNG', mime: 'image/png', extension: 'png', supportsAlpha: true },
  { value: 'webp', label: 'WEBP', mime: 'image/webp', extension: 'webp', supportsAlpha: true },
];

export const DEFAULT_FORMAT = 'jpeg';

// JPEG / WEBP の画質。ブラウザ既定値（JPEG 0.92 / WEBP 0.8）の差をなくし、見た目とサイズの釣り合いを取る
export const ENCODE_QUALITY = 0.9;

export const MAX_FILES = 20;
export const MAX_FILE_SIZE = 50 * 1024 * 1024;

const HEIC_MIME_TYPES = ['image/heic', 'image/heif'];
const HEIC_EXTENSIONS = ['heic', 'heif'];

// react-dropzone の accept と、受け付け判定の両方で使う
export const ACCEPTED_INPUT = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
  'image/heic': ['.heic'],
  'image/heif': ['.heif'],
};

const ACCEPTED_EXTENSIONS = new Set(
  Object.values(ACCEPTED_INPUT)
    .flat()
    .map((ext) => ext.slice(1)),
);
// 一部の OS / ブラウザは JPEG を非標準の MIME タイプで渡してくる
const MIME_ALIASES = ['image/jpg', 'image/pjpeg'];
const ACCEPTED_MIME_TYPES = new Set([...Object.keys(ACCEPTED_INPUT), ...MIME_ALIASES]);

export const ACCEPTED_LABEL = 'JPEG・PNG・WEBP・HEIC';

export const findFormat = (value) => OUTPUT_FORMATS.find((format) => format.value === value);

export const getExtension = (fileName) => {
  const dot = fileName.lastIndexOf('.');
  return dot === -1 ? '' : fileName.slice(dot + 1).toLowerCase();
};

export const isHeicFile = (file) =>
  HEIC_MIME_TYPES.includes(file.type) || HEIC_EXTENSIONS.includes(getExtension(file.name));

/**
 * 受け付けられないファイルなら理由を、受け付けられるなら null を返す。
 * MIME タイプが空になるのは主に HEIC（ブラウザが種類を判別できない場合）なので、
 * その場合だけ拡張子で判定する。
 */
export const validateInputFile = (file) => {
  const extension = getExtension(file.name);
  const typeAccepted = file.type ? ACCEPTED_MIME_TYPES.has(file.type) : isHeicFile(file);

  if (!ACCEPTED_EXTENSIONS.has(extension) || !typeAccepted) {
    return `${file.name}：対応していない形式です（${ACCEPTED_LABEL}のみ）`;
  }
  if (file.size > MAX_FILE_SIZE) {
    return `${file.name}：ファイルが大きすぎます（1枚${MAX_FILE_SIZE / 1024 / 1024}MBまで）`;
  }
  return null;
};

const encodeSupportCache = new Map();

/** canvas がその形式で書き出せるか（Safari の一部バージョンは WEBP を書き出せない） */
export const canEncode = (mime) => {
  if (!encodeSupportCache.has(mime)) {
    let supported;
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;
      supported = canvas.toDataURL(mime).startsWith(`data:${mime}`);
    } catch {
      // 判定できない環境では選べるようにしておき、書き出し時の検証に任せる
      supported = true;
    }
    encodeSupportCache.set(mime, supported);
  }
  return encodeSupportCache.get(mime);
};
