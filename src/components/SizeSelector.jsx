import { Check, Pin } from 'lucide-react';
import { SIZE_PRESETS } from '../lib/sizes';

const SizeSelector = ({ value, onChange, defaultValue, onSetDefault, disabled }) => {
  const selected = SIZE_PRESETS.find((size) => size.id === value);
  const isDefault = value === defaultValue;

  return (
    <div className="field">
      <label className="field-label" htmlFor="output-size">
        変換後のサイズ
      </label>
      <select
        id="output-size"
        className="field-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        aria-describedby="output-size-hint"
      >
        {SIZE_PRESETS.map((size) => (
          <option key={size.id} value={size.id}>
            {size.id === defaultValue ? `${size.label}［既定］` : size.label}
          </option>
        ))}
      </select>
      <div className="field-row">
        <p id="output-size-hint" className="field-hint">
          {selected?.width
            ? '縦横比が違う画像は、中央を基準にはみ出した部分を切り取ります。'
            : '画像の大きさは変えず、形式だけを変換します。'}
        </p>
        {isDefault ? (
          <span className="default-badge">
            <Check size={14} aria-hidden="true" />
            次回もこのサイズで開きます
          </span>
        ) : (
          <button type="button" className="text-button text-button--primary" onClick={() => onSetDefault(value)} disabled={disabled}>
            <Pin size={14} aria-hidden="true" />
            このサイズを既定にする
          </button>
        )}
      </div>
    </div>
  );
};

export default SizeSelector;
