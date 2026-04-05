import React from "react";

const FileInfo = ({ file, onRemove }) => {
  const { extension, name, size, url } = file;

  return (
    <div className="file-info">
      {extension !== 'heic' ? (
        <img src={url} alt={name} className="thumbnail" />
      ) : (
        <span className="heic-icon" aria-hidden="true"></span>
      )}
      <div className="file-details">
        <span className="file-name">{name}</span>
        <span className="file-size">{size}</span>
      </div>
      <button
        type="button"
        className="remove-button"
        aria-label={`${name}を削除`}
        onClick={onRemove}
      >
        ×
      </button>
    </div>
  );
};

export default FileInfo;
