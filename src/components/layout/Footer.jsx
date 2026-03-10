import { Link } from 'react-router-dom';
import { FOOTER_LINKS } from '../../data/products';
import useBreakpoint from '../../hooks/useBreakPoint';

const SOCIALS = ['IG', 'TW', 'TK', 'YT'];

function Footer() {
    const { isMobile, isTablet, isSmall } = useBreakpoint();
    const px = isMobile ? 20 : isTablet ? 32 : 40;
    const py = isMobile ? 48 : 80;
    const cols = isSmall ? 1 : isMobile ? 2 : isTablet ? 2 : '2fr 1fr 1fr 1fr';

    return (
        <footer style={{ background: '#050505', borderTop: '1px solid rgba(255,255,255,0.06)', padding: `${py}px ${px}px ${isMobile ? 32 : 40}px` }}>
            <div style={{ maxWidth: 1400, margin: '0 auto' }}>
                <div style={{ display: 'grid', gridTemplateColumns: typeof cols === 'string' ? cols : `repeat(${cols},1fr)`, gap: isMobile ? 32 : 48, marginBottom: isMobile ? 40 : 56 }}>

                    <div>
                        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, textDecoration: 'none' }}>
                            <div style={{ width: 30, height: 30, fontFamily: "Barlow Condensed", background: 'var(--red)', color: 'var(--white)', display: 'flex', borderRadius: 5 , alignItems: 'center', justifyContent: 'center', fontSize: 20}}> A </div>
                            <span style={{ fontFamily: "Barlow Condensed", fontSize: 20, letterSpacing: '0.12em', color: 'var(--white)' }}>APEX KICKS</span>
                        </Link>
                        <p style={{ color: 'rgba(255,255,255,0.4)', lineHeight: 1.8, fontSize: 13, maxWidth: 260 }}>
                            Premium sneakers engineered at the intersection of performance and street culture.
                        </p>
                        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                            {SOCIALS.map(s => (
                                <div key={s} style={{ width: 32, height: 32, border: '1px solid rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Barlow Condensed',sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', color: 'rgba(255,255,255,0.5)', cursor: 'pointer' }}>{s}</div>
                            ))}
                        </div>
                    </div>

                    {FOOTER_LINKS.map(([title, links]) => (
                        <div key={title}>
                            <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 10, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.35)', marginBottom: 16 }}>{title}</div>
                            {links.map(link => (
                                <a key={link} href="#" style={{ display: 'block', marginBottom: 10, color: 'rgba(255,255,255,0.5)', fontFamily: "'Barlow',sans-serif", fontSize: 13, textDecoration: 'none' }}>{link}</a>
                            ))}
                        </div>
                    ))}
                </div>

                <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', marginBottom: 24 }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexDirection: isMobile ? 'column' : 'row', gap: 12 }}>
                    <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: 11, fontFamily: "'Barlow',sans-serif" }}>© 2025 APEX KICKS. ALL RIGHTS RESERVED.</span>
                    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: isMobile ? 'center' : 'flex-end' }}>
                        {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map(l => (
                            <a key={l} href="#" style={{ color: 'rgba(255,255,255,0.25)', fontSize: 10, fontFamily: "'Barlow Condensed',sans-serif", letterSpacing: '0.08em', textDecoration: 'none' }}>{l}</a>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default Footer;