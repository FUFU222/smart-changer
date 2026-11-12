export const SIZE_PRESETS = [
  { id: 'original', label: '元のサイズのまま（形式だけ変換）', width: null, height: null },
  { id: 'print', label: '2400×3600（印刷向け・縦2:3）', width: 2400, height: 3600 },
  { id: 'full-hd', label: '1920×1080（フルHD）', width: 1920, height: 1080 },
  { id: 'vertical', label: '1080×1920（スマホ向け縦画像）', width: 1080, height: 1920 },
  { id: 'hd', label: '1280×720（HD）', width: 1280, height: 720 },
  { id: 'blog', label: '1200×1200（ブログ記事など）', width: 1200, height: 1200 },
  { id: 'square', label: '1080×1080（Instagramフィード）', width: 1080, height: 1080 },
  { id: 'xga', label: '1024×768（XGA）', width: 1024, height: 768 },
  { id: 'thumbnail', label: '800×600（Webサムネイル）', width: 800, height: 600 },
];

// 最もよく使われるサイズ
export const DEFAULT_SIZE_ID = 'blog';

export const findSize = (id) => SIZE_PRESETS.find((size) => size.id === id);

export const SIZE_IDS = SIZE_PRESETS.map((size) => size.id);
