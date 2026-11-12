import { Check, CircleCheck, Download, FileArchive, Files, LoaderCircle, RotateCcw, Share } from 'lucide-react';
import { defaultZipBaseName } from '../lib/fileNames';
import FileRow from './FileRow';
import SegmentedControl from './SegmentedControl';

const MODE_OPTIONS = [
  { value: 'zip', label: 'ZIPでまとめて', icon: <FileArchive size={18} aria-hidden="true" /> },
  { value: 'individual', label: '1枚ずつ', icon: <Files size={18} aria-hidden="true" /> },
];

/**
 * 保存方法の切り替えに合わせて、高さを滑らかに開け閉めする欄。
 * 閉じている間は inert にして、キーボード操作や読み上げの対象から外す。
 */
const Collapse = ({ open, children }) => (
  <div className="collapse" data-open={open} inert={!open} aria-hidden={open ? undefined : true}>
    <div className="collapse__inner">{children}</div>
  </div>
);

const primaryLabel = ({ count, mode, busy }) => {
  if (busy?.type === 'zip') return 'ZIPを作成中…';
  if (busy?.type === 'individual') return `保存中… ${busy.done} / ${busy.total}`;
  if (count === 1) return 'ダウンロード';
  return mode === 'zip' ? `ZIPでダウンロード（${count}枚）` : `${count}枚をダウンロード`;
};

const ResultPanel = ({
  headingRef,
  results,
  mode,
  onModeChange,
  zipName,
  onZipNameChange,
  onDownloadAll,
  onDownloadOne,
  savedIds,
  canShare,
  onShare,
  busy,
  notice,
  onReset,
}) => {
  const count = results.length;
  const isBatch = count > 1;
  const isBusy = Boolean(busy);
  const showShare = canShare && (!isBatch || mode === 'individual');
  const PrimaryIcon = isBusy ? LoaderCircle : isBatch && mode === 'zip' ? FileArchive : Download;

  return (
    <section className="card result" aria-labelledby="result-heading">
      <h2 id="result-heading" className="result__heading" ref={headingRef} tabIndex={-1}>
        <CircleCheck size={22} aria-hidden="true" />
        変換が完了しました（{count}枚）
      </h2>

      {isBatch && (
        <SegmentedControl
          legend="保存方法"
          name="download-mode"
          options={MODE_OPTIONS}
          value={mode}
          onChange={onModeChange}
          disabled={isBusy}
        />
      )}

      {isBatch && (
        <div>
          <Collapse open={mode === 'zip'}>
            <div className="field">
              <label className="field-label" htmlFor="zip-name">
                ZIPのファイル名
              </label>
              <div className="input-suffix">
                <input
                  id="zip-name"
                  type="text"
                  inputMode="text"
                  autoComplete="off"
                  spellCheck={false}
                  value={zipName}
                  placeholder={defaultZipBaseName()}
                  maxLength={50}
                  onChange={(e) => onZipNameChange(e.target.value)}
                  disabled={isBusy}
                />
                <span aria-hidden="true">.zip</span>
              </div>
            </div>
          </Collapse>
          <Collapse open={mode === 'individual'}>
            <p className="field-hint">
              ファイルを続けて保存します。ブラウザに複数ファイルのダウンロードを確認されたら「許可」を選んでください。
            </p>
          </Collapse>
        </div>
      )}

      <div className="actions">
        <button type="button" className="button button--primary" onClick={onDownloadAll} disabled={isBusy}>
          <PrimaryIcon size={20} className={isBusy ? 'spin' : undefined} aria-hidden="true" />
          {primaryLabel({ count, mode, busy })}
        </button>
        {showShare && (
          <button type="button" className="button button--secondary" onClick={onShare} disabled={isBusy}>
            <Share size={20} aria-hidden="true" />
            共有・写真に保存
          </button>
        )}
      </div>

      {notice}

      <ul className="file-list" aria-label="変換後の画像">
        {results.map((result) => {
          // ダウンロード済みならチェックに変える。押せばもう一度ダウンロードできる
          const saved = savedIds.has(result.id);
          return (
            <FileRow
              key={result.id}
              file={result.file}
              action={{
                label: saved ? `${result.file.name}をもう一度ダウンロード` : `${result.file.name}をダウンロード`,
                title: saved ? 'ダウンロード済み（押すともう一度ダウンロードします）' : undefined,
                icon: saved ? (
                  <Check key="saved" size={18} className="icon-pop" aria-hidden="true" />
                ) : (
                  <Download key="download" size={18} aria-hidden="true" />
                ),
                onClick: () => onDownloadOne(result),
                disabled: isBusy,
                tone: saved ? 'success' : 'primary',
              }}
            />
          );
        })}
      </ul>

      <button type="button" className="button button--ghost" onClick={onReset} disabled={isBusy}>
        <RotateCcw size={18} aria-hidden="true" />
        最初からやり直す
      </button>
    </section>
  );
};

export default ResultPanel;
