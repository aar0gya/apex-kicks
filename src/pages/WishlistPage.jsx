// apex-kicks/src/pages/WishlistPage.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getShoeImage } from '../data/shoeImages';
import useBreakpoint from '../hooks/useBreakPoint';

// ── Skeleton card ─────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div style={{ background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, overflow: 'hidden' }}>
      <div style={{ height: 220, background: 'rgba(255,255,255,0.04)', animation: 'wlShimmer 1.4s infinite' }} />
      <div style={{ padding: '14px 16px 18px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ height: 10, width: '40%', background: 'rgba(255,255,255,0.06)', borderRadius: 3, animation: 'wlShimmer 1.4s infinite' }} />
        <div style={{ height: 16, width: '75%', background: 'rgba(255,255,255,0.06)', borderRadius: 3, animation: 'wlShimmer 1.4s infinite' }} />
        <div style={{ height: 22, width: '30%', background: 'rgba(255,255,255,0.06)', borderRadius: 3, animation: 'wlShimmer 1.4s infinite' }} />
        <div style={{ height: 36, background: 'rgba(255,255,255,0.04)', borderRadius: 4, marginTop: 4, animation: 'wlShimmer 1.4s infinite' }} />
      </div>
    </div>
  );
}

// ── Product card ──────────────────────────────────────────────
function WishlistCard({ product, index, onRemove, onMoveToCart, onView }) {
  const [removing, setRemoving] = useState(false);

  const handleRemove = async () => {
    setRemoving(true);
    await onRemove(product.id);
  };

  return (
    <div style={{
      background: '#0f0f0f',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: 8,
      overflow: 'hidden',
      opacity: removing ? 0 : 1,
      transform: removing ? 'scale(0.95)' : 'translateY(0)',
      transition: 'opacity 0.3s, transform 0.3s, border-color 0.2s',
      animation: `wlFadeUp 0.4s ${index * 0.06}s both`,
    }}
      onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.14)'}
      onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'}>

      {/* Image */}
      <div style={{ position: 'relative', height: 220, overflow: 'hidden', background: `linear-gradient(135deg, ${product.color || '#111'}22, ${product.accent || '#333'}18)`, cursor: 'pointer' }}
        onClick={() => onView(product.id)}>
        <img
          src={getShoeImage(product.id, 0)}
          alt={product.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s cubic-bezier(0.23,1,0.32,1)' }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.07)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        />

        {/* Tag badge */}
        {product.tag && (
          <div style={{ position: 'absolute', top: 10, left: 10, background: 'var(--red)', padding: '3px 9px', borderRadius: 2 }}>
            <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 9, letterSpacing: '0.18em', color: 'white' }}>{product.tag}</span>
          </div>
        )}

        {/* Remove button */}
        <button
          onClick={e => { e.stopPropagation(); handleRemove(); }}
          title="Remove from wishlist"
          style={{
            position: 'absolute', top: 10, right: 10,
            width: 30, height: 30, borderRadius: '50%',
            background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)',
            border: '1px solid rgba(255,255,255,0.15)',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#ff4444', transition: 'all 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,34,0,0.3)'; e.currentTarget.style.borderColor = 'rgba(255,34,0,0.5)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.7)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {/* Info */}
      <div style={{ padding: '14px 16px 18px' }}>
        <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 9, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.3)', marginBottom: 4 }}>{product.brand} · {product.category}</div>
        <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 17, color: 'white', letterSpacing: '0.04em', lineHeight: 1.1, marginBottom: 6 }}>{product.name}</div>
        <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 24, color: product.accent || 'var(--red)', marginBottom: 14 }}>${product.price}</div>

        <div style={{ display: 'flex', gap: 6 }}>
          <button
            onClick={() => onMoveToCart(product)}
            style={{ flex: 1, padding: '10px 0', fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 11, letterSpacing: '0.12em', background: 'var(--red)', border: 'none', color: 'white', cursor: 'pointer', borderRadius: 4, transition: 'background 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.background = '#cc1a00'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--red)'}>
            ADD TO CART
          </button>
          <button
            onClick={() => onView(product.id)}
            style={{ padding: '10px 14px', fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 11, letterSpacing: '0.1em', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.45)', cursor: 'pointer', borderRadius: 4, transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; e.currentTarget.style.color = 'white'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'rgba(255,255,255,0.45)'; }}>
            VIEW
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  WISHLIST PAGE
// ═══════════════════════════════════════════════════════════════
export default function WishlistPage() {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const addToast = useToast();
  const { isMobile, isTablet } = useBreakpoint();
  const px = isMobile ? 16 : isTablet ? 32 : 48;

  const {
    wishlistItems,
    wishlistLoading,
    removeFromWishlist,
    toggleWishlist,
  } = useWishlist();
  const { addToCart } = useCart();

  const [sortBy, setSortBy] = useState('added');  // 'added' | 'price_asc' | 'price_desc' | 'name'

  const handleMoveToCart = (product) => {
    addToCart({ ...product, size: null });
    removeFromWishlist(product.id);
    addToast('success', product.name, 'Moved to cart — select your size!');
  };

  const handleClearAll = async () => {
    if (wishlistItems.length === 0) return;
    // Remove all one by one so the context handles backend sync
    for (const item of wishlistItems) {
      await removeFromWishlist(item.id);
    }
  };

  // Sort items
  const sorted = [...wishlistItems].sort((a, b) => {
    if (sortBy === 'price_asc') return a.price - b.price;
    if (sortBy === 'price_desc') return b.price - a.price;
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    // 'added' — newest first (default order from backend)
    return 0;
  });

  const cols = isMobile ? 2 : isTablet ? 3 : 4;

  return (
    <div style={{ paddingTop: 64, minHeight: '100vh', background: '#080808' }}>

      {/* ── Header ─────────────────────────────────────────── */}
      <div style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'linear-gradient(180deg,#0d0d0d,#080808)' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: `${isMobile ? 36 : 52}px ${px}px ${isMobile ? 28 : 36}px` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 10, letterSpacing: '0.28em', color: 'var(--red)', marginBottom: 8 }}>
                {isLoggedIn ? 'YOUR COLLECTION' : 'GUEST WISHLIST'}
              </div>
              <h1 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: isMobile ? 40 : 60, letterSpacing: '0.03em', color: 'white', lineHeight: 1, margin: 0 }}>
                WISHLIST
              </h1>
              <div style={{ fontFamily: "'Barlow',sans-serif", fontSize: 14, color: 'rgba(255,255,255,0.35)', marginTop: 8 }}>
                {wishlistLoading
                  ? 'Loading your saved items...'
                  : wishlistItems.length > 0
                    ? `${wishlistItems.length} item${wishlistItems.length !== 1 ? 's' : ''} saved${isLoggedIn ? ' · synced to your account' : ' · sign in to save permanently'}`
                    : 'Nothing saved yet'
                }
              </div>
            </div>

            {/* Controls */}
            {wishlistItems.length > 0 && !wishlistLoading && (
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                {/* Sort */}
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value)}
                  style={{ padding: '9px 14px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 4, color: 'rgba(255,255,255,0.6)', fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 10, letterSpacing: '0.12em', cursor: 'pointer', outline: 'none' }}>
                  <option value="added" style={{ background: '#111' }}>SORT: RECENTLY ADDED</option>
                  <option value="price_asc" style={{ background: '#111' }}>SORT: PRICE LOW–HIGH</option>
                  <option value="price_desc" style={{ background: '#111' }}>SORT: PRICE HIGH–LOW</option>
                  <option value="name" style={{ background: '#111' }}>SORT: NAME A–Z</option>
                </select>

                {/* Clear all */}
                <button
                  onClick={handleClearAll}
                  style={{ padding: '9px 18px', fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 10, letterSpacing: '0.14em', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.35)', cursor: 'pointer', borderRadius: 4, transition: 'all 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,34,0,0.4)'; e.currentTarget.style.color = 'rgba(255,34,0,0.7)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'rgba(255,255,255,0.35)'; }}>
                  CLEAR ALL
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Guest sign-in nudge ────────────────────────────── */}
      {!isLoggedIn && wishlistItems.length > 0 && (
        <div style={{ maxWidth: 1400, margin: '20px auto 0', padding: `0 ${px}px` }}>
          <div style={{ display: 'flex', gap: 14, alignItems: 'center', padding: '14px 20px', background: 'rgba(255,184,0,0.06)', border: '1px solid rgba(255,184,0,0.22)', borderRadius: 8, flexWrap: 'wrap' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FFB800" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
            <p style={{ fontFamily: "'Barlow',sans-serif", fontSize: 14, color: 'rgba(255,255,255,0.55)', margin: 0, flex: 1 }}>
              Your wishlist is saved in this browser only.{' '}
              <strong style={{ color: 'rgba(255,255,255,0.8)' }}>Sign in to save it permanently</strong> and access it from any device.
            </p>
            <button
              onClick={() => navigate('/sign-in')}
              style={{ padding: '9px 22px', fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 11, letterSpacing: '0.14em', background: '#FFB800', border: 'none', color: '#000', cursor: 'pointer', borderRadius: 4, flexShrink: 0 }}>
              SIGN IN →
            </button>
          </div>
        </div>
      )}

      {/* ── Content ────────────────────────────────────────── */}
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: `28px ${px}px 80px` }}>

        {/* Loading skeletons */}
        {wishlistLoading && (
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: isMobile ? 10 : 18 }}>
            {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* Grid */}
        {!wishlistLoading && sorted.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: isMobile ? 10 : 18 }}>
            {sorted.map((product, i) => (
              <WishlistCard
                key={product.id}
                product={product}
                index={i}
                onRemove={removeFromWishlist}
                onMoveToCart={handleMoveToCart}
                onView={(id) => navigate(`/product/${id}`)}
              />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!wishlistLoading && sorted.length === 0 && (
          <div style={{ textAlign: 'center', padding: '100px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
            {/* Heart icon */}
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,34,0,0.07)', border: '1px solid rgba(255,34,0,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="rgba(255,34,0,0.4)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </div>
            <div>
              <h2 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: isMobile ? 32 : 44, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.04em', lineHeight: 1, margin: '0 0 10px' }}>NOTHING SAVED YET</h2>
              <p style={{ fontFamily: "'Barlow',sans-serif", fontSize: 15, color: 'rgba(255,255,255,0.28)', maxWidth: 340, margin: '0 auto', lineHeight: 1.75 }}>
                Tap the heart icon on any sneaker to save it here. Your wishlist{isLoggedIn ? ' is synced to your account' : ' is saved in this browser'}.
              </p>
            </div>
            <button
              className="btn-primary"
              style={{ padding: '14px 40px', fontSize: 14, marginTop: 8 }}
              onClick={() => navigate('/collection')}>
              EXPLORE COLLECTION →
            </button>
          </div>
        )}

        {/* Bottom CTA when items exist */}
        {!wishlistLoading && sorted.length > 0 && (
          <div style={{ marginTop: 48, paddingTop: 32, borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'center', gap: 14, flexWrap: 'wrap' }}>
            <button
              className="btn-primary"
              style={{ padding: '14px 40px', fontSize: 14 }}
              onClick={() => navigate('/collection')}>
              CONTINUE SHOPPING →
            </button>
            {!isLoggedIn && (
              <button
                style={{ padding: '14px 40px', fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 14, letterSpacing: '0.1em', background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', borderRadius: 2, transition: 'all 0.2s' }}
                onClick={() => navigate('/sign-in')}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; e.currentTarget.style.color = 'white'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; }}>
                SIGN IN TO SAVE →
              </button>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes wlFadeUp  { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:none; } }
        @keyframes wlShimmer { 0%{background-position:-200% center} 100%{background-position:200% center} }
      `}</style>
    </div>
  );
}