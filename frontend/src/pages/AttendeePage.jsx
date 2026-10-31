import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import SelfieCapture from '../components/SelfieCapture';
import api from '../utils/api';
import { warmUpModel } from '../utils/faceEngine';

const Step = ({ n, label, active, done }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
    <div style={{
      width: 30, height: 30, borderRadius: '50%',
      background: done ? 'rgba(74,222,128,0.2)' : active ? 'linear-gradient(135deg,#c2410c,#7c3aed)' : 'rgba(255,255,255,0.07)',
      border: done ? '1px solid rgba(74,222,128,0.4)' : active ? 'none' : '1px solid rgba(255,255,255,0.12)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 12, fontWeight: 700,
      color: done ? '#4ade80' : active ? '#fff' : 'rgba(255,255,255,0.3)',
    }}>{done ? '✓' : n}</div>
    <span style={{ fontSize: 10, letterSpacing: '.04em', color: active ? '#fff' : 'rgba(255,255,255,0.3)', textTransform: 'uppercase' }}>{label}</span>
  </div>
);

export default function AttendeePage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [code, setCode] = useState(searchParams.get('code') || '');
  const [event, setEvent] = useState(null);
  const [step, setStep] = useState('code');
  const [error, setError] = useState('');
  const [searching, setSearching] = useState(false);

  useEffect(() => { 
    if (searchParams.get('code')) verifyCode(); 
    // Warm up the AI model silently in the background while the user is typing their code
    warmUpModel().catch(console.error);
  }, []);

  const verifyCode = async (e) => {
    e?.preventDefault();
    setError('');
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) return;
    try {
      const { data } = await api.get(`/events/code/${trimmed}`);
      setEvent(data.event);
      setStep('selfie');
    } catch { setError('Event not found. Check your code and try again.'); }
  };

  const handleVector = async (vector) => {
    setSearching(true);
    setStep('searching');
    try {
      const { data } = await api.post('/events/search', { eventCode: event.code, vector });
      navigate('/gallery', { state: { photos: data.photos, eventName: event.name } });
    } catch {
      setError('Search failed. Please try again.');
      setStep('selfie');
    } finally { setSearching(false); }
  };

  const stepIndex = { code: 0, selfie: 1, searching: 1 }[step] ?? 2;

  return (
    <>
      <Navbar />
      <main style={{ background: '#060410', minHeight: 'calc(100dvh - 58px)', padding: '48px 24px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', width: 480, height: 480, borderRadius: '50%', background: 'radial-gradient(ellipse,rgba(194,65,12,0.18) 0%,rgba(124,58,237,0.12) 40%,transparent 70%)', top: -100, left: '50%', transform: 'translateX(-50%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 520, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: '.08em', background: 'linear-gradient(135deg,#fb923c,#c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', marginBottom: 18 }}>GRABPIC</div>
            <h1 style={{ fontSize: 28, fontWeight: 900, letterSpacing: '-.03em', marginBottom: 8 }}>Find your photos</h1>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.38)' }}>Enter your event code then take a quick selfie</p>
          </div>

          {/* Step indicator */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0, marginBottom: 32 }}>
            <Step n={1} label="Code" active={stepIndex === 0} done={stepIndex > 0} />
            <div style={{ width: 48, height: 1, background: 'rgba(255,255,255,0.1)', margin: '0 4px 20px' }} />
            <Step n={2} label="Selfie" active={stepIndex === 1} done={stepIndex > 1} />
            <div style={{ width: 48, height: 1, background: 'rgba(255,255,255,0.1)', margin: '0 4px 20px' }} />
            <Step n={3} label="Gallery" active={stepIndex === 2} done={false} />
          </div>

          <div style={{ background: '#0d0920', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: 28 }}>
            {error && <div className="error-box" style={{ marginBottom: 16 }}>{error}</div>}

            {step === 'code' && (
              <form onSubmit={verifyCode}>
                <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', display: 'block', marginBottom: 8, letterSpacing: '.02em' }}>Event code</label>
                <input
                  className="input"
                  placeholder="e.g. DA_BIT_2026"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  style={{ letterSpacing: 3, fontWeight: 700, fontSize: 15, textTransform: 'uppercase', marginBottom: 16, textAlign: 'center' }}
                  autoFocus
                />
                <button className="btn-primary w-full" type="submit" style={{ padding: '13px', fontSize: 14 }}>
                  Continue →
                </button>
              </form>
            )}

            {(step === 'selfie' || step === 'searching') && event && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                  <div>
                    <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 4 }}>Event</p>
                    <p style={{ fontWeight: 700, fontSize: 15 }}>{event.name}</p>
                    <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>{event.photoCount} photos indexed</p>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.1em', background: 'rgba(124,58,237,0.2)', border: '1px solid rgba(124,58,237,0.35)', borderRadius: 99, padding: '5px 14px', color: 'rgba(200,160,255,0.9)' }}>{event.code}</span>
                </div>
                {step === 'searching' ? (
                  <div style={{ textAlign: 'center', padding: '32px 0' }}>
                    <div className="spinner" style={{ margin: '0 auto 16px', width: 32, height: 32 }} />
                    <p style={{ fontWeight: 600, fontSize: 15 }}>Searching {event.photoCount} photos…</p>
                    <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', marginTop: 6 }}>Usually less than a second</p>
                  </div>
                ) : (
                  <SelfieCapture onVector={handleVector} disabled={searching} />
                )}
              </div>
            )}
          </div>

          <p style={{ textAlign: 'center', marginTop: 20, fontSize: 12, color: 'rgba(255,255,255,0.28)' }}>
            Organizer? <Link to="/login" style={{ color: '#a78bfa' }}>Sign in here</Link>
          </p>
        </div>
      </main>
    </>
  );
}
