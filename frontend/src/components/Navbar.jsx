import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/'); };

  const isActive = (path) => location.pathname === path;

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: 'rgba(6,4,16,0.85)',
      borderBottom: '1px solid rgba(255,255,255,0.07)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
    }}>
      <div style={{
        maxWidth: 1000, margin: '0 auto', padding: '0 24px',
        height: 58, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <Link to={user ? '/dashboard' : '/'} style={{
          fontSize: 15, fontWeight: 800, letterSpacing: '.06em',
          background: 'linear-gradient(135deg,#fb923c,#c084fc)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}>
          GRABPIC
        </Link>

        {!user && (
          <div style={{ display: 'flex', gap: 28, alignItems: 'center' }}>
            {[['/', 'Home'], ['/join', 'Join event']].map(([path, label]) => (
              <Link key={path} to={path} style={{
                fontSize: 13, color: isActive(path) ? '#fff' : 'rgba(255,255,255,0.4)',
                letterSpacing: '.02em', transition: 'color .2s',
              }}>{label}</Link>
            ))}
          </div>
        )}

        {user && (
          <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
            <Link to="/dashboard" style={{
              fontSize: 13, color: isActive('/dashboard') ? '#fff' : 'rgba(255,255,255,0.4)',
              letterSpacing: '.02em',
            }}>Dashboard</Link>
            <Link to="/join" style={{
              fontSize: 13, color: 'rgba(255,255,255,0.4)', letterSpacing: '.02em',
            }}>Join event</Link>
          </div>
        )}

        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {user ? (
            <>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', letterSpacing: '.02em' }}>
                {user.name}
              </span>
              <button
                onClick={handleLogout}
                style={{
                  fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,0.5)',
                  background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                  padding: '7px 16px', borderRadius: 6, fontFamily: 'Inter,sans-serif',
                  cursor: 'pointer', letterSpacing: '.02em', transition: 'all .18s',
                }}
                onMouseEnter={e => { e.target.style.color = '#fff'; e.target.style.background = 'rgba(255,255,255,0.1)'; }}
                onMouseLeave={e => { e.target.style.color = 'rgba(255,255,255,0.5)'; e.target.style.background = 'rgba(255,255,255,0.06)'; }}
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link to="/login">
                <button style={{
                  fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,0.5)',
                  background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                  padding: '7px 16px', borderRadius: 6, fontFamily: 'Inter,sans-serif',
                  cursor: 'pointer', letterSpacing: '.02em',
                }}>Sign in</button>
              </Link>
              <Link to="/register">
                <button style={{
                  fontSize: 12, fontWeight: 600, color: '#fff',
                  background: 'linear-gradient(135deg,#c2410c,#7c3aed)',
                  border: 'none', padding: '7px 16px', borderRadius: 6,
                  fontFamily: 'Inter,sans-serif', cursor: 'pointer', letterSpacing: '.02em',
                }}>Get started</button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
