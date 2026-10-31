import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function GalleryPage() {
  const location = useLocation();
  const { photos = [], eventName = 'Event' } = location.state || {};
  const [lightbox, setLightbox] = useState(null);
  const [downloading, setDownloading] = useState(false);

  const downloadAll = async () => {
    setDownloading(true);
    for (const url of photos) {
      try {
        const res = await fetch(url);
        const blob = await res.blob();
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = url.split('/').pop() || 'photo.jpg';
        a.click();
        URL.revokeObjectURL(a.href);
        await new Promise((r) => setTimeout(r, 300));
      } catch { console.error('Failed to download', url); }
    }
    setDownloading(false);
  };

  if (!photos.length) return (
    <>
      <Navbar />
      <main style={{ background: '#060410', minHeight: 'calc(100dvh - 58px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 56, marginBottom: 18 }}>😔</div>
          <h1 style={{ fontSize: 26, fontWeight: 900, letterSpacing: '-.03em', marginBottom: 10 }}>No photos found</h1>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', marginBottom: 28, maxWidth: 380, lineHeight: 1.7 }}>
            We couldn't find any photos matching your face. Try better lighting or a different angle.
          </p>
          <Link to="/join"><button className="btn-primary" style={{ padding: '13px 28px' }}>Try again</button></Link>
        </div>
      </main>
    </>
  );

  return (
    <>
      <Navbar />
      <main style={{ background: '#060410', minHeight: 'calc(100dvh - 58px)', padding: '32px 24px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 14 }}>
            <div>
              <div style={{ fontSize: 11, letterSpacing: '.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.28)', marginBottom: 8 }}>Your gallery</div>
              <h1 style={{ fontSize: 26, fontWeight: 900, letterSpacing: '-.03em', marginBottom: 4 }}>Your photos</h1>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.38)' }}>
                <span style={{ background: 'linear-gradient(135deg,#fb923c,#c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', fontWeight: 700 }}>{photos.length} photos</span> found in {eventName}
              </p>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <Link to="/join"><button className="btn-ghost" style={{ padding: '10px 18px', fontSize: 13 }}>Search again</button></Link>
              <button className="btn-primary" onClick={downloadAll} disabled={downloading} style={{ padding: '10px 18px', fontSize: 13 }}>
                {downloading ? 'Downloading…' : `⬇ Download all`}
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 8 }}>
            {photos.map((url, i) => (
              <div key={url} onClick={() => setLightbox(i)} style={{
                aspectRatio: '1', borderRadius: 10, overflow: 'hidden',
                cursor: 'zoom-in', background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.06)', transition: 'border-color .2s',
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(124,58,237,0.4)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'}>
                <img src={url} alt={`Photo ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} loading="lazy" />
              </div>
            ))}
          </div>
        </div>

        {/* Lightbox */}
        {lightbox !== null && (
          <div onClick={() => setLightbox(null)} style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.94)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, cursor: 'zoom-out',
          }}>
            <button onClick={(e) => { e.stopPropagation(); setLightbox((l) => l > 0 ? l - 1 : photos.length - 1); }} style={{
              position: 'absolute', left: 20, background: 'rgba(255,255,255,0.08)', color: '#fff',
              border: '1px solid rgba(255,255,255,0.12)', borderRadius: '50%', width: 44, height: 44, fontSize: 22, cursor: 'pointer', fontFamily: 'Inter,sans-serif',
            }}>‹</button>
            <img src={photos[lightbox]} alt="" style={{ maxWidth: '90vw', maxHeight: '90vh', borderRadius: 10, objectFit: 'contain' }} onClick={(e) => e.stopPropagation()} />
            <button onClick={(e) => { e.stopPropagation(); setLightbox((l) => l < photos.length - 1 ? l + 1 : 0); }} style={{
              position: 'absolute', right: 20, background: 'rgba(255,255,255,0.08)', color: '#fff',
              border: '1px solid rgba(255,255,255,0.12)', borderRadius: '50%', width: 44, height: 44, fontSize: 22, cursor: 'pointer', fontFamily: 'Inter,sans-serif',
            }}>›</button>
            <div style={{ position: 'absolute', bottom: 24, fontSize: 12, color: 'rgba(255,255,255,0.35)', letterSpacing: '.04em' }}>
              {lightbox + 1} / {photos.length} · click outside to close
            </div>
          </div>
        )}
      </main>
    </>
  );
}
