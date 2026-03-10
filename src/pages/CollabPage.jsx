import { useState, useEffect, useRef } from 'react';
import useInView from '../hooks/useInView';
import useBreakpoint from '../hooks/useBreakPoint';
import { useCart } from '../context/CartContext';
import { COLLAB_IMAGES } from '../data/shoeImages';

const COLLABS = [
    { id: 1, artist: 'MARZ', city: 'TOKYO', title: 'VOID × MARZ', subtitle: 'STREET EDITION', price: 399, accent: '#FF6B35', bg: '#1A0D08', desc: 'Underground Tokyo street artist MARZ brings chaos and beauty to the Void Runner silhouette. Hand-sprayed details, laser-etched soles, and a story on every panel.', tags: ['GRAFFITI', 'TOKYO', 'LIMITED 500'], year: '2025', drops: 'MAR 18' },
    { id: 2, artist: 'LUNA', city: 'NEW YORK', title: 'CHROME × LUNA', subtitle: 'CELESTIAL SERIES', price: 449, accent: '#A78BFA', bg: '#0D0A1A', desc: "Cosmic themes meet premium materials. Luna's celestial artwork is UV-printed on buttery Italian suede — a galaxy you can lace up.", tags: ['CELESTIAL', 'NYC', 'LIMITED 300'], year: '2025', drops: 'APR 02' },
    { id: 3, artist: 'KOTO', city: 'OSAKA', title: 'EMBER × KOTO', subtitle: 'HERITAGE DROP', price: 359, accent: '#38BDF8', bg: '#080D1A', desc: 'Minimalist Japanese design philosophy meets Apex performance. Clean lines, deep soul. Koto distills decades of craft into one perfect silhouette.', tags: ['MINIMALIST', 'OSAKA', 'LIMITED 750'], year: '2025', drops: 'APR 22' },
    { id: 4, artist: 'VALE', city: 'LONDON', title: 'OBSIDIAN × VALE', subtitle: 'DARK ARTS', price: 529, accent: '#FBBF24', bg: '#0D0D08', desc: "London's most enigmatic designer creates an all-black obsidian masterpiece. 24K gold heat-stamped detailing. Only 200 exist on earth.", tags: ['LUXURY', 'LONDON', 'LIMITED 200'], year: '2025', drops: 'MAY 08' },
    { id: 5, artist: 'RENZO', city: 'MILAN', title: 'SOLAR × RENZO', subtitle: 'SUMMER SERIES', price: 289, accent: '#F87171', bg: '#1A0808', desc: 'Milan-based Renzo explodes with color on the Solar Strike platform. Pantone-matched overlays, gradient laces, and joy made completely physical.', tags: ['COLORFUL', 'MILAN', 'LIMITED 1000'], year: '2025', drops: 'MAY 30' },
    { id: 6, artist: 'ZEN', city: 'GLOBAL', title: 'APEX × ZEN', subtitle: 'CAPSULE 001', price: 479, accent: '#34D399', bg: '#081A0D', desc: 'The first-ever full capsule collection from multi-disciplinary artist Zen. Six styles, one singular vision. The most ambitious collab in Apex history.', tags: ['CAPSULE', 'GLOBAL', 'LIMITED 150'], year: '2025', drops: 'JUN 14' },
];

const PARTNERS = ['MARZ STUDIO', 'LUNA WORLD', 'KOTO.CO', 'VALE HOUSE', 'RENZO LABS', 'ZEN COLLECTIVE', 'CHROME INC.', 'VOID ART CO.', 'OBSIDIAN CREATIVE', 'SOLAR PRESS'];

function Marquee() {
    return (
        <div style={{ overflow: 'hidden', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', background: '#040404', padding: '11px 0' }}>
            <div style={{ display: 'flex', animation: 'marquee 30s linear infinite', width: 'max-content', whiteSpace: 'nowrap' }}>
                {[...PARTNERS, ...PARTNERS, ...PARTNERS].map((p, i) => (
                    <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 14, paddingLeft: 28 }}>
                        <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 10, letterSpacing: '0.24em', color: 'rgba(255,255,255,0.22)' }}>{p}</span>
                        <span style={{ color: 'var(--red)', fontSize: 7 }}>◆</span>
                    </span>
                ))}
            </div>
        </div>
    );
}

function FeaturedCollab({ collab }) {
    const [hovered, setHovered] = useState(false);
    const { addToCart } = useCart();
    const imgSrc = COLLAB_IMAGES[collab.id];

    return (
        <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
            style={{ position: 'relative', borderRadius: 3, overflow: 'hidden', background: collab.bg, border: `1px solid ${collab.accent}25`, minHeight: 520, display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
            <div style={{ position: 'absolute', inset: 0, backgroundImage: `linear-gradient(${collab.accent}06 1px,transparent 1px),linear-gradient(90deg,${collab.accent}06 1px,transparent 1px)`, backgroundSize: '44px 44px', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 65% 40%,${collab.accent}16 0%,transparent 60%)`, opacity: hovered ? 1 : 0.5, transition: 'opacity 0.6s', pointerEvents: 'none' }} />

            {/* Info */}
            <div style={{ padding: '52px 48px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
                <div>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 28, background: `${collab.accent}14`, border: `1px solid ${collab.accent}33`, padding: '7px 14px', borderRadius: 1 }}>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: collab.accent, boxShadow: `0 0 8px ${collab.accent}` }} />
                        <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 9, letterSpacing: '0.22em', color: collab.accent }}>LIVE NOW · {collab.artist} × APEX</span>
                    </div>
                    <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 10, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.3)', marginBottom: 10 }}>{collab.subtitle}</div>
                    <h2 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 'clamp(36px,3.8vw,64px)', color: 'white', lineHeight: 0.92, letterSpacing: '0.02em', marginBottom: 22 }}>{collab.title}</h2>
                    <p style={{ fontFamily: "'Barlow',sans-serif", fontSize: 15, color: 'rgba(255,255,255,0.5)', lineHeight: 1.85, maxWidth: 380, marginBottom: 26 }}>{collab.desc}</p>
                    <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginBottom: 36 }}>
                        {collab.tags.map(t => (
                            <span key={t} style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 8, letterSpacing: '0.16em', padding: '4px 10px', border: `1px solid ${collab.accent}44`, color: collab.accent }}>{t}</span>
                        ))}
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
                    <div>
                        <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 9, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.28)', marginBottom: 4 }}>RETAIL PRICE</div>
                        <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 52, color: collab.accent, lineHeight: 1 }}>${collab.price}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 10 }}>
                        <div style={{ textAlign: 'center', background: 'rgba(255,255,255,0.04)', border: `1px solid ${collab.accent}33`, padding: '10px 18px' }}>
                            <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 20, color: collab.accent, lineHeight: 1 }}>{collab.drops}</div>
                            <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 8, letterSpacing: '0.18em', color: 'rgba(255,255,255,0.28)', marginTop: 4 }}>DROP DATE</div>
                        </div>
                        <button onClick={() => addToCart({ ...collab, img: imgSrc, name: collab.title, brand: 'APEX', color: collab.bg, tag: 'COLLAB' })}
                            style={{ padding: '10px 30px', background: collab.accent, border: 'none', color: '#000', fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 12, letterSpacing: '0.18em', cursor: 'pointer', transition: 'opacity 0.2s, transform 0.2s', transform: hovered ? 'scale(1.04)' : 'scale(1)' }}
                            onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                            onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                            ADD TO CART
                        </button>
                    </div>
                </div>
            </div>

            {/* Image */}
            <div style={{ position: 'relative', overflow: 'hidden' }}>
                <img src={imgSrc} alt={collab.title} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.7s cubic-bezier(0.23,1,0.32,1)', transform: hovered ? 'scale(1.07)' : 'scale(1.01)', filter: `drop-shadow(0 32px 64px ${collab.accent}44)` }} />
                <div style={{ position: 'absolute', bottom: 24, right: 28, fontFamily: "'Bebas Neue',sans-serif", fontSize: 120, color: `${collab.accent}10`, lineHeight: 1, userSelect: 'none', pointerEvents: 'none' }}>{collab.year}</div>
                <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(to right, ${collab.bg}40, transparent)`, pointerEvents: 'none' }} />
            </div>
        </div>
    );
}

function CollabCard({ collab, inView, delay }) {
    const [hovered, setHovered] = useState(false);
    const [flipped, setFlipped] = useState(false);
    const { addToCart } = useCart();
    const imgSrc = COLLAB_IMAGES[collab.id];

    return (
        <div className={`reveal${inView ? ' revealed' : ''}`} style={{ transitionDelay: `${delay}ms`, perspective: 1000, height: 460 }}
            onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
            <div style={{ width: '100%', height: '100%', position: 'relative', transformStyle: 'preserve-3d', transition: 'transform 0.65s cubic-bezier(0.23,1,0.32,1)', transform: flipped ? 'rotateY(180deg)' : 'rotateY(0)' }}>

                {/* FRONT */}
                <div style={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', background: collab.bg, border: `1px solid ${hovered && !flipped ? collab.accent + '55' : 'rgba(255,255,255,0.05)'}`, borderRadius: 3, overflow: 'hidden', transition: 'border-color 0.3s' }}>
                    <div style={{ height: 270, position: 'relative', overflow: 'hidden', background: `radial-gradient(circle at 50% 65%, ${collab.accent}18, transparent 65%)` }}>
                        <img src={imgSrc} alt={collab.title} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.6s cubic-bezier(0.23,1,0.32,1)', transform: hovered && !flipped ? 'scale(1.09)' : 'scale(1)' }} />
                        <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(to top, ${collab.bg} 0%, transparent 55%)`, pointerEvents: 'none' }} />
                        <div style={{ position: 'absolute', top: 14, left: 14, background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(8px)', padding: '5px 12px', border: `1px solid ${collab.accent}44` }}>
                            <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 9, letterSpacing: '0.18em', color: collab.accent }}>× {collab.artist}</span>
                        </div>
                        <div style={{ position: 'absolute', top: 13, right: 14, fontFamily: "'Bebas Neue',sans-serif", fontSize: 28, color: 'white', textShadow: `0 0 20px ${collab.accent}66` }}>${collab.price}</div>
                    </div>
                    <div style={{ padding: '18px 20px 22px' }}>
                        <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 9, letterSpacing: '0.2em', color: collab.accent, marginBottom: 5 }}>{collab.subtitle}</div>
                        <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 22, color: 'white', letterSpacing: '0.04em', marginBottom: 12 }}>{collab.title}</div>
                        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 18 }}>
                            {collab.tags.slice(0, 2).map(t => (
                                <span key={t} style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 8, letterSpacing: '0.14em', padding: '3px 8px', border: `1px solid ${collab.accent}44`, color: collab.accent }}>{t}</span>
                            ))}
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                            <button onClick={() => addToCart({ ...collab, img: imgSrc, name: collab.title, brand: 'APEX', color: collab.bg, tag: 'COLLAB' })}
                                style={{ flex: 1, padding: '10px 0', background: collab.accent, border: 'none', color: '#000', fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 10, letterSpacing: '0.16em', cursor: 'pointer', transition: 'opacity 0.2s' }}
                                onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                                onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                                ADD TO CART
                            </button>
                            <button onClick={() => setFlipped(true)}
                                style={{ padding: '10px 14px', background: 'transparent', border: `1px solid ${collab.accent}44`, color: collab.accent, fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 10, letterSpacing: '0.1em', cursor: 'pointer', transition: 'all 0.2s' }}
                                onMouseEnter={e => { e.currentTarget.style.background = `${collab.accent}12`; e.currentTarget.style.borderColor = collab.accent; }}
                                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = `${collab.accent}44`; }}>
                                INFO ↗
                            </button>
                        </div>
                    </div>
                </div>

                {/* BACK */}
                <div style={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transform: 'rotateY(180deg)', background: `linear-gradient(160deg, ${collab.bg} 0%, #0a0a0a 100%)`, border: `1px solid ${collab.accent}44`, borderRadius: 3, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '28px 24px' }}>
                    <div>
                        <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 9, letterSpacing: '0.28em', color: collab.accent, marginBottom: 14 }}>COLLAB DETAILS</div>
                        <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 28, color: 'white', lineHeight: 1.05, marginBottom: 14 }}>{collab.title}</div>
                        <p style={{ fontFamily: "'Barlow',sans-serif", fontSize: 13, color: 'rgba(255,255,255,0.58)', lineHeight: 1.85, marginBottom: 22 }}>{collab.desc}</p>
                        {[['ARTIST', collab.artist], ['CITY', collab.city], ['DROP DATE', collab.drops], ['EDITION', collab.tags[2]]].map(([label, val]) => (
                            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 9, letterSpacing: '0.18em', color: 'rgba(255,255,255,0.3)' }}>{label}</span>
                                <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 13, color: 'white' }}>{val}</span>
                            </div>
                        ))}
                    </div>
                    <button onClick={() => setFlipped(false)}
                        style={{ marginTop: 16, padding: '11px 0', width: '100%', background: 'transparent', border: `1px solid ${collab.accent}44`, color: collab.accent, fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 10, letterSpacing: '0.16em', cursor: 'pointer', transition: 'background 0.2s' }}
                        onMouseEnter={e => e.currentTarget.style.background = `${collab.accent}10`}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        ← FLIP BACK
                    </button>
                </div>
            </div>
        </div>
    );
}

function StatsRow({ inView }) {
    const stats = [
        { value: '47+', label: 'GLOBAL COLLABS' },
        { value: '12', label: 'COUNTRIES' },
        { value: '850K+', label: 'PAIRS SOLD' },
        { value: '100+', label: 'ARTIST PARTNERS' },
    ];
    return (
        <div style={{ background: '#040404', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ maxWidth: 1400, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)' }}>
                {stats.map((s, i) => (
                    <div key={s.label} className={`reveal${inView ? ' revealed' : ''}`} style={{ transitionDelay: `${i * 70}ms`, padding: '36px 0', textAlign: 'center', borderRight: i < 3 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                        <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 'clamp(34px,3.8vw,54px)', color: 'white', lineHeight: 1, letterSpacing: '0.02em' }}>{s.value}</div>
                        <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 9, letterSpacing: '0.24em', color: 'rgba(255,255,255,0.28)', marginTop: 8 }}>{s.label}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ── Collab Application Modal ─────────────────────────────────────────────────
function CollabModal({ onClose }) {
    const [step, setStep] = useState('form');   // 'form' | 'sending' | 'success'
    const [error, setError] = useState('');
    const [form, setForm] = useState({ name: '', email: '', instagram: '', message: '' });
    const modalRef = useRef(null);

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        const fn = (e) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', fn);
        return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', fn); };
    }, [onClose]);

    const update = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

    async function handleSubmit() {
        if (!form.name.trim() || !form.email.trim()) {
            setError('Name and email are required.'); return;
        }
        if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) {
            setError('Please enter a valid email address.'); return;
        }
        setError('');
        setStep('sending');
        try {
            const res = await fetch('/api/newsletter/collab', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });
            const data = await res.json();
            if (!res.ok) { setError(data.error || 'Something went wrong.'); setStep('form'); return; }
            setStep('success');
        } catch {
            setError('Network error — please try again.'); setStep('form');
        }
    }

    const inputStyle = {
        width: '100%', boxSizing: 'border-box',
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.12)',
        color: '#F5F3EE',
        fontFamily: "'Barlow',sans-serif",
        fontSize: 14,
        padding: '12px 14px',
        borderRadius: 4,
        outline: 'none',
        transition: 'border-color 0.2s',
    };
    const labelStyle = {
        display: 'block',
        fontFamily: "'Barlow Condensed',sans-serif",
        fontWeight: 700,
        fontSize: 10,
        letterSpacing: '0.18em',
        color: 'rgba(255,255,255,0.38)',
        marginBottom: 6,
    };

    return (
        <div
            style={{
                position: 'fixed', inset: 0, zIndex: 9000,
                background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(16px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
                animation: 'fadeIn 0.22s ease',
            }}
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div
                ref={modalRef}
                style={{
                    width: '100%', maxWidth: 540,
                    background: '#111',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 12,
                    overflow: 'hidden',
                    animation: 'slideUp 0.3s cubic-bezier(0.23,1,0.32,1)',
                    position: 'relative',
                }}
            >
                {/* Header bar */}
                <div style={{ background: 'var(--red)', padding: '18px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                        <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 22, color: '#fff', letterSpacing: '0.08em', lineHeight: 1 }}>APPLY TO COLLAB</div>
                        <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 600, fontSize: 11, letterSpacing: '0.16em', color: 'rgba(255,255,255,0.7)', marginTop: 3 }}>WE WANT TO HEAR FROM YOU</div>
                    </div>
                    <button
                        onClick={onClose}
                        style={{ background: 'rgba(0,0,0,0.25)', border: 'none', color: 'white', width: 32, height: 32, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}
                    >×</button>
                </div>

                <div style={{ padding: '28px 28px' }}>
                    {step === 'success' ? (
                        <div style={{ textAlign: 'center', padding: '24px 0' }}>
                            <div style={{ fontSize: 52, marginBottom: 16 }}>🎨</div>
                            <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 28, color: '#fff', letterSpacing: '0.04em', marginBottom: 12 }}>APPLICATION RECEIVED</div>
                            <p style={{ fontFamily: "'Barlow',sans-serif", fontSize: 14, color: 'rgba(255,255,255,0.5)', lineHeight: 1.8, marginBottom: 24 }}>
                                Your vision is on our radar, <strong style={{ color: '#fff' }}>{form.name.split(' ')[0]}</strong>.
                                Our creative team will review your application and get back to you within 72 hours.
                                Check your inbox for a confirmation email.
                            </p>
                            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                                {[['⚙️', '48–72hr review'], ['📞', 'Brief call if shortlisted'], ['🚀', '6-week collab process']].map(([ico, lbl]) => (
                                    <div key={lbl} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <span style={{ fontSize: 16 }}>{ico}</span>
                                        <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 600, fontSize: 11, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.5)' }}>{lbl.toUpperCase()}</span>
                                    </div>
                                ))}
                            </div>
                            <button onClick={onClose} style={{ marginTop: 28, padding: '12px 36px', background: 'var(--red)', border: 'none', color: '#fff', fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 12, letterSpacing: '0.18em', borderRadius: 2, cursor: 'pointer' }}>
                                CLOSE
                            </button>
                        </div>
                    ) : (
                        <>
                            <p style={{ fontFamily: "'Barlow',sans-serif", fontSize: 13, color: 'rgba(255,255,255,0.4)', lineHeight: 1.75, marginBottom: 24, marginTop: 0 }}>
                                Tell us about your creative vision. We personally review every application —
                                no forms disappearing into a void.
                            </p>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                                <div>
                                    <label style={labelStyle}>NAME *</label>
                                    <input
                                        value={form.name} onChange={update('name')} placeholder="Your name"
                                        style={inputStyle}
                                        onFocus={e => e.target.style.borderColor = 'var(--red)'}
                                        onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
                                    />
                                </div>
                                <div>
                                    <label style={labelStyle}>EMAIL *</label>
                                    <input
                                        type="email" value={form.email} onChange={update('email')} placeholder="your@email.com"
                                        style={inputStyle}
                                        onFocus={e => e.target.style.borderColor = 'var(--red)'}
                                        onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
                                    />
                                </div>
                            </div>

                            <div style={{ marginBottom: 14 }}>
                                <label style={labelStyle}>INSTAGRAM (OPTIONAL)</label>
                                <input
                                    value={form.instagram} onChange={update('instagram')} placeholder="@yourhandle"
                                    style={inputStyle}
                                    onFocus={e => e.target.style.borderColor = 'var(--red)'}
                                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
                                />
                            </div>

                            <div style={{ marginBottom: 20 }}>
                                <label style={labelStyle}>TELL US ABOUT YOUR VISION (OPTIONAL)</label>
                                <textarea
                                    value={form.message} onChange={update('message')}
                                    placeholder="Describe your creative style, what you'd want to design, any past collabs, etc."
                                    rows={4}
                                    style={{ ...inputStyle, resize: 'vertical', minHeight: 96, fontFamily: "'Barlow',sans-serif" }}
                                    onFocus={e => e.target.style.borderColor = 'var(--red)'}
                                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
                                />
                            </div>

                            {error && (
                                <div style={{ background: 'rgba(255,34,0,0.1)', border: '1px solid rgba(255,34,0,0.3)', borderRadius: 4, padding: '10px 14px', marginBottom: 16 }}>
                                    <p style={{ fontFamily: "'Barlow',sans-serif", fontSize: 13, color: '#ff6b6b', margin: 0 }}>{error}</p>
                                </div>
                            )}

                            <button
                                onClick={handleSubmit}
                                disabled={step === 'sending'}
                                style={{
                                    width: '100%', padding: '14px 0',
                                    background: step === 'sending' ? 'rgba(255,34,0,0.5)' : 'var(--red)',
                                    border: 'none', color: '#fff',
                                    fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 13, letterSpacing: '0.2em',
                                    borderRadius: 2, cursor: step === 'sending' ? 'wait' : 'pointer',
                                    transition: 'background 0.2s',
                                }}
                            >
                                {step === 'sending' ? 'SUBMITTING…' : 'SEND APPLICATION →'}
                            </button>

                            <p style={{ fontFamily: "'Barlow',sans-serif", fontSize: 11, color: 'rgba(255,255,255,0.22)', marginTop: 12, textAlign: 'center' }}>
                                We respond within 72 hours. No spam, ever.
                            </p>
                        </>
                    )}
                </div>
            </div>

            <style>{`
        @keyframes fadeIn  { from { opacity:0; }              to { opacity:1; } }
        @keyframes slideUp { from { transform:translateY(30px); opacity:0; } to { transform:none; opacity:1; } }
      `}</style>
        </div>
    );
}

export default function CollabPage() {
    const [heroRef, heroInView] = useInView(0.1);
    const [statsRef, statsInView] = useInView(0.1);
    const [featRef, featInView] = useInView(0.04);
    const [gridRef, gridInView] = useInView(0.04);
    const [procRef, procInView] = useInView(0.04);
    const [featured, setFeatured] = useState(0);
    const [modalOpen, setModalOpen] = useState(false);
    const { isMobile, isTablet } = useBreakpoint();
    const px = isMobile ? 20 : isTablet ? 32 : 56;
    const cols = isMobile ? 1 : isTablet ? 2 : 3;

    useEffect(() => {
        const t = setInterval(() => setFeatured(f => (f + 1) % COLLABS.length), 6000);
        return () => clearInterval(t);
    }, []);

    const PROCESS = [
        { n: '01', title: 'ARTIST SELECTION', desc: 'We scout visionaries who push culture forward — not just aesthetics.' },
        { n: '02', title: 'CREATIVE BRIEF', desc: 'A six-week deep dive. No constraints. No compromises. Pure vision.' },
        { n: '03', title: 'MATERIAL LAB', desc: 'Every material is custom-sourced. If it needs to be made, we make it.' },
        { n: '04', title: 'PRODUCTION', desc: 'Hand-finished, quality-inspected, numbered. Each pair is an artifact.' },
        { n: '05', title: 'THE DROP', desc: 'Timed releases. Priority access for Apex Elite. No bots. No resellers.' },
    ];

    return (
        <div style={{ paddingTop: 64, background: '#080808' }}>
            {modalOpen && <CollabModal onClose={() => setModalOpen(false)} />}

            {/* ── HERO ─────────────────────────────────── */}
            <section ref={heroRef} style={{ minHeight: isMobile ? '55vh' : '70vh', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                {/* Animated orbs */}
                {[['#FF6B35', '8%', '18%', 520], ['#A78BFA', '62%', '55%', 400], ['#38BDF8', '78%', '8%', 340], ['#FBBF24', '28%', '72%', 280]].map(([c, x, y, sz], i) => (
                    <div key={i} style={{ position: 'absolute', top: y, left: x, width: sz, height: sz, background: `radial-gradient(circle,${c}11 0%,transparent 65%)`, borderRadius: '50%', filter: 'blur(55px)', animation: `orbFloat ${6 + i * 1.5}s ease-in-out infinite alternate`, animationDelay: `${i * 1.3}s`, pointerEvents: 'none' }} />
                ))}
                <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.02) 1px,transparent 1px)', backgroundSize: '56px 56px', pointerEvents: 'none' }} />

                <div style={{ maxWidth: 1400, margin: '0 auto', width: '100%', padding: `80px ${px}px ${isMobile ? 48 : 68}px`, position: 'relative', zIndex: 1 }}>
                    <div className={`reveal${heroInView ? ' revealed' : ''}`} style={{ marginBottom: 14 }}>
                        <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 9, letterSpacing: '0.36em', color: 'var(--red)', background: 'rgba(255,34,0,0.08)', border: '1px solid rgba(255,34,0,0.2)', padding: '4px 14px' }}>ARTIST COLLABORATIONS</span>
                    </div>
                    <h1 className={`reveal${heroInView ? ' revealed' : ''}`} style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: isMobile ? 'clamp(54px,14vw,80px)' : 'clamp(72px,9vw,134px)', color: 'white', lineHeight: 0.88, letterSpacing: '0.02em', marginBottom: 22, transitionDelay: '80ms' }}>
                        CULTURE<br />MEETS<br /><span style={{ WebkitTextStroke: '1px rgba(255,255,255,0.28)', color: 'transparent', letterSpacing: '0.04em' }}>CRAFT.</span>
                    </h1>
                    <div className={`reveal${heroInView ? ' revealed' : ''}`} style={{ transitionDelay: '160ms', display: 'flex', alignItems: 'center', gap: 28, flexWrap: 'wrap' }}>
                        <p style={{ fontFamily: "'Barlow',sans-serif", fontSize: isMobile ? 13 : 15, color: 'rgba(255,255,255,0.4)', maxWidth: 460, lineHeight: 1.85 }}>
                            We partner with visionary artists worldwide to push sneaker design into territory no brand has explored before. Every collab is a conversation between sport and art.
                        </p>
                        {/* Artist avatars */}
                        <div style={{ display: 'flex' }}>
                            {COLLABS.map((c, i) => (
                                <button key={c.id} onClick={() => setFeatured(i)}
                                    style={{ width: 38, height: 38, borderRadius: '50%', background: c.accent, border: `3px solid ${featured === i ? 'white' : '#080808'}`, marginLeft: i > 0 ? -10 : 0, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'border-color 0.25s,transform 0.2s', transform: featured === i ? 'scale(1.28) translateY(-3px)' : 'scale(1)', zIndex: featured === i ? 10 : 6 - i, position: 'relative' }}>
                                    <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 12, color: '#000', lineHeight: 1 }}>{c.artist[0]}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ── MARQUEE ──────────────────────────────── */}
            <Marquee />

            {/* ── STATS ────────────────────────────────── */}
            <div ref={statsRef}><StatsRow inView={statsInView} /></div>

            {/* ── FEATURED SPOTLIGHT ───────────────────── */}
            {!isMobile && (
                <section ref={featRef} style={{ padding: `80px ${px}px`, background: '#050505' }}>
                    <div style={{ maxWidth: 1400, margin: '0 auto' }}>
                        <div className={`reveal${featInView ? ' revealed' : ''}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
                            <div>
                                <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 9, letterSpacing: '0.28em', color: 'var(--red)', marginBottom: 10 }}>SPOTLIGHT</div>
                                <h2 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 44, color: 'white', letterSpacing: '0.02em' }}>FEATURED COLLAB</h2>
                            </div>
                            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 9, letterSpacing: '0.16em', color: 'rgba(255,255,255,0.28)', marginRight: 6 }}>CYCLE</span>
                                {COLLABS.map((_, i) => (
                                    <button key={i} onClick={() => setFeatured(i)}
                                        style={{ width: 8, height: 8, borderRadius: '50%', background: featured === i ? 'white' : 'rgba(255,255,255,0.2)', border: 'none', cursor: 'pointer', transition: 'background 0.25s,transform 0.2s', transform: featured === i ? 'scale(1.5)' : 'scale(1)' }} />
                                ))}
                            </div>
                        </div>
                        <div key={featured} style={{ animation: 'fadeSlideUp 0.45s ease' }}>
                            <FeaturedCollab collab={COLLABS[featured]} />
                        </div>
                    </div>
                </section>
            )}

            {/* ── COLLAB GRID ──────────────────────────── */}
            <section ref={gridRef} style={{ background: '#080808', padding: `${isMobile ? 56 : 80}px ${px}px ${isMobile ? 72 : 120}px` }}>
                <div style={{ maxWidth: 1400, margin: '0 auto' }}>
                    <div className={`reveal${gridInView ? ' revealed' : ''}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 48, flexWrap: 'wrap', gap: 16 }}>
                        <div>
                            <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 9, letterSpacing: '0.28em', color: 'var(--red)', marginBottom: 10 }}>ALL DROPS · 2025</div>
                            <h2 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: isMobile ? 36 : 52, color: 'white', letterSpacing: '0.02em' }}>THE FULL COLLECTION</h2>
                        </div>
                        <p style={{ fontFamily: "'Barlow',sans-serif", fontSize: 13, color: 'rgba(255,255,255,0.3)', lineHeight: 1.7, maxWidth: 300 }}>Hover to preview. Tap INFO to flip a card and read the full story.</p>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols},1fr)`, gap: isMobile ? 20 : 28 }}>
                        {COLLABS.map((c, i) => <CollabCard key={c.id} collab={c} inView={gridInView} delay={i * 90} />)}
                    </div>
                </div>
            </section>

            {/* ── PROCESS ──────────────────────────────── */}
            {!isMobile && (
                <section ref={procRef} style={{ background: '#050505', padding: `80px ${px}px 100px` }}>
                    <div style={{ maxWidth: 1400, margin: '0 auto' }}>
                        <div className={`reveal${procInView ? ' revealed' : ''}`} style={{ textAlign: 'center', marginBottom: 60 }}>
                            <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 9, letterSpacing: '0.28em', color: 'var(--red)', marginBottom: 14 }}>HOW WE WORK</div>
                            <h2 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 'clamp(40px,5vw,72px)', color: 'white', letterSpacing: '0.02em' }}>THE COLLAB PROCESS</h2>
                        </div>
                        {PROCESS.map((step, i) => (
                            <div key={step.n} className={`reveal${procInView ? ' revealed' : ''}`}
                                style={{ transitionDelay: `${i * 80}ms`, display: 'grid', gridTemplateColumns: '80px 1fr 1fr', gap: 36, alignItems: 'center', padding: '26px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 58, color: 'rgba(255,255,255,0.06)', lineHeight: 1 }}>{step.n}</div>
                                <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 20, color: 'white', letterSpacing: '0.04em' }}>{step.title}</div>
                                <div style={{ fontFamily: "'Barlow',sans-serif", fontSize: 14, color: 'rgba(255,255,255,0.44)', lineHeight: 1.75 }}>{step.desc}</div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* ── CTA ──────────────────────────────────── */}
            <section style={{ padding: `${isMobile ? 64 : 100}px ${px}px`, background: 'linear-gradient(135deg,#0D0808 0%,#080808 50%,#080D1A 100%)', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 600, height: 600, background: 'radial-gradient(circle,rgba(255,34,0,0.07) 0%,transparent 65%)', borderRadius: '50%', pointerEvents: 'none' }} />
                <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center', position: 'relative' }}>
                    <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 9, letterSpacing: '0.28em', color: 'var(--red)', marginBottom: 16 }}>WANT TO WORK WITH US?</div>
                    <h2 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: isMobile ? 'clamp(44px,12vw,60px)' : 'clamp(56px,6vw,90px)', color: 'white', lineHeight: 0.9, letterSpacing: '0.02em', marginBottom: 20 }}>
                        YOU COULD BE<br /><span style={{ color: 'var(--red)' }}>NEXT.</span>
                    </h2>
                    <p style={{ fontFamily: "'Barlow',sans-serif", fontSize: isMobile ? 14 : 16, color: 'rgba(255,255,255,0.4)', lineHeight: 1.85, marginBottom: 36 }}>
                        We collaborate with artists, designers, and visionaries who are pushing culture forward. If that's you — let's talk.
                    </p>
                    <button style={{ padding: '16px 52px', background: 'var(--red)', border: 'none', color: 'white', fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 13, letterSpacing: '0.2em', cursor: 'pointer', transition: 'background 0.2s' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#cc1a00'}
                        onMouseLeave={e => e.currentTarget.style.background = 'var(--red)'}>
                        APPLY TO COLLAB →
                    </button>
                </div>
            </section>

            <style>{`
        @keyframes marquee     { 0% { transform: translateX(0); } 100% { transform: translateX(-33.333%); } }
        @keyframes orbFloat    { 0% { transform: translateY(0) scale(1); } 100% { transform: translateY(-30px) scale(1.07); } }
        @keyframes fadeSlideUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: none; } }
      `}</style>
        </div>
    );
}