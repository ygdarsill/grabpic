import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import Navbar from '../components/Navbar';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setPreviewUrl('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/forgot-password', { email });
      setSuccess(data.message || 'If an account with that email exists, a reset link has been sent.');
      if (data.previewUrl) {
        setPreviewUrl(data.previewUrl);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <main style={{ background: '#060410', minHeight: 'calc(100dvh - 58px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(ellipse,rgba(194,65,12,0.18) 0%,rgba(124,58,237,0.12) 40%,transparent 70%)', top: -100, left: '50%', transform: 'translateX(-50%)', pointerEvents: 'none' }} />
        <div style={{ width: '100%', maxWidth: 400, position: 'relative', zIndex: 1 }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: '.08em', background: 'linear-gradient(135deg,#fb923c,#c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', marginBottom: 20 }}>GRABPIC</div>
            <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-.03em', marginBottom: 8 }}>Reset your password</h1>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.38)' }}>Enter your email and we'll send you a reset link</p>
          </div>
          <div style={{ background: '#0d0920', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: 28 }}>
            {error && <div className="error-box">{error}</div>}
            {success && (
              <div style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: 'rgba(134,239,172,0.9)', marginBottom: 16, lineHeight: 1.5 }}>
                {success}
              </div>
            )}
            {!success ? (
              <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', display: 'block', marginBottom: 6, letterSpacing: '.02em' }}>Email address</label>
                  <input className="input" name="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <button className="btn-primary w-full" style={{ marginTop: 8, padding: '13px', fontSize: 14 }} disabled={loading}>
                  {loading ? 'Sending…' : 'Send reset link'}
                </button>
              </form>
            ) : (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>✉️</div>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', lineHeight: 1.6 }}>
                  Check your inbox for the reset link. It may take a minute to arrive.
                </p>
                {previewUrl && (
                  <a
                    href={previewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-block',
                      marginTop: 16,
                      padding: '10px 20px',
                      background: 'linear-gradient(135deg, #fb923c, #c084fc)',
                      color: '#fff',
                      borderRadius: 8,
                      fontSize: 13,
                      fontWeight: 600,
                      textDecoration: 'none',
                      transition: 'opacity 0.2s',
                    }}
                    onMouseOver={(e) => e.currentTarget.style.opacity = '0.85'}
                    onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
                  >
                    📧 View test email on Ethereal
                  </a>
                )}
              </div>
            )}
            <div style={{ height: 1, background: 'rgba(255,255,255,0.07)', margin: '20px 0' }} />
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', textAlign: 'center' }}>
              Remember your password?{' '}
              <Link to="/login" style={{ color: '#a78bfa', fontWeight: 500 }}>Sign in</Link>
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
