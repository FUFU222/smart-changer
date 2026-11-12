import { useCallback, useState } from 'react';
import { FileImage } from 'lucide-react';

/** ファイルのプレビュー。Blob URL は表示している間だけ作り、外れたら破棄する */
const Thumbnail = ({ file }) => {
  const [failed, setFailed] = useState(false);

  const attach = useCallback(
    (img) => {
      if (!img) return undefined;
      const url = URL.createObjectURL(file);
      img.src = url;
      return () => URL.revokeObjectURL(url);
    },
    [file],
  );

  if (failed) {
    // HEIC は Safari 以外ではプレビューできない
    return (
      <span className="thumb thumb--placeholder" aria-hidden="true">
        <FileImage size={22} strokeWidth={1.75} />
      </span>
    );
  }

  return (
    <img
      ref={attach}
      className="thumb"
      alt=""
      width={48}
      height={48}
      decoding="async"
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
};

export default Thumbnail;
