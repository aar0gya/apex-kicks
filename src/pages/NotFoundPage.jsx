// apex-kicks/src/pages/NotFoundPage.jsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useBreakpoint from '../hooks/useBreakPoint';

// ── Quick-links to guide the user somewhere useful ────────────
const QUICK_LINKS = [
    { label: 'COLLECTION', path: '/collection', sub: 'Browse all styles' },
    { label: 'DROPS', path: '/drops', sub: 'Latest releases' },
    { label: 'COLLAB', path: '/collab', sub: 'Artist editions' },
    { label: 'STORIES', path: '/stories', sub: 'Culture & editorial' },
];

// ── Glitch animation for the "404" number ─────────────────────
function GlitchNumber() {
    const [glitch, setGlitch] = useState(false);

    useEffect(() => {
        // Randomly trigger glitch effect every 2.5–5 s
        let timeout;
        function scheduleGlitch() {
            timeout = setTimeout(() => {
                setGlitch(true);
                setTimeout(() => { setGlitch(false); scheduleGlitch(); }, 400);
            }, 2500 + Math.random() * 2500);
        }
        scheduleGlitch();
        return () => clearTimeout(timeout);
    }, []);

    return (
        <div style={{ position: 'relative', userSelect: 'none', lineHeight: 1 }}>
            {/* Main number */}
            <div style={{
                fontFamily: "'Bebas Neue',sans-serif",
                fontSize: 'clamp(120px, 22vw, 220px)',
                color: 'white',
                letterSpacing: '0.04em',
                lineHeight: 1,
                position: 'relative',
                zIndex: 2,
            }}>
                404
            </div>

            {/* Glitch layer 1 — red shift left */}
            <div style={{
                fontFamily: "'Bebas Neue',sans-serif",
                fontSize: 'clamp(120px, 22vw, 220px)',
                color: 'var(--red)',
                letterSpacing: '0.04em',
                lineHeight: 1,
                position: 'absolute',
                top: 0, left: 0,
                opacity: glitch ? 0.7 : 0,
                transform: glitch ? 'translate(-4px, 2px)' : 'none',
                clipPath: glitch ? 'inset(20% 0 55% 0)' : 'none',
                transition: glitch ? 'none' : 'opacity 0.2s',
                zIndex: 1,
                mixBlendMode: 'screen',
            }}>
                404
            </div>

            {/* Glitch layer 2 — cyan shift right */}
            <div style={{
                fontFamily: "'Bebas Neue',sans-serif",
                fontSize: 'clamp(120px, 22vw, 220px)',
                color: '#00ffff',
                letterSpacing: '0.04em',
                lineHeight: 1,
                position: 'absolute',
                top: 0, left: 0,
                opacity: glitch ? 0.5 : 0,
                transform: glitch ? 'translate(4px, -2px)' : 'none',
                clipPath: glitch ? 'inset(55% 0 15% 0)' : 'none',
                transition: glitch ? 'none' : 'opacity 0.2s',
                zIndex: 1,
                mixBlendMode: 'screen',
            }}>
                404
            </div>
        </div>
    );
}

// ── Animated scan-line bar ────────────────────────────────────
function ScanLine() {
    return (
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 1 }}>
            <div style={{
                position: 'absolute', left: 0, right: 0, height: 2,
                background: 'linear-gradient(90deg, transparent, rgba(255,34,0,0.6), transparent)',
                animation: 'scanLine 3.5s linear infinite',
            }} />
        </div>
    );
}

// ── Main 404 Page ─────────────────────────────────────────────
export default function NotFoundPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { isMobile, isTablet } = useBreakpoint();
    const px = isMobile ? 24 : isTablet ? 40 : 80;
    const [hovered, setHovered] = useState(null);
    const [mounted, setMounted] = useState(false);
    const wrongPath = location.pathname;

    useEffect(() => { requestAnimationFrame(() => setMounted(true)); }, []);

    return (
        <div style={{ minHeight: '100vh', background: '#080808', paddingTop: 64, position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>

            {/* ── Background atmosphere ── */}
            {/* Grid lines */}
            <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.015) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.015) 1px,transparent 1px)', backgroundSize: '52px 52px', pointerEvents: 'none', zIndex: 0 }} />

            {/* Ambient red glow — top left */}
            <div style={{ position: 'absolute', top: '-10%', left: '-5%', width: '50vw', height: '60vh', background: 'radial-gradient(ellipse at 30% 30%, rgba(255,34,0,0.06) 0%, transparent 65%)', pointerEvents: 'none', zIndex: 0 }} />

            {/* Faint cyan glow — bottom right */}
            <div style={{ position: 'absolute', bottom: '5%', right: '-5%', width: '40vw', height: '50vh', background: 'radial-gradient(ellipse at 70% 70%, rgba(0,200,255,0.04) 0%, transparent 65%)', pointerEvents: 'none', zIndex: 0 }} />

            <ScanLine />

            {/* ── Main content ── */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: `60px ${px}px 40px`, position: 'relative', zIndex: 2 }}>

                {/* Label */}
                <div style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(16px)', transition: 'opacity 0.5s, transform 0.5s', marginBottom: 12 }}>
                    <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 9, letterSpacing: '0.36em', color: 'var(--red)', background: 'rgba(255,34,0,0.08)', border: '1px solid rgba(255,34,0,0.2)', padding: '4px 14px' }}>
                        PAGE NOT FOUND
                    </span>
                </div>

                {/* Glitch 404 */}
                <div style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(24px)', transition: 'opacity 0.6s 0.1s, transform 0.6s 0.1s' }}>
                    <GlitchNumber />
                </div>

                {/* Ghost "LOST" watermark behind the number */}
                <div style={{ position: 'absolute', fontFamily: "'Bebas Neue',sans-serif", fontSize: 'clamp(100px,28vw,320px)', color: 'rgba(255,255,255,0.025)', letterSpacing: '0.08em', lineHeight: 1, userSelect: 'none', pointerEvents: 'none', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', zIndex: 1, whiteSpace: 'nowrap' }}>
                    LOST
                </div>

                {/* Copy */}
                <div style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(20px)', transition: 'opacity 0.6s 0.2s, transform 0.6s 0.2s', marginTop: 8 }}>
                    <h1 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: isMobile ? 'clamp(28px,7vw,36px)' : 'clamp(32px,4vw,48px)', color: 'white', letterSpacing: '0.04em', lineHeight: 1.05, marginBottom: 16 }}>
                        YOU'VE WANDERED<br />OFF THE MAP.
                    </h1>
                    <p style={{ fontFamily: "'Barlow',sans-serif", fontSize: isMobile ? 13 : 15, color: 'rgba(255,255,255,0.38)', lineHeight: 1.85, maxWidth: 420, margin: '0 auto 10px' }}>
                        The page you're looking for doesn't exist or has been moved.
                    </p>
                    {/* Show the bad path */}
                    <div style={{ display: 'inline-block', fontFamily: "'Barlow Condensed',sans-serif", fontSize: 11, letterSpacing: '0.1em', color: 'rgba(255,34,0,0.55)', background: 'rgba(255,34,0,0.06)', border: '1px solid rgba(255,34,0,0.15)', padding: '5px 14px', marginBottom: 36, borderRadius: 2 }}>
                        {wrongPath}
                    </div>
                </div>

                {/* Primary CTA */}
                <div style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(20px)', transition: 'opacity 0.6s 0.3s, transform 0.6s 0.3s', display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 64 }}>
                    <button onClick={() => navigate('/')}
                        className="btn-primary"
                        style={{ padding: isMobile ? '14px 36px' : '15px 44px', fontSize: 14, letterSpacing: '0.18em', display: 'inline-flex', alignItems: 'center', gap: 10 }}>
                        ← BACK TO HOME
                    </button>
                    <button onClick={() => navigate(-1)}
                        style={{ padding: isMobile ? '14px 36px' : '15px 44px', background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.55)', fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 14, letterSpacing: '0.18em', cursor: 'pointer', borderRadius: 2, transition: 'all 0.2s', display: 'inline-flex', alignItems: 'center', gap: 10 }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.35)'; e.currentTarget.style.color = 'white'; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; e.currentTarget.style.color = 'rgba(255,255,255,0.55)'; }}>
                        GO BACK
                    </button>
                </div>

                {/* Quick-links grid */}
                <div style={{ opacity: mounted ? 1 : 0, transition: 'opacity 0.6s 0.45s', width: '100%', maxWidth: 640 }}>
                    <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 9, letterSpacing: '0.28em', color: 'rgba(255,255,255,0.22)', marginBottom: 18 }}>OR EXPLORE THESE PAGES</div>
                    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2,1fr)' : 'repeat(4,1fr)', gap: 10 }}>
                        {QUICK_LINKS.map((link, i) => (
                            <button key={link.path}
                                onClick={() => navigate(link.path)}
                                style={{ padding: '16px 12px', background: hovered === i ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.025)', border: `1px solid ${hovered === i ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.07)'}`, cursor: 'pointer', textAlign: 'center', borderRadius: 3, transition: 'all 0.22s', transform: hovered === i ? 'translateY(-3px)' : 'none' }}
                                onMouseEnter={() => setHovered(i)}
                                onMouseLeave={() => setHovered(null)}>
                                <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 16, color: hovered === i ? 'white' : 'rgba(255,255,255,0.65)', letterSpacing: '0.06em', marginBottom: 4, transition: 'color 0.2s' }}>{link.label}</div>
                                <div style={{ fontFamily: "'Barlow',sans-serif", fontSize: 10, color: 'rgba(255,255,255,0.28)', lineHeight: 1.5 }}>{link.sub}</div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Footer strip ── */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: `16px ${px}px`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 2, flexWrap: 'wrap', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 20, height: 20, background: 'var(--red)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 11, color: 'white', lineHeight: 1 }}>A</span>
                    </div>
                    <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 14, letterSpacing: '0.14em', color: 'rgba(255,255,255,0.3)' }}>APEX KICKS</span>
                </div>
                <span style={{ fontFamily: "'Barlow',sans-serif", fontSize: 11, color: 'rgba(255,255,255,0.2)' }}>Error 404 · Page Not Found</span>
            </div>

            <style>{`
        @keyframes scanLine {
          0%   { top: -2px;   opacity: 0; }
          5%   { opacity: 1; }
          95%  { opacity: 1; }
          100% { top: 100vh; opacity: 0; }
        }
      `}</style>
        </div>
    );
}