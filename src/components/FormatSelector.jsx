import { useMemo } from 'react';
import { OUTPUT_FORMATS, canEncode } from '../lib/formats';
import SegmentedControl from './SegmentedControl';

const FormatSelector = ({ value, onChange, disabled }) => {
  const options = useMemo(
    () =>
      OUTPUT_FORMATS.map((format) => {
        const supported = canEncode(format.mime);
        return {
          value: format.value,
          label: format.label,
          disabled: !supported,
          title: supported ? undefined : 'このブラウザでは書き出せません',
        };
      }),
    [],
  );

  return (
    <SegmentedControl
      legend="変換後の形式"
      name="output-format"
      options={options}
      value={value}
      onChange={onChange}
      disabled={disabled}
    />
  );
};

export default FormatSelector;
