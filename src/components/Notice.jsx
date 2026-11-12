import { CircleAlert, CircleCheck, X } from 'lucide-react';

const Notice = ({ tone = 'error', title, messages = [], onDismiss }) => {
  const Icon = tone === 'error' ? CircleAlert : CircleCheck;

  return (
    <div className={`notice notice--${tone}`} role={tone === 'error' ? 'alert' : 'status'}>
      <Icon className="notice__icon" size={20} aria-hidden="true" />
      <div className="notice__body">
        <p className="notice__title">{title}</p>
        {messages.length > 0 && (
          <ul className="notice__list">
            {messages.map((message) => (
              <li key={message}>{message}</li>
            ))}
          </ul>
        )}
      </div>
      {onDismiss && (
        <button type="button" className="icon-button" aria-label="お知らせを閉じる" onClick={onDismiss}>
          <X size={18} aria-hidden="true" />
        </button>
      )}
    </div>
  );
};

export default Notice;
