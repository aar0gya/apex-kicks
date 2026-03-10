import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { PRODUCTS } from '../../data/products';
import { getShoeImage, HERO_IMAGE } from '../../data/shoeImages';

const QUICK_LINKS = [
    { label: 'New Arrivals', path: '/collection' },
    { label: 'Drops', path: '/drops' },
    { label: 'Collabs', path: '/collab' },
    { label: 'Running', path: '/collection' },
    { label: 'Training', path: '/collection' },
];

// 4 trending picks for the default panel
const TRENDING = PRODUCTS.slice(0, 4);

function IconSearch({ size = 18, color = 'currentColor' }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
    );
}

export default function SearchOverlay({ open, onClose }) {
    const [query, setQuery] = useState('');
    const inputRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        document.body.style.overflow = open ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [open]);

    useEffect(() => {
        if (open) setTimeout(() => inputRef.current?.focus(), 80);
        else setQuery('');
    }, [open]);

    useEffect(() => {
        const h = (e) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', h);
        return () => window.removeEventListener('keydown', h);
    }, [onClose]);

    const results = query.trim().length > 0
        ? PRODUCTS.filter(p =>
            [p.name, p.brand, p.category, p.desc, p.tag]
                .join(' ').toLowerCase().includes(query.toLowerCase())
        )
        : [];

    const go = (path) => { navigate(path); onClose(); };

    return (
        <>
            {/* Backdrop */}
            <div onClick={onClose} style={{
                position: 'fixed', inset: 0,
                background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(10px)',
                zIndex: 3000, opacity: open ? 1 : 0,
                pointerEvents: open ? 'all' : 'none', transition: 'opacity 0.3s',
            }} />

            {/* Panel */}
            <div style={{
                position: 'fixed', top: 0, left: 0, right: 0, zIndex: 3001,
                background: '#0D0D0D', borderBottom: '1px solid rgba(255,255,255,0.08)',
                padding: '20px 24px 28px',
                transform: open ? 'translateY(0)' : 'translateY(-100%)',
                transition: 'transform 0.4s cubic-bezier(0.23,1,0.32,1)',
                maxHeight: '90vh', overflowY: 'auto',
            }}>

                {/* Search input row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, maxWidth: 860, margin: '0 auto', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: 14, marginBottom: 24 }}>
                    <IconSearch size={18} color="rgba(255,255,255,0.35)" />
                    <input
                        ref={inputRef}
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        placeholder="Search kicks, brands, categories..."
                        style={{
                            flex: 1, background: 'none', border: 'none', outline: 'none',
                            fontFamily: "'Barlow',sans-serif", fontWeight: 400,
                            fontSize: 18, color: 'white',
                        }}
                    />
                    {query && (
                        <button onClick={() => setQuery('')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.35)', fontSize: 22, cursor: 'pointer', lineHeight: 1 }}>×</button>
                    )}
                    <button onClick={onClose} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)', padding: '4px 10px', fontFamily: "'Barlow Condensed',sans-serif", fontSize: 10, letterSpacing: '0.1em', cursor: 'pointer', flexShrink: 0, borderRadius: 2 }}>ESC</button>
                </div>

                <div style={{ maxWidth: 860, margin: '0 auto' }}>

                    {/* ── Default: quick links + trending grid ── */}
                    {query.trim() === '' && (
                        <>
                            {/* Quick links */}
                            <div style={{ marginBottom: 28 }}>
                                <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 10, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.28)', marginBottom: 12 }}>QUICK LINKS</div>
                                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                    {QUICK_LINKS.map(l => (
                                        <button key={l.label} onClick={() => go(l.path)}
                                            style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 600, fontSize: 12, letterSpacing: '0.08em', padding: '7px 16px', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: 'rgba(255,255,255,0.55)', cursor: 'pointer', borderRadius: 2, transition: 'all 0.15s' }}
                                            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--red)'; e.currentTarget.style.color = 'white'; }}
                                            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'rgba(255,255,255,0.55)'; }}>
                                            {l.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Trending — 4 product cards with real photos */}
                            <div>
                                <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 10, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.28)', marginBottom: 12 }}>TRENDING NOW</div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
                                    {TRENDING.map(p => (
                                        <button key={p.id} onClick={() => go(`/product/${p.id}`)}
                                            style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden', cursor: 'pointer', textAlign: 'left', padding: 0, transition: 'border-color 0.2s, transform 0.2s' }}
                                            onMouseEnter={e => { e.currentTarget.style.borderColor = `${p.accent}66`; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                                            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.transform = 'none'; }}>
                                            {/* Real shoe photo */}
                                            <div style={{ height: 90, overflow: 'hidden', background: `linear-gradient(135deg,${p.color}18,${p.accent}14)` }}>
                                                <img src={getShoeImage(p.id, 0)} alt={p.name}
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.3s' }} />
                                            </div>
                                            <div style={{ padding: '8px 10px 10px' }}>
                                                <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 11, color: 'rgba(255,255,255,0.8)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                                                <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 15, color: p.accent, marginTop: 2 }}>${p.price}</div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}

                    {/* ── Results ── */}
                    {query.trim() !== '' && results.length > 0 && (
                        <>
                            <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 10, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.28)', marginBottom: 12 }}>
                                {results.length} RESULT{results.length !== 1 ? 'S' : ''}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                {results.map(p => (
                                    <button key={p.id} onClick={() => go(`/product/${p.id}`)}
                                        style={{ display: 'flex', alignItems: 'center', gap: 14, background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 3, padding: '10px 14px', cursor: 'pointer', textAlign: 'left', transition: 'border-color 0.15s' }}
                                        onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'}
                                        onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'}>
                                        {/* Real thumbnail */}
                                        <div style={{ width: 52, height: 52, borderRadius: 3, overflow: 'hidden', flexShrink: 0, background: `linear-gradient(135deg,${p.color}22,${p.accent}14)` }}>
                                            <img src={getShoeImage(p.id, 0)} alt={p.name}
                                                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 17, color: 'white', lineHeight: 1 }}>{p.name}</div>
                                            <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 10, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.35)', marginTop: 3 }}>{p.brand} · {p.category}</div>
                                        </div>
                                        <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 22, color: p.accent, flexShrink: 0 }}>${p.price}</div>
                                    </button>
                                ))}
                            </div>
                        </>
                    )}

                    {/* ── No results ── */}
                    {query.trim() !== '' && results.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '32px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
                            {/* Small shoe image instead of emoji */}
                            <div style={{ width: 80, height: 60, borderRadius: 4, overflow: 'hidden', opacity: 0.35 }}>
                                <img src={HERO_IMAGE} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                            <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 26, color: 'rgba(255,255,255,0.2)' }}>
                                NO RESULTS FOR "{query.toUpperCase()}"
                            </div>
                            <button onClick={() => go('/collection')} style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 12, letterSpacing: '0.12em', color: 'var(--red)', background: 'none', border: '1px solid var(--red)', padding: '8px 20px', cursor: 'pointer', borderRadius: 2 }}>
                                BROWSE ALL KICKS →
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}