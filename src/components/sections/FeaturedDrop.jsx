import { useState } from 'react';
import useInView from '../../hooks/useInView';
import { useCart } from '../../context/CartContext';
import useBreakpoint from '../../hooks/useBreakPoint';
import { SHOE_SETS } from '../../data/shoeImages';

const PRODUCT = {
  id: 0,
  name: 'APEX PHANTOM X2',
  brand: 'APEX',
  price: 249,
  tag: 'LIMITED EDITION',
  color: '#E8D5B7',
  accent: '#FF4500',
  desc: '',
};

const FEATURES = [
  'Carbon Fiber Plate',
  'ReactFoam+ Midsole',
  'Breathable Flyknit Upper',
  'Recycled Materials',
];

// 4 gallery angles for the featured drop
const GALLERY = SHOE_SETS[0].panels;   // [{label, url}, ...]
const ANGLE_LABELS = ['Side', 'Front', 'Heel', 'Top'];

function FeaturedDrop() {
  const [ref, inView]     = useInView();
  const { addToCart }     = useCart();
  const [added, setAdded] = useState(false);
  const [active, setActive] = useState(0);
  const [imgLoaded, setImgLoaded] = useState(false);
  const { isMobile, isTablet } = useBreakpoint();
  const px = isMobile ? 20 : isTablet ? 32 : 40;
  const py = isMobile ? 60 : 120;

  const handleAdd = () => {
    addToCart(PRODUCT);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  // Switch angle — reset loaded state so fade-in fires
  const handleAngle = (i) => {
    if (i === active) return;
    setImgLoaded(false);
    setActive(i);
  };

  return (
    <section ref={ref} style={{ background: '#0A0A0A', padding: `${py}px ${px}px` }}>
      <div style={{ maxWidth: 1400, margin: '0 auto' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: isTablet ? '1fr' : '1fr 1fr',
          gap: isTablet ? 40 : 80,
          alignItems: 'center',
        }}>

          {/* ── Left: image gallery ── */}
          <div className={`reveal${inView ? ' revealed' : ''}`}>
            {/* Main image */}
            <div style={{
              background: 'linear-gradient(135deg,#1A1A1A,#111)',
              borderRadius: 4,
              height: isMobile ? 280 : isTablet ? 400 : 520,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              position: 'relative', overflow: 'hidden',
            }}>
              <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 40% 60%,rgba(255,70,0,0.18),transparent 60%)' }} />

              {/* Skeleton */}
              {!imgLoaded && (
                <div style={{
                  position: 'absolute', inset: 0,
                  background: 'linear-gradient(90deg,#1a1a1a 25%,#222 50%,#1a1a1a 75%)',
                  backgroundSize: '200% 100%',
                  animation: 'shimmer 1.4s infinite',
                }} />
              )}

              <img
                key={active}
                src={GALLERY[active].url}
                alt={`APEX PHANTOM X2 — ${ANGLE_LABELS[active]}`}
                onLoad={() => setImgLoaded(true)}
                style={{
                  width: '100%', height: '100%',
                  objectFit: 'cover',
                  opacity: imgLoaded ? 1 : 0,
                  transition: 'opacity 0.4s ease',
                  position: 'relative', zIndex: 1,
                }}
              />

              <div style={{ position: 'absolute', top: 16, left: 16, background: 'var(--red)', padding: '5px 12px', zIndex: 2 }}>
                <span className="tag-badge" style={{ color: 'white' }}>LIMITED EDITION</span>
              </div>

              {/* Angle label */}
              <div style={{ position: 'absolute', bottom: 16, left: 16, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)', padding: '5px 12px', zIndex: 2 }}>
                <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 9, letterSpacing: '0.15em', color: 'rgba(255,255,255,0.7)' }}>
                  {ANGLE_LABELS[active].toUpperCase()} VIEW
                </span>
              </div>
            </div>

            {/* Thumbnail strip */}
            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
              {GALLERY.map((panel, i) => (
                <button
                  key={i}
                  onClick={() => handleAngle(i)}
                  style={{
                    flex: 1, height: isMobile ? 60 : 80,
                    padding: 0, border: `2px solid ${active === i ? 'var(--red)' : 'rgba(255,255,255,0.08)'}`,
                    borderRadius: 3, overflow: 'hidden',
                    cursor: 'pointer', background: '#1a1a1a',
                    transition: 'border-color 0.2s',
                  }}>
                  <img
                    src={panel.url}
                    alt={panel.label}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                </button>
              ))}
            </div>

            {/* Angle labels under thumbnails */}
            <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
              {ANGLE_LABELS.map((label, i) => (
                <div key={label} style={{ flex: 1, textAlign: 'center', fontFamily: "'Barlow Condensed',sans-serif", fontSize: 9, letterSpacing: '0.1em', color: active === i ? 'var(--red)' : 'rgba(255,255,255,0.3)' }}>
                  {label.toUpperCase()}
                </div>
              ))}
            </div>
          </div>

          {/* ── Right: content ── */}
          <div className={`reveal${inView ? ' revealed' : ''}`} style={{ transitionDelay: isTablet ? '0s' : '0.15s' }}>
            <span className="section-label">FEATURED DROP</span>
            <h2 className="display-heading" style={{ fontSize: isMobile ? 'clamp(44px,11vw,64px)' : 'clamp(52px,6vw,88px)', marginTop: 14, marginBottom: 0 }}>APEX</h2>
            <h2 className="display-heading" style={{ fontSize: isMobile ? 'clamp(44px,11vw,64px)' : 'clamp(52px,6vw,88px)', color: 'var(--red)', marginBottom: 20 }}>PHANTOM X2</h2>

            <p style={{ color: 'rgba(255,255,255,0.5)', lineHeight: 1.9, fontSize: isMobile ? 14 : 15, maxWidth: 400, marginBottom: 28 }}>
              The most anticipated drop of 2025. A complete reimagination of our legendary Phantom silhouette — now with next-generation reactive foam and a carbon plate engineered for maximum energy return.
            </p>

            {FEATURES.map(f => (
              <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, color: 'rgba(255,255,255,0.7)', fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 600, fontSize: 13, letterSpacing: '0.05em' }}>
                <span style={{ color: 'var(--red)', fontSize: 9 }}>◆</span>{f}
              </div>
            ))}

            <div style={{ marginTop: isMobile ? 28 : 44, display: 'flex', alignItems: 'center', gap: 24, flexDirection: isMobile ? 'column' : 'row' }}>
              <div style={{ flexShrink: 0 }}>
                <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 11, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>RETAIL PRICE</div>
                <div className="display-heading" style={{ fontSize: isMobile ? 40 : 48 }}>$249</div>
              </div>
              <button
                className="btn-primary"
                onClick={handleAdd}
                style={{ padding: '16px 32px', fontSize: 14, flex: 1, width: isMobile ? '100%' : 'auto', background: added ? '#00C851' : 'var(--red)', transition: 'background 0.3s' }}>
                {added ? '✓ ADDED TO CART' : 'ADD TO CART'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </section>
  );
}

export default FeaturedDrop;