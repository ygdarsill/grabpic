import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <main style={{ background: '#060410', minHeight: 'calc(100dvh - 58px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(ellipse,rgba(194,65,12,0.2) 0%,rgba(124,58,237,0.15) 40%,transparent 70%)', top: -100, left: '50%', transform: 'translateX(-50%)', pointerEvents: 'none' }} />
        <div style={{ width: '100%', maxWidth: 400, position: 'relative', zIndex: 1 }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: '.08em', background: 'linear-gradient(135deg,#fb923c,#c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', marginBottom: 20 }}>GRABPIC</div>
            <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-.03em', marginBottom: 8 }}>Welcome back</h1>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.38)' }}>Sign in to manage your events</p>
          </div>
          <div style={{ background: '#0d0920', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: 28 }}>
            {error && <div className="error-box">{error}</div>}
            <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', display: 'block', marginBottom: 6, letterSpacing: '.02em' }}>Email</label>
                <input className="input" name="email" type="email" placeholder="you@example.com" value={form.email} onChange={handle} required />
              </div>
              <div>
                <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', display: 'block', marginBottom: 6, letterSpacing: '.02em' }}>Password</label>
                <input className="input" name="password" type="password" placeholder="••••••••" value={form.password} onChange={handle} required />
              </div>
              <div style={{ textAlign: 'right', marginTop: -4 }}>
                <Link to="/forgot-password" style={{ fontSize: 12, color: '#a78bfa', fontWeight: 500, transition: 'opacity .2s' }}>Forgot password?</Link>
              </div>
              <button className="btn-primary w-full" style={{ marginTop: 8, padding: '13px', fontSize: 14 }} disabled={loading}>
                {loading ? 'Signing in…' : 'Sign in'}
              </button>
            </form>
            <div style={{ height: 1, background: 'rgba(255,255,255,0.07)', margin: '20px 0' }} />
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', textAlign: 'center' }}>
              No account?{' '}
              <Link to="/register" style={{ color: '#a78bfa', fontWeight: 500 }}>Create one</Link>
            </p>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', textAlign: 'center', marginTop: 8 }}>
              Attendee?{' '}
              <Link to="/join" style={{ color: '#fb923c', fontWeight: 500 }}>Join an event →</Link>
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
