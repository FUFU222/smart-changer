import { useDropzone } from 'react-dropzone';
import { ImagePlus } from 'lucide-react';
import { ACCEPTED_INPUT, ACCEPTED_LABEL, MAX_FILE_SIZE, MAX_FILES } from '../lib/formats';

const Dropzone = ({ onFilesAdded, disabled }) => {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: ACCEPTED_INPUT,
    onDrop: onFilesAdded,
    disabled,
    multiple: true,
  });

  return (
    <div {...getRootProps({ className: `dropzone${isDragActive ? ' is-active' : ''}` })}>
      <input {...getInputProps({ 'aria-label': '変換する画像を選択' })} />
      <ImagePlus className="dropzone__icon" size={32} strokeWidth={1.5} aria-hidden="true" />
      <p className="dropzone__title">{isDragActive ? 'ここで離すと追加されます' : 'ここに画像をドロップ'}</p>
      <p className="dropzone__sub">または、ここを押してファイルを選択</p>
      <p className="dropzone__meta">
        {ACCEPTED_LABEL}／最大{MAX_FILES}枚・1枚{MAX_FILE_SIZE / 1024 / 1024}MBまで
      </p>
    </div>
  );
};

export default Dropzone;
