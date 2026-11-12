import { useCallback, useState } from 'react';

const read = (key, allowed, fallback) => {
  try {
    const stored = window.localStorage.getItem(key);
    return allowed.includes(stored) ? stored : fallback;
  } catch {
    // プライベートブラウズ等で localStorage が使えない場合
    return fallback;
  }
};

const write = (key, value) => {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // 保存できなくても、開いている間の選択自体は有効
  }
};

/** 端末に保存して次回も使う選択肢。保存値が選択肢にない場合は fallback を使う */
export const useStoredChoice = (key, allowed, fallback) => {
  const [value, setValue] = useState(() => read(key, allowed, fallback));

  const save = useCallback(
    (next) => {
      if (!allowed.includes(next)) return;
      setValue(next);
      write(key, next);
    },
    [key, allowed],
  );

  return [value, save];
};
