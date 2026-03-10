/* eslint-disable jsx-a11y/anchor-is-valid */
import { Link } from 'react-router-dom';
import { FOOTER_LINKS } from '../../data/products';
import useBreakpoint from '../../hooks/useBreakPoint';

// ── Social icon SVGs ────────────────────────────────────────────────────────
const SOCIAL_ICONS = {
    IG: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
            <circle cx="12" cy="12" r="4" />
            <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" stroke="none" />
        </svg>
    ),
    TW: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
    ),
    TK: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.22 8.22 0 004.81 1.54V6.79a4.85 4.85 0 01-1.04-.1z" />
        </svg>
    ),
    YT: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
    ),
};

const SOCIALS = ['IG', 'TW', 'TK', 'YT'];

// ── Logo mark — matches Navbar exactly ─────────────────────────────────────
function ApexLogoMark({ size = 32 }) {
    return (
        <div style={{
            width: size, height: size, minWidth: size,
            background: 'linear-gradient(135deg,#FF2200,#cc1a00)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            clipPath: 'polygon(12% 0%,88% 0%,100% 12%,100% 88%,88% 100%,12% 100%,0% 88%,0% 12%)',
            flexShrink: 0,
        }}>
            <span style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: size * 0.59,
                color: 'white',
                lineHeight: 1,
                letterSpacing: '-0.02em',
            }}>A</span>
        </div>
    );
}

function Footer() {
    const { isMobile, isTablet, isSmall } = useBreakpoint();
    const px = isMobile ? 20 : isTablet ? 32 : 40;
    const py = isMobile ? 48 : 80;
    const cols = isSmall ? 1 : isMobile ? 2 : isTablet ? 2 : '2fr 1fr 1fr 1fr';

    return (
        <footer style={{
            background: '#050505',
            borderTop: '1px solid rgba(255,255,255,0.06)',
            padding: `${py}px ${px}px ${isMobile ? 32 : 40}px`,
        }}>
            <div style={{ maxWidth: 1400, margin: '0 auto' }}>

                {/* ── Main grid ── */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: typeof cols === 'string' ? cols : `repeat(${cols},1fr)`,
                    gap: isMobile ? 36 : 48,
                    marginBottom: isMobile ? 40 : 56,
                }}>

                    {/* Brand column */}
                    <div>
                        <Link to="/" style={{
                            display: 'flex', alignItems: 'center', gap: 10,
                            marginBottom: isMobile ? 14 : 16, textDecoration: 'none',
                        }}>
                            {/* Exact same octagon logo as Navbar */}
                            <ApexLogoMark size={isMobile ? 30 : 34} />
                            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
                                <span style={{
                                    fontFamily: "'Bebas Neue', sans-serif",
                                    fontSize: isMobile ? 18 : 22,
                                    letterSpacing: '0.18em',
                                    color: '#F5F3EE',
                                    whiteSpace: 'nowrap',
                                    lineHeight: 1,
                                }}>APEX KICKS</span>
                                <span style={{
                                    fontFamily: "'Barlow Condensed', sans-serif",
                                    fontSize: isMobile ? 8 : 9,
                                    letterSpacing: '0.22em',
                                    color: 'rgba(255,255,255,0.35)',
                                    marginTop: 3,
                                }}>PREMIUM FOOTWEAR</span>
                            </div>
                        </Link>

                        <p style={{
                            color: 'rgba(255,255,255,0.4)',
                            lineHeight: 1.85,
                            fontSize: 13,
                            maxWidth: 260,
                            marginBottom: isMobile ? 20 : 24,
                        }}>
                            Premium sneakers engineered at the intersection of performance and street culture.
                        </p>

                        {/* Social icons */}
                        <div style={{ display: 'flex', gap: 10 }}>
                            {SOCIALS.map(s => (
                                <button
                                    key={s}
                                    style={{
                                        width: isMobile ? 40 : 34,
                                        height: isMobile ? 40 : 34,
                                        border: '1px solid rgba(255,255,255,0.12)',
                                        background: 'transparent',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: 'rgba(255,255,255,0.45)',
                                        cursor: 'pointer',
                                        borderRadius: 2,
                                        transition: 'border-color 0.2s, color 0.2s, background 0.2s',
                                        WebkitTapHighlightColor: 'transparent',
                                        touchAction: 'manipulation',
                                    }}
                                    onMouseEnter={e => {
                                        e.currentTarget.style.borderColor = 'rgba(255,34,0,0.6)';
                                        e.currentTarget.style.color = '#FF2200';
                                        e.currentTarget.style.background = 'rgba(255,34,0,0.06)';
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
                                        e.currentTarget.style.color = 'rgba(255,255,255,0.45)';
                                        e.currentTarget.style.background = 'transparent';
                                    }}
                                >
                                    {SOCIAL_ICONS[s]}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Link columns */}
                    {FOOTER_LINKS.map(([title, links]) => (
                        <div key={title}>
                            <div style={{
                                fontFamily: "'Barlow Condensed', sans-serif",
                                fontWeight: 700,
                                fontSize: 10,
                                letterSpacing: '0.22em',
                                color: 'rgba(255,255,255,0.3)',
                                marginBottom: isMobile ? 14 : 16,
                                textTransform: 'uppercase',
                            }}>{title}</div>
                            {links.map(link => (
                                <a
                                    key={link}
                                    href="#"
                                    style={{
                                        display: 'block',
                                        marginBottom: isMobile ? 13 : 10,
                                        color: 'rgba(255,255,255,0.45)',
                                        fontFamily: "'Barlow', sans-serif",
                                        fontSize: isMobile ? 14 : 13,
                                        textDecoration: 'none',
                                        transition: 'color 0.18s',
                                        WebkitTapHighlightColor: 'transparent',
                                        padding: isMobile ? '2px 0' : '0',
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.color = '#F5F3EE'; }}
                                    onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.45)'; }}
                                >
                                    {link}
                                </a>
                            ))}
                        </div>
                    ))}
                </div>

                {/* ── Bottom bar ── */}
                <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', marginBottom: isMobile ? 20 : 24 }} />
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexDirection: isMobile ? 'column' : 'row',
                    gap: isMobile ? 14 : 12,
                    textAlign: isMobile ? 'center' : 'left',
                }}>
                    <span style={{
                        color: 'rgba(255,255,255,0.22)',
                        fontSize: isMobile ? 10 : 11,
                        fontFamily: "'Barlow', sans-serif",
                        letterSpacing: '0.04em',
                    }}>
                        © {new Date().getFullYear()} APEX KICKS. ALL RIGHTS RESERVED.
                    </span>
                    <div style={{
                        display: 'flex',
                        gap: isMobile ? 20 : 16,
                        flexWrap: 'wrap',
                        justifyContent: isMobile ? 'center' : 'flex-end',
                    }}>
                        {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map(l => (
                            <a
                                key={l}
                                href="#"
                                style={{
                                    color: 'rgba(255,255,255,0.22)',
                                    fontSize: 10,
                                    fontFamily: "'Barlow Condensed', sans-serif",
                                    letterSpacing: '0.1em',
                                    textDecoration: 'none',
                                    transition: 'color 0.18s',
                                    WebkitTapHighlightColor: 'transparent',
                                    padding: isMobile ? '4px 0' : '0',
                                }}
                                onMouseEnter={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.55)'; }}
                                onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.22)'; }}
                            >
                                {l}
                            </a>
                        ))}
                    </div>
                </div>

            </div>
        </footer>
    );
}

export default Footer;