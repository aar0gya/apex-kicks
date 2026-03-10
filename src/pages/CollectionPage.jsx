// apex-kicks/src/pages/CollectionPage.jsx
import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import useInView from '../hooks/useInView';
import useBreakpoint from '../hooks/useBreakPoint';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { PRODUCTS, CATEGORIES } from '../data/products';
import { getShoeImage } from '../data/shoeImages';

// ─────────────────────────────────────────────────────────────
//  Data
// ─────────────────────────────────────────────────────────────
const SORT_OPTIONS = [
    { id: 'featured', label: 'Featured' },
    { id: 'price-asc', label: 'Price: Low→High' },
    { id: 'price-desc', label: 'Price: High→Low' },
    { id: 'name', label: 'Name A→Z' },
];

const PRICE_RANGES = [
    { id: 'all', label: 'All prices', min: 0, max: Infinity },
    { id: 'u200', label: 'Under $200', min: 0, max: 200 },
    { id: '200-300', label: '$200–$300', min: 200, max: 300 },
    { id: '300plus', label: '$300+', min: 300, max: Infinity },
];

// ─────────────────────────────────────────────────────────────
//  SVG icons
// ─────────────────────────────────────────────────────────────
function Heart({ filled }) {
    return (
        <svg width="14" height="14" viewBox="0 0 24 24"
            fill={filled ? 'var(--red)' : 'none'}
            stroke={filled ? 'var(--red)' : 'rgba(255,255,255,0.9)'}
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
    );
}
const GridIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>;
const ListIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></svg>;
const SearchIcon = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>;
const CloseIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>;

// ─────────────────────────────────────────────────────────────
//  Quick-View Modal
// ─────────────────────────────────────────────────────────────
function QuickViewModal({ product, onClose }) {
    const [visible, setVisible] = useState(false);
    const [selectedSize, setSelectedSize] = useState(null);
    const [activeImg, setActiveImg] = useState(0);
    const { addToCart } = useCart();
    const { toggleWishlist, isWishlisted } = useWishlist();
    const navigate = useNavigate();
    const wishlisted = isWishlisted(product.id);
    const SIZES = [6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10, 10.5, 11, 12, 13];
    const imgs = [0, 1, 2, 3].map(i => getShoeImage(product.id, i));

    useEffect(() => {
        requestAnimationFrame(() => setVisible(true));
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = ''; };
    }, []);

    useEffect(() => {
        const fn = e => { if (e.key === 'Escape') handleClose(); };
        window.addEventListener('keydown', fn);
        return () => window.removeEventListener('keydown', fn);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    function handleClose() {
        setVisible(false);
        setTimeout(onClose, 300);
    }

    function handleAdd() {
        addToCart({ ...product, size: selectedSize || 9 });
    }

    return (
        <>
            {/* Backdrop */}
            <div onClick={handleClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.82)', backdropFilter: 'blur(8px)', zIndex: 1200, opacity: visible ? 1 : 0, transition: 'opacity 0.3s' }} />

            {/* Panel */}
            <div style={{ position: 'fixed', top: '50%', left: '50%', transform: visible ? 'translate(-50%,-50%) scale(1)' : 'translate(-50%,-50%) scale(0.94)', zIndex: 1201, width: 'min(92vw, 900px)', background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 4, overflow: 'hidden', opacity: visible ? 1 : 0, transition: 'all 0.32s cubic-bezier(0.23,1,0.32,1)', display: 'grid', gridTemplateColumns: '1fr 1fr', maxHeight: '90vh' }}>

                {/* Images */}
                <div style={{ background: `linear-gradient(135deg,${product.color}22,${product.accent}14)`, position: 'relative' }}>
                    <img src={imgs[activeImg]} alt={product.name} style={{ width: '100%', height: 380, objectFit: 'cover', display: 'block' }} />
                    {/* Thumbnails */}
                    <div style={{ display: 'flex', gap: 6, padding: '10px 12px', background: 'rgba(0,0,0,0.4)' }}>
                        {imgs.map((src, i) => (
                            <button key={i} onClick={() => setActiveImg(i)}
                                style={{ width: 52, height: 38, border: `2px solid ${activeImg === i ? product.accent : 'rgba(255,255,255,0.12)'}`, borderRadius: 2, overflow: 'hidden', padding: 0, cursor: 'pointer', transition: 'border-color 0.2s', background: 'transparent', flexShrink: 0 }}>
                                <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                            </button>
                        ))}
                    </div>
                    {/* Close */}
                    <button onClick={handleClose} style={{ position: 'absolute', top: 12, right: 12, width: 32, height: 32, borderRadius: '50%', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,34,0,0.3)'; e.currentTarget.style.color = 'white'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.7)'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; }}>
                        <CloseIcon />
                    </button>
                </div>

                {/* Info */}
                <div style={{ padding: '32px 28px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                            <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 9, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.35)' }}>{product.brand} · {product.category}</span>
                            <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 9, letterSpacing: '0.14em', padding: '3px 8px', background: 'var(--red)', color: 'white' }}>{product.tag}</span>
                        </div>
                        <h2 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 36, color: 'white', letterSpacing: '0.04em', lineHeight: 1, marginBottom: 8 }}>{product.name}</h2>
                        <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 42, color: product.accent, lineHeight: 1 }}>${product.price}</div>
                    </div>

                    <p style={{ fontFamily: "'Barlow',sans-serif", fontSize: 14, color: 'rgba(255,255,255,0.5)', lineHeight: 1.8 }}>{product.desc}</p>

                    {/* Size picker */}
                    <div>
                        <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 9, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.4)', marginBottom: 10 }}>SELECT SIZE (US)</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                            {SIZES.map(s => (
                                <button key={s} onClick={() => setSelectedSize(s)}
                                    style={{ width: 44, height: 36, background: selectedSize === s ? product.accent : 'rgba(255,255,255,0.05)', border: `1px solid ${selectedSize === s ? product.accent : 'rgba(255,255,255,0.1)'}`, color: selectedSize === s ? '#000' : 'rgba(255,255,255,0.65)', fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 11, cursor: 'pointer', borderRadius: 2, transition: 'all 0.18s' }}
                                    onMouseEnter={e => { if (selectedSize !== s) { e.currentTarget.style.borderColor = product.accent; e.currentTarget.style.color = 'white'; } }}
                                    onMouseLeave={e => { if (selectedSize !== s) { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'rgba(255,255,255,0.65)'; } }}>
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: 10, marginTop: 'auto' }}>
                        <button onClick={handleAdd}
                            style={{ flex: 1, padding: '14px 0', background: product.accent, border: 'none', color: '#000', fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 12, letterSpacing: '0.18em', cursor: 'pointer', borderRadius: 2, transition: 'opacity 0.2s' }}
                            onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                            onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                            ADD TO CART
                        </button>
                        <button onClick={() => toggleWishlist(product)}
                            style={{ width: 48, background: wishlisted ? 'rgba(255,34,0,0.15)' : 'rgba(255,255,255,0.05)', border: `1px solid ${wishlisted ? 'rgba(255,34,0,0.5)' : 'rgba(255,255,255,0.12)'}`, borderRadius: 2, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
                            <Heart filled={wishlisted} />
                        </button>
                    </div>

                    <button onClick={() => { handleClose(); navigate(`/product/${product.id}`); }}
                        style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.45)', fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 10, letterSpacing: '0.18em', padding: '12px 0', cursor: 'pointer', borderRadius: 2, transition: 'all 0.2s' }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; e.currentTarget.style.color = 'white'; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'rgba(255,255,255,0.45)'; }}>
                        VIEW FULL DETAILS →
                    </button>
                </div>
            </div>
        </>
    );
}

// ─────────────────────────────────────────────────────────────
//  Grid Card
// ─────────────────────────────────────────────────────────────
function GridCard({ product, inView, delay, onQuickView }) {
    const [hovered, setHovered] = useState(false);
    const [imgLoaded, setImgLoaded] = useState(false);
    const { addToCart } = useCart();
    const { toggleWishlist, isWishlisted } = useWishlist();
    const navigate = useNavigate();
    const wishlisted = isWishlisted(product.id);
    const { isMobile } = useBreakpoint();
    const imgSrc = getShoeImage(product.id, 0);
    const isSpecial = product.tag === 'LIMITED' || product.tag === 'EXCLUSIVE';

    return (
        <div className={`reveal${inView ? ' revealed' : ''}`}
            style={{ transitionDelay: `${delay}ms`, background: '#111', border: `1px solid ${hovered ? product.accent + '44' : 'rgba(255,255,255,0.05)'}`, borderRadius: 3, overflow: 'hidden', cursor: 'pointer', transition: 'border-color 0.28s, transform 0.38s cubic-bezier(0.23,1,0.32,1), box-shadow 0.38s', transform: hovered ? 'translateY(-7px)' : 'none', boxShadow: hovered ? `0 28px 56px rgba(0,0,0,0.55), 0 0 0 1px ${product.accent}18` : 'none' }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}>

            {/* Image */}
            <div style={{ height: isMobile ? 210 : 270, background: `linear-gradient(135deg,${product.color}22,${product.accent}14)`, position: 'relative', overflow: 'hidden' }}
                onClick={() => navigate(`/product/${product.id}`)}>
                {!imgLoaded && <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg,#1a1a1a 25%,#222 50%,#1a1a1a 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite' }} />}
                <img src={imgSrc} alt={product.name} onLoad={() => setImgLoaded(true)}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: imgLoaded ? 1 : 0, transition: 'opacity 0.4s, transform 0.55s cubic-bezier(0.23,1,0.32,1)', transform: hovered ? 'scale(1.08)' : 'scale(1)', display: 'block' }} />

                {/* Gradient overlay */}
                <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 55%)`, opacity: hovered ? 1 : 0, transition: 'opacity 0.3s' }} />
                {/* Accent glow */}
                <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(circle at 50% 65%, ${product.accent}28, transparent 65%)`, opacity: hovered ? 1 : 0, transition: 'opacity 0.4s' }} />

                {/* Tag */}
                <div style={{ position: 'absolute', top: 12, left: 12, background: isSpecial ? 'var(--red)' : 'rgba(0,0,0,0.72)', backdropFilter: 'blur(6px)', padding: '4px 9px', border: isSpecial ? 'none' : '1px solid rgba(255,255,255,0.15)' }}>
                    <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 8, letterSpacing: '0.16em', color: 'white' }}>{product.tag}</span>
                </div>

                {/* Wishlist */}
                <button onClick={e => { e.stopPropagation(); toggleWishlist(product); }}
                    style={{ position: 'absolute', top: 10, right: 10, width: 32, height: 32, borderRadius: '50%', background: wishlisted ? 'rgba(255,34,0,0.25)' : 'rgba(0,0,0,0.65)', border: `1px solid ${wishlisted ? 'rgba(255,34,0,0.6)' : 'rgba(255,255,255,0.15)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', opacity: hovered || wishlisted || isMobile ? 1 : 0, transition: 'all 0.2s', backdropFilter: 'blur(6px)' }}>
                    <Heart filled={wishlisted} />
                </button>

                {/* Quick view + cart overlay */}
                {!isMobile && (
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '12px', display: 'flex', gap: 8, opacity: hovered ? 1 : 0, transform: hovered ? 'translateY(0)' : 'translateY(8px)', transition: 'opacity 0.25s, transform 0.25s cubic-bezier(0.23,1,0.32,1)' }}>
                        <button onClick={e => { e.stopPropagation(); onQuickView(product); }}
                            style={{ flex: 1, padding: '10px 0', background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 9, letterSpacing: '0.18em', cursor: 'pointer', borderRadius: 2, transition: 'background 0.2s' }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.22)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}>
                            QUICK VIEW
                        </button>
                        <button onClick={e => { e.stopPropagation(); addToCart({ ...product, size: 9 }); }}
                            style={{ flex: 1, padding: '10px 0', background: product.accent, border: 'none', color: '#000', fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 9, letterSpacing: '0.18em', cursor: 'pointer', borderRadius: 2, transition: 'opacity 0.2s' }}
                            onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                            onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                            QUICK ADD
                        </button>
                    </div>
                )}
            </div>

            {/* Info */}
            <div style={{ padding: isMobile ? '14px 14px 16px' : '16px 18px 20px' }}
                onClick={() => navigate(`/product/${product.id}`)}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 5 }}>
                    <div>
                        <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 9, letterSpacing: '0.16em', color: 'rgba(255,255,255,0.3)', marginBottom: 3 }}>{product.brand} · {product.category}</div>
                        <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: isMobile ? 17 : 21, color: 'white', letterSpacing: '0.04em', lineHeight: 1 }}>{product.name}</div>
                    </div>
                    <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: isMobile ? 20 : 26, color: product.accent, flexShrink: 0, lineHeight: 1 }}>${product.price}</div>
                </div>
                <p style={{ fontFamily: "'Barlow',sans-serif", fontSize: isMobile ? 11 : 12, color: 'rgba(255,255,255,0.38)', lineHeight: 1.65, marginTop: 6 }}>{product.desc}</p>

                {/* Color dots */}
                <div style={{ display: 'flex', gap: 5, marginTop: 12, alignItems: 'center' }}>
                    {[product.accent, product.color, '#888'].map((c, i) => (
                        <div key={i} style={{ width: i === 0 ? 12 : 10, height: i === 0 ? 12 : 10, borderRadius: '50%', background: c, border: i === 0 ? '2px solid rgba(255,255,255,0.8)' : '1px solid rgba(255,255,255,0.1)' }} />
                    ))}
                    <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 9, color: 'rgba(255,255,255,0.22)', marginLeft: 3 }}>+3</span>
                </div>

                {isMobile && (
                    <button onClick={e => { e.stopPropagation(); addToCart({ ...product, size: 9 }); }}
                        style={{ width: '100%', marginTop: 12, padding: '11px 0', background: product.accent, border: 'none', color: '#000', fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 10, letterSpacing: '0.14em', cursor: 'pointer', borderRadius: 2 }}>
                        ADD TO CART +
                    </button>
                )}
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────
//  List Row
// ─────────────────────────────────────────────────────────────
function ListRow({ product, inView, delay, onQuickView }) {
    const [hovered, setHovered] = useState(false);
    const { addToCart } = useCart();
    const { toggleWishlist, isWishlisted } = useWishlist();
    const navigate = useNavigate();
    const wishlisted = isWishlisted(product.id);
    const imgSrc = getShoeImage(product.id, 0);

    return (
        <div className={`reveal${inView ? ' revealed' : ''}`}
            style={{ transitionDelay: `${delay}ms`, display: 'flex', gap: 20, alignItems: 'center', background: '#111', border: `1px solid ${hovered ? product.accent + '44' : 'rgba(255,255,255,0.05)'}`, borderRadius: 3, overflow: 'hidden', cursor: 'pointer', transition: 'border-color 0.25s, background 0.25s', padding: 0 }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}>

            {/* Image */}
            <div style={{ width: 120, height: 90, flexShrink: 0, background: `linear-gradient(135deg,${product.color}22,${product.accent}14)`, overflow: 'hidden' }}
                onClick={() => navigate(`/product/${product.id}`)}>
                <img src={imgSrc} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s cubic-bezier(0.23,1,0.32,1)', transform: hovered ? 'scale(1.1)' : 'scale(1)', display: 'block' }} />
            </div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: 0, padding: '0 4px' }} onClick={() => navigate(`/product/${product.id}`)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 3 }}>
                    <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 8, letterSpacing: '0.16em', padding: '2px 7px', background: product.tag === 'LIMITED' || product.tag === 'EXCLUSIVE' ? 'var(--red)' : 'rgba(255,255,255,0.08)', color: 'white' }}>{product.tag}</span>
                    <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 9, letterSpacing: '0.14em', color: 'rgba(255,255,255,0.3)' }}>{product.category}</span>
                </div>
                <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 20, color: 'white', letterSpacing: '0.04em', lineHeight: 1, marginBottom: 4 }}>{product.name}</div>
                <p style={{ fontFamily: "'Barlow',sans-serif", fontSize: 12, color: 'rgba(255,255,255,0.38)', lineHeight: 1.6, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '80%' }}>{product.desc}</p>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0 20px', flexShrink: 0 }}>
                <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 28, color: product.accent }}>${product.price}</div>
                <div style={{ display: 'flex', gap: 8, opacity: hovered ? 1 : 0, transform: hovered ? 'translateX(0)' : 'translateX(8px)', transition: 'opacity 0.2s, transform 0.2s' }}>
                    <button onClick={e => { e.stopPropagation(); onQuickView(product); }}
                        style={{ padding: '8px 14px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.7)', fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 9, letterSpacing: '0.14em', cursor: 'pointer', borderRadius: 2, transition: 'background 0.2s, color 0.2s', whiteSpace: 'nowrap' }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.14)'; e.currentTarget.style.color = 'white'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; }}>
                        QUICK VIEW
                    </button>
                    <button onClick={e => { e.stopPropagation(); addToCart({ ...product, size: 9 }); }}
                        style={{ padding: '8px 16px', background: product.accent, border: 'none', color: '#000', fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 9, letterSpacing: '0.14em', cursor: 'pointer', borderRadius: 2, transition: 'opacity 0.2s', whiteSpace: 'nowrap' }}
                        onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                        onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                        ADD TO CART
                    </button>
                    <button onClick={e => { e.stopPropagation(); toggleWishlist(product); }}
                        style={{ width: 34, height: 34, borderRadius: '50%', background: wishlisted ? 'rgba(255,34,0,0.2)' : 'rgba(255,255,255,0.06)', border: `1px solid ${wishlisted ? 'rgba(255,34,0,0.5)' : 'rgba(255,255,255,0.12)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }}>
                        <Heart filled={wishlisted} />
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────
//  Main Page
// ─────────────────────────────────────────────────────────────
export default function CollectionPage() {
    const [heroRef, heroInView] = useInView(0.1);
    const [gridRef, gridInView] = useInView(0.04);
    const [activeCategory, setActiveCategory] = useState('ALL');
    const [activeSort, setActiveSort] = useState('featured');
    const [activePriceRange, setActivePriceRange] = useState('all');
    const [viewMode, setViewMode] = useState('grid'); // grid | list
    const [searchQuery, setSearchQuery] = useState('');
    const [quickViewProduct, setQuickViewProduct] = useState(null);
    const searchRef = useRef(null);
    const { isMobile, isTablet } = useBreakpoint();
    const px = isMobile ? 20 : isTablet ? 32 : 56;
    const cols = isMobile ? 1 : isTablet ? 2 : viewMode === 'grid' ? 3 : 1;

    // Filter + sort
    const filtered = useMemo(() => {
        const prange = PRICE_RANGES.find(p => p.id === activePriceRange) || PRICE_RANGES[0];
        let list = PRODUCTS
            .filter(p => activeCategory === 'ALL' || p.category === activeCategory)
            .filter(p => p.price >= prange.min && p.price < prange.max)
            .filter(p => !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.desc.toLowerCase().includes(searchQuery.toLowerCase()));
        switch (activeSort) {
            case 'price-asc': return [...list].sort((a, b) => a.price - b.price);
            case 'price-desc': return [...list].sort((a, b) => b.price - a.price);
            case 'name': return [...list].sort((a, b) => a.name.localeCompare(b.name));
            default: return list;
        }
    }, [activeCategory, activeSort, activePriceRange, searchQuery]);

    // Keyboard shortcut: / to focus search
    useEffect(() => {
        const fn = e => { if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes(e.target.tagName)) { e.preventDefault(); searchRef.current?.focus(); } };
        window.addEventListener('keydown', fn);
        return () => window.removeEventListener('keydown', fn);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const gridCols = !isMobile && viewMode === 'list' ? 1 : cols;

    return (
        <div style={{ paddingTop: 64, background: '#080808', minHeight: '100vh' }}>

            {/* Quick View */}
            {quickViewProduct && <QuickViewModal product={quickViewProduct} onClose={() => setQuickViewProduct(null)} />}

            {/* ── HERO ─────────────────────────────────── */}
            <section ref={heroRef} style={{ minHeight: isMobile ? '44vh' : '58vh', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.018) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.018) 1px,transparent 1px)', backgroundSize: '52px 52px', pointerEvents: 'none' }} />
                {[['#FF4500', '12%', '20%', 480], ['#0066FF', '70%', '55%', 380], ['#00C851', '82%', '10%', 320]].map(([c, x, y, sz], i) => (
                    <div key={i} style={{ position: 'absolute', top: y, left: x, width: sz, height: sz, background: `radial-gradient(circle,${c}0d 0%,transparent 65%)`, borderRadius: '50%', filter: 'blur(50px)', animation: `orbF ${7 + i * 2}s ease-in-out infinite alternate`, animationDelay: `${i * 1.4}s`, pointerEvents: 'none' }} />
                ))}

                <div style={{ maxWidth: 1400, margin: '0 auto', width: '100%', padding: `80px ${px}px ${isMobile ? 40 : 60}px`, position: 'relative', zIndex: 1 }}>
                    <div className={`reveal${heroInView ? ' revealed' : ''}`} style={{ marginBottom: 12 }}>
                        <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 9, letterSpacing: '0.36em', color: 'var(--red)', background: 'rgba(255,34,0,0.08)', border: '1px solid rgba(255,34,0,0.2)', padding: '4px 14px' }}>THE FULL RANGE</span>
                    </div>
                    <h1 className={`reveal${heroInView ? ' revealed' : ''}`} style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: isMobile ? 'clamp(52px,14vw,80px)' : 'clamp(72px,9vw,134px)', color: 'white', lineHeight: 0.88, letterSpacing: '0.02em', marginBottom: 16, transitionDelay: '80ms' }}>
                        THE<br />COLLECTION<br /><span style={{ WebkitTextStroke: '1px rgba(255,255,255,0.22)', color: 'transparent' }}>{PRODUCTS.length} STYLES.</span>
                    </h1>
                    <p className={`reveal${heroInView ? ' revealed' : ''}`} style={{ transitionDelay: '160ms', fontFamily: "'Barlow',sans-serif", fontSize: isMobile ? 13 : 15, color: 'rgba(255,255,255,0.38)', maxWidth: 460, lineHeight: 1.85 }}>
                        Every silhouette, every colorway. Filter, compare, and find your next obsession.
                    </p>
                </div>
            </section>

            {/* ── STICKY CONTROLS ──────────────────────── */}
            <div style={{ position: 'sticky', top: 64, zIndex: 90, background: 'rgba(8,8,8,0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                <div style={{ maxWidth: 1400, margin: '0 auto', padding: `0 ${px}px` }}>

                    {/* Category tabs */}
                    <div style={{ display: 'flex', gap: 0, overflowX: 'auto', scrollbarWidth: 'none', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        {CATEGORIES.map(cat => (
                            <button key={cat} onClick={() => setActiveCategory(cat)}
                                style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: isMobile ? 10 : 11, letterSpacing: '0.2em', padding: isMobile ? '12px 14px' : '15px 22px', background: 'none', border: 'none', borderBottom: `2px solid ${activeCategory === cat ? 'var(--red)' : 'transparent'}`, color: activeCategory === cat ? 'white' : 'rgba(255,255,255,0.3)', cursor: 'pointer', transition: 'color 0.2s, border-color 0.2s', whiteSpace: 'nowrap', flexShrink: 0, marginBottom: -1 }}>
                                {cat}
                            </button>
                        ))}
                    </div>

                    {/* Controls row */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', flexWrap: isMobile ? 'wrap' : 'nowrap' }}>
                        {/* Search */}
                        <div style={{ position: 'relative', flex: isMobile ? '1 1 100%' : '0 1 240px' }}>
                            <div style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)', pointerEvents: 'none' }}><SearchIcon /></div>
                            <input ref={searchRef} type="text" placeholder="Search styles… ( / )" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                                style={{ width: '100%', padding: '8px 10px 8px 34px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontFamily: "'Barlow Condensed',sans-serif", fontSize: 11, letterSpacing: '0.1em', outline: 'none', borderRadius: 2, transition: 'border-color 0.2s' }}
                                onFocus={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'}
                                onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'} />
                            {searchQuery && <button onClick={() => setSearchQuery('')} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', display: 'flex' }}><CloseIcon /></button>}
                        </div>

                        {/* Price filter */}
                        <select value={activePriceRange} onChange={e => setActivePriceRange(e.target.value)}
                            style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', fontFamily: "'Barlow Condensed',sans-serif", fontSize: 11, letterSpacing: '0.1em', outline: 'none', cursor: 'pointer', borderRadius: 2, flexShrink: 0 }}>
                            {PRICE_RANGES.map(r => <option key={r.id} value={r.id} style={{ background: '#1a1a1a' }}>{r.label}</option>)}
                        </select>

                        {/* Sort */}
                        <select value={activeSort} onChange={e => setActiveSort(e.target.value)}
                            style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', fontFamily: "'Barlow Condensed',sans-serif", fontSize: 11, letterSpacing: '0.1em', outline: 'none', cursor: 'pointer', borderRadius: 2, flexShrink: 0 }}>
                            {SORT_OPTIONS.map(s => <option key={s.id} value={s.id} style={{ background: '#1a1a1a' }}>{s.label}</option>)}
                        </select>

                        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                            {/* Result count */}
                            <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 10, letterSpacing: '0.14em', color: 'rgba(255,255,255,0.28)', whiteSpace: 'nowrap' }}>{filtered.length} STYLE{filtered.length !== 1 ? 'S' : ''}</span>

                            {/* View toggle */}
                            {!isMobile && (
                                <div style={{ display: 'flex', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 2, overflow: 'hidden' }}>
                                    {['grid', 'list'].map(mode => (
                                        <button key={mode} onClick={() => setViewMode(mode)}
                                            style={{ width: 34, height: 30, background: viewMode === mode ? 'rgba(255,255,255,0.1)' : 'transparent', border: 'none', color: viewMode === mode ? 'white' : 'rgba(255,255,255,0.3)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
                                            {mode === 'grid' ? <GridIcon /> : <ListIcon />}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── PRODUCT GRID / LIST ───────────────────── */}
            <section ref={gridRef} style={{ background: '#080808', padding: `${isMobile ? 36 : 52}px ${px}px ${isMobile ? 72 : 120}px` }}>
                <div style={{ maxWidth: 1400, margin: '0 auto' }}>
                    {filtered.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '80px 24px' }}>
                            <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 48, color: 'rgba(255,255,255,0.08)', marginBottom: 16 }}>NO RESULTS</div>
                            <p style={{ fontFamily: "'Barlow',sans-serif", fontSize: 14, color: 'rgba(255,255,255,0.3)', marginBottom: 24 }}>Try adjusting your filters or search term.</p>
                            <button onClick={() => { setActiveCategory('ALL'); setSearchQuery(''); setActivePriceRange('all'); }}
                                style={{ padding: '12px 28px', background: 'var(--red)', border: 'none', color: 'white', fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 11, letterSpacing: '0.2em', cursor: 'pointer', borderRadius: 2 }}>
                                CLEAR FILTERS
                            </button>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: viewMode === 'list' && !isMobile ? '1fr' : `repeat(${gridCols}, 1fr)`, gap: viewMode === 'list' && !isMobile ? 10 : isMobile ? 16 : 24 }}>
                            {filtered.map((p, i) =>
                                viewMode === 'list' && !isMobile
                                    ? <ListRow key={p.id} product={p} inView={gridInView} delay={i * 60} onQuickView={setQuickViewProduct} />
                                    : <GridCard key={p.id} product={p} inView={gridInView} delay={i * 70} onQuickView={setQuickViewProduct} />
                            )}
                        </div>
                    )}
                </div>
            </section>

            <style>{`
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        @keyframes orbF    { 0%{transform:translateY(0) scale(1)} 100%{transform:translateY(-28px) scale(1.06)} }
        select option { background: #1a1a1a; color: white; }
      `}</style>
        </div>
    );
}