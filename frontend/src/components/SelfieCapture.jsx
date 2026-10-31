import React, { useRef, useState, useEffect } from 'react';
import { extractSingleEmbedding, loadModels } from '../utils/faceEngine';

export default function SelfieCapture({ onVector, disabled }) {
  const videoRef = useRef();
  const [stream, setStream] = useState(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [status, setStatus] = useState('idle');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    setStatus('loading');
    loadModels()
      .then(() => {
        setModelsLoaded(true);
        setStatus('idle');
      })
      .catch((err) => {
        console.error('Error loading face models:', err);
        setErrorMsg('Failed to load face recognition models.');
        setStatus('error');
      });
  }, []);

  const startCamera = async () => {
    setErrorMsg('');
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setErrorMsg('Camera access is not supported. Please ensure you are using HTTPS or localhost.');
      setStatus('error');
      return;
    }
    try {
      const s = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } } 
      });
      setStream(s);
      setStatus('ready');
    } catch (err) {
      if (err.name === 'OverconstrainedError' || err.name === 'ConstraintNotSatisfiedError') {
        try {
          const sFallback = await navigator.mediaDevices.getUserMedia({ video: true });
          setStream(sFallback);
          setStatus('ready');
          return;
        } catch (fallbackErr) {
          console.error(fallbackErr);
          setErrorMsg(`Camera error: ${fallbackErr.message || fallbackErr.name}`);
          setStatus('error');
          return;
        }
      }
      console.error(err);
      setErrorMsg(`Camera error: ${err.message || err.name}. Ensure no other app is using it.`);
      setStatus('error');
    }
  };

  const stopCamera = () => {
    stream?.getTracks().forEach((t) => t.stop());
    setStream(null);
    setStatus('idle');
  };

  const capture = async () => {
    if (!videoRef.current || capturing) return;
    if (videoRef.current.videoWidth === 0) {
      alert('Camera is initializing, please wait a moment and try again.');
      return;
    }
    setCapturing(true);
    setStatus('capturing');
    
    try {
      // Take snapshot immediately
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      
      // Stop camera instantly for better UX
      stopCamera();

      // Process the snapshot
      const vector = await extractSingleEmbedding(canvas);
      if (!vector) {
        setStatus('ready');
        alert('No face detected — ensure your face is clearly visible and well lit.');
        setCapturing(false);
        return;
      }
      setStatus('done');
      onVector(vector);
    } catch (err) {
      console.error(err);
      setStatus('ready');
    } finally {
      setCapturing(false);
    }
  };

  useEffect(() => () => stopCamera(), []);

  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div style={{ textAlign: 'center' }}>
      {status === 'loading' && (
        <div style={{ padding: 40 }}>
          <div className="spinner" style={{ margin: '0 auto 14px' }} />
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.38)' }}>Loading face recognition models…</p>
        </div>
      )}
      {status === 'error' && (
        <div className="error-box" style={{ textAlign: 'left' }}>
          {errorMsg || 'Camera or model error. Please allow camera access and try again.'}
        </div>
      )}
      {status !== 'loading' && !stream && (
        <div style={{ padding: '32px 0' }}>
          {status === 'done' ? (
            <>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(74,222,128,0.15)', border: '1px solid rgba(74,222,128,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, margin: '0 auto 14px' }}>✅</div>
              <p style={{ fontWeight: 600, fontSize: 15 }}>Face captured — searching your photos…</p>
            </>
          ) : (
            <>
              <div style={{ fontSize: 52, marginBottom: 14 }}>🤳</div>
              <p style={{ fontWeight: 700, fontSize: 16, marginBottom: 8 }}>Take a quick selfie</p>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.38)', marginBottom: 24, maxWidth: 340, margin: '0 auto 24px', lineHeight: 1.7 }}>
                Your face is processed entirely in your browser. Nothing is uploaded to our servers.
              </p>
              <button className="btn-primary" onClick={startCamera} disabled={!modelsLoaded || disabled} style={{ padding: '13px 32px', fontSize: 14 }}>
                {!modelsLoaded ? 'Preparing AI…' : 'Open camera'}
              </button>
            </>
          )}
        </div>
      )}
      {stream && (
        <div>
          <video ref={videoRef} autoPlay playsInline muted style={{
            width: '100%', maxWidth: 360, borderRadius: 12,
            border: '2px solid rgba(124,58,237,0.5)', display: 'block',
            margin: '0 auto 20px', transform: 'scaleX(-1)',
          }} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
            <button className="btn-primary" onClick={capture} disabled={capturing} style={{ padding: '13px 28px', fontSize: 14 }}>
              {capturing ? 'Detecting face…' : '📸 Capture selfie'}
            </button>
            <button className="btn-ghost" onClick={stopCamera} style={{ padding: '13px 20px', fontSize: 14 }}>Cancel</button>
          </div>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.28)', marginTop: 12 }}>
            Ensure your face is well-lit and centred in frame
          </p>
        </div>
      )}
    </div>
  );
}
