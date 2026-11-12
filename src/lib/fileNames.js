const MAX_BASE_NAME_LENGTH = 50;

// パス区切り・制御文字・Windows で使えない記号
// eslint-disable-next-line no-control-regex
const UNSAFE_CHARACTERS = /[\u0000-\u001f\u007f<>:"/\\|?*]/g;

const stripExtension = (name) => {
  const dot = name.lastIndexOf('.');
  return dot > 0 ? name.slice(0, dot) : name;
};

/** 元のファイル名から、変換後の拡張子を付けた安全なファイル名を作る */
export const toOutputName = (originalName, extension) => {
  const lastSegment = originalName.split(/[/\\]/).pop() || 'image';
  const base = stripExtension(lastSegment).replace(UNSAFE_CHARACTERS, '_').trim() || 'image';
  return `${base}.${extension}`;
};

/** 同名ファイルの上書きを防ぐため、重複したら「名前 (2).jpg」のように連番を付ける */
export const createUniqueNamer = () => {
  const used = new Set();
  return (name) => {
    const dot = name.lastIndexOf('.');
    const base = dot > 0 ? name.slice(0, dot) : name;
    const ext = dot > 0 ? name.slice(dot) : '';
    let candidate = name;
    let counter = 1;
    while (used.has(candidate.toLowerCase())) {
      counter += 1;
      candidate = `${base} (${counter})${ext}`;
    }
    used.add(candidate.toLowerCase());
    return candidate;
  };
};

/** ZIP のファイル名用。日本語・英数字・ハイフン・アンダースコア以外は「_」に置き換える */
export const sanitizeBaseName = (input) => {
  const trimmed = input.trim();
  if (!trimmed) return null;
  return trimmed
    .replace(/[^\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}ー\w-]/gu, '_')
    .slice(0, MAX_BASE_NAME_LENGTH);
};

export const defaultZipBaseName = (date = new Date()) => {
  const pad = (n) => String(n).padStart(2, '0');
  return `smart-changer_${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}`;
};
