import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import UploadZone from '../components/UploadZone';
import api from '../utils/api';

export default function EventPage() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [newName, setNewName] = useState('');

  const fetchEvent = () => api.get(`/events/${id}`).then(({ data }) => setEvent(data.event)).finally(() => setLoading(false));
  useEffect(() => { fetchEvent(); }, [id]);

  const copyCode = () => { navigator.clipboard.writeText(event.code); setCodeCopied(true); setTimeout(() => setCodeCopied(false), 2000); };
  const copyLink = () => { navigator.clipboard.writeText(`${window.location.origin}/join?code=${event?.code}`); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  const handleRename = async () => {
    if (!newName.trim()) return setRenaming(false);
    try {
      await api.put(`/events/${id}`, { name: newName });
      setEvent({ ...event, name: newName });
      setRenaming(false);
    } catch (err) { alert('Failed to rename event'); }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this event? This action cannot be undone and will delete all photos and face data.')) return;
    try {
      await api.delete(`/events/${id}`);
      navigate('/dashboard');
    } catch (err) { alert('Failed to delete event'); }
  };

  if (loading) return (<><Navbar /><div style={{ background: '#060410', minHeight: 'calc(100dvh - 58px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="spinner" /></div></>);
  if (!event) return (<><Navbar /><div style={{ background: '#060410', minHeight: 'calc(100dvh - 58px)', padding: 32 }}><p style={{ color: 'rgba(255,255,255,0.5)' }}>Event not found. <Link to="/dashboard" style={{ color: '#a78bfa' }}>Back to dashboard</Link></p></div></>);

  return (
    <>
      <Navbar />
      <main style={{ background: '#060410', minHeight: 'calc(100dvh - 58px)', padding: '32px 24px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <Link to="/dashboard" style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 24, letterSpacing: '.02em', transition: 'color .2s' }}
            onMouseEnter={e => e.target.style.color = 'rgba(255,255,255,0.7)'}
            onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.35)'}>
            ← Dashboard
          </Link>

          {/* Event header */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
            <div>
              <div style={{ fontSize: 11, letterSpacing: '.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.28)', marginBottom: 8 }}>Event space</div>
              
              {renaming ? (
                <div style={{ display: 'flex', gap: 8, marginBottom: 5 }}>
                  <input className="input" autoFocus value={newName} onChange={e => setNewName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleRename()} style={{ padding: '6px 12px', fontSize: 16 }} />
                  <button className="btn-primary" onClick={handleRename} style={{ padding: '6px 12px' }}>Save</button>
                  <button className="btn-ghost" onClick={() => setRenaming(false)} style={{ padding: '6px 12px' }}>Cancel</button>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 5 }}>
                  <h1 style={{ fontSize: 26, fontWeight: 900, letterSpacing: '-.03em', margin: 0 }}>{event.name}</h1>
                  <button className="btn-ghost" onClick={() => { setNewName(event.name); setRenaming(true); }} style={{ padding: '4px 8px', fontSize: 12 }}>Rename</button>
                  <button className="btn-ghost" onClick={handleDelete} style={{ padding: '4px 8px', fontSize: 12, color: '#f87171' }}>Delete</button>
                </div>
              )}
              
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.38)' }}>{event.photoCount} photos indexed</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{
                fontSize: 13, fontWeight: 700, letterSpacing: '.12em',
                background: 'rgba(124,58,237,0.2)', border: '1px solid rgba(124,58,237,0.35)',
                borderRadius: 99, padding: '7px 18px', color: 'rgba(200,160,255,0.9)',
              }}>{event.code}</span>
              <button className="btn-primary" onClick={copyCode} style={{ padding: '9px 18px', fontSize: 13 }}>
                {codeCopied ? '✓ Copied' : 'Copy code'}
              </button>
            </div>
          </div>

          {/* Share card */}
          <div style={{
            background: 'linear-gradient(135deg,rgba(194,65,12,0.1),rgba(124,58,237,0.14))',
            border: '1px solid rgba(124,58,237,0.25)', borderRadius: 12, padding: '18px 22px', marginBottom: 24,
          }}>
            <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 5 }}>Share with attendees</p>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 12 }}>
              Send the code <strong style={{ color: 'rgba(200,160,255,0.9)' }}>{event.code}</strong> or share the direct link:
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <code style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', padding: '7px 14px', borderRadius: 6, fontSize: 12, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'rgba(255,255,255,0.6)' }}>
                {window.location.origin}/join?code={event.code}
              </code>
              <button className="btn-ghost" onClick={copyLink} style={{ padding: '7px 14px', fontSize: 12, whiteSpace: 'nowrap' }}>
                {copied ? '✓ Copied' : 'Copy link'}
              </button>
            </div>
          </div>

          {/* Upload zone */}
          <div style={{ background: '#0d0920', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: 28, marginBottom: 28 }}>
            <h2 style={{ fontSize: 17, fontWeight: 700, letterSpacing: '-.02em', marginBottom: 5 }}>Upload photos</h2>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.38)', marginBottom: 22 }}>
              Photos are compressed, uploaded directly to cloud storage, and face-indexed in your browser.
            </p>
            <UploadZone eventId={event._id} onUploaded={() => api.get(`/events/${id}`).then(({ data }) => setEvent(data.event))} />
          </div>

          {/* Photo grid */}
          {event.photos?.length > 0 && (
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-.02em', marginBottom: 16 }}>Recent uploads</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(130px,1fr))', gap: 8 }}>
                {event.photos.slice(-24).reverse().map((photo) => (
                  <div key={photo._id} style={{ aspectRatio: '1', borderRadius: 8, overflow: 'hidden', background: 'rgba(255,255,255,0.05)' }}>
                    <img src={photo.publicUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
