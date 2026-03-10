import useInView from '../../hooks/useInView';
import useBreakpoint from '../../hooks/useBreakPoint';
import { TESTIMONIALS } from '../../data/products';

function Testimonials() {
    const [ref, inView] = useInView();
    const { isMobile, isTablet, isSmall } = useBreakpoint();
    const px = isMobile ? 20 : isTablet ? 32 : 40;
    const py = isMobile ? 60 : 120;
    const cols = isSmall ? 1 : isMobile ? 1 : isTablet ? 2 : 3;

    return (
        <section ref={ref} style={{ background: '#080808', padding: `${py}px ${px}px` }}>
            <div style={{ maxWidth: 1400, margin: '0 auto' }}>
                <div className={`reveal${inView ? ' revealed' : ''}`} style={{ textAlign: 'center', marginBottom: isMobile ? 40 : 64 }}>
                    <span className="section-label">WHAT THEY SAY</span>
                    <h2 className="display-heading" style={{ fontSize: isMobile ? 'clamp(36px,10vw,56px)' : 'clamp(44px,5vw,72px)', marginTop: 10 }}>REAL REVIEWS</h2>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols},1fr)`, gap: isMobile ? 16 : 24 }}>
                    {TESTIMONIALS.map((review, i) => (
                        <div key={i} className={`testimonial-card reveal${inView ? ' revealed' : ''}`}
                            style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)', padding: isMobile ? 24 : 36, borderRadius: 4, transitionDelay: `${i * 100}ms` }}>
                            <div style={{ color: 'var(--red)', fontSize: 14, marginBottom: 16, letterSpacing: 3 }}>{'★'.repeat(review.rating)}</div>
                            <p style={{ color: 'rgba(255,255,255,0.65)', lineHeight: 1.8, fontSize: isMobile ? 14 : 15, marginBottom: 24 }}>"{review.text}"</p>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 13, letterSpacing: '0.08em' }}>{review.name}</div>
                                    <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 10, letterSpacing: '0.12em', color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>{review.loc}</div>
                                </div>
                                <div style={{ width: 32, height: 32, background: 'var(--red)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13 }}>✓</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default Testimonials;