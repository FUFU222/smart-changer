import React, { useContext } from 'react';
import { useDropzone } from 'react-dropzone';
import FileInfo from './FileInfo';
import { ModalContext } from '../context/ModalContext';

const allowedExtensions = ['jpg', 'jpeg', 'png', 'heic'];
const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/heic'];

const isFileAllowed = (file) => {
  const extension = file.name.split('.').pop().toLowerCase();
  return allowedExtensions.includes(extension) && allowedMimeTypes.includes(file.type);
};

const getFileInfo = (image) => {
  const extension = image.file.name.split('.').pop().toLowerCase();
  const size = (image.file.size / (1024 * 1024)).toFixed(2) + ' MB';

  return { extension, name: image.file.name, size, url: image.url };
};

const Dropzone = ({ onDrop, uploadedImages, setUploadedImages, clearImages }) => {
  const { openModal } = useContext(ModalContext);

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "image/heic": [".heic"],
    },
    onDrop: (acceptedFiles) => {
      const validFiles = acceptedFiles.filter(file => isFileAllowed(file));
      if (validFiles.length > 0) {
        onDrop(validFiles);
      } else {
        openModal('ファイルの形式がサポートされていません', 'JPEG、PNG、またはHEIC形式のファイルを選択してください。');
      }
    },
    maxFiles: 10,
  });

  const handleRemove = (index) => {
    const imageToRemove = uploadedImages[index];
    if (imageToRemove?.url) {
      URL.revokeObjectURL(imageToRemove.url);
    }
    setUploadedImages(uploadedImages.filter((_, imageIndex) => imageIndex !== index));
  };

  return (
    <div className="dropzone-container">
      <div {...getRootProps()} className="dropzone-area">
        <input {...getInputProps()} autoComplete='off' />
        <p>③変換するファイルをドロップ</p>
      </div>

      <div className="uploaded-files-container" aria-live="polite">
        {uploadedImages.length > 0 ? (
          uploadedImages.map((image, index) => (
            <FileInfo
              key={`${image.file.name}-${image.file.lastModified}`}
              file={getFileInfo(image)}
              onRemove={() => handleRemove(index)}
            />
          ))
        ) : (
          <p className="placeholder-text">アップロードファイル一覧</p>
        )}
      </div>

      <div className="button-container">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            clearImages();
          }}
          className="clear-button"
        >
          アップロードをクリア
        </button>
      </div>
    </div>
  );
};

export default Dropzone;
