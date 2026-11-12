import { ENCODE_QUALITY, isHeicFile } from './formats';
import { toOutputName } from './fileNames';

// iOS Safari の canvas 面積上限（4096 x 4096）。超えると描画できないため、この範囲に収めて書き出す
export const SAFE_CANVAS_PIXELS = 16_777_216;
// これを超える画像は展開時にメモリを使い果たすおそれがあるため変換しない
export const MAX_SOURCE_PIXELS = 200_000_000;

export class ConversionError extends Error {}

/** 出力サイズを完全に覆うように、元画像の中央から切り出す範囲を求める */
export const computeCoverCrop = (srcWidth, srcHeight, dstWidth, dstHeight) => {
  const srcRatio = srcWidth / srcHeight;
  const dstRatio = dstWidth / dstHeight;
  if (Math.abs(srcRatio - dstRatio) < 1e-6) {
    return { sx: 0, sy: 0, sw: srcWidth, sh: srcHeight };
  }
  if (srcRatio > dstRatio) {
    const sw = srcHeight * dstRatio;
    return { sx: (srcWidth - sw) / 2, sy: 0, sw, sh: srcHeight };
  }
  const sh = srcWidth / dstRatio;
  return { sx: 0, sy: (srcHeight - sh) / 2, sw: srcWidth, sh };
};

export const fitWithinPixelLimit = (width, height, limit) => {
  if (width * height <= limit) return { width, height };
  const scale = Math.sqrt(limit / (width * height));
  return { width: Math.floor(width * scale), height: Math.floor(height * scale) };
};

let heicModule;
const loadHeicDecoder = () => {
  // 3MB ほどあるため、HEIC を変換するときだけ読み込む。CSP で eval を禁止しても動く版を使う
  heicModule ??= import('heic-to/csp');
  return heicModule;
};

const decodeWithImageElement = (file) =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new ConversionError(`${file.name}：画像を読み込めませんでした`));
    };
    img.src = url;
  });

/** 画像を描画可能な形に読み込む。HEIC は Safari なら直接、それ以外のブラウザでは heic-to で読む */
export const decodeImage = async (file) => {
  try {
    return await createImageBitmap(file, { imageOrientation: 'from-image' });
  } catch {
    if (isHeicFile(file)) {
      try {
        const { heicTo } = await loadHeicDecoder();
        return await heicTo({ blob: file, type: 'bitmap' });
      } catch {
        throw new ConversionError(`${file.name}：HEICファイルを読み込めませんでした`);
      }
    }
    // createImageBitmap が使えない・読めない場合は img 要素で読み直す
    return decodeWithImageElement(file);
  }
};

const sourceSize = (source) => ({
  width: source.naturalWidth || source.width,
  height: source.naturalHeight || source.height,
});

const canvasToBlob = (canvas, mime, quality) =>
  new Promise((resolve) => {
    canvas.toBlob(resolve, mime, quality);
  });

const render = async (source, crop, width, height, format) => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d', { alpha: format.supportsAlpha });
  if (!ctx) return null;

  if (!format.supportsAlpha) {
    // 透過 PNG を JPEG にすると透過部分が黒くなるため、白で塗ってから描く
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
  }
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(source, crop.sx, crop.sy, crop.sw, crop.sh, 0, 0, width, height);

  const blob = await canvasToBlob(canvas, format.mime, ENCODE_QUALITY);
  // Safari は大きな canvas を使い回すとメモリ上限に達しやすいので、すぐに解放する
  canvas.width = 0;
  canvas.height = 0;
  return blob;
};

/**
 * 1枚の画像を指定の形式・サイズに変換する。
 * size が null の場合は元のサイズのまま形式だけ変える。
 */
export const convertImage = async (file, { format, size }) => {
  const source = await decodeImage(file);
  try {
    const { width: srcWidth, height: srcHeight } = sourceSize(source);
    if (!srcWidth || !srcHeight) {
      throw new ConversionError(`${file.name}：画像を読み込めませんでした`);
    }
    if (srcWidth * srcHeight > MAX_SOURCE_PIXELS) {
      throw new ConversionError(`${file.name}：解像度が大きすぎるため変換できません`);
    }

    const target = size ? { width: size.width, height: size.height } : { width: srcWidth, height: srcHeight };
    const crop = size
      ? computeCoverCrop(srcWidth, srcHeight, size.width, size.height)
      : { sx: 0, sy: 0, sw: srcWidth, sh: srcHeight };

    let blob = await render(source, crop, target.width, target.height, format);
    if (!blob) {
      // canvas の上限を超えた場合は、比率を保ったまま上限内に縮めて書き出す
      const safe = fitWithinPixelLimit(target.width, target.height, SAFE_CANVAS_PIXELS);
      blob = await render(source, crop, safe.width, safe.height, format);
    }
    if (!blob) {
      throw new ConversionError(`${file.name}：画像の書き出しに失敗しました`);
    }
    if (blob.type !== format.mime) {
      throw new ConversionError(`このブラウザは${format.label}への書き出しに対応していません`);
    }

    return new File([blob], toOutputName(file.name, format.extension), {
      type: format.mime,
      lastModified: Date.now(),
    });
  } finally {
    source.close?.();
  }
};
