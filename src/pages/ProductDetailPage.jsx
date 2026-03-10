import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import useBreakpoint from '../hooks/useBreakPoint';
import useInventory from '../hooks/useInventory';
import { PRODUCTS } from '../data/products';
import { SHOE_SETS, getShoeImage } from '../data/shoeImages';

// ── Icons ─────────────────────────────────────────────────────
function HeartIcon({ filled, size = 20 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24"
            fill={filled ? 'var(--red)' : 'none'}
            stroke={filled ? 'var(--red)' : 'rgba(255,255,255,0.65)'}
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
    );
}

// ── Product extra data ────────────────────────────────────────
const EXTRA = {
    1: { features: ['Ultra-light carbon fiber plate', 'ReactFoam+ midsole', 'Breathable engineered mesh upper', '4D heel counter for lockdown fit', 'Recycled rubber outsole'], specs: { Weight: '218g (US9)', Drop: '8mm', Stack: '36mm heel / 28mm toe', Upper: 'Engineered Flyknit', Sole: 'Carbon Rubber' }, story: 'Born from 3 years of biomechanical research, the Phantom rewrites the rules of performance running.' },
    2: { features: ['Maximum cushion ZeroG foam', 'Adaptive arch support', 'Street-ready durable outsole', 'Moisture-wicking inner sleeve', 'Reflective heel detail'], specs: { Weight: '265g (US9)', Drop: '10mm', Stack: '40mm heel / 30mm toe', Upper: 'Double-knit mesh', Sole: 'High-abrasion rubber' }, story: 'Built for those who demand comfort without compromise — every single day.' },
    3: { features: ['Premium full-grain leather upper', 'Heritage vulcanised construction', 'Ortholite insole', 'Contrast stitching details', 'Gum rubber cupsole'], specs: { Weight: '310g (US9)', Drop: '0mm', Stack: '18mm uniform', Upper: 'Full-grain leather', Sole: 'Natural gum rubber' }, story: 'A love letter to sneaker culture. Takes everything iconic and makes it better.' },
    4: { features: ['Reactive dual-density foam', 'Midfoot TPU shank', 'Breathable perforated upper', 'Reinforced toe cap', 'Multi-directional outsole grip'], specs: { Weight: '298g (US9)', Drop: '6mm', Stack: '32mm heel / 26mm toe', Upper: 'Perforated synthetic', Sole: 'Blown rubber' }, story: 'Designed with input from 50+ professional trainers. The Ember Force does it all.' },
    5: { features: ['Premium nubuck upper', 'Invisible lacing system', 'Memory foam sockliner', 'Laser-cut ventilation', 'Contrast midsole unit'], specs: { Weight: '345g (US9)', Drop: '4mm', Stack: '28mm heel / 24mm toe', Upper: 'Premium nubuck', Sole: 'Crepe rubber' }, story: 'The result of our most ambitious brief: create the perfect sneaker. No distractions.' },
    6: { features: ['Solar-charged energy foam', 'Knit upper with reinforced zones', 'Dual-pull heel tab', 'Forefoot flex grooves', 'Recycled PET laces'], specs: { Weight: '241g (US9)', Drop: '8mm', Stack: '34mm heel / 26mm toe', Upper: 'Recycled knit', Sole: 'Energy rubber' }, story: 'Harnesses the science of energy return to give you more with every step.' },
};
const DEFAULT_EXTRA = {
    features: ['Premium performance upper', 'Responsive foam midsole', 'Durable rubber outsole', 'Ergonomic footbed', 'Breathable mesh lining'],
    specs: { Weight: '260g (US9)', Drop: '8mm', Stack: '34mm heel / 26mm toe', Upper: 'Engineered mesh', Sole: 'Rubber compound' },
    story: 'Every pair is crafted to the same relentless standard — built to perform, designed to turn heads.',
};

const SIZES = [6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10, 10.5, 11, 11.5, 12, 13];
const TABS = ['DETAILS', 'SPECS', 'STORY'];

// ── Gallery ───────────────────────────────────────────────────
function Gallery({ productId, accent, isMobile }) {
    const panels = (SHOE_SETS[productId] || SHOE_SETS[1]).panels;
    const [active, setActive] = useState(0);
    const [loaded, setLoaded] = useState(false);
    const pick = (i) => { if (i === active) return; setLoaded(false); setActive(i); };
    const activePanel = panels[active];

    if (isMobile) {
        return (
            <div>
                <div style={{ position: 'relative', background: '#141414', borderRadius: 4, overflow: 'hidden', aspectRatio: '4/3', marginBottom: 8 }}>
                    {!loaded && <Shimmer />}
                    <img key={active} src={activePanel.url} alt={activePanel.label} onLoad={() => setLoaded(true)}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', opacity: loaded ? 1 : 0, transition: 'opacity 0.3s' }} />
                    <AngleBadge label={activePanel.label} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 6 }}>
                    {panels.map((p, i) => <ThumbButton key={i} panel={p} active={active === i} accent={accent} onClick={() => pick(i)} aspectRatio="4/3" />)}
                </div>
            </div>
        );
    }

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px', gap: 10, alignItems: 'start' }}>
            <div style={{ position: 'relative', background: '#141414', borderRadius: 4, overflow: 'hidden', aspectRatio: '1/1' }}>
                {!loaded && <Shimmer />}
                <img key={active} src={activePanel.url} alt={activePanel.label} onLoad={() => setLoaded(true)}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', opacity: loaded ? 1 : 0, transition: 'opacity 0.4s ease' }} />
                <AngleBadge label={activePanel.label} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {panels.map((p, i) => <ThumbButton key={i} panel={p} active={active === i} accent={accent} onClick={() => pick(i)} aspectRatio="1/1" />)}
            </div>
        </div>
    );
}

function Shimmer() {
    return <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg,#1a1a1a 25%,#222 50%,#1a1a1a 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite' }} />;
}
function AngleBadge({ label }) {
    return (
        <div style={{ position: 'absolute', bottom: 12, left: 12, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.12)', padding: '4px 10px', borderRadius: 2, zIndex: 2 }}>
            <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 9, letterSpacing: '0.18em', color: 'rgba(255,255,255,0.8)' }}>{label.toUpperCase()} VIEW</span>
        </div>
    );
}
function ThumbButton({ panel, active, accent, onClick, aspectRatio = '1/1' }) {
    return (
        <button onClick={onClick}
            style={{ padding: 0, border: `2px solid ${active ? accent : 'rgba(255,255,255,0.08)'}`, borderRadius: 3, overflow: 'hidden', cursor: 'pointer', background: '#1a1a1a', aspectRatio, transition: 'border-color 0.2s', position: 'relative' }}
            onMouseEnter={e => { if (!active) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.28)'; }}
            onMouseLeave={e => { if (!active) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}>
            <img src={panel.url} alt={panel.label} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: active ? `${accent}dd` : 'rgba(0,0,0,0.55)', padding: '3px 6px', textAlign: 'center' }}>
                <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 7, letterSpacing: '0.12em', color: 'white' }}>{panel.label.toUpperCase()}</span>
            </div>
        </button>
    );
}

// ═══════════════════════════════════════════════════════════════
//  SIZE GUIDE DATA
// ═══════════════════════════════════════════════════════════════
const MENS_SIZES = [
    { us: 6, uk: 5.5, eu: 39, cm: '24.1', inches: '9½"' },
    { us: 6.5, uk: 6, eu: 39.5, cm: '24.5', inches: '9⅝"' },
    { us: 7, uk: 6.5, eu: 40, cm: '24.8', inches: '9¾"' },
    { us: 7.5, uk: 7, eu: 40.5, cm: '25.4', inches: '10"' },
    { us: 8, uk: 7.5, eu: 41, cm: '25.7', inches: '10⅛"' },
    { us: 8.5, uk: 8, eu: 42, cm: '26.0', inches: '10¼"' },
    { us: 9, uk: 8.5, eu: 42.5, cm: '26.7', inches: '10½"' },
    { us: 9.5, uk: 9, eu: 43, cm: '27.0', inches: '10⅝"' },
    { us: 10, uk: 9.5, eu: 44, cm: '27.3', inches: '10¾"' },
    { us: 10.5, uk: 10, eu: 44.5, cm: '27.9', inches: '11"' },
    { us: 11, uk: 10.5, eu: 45, cm: '28.3', inches: '11⅛"' },
    { us: 11.5, uk: 11, eu: 45.5, cm: '28.6', inches: '11¼"' },
    { us: 12, uk: 11.5, eu: 46, cm: '29.2', inches: '11½"' },
    { us: 13, uk: 12.5, eu: 47, cm: '30.0', inches: '11¾"' },
    { us: 14, uk: 13.5, eu: 48, cm: '30.8', inches: '12⅛"' },
];

// Women's US sizes are ~1.5 larger than Men's for the same foot length
const WOMENS_SIZES = [
    { us: 5, uk: 2.5, eu: 35, cm: '22.0', inches: '8⅝"' },
    { us: 5.5, uk: 3, eu: 35.5, cm: '22.4', inches: '8⅞"' },
    { us: 6, uk: 3.5, eu: 36, cm: '22.9', inches: '9"' },
    { us: 6.5, uk: 4, eu: 37, cm: '23.3', inches: '9⅛"' },
    { us: 7, uk: 4.5, eu: 37.5, cm: '23.8', inches: '9⅜"' },
    { us: 7.5, uk: 5, eu: 38, cm: '24.1', inches: '9½"' },
    { us: 8, uk: 5.5, eu: 38.5, cm: '24.5', inches: '9⅝"' },
    { us: 8.5, uk: 6, eu: 39, cm: '25.1', inches: '9⅞"' },
    { us: 9, uk: 6.5, eu: 40, cm: '25.4', inches: '10"' },
    { us: 9.5, uk: 7, eu: 40.5, cm: '25.7', inches: '10⅛"' },
    { us: 10, uk: 7.5, eu: 41, cm: '26.0', inches: '10¼"' },
    { us: 10.5, uk: 8, eu: 41.5, cm: '26.7', inches: '10½"' },
    { us: 11, uk: 8.5, eu: 42, cm: '27.1', inches: '10⅝"' },
    { us: 11.5, uk: 9, eu: 42.5, cm: '27.6', inches: '10⅞"' },
    { us: 12, uk: 9.5, eu: 43, cm: '28.0', inches: '11"' },
];

const SIZE_COLS = [
    { key: 'us', label: 'US', sub: 'United States' },
    { key: 'uk', label: 'UK', sub: 'United Kingdom' },
    { key: 'eu', label: 'EU', sub: 'Europe' },
    { key: 'cm', label: 'CM', sub: 'Foot length' },
    { key: 'inches', label: 'INCHES', sub: 'Foot length' },
];

const WIDTH_OPTIONS = [
    { code: 'B', label: 'NARROW', color: '#4FC3F7', highlight: false, desc: 'Slim profile with less internal volume. Best for narrow feet or low arches. Provides a snug, locked-in feel.' },
    { code: 'D', label: 'STANDARD', color: 'var(--red)', highlight: true, desc: 'Default width across all APEX styles. Fits the majority of foot shapes. All measurements in our chart are based on D width.' },
    { code: 'E', label: 'WIDE', color: '#66BB6A', highlight: false, desc: 'Extra volume across the forefoot and toe box. Ideal for wider feet, high arches, or those who prefer a roomier feel.' },
    { code: '2E', label: 'X-WIDE', color: '#FFB800', highlight: false, desc: 'Maximum internal width. Designed for very wide feet, bunions, or foot conditions requiring maximum splay.' },
];

const FIT_TIPS_DATA = [
    {
        color: 'var(--red)',
        title: 'MEASURE IN THE EVENING',
        body: "Feet naturally swell throughout the day. Measuring in the afternoon or evening gives the most accurate result — morning measurements can run up to half a size smaller due to reduced fluid in the tissues.",
    },
    {
        color: '#FFB800',
        title: 'WEAR YOUR USUAL SOCKS',
        body: "Always measure with the same socks you plan to wear with the shoe. Performance athletic socks typically add 2–4mm of volume compared to thin dress socks — enough to affect your comfort significantly.",
    },
    {
        color: '#00C851',
        title: 'MEASURE BOTH FEET',
        body: "One foot is almost always slightly larger than the other. This is completely normal. Always choose your size based on your larger foot — wearing a shoe even half a size too small causes discomfort over distance.",
    },
    {
        color: '#4FC3F7',
        title: 'CHECK TOE CLEARANCE',
        body: "Leave 10–12mm — roughly a thumb's width — of space between your longest toe and the end of the shoe. Shoes that are too tight in the toe box restrict blood flow and can cause blistering on long runs or walks.",
    },
    {
        color: '#C850C0',
        title: 'PERFORMANCE VS LIFESTYLE',
        body: "Performance running styles are built wider to accommodate foot expansion during exercise — size true or consider half a size up. Lifestyle and collab styles use a trimmer last and typically fit true to size.",
    },
    {
        color: '#FF6B35',
        title: 'FREE RETURNS — ALWAYS',
        body: "Unsure between two sizes? Order both and try them on a clean, indoor surface. Return the pair that doesn't fit within 30 days, completely free. We would rather you have the perfect fit than the wrong one.",
    },
];

// ═══════════════════════════════════════════════════════════════
//  SIZE GUIDE MODAL
// ═══════════════════════════════════════════════════════════════
function SizeGuideModal({ onClose }) {
    const [tab, setTab] = useState('chart');
    const [gender, setGender] = useState('mens');
    const [hoverRow, setHoverRow] = useState(null);

    const isMens = gender === 'mens';
    const tableData = isMens ? MENS_SIZES : WOMENS_SIZES;
    const accentColor = isMens ? 'var(--red)' : '#C850C0';
    const accentRgb = isMens ? '255,34,0' : '200,80,192';

    return (
        <div
            tabIndex={-1}
            onKeyDown={e => e.key === 'Escape' && onClose()}
            onClick={e => e.target === e.currentTarget && onClose()}
            style={{
                position: 'fixed', inset: 0, zIndex: 3000,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(14px)',
                padding: 16,
                animation: 'sgFade 0.2s ease',
            }}
        >
            <div style={{
                background: '#0b0b0b',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 12,
                width: '100%',
                maxWidth: 920,
                maxHeight: '92vh',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 60px 140px rgba(0,0,0,0.95)',
                animation: 'sgUp 0.3s cubic-bezier(0.23,1,0.32,1)',
                overflow: 'hidden',
            }}>

                {/* ── HEADER ─────────────────────────────────────────── */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '28px 36px 22px', borderBottom: '1px solid rgba(255,255,255,0.07)', flexShrink: 0 }}>
                    <div>
                        <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 10, letterSpacing: '0.32em', color: accentColor, marginBottom: 8, transition: 'color 0.3s' }}>APEX KICKS — SIZE GUIDE</div>
                        <h2 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 38, letterSpacing: '0.04em', color: 'white', lineHeight: 1, margin: 0 }}>FIND YOUR PERFECT FIT</h2>
                    </div>
                    <button onClick={onClose}
                        style={{ width: 42, height: 42, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', color: 'rgba(255,255,255,0.5)', flexShrink: 0 }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,34,0,0.14)'; e.currentTarget.style.borderColor = 'rgba(255,34,0,0.4)'; e.currentTarget.style.color = 'var(--red)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                    </button>
                </div>

                {/* ── TAB BAR ────────────────────────────────────────── */}
                <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.07)', padding: '0 36px', flexShrink: 0 }}>
                    {[['chart', 'SIZE CHART'], ['measure', 'HOW TO MEASURE'], ['tips', 'FIT TIPS']].map(([id, label]) => (
                        <button key={id} onClick={() => setTab(id)}
                            style={{
                                fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 12, letterSpacing: '0.16em',
                                padding: '16px 24px 16px 0', marginRight: 8,
                                background: 'none', border: 'none',
                                borderBottom: `2px solid ${tab === id ? accentColor : 'transparent'}`,
                                color: tab === id ? 'white' : 'rgba(255,255,255,0.32)',
                                cursor: 'pointer', transition: 'color 0.2s, border-color 0.2s',
                                marginBottom: -1,
                            }}>
                            {label}
                        </button>
                    ))}
                </div>

                {/* ── SCROLLABLE BODY ────────────────────────────────── */}
                <div style={{ overflowY: 'auto', flex: 1, scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.08) transparent' }}>

                    {/* ══ SIZE CHART ══════════════════════════════════════ */}
                    {tab === 'chart' && (
                        <div style={{ padding: '32px 36px 40px' }}>

                            {/* Gender toggle */}
                            <div style={{ display: 'flex', gap: 0, marginBottom: 28, background: 'rgba(255,255,255,0.05)', borderRadius: 8, padding: 5, width: 'fit-content' }}>
                                {[['mens', "MEN'S"], ['womens', "WOMEN'S"]].map(([g, label]) => (
                                    <button key={g} onClick={() => setGender(g)}
                                        style={{
                                            padding: '12px 32px',
                                            fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 13, letterSpacing: '0.14em',
                                            border: 'none', cursor: 'pointer', borderRadius: 6, transition: 'all 0.25s',
                                            background: gender === g ? (g === 'mens' ? 'var(--red)' : '#C850C0') : 'transparent',
                                            color: gender === g ? 'white' : 'rgba(255,255,255,0.38)',
                                            boxShadow: gender === g ? '0 4px 20px rgba(0,0,0,0.4)' : 'none',
                                        }}>
                                        {label}
                                    </button>
                                ))}
                            </div>

                            {/* Fit note */}
                            <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', padding: '16px 20px', background: `rgba(${accentRgb},0.07)`, border: `1px solid rgba(${accentRgb},0.25)`, borderRadius: 8, marginBottom: 28, transition: 'all 0.3s' }}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={accentColor} strokeWidth="2" strokeLinecap="round" style={{ marginTop: 1, flexShrink: 0 }}><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                                <div>
                                    <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 12, letterSpacing: '0.15em', color: 'white', marginBottom: 6 }}>
                                        {isMens ? "MEN'S FIT NOTE" : "WOMEN'S FIT NOTE"}
                                    </div>
                                    <p style={{ fontFamily: "'Barlow',sans-serif", fontSize: 15, color: 'rgba(255,255,255,0.6)', lineHeight: 1.75, margin: 0 }}>
                                        {isMens
                                            ? <span>APEX men's shoes run <strong style={{ color: 'white' }}>true to size</strong>. For performance running styles, consider going <strong style={{ color: 'white' }}>half a size up</strong> to accommodate foot expansion during exercise. Lifestyle styles fit true.</span>
                                            : <span>APEX women's shoes run <strong style={{ color: 'white' }}>true to size</strong>. Women's sizing is <strong style={{ color: 'white' }}>1.5 sizes larger</strong> than men's for the same foot length — e.g. Men's US 9 ≈ Women's US 10.5. If converting from men's, add 1.5 to your men's size.</span>
                                        }
                                    </p>
                                </div>
                            </div>

                            {/* Size table */}
                            <div style={{ overflowX: 'auto', borderRadius: 10, border: '1px solid rgba(255,255,255,0.09)' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 560 }}>
                                    <thead>
                                        <tr style={{ background: 'rgba(255,255,255,0.04)' }}>
                                            {SIZE_COLS.map((col, ci) => (
                                                <th key={col.key} style={{
                                                    padding: '18px 24px', textAlign: 'center',
                                                    borderBottom: '1px solid rgba(255,255,255,0.09)',
                                                    borderRight: ci < SIZE_COLS.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                                                }}>
                                                    <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 20, color: 'white', letterSpacing: '0.06em', lineHeight: 1, marginBottom: 4 }}>{col.label}</div>
                                                    <div style={{ fontFamily: "'Barlow',sans-serif", fontSize: 11, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.02em' }}>{col.sub}</div>
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {tableData.map((row, ri) => {
                                            const isHovered = hoverRow === ri;
                                            return (
                                                <tr key={`${gender}-${row.us}`}
                                                    onMouseEnter={() => setHoverRow(ri)}
                                                    onMouseLeave={() => setHoverRow(null)}
                                                    style={{
                                                        background: isHovered ? `rgba(${accentRgb},0.09)` : ri % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.018)',
                                                        borderLeft: `3px solid ${isHovered ? accentColor : 'transparent'}`,
                                                        cursor: 'default',
                                                        transition: 'background 0.15s, border-color 0.15s',
                                                    }}>
                                                    {SIZE_COLS.map((col, ci) => (
                                                        <td key={col.key} style={{
                                                            padding: '16px 24px', textAlign: 'center',
                                                            borderBottom: '1px solid rgba(255,255,255,0.05)',
                                                            borderRight: ci < SIZE_COLS.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                                                        }}>
                                                            {col.key === 'us'
                                                                ? <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 24, color: isHovered ? accentColor : 'white', letterSpacing: '0.04em', transition: 'color 0.15s', lineHeight: 1 }}>{row[col.key]}</span>
                                                                : <span style={{ fontFamily: "'Barlow',sans-serif", fontSize: 15, color: isHovered ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.58)', transition: 'color 0.15s' }}>{row[col.key]}</span>
                                                            }
                                                        </td>
                                                    ))}
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {/* Cross-gender note */}
                            <div style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '14px 20px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, marginTop: 20 }}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="2" strokeLinecap="round"><path d="M7 16V4m0 0L3 8m4-4 4 4" /><path d="M17 8v12m0 0 4-4m-4 4-4-4" /></svg>
                                <p style={{ fontFamily: "'Barlow',sans-serif", fontSize: 14, color: 'rgba(255,255,255,0.42)', margin: 0, lineHeight: 1.7 }}>
                                    <strong style={{ color: 'rgba(255,255,255,0.7)' }}>Converting between genders?</strong>
                                    {' '}Women's US sizes are{' '}
                                    <strong style={{ color: 'rgba(255,255,255,0.7)' }}>1.5 sizes larger</strong>{' '}
                                    than men's for the same foot. Men's 9 = Women's 10.5. Tap the toggle above to view the other chart.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* ══ HOW TO MEASURE ══════════════════════════════════ */}
                    {tab === 'measure' && (
                        <div style={{ padding: '32px 36px 40px' }}>
                            <p style={{ fontFamily: "'Barlow',sans-serif", fontSize: 16, color: 'rgba(255,255,255,0.5)', lineHeight: 1.8, marginBottom: 36, maxWidth: 660 }}>
                                For the most accurate sizing, measure your feet at home. All you need is a blank sheet of A4 paper, a pen or pencil, and a ruler.
                            </p>

                            {/* Diagram + steps */}
                            <div style={{ display: 'flex', gap: 48, alignItems: 'flex-start', flexWrap: 'wrap', marginBottom: 36 }}>
                                {/* SVG foot diagram */}
                                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '32px 28px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, flexShrink: 0, minWidth: 190 }}>
                                    <svg width="140" height="185" viewBox="0 0 140 185" xmlns="http://www.w3.org/2000/svg">
                                        {/* Foot silhouette */}
                                        <path d="M58 165 C30 158 22 132 24 102 C26 78 31 54 37 36 C41 22 49 12 58 10 C67 8 75 13 79 21 C84 30 85 41 83 48 C89 45 97 45 102 50 C107 56 106 67 100 71 C107 69 115 72 117 80 C119 89 114 100 107 102 C113 105 117 112 115 121 C113 130 105 135 97 133 C100 142 97 154 89 159 C95 163 97 174 91 180 C85 186 73 189 61 187 Z"
                                            fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" />
                                        {/* Length arrow — left side */}
                                        <line x1="14" y1="10" x2="14" y2="180" stroke="var(--red)" strokeWidth="1.8" strokeDasharray="5,3" />
                                        <polygon points="14,5 10.5,15 17.5,15" fill="var(--red)" />
                                        <polygon points="14,185 10.5,175 17.5,175" fill="var(--red)" />
                                        <text x="4" y="100" fontFamily="Arial" fontWeight="700" fontSize="9" fill="var(--red)" transform="rotate(-90,4,100)" textAnchor="middle">LENGTH</text>
                                        {/* Width arrow — bottom */}
                                        <line x1="24" y1="178" x2="115" y2="178" stroke="#FFB800" strokeWidth="1.8" strokeDasharray="5,3" />
                                        <polygon points="19,178 29,175 29,181" fill="#FFB800" />
                                        <polygon points="120,178 110,175 110,181" fill="#FFB800" />
                                        <text x="70" y="192" fontFamily="Arial" fontWeight="700" fontSize="9" fill="#FFB800" textAnchor="middle">WIDTH</text>
                                    </svg>
                                    {/* Legend */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <div style={{ width: 28, height: 2, background: 'var(--red)', borderRadius: 1, flexShrink: 0 }} />
                                            <span style={{ fontFamily: "'Barlow',sans-serif", fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>Foot length</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <div style={{ width: 28, height: 2, background: '#FFB800', borderRadius: 1, flexShrink: 0 }} />
                                            <span style={{ fontFamily: "'Barlow',sans-serif", fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>Foot width</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Steps */}
                                <div style={{ flex: 1, minWidth: 260, display: 'flex', flexDirection: 'column', gap: 26 }}>
                                    {[
                                        { n: '01', color: 'var(--red)', rgb: '255,34,0', text: 'Place a blank piece of A4 paper on a hard, flat floor. Stand on it barefoot with your heel pressed firmly against a wall.' },
                                        { n: '02', color: '#FFB800', rgb: '255,184,0', text: 'Hold a pen vertically and mark the tip of your longest toe. Then mark the widest point on both the inside and outside of your foot.' },
                                        { n: '03', color: '#00C851', rgb: '0,200,81', text: 'Measure from the wall to your toe mark in centimetres. This is your foot LENGTH — find it in the Size Chart above to identify your size.' },
                                        { n: '04', color: '#4FC3F7', rgb: '79,195,247', text: 'Measure across the two width marks. This is your foot WIDTH. Use the Width Guide in the Fit Tips tab if you fall between standard and wide.' },
                                    ].map(step => (
                                        <div key={step.n} style={{ display: 'flex', gap: 18, alignItems: 'flex-start' }}>
                                            <div style={{ width: 40, height: 40, borderRadius: '50%', background: `rgba(${step.rgb},0.12)`, border: `2px solid ${step.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 16, color: step.color, lineHeight: 1 }}>{step.n}</span>
                                            </div>
                                            <p style={{ fontFamily: "'Barlow',sans-serif", fontSize: 15, color: 'rgba(255,255,255,0.6)', lineHeight: 1.8, margin: 0, paddingTop: 9 }}>{step.text}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Conversion formulas */}
                            <div style={{ background: 'rgba(255,34,0,0.05)', border: '1px solid rgba(255,34,0,0.18)', borderRadius: 10, padding: '24px 28px' }}>
                                <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 11, letterSpacing: '0.24em', color: 'var(--red)', marginBottom: 20 }}>QUICK CONVERSION FORMULAS</div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 20 }}>
                                    {[
                                        { label: "CM → US (MEN'S)", formula: '(cm ÷ 0.667) − 22.5' },
                                        { label: "CM → US (WOMEN'S)", formula: '(cm ÷ 0.667) − 21' },
                                        { label: "EU → US (MEN'S)", formula: 'EU − 33' },
                                        { label: "EU → US (WOMEN'S)", formula: 'EU − 30.5' },
                                        { label: "UK → US (MEN'S)", formula: 'UK + 0.5' },
                                        { label: "UK → US (WOMEN'S)", formula: 'UK + 2.5' },
                                    ].map(f => (
                                        <div key={f.label}>
                                            <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 9, letterSpacing: '0.18em', color: 'rgba(255,255,255,0.32)', marginBottom: 6 }}>{f.label}</div>
                                            <div style={{ fontFamily: "'Barlow',sans-serif", fontSize: 15, color: 'rgba(255,255,255,0.72)' }}>{f.formula}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ══ FIT TIPS ════════════════════════════════════════ */}
                    {tab === 'tips' && (
                        <div style={{ padding: '32px 36px 40px' }}>

                            {/* Tip cards */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16, marginBottom: 36 }}>
                                {FIT_TIPS_DATA.map((tip, i) => (
                                    <div key={i}
                                        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '24px 26px', transition: 'border-color 0.2s, background 0.2s, transform 0.2s', cursor: 'default' }}
                                        onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.14)'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; e.currentTarget.style.transform = 'none'; }}>
                                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: tip.color, marginBottom: 16, boxShadow: `0 0 12px ${tip.color}` }} />
                                        <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 13, letterSpacing: '0.18em', color: 'white', marginBottom: 12, lineHeight: 1.3 }}>{tip.title}</div>
                                        <p style={{ fontFamily: "'Barlow',sans-serif", fontSize: 14, color: 'rgba(255,255,255,0.48)', lineHeight: 1.85, margin: 0 }}>{tip.body}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Width guide */}
                            <div style={{ border: '1px solid rgba(255,255,255,0.09)', borderRadius: 10, overflow: 'hidden' }}>
                                <div style={{ padding: '18px 28px', background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'baseline', gap: 12 }}>
                                    <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 22, letterSpacing: '0.06em', color: 'white' }}>WIDTH GUIDE</span>
                                    <span style={{ fontFamily: "'Barlow',sans-serif", fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>All APEX styles ship in D (Standard) width unless otherwise noted</span>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)' }}>
                                    {WIDTH_OPTIONS.map((w, i) => (
                                        <div key={w.code} style={{ padding: '24px 22px', borderRight: i < 3 ? '1px solid rgba(255,255,255,0.07)' : 'none', background: w.highlight ? 'rgba(255,34,0,0.05)' : 'transparent' }}>
                                            <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 36, color: w.color, lineHeight: 1, marginBottom: 8 }}>{w.code}</div>
                                            <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 11, letterSpacing: '0.18em', color: w.highlight ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.5)', marginBottom: 12 }}>{w.label}</div>
                                            <p style={{ fontFamily: "'Barlow',sans-serif", fontSize: 13, color: 'rgba(255,255,255,0.38)', lineHeight: 1.8, margin: 0 }}>{w.desc}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                </div>

                {/* ── FOOTER ─────────────────────────────────────────── */}
                <div style={{ padding: '20px 36px', borderTop: '1px solid rgba(255,255,255,0.07)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0, flexWrap: 'wrap', gap: 12, background: 'rgba(255,255,255,0.01)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.28)" strokeWidth="2" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                        <span style={{ fontFamily: "'Barlow',sans-serif", fontSize: 14, color: 'rgba(255,255,255,0.3)' }}>
                            Still unsure?{' '}
                            <span style={{ color: 'var(--red)', cursor: 'pointer', fontWeight: 600, textDecoration: 'underline', textUnderlineOffset: 3 }}>Chat with our fit experts →</span>
                        </span>
                    </div>
                    <button onClick={onClose} className="btn-primary" style={{ padding: '12px 34px', fontSize: 13, letterSpacing: '0.1em' }}>
                        CLOSE GUIDE
                    </button>
                </div>
            </div>

            <style>{`
        @keyframes sgFade { from { opacity: 0; } to { opacity: 1; } }
        @keyframes sgUp   { from { opacity: 0; transform: translateY(30px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
      `}</style>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════
//  PRODUCT DETAIL PAGE
// ═══════════════════════════════════════════════════════════════
export default function ProductDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const { toggleWishlist, isWishlisted } = useWishlist();
    const { isMobile, isTablet } = useBreakpoint();
    const px = isMobile ? 20 : isTablet ? 32 : 48;

    const product = PRODUCTS.find(p => p.id === Number(id));
    const detail = EXTRA[Number(id)] || DEFAULT_EXTRA;
    const wishlisted = product ? isWishlisted(product.id) : false;

    const [selectedSize, setSelectedSize] = useState(null);
    const [activeTab, setActiveTab] = useState(0);
    const [sizeError, setSizeError] = useState(false);
    const [addedState, setAddedState] = useState('idle');
    const [sizeGuideOpen, setSizeGuideOpen] = useState(false);

    // ── Live inventory ────────────────────────────────────────
    const { product: inv, loading: invLoading } = useInventory(product?.id);

    // Helper: get stock info for a size string
    const sizeInfo = (size) => inv?.sizes?.[String(size)] ?? null;

    const isProductSoldOut = inv ? inv.soldOut : false;
    const isProductLowStock = inv ? (inv.totalStock > 0 && inv.totalStock <= 5) : false;

    const handleAddToCart = () => {
        if (!selectedSize) { setSizeError(true); return; }
        const info = sizeInfo(selectedSize);
        if (info && info.soldOut) { setSizeError(true); return; }
        addToCart({ ...product, size: selectedSize });
        setAddedState('success');
        setTimeout(() => setAddedState('idle'), 2200);
    };

    if (!product) {
        return (
            <div style={{ paddingTop: 64, minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#080808', textAlign: 'center', padding: '80px 24px', gap: 16 }}>
                <div style={{ width: 120, height: 90, borderRadius: 8, overflow: 'hidden', opacity: 0.4, marginBottom: 8 }}>
                    <img src={getShoeImage(1, 0)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <h2 className="display-heading" style={{ fontSize: 48, color: 'rgba(255,255,255,0.3)' }}>PRODUCT NOT FOUND</h2>
                <button className="btn-primary" style={{ padding: '14px 32px', fontSize: 14 }} onClick={() => navigate('/collection')}>BROWSE COLLECTION →</button>
            </div>
        );
    }

    const related = PRODUCTS.filter(p => p.category === product.category && p.id !== product.id).slice(0, 3);

    return (
        <div className="page-enter" style={{ paddingTop: 64, background: '#080808', minHeight: '100vh' }}>

            {/* Breadcrumb */}
            <div style={{ padding: `14px ${px}px`, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ maxWidth: 1400, margin: '0 auto', display: 'flex', gap: 8, alignItems: 'center', fontFamily: "'Barlow Condensed',sans-serif", fontSize: 10, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.3)' }}>
                    <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>HOME</Link>
                    <span>›</span>
                    <Link to="/collection" style={{ color: 'inherit', textDecoration: 'none' }}>COLLECTION</Link>
                    <span>›</span>
                    <span style={{ color: 'rgba(255,255,255,0.6)' }}>{product.name}</span>
                </div>
            </div>

            {/* Main layout */}
            <div style={{ maxWidth: 1400, margin: '0 auto', padding: `${isMobile ? 24 : 48}px ${px}px`, display: 'grid', gridTemplateColumns: isTablet ? '1fr' : '1.15fr 1fr', gap: isMobile ? 32 : 72, alignItems: 'flex-start' }}>

                <Gallery productId={product.id} accent={product.accent} isMobile={isMobile} />

                <div style={{ position: isTablet ? 'static' : 'sticky', top: 80 }}>

                    {/* Tags */}
                    <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
                        <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 9, letterSpacing: '0.18em', background: 'var(--red)', color: 'white', padding: '3px 10px' }}>{product.tag}</span>
                        <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 9, letterSpacing: '0.18em', border: '1px solid rgba(255,255,255,0.14)', color: 'rgba(255,255,255,0.45)', padding: '3px 10px' }}>{product.category}</span>
                    </div>

                    <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 10, letterSpacing: '0.18em', color: 'rgba(255,255,255,0.35)', marginBottom: 4 }}>{product.brand}</div>
                    <h1 className="display-heading" style={{ fontSize: isMobile ? 'clamp(36px,10vw,50px)' : 'clamp(36px,4vw,56px)', lineHeight: 0.95, marginBottom: 14 }}>{product.name}</h1>

                    {/* Price + rating */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 20 }}>
                        <div className="display-heading" style={{ fontSize: isMobile ? 38 : 44, color: product.accent, lineHeight: 1 }}>${product.price}</div>
                        <div>
                            <div style={{ display: 'flex', gap: 2 }}>
                                {'★★★★★'.split('').map((s, i) => <span key={i} style={{ color: '#FFB800', fontSize: 13 }}>{s}</span>)}
                            </div>
                            <span style={{ fontFamily: "'Barlow',sans-serif", fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>284 reviews</span>
                        </div>
                    </div>

                    <p style={{ fontFamily: "'Barlow',sans-serif", fontSize: isMobile ? 14 : 15, color: 'rgba(255,255,255,0.5)', lineHeight: 1.8, marginBottom: 24 }}>{product.desc}</p>

                    {/* Size selector */}
                    <div style={{ marginBottom: 20 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                            <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 10, letterSpacing: '0.15em', color: sizeError ? 'var(--red)' : 'rgba(255,255,255,0.45)' }}>
                                {sizeError ? '⚠ SELECT A VALID SIZE' : `SIZE${selectedSize ? ` — US ${selectedSize}` : ''}`}
                            </span>
                            <button onClick={() => setSizeGuideOpen(true)}
                                style={{ display: 'flex', alignItems: 'center', gap: 5, fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 10, letterSpacing: '0.1em', color: 'var(--red)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, textDecoration: 'underline', textUnderlineOffset: 3 }}>
                                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                                SIZE GUIDE
                            </button>
                        </div>

                        {/* Low stock / sold out banner */}
                        {!invLoading && isProductSoldOut && (
                            <div style={{ padding: '10px 14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 4, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 10, letterSpacing: '0.18em', color: 'rgba(255,255,255,0.5)' }}>SOLD OUT — Check back soon or join the waitlist.</span>
                            </div>
                        )}
                        {!invLoading && isProductLowStock && !isProductSoldOut && (
                            <div style={{ padding: '10px 14px', background: 'rgba(255,184,0,0.06)', border: '1px solid rgba(255,184,0,0.3)', borderRadius: 4, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#FFB800', boxShadow: '0 0 6px #FFB800', flexShrink: 0 }} />
                                <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 10, letterSpacing: '0.16em', color: '#FFB800' }}>
                                    LOW STOCK — Only {inv?.totalStock} units remaining across all sizes
                                </span>
                            </div>
                        )}

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 5 }}>
                            {SIZES.map(size => {
                                const info = sizeInfo(size);
                                const soldOut = invLoading ? false : (info ? info.soldOut : false);
                                const lowStock = invLoading ? false : (info ? info.lowStock : false);
                                const stock = info?.stock ?? null;
                                const selected = selectedSize === size;

                                return (
                                    <div key={size} style={{ position: 'relative' }}>
                                        <button
                                            disabled={soldOut}
                                            onClick={() => { setSelectedSize(size); setSizeError(false); }}
                                            title={soldOut ? 'Sold out' : lowStock ? `Only ${stock} left` : undefined}
                                            style={{
                                                width: '100%',
                                                padding: isMobile ? '8px 2px' : '10px 2px',
                                                fontFamily: "'Barlow Condensed',sans-serif",
                                                fontWeight: 700,
                                                fontSize: isMobile ? 10 : 11,
                                                border: `1px solid ${selected ? product.accent : sizeError && !soldOut ? 'rgba(255,34,0,0.35)' : soldOut ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.09)'}`,
                                                background: selected ? product.accent + '22' : soldOut ? 'rgba(255,255,255,0.02)' : 'transparent',
                                                color: soldOut ? 'rgba(255,255,255,0.15)' : selected ? product.accent : lowStock ? '#FFB800' : 'rgba(255,255,255,0.65)',
                                                cursor: soldOut ? 'not-allowed' : 'pointer',
                                                textDecoration: soldOut ? 'line-through' : 'none',
                                                transition: 'all 0.15s',
                                                borderRadius: 2,
                                                position: 'relative',
                                            }}>
                                            {size}
                                        </button>
                                        {/* Low-stock dot indicator */}
                                        {lowStock && !soldOut && (
                                            <div style={{ position: 'absolute', top: 3, right: 3, width: 5, height: 5, borderRadius: '50%', background: '#FFB800', boxShadow: '0 0 4px #FFB800', pointerEvents: 'none' }} />
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Size legend */}
                        {!invLoading && inv && (
                            <div style={{ display: 'flex', gap: 14, marginTop: 10, flexWrap: 'wrap' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#FFB800', boxShadow: '0 0 4px #FFB800' }} />
                                    <span style={{ fontFamily: "'Barlow',sans-serif", fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>Low stock</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                    <div style={{ width: 8, height: 8, borderRadius: 2, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }} />
                                    <span style={{ fontFamily: "'Barlow',sans-serif", fontSize: 10, color: 'rgba(255,255,255,0.3)', textDecoration: 'line-through' }}>Sold out</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Add to cart + wishlist */}
                    <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
                        <button className="btn-primary" onClick={handleAddToCart}
                            disabled={isProductSoldOut}
                            style={{ flex: 1, padding: isMobile ? '14px' : '16px', fontSize: 14, background: isProductSoldOut ? 'rgba(255,255,255,0.07)' : addedState === 'success' ? '#00C851' : sizeError ? 'rgba(180,0,0,0.6)' : 'var(--red)', transition: 'background 0.3s', cursor: isProductSoldOut ? 'not-allowed' : 'pointer' }}>
                            {isProductSoldOut ? 'SOLD OUT' : addedState === 'success' ? '✓ ADDED TO CART' : sizeError ? 'SELECT A VALID SIZE' : 'ADD TO CART'}
                        </button>
                        <button onClick={() => toggleWishlist(product)}
                            style={{ width: 52, height: 52, flexShrink: 0, background: wishlisted ? 'rgba(255,34,0,0.12)' : 'rgba(255,255,255,0.05)', border: `1px solid ${wishlisted ? 'rgba(255,34,0,0.4)' : 'rgba(255,255,255,0.1)'}`, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }}>
                            <HeartIcon filled={wishlisted} size={20} />
                        </button>
                    </div>

                    {/* Trust badges */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 24, paddingBottom: 24, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                        {[['FREE SHIPPING', 'Orders over $150'], ['FREE RETURNS', '30-day window'], ['SECURE PAY', 'Encrypted checkout']].map(([title, sub]) => (
                            <div key={title} style={{ textAlign: 'center', padding: '10px 4px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 2 }}>
                                <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 9, letterSpacing: '0.12em', color: 'rgba(255,255,255,0.65)', marginBottom: 2 }}>{title}</div>
                                <div style={{ fontFamily: "'Barlow',sans-serif", fontSize: 9, color: 'rgba(255,255,255,0.3)' }}>{sub}</div>
                            </div>
                        ))}
                    </div>

                    {/* Detail tabs */}
                    <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.07)', marginBottom: 18 }}>
                        {TABS.map((tab, i) => (
                            <button key={tab} onClick={() => setActiveTab(i)}
                                style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 10, letterSpacing: '0.15em', padding: '10px 18px', background: 'none', border: 'none', color: activeTab === i ? 'white' : 'rgba(255,255,255,0.3)', cursor: 'pointer', borderBottom: `2px solid ${activeTab === i ? product.accent : 'transparent'}`, transition: 'all 0.2s', marginBottom: -1 }}>
                                {tab}
                            </button>
                        ))}
                    </div>
                    <div style={{ minHeight: 110 }}>
                        {activeTab === 0 && (
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 9 }}>
                                {detail.features.map(f => (
                                    <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, fontFamily: "'Barlow',sans-serif", fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>
                                        <span style={{ color: product.accent, fontSize: 7, flexShrink: 0 }}>◆</span>{f}
                                    </li>
                                ))}
                            </ul>
                        )}
                        {activeTab === 1 && (
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <tbody>
                                    {Object.entries(detail.specs).map(([key, val]) => (
                                        <tr key={key} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                            <td style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 10, letterSpacing: '0.12em', color: 'rgba(255,255,255,0.35)', padding: '9px 0', width: '40%' }}>{key.toUpperCase()}</td>
                                            <td style={{ fontFamily: "'Barlow',sans-serif", fontSize: 13, color: 'rgba(255,255,255,0.6)', padding: '9px 0' }}>{val}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                        {activeTab === 2 && (
                            <p style={{ fontFamily: "'Barlow',sans-serif", fontSize: 14, color: 'rgba(255,255,255,0.5)', lineHeight: 1.9 }}>{detail.story}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Related products */}
            {related.length > 0 && (
                <div style={{ maxWidth: 1400, margin: '0 auto', padding: `0 ${px}px ${isMobile ? 56 : 96}px` }}>
                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: isMobile ? 36 : 52, marginBottom: isMobile ? 22 : 32, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <span className="section-label">YOU MIGHT ALSO LIKE</span>
                            <h2 className="display-heading" style={{ fontSize: isMobile ? 30 : 42, marginTop: 8 }}>RELATED KICKS</h2>
                        </div>
                        <Link to="/collection" style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 11, letterSpacing: '0.15em', color: 'var(--red)', textDecoration: 'none' }}>VIEW ALL →</Link>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${isMobile ? 1 : isTablet ? 2 : 3}, 1fr)`, gap: isMobile ? 14 : 22 }}>
                        {related.map(p => (
                            <div key={p.id} onClick={() => navigate(`/product/${p.id}`)}
                                style={{ cursor: 'pointer', background: '#111', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 4, overflow: 'hidden', transition: 'transform 0.35s cubic-bezier(0.23,1,0.32,1), box-shadow 0.35s' }}
                                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.5)'; }}
                                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}>
                                <div style={{ height: 200, background: `linear-gradient(135deg,${p.color}18,${p.accent}10)`, overflow: 'hidden' }}>
                                    <img src={getShoeImage(p.id, 0)} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                                </div>
                                <div style={{ padding: '14px 16px 18px' }}>
                                    <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 9, letterSpacing: '0.15em', color: 'rgba(255,255,255,0.3)', marginBottom: 2 }}>{p.brand}</div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div className="display-heading" style={{ fontSize: 17 }}>{p.name}</div>
                                        <div className="display-heading" style={{ fontSize: 19, color: p.accent }}>${p.price}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {sizeGuideOpen && <SizeGuideModal onClose={() => setSizeGuideOpen(false)} />}

            <style>{`
        @keyframes shimmer { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
      `}</style>
        </div>
    );
}