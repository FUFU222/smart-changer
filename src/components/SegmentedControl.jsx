import { useId } from 'react';

/**
 * ワンタップで切り替える選択肢。中身はラジオボタンなので、
 * キーボードの矢印キーやスクリーンリーダーでもそのまま操作できる。
 */
const SegmentedControl = ({ legend, legendHidden = false, name, options, value, onChange, disabled = false }) => {
  const groupId = useId();
  const selectedIndex = options.findIndex((option) => option.value === value);

  return (
    <fieldset className="segmented" disabled={disabled}>
      <legend className={legendHidden ? 'visually-hidden' : 'field-label'}>{legend}</legend>
      <div
        className="segmented__track"
        style={{ '--segment-count': options.length, '--segment-index': Math.max(selectedIndex, 0) }}
      >
        {/* 選択中の背景は1枚だけ置き、選んだ位置まで滑らせる */}
        {selectedIndex >= 0 && <span className="segmented__thumb" aria-hidden="true" />}
        {options.map((option) => {
          const id = `${groupId}-${option.value}`;
          return (
            <div className="segmented__item" key={option.value}>
              <input
                type="radio"
                id={id}
                name={name}
                value={option.value}
                checked={value === option.value}
                disabled={option.disabled}
                onChange={() => onChange(option.value)}
              />
              <label htmlFor={id} title={option.title}>
                {option.icon}
                <span>{option.label}</span>
              </label>
            </div>
          );
        })}
      </div>
    </fieldset>
  );
};

export default SegmentedControl;
