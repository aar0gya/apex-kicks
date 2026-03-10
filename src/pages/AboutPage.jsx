import { useState, useEffect, useRef } from 'react';
import useInView from '../hooks/useInView';
import useBreakpoint from '../hooks/useBreakPoint';
import { BRAND_FEATURES } from '../data/products';

const TIMELINE = [
    { year: '2018', event: 'APEX FOUNDED', desc: 'Three engineers and a designer leave Silicon Valley to build the perfect sneaker.', accent: '#FF2200' },
    { year: '2019', event: 'FIRST DROP', desc: 'The original Phantom sells out in 4 minutes. 2,000 pairs. A movement begins.', accent: '#FF6B35' },
    { year: '2020', event: 'GOING GLOBAL', desc: 'Launch in 12 countries. First collab with Tokyo-based MARZ drops to critical acclaim.', accent: '#FBBF24' },
    { year: '2021', event: 'REACTFOAM™', desc: 'Proprietary foam technology patented. 40% more energy return than leading competitors.', accent: '#38BDF8' },
    { year: '2022', event: 'SUSTAINABILITY', desc: '60% recycled materials across the full range. Carbon-neutral production achieved.', accent: '#34D399' },
    { year: '2023', event: 'APEX ELITE', desc: 'Members-only platform launches. 50,000+ early adopters in the first month.', accent: '#A78BFA' },
    { year: '2025', event: 'PHANTOM X2', desc: 'Our most ambitious release yet. The future of performance footwear.', accent: '#FF2200' },
];

const TEAM = [
    { name: 'KAI MORRISON', role: 'FOUNDER & CEO', accent: '#FF2200', quote: 'We build for the relentless.' },
    { name: 'DR. YUKI TANAKA', role: 'HEAD OF ENGINEERING', accent: '#38BDF8', quote: 'The physics don\'t lie.' },
    { name: 'SOFIA GUERRA', role: 'CREATIVE DIRECTOR', accent: '#FBBF24', quote: 'Design is a conversation with culture.' },
    { name: 'AMARA DIALLO', role: 'SUSTAINABILITY LEAD', accent: '#34D399', quote: 'The planet doesn\'t have a deadline. We do.' },
];

const VALUES = [
    { icon: '⚡', title: 'PERFORMANCE FIRST', desc: 'Every design decision is driven by how it performs — on track, on court, on street. Beauty is the byproduct of function done right.', accent: '#FF2200' },
    { icon: '🎨', title: 'DESIGN AS CULTURE', desc: "We don't just make shoes. We make artifacts that reflect where culture is headed. What you wear is a statement about what you believe.", accent: '#FBBF24' },
    { icon: '🌍', title: 'PLANET MATTERS', desc: "Sustainability isn't a checkbox — it's baked into every decision we make. We're on track for 100% recycled materials by 2027.", accent: '#34D399' },
    { icon: '🤝', title: 'COMMUNITY FIRST', desc: 'The APEX community is our greatest asset. 47 run clubs, 12 countries, 200,000+ members. Everything we build, we build for them.', accent: '#A78BFA' },
];

// ── Animated number counter ────────────────────────────────────
function CountUp({ target, suffix = '', duration = 1400 }) {
    const [count, setCount] = useState(0);
    const raf = useRef(null);
    useEffect(() => {
        const start = performance.now();
        const tick = (now) => {
            const p = Math.min((now - start) / duration, 1);
            const e = 1 - Math.pow(1 - p, 3);
            setCount(Math.floor(target * e));
            if (p < 1) raf.current = requestAnimationFrame(tick);
        };
        raf.current = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf.current);
    }, [target, duration]);
    return <>{count.toLocaleString()}{suffix}</>;
}

// ── Scroll-triggered counter stat ─────────────────────────────
function StatBlock({ value, suffix, label, accent, inView, delay }) {
    return (
        <div className={`reveal${inView ? ' revealed' : ''}`} style={{ transitionDelay: `${delay}ms`, textAlign: 'center' }}>
            <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 'clamp(44px,5vw,72px)', color: accent, lineHeight: 1, letterSpacing: '0.02em' }}>
                {inView ? <CountUp target={value} suffix={suffix} /> : `0${suffix}`}
            </div>
            <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 9, letterSpacing: '0.24em', color: 'rgba(255,255,255,0.3)', marginTop: 10 }}>{label}</div>
        </div>
    );
}

// ── Parallax text on scroll ────────────────────────────────────
function ParallaxText({ children, speed = 0.3 }) {
    const [offset, setOffset] = useState(0);
    const ref = useRef(null);
    useEffect(() => {
        const fn = () => {
            if (!ref.current) return;
            const rect = ref.current.getBoundingClientRect();
            const center = rect.top + rect.height / 2 - window.innerHeight / 2;
            setOffset(center * speed);
        };
        window.addEventListener('scroll', fn, { passive: true });
        fn();
        return () => window.removeEventListener('scroll', fn);
    }, [speed]);
    return <div ref={ref} style={{ transform: `translateY(${offset}px)`, willChange: 'transform' }}>{children}</div>;
}

// ── Team card ──────────────────────────────────────────────────
function TeamCard({ member, inView, delay }) {
    const [hovered, setHovered] = useState(false);
    const initials = member.name.split(' ').map(w => w[0]).join('').slice(0, 2);
    return (
        <div className={`reveal${inView ? ' revealed' : ''}`}
            style={{ transitionDelay: `${delay}ms` }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}>
            <div style={{ background: hovered ? `${member.accent}0e` : 'rgba(255,255,255,0.02)', border: `1px solid ${hovered ? member.accent + '44' : 'rgba(255,255,255,0.06)'}`, borderRadius: 3, padding: '32px 28px', transition: 'all 0.35s cubic-bezier(0.23,1,0.32,1)', transform: hovered ? 'translateY(-6px)' : 'none' }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: `linear-gradient(135deg, ${member.accent}33, ${member.accent}11)`, border: `1px solid ${member.accent}55`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20, boxShadow: hovered ? `0 0 24px ${member.accent}33` : 'none', transition: 'box-shadow 0.3s' }}>
                    <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 26, color: member.accent, lineHeight: 1 }}>{initials}</span>
                </div>
                <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 18, color: 'white', letterSpacing: '0.04em', marginBottom: 5 }}>{member.name}</div>
                <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 9, letterSpacing: '0.2em', color: member.accent, marginBottom: 14 }}>{member.role}</div>
                <p style={{ fontFamily: "'Barlow',sans-serif", fontSize: 13, color: 'rgba(255,255,255,0.4)', lineHeight: 1.7, fontStyle: 'italic', opacity: hovered ? 1 : 0, transform: hovered ? 'translateY(0)' : 'translateY(6px)', transition: 'opacity 0.3s, transform 0.3s' }}>
                    "{member.quote}"
                </p>
            </div>
        </div>
    );
}

// ── Value card ─────────────────────────────────────────────────
function ValueCard({ v, inView, delay }) {
    const [hovered, setHovered] = useState(false);
    return (
        <div className={`reveal${inView ? ' revealed' : ''}`} style={{ transitionDelay: `${delay}ms` }}
            onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
            <div style={{ background: hovered ? `${v.accent}08` : 'rgba(255,255,255,0.02)', border: `1px solid ${hovered ? v.accent + '44' : 'rgba(255,255,255,0.06)'}`, borderRadius: 3, padding: '36px 32px', transition: 'all 0.35s cubic-bezier(0.23,1,0.32,1)', transform: hovered ? 'translateY(-5px)' : 'none', height: '100%' }}>
                <div style={{ width: 52, height: 52, borderRadius: '50%', background: `${v.accent}15`, border: `1px solid ${v.accent}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, marginBottom: 22 }}>{v.icon}</div>
                <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 22, color: 'white', letterSpacing: '0.04em', marginBottom: 12 }}>{v.title}</div>
                <p style={{ fontFamily: "'Barlow',sans-serif", fontSize: 14, color: 'rgba(255,255,255,0.48)', lineHeight: 1.85 }}>{v.desc}</p>
                <div style={{ marginTop: 20, height: 2, background: `${v.accent}22`, borderRadius: 1, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: hovered ? '100%' : '0%', background: v.accent, transition: 'width 0.6s cubic-bezier(0.23,1,0.32,1)', transitionDelay: '0.1s' }} />
                </div>
            </div>
        </div>
    );
}

// ── Main page ──────────────────────────────────────────────────
export default function AboutPage() {
    const [heroRef, heroInView] = useInView(0.1);
    const [valRef, valInView] = useInView(0.05);
    const [tlRef, tlInView] = useInView(0.05);
    const [statsRef, statsInView] = useInView(0.1);
    const [teamRef, teamInView] = useInView(0.05);
    const [ctaRef, ctaInView] = useInView(0.1);
    const [email, setEmail] = useState('');
    const [joined, setJoined] = useState(false);
    const { isMobile, isTablet } = useBreakpoint();
    const px = isMobile ? 20 : isTablet ? 32 : 56;
    const cols = isMobile ? 1 : isTablet ? 2 : 4;

    const STATS = [
        { value: 2018, suffix: '', label: 'FOUNDED' },
        { value: 200000, suffix: '+', label: 'COMMUNITY MEMBERS' },
        { value: 47, suffix: '', label: 'ARTIST COLLABS' },
        { value: 12, suffix: '', label: 'COUNTRIES' },
    ];

    return (
        <div style={{ paddingTop: 64, background: '#080808' }}>

            {/* ── HERO ─────────────────────────────────── */}
            <section ref={heroRef} style={{ minHeight: isMobile ? '75vh' : '90vh', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center' }}>
                {/* Animated noise grid */}
                <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.02) 1px,transparent 1px)', backgroundSize: '48px 48px', pointerEvents: 'none' }} />

                {/* Floating glows */}
                <div style={{ position: 'absolute', top: '15%', right: '5%', width: 700, height: 700, background: 'radial-gradient(circle, rgba(255,34,0,0.07) 0%, transparent 65%)', borderRadius: '50%', filter: 'blur(30px)', animation: 'orbFloat 8s ease-in-out infinite alternate', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', bottom: '10%', left: '8%', width: 450, height: 450, background: 'radial-gradient(circle, rgba(56,189,248,0.05) 0%, transparent 65%)', borderRadius: '50%', filter: 'blur(40px)', animation: 'orbFloat 10s ease-in-out infinite alternate-reverse', pointerEvents: 'none' }} />

                {/* Large background text */}
                <div style={{ position: 'absolute', right: '-2%', bottom: '8%', fontFamily: "'Bebas Neue',sans-serif", fontSize: 'clamp(140px,18vw,280px)', color: 'rgba(255,255,255,0.025)', lineHeight: 1, userSelect: 'none', pointerEvents: 'none', letterSpacing: '0.02em' }}>APEX</div>

                <div style={{ maxWidth: 1400, margin: '0 auto', width: '100%', padding: `80px ${px}px`, position: 'relative', zIndex: 1 }}>
                    <div className={`reveal${heroInView ? ' revealed' : ''}`} style={{ marginBottom: 16 }}>
                        <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 9, letterSpacing: '0.36em', color: 'var(--red)', background: 'rgba(255,34,0,0.08)', border: '1px solid rgba(255,34,0,0.2)', padding: '4px 14px' }}>OUR STORY</span>
                    </div>

                    <h1 className={`reveal${heroInView ? ' revealed' : ''}`} style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: isMobile ? 'clamp(52px,14vw,80px)' : 'clamp(80px,10vw,148px)', color: 'white', lineHeight: 0.88, letterSpacing: '0.01em', marginBottom: 30, transitionDelay: '80ms' }}>
                        WE BUILD<br />FOR THE<br /><span style={{ color: 'var(--red)', WebkitTextStroke: '0px' }}>RELENTLESS.</span>
                    </h1>

                    <div className={`reveal${heroInView ? ' revealed' : ''}`} style={{ transitionDelay: '180ms', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 32, maxWidth: 900, alignItems: 'start' }}>
                        <p style={{ fontFamily: "'Barlow',sans-serif", fontSize: isMobile ? 15 : 17, color: 'rgba(255,255,255,0.5)', lineHeight: 1.9 }}>
                            Founded in 2018 by obsessives who believed premium performance footwear shouldn't require choosing between style and substance. We were wrong about a lot of things. We were never wrong about that.
                        </p>
                        {!isMobile && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingLeft: 32, borderLeft: '1px solid rgba(255,255,255,0.08)' }}>
                                {[['2018', 'Founded in San Francisco'], ['2019', 'First drop sells out in 4 minutes'], ['2025', 'Global community of 200,000+']].map(([year, text]) => (
                                    <div key={year} style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                                        <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 14, color: 'var(--red)', flexShrink: 0, marginTop: 1 }}>{year}</span>
                                        <span style={{ fontFamily: "'Barlow',sans-serif", fontSize: 13, color: 'rgba(255,255,255,0.38)', lineHeight: 1.6 }}>{text}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Scroll cue */}
                    <div className={`reveal${heroInView ? ' revealed' : ''}`} style={{ transitionDelay: '320ms', marginTop: 52, display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 1, height: 48, background: 'linear-gradient(to bottom, var(--red), transparent)', animation: 'pulse 2s ease-in-out infinite' }} />
                        <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 9, letterSpacing: '0.28em', color: 'rgba(255,255,255,0.25)' }}>SCROLL TO EXPLORE</span>
                    </div>
                </div>
            </section>

            {/* ── PHILOSOPHY DIVIDER ───────────────────── */}
            <div style={{ background: '#040404', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden', padding: '22px 0' }}>
                <div style={{ display: 'flex', animation: 'marquee 40s linear infinite', width: 'max-content', whiteSpace: 'nowrap' }}>
                    {['PERFORMANCE FIRST', 'DESIGN AS CULTURE', 'PLANET MATTERS', 'COMMUNITY FIRST', 'NO COMPROMISES', 'SINCE 2018', 'BUILT FOR THE RELENTLESS'].flatMap((t, i, a) => [
                        <span key={`t${i}`} style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 13, letterSpacing: '0.28em', color: 'rgba(255,255,255,0.15)', paddingLeft: 40 }}>{t}</span>,
                        <span key={`d${i}`} style={{ color: 'var(--red)', fontSize: 8, paddingLeft: 20, paddingRight: 8 }}>◆</span>
                    ])}
                    {['PERFORMANCE FIRST', 'DESIGN AS CULTURE', 'PLANET MATTERS', 'COMMUNITY FIRST', 'NO COMPROMISES', 'SINCE 2018', 'BUILT FOR THE RELENTLESS'].flatMap((t, i) => [
                        <span key={`t2${i}`} style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 13, letterSpacing: '0.28em', color: 'rgba(255,255,255,0.15)', paddingLeft: 40 }}>{t}</span>,
                        <span key={`d2${i}`} style={{ color: 'var(--red)', fontSize: 8, paddingLeft: 20, paddingRight: 8 }}>◆</span>
                    ])}
                </div>
            </div>

            {/* ── VALUES ───────────────────────────────── */}
            <section style={{ background: '#080808', padding: `${isMobile ? 64 : 100}px ${px}px` }}>
                <div ref={valRef} style={{ maxWidth: 1400, margin: '0 auto' }}>
                    <div className={`reveal${valInView ? ' revealed' : ''}`} style={{ textAlign: 'center', marginBottom: isMobile ? 40 : 60 }}>
                        <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 9, letterSpacing: '0.36em', color: 'var(--red)', marginBottom: 14 }}>WHAT WE STAND FOR</div>
                        <h2 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: isMobile ? 'clamp(38px,10vw,56px)' : 'clamp(48px,5vw,80px)', color: 'white', lineHeight: 0.92, letterSpacing: '0.02em' }}>
                            OUR<br /><span style={{ WebkitTextStroke: '1px rgba(255,255,255,0.25)', color: 'transparent' }}>VALUES.</span>
                        </h2>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : isTablet ? '1fr 1fr' : '1fr 1fr 1fr 1fr', gap: isMobile ? 14 : 20 }}>
                        {VALUES.map((v, i) => <ValueCard key={v.title} v={v} inView={valInView} delay={i * 90} />)}
                    </div>
                </div>
            </section>

            {/* ── TIMELINE ─────────────────────────────── */}
            <section style={{ background: '#050505', padding: `${isMobile ? 64 : 100}px ${px}px` }}>
                <div ref={tlRef} style={{ maxWidth: 900, margin: '0 auto' }}>
                    <div className={`reveal${tlInView ? ' revealed' : ''}`} style={{ textAlign: 'center', marginBottom: isMobile ? 48 : 72 }}>
                        <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 9, letterSpacing: '0.36em', color: 'var(--red)', marginBottom: 14 }}>OUR JOURNEY</div>
                        <h2 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: isMobile ? 'clamp(38px,10vw,56px)' : 'clamp(48px,5vw,80px)', color: 'white', lineHeight: 0.92, letterSpacing: '0.02em' }}>THE TIMELINE</h2>
                    </div>

                    <div style={{ position: 'relative' }}>
                        {/* Spine line */}
                        <div style={{ position: 'absolute', left: isMobile ? 16 : 28, top: 12, bottom: 12, width: 1, background: 'linear-gradient(to bottom, var(--red), rgba(255,34,0,0.1))', zIndex: 0 }} />

                        {TIMELINE.map((item, i) => (
                            <div key={item.year} className={`reveal${tlInView ? ' revealed' : ''}`}
                                style={{ transitionDelay: `${i * 90}ms`, display: 'flex', gap: isMobile ? 20 : 32, alignItems: 'flex-start', marginBottom: i < TIMELINE.length - 1 ? (isMobile ? 32 : 44) : 0, position: 'relative' }}>
                                {/* Node */}
                                <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1, marginTop: 6 }}>
                                    <div style={{ width: isMobile ? 32 : 56, height: isMobile ? 32 : 56, borderRadius: '50%', background: `${item.accent}15`, border: `2px solid ${item.accent}`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 20px ${item.accent}33`, flexShrink: 0 }}>
                                        <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: isMobile ? 10 : 13, color: item.accent, lineHeight: 1, textAlign: 'center' }}>{item.year.slice(2)}</span>
                                    </div>
                                </div>
                                {/* Content */}
                                <div style={{ flex: 1, paddingTop: isMobile ? 4 : 8, paddingBottom: i < TIMELINE.length - 1 ? (isMobile ? 0 : 12) : 0 }}>
                                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, flexWrap: 'wrap', marginBottom: 6 }}>
                                        <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 10, letterSpacing: '0.2em', color: item.accent }}>{item.year}</span>
                                        <h3 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: isMobile ? 22 : 30, color: 'white', letterSpacing: '0.04em', lineHeight: 1 }}>{item.event}</h3>
                                    </div>
                                    <p style={{ fontFamily: "'Barlow',sans-serif", fontSize: isMobile ? 13 : 15, color: 'rgba(255,255,255,0.46)', lineHeight: 1.75 }}>{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── STATS ────────────────────────────────── */}
            <section ref={statsRef} style={{ background: '#080808', padding: `${isMobile ? 56 : 80}px ${px}px` }}>
                <div style={{ maxWidth: 1400, margin: '0 auto' }}>
                    <div className={`reveal${statsInView ? ' revealed' : ''}`} style={{ textAlign: 'center', marginBottom: isMobile ? 40 : 60 }}>
                        <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 9, letterSpacing: '0.36em', color: 'var(--red)', marginBottom: 14 }}>BY THE NUMBERS</div>
                        <h2 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: isMobile ? 'clamp(38px,10vw,56px)' : 'clamp(48px,5vw,80px)', color: 'white', lineHeight: 0.92, letterSpacing: '0.02em' }}>
                            WHAT WE'VE<br /><span style={{ WebkitTextStroke: '1px rgba(255,255,255,0.25)', color: 'transparent' }}>BUILT.</span>
                        </h2>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${isMobile ? 2 : 4}, 1fr)`, gap: isMobile ? 32 : 0, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 3 }}>
                        {STATS.map((s, i) => (
                            <div key={s.label} style={{ padding: `${isMobile ? 32 : 52}px 24px`, borderRight: !isMobile && i < 3 ? '1px solid rgba(255,255,255,0.06)' : 'none', borderBottom: isMobile && i < 2 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
                                <StatBlock value={s.value} suffix={s.suffix} label={s.label} accent="var(--red)" inView={statsInView} delay={i * 120} />
                            </div>
                        ))}
                    </div>

                    {/* Supplemental stats grid */}
                    <div style={{ marginTop: 24, display: 'grid', gridTemplateColumns: `repeat(${isMobile ? 2 : 4}, 1fr)`, gap: isMobile ? 12 : 16 }}>
                        {BRAND_FEATURES.map(([icon, title, desc], i) => (
                            <div key={title} className={`reveal${statsInView ? ' revealed' : ''}`}
                                style={{ transitionDelay: `${i * 70}ms`, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 3, padding: isMobile ? '18px 16px' : '24px 20px' }}>
                                <div style={{ fontSize: isMobile ? 22 : 26, marginBottom: 8 }}>{icon}</div>
                                <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: isMobile ? 10 : 12, letterSpacing: '0.12em', color: 'rgba(255,255,255,0.7)', marginBottom: 4 }}>{title}</div>
                                <div style={{ fontFamily: "'Barlow',sans-serif", fontSize: isMobile ? 11 : 12, color: 'rgba(255,255,255,0.36)', lineHeight: 1.65 }}>{desc}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── TEAM ─────────────────────────────────── */}
            <section style={{ background: '#050505', padding: `${isMobile ? 64 : 100}px ${px}px` }}>
                <div ref={teamRef} style={{ maxWidth: 1400, margin: '0 auto' }}>
                    <div className={`reveal${teamInView ? ' revealed' : ''}`} style={{ textAlign: 'center', marginBottom: isMobile ? 40 : 56 }}>
                        <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 9, letterSpacing: '0.36em', color: 'var(--red)', marginBottom: 14 }}>THE PEOPLE</div>
                        <h2 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: isMobile ? 'clamp(38px,10vw,56px)' : 'clamp(48px,5vw,80px)', color: 'white', lineHeight: 0.92, letterSpacing: '0.02em' }}>MEET THE<br /><span style={{ color: 'var(--red)' }}>TEAM.</span></h2>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: isMobile ? 14 : 20 }}>
                        {TEAM.map((member, i) => <TeamCard key={member.name} member={member} inView={teamInView} delay={i * 90} />)}
                    </div>
                </div>
            </section>

            {/* ── MISSION STATEMENT (full width) ────────── */}
            <section style={{ background: '#080808', padding: `${isMobile ? 56 : 80}px ${px}px`, overflow: 'hidden' }}>
                <div style={{ maxWidth: 1400, margin: '0 auto' }}>
                    <div style={{ position: 'relative' }}>
                        <ParallaxText speed={-0.05}>
                            <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 'clamp(60px,9vw,130px)', color: 'rgba(255,255,255,0.04)', lineHeight: 0.88, letterSpacing: '0.02em', userSelect: 'none', pointerEvents: 'none', marginBottom: -20 }}>NO COMPROMISES</div>
                        </ParallaxText>
                        <div style={{ position: 'relative', zIndex: 1 }}>
                            <h2 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: isMobile ? 'clamp(36px,9vw,52px)' : 'clamp(44px,5.5vw,80px)', color: 'white', lineHeight: 0.95, letterSpacing: '0.02em', maxWidth: 700, marginBottom: 24 }}>
                                THE SHOE YOU WEAR<br />TELLS THE WORLD<br /><span style={{ color: 'var(--red)' }}>WHO YOU ARE.</span>
                            </h2>
                            <p style={{ fontFamily: "'Barlow',sans-serif", fontSize: isMobile ? 14 : 17, color: 'rgba(255,255,255,0.42)', maxWidth: 520, lineHeight: 1.9 }}>
                                We've spent seven years building a brand that earns its place on your feet. Not through marketing. Not through hype. Through the uncompromising pursuit of the best shoe we know how to make.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── CTA ──────────────────────────────────── */}
            <section ref={ctaRef} style={{ background: 'var(--red)', padding: `${isMobile ? 64 : 100}px ${px}px`, position: 'relative', overflow: 'hidden' }}>
                {/* Background pattern */}
                <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(0,0,0,0.06) 1px,transparent 1px),linear-gradient(90deg,rgba(0,0,0,0.06) 1px,transparent 1px)', backgroundSize: '32px 32px', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', top: '-30%', right: '-5%', width: 600, height: 600, background: 'radial-gradient(circle,rgba(255,255,255,0.08),transparent 60%)', borderRadius: '50%', pointerEvents: 'none' }} />

                <div style={{ maxWidth: 900, margin: '0 auto', position: 'relative', zIndex: 1 }}>
                    <div className={`reveal${ctaInView ? ' revealed' : ''}`} style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? 40 : 80, alignItems: 'center' }}>
                        <div>
                            <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 9, letterSpacing: '0.32em', color: 'rgba(255,255,255,0.6)', marginBottom: 14 }}>JOIN THE MOVEMENT</div>
                            <h2 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: isMobile ? 'clamp(44px,12vw,60px)' : 'clamp(52px,5.5vw,80px)', color: 'white', lineHeight: 0.92, letterSpacing: '0.02em', marginBottom: 18 }}>
                                BECOME<br />APEX<br />ELITE.
                            </h2>
                            <p style={{ fontFamily: "'Barlow',sans-serif", fontSize: isMobile ? 14 : 15, color: 'rgba(255,255,255,0.7)', lineHeight: 1.85, maxWidth: 380 }}>
                                Early access to drops. Exclusive collabs. Member-only events. A community of 200,000+ sneaker obsessives who take this as seriously as you do.
                            </p>
                        </div>
                        <div>
                            <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 10, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.6)', marginBottom: 16 }}>GET EARLY ACCESS</div>
                            {!joined ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                    <input type="email" placeholder="YOUR EMAIL ADDRESS" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && email.trim() && setJoined(true)}
                                        style={{ padding: '16px 20px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.25)', color: 'white', fontFamily: "'Barlow Condensed',sans-serif", fontSize: 13, letterSpacing: '0.08em', outline: 'none', borderRadius: 1, transition: 'border-color 0.2s' }}
                                        onFocus={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.6)'}
                                        onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'} />
                                    <button onClick={() => email.trim() && setJoined(true)}
                                        style={{ padding: '16px 32px', background: 'white', border: 'none', color: '#000', fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 13, letterSpacing: '0.2em', cursor: 'pointer', borderRadius: 1, transition: 'opacity 0.2s' }}
                                        onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
                                        onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                                        JOIN APEX ELITE →
                                    </button>
                                </div>
                            ) : (
                                <div style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.3)', padding: '22px 28px', display: 'flex', alignItems: 'center', gap: 14, borderRadius: 1 }}>
                                    <span style={{ fontSize: 22 }}>✓</span>
                                    <div>
                                        <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 18, color: 'white', letterSpacing: '0.06em' }}>WELCOME TO APEX ELITE.</div>
                                        <div style={{ fontFamily: "'Barlow',sans-serif", fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 3 }}>You'll hear from us before anyone else.</div>
                                    </div>
                                </div>
                            )}
                            <div style={{ display: 'flex', gap: 20, marginTop: 20 }}>
                                {['No spam', 'Early access', 'Cancel anytime'].map(t => (
                                    <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                        <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 10 }}>✓</span>
                                        <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 10, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.5)' }}>{t.toUpperCase()}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <style>{`
        @keyframes orbFloat { 0% { transform: translateY(0) scale(1); } 100% { transform: translateY(-32px) scale(1.06); } }
        @keyframes marquee  { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        @keyframes pulse    { 0%,100% { opacity: 0.4; } 50% { opacity: 1; } }
      `}</style>
        </div>
    );
}