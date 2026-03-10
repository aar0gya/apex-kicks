// apex-kicks/src/components/ui/ProductCard.jsx
// Phase 4 additions:
//   - Shows SOLD OUT overlay when product has no stock
//   - Shows LOW STOCK badge when totalStock <= 5
//   - Disables "Add to Cart" for sold-out products
//   - All stock info comes from useInventory hook (live from DB)

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useBreakpoint from '../../hooks/useBreakPoint';
import { useWishlist } from '../../context/WishlistContext';
import { getShoeImage } from '../../data/shoeImages';
import useInventory from '../../hooks/useInventory';

function Heart({ filled, size = 15 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24"
            fill={filled ? 'var(--red)' : 'none'}
            stroke={filled ? 'var(--red)' : 'rgba(255,255,255,0.8)'}
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
    );
}

function ProductCard({ product, onAddToCart, delay = 0, inView = false }) {
    const [hovered, setHovered] = useState(false);
    const [imgLoaded, setImgLoaded] = useState(false);
    const { isMobile } = useBreakpoint();
    const { toggleWishlist, isWishlisted } = useWishlist();
    const navigate = useNavigate();
    const wishlisted = isWishlisted(product.id);
    const isSpecial = product.tag === 'LIMITED' || product.tag === 'EXCLUSIVE';
    const imgH = isMobile ? 220 : 280;
    const imgSrc = getShoeImage(product.id, 0);

    // ── Live inventory ────────────────────────────────────────
    const { product: inv } = useInventory(product.id);
    const isSoldOut = inv ? inv.soldOut : false;
    const isLowStock = inv ? inv.lowStock : false;   // totalStock <= 5
    const totalStock = inv ? inv.totalStock : null;

    return (
        <div
            className={`product-card reveal${inView ? ' revealed' : ''}`}
            style={{
                background: '#111', borderRadius: 4, overflow: 'hidden',
                transitionDelay: `${delay}ms`,
                border: '1px solid rgba(255,255,255,0.05)',
                cursor: 'pointer',
                transition: 'transform 0.35s cubic-bezier(0.23,1,0.32,1), box-shadow 0.35s, border-color 0.3s',
                transform: hovered && !isSoldOut ? 'translateY(-6px)' : 'none',
                boxShadow: hovered && !isSoldOut ? `0 24px 48px rgba(0,0,0,0.5), 0 0 0 1px ${product.accent}22` : 'none',
                opacity: isSoldOut ? 0.72 : 1,
            }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onClick={() => navigate(`/product/${product.id}`)}
        >
            {/* Image */}
            <div style={{
                height: imgH,
                background: `linear-gradient(135deg,${product.color}22,${product.accent}14)`,
                position: 'relative', overflow: 'hidden',
            }}>
                <div style={{
                    position: 'absolute', inset: 0,
                    background: `radial-gradient(circle at 50% 60%,${product.accent}28,transparent 70%)`,
                    opacity: hovered && !isSoldOut ? 1 : 0,
                    transition: 'opacity 0.4s', zIndex: 1,
                }} />

                {!imgLoaded && (
                    <div style={{
                        position: 'absolute', inset: 0,
                        background: 'linear-gradient(90deg,#1a1a1a 25%,#252525 50%,#1a1a1a 75%)',
                        backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite',
                    }} />
                )}

                <img
                    src={imgSrc}
                    alt={product.name}
                    onLoad={() => setImgLoaded(true)}
                    style={{
                        width: '100%', height: '100%',
                        objectFit: 'cover', objectPosition: 'center center',
                        transform: hovered && !isSoldOut ? 'scale(1.06)' : 'scale(1)',
                        opacity: imgLoaded ? (isSoldOut ? 0.5 : 1) : 0,
                        transition: 'opacity 0.4s ease, transform 0.5s cubic-bezier(0.23,1,0.32,1)',
                        display: 'block', position: 'relative', zIndex: 1,
                        filter: isSoldOut ? 'grayscale(60%)' : 'none',
                    }}
                />

                {/* Sold out overlay */}
                {isSoldOut && (
                    <div style={{
                        position: 'absolute', inset: 0, zIndex: 5,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(2px)',
                    }}>
                        <div style={{
                            padding: '8px 20px',
                            background: 'rgba(0,0,0,0.85)',
                            border: '1px solid rgba(255,255,255,0.18)',
                            borderRadius: 2,
                        }}>
                            <span style={{
                                fontFamily: "'Barlow Condensed',sans-serif",
                                fontWeight: 700, fontSize: 13, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.75)',
                            }}>SOLD OUT</span>
                        </div>
                    </div>
                )}

                {/* Tags row */}
                <div style={{ position: 'absolute', top: 12, left: 12, zIndex: 3, display: 'flex', flexDirection: 'column', gap: 5 }}>
                    <div style={{
                        background: isSpecial ? 'var(--red)' : 'rgba(0,0,0,0.75)',
                        padding: '4px 8px', backdropFilter: 'blur(6px)',
                        border: isSpecial ? 'none' : '1px solid rgba(255,255,255,0.12)',
                    }}>
                        <span className="tag-badge" style={{ color: 'white', fontSize: 8 }}>{product.tag}</span>
                    </div>

                    {/* Low stock badge */}
                    {isLowStock && !isSoldOut && (
                        <div style={{
                            background: 'rgba(255,184,0,0.15)',
                            border: '1px solid rgba(255,184,0,0.45)',
                            padding: '3px 8px',
                            backdropFilter: 'blur(6px)',
                        }}>
                            <span style={{
                                fontFamily: "'Barlow Condensed',sans-serif",
                                fontWeight: 700, fontSize: 8, letterSpacing: '0.16em',
                                color: '#FFB800',
                            }}>
                                {totalStock <= 3 ? `ONLY ${totalStock} LEFT` : 'LOW STOCK'}
                            </span>
                        </div>
                    )}
                </div>

                {/* Wishlist heart */}
                <button
                    onClick={e => { e.stopPropagation(); toggleWishlist(product); }}
                    style={{
                        position: 'absolute', top: 10, right: 10, zIndex: 4,
                        width: 32, height: 32, borderRadius: '50%',
                        background: wishlisted ? 'rgba(255,34,0,0.25)' : 'rgba(0,0,0,0.6)',
                        border: `1px solid ${wishlisted ? 'rgba(255,34,0,0.6)' : 'rgba(255,255,255,0.15)'}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 14, cursor: 'pointer',
                        opacity: hovered || wishlisted ? 1 : isMobile ? 1 : 0,
                        transition: 'all 0.2s', backdropFilter: 'blur(6px)',
                    }}>
                    <Heart filled={wishlisted} />
                </button>

                {/* Quick-add overlay — desktop only, hidden if sold out */}
                {!isMobile && !isSoldOut && (
                    <div style={{
                        position: 'absolute', inset: 0, zIndex: 3,
                        background: 'linear-gradient(to top, rgba(0,0,0,0.88) 0%, transparent 60%)',
                        display: 'flex', alignItems: 'flex-end', padding: 14,
                        opacity: hovered ? 1 : 0, transition: 'opacity 0.25s',
                    }}>
                        <button
                            className="btn-primary"
                            style={{ width: '100%', padding: '12px', fontSize: 12 }}
                            onClick={e => { e.stopPropagation(); onAddToCart(product); }}>
                            QUICK ADD +
                        </button>
                    </div>
                )}
            </div>

            {/* Info */}
            <div style={{ padding: isMobile ? '14px 14px 16px' : '18px 20px 22px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                    <div>
                        <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 9, letterSpacing: '0.15em', color: 'rgba(255,255,255,0.35)', marginBottom: 3 }}>
                            {product.brand}
                        </div>
                        <div className="display-heading" style={{ fontSize: isMobile ? 16 : 20, lineHeight: 1 }}>
                            {product.name}
                        </div>
                    </div>
                    <div className="display-heading" style={{ fontSize: isMobile ? 18 : 22, color: isSoldOut ? 'rgba(255,255,255,0.25)' : product.accent, flexShrink: 0 }}>
                        ${product.price}
                    </div>
                </div>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: isMobile ? 11 : 12, lineHeight: 1.6, marginTop: 6 }}>
                    {product.desc}
                </p>
                {isMobile && (
                    <button
                        className="btn-primary"
                        disabled={isSoldOut}
                        style={{ width: '100%', padding: '11px', fontSize: 11, marginTop: 12, opacity: isSoldOut ? 0.4 : 1, cursor: isSoldOut ? 'not-allowed' : 'pointer', background: isSoldOut ? 'rgba(255,255,255,0.08)' : undefined }}
                        onClick={e => { e.stopPropagation(); if (!isSoldOut) onAddToCart(product); }}>
                        {isSoldOut ? 'SOLD OUT' : 'ADD TO CART +'}
                    </button>
                )}
                <div style={{ display: 'flex', gap: 5, marginTop: isMobile ? 10 : 14, alignItems: 'center' }}>
                    {[product.accent, product.color, '#888'].map((c, i) => (
                        <div key={i} style={{
                            width: i === 0 ? 13 : 11, height: i === 0 ? 13 : 11,
                            borderRadius: '50%', background: c,
                            border: i === 0 ? '2px solid white' : '1px solid rgba(255,255,255,0.1)',
                        }} />
                    ))}
                    <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 9, color: 'rgba(255,255,255,0.25)', marginLeft: 4 }}>+3</span>
                </div>
            </div>

            <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
        </div>
    );
}

export default ProductCard;