import { useState } from 'react';
import useInView from '../../hooks/useInView';
import useBreakpoint from '../../hooks/useBreakPoint';

function Newsletter() {
    const [ref, inView] = useInView();
    const [email, setEmail] = useState('');
    const [joined, setJoined] = useState(false);
    const { isMobile, isTablet } = useBreakpoint();
    const px = isMobile ? 20 : isTablet ? 32 : 40;
    const py = isMobile ? 64 : 120;

    const handleJoin = () => { if (email.trim()) setJoined(true); };

    return (
        <section ref={ref} style={{ background: 'linear-gradient(135deg,#0F0F0F,#1A0A0A)', padding: `${py}px ${px}px`, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <div className={`reveal${inView ? ' revealed' : ''}`} style={{ maxWidth: 680, margin: '0 auto', textAlign: 'center' }}>
                <span className="section-label">APEX INSIDER</span>
                <h2 className="display-heading" style={{ fontSize: isMobile ? 'clamp(40px,11vw,60px)' : 'clamp(44px,6vw,80px)', marginTop: 12, marginBottom: 16 }}>
                    EARLY ACCESS.<br /><span style={{ color: 'var(--red)' }}>ALWAYS.</span>
                </h2>
                <p style={{ color: 'rgba(255,255,255,0.45)', lineHeight: 1.8, fontSize: isMobile ? 14 : 15, marginBottom: 36 }}>
                    Join 50,000+ sneaker heads who get first access to drops, exclusive collabs, and members-only offers.
                </p>
                {!joined ? (
                    <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? 10 : 0, maxWidth: 500, margin: '0 auto' }}>
                        <input type="email" className="input-field" placeholder="YOUR EMAIL ADDRESS"
                            value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleJoin()}
                            style={{ flex: 1, padding: isMobile ? '14px 18px' : '18px 24px', fontFamily: "'Barlow Condensed',sans-serif", fontSize: 13, letterSpacing: '0.08em', borderRight: isMobile ? '1px solid rgba(255,255,255,0.1)' : 'none', borderRadius: 0 }} />
                        <button className="btn-primary" onClick={handleJoin} style={{ padding: isMobile ? '14px 28px' : '18px 32px', fontSize: 13, whiteSpace: 'nowrap' }}>JOIN NOW</button>
                    </div>
                ) : (
                    <div style={{ background: 'rgba(255,34,0,0.1)', border: '1px solid var(--red)', padding: isMobile ? '16px 24px' : '20px 40px', display: 'inline-flex', alignItems: 'center', gap: 12 }}>
                        <span style={{ color: 'var(--red)', fontSize: 18 }}>✓</span>
                        <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, letterSpacing: '0.08em', fontSize: isMobile ? 12 : 14 }}>YOU'RE IN. WELCOME TO APEX INSIDER.</span>
                    </div>
                )}
            </div>
        </section>
    );
}

export default Newsletter;