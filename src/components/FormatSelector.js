import React from 'react';

const FormatSelector = ({ outputFormat, setOutputFormat }) => {
  return (
    <div>
      <label>①変換後の拡張子を選択:</label>
      <select value={outputFormat} onChange={(e) => setOutputFormat(e.target.value)}>
        <option value="jpeg">JPEG</option>
        <option value="png">PNG</option>
        <option value="webp">WEBP</option>
        <option value="gif">GIF</option>
        <option value="bmp">BMP</option>
        <option value="tiff">TIFF</option>
        <option value="svg">SVG</option>
      </select>
    </div>
  );
};


export default FormatSelector;