import React, { useContext, useState, useRef } from 'react';
import heic2any from 'heic2any'
import { ModalContext } from '../context/ModalContext';
import Dropzone from './Dropzone';
import FormatSelector from './FormatSelector';
import SizeSelector from './SizeSelector';
// import imageCompression from 'browser-image-compression';
import CustomModal from './CustomModal';

const SUPPORTED_OUTPUT_FORMATS = new Set(['jpeg', 'png', 'webp']);

const ImageConverter = () => {
  const { showModal } = useContext(ModalContext);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [convertedImages, setConvertedImages] = useState([]);
  const [outputFormat, setOutputFormat] = useState('jpeg');
  const [selectedSize, setSelectedSize] = useState('1200x1200 (ブログ記事など)');
  const convertButtonRef = useRef(null); 

  const standardSizes = [
    { label: '2400x3600 (A4プリント)', width: 2400, height: 3600 },  // 印刷向けのA4サイズ
    { label: '1920x1080 (フルHD)', width: 1920, height: 1080 },  // フルスクリーン表示向け
    { label: '1080x1920 (スマホ向け縦画像)', width: 1080, height: 1920 },  // Instagram StoriesやTikTok向けの縦長サイズ
    { label: '1280x720 (HD)', width: 1280, height: 720 },  // YouTubeなどHDコンテンツ向け
    { label: '1200x1200 (ブログ記事など)', width: 1200, height: 1200 },  // 発注者が最も使用する形式
    { label: '1080x1080 (Instagramフィード)', width: 1080, height: 1080 },  // InstagramやSNS向けの正方形
    { label: '1024x768 (XGA（低解像度）)', width: 1024, height: 768 },  // 古い解像度のモニター向け
    { label: '800x600 (Webサムネイル)', width: 800, height: 600 },  // 小さめのウェブ画像やサムネイル
  ];
  

  // convertImageToBlob関数の定義 - 画像を圧縮してBlobに変換する
  // const convertImageToBlob = async (image, options) => {
  //   try {
  //     if (image.file.type === 'image/heic') {
  //       const convertedBlob = await heic2any({ blob: image.file, toType: 'image/jpeg' });
  //       return new Blob([convertedBlob], { type: 'image/jpeg' });
  //     } else {
  //       const compressedImage = await imageCompression(image.file, options);
  //       const convertedBlob = await imageCompression(compressedImage, { fileType: `image/${outputFormat}` });
  //       return convertedBlob;
  //     }
  //   } catch (error) {
  //     console.error("画像変換エラー:", error);
  //     throw new Error("画像変換に失敗しました");
  //   }
  // };  

  // onDrop関数の再定義 - ファイルをアップロード時の処理
  const onDrop = (acceptedFiles) => {
    // 画像ファイルのみ受け付けるようフィルタリング
    const filteredFiles = acceptedFiles.filter(file => file.type.startsWith('image/'));
    // もし非画像ファイルが含まれていたらエラーメッセージを表示
    if (filteredFiles.length < acceptedFiles.length) {
      showModal("error", "画像ファイルのみをアップロードしてください。");
    }
    // 重複チェック - 既にアップロード済みの画像は追加しない
    const newImages = filteredFiles.filter(
      (file) => !uploadedImages.some(image => image.file.name === file.name)
    ).map(file => ({
      file,
      url: URL.createObjectURL(file)
    }));
    // 新しい画像が存在する場合のみ状態を更新
    if (newImages.length > 0) {
      setUploadedImages(prevImages => [...prevImages, ...newImages]);
    }
    if(convertButtonRef.current) {
      convertButtonRef.current.focus()
    }
  };
  //画像をリサイズする関数
  const resizeAndCropImage = (file, targetWidth, targetHeight, format) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const sourceUrl = URL.createObjectURL(file);
      img.src = sourceUrl;
      img.onload = () => {
        const aspectRatio = img.width / img.height;
        const targetAspectRatio = targetWidth / targetHeight;
  
        let drawWidth, drawHeight, offsetX, offsetY;
  
        if (aspectRatio > targetAspectRatio) {
          // 画像が横長の場合
          drawHeight = targetHeight;
          drawWidth = targetHeight * aspectRatio;
          offsetX = (drawWidth - targetWidth) / 2;
          offsetY = 0;
        } else {
          // 画像が縦長の場合
          drawWidth = targetWidth;
          drawHeight = targetWidth / aspectRatio;
          offsetX = 0;
          offsetY = (drawHeight - targetHeight) / 2;
        }
  
        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, -offsetX, -offsetY, drawWidth, drawHeight);
  
        canvas.toBlob((blob) => {
          URL.revokeObjectURL(sourceUrl);
          if (!blob) {
            reject(new Error('画像Blobの生成に失敗しました'));
            return;
          }
          const baseName = file.name.replace(/\.[^/.]+$/, "");
          resolve(new File([blob], `${baseName}.${format}`, { type: `image/${format}` }));
      }, `image/${format}`);
      };
      img.onerror = (error) => {
        URL.revokeObjectURL(sourceUrl);
        reject(error);
      };
    });
  };
  // const resizeImage = (file, width, height) => {
  //   return new Promise((resolve, reject) => {
  //     const img = new Image();
  //     img.src = URL.createObjectURL(file);
  //     img.onload = () => {
  //       const canvas = document.createElement('canvas');
  //       canvas.width = width;
  //       canvas.height = height;
  //       const ctx = canvas.getContext('2d');
  //       ctx.drawImage(img, 0, 0, width, height);
  //       canvas.toBlob((blob) => {
  //         resolve(new File([blob], file.name, { type: file.type }));
  //       }, file.type);
  //     };
  //     img.onerror = (error) => reject(error);
  //   });
  // };
  //heicファイルを指定した拡張子に変換
  const convertHeicToFormat = async (file, format) => {
    try {
      const convertedBlob = await heic2any({
        blob: file,
        toType: `image/${format}`
      });
      return new File([convertedBlob], file.name.replace(/\.heic$/, `.${format}`), {
        type: `image/${format}`
      });
    } catch (error) {
      console.error('HEIC変換エラー:', error);
      throw new Error('HEICファイルの変換に失敗しました');
    }
  };
  //画像の変換関数
  const convertAllImages = async () => {
    const selectedOption = standardSizes.find((size) => size.label === selectedSize);
    const width = selectedOption?.width;
    const height = selectedOption?.height;

    if (!SUPPORTED_OUTPUT_FORMATS.has(outputFormat)) {
      showModal("error", "JPEG、PNG、WEBPのいずれかを選択してください。");
      return;
    }

    if (width && height && uploadedImages.length > 0) {
      try {
        showModal("processing");
        const converted = [];
        for (const image of uploadedImages) {
          let convertedImage;
          if (image.file.type === 'image/heic') {
            convertedImage = await convertHeicToFormat(image.file, outputFormat);
          } else {
            convertedImage = image.file;
          }
          
          const resizedImage = await resizeAndCropImage(convertedImage, width, height, outputFormat);
          converted.push(resizedImage);
        }
        setConvertedImages(converted);
        showModal("conversionComplete");
      } catch (error) {
        showModal("error", "画像変換中にエラーが発生しました。");
        console.error("変換エラー:", error);
      }
    } else {
      showModal("error", "変換する画像が存在しないか、サイズが正しく選択されていません。");
    }
  };
  // 画像配列がキャッシュされないよう削除する関数
  const clearImages = () => {
    uploadedImages.forEach((image) => {
      URL.revokeObjectURL(image.url);
    });
    setUploadedImages([]);
    setConvertedImages([]);
  };
  // useEffectを使用したstate更新に応じた画像配列削除処理を確認するテストコード
  // useEffect(() => {
  //   console.log('クリア後のuploadedImages:', uploadedImages);
  // }, [uploadedImages]);
  
  
  

  return (
    <div className="converter-panel">
      <FormatSelector outputFormat={outputFormat} setOutputFormat={setOutputFormat} />
      <SizeSelector
        standardSizes={standardSizes}
        selectedSize={selectedSize} setSelectedSize={setSelectedSize}
      />
      <Dropzone onDrop={onDrop} uploadedImages={uploadedImages} setUploadedImages={setUploadedImages} clearImages={clearImages}/>
      <button ref={convertButtonRef} className="convert-button" 
      onClick={convertAllImages}>④画像を変換する</button>
      <CustomModal images={convertedImages} clearImages={clearImages} outputFormat={outputFormat}/>
    </div>
  );
};


export default ImageConverter;
