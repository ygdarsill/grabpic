import React, { useState, useRef } from 'react';
import api from '../utils/api';
import { compressImage, fileToImage } from '../utils/compress';
import { extractEmbeddings } from '../utils/faceEngine';
import { uploadToSupabase } from '../utils/supabase';

const BATCH_SIZE = 5;

export default function UploadZone({ eventId, onUploaded }) {
  const [dragging, setDragging] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [running, setRunning] = useState(false);
  const inputRef = useRef();

  const updateJob = (name, patch) =>
    setJobs((prev) => prev.map((j) => (j.name === name ? { ...j, ...patch } : j)));

  const processFile = async (file) => {
    const name = file.name;
    try {
      updateJob(name, { status: 'compressing', progress: 10 });
      const compressed = await compressImage(file);

      updateJob(name, { status: 'requesting URL', progress: 25 });
      const { data: { uploadUrl, path } } = await api.post('/events/upload-url', {
        eventId, fileName: compressed.name, contentType: 'image/jpeg',
      });

      updateJob(name, { status: 'uploading & scanning', progress: 40 });
      
      // Parallelize network upload and CPU face scanning to reduce latency
      const [_, embeddings] = await Promise.all([
        uploadToSupabase(uploadUrl, compressed),
        (async () => {
          const img = await fileToImage(compressed);
          return await extractEmbeddings(img);
        })()
      ]);

      updateJob(name, { status: 'indexing', progress: 85 });
      // Only store face vectors if at least one face was detected.
      // Sending empty/zero embeddings pollutes the vector space and
      // causes false positives during attendee searches.
      await api.post('/events/confirm-upload', {
        eventId, path, embeddings: embeddings.length > 0 ? embeddings : [],
      });

      updateJob(name, { status: 'done', progress: 100, faces: embeddings.length });
      onUploaded?.();
    } catch (err) {
      console.error('Upload failed for', name, err);
      updateJob(name, { status: 'error', error: err.message });
    }
  };

  const handleFiles = async (files) => {
    if (running) return;
    const arr = Array.from(files).filter((f) => f.type.startsWith('image/'));
    if (!arr.length) return;
    setJobs(arr.map((f) => ({ name: f.name, status: 'queued', progress: 0 })));
    setRunning(true);
    for (let i = 0; i < arr.length; i += BATCH_SIZE) {
      await Promise.all(arr.slice(i, i + BATCH_SIZE).map(processFile));
    }
    setRunning(false);
  };

  const onDrop = (e) => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files); };
  const completedCount = jobs.filter((j) => j.status === 'done').length;
  const errorCount = jobs.filter((j) => j.status === 'error').length;

  const statusColor = (s) => s === 'done' ? '#4ade80' : s === 'error' ? '#f87171' : '#fb923c';

  return (
    <div>
      <div
        onClick={() => !running && inputRef.current.click()}
        onDrop={onDrop}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        style={{
          border: `2px dashed ${dragging ? '#c2410c' : 'rgba(255,255,255,0.12)'}`,
          borderRadius: 12, padding: '48px 24px', textAlign: 'center',
          cursor: running ? 'not-allowed' : 'pointer',
          background: dragging ? 'rgba(194,65,12,0.08)' : 'transparent',
          transition: 'all .2s',
        }}
      >
        <div style={{ fontSize: 40, marginBottom: 12 }}>🖼️</div>
        <p style={{ fontWeight: 600, fontSize: 15, marginBottom: 6 }}>
          {running ? 'Processing…' : 'Drop photos here or click to select'}
        </p>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>
          JPEG, PNG, HEIC — compressed automatically before upload
        </p>
        <input ref={inputRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={(e) => handleFiles(e.target.files)} />
      </div>

      {jobs.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <p style={{ fontSize: 13, fontWeight: 600 }}>
              {completedCount}/{jobs.length} done
              {errorCount > 0 && <span style={{ color: '#f87171', marginLeft: 8 }}>{errorCount} failed</span>}
            </p>
            {!running && (
              <button onClick={() => setJobs([])} style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Inter,sans-serif' }}>
                Clear
              </button>
            )}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 280, overflowY: 'auto' }}>
            {jobs.map((job) => (
              <div key={job.name} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: '8px 12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '60%' }}>
                    {job.name}
                  </span>
                  <span style={{ fontSize: 11, color: statusColor(job.status), fontWeight: 600 }}>
                    {job.status === 'done' ? `✓ ${job.faces} face${job.faces !== 1 ? 's' : ''}` : job.status === 'error' ? '✗ error' : job.status}
                  </span>
                </div>
                {job.status !== 'done' && job.status !== 'error' && (
                  <div style={{ height: 3, background: 'rgba(255,255,255,0.08)', borderRadius: 2 }}>
                    <div style={{ height: '100%', width: `${job.progress}%`, background: 'linear-gradient(90deg,#c2410c,#7c3aed)', borderRadius: 2, transition: 'width .3s' }} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
