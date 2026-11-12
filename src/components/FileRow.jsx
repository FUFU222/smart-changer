import { Check, LoaderCircle, X } from 'lucide-react';
import Thumbnail from './Thumbnail';

const MB = 1024 * 1024;

const formatBytes = (bytes) =>
  bytes >= MB ? `${(bytes / MB).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;

// 変換の状態。見た目はサムネイルの上の印で示し、読み上げ用には文字でも添える
const STATUS_LABELS = {
  converting: '変換中',
  done: '変換済み',
  failed: '変換できませんでした',
};

const StatusMark = ({ status }) => {
  if (status === 'converting') {
    return (
      <span className="file-row__overlay" aria-hidden="true">
        <LoaderCircle size={20} className="spin" />
      </span>
    );
  }
  if (status === 'done' || status === 'failed') {
    const Icon = status === 'done' ? Check : X;
    return (
      <span className={`file-row__badge file-row__badge--${status}`} aria-hidden="true">
        <Icon size={12} strokeWidth={3} />
      </span>
    );
  }
  return null;
};

const FileRow = ({ file, action, status }) => (
  <li className="file-row">
    <span className="file-row__thumb">
      <Thumbnail file={file} />
      <StatusMark status={status} />
    </span>
    <div className="file-row__meta">
      <span className="file-row__name" title={file.name}>
        {file.name}
      </span>
      <span className="file-row__size">
        {formatBytes(file.size)}
        {STATUS_LABELS[status] && <span className="visually-hidden">（{STATUS_LABELS[status]}）</span>}
      </span>
    </div>
    {action && (
      <button
        type="button"
        className={`icon-button${action.tone ? ` icon-button--${action.tone}` : ''}`}
        aria-label={action.label}
        title={action.title ?? action.label}
        onClick={action.onClick}
        disabled={action.disabled}
      >
        {action.icon}
      </button>
    )}
  </li>
);

export default FileRow;
