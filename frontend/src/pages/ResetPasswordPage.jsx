import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import Navbar from '../components/Navbar';

export default function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post(`/auth/reset-password/${token}`, { newPassword });
      setSuccess(data.message || 'Password reset successfully!');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Reset failed. The link may be expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <main style={{ background: '#060410', minHeight: 'calc(100dvh - 58px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(ellipse,rgba(124,58,237,0.18) 0%,rgba(194,65,12,0.12) 40%,transparent 70%)', top: -100, left: '50%', transform: 'translateX(-50%)', pointerEvents: 'none' }} />
        <div style={{ width: '100%', maxWidth: 400, position: 'relative', zIndex: 1 }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: '.08em', background: 'linear-gradient(135deg,#fb923c,#c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', marginBottom: 20 }}>GRABPIC</div>
            <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-.03em', marginBottom: 8 }}>Set new password</h1>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.38)' }}>Choose a strong password for your account</p>
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
                  <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', display: 'block', marginBottom: 6, letterSpacing: '.02em' }}>New password</label>
                  <input className="input" type="password" placeholder="Min 6 characters" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={6} />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', display: 'block', marginBottom: 6, letterSpacing: '.02em' }}>Confirm password</label>
                  <input className="input" type="password" placeholder="Re-enter your password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength={6} />
                </div>
                <button className="btn-primary w-full" style={{ marginTop: 8, padding: '13px', fontSize: 14 }} disabled={loading}>
                  {loading ? 'Resetting…' : 'Reset password'}
                </button>
              </form>
            ) : (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>🔒</div>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', lineHeight: 1.6 }}>
                  Your password has been updated. Redirecting to login…
                </p>
              </div>
            )}
            <div style={{ height: 1, background: 'rgba(255,255,255,0.07)', margin: '20px 0' }} />
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', textAlign: 'center' }}>
              <Link to="/login" style={{ color: '#a78bfa', fontWeight: 500 }}>Back to sign in</Link>
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
