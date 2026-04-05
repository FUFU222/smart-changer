import JSZip from "jszip";
import { saveAs } from "file-saver";

const getZipEntryName = (image, format) => {
  return image.name || `converted-image.${format}`;
};

// Zipファイルに変換しダウンロード
const downloadAsZip = async (images, fileName, format) => {
  try {
    const sanitizedFileName = fileName.trim() ? fileName : 'converted_images';
    const zip = new JSZip();
    for (const image of images) {
      zip.file(getZipEntryName(image, format), image);
    }
    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, `${sanitizedFileName}.zip`);
  } catch (error) {
    throw new Error("Zipダウンロード中にエラーが発生しました");
  }
};


export { downloadAsZip, getZipEntryName };
