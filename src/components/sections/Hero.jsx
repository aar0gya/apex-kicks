import { useNavigate } from 'react-router-dom';
import { STATS } from '../../data/products';
import { HERO_IMAGE } from '../../data/shoeImages';
import useBreakpoint from '../../hooks/useBreakPoint';
import { useState } from 'react';

function Hero({ onShopClick }) {
    const { isMobile, isTablet } = useBreakpoint();
    const navigate = useNavigate();
    const [imgLoaded, setImgLoaded] = useState(false);
    const px = isMobile ? 20 : isTablet ? 32 : 48;

    const handleExplore = () => {
        const shopSection = document.getElementById('shop');
        if (shopSection) {
            shopSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
            navigate('/collection');
        }
    };

    return (
        <section style={{
            minHeight: '100vh', background: '#080808',
            display: 'flex', flexDirection: 'column', justifyContent: 'center',
            paddingTop: 40, position: 'relative', overflow: 'hidden',
        }}>
            {/* Background layers */}
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg,#0F0808 0%,#080808 45%,#080D0A 100%)' }} />
            <div style={{ position: 'absolute', top: '-10%', right: '-8%', width: 700, height: 700, background: 'radial-gradient(circle,rgba(255,34,0,0.10) 0%,transparent 65%)', borderRadius: '50%' }} />
            <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.018) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.018) 1px,transparent 1px)', backgroundSize: '80px 80px', maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%,black 30%,transparent 100%)', WebkitMaskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%,black 30%,transparent 100%)' }} />

            <div style={{ maxWidth: 1400, margin: '0 auto', padding: `0 ${px}px`, width: '100%', position: 'relative', zIndex: 1 }}>
                <div style={{ display: 'grid', gridTemplateColumns: isTablet ? '1fr' : '1fr 1fr', gap: 40, alignItems: 'center' }}>

                    {/* ── Text ── */}
                    <div>
                        <div className="opacity-0 animate-fadeUp delay-1" style={{ marginBottom: 16 }}>
                            <span className="section-label">SS 2025 COLLECTION</span>
                        </div>
                        <h1 className="display-heading opacity-0 animate-fadeUp delay-2" style={{ fontSize: isMobile ? 'clamp(48px,13vw,72px)' : 'clamp(60px,8vw,120px)', marginBottom: 4, lineHeight: 0.92 }}>
                            <span className="text-clip">BUILT FOR</span>
                        </h1>
                        <h1 className="display-heading opacity-0 animate-fadeUp delay-3" style={{ fontSize: isMobile ? 'clamp(48px,13vw,72px)' : 'clamp(60px,8vw,120px)', color: 'var(--red)', marginBottom: 4, lineHeight: 0.92 }}>
                            THE BOLD.
                        </h1>
                        <h1 className="display-heading opacity-0 animate-fadeUp delay-4" style={{ fontSize: isMobile ? 'clamp(48px,13vw,72px)' : 'clamp(60px,8vw,120px)', color: 'rgba(255,255,255,0.13)', lineHeight: 0.92 }}>
                            THE FREE.
                        </h1>

                        <p className="opacity-0 animate-fadeUp delay-5" style={{ fontFamily: "'Barlow',sans-serif", fontWeight: 300, fontSize: isMobile ? 14 : 16, color: 'rgba(255,255,255,0.5)', lineHeight: 1.8, marginTop: isMobile ? 20 : 32, marginBottom: isMobile ? 24 : 40, maxWidth: 400 }}>
                            Premium sneakers engineered at the intersection of performance and culture. No compromises. No limits.
                        </p>

                        <div className="opacity-0 animate-fadeUp delay-6" style={{ display: 'flex', gap: 12, flexDirection: isMobile ? 'column' : 'row' }}>
                            <button className="btn-primary" onClick={onShopClick} style={{ padding: isMobile ? '15px 28px' : '18px 44px', fontSize: isMobile ? 14 : 16 }}>
                                SHOP NOW →
                            </button>
                            <button className="btn-outline" onClick={handleExplore} style={{ padding: isMobile ? '15px 28px' : '18px 32px', fontSize: isMobile ? 14 : 16 }}>
                                EXPLORE
                            </button>
                        </div>

                        <div className="opacity-0 animate-fadeUp delay-6" style={{ display: 'flex', gap: isMobile ? 24 : 40, flexWrap: 'wrap', marginTop: isMobile ? 36 : 56, paddingTop: isMobile ? 24 : 40, borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                            {STATS.map(([number, label]) => (
                                <div key={label}>
                                    <div className="stat-number" style={{ fontSize: isMobile ? 26 : 36, color: 'var(--white)' }}>{number}</div>
                                    <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 10, letterSpacing: '0.18em', color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>{label}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ── Shoe image — desktop only ── */}
                    {!isTablet && (
                        <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            {/* Glow ring */}
                            <div style={{ width: 500, height: 500, background: 'radial-gradient(circle,rgba(255,34,0,0.12) 0%,transparent 65%)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                                <div style={{ position: 'absolute', inset: 0, border: '1px solid rgba(255,255,255,0.05)', borderRadius: '50%' }} />

                                {/* Skeleton */}
                                {!imgLoaded && (
                                    <div style={{ width: 420, height: 320, background: 'rgba(255,255,255,0.04)', borderRadius: 12 }} />
                                )}

                                {/* Real shoe image */}
                                <img
                                    src="/apex-logo.png"
                                    alt="APEX PHANTOM"
                                    onLoad={() => setImgLoaded(true)}
                                    className="shoe-float"
                                    style={{
                                        width: 420, height: 320,
                                        objectFit: 'cover',
                                        borderRadius: 12,
                                        opacity: imgLoaded ? 1 : 0,
                                        transition: 'opacity 0.5s ease',
                                        filter: 'drop-shadow(0 40px 80px rgba(255,34,0,0.35))',
                                        position: 'relative', zIndex: 1,
                                    }}
                                />

                                {/* Floating badge — top right */}
                                <div style={{ position: 'absolute', top: '12%', right: '-4%', background: 'rgba(12,12,12,0.92)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.08)', padding: '12px 18px', borderRadius: 8, zIndex: 2 }}>
                                    <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 10, color: 'var(--red)', letterSpacing: '0.12em' }}>CARBON FIBER</div>
                                    <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 20, marginTop: 2 }}>SOLE TECH</div>
                                </div>

                                {/* Floating price — bottom left */}
                                <div style={{ position: 'absolute', bottom: '16%', left: '-6%', background: 'var(--red)', padding: '12px 20px', borderRadius: 8, zIndex: 2 }}>
                                    <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 28, lineHeight: 1 }}>$249</div>
                                    <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 9, letterSpacing: '0.12em', opacity: 0.85 }}>STARTING FROM</div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Scroll indicator */}
            <div style={{ position: 'absolute', bottom: 28, left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 9, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.25)' }}>SCROLL</span>
                <div style={{ width: 1, height: 32, background: 'linear-gradient(to bottom,rgba(255,34,0,0.8),transparent)' }} />
            </div>
        </section>
    );
}

export default Hero;