import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

// ── Floating shoe silhouettes for background ─────────────────
const SHOES = [
    { top: '8%', left: '4%', size: 180, rotate: -18, delay: 0, opacity: 0.06 },
    { top: '12%', right: '3%', size: 220, rotate: 22, delay: 0.4, opacity: 0.05 },
    { top: '42%', left: '-2%', size: 150, rotate: -28, delay: 0.8, opacity: 0.07 },
    { top: '60%', right: '5%', size: 200, rotate: 15, delay: 0.2, opacity: 0.05 },
    { top: '78%', left: '8%', size: 140, rotate: -12, delay: 1.0, opacity: 0.06 },
    { top: '85%', right: '-2%', size: 190, rotate: 30, delay: 0.6, opacity: 0.04 },
    { top: '30%', left: '38%', size: 260, rotate: -8, delay: 0.3, opacity: 0.03 },
];

function ShoeSilhouette({ top, left, right, size, rotate, delay, opacity }) {
    return (
        <div style={{
            position: 'absolute', top, left, right,
            width: size, height: size * 0.6,
            opacity,
            transform: `rotate(${rotate}deg)`,
            animation: `floatSlow ${6 + delay * 2}s ease-in-out infinite`,
            animationDelay: `${delay}s`,
            pointerEvents: 'none',
        }}>
            {/* SVG shoe outline */}
            <svg viewBox="0 0 200 100" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
                <path d="M10 70 C10 70 20 40 50 35 C80 30 100 50 130 48 C160 46 185 55 190 65 C195 75 185 82 170 82 C100 82 30 82 20 80 C12 78 10 74 10 70Z" fill="white" />
                <path d="M50 35 C50 35 60 15 80 12 C95 10 110 20 120 30 C130 40 130 48 130 48" fill="white" />
                <path d="M80 12 C80 12 100 8 115 14 C125 18 128 25 128 32" fill="white" />
                <rect x="10" y="76" width="180" height="8" rx="4" fill="white" opacity="0.6" />
            </svg>
        </div>
    );
}

// ── Google icon ───────────────────────────────────────────────
function GoogleIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
        </svg>
    );
}

export default function AuthPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const { login, signup, isLoggedIn } = useAuth();
    const addToast = useToast();

    // Determine initial mode from URL param
    const initialMode = new URLSearchParams(location.search).get('mode') === 'login' ? 'login' : 'signup';
    const [mode, setMode] = useState(initialMode);

    // Form state
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [focused, setFocused] = useState(null);

    // Redirect if already logged in
    useEffect(() => {
        if (isLoggedIn) navigate('/profile');
    }, [isLoggedIn, navigate]);

    // Update mode when URL changes
    useEffect(() => {
        const m = new URLSearchParams(location.search).get('mode');
        setMode(m === 'login' ? 'login' : 'signup');
        setErrors({});
        setName(''); setEmail(''); setPassword('');
    }, [location.search]);

    const validate = () => {
        const errs = {};
        if (mode === 'signup' && !name.trim()) errs.name = 'Name is required';
        if (!email.includes('@')) errs.email = 'Enter a valid email';
        if (password.length < 6) errs.password = 'Password must be 6+ characters';
        return errs;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length) { setErrors(errs); return; }
        setLoading(true);
        await new Promise(r => setTimeout(r, 900)); // simulate API
        if (mode === 'login') {
            login({ name: email.split('@')[0], email });
            addToast('success', 'Welcome back!', `Signed in as ${email}`);
        } else {
            signup({ name, email });
            addToast('success', `Welcome, ${name}!`, 'Your account has been created');
        }
        setLoading(false);
        navigate('/profile');
    };

    const handleGoogle = async () => {
        setLoading(true);
        await new Promise(r => setTimeout(r, 800));
        const mockName = 'Alex Runner';
        const mockEmail = 'alex@gmail.com';
        mode === 'login' ? login({ name: mockName, email: mockEmail }) : signup({ name: mockName, email: mockEmail });
        addToast('success', `Welcome, ${mockName}!`, 'Signed in with Google');
        setLoading(false);
        navigate('/profile');
    };

    const isLogin = mode === 'login';

    return (
        <div style={{ minHeight: '100vh', display: 'flex', background: '#060606', position: 'relative', overflow: 'hidden' }}>

            {/* ── Animated background ── */}
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
                {/* Red gradient orbs */}
                <div style={{ position: 'absolute', top: '-10%', left: '-5%', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle,rgba(255,34,0,0.18) 0%,transparent 65%)', animation: 'breathe 8s ease-in-out infinite' }} />
                <div style={{ position: 'absolute', bottom: '-15%', right: '-8%', width: 700, height: 700, borderRadius: '50%', background: 'radial-gradient(circle,rgba(255,34,0,0.10) 0%,transparent 60%)', animation: 'breathe 10s ease-in-out infinite', animationDelay: '3s' }} />
                <div style={{ position: 'absolute', top: '40%', left: '30%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle,rgba(255,100,0,0.06) 0%,transparent 70%)' }} />
                {/* Floating shoes */}
                {SHOES.map((s, i) => <ShoeSilhouette key={i} {...s} />)}
                {/* Grid lines */}
                <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.025) 1px,transparent 1px)', backgroundSize: '80px 80px' }} />
                {/* Bottom fade */}
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 200, background: 'linear-gradient(transparent,rgba(6,6,6,0.8))' }} />
            </div>

            {/* ── Left panel (desktop only) ── */}
            <div style={{ display: 'none', flex: 1, flexDirection: 'column', justifyContent: 'center', padding: '80px 64px', position: 'relative', zIndex: 1 }} className="auth-left-panel">
                <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', marginBottom: 72 }}>
                    <div style={{ width: 36, height: 36, background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <img src="/hero-img.png" alt="logo" />
                    </div>
                    <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 26, letterSpacing: '0.14em', color: 'white' }}>APEX KICKS</span>
                </a>
                <div style={{ maxWidth: 440 }}>
                    <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 11, letterSpacing: '0.25em', color: 'var(--red)', marginBottom: 20 }}>
                        {isLogin ? 'WELCOME BACK' : 'JOIN THE MOVEMENT'}
                    </div>
                    <h1 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 'clamp(52px,6vw,88px)', letterSpacing: '0.02em', lineHeight: 0.92, color: 'white', marginBottom: 28 }}>
                        {isLogin ? <>THE WORLD'S<br /><span style={{ color: 'var(--red)' }}>MOST WANTED</span><br />KICKS.</>
                            : <>STEP INTO<br /><span style={{ color: 'var(--red)' }}>THE FUTURE</span><br />OF STYLE.</>}
                    </h1>
                    <p style={{ fontFamily: "'Barlow',sans-serif", fontSize: 16, color: 'rgba(255,255,255,0.45)', lineHeight: 1.8, marginBottom: 48 }}>
                        {isLogin
                            ? 'Sign in to access your wishlist, order history, and exclusive member drops.'
                            : 'Create your APEX account for early access to drops, exclusive collabs, and a community of 50,000+ sneaker obsessives.'}
                    </p>
                    {/* Stats row */}
                    <div style={{ display: 'flex', gap: 40 }}>
                        {[['50K+', 'MEMBERS'], ['200+', 'STYLES'], ['72H', 'DELIVERY']].map(([n, l]) => (
                            <div key={l}>
                                <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 32, color: 'white', lineHeight: 1 }}>{n}</div>
                                <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 9, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.35)', marginTop: 3 }}>{l}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Right panel — form ── */}
            <div style={{ width: '100%', maxWidth: 520, margin: '0 auto', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 'clamp(80px,10vh,120px) clamp(24px,5vw,56px)', position: 'relative', zIndex: 2 }}>

                {/* Logo — mobile only */}
                <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', marginBottom: 40 }}>
                    <div style={{ width: 30, height: 30, background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <img src="/hero-img.png" alt="logo" />
                    </div>
                    <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 20, letterSpacing: '0.14em', color: 'white' }}>APEX KICKS</span>
                </a>

                {/* Card */}
                <div style={{ background: 'rgba(14,14,14,0.92)', backdropFilter: 'blur(32px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 6, padding: 'clamp(28px,4vw,44px)', boxShadow: '0 32px 80px rgba(0,0,0,0.6)' }}>

                    {/* Mode toggle tabs */}
                    <div style={{ display: 'flex', gap: 0, marginBottom: 36, background: 'rgba(255,255,255,0.04)', borderRadius: 4, padding: 4 }}>
                        {[['signup', 'CREATE ACCOUNT'], ['login', 'SIGN IN']].map(([m, label]) => (
                            <button key={m} onClick={() => navigate(`/auth?mode=${m}`)}
                                style={{ flex: 1, padding: '10px 0', fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 11, letterSpacing: '0.15em', border: 'none', cursor: 'pointer', borderRadius: 3, transition: 'all 0.2s', background: mode === m ? 'var(--red)' : 'transparent', color: mode === m ? 'white' : 'rgba(255,255,255,0.35)' }}>
                                {label}
                            </button>
                        ))}
                    </div>

                    {/* Headline */}
                    <div style={{ marginBottom: 28 }}>
                        <h2 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 32, letterSpacing: '0.03em', color: 'white', lineHeight: 1, marginBottom: 6 }}>
                            {isLogin ? 'WELCOME BACK' : 'JOIN APEX KICKS'}
                        </h2>
                        <p style={{ fontFamily: "'Barlow',sans-serif", fontSize: 13, color: 'rgba(255,255,255,0.38)' }}>
                            {isLogin ? 'Sign in to your account to continue.' : 'Create your account — it takes 30 seconds.'}
                        </p>
                    </div>

                    {/* Google button */}
                    <button onClick={handleGoogle} disabled={loading}
                        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '13px 20px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 4, cursor: loading ? 'not-allowed' : 'pointer', transition: 'all 0.2s', marginBottom: 20 }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.22)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; }}>
                        <GoogleIcon />
                        <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 600, fontSize: 13, letterSpacing: '0.08em', color: 'rgba(255,255,255,0.8)' }}>
                            {isLogin ? 'CONTINUE WITH GOOGLE' : 'SIGN UP WITH GOOGLE'}
                        </span>
                    </button>

                    {/* Divider */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                        <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
                        <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 10, letterSpacing: '0.15em', color: 'rgba(255,255,255,0.25)' }}>OR</span>
                        <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

                        {/* Name — signup only */}
                        {!isLogin && (
                            <div>
                                <label style={{ display: 'block', fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 9, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.4)', marginBottom: 6 }}>FULL NAME</label>
                                <input
                                    type="text" value={name} onChange={e => { setName(e.target.value); setErrors(p => ({ ...p, name: '' })); }}
                                    placeholder="Alex Runner"
                                    onFocus={() => setFocused('name')} onBlur={() => setFocused(null)}
                                    style={{ width: '100%', padding: '13px 16px', background: 'rgba(255,255,255,0.05)', border: `1px solid ${errors.name ? 'var(--red)' : focused === 'name' ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.09)'}`, borderRadius: 4, color: 'white', fontFamily: "'Barlow',sans-serif", fontSize: 14, outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box' }}
                                />
                                {errors.name && <div style={{ fontFamily: "'Barlow',sans-serif", fontSize: 11, color: 'var(--red)', marginTop: 4 }}>{errors.name}</div>}
                            </div>
                        )}

                        {/* Email */}
                        <div>
                            <label style={{ display: 'block', fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 9, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.4)', marginBottom: 6 }}>EMAIL ADDRESS</label>
                            <input
                                type="email" value={email} onChange={e => { setEmail(e.target.value); setErrors(p => ({ ...p, email: '' })); }}
                                placeholder="you@email.com"
                                onFocus={() => setFocused('email')} onBlur={() => setFocused(null)}
                                style={{ width: '100%', padding: '13px 16px', background: 'rgba(255,255,255,0.05)', border: `1px solid ${errors.email ? 'var(--red)' : focused === 'email' ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.09)'}`, borderRadius: 4, color: 'white', fontFamily: "'Barlow',sans-serif", fontSize: 14, outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box' }}
                            />
                            {errors.email && <div style={{ fontFamily: "'Barlow',sans-serif", fontSize: 11, color: 'var(--red)', marginTop: 4 }}>{errors.email}</div>}
                        </div>

                        {/* Password */}
                        <div>
                            <label style={{ display: 'block', fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 9, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.4)', marginBottom: 6 }}>PASSWORD</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type={showPass ? 'text' : 'password'} value={password}
                                    onChange={e => { setPassword(e.target.value); setErrors(p => ({ ...p, password: '' })); }}
                                    placeholder="6+ characters"
                                    onFocus={() => setFocused('password')} onBlur={() => setFocused(null)}
                                    style={{ width: '100%', padding: '13px 46px 13px 16px', background: 'rgba(255,255,255,0.05)', border: `1px solid ${errors.password ? 'var(--red)' : focused === 'password' ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.09)'}`, borderRadius: 4, color: 'white', fontFamily: "'Barlow',sans-serif", fontSize: 14, outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box' }}
                                />
                                <button type="button" onClick={() => setShowPass(p => !p)}
                                    style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: 'rgba(255,255,255,0.35)' }}>
                                    {showPass
                                        ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" /><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                                        : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                                    }
                                </button>
                            </div>
                            {errors.password && <div style={{ fontFamily: "'Barlow',sans-serif", fontSize: 11, color: 'var(--red)', marginTop: 4 }}>{errors.password}</div>}
                        </div>

                        {/* Forgot password */}
                        {isLogin && (
                            <div style={{ textAlign: 'right', marginTop: -6 }}>
                                <button type="button" style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'Barlow Condensed',sans-serif", fontSize: 11, letterSpacing: '0.08em', color: 'rgba(255,255,255,0.35)', textDecoration: 'underline' }}>
                                    Forgot password?
                                </button>
                            </div>
                        )}

                        {/* Submit */}
                        <button type="submit" disabled={loading}
                            className="btn-primary"
                            style={{ width: '100%', padding: '15px', fontSize: 14, marginTop: 6, opacity: loading ? 0.7 : 1, transition: 'opacity 0.2s, background 0.3s', position: 'relative', overflow: 'hidden' }}>
                            {loading
                                ? <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                                    <span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
                                    {isLogin ? 'SIGNING IN...' : 'CREATING ACCOUNT...'}
                                </span>
                                : isLogin ? 'SIGN IN →' : 'CREATE ACCOUNT →'}
                        </button>
                    </form>

                    {/* Switch mode */}
                    <div style={{ textAlign: 'center', marginTop: 24, fontFamily: "'Barlow',sans-serif", fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>
                        {isLogin ? "Don't have an account? " : 'Already have an account? '}
                        <button onClick={() => navigate(`/auth?mode=${isLogin ? 'signup' : 'login'}`)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--red)', fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 13, letterSpacing: '0.06em', textDecoration: 'underline' }}>
                            {isLogin ? 'Create one' : 'Sign in'}
                        </button>
                    </div>

                    {/* Terms */}
                    {!isLogin && (
                        <p style={{ textAlign: 'center', marginTop: 18, fontFamily: "'Barlow',sans-serif", fontSize: 10, color: 'rgba(255,255,255,0.2)', lineHeight: 1.6 }}>
                            By creating an account you agree to our{' '}
                            <span style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'underline', cursor: 'pointer' }}>Terms</span> and{' '}
                            <span style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'underline', cursor: 'pointer' }}>Privacy Policy</span>.
                        </p>
                    )}
                </div>
            </div>

            <style>{`
        @keyframes floatSlow {
          0%, 100% { transform: translateY(0px) rotate(var(--r, 0deg)); }
          50% { transform: translateY(-18px) rotate(var(--r, 0deg)); }
        }
        @keyframes breathe {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.08); opacity: 0.7; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @media (min-width: 900px) {
          .auth-left-panel { display: flex !important; }
        }
      `}</style>
        </div>
    );
}