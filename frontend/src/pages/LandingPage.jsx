import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <main style={{ background: '#060410', overflowX: 'hidden' }}>

        {/* HERO */}
        <section style={{ position: 'relative', textAlign: 'center', padding: '90px 24px 70px', overflow: 'hidden' }}>
          {/* Orbs */}
          <div style={{
            position: 'absolute', width: 700, height: 700, borderRadius: '50%',
            background: 'radial-gradient(ellipse,rgba(220,80,30,0.42) 0%,rgba(160,50,200,0.28) 35%,transparent 70%)',
            top: -140, left: '50%', transform: 'translateX(-50%)', pointerEvents: 'none', filter: 'blur(1px)',
          }} />
          <div style={{
            position: 'absolute', width: 360, height: 360, borderRadius: '50%',
            background: 'radial-gradient(ellipse,rgba(124,58,237,0.18) 0%,transparent 70%)',
            bottom: 20, right: -80, pointerEvents: 'none',
          }} />

          <div style={{
            display: 'inline-block', fontSize: 11, letterSpacing: '.14em', textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.35)', marginBottom: 24,
            border: '1px solid rgba(255,255,255,0.1)', padding: '5px 16px', borderRadius: 99,
          }}>
            AI-powered photo distribution
          </div>

          <h1 style={{
            fontSize: 'clamp(38px,6vw,64px)', fontWeight: 900, lineHeight: 1.05,
            letterSpacing: '-.035em', marginBottom: 22, maxWidth: 680, marginLeft: 'auto', marginRight: 'auto',
          }}>
            The smartest way to<br />
            <span style={{
              background: 'linear-gradient(135deg,#ff7043,#e040fb,#7c3aed)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>share event photos.</span>
          </h1>

          <p style={{
            fontSize: 16, color: 'rgba(255,255,255,0.42)', maxWidth: 460,
            margin: '0 auto 38px', lineHeight: 1.75, fontWeight: 400,
          }}>
            Organizers upload once. Attendees take a selfie. Everyone gets exactly their photos — in under a second.
          </p>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 64, flexWrap: 'wrap' }}>
            <Link to="/join">
              <button style={{
                fontSize: 14, fontWeight: 700, color: '#fff',
                background: 'linear-gradient(135deg,#c2410c,#9333ea)',
                border: 'none', padding: '13px 30px', borderRadius: 8,
                fontFamily: 'Inter,sans-serif', cursor: 'pointer', letterSpacing: '.01em',
                transition: 'opacity .18s, transform .18s',
              }}
              onMouseEnter={e => { e.target.style.opacity = '.88'; e.target.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { e.target.style.opacity = '1'; e.target.style.transform = 'none'; }}>
                Find my photos →
              </button>
            </Link>
            <Link to="/register">
              <button style={{
                fontSize: 14, fontWeight: 500, color: 'rgba(255,255,255,0.65)',
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                padding: '13px 30px', borderRadius: 8,
                fontFamily: 'Inter,sans-serif', cursor: 'pointer',
              }}>Create an event</button>
            </Link>
          </div>

          {/* MOCK UI */}
          <div style={{ position: 'relative', maxWidth: 820, margin: '0 auto' }}>
            {/* Float badges */}
            <div style={{
              position: 'absolute', left: -40, top: 60, zIndex: 10,
              background: 'rgba(10,6,24,0.92)', border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 10, padding: '10px 16px', backdropFilter: 'blur(12px)',
            }}>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 4 }}>Latency</div>
              <div style={{ fontSize: 22, fontWeight: 800, background: 'linear-gradient(90deg,#fb923c,#f97316)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', letterSpacing: '-.03em' }}>&lt;800ms</div>
            </div>
            <div style={{
              position: 'absolute', right: -30, bottom: 60, zIndex: 10,
              background: 'rgba(10,6,24,0.92)', border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 10, padding: '10px 16px', backdropFilter: 'blur(12px)',
            }}>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 4 }}>Matched</div>
              <div style={{ fontSize: 22, fontWeight: 800, background: 'linear-gradient(90deg,#a78bfa,#e879f9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', letterSpacing: '-.03em' }}>47 photos</div>
            </div>

            {/* Browser chrome */}
            <div style={{
              borderRadius: 14, border: '1px solid rgba(255,255,255,0.1)',
              background: 'rgba(12,8,28,0.88)', overflow: 'hidden', backdropFilter: 'blur(20px)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '13px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                <div style={{ width: 11, height: 11, borderRadius: '50%', background: '#ff5f56' }} />
                <div style={{ width: 11, height: 11, borderRadius: '50%', background: '#ffbd2e' }} />
                <div style={{ width: 11, height: 11, borderRadius: '50%', background: '#27c93f' }} />
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', marginLeft: 10, letterSpacing: '.03em' }}>grabpic.app / dashboard / event</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', minHeight: 260 }}>
                <div style={{ borderRight: '1px solid rgba(255,255,255,0.07)', padding: 16 }}>
                  <div style={{ fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.2)', marginBottom: 12 }}>My Events</div>
                  {[['DA_BIT_2026', true], ['College Trip', false], ['Farewell Night', false], ['Sports Day', false]].map(([name, active]) => (
                    <div key={name} style={{
                      fontSize: 12, padding: '6px 10px', borderRadius: 6, marginBottom: 3,
                      display: 'flex', alignItems: 'center', gap: 8,
                      color: active ? 'rgba(255,180,120,0.85)' : 'rgba(255,255,255,0.32)',
                      background: active ? 'rgba(194,65,12,0.18)' : 'transparent',
                      border: active ? '1px solid rgba(194,65,12,0.25)' : '1px solid transparent',
                    }}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor', opacity: .6 }} />
                      {name}
                    </div>
                  ))}
                  <div style={{ height: 1, background: 'rgba(255,255,255,0.07)', margin: '14px 0' }} />
                  <div style={{ fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.2)', marginBottom: 8 }}>Storage</div>
                  <div style={{ height: 4, background: 'rgba(255,255,255,0.07)', borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{ width: '38%', height: '100%', background: 'linear-gradient(90deg,#c2410c,#9333ea)', borderRadius: 99 }} />
                  </div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.22)', marginTop: 6 }}>380 MB / 1 GB</div>
                </div>
                <div style={{ padding: '20px 24px' }}>
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    background: 'rgba(124,58,237,0.2)', border: '1px solid rgba(124,58,237,0.35)',
                    borderRadius: 8, padding: '7px 14px', marginBottom: 16,
                  }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#a78bfa' }} />
                    <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: '.1em', color: 'rgba(200,160,255,0.9)' }}>DA_BIT_2026</span>
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-.02em', marginBottom: 5 }}>DA BIT Farewell 2026</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.32)', marginBottom: 20 }}>312 photos · 94 faces indexed · 124 attendees</div>
                  {[['Uploading', '78%', .78, 'linear-gradient(90deg,#c2410c,#f97316)'], ['Indexing', '62%', .62, 'linear-gradient(90deg,#7c3aed,#a78bfa)'], ['Vectorising', '45%', .45, 'linear-gradient(90deg,#9333ea,#e879f9)']].map(([label, val, pct, grad]) => (
                    <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                      <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', width: 80, textAlign: 'right' }}>{label}</span>
                      <div style={{ flex: 1, height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 99, overflow: 'hidden' }}>
                        <div style={{ width: `${pct * 100}%`, height: '100%', background: grad, borderRadius: 99 }} />
                      </div>
                      <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', width: 32 }}>{val}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{
                borderTop: '1px solid rgba(255,255,255,0.07)', padding: '12px 24px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                {[['Face vectors', '2,841'], ['Avg match', '342ms'], ['Storage', '380 MB']].map(([label, val]) => (
                  <span key={label} style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)' }}>
                    {label}: <strong style={{ color: 'rgba(255,255,255,0.55)', fontWeight: 600 }}>{val}</strong>
                  </span>
                ))}
                <span style={{
                  fontSize: 11, background: 'rgba(194,65,12,0.2)', border: '1px solid rgba(194,65,12,0.3)',
                  padding: '4px 12px', borderRadius: 99, color: 'rgba(255,160,100,0.85)',
                }}>● Live</span>
              </div>
            </div>
          </div>
        </section>

        {/* STATS ROW */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', borderTop: '1px solid rgba(255,255,255,0.07)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          {[['128-d','Vector precision'], ['<800ms','Match latency'], ['$0','Infra cost'], ['100%','Browser AI']].map(([num, label], i) => (
            <div key={label} style={{
              padding: '28px 24px', textAlign: 'center',
              borderLeft: i > 0 ? '1px solid rgba(255,255,255,0.07)' : 'none',
            }}>
              <div style={{ fontSize: 28, fontWeight: 900, letterSpacing: '-.03em', background: 'linear-gradient(135deg,#fb923c,#c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>{num}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.28)', marginTop: 5, letterSpacing: '.06em', textTransform: 'uppercase' }}>{label}</div>
            </div>
          ))}
        </div>

        {/* FEATURES */}
        <section style={{ padding: '72px 24px', maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ fontSize: 11, letterSpacing: '.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.28)', marginBottom: 14 }}>Built different</div>
          <h2 style={{ fontSize: 'clamp(28px,4vw,40px)', fontWeight: 900, letterSpacing: '-.03em', lineHeight: 1.15, marginBottom: 14 }}>
            Everything runs in<br />your browser.
          </h2>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.38)', maxWidth: 420, lineHeight: 1.75, marginBottom: 48 }}>
            No GPU servers. No upload queues. Face recognition, compression, and vector extraction happen client-side — keeping costs at zero.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 1, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, overflow: 'hidden' }}>
            {[
              ['⚡','fi-orange','Direct-to-cloud uploads','Photos go straight from your browser to Supabase via presigned URLs. The server never touches image bytes.','rgba(194,65,12,0.2)','rgba(194,65,12,0.3)'],
              ['🧠','fi-purple','Client-side face-api.js','SSD MobileNet V1 runs locally — extracts 128-d face embeddings without sending facial data anywhere.','rgba(124,58,237,0.2)','rgba(124,58,237,0.3)'],
              ['🔍','fi-pink','pgvector KNN search','Cosine similarity at 0.85 threshold returns matched photo IDs in milliseconds from Supabase.','rgba(147,51,234,0.15)','rgba(147,51,234,0.25)'],
              ['🔒','fi-orange','Event code access','Each event gets a unique code. Attendees join instantly — no accounts, no passwords stored.','rgba(194,65,12,0.2)','rgba(194,65,12,0.3)'],
              ['📦','fi-purple','Bulk compression','browser-image-compression resizes every photo to 1920px before upload — saving storage and speeding up scanning.','rgba(124,58,237,0.2)','rgba(124,58,237,0.3)'],
              ['💸','fi-pink','Forever free stack','MongoDB Atlas + Supabase + Vercel + Render. Every component runs on free tiers.','rgba(147,51,234,0.15)','rgba(147,51,234,0.25)'],
            ].map(([icon, cls, title, desc, iconBg, iconBorder]) => (
              <div key={title} style={{ background: '#060410', padding: 28, transition: 'background .2s', cursor: 'default' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(20,10,40,0.8)'}
                onMouseLeave={e => e.currentTarget.style.background = '#060410'}>
                <div style={{ width: 36, height: 36, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, marginBottom: 16, background: iconBg, border: `1px solid ${iconBorder}` }}>{icon}</div>
                <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, letterSpacing: '-.01em' }}>{title}</h3>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', lineHeight: 1.75 }}>{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA BAND */}
        <div style={{ margin: '0 24px 72px', maxWidth: 952, marginLeft: 'auto', marginRight: 'auto' }}>
          <div style={{
            borderRadius: 16, border: '1px solid rgba(255,255,255,0.1)',
            background: 'linear-gradient(135deg,rgba(194,65,12,0.14) 0%,rgba(124,58,237,0.18) 50%,rgba(30,10,80,0.28) 100%)',
            padding: '56px 48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            gap: 32, position: 'relative', overflow: 'hidden', flexWrap: 'wrap',
          }}>
            <div style={{ position: 'absolute', right: -60, top: -60, width: 240, height: 240, borderRadius: '50%', background: 'radial-gradient(circle,rgba(220,80,30,0.28),transparent 70%)', pointerEvents: 'none' }} />
            <div>
              <h2 style={{ fontSize: 'clamp(22px,3vw,30px)', fontWeight: 900, letterSpacing: '-.03em', lineHeight: 1.2 }}>
                Ready to <span style={{ background: 'linear-gradient(135deg,#fb923c,#c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>grab your photos?</span>
              </h2>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.38)', marginTop: 8 }}>Enter your event code and take a selfie. Your gallery is waiting.</p>
            </div>
            <Link to="/join">
              <button style={{
                fontSize: 14, fontWeight: 700, color: '#fff',
                background: 'linear-gradient(135deg,#c2410c,#7c3aed)',
                border: 'none', padding: '14px 32px', borderRadius: 8,
                fontFamily: 'Inter,sans-serif', cursor: 'pointer', whiteSpace: 'nowrap',
              }}>Find my photos →</button>
            </Link>
          </div>
        </div>

        {/* FOOTER */}
        <footer style={{ padding: '24px', borderTop: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: 1000, margin: '0 auto' }}>
          <span style={{ fontSize: 13, fontWeight: 800, letterSpacing: '.06em', background: 'linear-gradient(135deg,#fb923c,#c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>GRABPIC</span>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.18)' }}>Built on MongoDB · Supabase · Vercel · face-api.js</p>
        </footer>
      </main>
    </>
  );
}
