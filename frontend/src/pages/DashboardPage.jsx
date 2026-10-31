import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import api from '../utils/api';

const S = {
  card: { background: '#0d0920', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 22, cursor: 'pointer', transition: 'all .2s', textDecoration: 'none', display: 'block' },
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    api.get('/events').then(({ data }) => setEvents(data.events)).finally(() => setLoading(false));
  }, []);

  const createEvent = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const { data } = await api.post('/events', { name: newName.trim() });
      setEvents([data.event, ...events]);
      setNewName('');
      setShowForm(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create event');
    } finally {
      setCreating(false);
    }
  };

  return (
    <>
      <Navbar />
      <main style={{ background: '#060410', minHeight: 'calc(100dvh - 58px)', padding: '36px 24px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
            <div>
              <div style={{ fontSize: 11, letterSpacing: '.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.28)', marginBottom: 8 }}>Organizer dashboard</div>
              <h1 style={{ fontSize: 28, fontWeight: 900, letterSpacing: '-.03em', marginBottom: 4 }}>My events</h1>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.38)' }}>Welcome back, {user?.name}</p>
            </div>
            <button
              className="btn-primary"
              style={{ padding: '11px 22px', fontSize: 13 }}
              onClick={() => setShowForm(true)}
            >
              + New event
            </button>
          </div>

          {/* Create form */}
          {showForm && (
            <div style={{ background: '#0d0920', border: '1px solid rgba(124,58,237,0.3)', borderRadius: 12, padding: 24, marginBottom: 24 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, letterSpacing: '-.01em' }}>Create event space</h3>
              <form onSubmit={createEvent} style={{ display: 'flex', gap: 12 }}>
                <input
                  className="input"
                  placeholder="e.g. College Trip 2026, Wedding Reception…"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  autoFocus
                  style={{ flex: 1 }}
                />
                <button className="btn-primary" disabled={creating} style={{ padding: '11px 22px', fontSize: 13 }}>
                  {creating ? 'Creating…' : 'Create'}
                </button>
                <button className="btn-ghost" type="button" onClick={() => setShowForm(false)} style={{ padding: '11px 18px', fontSize: 13 }}>
                  Cancel
                </button>
              </form>
            </div>
          )}

          {/* Content */}
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 240 }}>
              <div className="spinner" />
            </div>
          ) : events.length === 0 ? (
            <div style={{ background: '#0d0920', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: 64, textAlign: 'center' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>📂</div>
              <p style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>No events yet</p>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.38)' }}>Create your first event space to start distributing photos.</p>
              <button className="btn-primary" style={{ marginTop: 24, padding: '11px 24px' }} onClick={() => setShowForm(true)}>Create event</button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 14 }}>
              {events.map((ev) => (
                <Link to={`/dashboard/events/${ev._id}`} key={ev._id} style={{ textDecoration: 'none' }}>
                  <div
                    style={{ ...S.card }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(124,58,237,0.4)'; e.currentTarget.style.background = '#130d2a'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.background = '#0d0920'; }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(194,65,12,0.2)', border: '1px solid rgba(194,65,12,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🎉</div>
                      <span style={{
                        fontSize: 11, fontWeight: 700, letterSpacing: '.1em',
                        background: 'rgba(124,58,237,0.2)', border: '1px solid rgba(124,58,237,0.35)',
                        borderRadius: 99, padding: '4px 12px', color: 'rgba(200,160,255,0.9)',
                      }}>{ev.code}</span>
                    </div>
                    <h3 style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-.01em', marginBottom: 6 }}>{ev.name}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>{ev.photoCount || 0} photos</span>
                      <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.22)' }}>{new Date(ev.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
