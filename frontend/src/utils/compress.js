import imageCompression from 'browser-image-compression';
import heic2any from 'heic2any';

const OPTIONS = {
  maxSizeMB: 1.5,
  maxWidthOrHeight: 1920,
  useWebWorker: true,
  fileType: 'image/jpeg',
};

/**
 * Compress a File to max 1920px / 1.5MB JPEG.
 * Returns a new File object.
 */
export const compressImage = async (file) => {
  let fileToProcess = file;
  if (file.name.toLowerCase().endsWith('.heic') || file.name.toLowerCase().endsWith('.heif')) {
    const blob = await heic2any({ blob: file, toType: 'image/jpeg' });
    const convertedBlob = Array.isArray(blob) ? blob[0] : blob;
    fileToProcess = new File([convertedBlob], file.name.replace(/\.[^.]+$/, '.jpg'), {
      type: 'image/jpeg'
    });
  }

  const compressed = await imageCompression(fileToProcess, OPTIONS);
  return new File([compressed], fileToProcess.name.replace(/\.[^.]+$/, '.jpg'), {
    type: 'image/jpeg',
  });
};

/**
 * Convert a File to an HTMLImageElement (for face-api.js processing).
 */
export const fileToImage = (file) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = reject;
    img.src = url;
  });
