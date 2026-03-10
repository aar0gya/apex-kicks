// apex-kicks/src/pages/DropsPage.jsx
import { useState, useEffect, useMemo } from 'react';
import useInView from '../hooks/useInView';
import useBreakpoint from '../hooks/useBreakPoint';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

// ─────────────────────────────────────────────────────────────
//  Drop data  (12 drops across all statuses)
// ─────────────────────────────────────────────────────────────
const photo = (id, w = 800, h = 520) =>
  `https://images.unsplash.com/photo-${id}?w=${w}&h=${h}&q=90&fit=crop&fp-x=0.5&fp-y=0.55&auto=format`;

// Unsplash IDs mapped to product photo IDs (reuse same sneaker shots)
const P = {
  1: '1542291026-7eec264c27ff',
  2: '1606107557195-0e29a4b5b4aa',
  3: '1543508282-6319a3e2621f',
  4: '1608231387042-66d1773d3028',
  5: '1600185365926-3a2ce3cdb9eb',
  6: '1595950653106-6c9ebd614d3a',
  7: '1539185441755-769473a23570',
  8: '1491553895911-0055eca6402d',
  9: '1525966222134-fcfa99b8ae77',
  10: '1584735175315-9d5df23860e6',
  11: '1605408499391-6368c628ef42',
  12: '1587563871167-1ee9c731aefb',
};

// status: 'live' | 'upcoming' | 'sold-out' | 'raffle'
const DROPS = [
  {
    id: 101, productId: 1, name: 'PHANTOM X2', sub: 'LUNAR WHITE',
    price: 289, edition: 'LIMITED 800',
    accent: '#FF4500', bg: '#1A0D08',
    status: 'live', dropDate: new Date(Date.now() - 86400000 * 2),
    img: photo(P[1]), tag: 'NEW DROP',
    desc: 'The next evolution of the Phantom silhouette. Featherweight carbon fibre construction meets our most advanced ReactFoam™ midsole.',
    category: 'RUNNING', sizes: [7, 7.5, 8, 8.5, 9, 9.5, 10, 11],
  },
  {
    id: 102, productId: 2, name: 'VOID RUNNER', sub: 'STEALTH BLACK',
    price: 219, edition: 'LIMITED 1200',
    accent: '#4FC3F7', bg: '#080D1A',
    status: 'live', dropDate: new Date(Date.now() - 86400000 * 5),
    img: photo(P[2]), tag: 'BESTSELLER',
    desc: 'All-black everything. Maximum cushion returns in the sleekest Void Runner colourway ever made. The streets demanded it.',
    category: 'LIFESTYLE', sizes: [6.5, 7, 7.5, 8, 9, 10, 11, 12],
  },
  {
    id: 103, productId: 7, name: 'CHROME ELITE', sub: 'COBALT STORM',
    price: 349, edition: 'LIMITED 400',
    accent: '#3B82F6', bg: '#080A1A',
    status: 'live', dropDate: new Date(Date.now() - 86400000 * 1),
    img: photo(P[7]), tag: 'HOT',
    desc: 'Deep ocean blue meets platinum chrome. The Elite tier arrives with premium suede overlays and a glow-in-the-dark outsole detail.',
    category: 'LIFESTYLE', sizes: [7, 8, 9, 10, 11],
  },
  {
    id: 104, productId: 4, name: 'EMBER FORCE', sub: 'VOLCANIC ORANGE',
    price: 259, edition: 'LIMITED 600',
    accent: '#FF6B35', bg: '#1A0D08',
    status: 'upcoming', dropDate: new Date(Date.now() + 86400000 * 3),
    img: photo(P[4]), tag: 'DROPPING SOON',
    desc: 'Training performance taken to the extreme. Volcanic Orange colourway drops with an updated reactive-heel cup for lateral support.',
    category: 'TRAINING', sizes: [7, 7.5, 8, 8.5, 9, 9.5, 10, 10.5, 11],
  },
  {
    id: 105, productId: 6, name: 'SOLAR STRIKE', sub: 'GOLD RUSH',
    price: 199, edition: 'LIMITED 2000',
    accent: '#FBBF24', bg: '#1A1208',
    status: 'upcoming', dropDate: new Date(Date.now() + 86400000 * 7),
    img: photo(P[6]), tag: 'DROPPING SOON',
    desc: 'The most affordable entry in the 2025 lineup. Gold Rush colourway with full-length ReactFoam™ and energy-return outsole geometry.',
    category: 'TRAINING', sizes: [6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10, 11, 12],
  },
  {
    id: 106, productId: 3, name: 'OBSIDIAN PRO', sub: 'MIDNIGHT GOLD',
    price: 499, edition: 'LIMITED 150',
    accent: '#FBBF24', bg: '#0D0D08',
    status: 'raffle', dropDate: new Date(Date.now() + 86400000 * 14),
    img: photo(P[3]), tag: 'RAFFLE',
    desc: 'By far our most exclusive 2025 release. 24K gold detailing, hand-stitched upper, and a signed certificate of authenticity from the design team.',
    category: 'COLLAB', sizes: [7, 8, 9, 10, 11],
  },
  {
    id: 107, productId: 9, name: 'APEX CLOUD', sub: 'BONE WHITE',
    price: 229, edition: 'LIMITED 500',
    accent: '#E5E7EB', bg: '#141414',
    status: 'upcoming', dropDate: new Date(Date.now() + 86400000 * 5),
    img: photo(P[9]), tag: 'DROPPING SOON',
    desc: 'Ultralight construction inspired by minimalist architecture. The Cloud sits 42mm off the ground with our softest foam blend yet.',
    category: 'RUNNING', sizes: [7, 7.5, 8, 9, 10, 11],
  },
  {
    id: 108, productId: 5, name: 'VOID RUNNER', sub: 'ACID LIME',
    price: 189, edition: 'RESTOCKED',
    accent: '#84CC16', bg: '#0D1A08',
    status: 'live', dropDate: new Date(Date.now() - 86400000 * 0.5),
    img: photo(P[5]), tag: 'RESTOCKED',
    desc: 'It came back. By overwhelming demand, the Acid Lime Void Runner has been restocked — for the last time. Ever.',
    category: 'LIFESTYLE', sizes: [7, 8, 9, 10],
  },
  {
    id: 109, productId: 10, name: 'TERRA GRIP', sub: 'FOREST SHADOW',
    price: 279, edition: 'LIMITED 700',
    accent: '#059669', bg: '#081A10',
    status: 'upcoming', dropDate: new Date(Date.now() + 86400000 * 10),
    img: photo(P[10]), tag: 'DROPPING SOON',
    desc: 'APEX enters the trail category. Lugged outsole, waterproof membrane, and an upper engineered from 100% recycled mesh.',
    category: 'RUNNING', sizes: [7, 7.5, 8, 8.5, 9, 9.5, 10, 11, 12],
  },
  {
    id: 110, productId: 12, name: 'PHANTOM LOW', sub: 'CEMENT GREY',
    price: 219, edition: 'LIMITED 1000',
    accent: '#9CA3AF', bg: '#111111',
    status: 'sold-out', dropDate: new Date(Date.now() - 86400000 * 30),
    img: photo(P[12]), tag: 'SOLD OUT',
    desc: 'Dropped. Sold. Gone in 8 minutes flat. The Phantom Low in Cement Grey was our fastest-ever sellout. Resale market: +180%.',
    category: 'LIFESTYLE', sizes: [],
  },
  {
    id: 111, productId: 11, name: 'SOLAR STRIKE', sub: 'NEON BURST',
    price: 239, edition: 'LIMITED 300',
    accent: '#EC4899', bg: '#1A0814',
    status: 'raffle', dropDate: new Date(Date.now() + 86400000 * 21),
    img: photo(P[11]), tag: 'RAFFLE',
    desc: 'Electric pink meets performance. The Neon Burst colourway is our boldest statement shoe to date. Enter the raffle — only 300 pairs exist.',
    category: 'TRAINING', sizes: [7, 8, 9, 10, 11],
  },
  {
    id: 112, productId: 8, name: 'APEX HERITAGE', sub: 'SAND & BONE',
    price: 169, edition: 'LIMITED 3000',
    accent: '#D97706', bg: '#1A1508',
    status: 'live', dropDate: new Date(Date.now() - 86400000 * 7),
    img: photo(P[8]), tag: 'NEW',
    desc: 'Back to basics. Sand & Bone Heritage combines vintage-era APEX design language with modern construction and a hand-burnished leather toe.',
    category: 'LIFESTYLE', sizes: [6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10, 10.5, 11, 12, 13],
  },
];

const STATUS_FILTERS = ['ALL', 'LIVE NOW', 'UPCOMING', 'RAFFLE', 'SOLD OUT'];
const CAT_FILTERS = ['ALL', 'RUNNING', 'LIFESTYLE', 'TRAINING', 'COLLAB'];

const STATUS_META = {
  live: { label: 'LIVE NOW', color: '#22C55E', pulse: true },
  upcoming: { label: 'UPCOMING', color: '#FBBF24', pulse: false },
  raffle: { label: 'RAFFLE', color: '#A78BFA', pulse: true },
  'sold-out': { label: 'SOLD OUT', color: '#6B7280', pulse: false },
};

// ─────────────────────────────────────────────────────────────
//  Helpers
// ─────────────────────────────────────────────────────────────
function useCountdown(target) {
  const [remaining, setRemaining] = useState(Math.max(0, target - Date.now()));
  useEffect(() => {
    const t = setInterval(() => setRemaining(Math.max(0, target - Date.now())), 1000);
    return () => clearInterval(t);
  }, [target]);
  const s = Math.floor(remaining / 1000);
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return { d, h, m, s: sec, done: remaining <= 0 };
}

function pad(n) { return String(n).padStart(2, '0'); }

function Heart({ filled }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24"
      fill={filled ? 'var(--red)' : 'none'}
      stroke={filled ? 'var(--red)' : 'rgba(255,255,255,0.85)'}
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────
//  CountdownUnit — small tile
// ─────────────────────────────────────────────────────────────
function CountdownTile({ value, label, accent }) {
  return (
    <div style={{ textAlign: 'center', minWidth: 44 }}>
      <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 28, color: accent, lineHeight: 1, letterSpacing: '0.04em' }}>{pad(value)}</div>
      <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 7, letterSpacing: '0.22em', color: 'rgba(255,255,255,0.32)', marginTop: 2 }}>{label}</div>
    </div>
  );
}

function CountdownSep() {
  return <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 24, color: 'rgba(255,255,255,0.2)', alignSelf: 'flex-start', marginTop: 2 }}>:</div>;
}

// ─────────────────────────────────────────────────────────────
//  StatusBadge
// ─────────────────────────────────────────────────────────────
function StatusBadge({ status, size = 'sm' }) {
  const _meta = STATUS_META[status];
  const fs = size === 'lg' ? 10 : 8;
  const px = size === 'lg' ? 12 : 8;
  const py = size === 'lg' ? 5 : 3;
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: `${meta.color}18`, border: `1px solid ${meta.color}55`, padding: `${py}px ${px}px` }}>
      {meta.pulse && (
        <div style={{ position: 'relative', width: 6, height: 6, flexShrink: 0 }}>
          <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: meta.color, animation: 'pulseRing 1.4s ease-out infinite' }} />
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: meta.color }} />
        </div>
      )}
      <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: fs, letterSpacing: '0.2em', color: meta.color }}>{meta.label}</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  Notify modal
// ─────────────────────────────────────────────────────────────
function NotifyModal({ drop, onClose }) {
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);
  const [vis, setVis] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVis(true));
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  useEffect(() => {
    const fn = e => { if (e.key === 'Escape') close(); };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function close() { setVis(false); setTimeout(onClose, 300); }

  return (
    <>
      <div onClick={close} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.82)', backdropFilter: 'blur(8px)', zIndex: 1200, opacity: vis ? 1 : 0, transition: 'opacity 0.3s' }} />
      <div style={{ position: 'fixed', top: '50%', left: '50%', transform: vis ? 'translate(-50%,-50%) scale(1)' : 'translate(-50%,-50%) scale(0.94)', zIndex: 1201, width: 'min(90vw,440px)', background: '#0f0f0f', border: `1px solid ${drop.accent}44`, borderRadius: 4, padding: '36px 32px', opacity: vis ? 1 : 0, transition: 'all 0.32s cubic-bezier(0.23,1,0.32,1)' }}>
        <button onClick={close} style={{ position: 'absolute', top: 14, right: 14, background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: 18, lineHeight: 1 }}>✕</button>

        {!done ? (
          <>
            <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 9, letterSpacing: '0.28em', color: drop.accent, marginBottom: 10 }}>NOTIFY ME</div>
            <h3 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 28, color: 'white', letterSpacing: '0.04em', lineHeight: 1.05, marginBottom: 6 }}>{drop.name}<br /><span style={{ color: 'rgba(255,255,255,0.4)' }}>{drop.sub}</span></h3>
            <p style={{ fontFamily: "'Barlow',sans-serif", fontSize: 13, color: 'rgba(255,255,255,0.45)', lineHeight: 1.7, marginBottom: 24 }}>We'll send you a one-time alert the moment this drop goes live. No spam — ever.</p>
            <input type="email" placeholder="YOUR EMAIL ADDRESS" value={email} onChange={e => setEmail(e.target.value)}
              style={{ width: '100%', padding: '13px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', color: 'white', fontFamily: "'Barlow Condensed',sans-serif", fontSize: 12, letterSpacing: '0.1em', outline: 'none', borderRadius: 2, marginBottom: 10, boxSizing: 'border-box' }} />
            <button onClick={() => email.trim() && setDone(true)}
              style={{ width: '100%', padding: '14px 0', background: drop.accent, border: 'none', color: drop.accent === '#E5E7EB' || drop.accent === '#FBBF24' ? '#000' : '#000', fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 12, letterSpacing: '0.2em', cursor: 'pointer', borderRadius: 2, transition: 'opacity 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
              NOTIFY ME →
            </button>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>🔔</div>
            <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 26, color: 'white', marginBottom: 8 }}>YOU'RE ON THE LIST.</div>
            <p style={{ fontFamily: "'Barlow',sans-serif", fontSize: 13, color: 'rgba(255,255,255,0.45)', lineHeight: 1.7 }}>We'll notify you at <strong style={{ color: drop.accent }}>{email}</strong> when {drop.name} drops.</p>
          </div>
        )}
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────
//  Hero Spotlight (rotates through first 3 live drops)
// ─────────────────────────────────────────────────────────────
function HeroSpotlight({ drops, isMobile, px }) {
  const [active, setActive] = useState(0);
  const [fading, setFading] = useState(false);
  const { addToCart } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const drop = drops[active];
  const wishlisted = isWishlisted(drop.id);
  const [notifyOpen, setNotifyOpen] = useState(false);

  function go(i) {
    if (i === active) return;
    setFading(true);
    setTimeout(() => { setActive(i); setFading(false); }, 220);
  }

  // Auto-rotate
  useEffect(() => {
    const t = setInterval(() => go((active + 1) % drops.length), 7000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, drops.length]);

  if (!drop) return null;

  return (
    <section style={{ position: 'relative', overflow: 'hidden', background: drop.bg, minHeight: isMobile ? '80vh' : '88vh', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', transition: 'background 0.5s ease' }}>
      {notifyOpen && <NotifyModal drop={drop} onClose={() => setNotifyOpen(false)} />}

      {/* Grid lines */}
      <div style={{ position: 'absolute', inset: 0, backgroundImage: `linear-gradient(${drop.accent}06 1px,transparent 1px),linear-gradient(90deg,${drop.accent}06 1px,transparent 1px)`, backgroundSize: '52px 52px', pointerEvents: 'none' }} />

      {/* Ambient glow */}
      <div style={{ position: 'absolute', top: '5%', right: '8%', width: '50vw', height: '60vh', background: `radial-gradient(ellipse at 60% 40%, ${drop.accent}18 0%, transparent 65%)`, pointerEvents: 'none', transition: 'background 0.6s' }} />

      {/* BIG background number */}
      <div style={{ position: 'absolute', right: '-1%', bottom: isMobile ? '38%' : '5%', fontFamily: "'Bebas Neue',sans-serif", fontSize: isMobile ? '38vw' : '22vw', color: `${drop.accent}08`, lineHeight: 1, userSelect: 'none', pointerEvents: 'none', letterSpacing: '-0.02em' }}>
        {String(drops.indexOf(drop) + 1).padStart(2, '0')}
      </div>

      {/* Hero image — floats on desktop, fills on mobile */}
      <div style={{ position: isMobile ? 'relative' : 'absolute', top: isMobile ? 0 : '50%', right: isMobile ? 0 : '4%', width: isMobile ? '100%' : '46%', height: isMobile ? 300 : 'auto', transform: isMobile ? 'none' : 'translateY(-50%)', opacity: fading ? 0 : 1, transition: 'opacity 0.22s ease' }}>
        <img src={drop.img} alt={drop.name}
          style={{ width: '100%', height: isMobile ? '100%' : 580, objectFit: 'cover', objectPosition: 'center', display: 'block', filter: `drop-shadow(0 40px 80px ${drop.accent}44)` }} />
      </div>

      {/* Content */}
      <div style={{ maxWidth: 1400, margin: '0 auto', width: '100%', padding: `${isMobile ? 32 : 80}px ${px}px ${isMobile ? 40 : 72}px`, position: 'relative', zIndex: 2, opacity: fading ? 0 : 1, transition: 'opacity 0.22s ease' }}>
        <div style={{ maxWidth: isMobile ? '100%' : '52%' }}>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
            <StatusBadge status={drop.status} size="lg" />
            <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 10, letterSpacing: '0.22em', color: 'rgba(255,255,255,0.3)' }}>{drop.edition}</span>
          </div>

          <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 11, letterSpacing: '0.24em', color: 'rgba(255,255,255,0.35)', marginBottom: 8 }}>{drop.sub}</div>
          <h1 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: isMobile ? 'clamp(56px,14vw,80px)' : 'clamp(72px,7vw,110px)', color: 'white', lineHeight: 0.88, letterSpacing: '0.02em', marginBottom: 20 }}>{drop.name}</h1>
          <p style={{ fontFamily: "'Barlow',sans-serif", fontSize: isMobile ? 13 : 16, color: 'rgba(255,255,255,0.5)', lineHeight: 1.8, maxWidth: 480, marginBottom: 28 }}>{drop.desc}</p>

          {/* Price + actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', marginBottom: 28 }}>
            <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: isMobile ? 40 : 52, color: drop.accent, lineHeight: 1 }}>${drop.price}</div>

            {drop.status === 'live' && (
              <button onClick={() => addToCart({ id: drop.id, productId: drop.productId, name: drop.name, price: drop.price, accent: drop.accent, color: drop.bg, tag: drop.tag, img: drop.img, size: 9 })}
                style={{ padding: isMobile ? '13px 28px' : '15px 40px', background: drop.accent, border: 'none', color: '#000', fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: isMobile ? 12 : 13, letterSpacing: '0.2em', cursor: 'pointer', borderRadius: 2, transition: 'opacity 0.2s, transform 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.opacity = '0.85'; e.currentTarget.style.transform = 'scale(1.03)'; }}
                onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'scale(1)'; }}>
                ADD TO CART →
              </button>
            )}
            {(drop.status === 'upcoming' || drop.status === 'raffle') && (
              <button onClick={() => setNotifyOpen(true)}
                style={{ padding: isMobile ? '13px 28px' : '15px 40px', background: 'transparent', border: `1px solid ${drop.accent}77`, color: drop.accent, fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: isMobile ? 12 : 13, letterSpacing: '0.2em', cursor: 'pointer', borderRadius: 2, transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.background = `${drop.accent}18`; e.currentTarget.style.borderColor = drop.accent; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = `${drop.accent}77`; }}>
                🔔 NOTIFY ME
              </button>
            )}
            {drop.status === 'sold-out' && (
              <div style={{ padding: '15px 40px', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.3)', fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 13, letterSpacing: '0.2em' }}>SOLD OUT</div>
            )}

            <button onClick={() => toggleWishlist({ id: drop.id, name: drop.name, price: drop.price, accent: drop.accent })}
              style={{ width: 44, height: 44, borderRadius: '50%', background: wishlisted ? 'rgba(255,34,0,0.2)' : 'rgba(255,255,255,0.06)', border: `1px solid ${wishlisted ? 'rgba(255,34,0,0.5)' : 'rgba(255,255,255,0.15)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }}>
              <Heart filled={wishlisted} />
            </button>
          </div>

          {/* Countdown for upcoming/raffle */}
          {(drop.status === 'upcoming' || drop.status === 'raffle') && (
            <DropCountdown target={drop.dropDate.getTime()} accent={drop.accent} label="DROPS IN" />
          )}
        </div>
      </div>

      {/* Dots */}
      <div style={{ position: 'absolute', bottom: isMobile ? 16 : 28, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 8, zIndex: 3 }}>
        {drops.map((_, i) => (
          <button key={i} onClick={() => go(i)}
            style={{ width: active === i ? 24 : 8, height: 8, borderRadius: 4, background: active === i ? drop.accent : 'rgba(255,255,255,0.2)', border: 'none', cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.23,1,0.32,1)', padding: 0 }} />
        ))}
      </div>

      {/* Slide index */}
      <div style={{ position: 'absolute', top: isMobile ? 76 : 92, right: `${px}px`, fontFamily: "'Bebas Neue',sans-serif", fontSize: 11, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.2)', zIndex: 3 }}>
        {String(active + 1).padStart(2, '0')} / {String(drops.length).padStart(2, '0')}
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────
//  DropCountdown — standalone bar
// ─────────────────────────────────────────────────────────────
function DropCountdown({ target, accent, label = 'DROPS IN' }) {
  const { d, h, m, s, done } = useCountdown(target);
  if (done) return null;
  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 9, letterSpacing: '0.28em', color: 'rgba(255,255,255,0.35)' }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
        {d > 0 && <><CountdownTile value={d} label="DAYS" accent={accent} /><CountdownSep /></>}
        <CountdownTile value={h} label="HRS" accent={accent} />
        <CountdownSep />
        <CountdownTile value={m} label="MIN" accent={accent} />
        <CountdownSep />
        <CountdownTile value={s} label="SEC" accent={accent} />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  Drop Card
// ─────────────────────────────────────────────────────────────
function DropCard({ drop, inView, delay }) {
  const [hovered, setHovered] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [notifyOpen, setNotifyOpen] = useState(false);
  const { addToCart } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const { isMobile } = useBreakpoint();
  const wishlisted = isWishlisted(drop.id);
  const isSoldOut = drop.status === 'sold-out';
  const isLive = drop.status === 'live';
  const _meta = STATUS_META[drop.status];
  const imgH = isMobile ? 220 : 280;

  return (
    <>
      {notifyOpen && <NotifyModal drop={drop} onClose={() => setNotifyOpen(false)} />}
      <div className={`reveal${inView ? ' revealed' : ''}`}
        style={{ transitionDelay: `${delay}ms`, background: drop.bg || '#111', border: `1px solid ${hovered && !isSoldOut ? drop.accent + '55' : 'rgba(255,255,255,0.06)'}`, borderRadius: 3, overflow: 'hidden', transition: 'border-color 0.28s, transform 0.38s cubic-bezier(0.23,1,0.32,1), box-shadow 0.38s', transform: hovered && !isSoldOut ? 'translateY(-8px)' : 'none', boxShadow: hovered && !isSoldOut ? `0 32px 64px rgba(0,0,0,0.6), 0 0 0 1px ${drop.accent}1a` : 'none', opacity: isSoldOut ? 0.7 : 1 }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}>

        {/* Image area */}
        <div style={{ height: imgH, position: 'relative', overflow: 'hidden', background: `radial-gradient(circle at 50% 60%, ${drop.accent}18, transparent 65%)` }}>
          {!imgLoaded && <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg,#1a1a1a 25%,#222 50%,#1a1a1a 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite' }} />}

          <img src={drop.img} alt={drop.name} onLoad={() => setImgLoaded(true)}
            style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: imgLoaded ? (isSoldOut ? 0.45 : 1) : 0, transition: 'opacity 0.4s, transform 0.6s cubic-bezier(0.23,1,0.32,1)', transform: hovered && !isSoldOut ? 'scale(1.08)' : 'scale(1)', filter: isSoldOut ? 'grayscale(100%)' : 'none', display: 'block' }} />

          {/* Bottom gradient */}
          <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(to top, ${drop.bg || '#111'} 0%, transparent 55%)`, pointerEvents: 'none' }} />
          {/* Hover glow */}
          <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(circle at 50% 65%, ${drop.accent}28, transparent 65%)`, opacity: hovered ? 1 : 0, transition: 'opacity 0.4s', pointerEvents: 'none' }} />

          {/* Status badge */}
          <div style={{ position: 'absolute', top: 12, left: 12, zIndex: 3 }}>
            <StatusBadge status={drop.status} />
          </div>

          {/* Wishlist */}
          <button onClick={e => { e.stopPropagation(); toggleWishlist({ id: drop.id, name: drop.name, price: drop.price, accent: drop.accent }); }}
            style={{ position: 'absolute', top: 10, right: 10, zIndex: 3, width: 32, height: 32, borderRadius: '50%', background: wishlisted ? 'rgba(255,34,0,0.25)' : 'rgba(0,0,0,0.65)', border: `1px solid ${wishlisted ? 'rgba(255,34,0,0.6)' : 'rgba(255,255,255,0.15)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', opacity: hovered || wishlisted || isMobile ? 1 : 0, transition: 'all 0.2s', backdropFilter: 'blur(6px)' }}>
            <Heart filled={wishlisted} />
          </button>

          {/* Edition tag */}
          <div style={{ position: 'absolute', bottom: 12, left: 12, fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 8, letterSpacing: '0.18em', color: 'rgba(255,255,255,0.55)', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)', padding: '3px 8px' }}>{drop.edition}</div>

          {/* CTA overlay on hover (desktop) */}
          {!isMobile && !isSoldOut && (
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 12, display: 'flex', gap: 8, opacity: hovered ? 1 : 0, transform: hovered ? 'translateY(0)' : 'translateY(10px)', transition: 'opacity 0.25s, transform 0.28s cubic-bezier(0.23,1,0.32,1)', zIndex: 4 }}>
              {isLive ? (
                <button onClick={e => { e.stopPropagation(); addToCart({ id: drop.id, productId: drop.productId, name: drop.name, price: drop.price, accent: drop.accent, color: drop.bg, tag: drop.tag, img: drop.img, size: 9 }); }}
                  style={{ flex: 1, padding: '11px 0', background: drop.accent, border: 'none', color: '#000', fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 10, letterSpacing: '0.18em', cursor: 'pointer', borderRadius: 2, transition: 'opacity 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                  onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                  QUICK ADD →
                </button>
              ) : (
                <button onClick={e => { e.stopPropagation(); setNotifyOpen(true); }}
                  style={{ flex: 1, padding: '11px 0', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)', border: `1px solid ${drop.accent}55`, color: drop.accent, fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 10, letterSpacing: '0.18em', cursor: 'pointer', borderRadius: 2, transition: 'background 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.background = `${drop.accent}18`}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}>
                  🔔 NOTIFY ME
                </button>
              )}
            </div>
          )}
        </div>

        {/* Info */}
        <div style={{ padding: isMobile ? '16px 16px 20px' : '18px 20px 22px' }}>
          <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 9, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.3)', marginBottom: 4 }}>{drop.category} · {drop.sub}</div>
          <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: isMobile ? 20 : 24, color: 'white', letterSpacing: '0.04em', lineHeight: 1, marginBottom: 8 }}>{drop.name}</div>
          <p style={{ fontFamily: "'Barlow',sans-serif", fontSize: isMobile ? 11 : 12, color: 'rgba(255,255,255,0.38)', lineHeight: 1.65, marginBottom: 14 }}>{drop.desc}</p>

          {/* Countdown for upcoming/raffle */}
          {(drop.status === 'upcoming' || drop.status === 'raffle') && !isMobile && (
            <div style={{ marginBottom: 14, paddingBottom: 14, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <DropCountdown target={drop.dropDate.getTime()} accent={drop.accent} />
            </div>
          )}

          {/* Bottom row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: isMobile ? 24 : 30, color: isSoldOut ? 'rgba(255,255,255,0.25)' : drop.accent, lineHeight: 1 }}>${drop.price}</div>

            {/* Mobile CTA */}
            {isMobile && (
              isLive ? (
                <button onClick={() => addToCart({ id: drop.id, productId: drop.productId, name: drop.name, price: drop.price, accent: drop.accent, color: drop.bg, tag: drop.tag, img: drop.img, size: 9 })}
                  style={{ padding: '10px 20px', background: drop.accent, border: 'none', color: '#000', fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 10, letterSpacing: '0.14em', cursor: 'pointer', borderRadius: 2 }}>
                  ADD TO CART
                </button>
              ) : isSoldOut ? (
                <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 10, letterSpacing: '0.14em', color: 'rgba(255,255,255,0.25)' }}>SOLD OUT</span>
              ) : (
                <button onClick={() => setNotifyOpen(true)}
                  style={{ padding: '10px 18px', background: 'transparent', border: `1px solid ${drop.accent}55`, color: drop.accent, fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 10, letterSpacing: '0.14em', cursor: 'pointer', borderRadius: 2 }}>
                  🔔 NOTIFY
                </button>
              )
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────
//  Stats row
// ─────────────────────────────────────────────────────────────
function StatsRow({ inView }) {
  const stats = [
    { v: '12', l: 'DROPS THIS SEASON' },
    { v: '8 MIN', l: 'FASTEST SELLOUT' },
    { v: '47K+', l: 'NOTIFY LIST' },
    { v: '100%', l: 'SELL-THROUGH RATE' },
  ];
  return (
    <div style={{ background: '#040404', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
      <div style={{ maxWidth: 1400, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)' }}>
        {stats.map((s, i) => (
          <div key={s.l} className={`reveal${inView ? ' revealed' : ''}`}
            style={{ transitionDelay: `${i * 70}ms`, padding: '32px 0', textAlign: 'center', borderRight: i < 3 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
            <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 'clamp(28px,3.5vw,48px)', color: 'white', lineHeight: 1 }}>{s.v}</div>
            <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 9, letterSpacing: '0.24em', color: 'rgba(255,255,255,0.28)', marginTop: 7 }}>{s.l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  Main Page
// ─────────────────────────────────────────────────────────────
export default function DropsPage() {
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [catFilter, setCatFilter] = useState('ALL');
  const [statsRef, statsInView] = useInView(0.1);
  const [gridRef, gridInView] = useInView(0.04);
  const { isMobile, isTablet } = useBreakpoint();
  const px = isMobile ? 20 : isTablet ? 32 : 56;
  const cols = isMobile ? 1 : isTablet ? 2 : 3;

  // Map filter label → status key
  const statusMap = { 'ALL': null, 'LIVE NOW': 'live', 'UPCOMING': 'upcoming', 'RAFFLE': 'raffle', 'SOLD OUT': 'sold-out' };

  const filtered = useMemo(() => {
    const sKey = statusMap[statusFilter];
    return DROPS
      .filter(d => !sKey || d.status === sKey)
      .filter(d => catFilter === 'ALL' || d.category === catFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, catFilter]);

  // Spotlight = featured live/upcoming drops only
  const spotlightDrops = useMemo(() => DROPS.filter(d => d.status === 'live').slice(0, 4), []);

  return (
    <div style={{ paddingTop: 64, background: '#080808', minHeight: '100vh' }}>

      {/* ── HERO SPOTLIGHT ──────────────────── */}
      <HeroSpotlight drops={spotlightDrops} isMobile={isMobile} px={px} />

      {/* ── STATS ──────────────────────────── */}
      <div ref={statsRef}><StatsRow inView={statsInView} /></div>

      {/* ── FILTER BAR ─────────────────────── */}
      <div style={{ background: '#040404', borderBottom: '1px solid rgba(255,255,255,0.06)', position: 'sticky', top: 64, zIndex: 80 }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: `0 ${px}px` }}>
          <div style={{ display: 'flex', gap: 0, overflowX: 'auto', scrollbarWidth: 'none', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
            {STATUS_FILTERS.map(f => (
              <button key={f} onClick={() => setStatusFilter(f)}
                style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: isMobile ? 9 : 11, letterSpacing: '0.2em', padding: isMobile ? '12px 12px' : '15px 20px', background: 'none', border: 'none', borderBottom: `2px solid ${statusFilter === f ? 'var(--red)' : 'transparent'}`, color: statusFilter === f ? 'white' : 'rgba(255,255,255,0.3)', cursor: 'pointer', transition: 'color 0.2s, border-color 0.2s', whiteSpace: 'nowrap', flexShrink: 0, marginBottom: -1 }}>
                {f === 'LIVE NOW' ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#22C55E', display: 'inline-block', boxShadow: '0 0 6px #22C55E' }} />
                    {f}
                  </span>
                ) : f}
              </button>
            ))}
          </div>

          {/* Category sub-filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 0', overflowX: 'auto', scrollbarWidth: 'none' }}>
            <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 9, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.2)', flexShrink: 0, marginRight: 4 }}>CATEGORY:</span>
            {CAT_FILTERS.map(c => (
              <button key={c} onClick={() => setCatFilter(c)}
                style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 9, letterSpacing: '0.16em', padding: '4px 10px', background: catFilter === c ? 'var(--red)' : 'transparent', border: `1px solid ${catFilter === c ? 'var(--red)' : 'rgba(255,255,255,0.12)'}`, color: catFilter === c ? 'white' : 'rgba(255,255,255,0.38)', cursor: 'pointer', transition: 'all 0.18s', borderRadius: 1, whiteSpace: 'nowrap', flexShrink: 0 }}>
                {c}
              </button>
            ))}
            <span style={{ marginLeft: 'auto', fontFamily: "'Barlow Condensed',sans-serif", fontSize: 9, letterSpacing: '0.16em', color: 'rgba(255,255,255,0.22)', flexShrink: 0 }}>{filtered.length} DROP{filtered.length !== 1 ? 'S' : ''}</span>
          </div>
        </div>
      </div>

      {/* ── GRID ───────────────────────────── */}
      <section ref={gridRef} style={{ background: '#080808', padding: `${isMobile ? 40 : 64}px ${px}px ${isMobile ? 80 : 120}px` }}>
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 24px' }}>
              <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 52, color: 'rgba(255,255,255,0.06)', marginBottom: 16 }}>NO DROPS FOUND</div>
              <p style={{ fontFamily: "'Barlow',sans-serif", fontSize: 14, color: 'rgba(255,255,255,0.3)', marginBottom: 24 }}>Try a different filter.</p>
              <button onClick={() => { setStatusFilter('ALL'); setCatFilter('ALL'); }}
                style={{ padding: '12px 32px', background: 'var(--red)', border: 'none', color: 'white', fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 11, letterSpacing: '0.2em', cursor: 'pointer', borderRadius: 2 }}>
                SHOW ALL DROPS
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: isMobile ? 18 : 26 }}>
              {filtered.map((d, i) => (
                <DropCard key={d.id} drop={d} inView={gridInView} delay={Math.min(i, 5) * 80} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── NOTIFY CTA ─────────────────────── */}
      <section style={{ background: 'linear-gradient(135deg, #0D0808, #080808, #080D1A)', padding: `${isMobile ? 64 : 100}px ${px}px`, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 700, height: 700, background: 'radial-gradient(circle, rgba(255,34,0,0.05) 0%, transparent 65%)', borderRadius: '50%', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center', position: 'relative' }}>
          <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 9, letterSpacing: '0.32em', color: 'var(--red)', marginBottom: 16 }}>NEVER MISS A DROP</div>
          <h2 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: isMobile ? 'clamp(44px,12vw,62px)' : 'clamp(56px,6vw,88px)', color: 'white', lineHeight: 0.9, letterSpacing: '0.02em', marginBottom: 18 }}>
            BE FIRST.<br /><span style={{ color: 'var(--red)' }}>EVERY TIME.</span>
          </h2>
          <p style={{ fontFamily: "'Barlow',sans-serif", fontSize: isMobile ? 14 : 16, color: 'rgba(255,255,255,0.4)', lineHeight: 1.85, marginBottom: 36 }}>
            Join 47,000+ on the APEX drops list. One-time alerts. Zero spam. Every drop, before the world.
          </p>
          <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? 10 : 0, maxWidth: 480, margin: '0 auto' }}>
            <input type="email" placeholder="YOUR EMAIL ADDRESS"
              style={{ flex: 1, padding: '16px 20px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRight: isMobile ? '1px solid rgba(255,255,255,0.1)' : 'none', color: 'white', fontFamily: "'Barlow Condensed',sans-serif", fontSize: 12, letterSpacing: '0.08em', outline: 'none', transition: 'border-color 0.2s', borderRadius: isMobile ? 2 : 0 }}
              onFocus={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'}
              onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'} />
            <button style={{ padding: '16px 28px', background: 'var(--red)', border: 'none', color: 'white', fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 12, letterSpacing: '0.2em', cursor: 'pointer', transition: 'background 0.2s', whiteSpace: 'nowrap', borderRadius: isMobile ? 2 : 0 }}
              onMouseEnter={e => e.currentTarget.style.background = '#cc1a00'}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--red)'}>
              JOIN THE LIST →
            </button>
          </div>
        </div>
      </section>

      <style>{`
        @keyframes shimmer   { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        @keyframes pulseRing { 0%{transform:scale(1);opacity:0.8} 100%{transform:scale(2.4);opacity:0} }
      `}</style>
    </div>
  );
}