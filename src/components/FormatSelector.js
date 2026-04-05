import React from "react";

const SUPPORTED_OUTPUT_FORMATS = [
  { value: "jpeg", label: "JPEG" },
  { value: "png", label: "PNG" },
  { value: "webp", label: "WEBP" },
];

const FormatSelector = ({ outputFormat, setOutputFormat }) => {
  return (
    <div className="field-group">
      <label className="field-label" htmlFor="output-format">
        ①変換後の拡張子を選択:
      </label>
      <select
        id="output-format"
        className="field-select"
        value={outputFormat}
        onChange={(e) => setOutputFormat(e.target.value)}
      >
        {SUPPORTED_OUTPUT_FORMATS.map((format) => (
          <option key={format.value} value={format.value}>
            {format.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default FormatSelector;
