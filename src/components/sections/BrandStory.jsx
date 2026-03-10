import useInView from '../../hooks/useInView';
import useBreakpoint from '../../hooks/useBreakPoint';
import { BRAND_FEATURES } from '../../data/products';

function BrandStory() {
    const [ref, inView] = useInView();
    const { isMobile, isTablet } = useBreakpoint();
    const px = isMobile ? 20 : isTablet ? 32 : 40;
    const py = isMobile ? 60 : 100;

    return (
        <section style={{ background: 'var(--red)', padding: `${py}px ${px}px`, overflow: 'hidden', position: 'relative' }}>
            <div style={{ position: 'absolute', bottom: '-15%', right: '-1%', fontFamily: "'Bebas Neue',sans-serif", fontSize: 'clamp(100px,20vw,260px)', color: 'rgba(0,0,0,0.1)', userSelect: 'none', lineHeight: 1, pointerEvents: 'none' }}>APEX KICKS</div>
            <div ref={ref} style={{ maxWidth: 1400, margin: '0 auto', display: 'grid', gridTemplateColumns: isTablet ? '1fr' : '1fr 1fr', gap: isTablet ? 40 : 80, alignItems: 'center', position: 'relative' }}>
                <div className={`reveal${inView ? ' revealed' : ''}`}>
                    <h2 className="display-heading" style={{ fontSize: isMobile ? 'clamp(44px,11vw,64px)' : 'clamp(52px,6vw,80px)', color: 'white' }}>CRAFTED WITH<br />OBSESSION.</h2>
                    <p style={{ color: 'rgba(255,255,255,0.75)', lineHeight: 1.9, fontSize: isMobile ? 14 : 16, marginTop: 20, maxWidth: 420 }}>
                        Every stitch, every sole, every seam. We engineer sneakers with a singular obsession: to make you feel unstoppable. Premium materials. Uncompromising design.
                    </p>
                </div>
                <div className={`reveal${inView ? ' revealed' : ''}`} style={{ transitionDelay: isTablet ? '0s' : '0.15s', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: isMobile ? 12 : 20 }}>
                    {BRAND_FEATURES.map(([icon, title, desc]) => (
                        <div key={title} style={{ background: 'rgba(0,0,0,0.15)', padding: isMobile ? 16 : 20, borderRadius: 4 }}>
                            <div style={{ fontSize: isMobile ? 24 : 28, marginBottom: 8 }}>{icon}</div>
                            <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: isMobile ? 11 : 12, letterSpacing: '0.12em', color: 'white', marginBottom: 4 }}>{title}</div>
                            <div style={{ fontSize: isMobile ? 11 : 12, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 }}>{desc}</div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default BrandStory;