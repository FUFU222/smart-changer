import { useStoredChoice } from './useStoredChoice';

export const DOWNLOAD_MODES = ['zip', 'individual'];

/** 保存方法（ZIP / 1枚ずつ）。次に開いたときも同じ方法を選んだ状態にする */
export const useDownloadMode = () => useStoredChoice('smart-changer:download-mode', DOWNLOAD_MODES, 'zip');
