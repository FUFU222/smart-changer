import { useEffect, useMemo, useRef, useState } from 'react';
import { LoaderCircle, Trash2, X } from 'lucide-react';
import { useDownloadMode } from '../hooks/useDownloadMode';
import { useStoredChoice } from '../hooks/useStoredChoice';
import { ConversionError, convertImage } from '../lib/convert';
import { canShareFiles, downloadAsZip, downloadFile, downloadFilesOneByOne, shareFiles } from '../lib/download';
import { createUniqueNamer, defaultZipBaseName, sanitizeBaseName } from '../lib/fileNames';
import { DEFAULT_FORMAT, MAX_FILES, findFormat, validateInputFile } from '../lib/formats';
import { DEFAULT_SIZE_ID, SIZE_IDS, findSize } from '../lib/sizes';
import Dropzone from './Dropzone';
import FileRow from './FileRow';
import FormatSelector from './FormatSelector';
import Notice from './Notice';
import ResultPanel from './ResultPanel';
import SizeSelector from './SizeSelector';

let idCounter = 0;
const nextId = () => {
  idCounter += 1;
  return `img-${idCounter}`;
};

const fileKey = (file) => `${file.name}:${file.size}:${file.lastModified}`;

const withName = (file, name) =>
  file.name === name ? file : new File([file], name, { type: file.type, lastModified: file.lastModified });

const unique = (messages) => [...new Set(messages)];

const prefersCoarsePointer = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(pointer: coarse)').matches === true;

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true;

const Step = ({ number, children }) => (
  <div className="step">
    <span className="step__number" aria-hidden="true">
      {number}
    </span>
    <div className="step__body">{children}</div>
  </div>
);

const ImageConverter = () => {
  const [formatValue, setFormatValue] = useState(DEFAULT_FORMAT);
  const [defaultSizeId, setDefaultSizeId] = useStoredChoice('smart-changer:default-size', SIZE_IDS, DEFAULT_SIZE_ID);
  const [sizeId, setSizeId] = useState(defaultSizeId);
  const [items, setItemsState] = useState([]);
  const [results, setResults] = useState([]);
  const [progress, setProgress] = useState(null);
  const [inputNotice, setInputNotice] = useState(null);
  const [resultNotice, setResultNotice] = useState(null);
  const [downloadMode, setDownloadMode] = useDownloadMode();
  const [zipName, setZipName] = useState('');
  const [busy, setBusy] = useState(null);

  const resultHeadingRef = useRef(null);
  const convertButtonRef = useRef(null);
  const focusResultsRef = useRef(false);
  const abortedRef = useRef(false);
  // 続けてドロップされたとき、描画前の古い一覧に上書きしないよう最新の一覧を保持する
  const itemsRef = useRef(items);

  const setItems = (next) => {
    itemsRef.current = next;
    setItemsState(next);
  };

  const isConverting = progress !== null;

  useEffect(() => {
    abortedRef.current = false;
    return () => {
      abortedRef.current = true;
    };
  }, []);

  useEffect(() => {
    if (!focusResultsRef.current || results.length === 0) return;
    focusResultsRef.current = false;
    const heading = resultHeadingRef.current;
    heading?.focus({ preventScroll: true });
    heading?.scrollIntoView?.({ block: 'start', behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
  }, [results]);

  const resultFiles = useMemo(() => results.map((result) => result.file), [results]);
  const canShare = useMemo(() => prefersCoarsePointer() && canShareFiles(resultFiles), [resultFiles]);

  // 設定や画像が変わったら、古い変換結果は捨てる
  const discardResults = () => {
    setResults([]);
    setResultNotice(null);
  };

  const handleFormatChange = (value) => {
    setFormatValue(value);
    discardResults();
  };

  const handleSizeChange = (value) => {
    setSizeId(value);
    discardResults();
  };

  const handleFilesAdded = (acceptedFiles, fileRejections) => {
    const messages = [];
    const current = itemsRef.current;
    const known = new Set(current.map((item) => fileKey(item.file)));
    const fresh = [];
    let duplicates = 0;

    for (const file of [...acceptedFiles, ...fileRejections.map((rejection) => rejection.file)]) {
      const problem = validateInputFile(file);
      if (problem) {
        messages.push(problem);
        continue;
      }
      const key = fileKey(file);
      if (known.has(key)) {
        duplicates += 1;
        continue;
      }
      known.add(key);
      fresh.push({ id: nextId(), file });
    }

    const room = MAX_FILES - current.length;
    const added = fresh.slice(0, Math.max(room, 0));
    if (fresh.length > added.length) {
      messages.push(`一度に変換できるのは${MAX_FILES}枚までです。${fresh.length - added.length}枚は追加しませんでした。`);
    }
    if (duplicates > 0) {
      messages.push(`同じファイルが${duplicates}枚含まれていたため、重複分は追加しませんでした。`);
    }

    if (added.length > 0) {
      setItems([...current, ...added]);
      discardResults();
      // キーボード操作でも、追加後すぐ変換に進めるようにする
      requestAnimationFrame(() => convertButtonRef.current?.focus());
    }
    setInputNotice(
      messages.length > 0
        ? { title: added.length > 0 ? '一部のファイルは追加できませんでした' : 'ファイルを追加できませんでした', messages: unique(messages) }
        : null,
    );
  };

  const handleRemove = (id) => {
    setItems(itemsRef.current.filter((item) => item.id !== id));
    discardResults();
  };

  const handleClear = () => {
    setItems([]);
    setInputNotice(null);
    discardResults();
  };

  const handleConvert = async () => {
    const format = findFormat(formatValue);
    const size = findSize(sizeId);
    if (!format || !size || items.length === 0) return;

    const targets = items;
    const nameUnique = createUniqueNamer();
    const converted = [];
    const failures = [];

    setInputNotice(null);
    discardResults();
    setProgress({ done: 0, total: targets.length });

    for (const [index, item] of targets.entries()) {
      if (abortedRef.current) return;
      try {
        const output = await convertImage(item.file, { format, size: size.width ? size : null });
        converted.push({ id: item.id, file: withName(output, nameUnique(output.name)) });
      } catch (error) {
        failures.push(error instanceof ConversionError ? error.message : `${item.file.name}：変換に失敗しました`);
      }
      setProgress({ done: index + 1, total: targets.length });
    }

    setProgress(null);
    if (converted.length > 0) {
      focusResultsRef.current = true;
      setResults(converted);
    }
    if (failures.length > 0) {
      setInputNotice({
        title:
          converted.length > 0
            ? `${failures.length}枚を変換できませんでした`
            : '画像を変換できませんでした',
        messages: unique(failures),
      });
    }
  };

  const runDownload = async (task) => {
    setResultNotice(null);
    try {
      await task();
    } catch (error) {
      if (error?.name === 'AbortError') return; // 共有シートを閉じただけ
      setResultNotice({ title: '保存できませんでした', messages: ['時間をおいて、もう一度お試しください。'] });
    } finally {
      setBusy(null);
    }
  };

  const handleDownloadAll = () =>
    runDownload(async () => {
      if (resultFiles.length === 1) {
        downloadFile(resultFiles[0]);
      } else if (downloadMode === 'zip') {
        setBusy({ type: 'zip' });
        await downloadAsZip(resultFiles, sanitizeBaseName(zipName) ?? defaultZipBaseName());
      } else {
        setBusy({ type: 'individual', done: 0, total: resultFiles.length });
        await downloadFilesOneByOne(resultFiles, {
          onProgress: (done, total) => setBusy({ type: 'individual', done, total }),
        });
      }
    });

  const handleDownloadOne = (file) => runDownload(async () => downloadFile(file));

  const handleShare = () => runDownload(() => shareFiles(resultFiles));

  return (
    <>
      <section className="card converter" aria-label="画像の変換">
        <Step number={1}>
          <FormatSelector value={formatValue} onChange={handleFormatChange} disabled={isConverting} />
        </Step>

        <Step number={2}>
          <SizeSelector
            value={sizeId}
            onChange={handleSizeChange}
            defaultValue={defaultSizeId}
            onSetDefault={setDefaultSizeId}
            disabled={isConverting}
          />
        </Step>

        <Step number={3}>
          <p className="field-label" id="files-label">
            変換する画像
          </p>
          <Dropzone onFilesAdded={handleFilesAdded} disabled={isConverting} />

          {items.length > 0 && (
            <>
              <div className="file-list__header">
                <span>
                  {items.length} / {MAX_FILES}枚
                </span>
                <button type="button" className="text-button" onClick={handleClear} disabled={isConverting}>
                  <Trash2 size={16} aria-hidden="true" />
                  すべて削除
                </button>
              </div>
              <ul className="file-list" aria-labelledby="files-label">
                {items.map((item) => (
                  <FileRow
                    key={item.id}
                    file={item.file}
                    action={{
                      label: `${item.file.name}を削除`,
                      icon: <X size={18} aria-hidden="true" />,
                      onClick: () => handleRemove(item.id),
                      disabled: isConverting,
                    }}
                  />
                ))}
              </ul>
            </>
          )}
        </Step>

        {inputNotice && (
          <Notice title={inputNotice.title} messages={inputNotice.messages} onDismiss={() => setInputNotice(null)} />
        )}

        <Step number={4}>
          <button
            ref={convertButtonRef}
            type="button"
            className="button button--primary button--block"
            onClick={handleConvert}
            disabled={items.length === 0 || isConverting}
          >
            {isConverting && <LoaderCircle size={20} className="spin" aria-hidden="true" />}
            {isConverting
              ? `変換中… ${progress.done} / ${progress.total}`
              : items.length > 0
                ? `${items.length}枚を変換する`
                : '画像を追加すると変換できます'}
          </button>
          {isConverting && (
            <progress className="progress" max={progress.total} value={progress.done} aria-label="変換の進み具合" />
          )}
          <p className="visually-hidden" role="status">
            {isConverting ? `${progress.total}枚中${progress.done}枚を変換しました` : ''}
          </p>
        </Step>
      </section>

      {results.length > 0 && (
        <ResultPanel
          headingRef={resultHeadingRef}
          results={results}
          mode={downloadMode}
          onModeChange={setDownloadMode}
          zipName={zipName}
          onZipNameChange={setZipName}
          onDownloadAll={handleDownloadAll}
          onDownloadOne={handleDownloadOne}
          canShare={canShare}
          onShare={handleShare}
          busy={busy}
          notice={
            resultNotice && (
              <Notice
                title={resultNotice.title}
                messages={resultNotice.messages}
                onDismiss={() => setResultNotice(null)}
              />
            )
          }
          onReset={handleClear}
        />
      )}
    </>
  );
};

export default ImageConverter;
