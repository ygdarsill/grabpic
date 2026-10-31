import * as faceapi from 'face-api.js';

const MODEL_URL = "/weights";

let loaded = false;

export const loadModels = async () => {
  if (loaded) return;
  await Promise.all([
    faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
    faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
    faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
  ]);
  loaded = true;
};

let warmedUp = false;

export const warmUpModel = async () => {
  if (warmedUp) return;
  await loadModels();
  
  // Create a 1x1 dummy canvas to force WebGL shader compilation
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, 1, 1);
  
  // Run dummy inference
  await faceapi.detectSingleFace(canvas, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.1 }))
    .withFaceLandmarks()
    .withFaceDescriptor();
    
  warmedUp = true;
};

/**
 * Extract 128-d face embeddings from an HTMLImageElement or HTMLVideoElement.
 * Returns an array of Float32Array (one per face detected).
 */
export const extractEmbeddings = async (input) => {
  await loadModels();
  const detections = await faceapi
    .detectAllFaces(input, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.5 }))
    .withFaceLandmarks()
    .withFaceDescriptors();
  return detections.map((d) => Array.from(d.descriptor));
};

/**
 * Extract a single embedding from webcam/video for attendee selfie.
 * Returns the best (most confident) face descriptor or null.
 */
export const extractSingleEmbedding = async (videoEl) => {
  await loadModels();
  const detection = await faceapi
    .detectSingleFace(videoEl, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.4 }))
    .withFaceLandmarks()
    .withFaceDescriptor();
  return detection ? Array.from(detection.descriptor) : null;
};
