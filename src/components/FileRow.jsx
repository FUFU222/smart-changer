import Thumbnail from './Thumbnail';

const MB = 1024 * 1024;

const formatBytes = (bytes) =>
  bytes >= MB ? `${(bytes / MB).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;

const FileRow = ({ file, action }) => (
  <li className="file-row">
    <Thumbnail file={file} />
    <div className="file-row__meta">
      <span className="file-row__name" title={file.name}>
        {file.name}
      </span>
      <span className="file-row__size">{formatBytes(file.size)}</span>
    </div>
    {action && (
      <button
        type="button"
        className={`icon-button${action.tone === 'primary' ? ' icon-button--primary' : ''}`}
        aria-label={action.label}
        title={action.label}
        onClick={action.onClick}
        disabled={action.disabled}
      >
        {action.icon}
      </button>
    )}
  </li>
);

export default FileRow;
