import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useInView from '../../hooks/useInView';
import useBreakpoint from '../../hooks/useBreakPoint';
import ProductCard from '../ui/ProductCard';
import { PRODUCTS, CATEGORIES } from '../../data/products';
import { useCart } from '../../context/CartContext';

const PAGE_SIZE = 6;

function ProductsGrid() {
    const [activeFilter, setActiveFilter] = useState('ALL');
    const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
    const [loading, setLoading] = useState(false);
    const [ref, inView] = useInView(0.05);
    const { addToCart } = useCart();
    const { isMobile, isTablet, isSmall } = useBreakpoint();
    const navigate = useNavigate();

    const px = isMobile ? 20 : isTablet ? 32 : 40;
    const py = isMobile ? 60 : 120;
    const cols = isSmall ? 1 : isMobile ? 2 : isTablet ? 2 : 3;

    const filtered = activeFilter === 'ALL'
        ? PRODUCTS
        : PRODUCTS.filter(p => p.category === activeFilter);

    const visible = filtered.slice(0, visibleCount);
    const hasMore = visibleCount < filtered.length;
    const remaining = filtered.length - visibleCount;

    // Reset pagination when filter changes
    const handleFilter = (cat) => {
        setActiveFilter(cat);
        setVisibleCount(PAGE_SIZE);
    };

    const handleLoadMore = () => {
        setLoading(true);
        // Small delay so the user sees feedback before new cards appear
        setTimeout(() => {
            setVisibleCount(v => v + PAGE_SIZE);
            setLoading(false);
        }, 400);
    };

    return (
        <section ref={ref} id="shop" style={{ background: '#080808', padding: `${py}px ${px}px` }}>
            <div style={{ maxWidth: 1400, margin: '0 auto' }}>

                {/* ── Header + filters ── */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: isMobile ? 32 : 56, flexWrap: 'wrap', gap: 20 }}>
                    <div className={`reveal${inView ? ' revealed' : ''}`}>
                        <span className="section-label">THE COLLECTION</span>
                        <h2 className="display-heading" style={{ fontSize: isMobile ? 'clamp(36px,10vw,56px)' : 'clamp(44px,5vw,72px)', marginTop: 10 }}>
                            ALL KICKS
                        </h2>
                    </div>
                    <div className={`reveal${inView ? ' revealed' : ''}`} style={{ display: 'flex', gap: 6, flexWrap: 'wrap', transitionDelay: '0.1s' }}>
                        {CATEGORIES.map(cat => (
                            <button
                                key={cat}
                                className={`filter-btn${activeFilter === cat ? ' active' : ''}`}
                                onClick={() => handleFilter(cat)}
                                style={{ padding: isMobile ? '6px 12px' : '8px 16px', border: '1px solid rgba(255,255,255,0.12)', color: activeFilter === cat ? 'white' : 'rgba(255,255,255,0.5)', borderRadius: 2, fontSize: isMobile ? 10 : 12 }}>
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* ── Result count ── */}
                <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 11, letterSpacing: '0.15em', color: 'rgba(255,255,255,0.3)', marginBottom: 24 }}>
                    SHOWING {visible.length} OF {filtered.length} STYLES
                    {activeFilter !== 'ALL' && <span style={{ color: 'var(--red)', marginLeft: 8 }}>· {activeFilter}</span>}
                </div>

                {/* ── Product grid ── */}
                <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols},1fr)`, gap: isMobile ? 12 : 24 }}>
                    {visible.map((p, i) => (
                        <ProductCard
                            key={p.id}
                            product={p}
                            onAddToCart={addToCart}
                            delay={i * 60}
                            inView={inView}
                        />
                    ))}
                </div>

                {/* ── Load More ── */}
                <div style={{ textAlign: 'center', marginTop: isMobile ? 40 : 60 }}>
                    {hasMore ? (
                        <button
                            className="btn-outline"
                            onClick={handleLoadMore}
                            disabled={loading}
                            style={{ padding: isMobile ? '14px 36px' : '16px 48px', fontSize: 14, opacity: loading ? 0.6 : 1, transition: 'opacity 0.2s', minWidth: 200, position: 'relative' }}>
                            {loading
                                ? 'LOADING...'
                                : `LOAD MORE — ${remaining} LEFT`}
                        </button>
                    ) : filtered.length > PAGE_SIZE ? (
                        // All loaded — show full collection CTA
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                            <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 11, letterSpacing: '0.15em', color: 'rgba(255,255,255,0.25)' }}>
                                ALL {filtered.length} STYLES LOADED
                            </div>
                            <button
                                className="btn-outline"
                                onClick={() => navigate('/collection')}
                                style={{ padding: isMobile ? '14px 36px' : '16px 48px', fontSize: 14 }}>
                                VIEW FULL COLLECTION →
                            </button>
                        </div>
                    ) : (
                        <button
                            className="btn-outline"
                            onClick={() => navigate('/collection')}
                            style={{ padding: isMobile ? '14px 36px' : '16px 48px', fontSize: 14 }}>
                            VIEW FULL COLLECTION →
                        </button>
                    )}
                </div>
            </div>
        </section>
    );
}

export default ProductsGrid;