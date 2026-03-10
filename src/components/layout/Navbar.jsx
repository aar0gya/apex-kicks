// apex-kicks/src/components/layout/Navbar.jsx
import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { NavLink, useNavigate } from 'react-router-dom';
import { useClerk, useSignIn } from '@clerk/clerk-react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';
import useBreakpoint from '../../hooks/useBreakPoint';
import SearchOverlay from '../ui/SearchOverlay';

// ─── Portal setup ─────────────────────────────────────────────
// Render dropdown entirely into document.body so ZERO ancestor
// CSS rules (max-width, color, overflow, cursor…) can touch it.
function getPortal() {
    if (typeof document === 'undefined') return null;
    let el = document.getElementById('apex-drop-root');
    if (!el) {
        el = document.createElement('div');
        el.id = 'apex-drop-root';
        // size 0 fixed layer — overflow:visible lets children paint anywhere
        el.style.cssText =
            'position:fixed;top:0;left:0;width:0;height:0;overflow:visible;z-index:9990;pointer-events:none;';
        document.body.appendChild(el);
    }
    return el;
}

// Inject a <style> block ONCE. These rules exist only on .apxd-* classes
// scoped inside #apex-drop-root so they never conflict with the app.
const PORTAL_CSS = `
  #apex-drop-root * { box-sizing:border-box; }
  .apxd-shell { pointer-events:all; }
  .apxd-row {
    width:100%; display:flex; align-items:center; border:none; text-align:left;
    cursor:pointer; background:transparent; transition:background 0.13s;
    gap:0; padding:0; margin:0;
  }
  .apxd-row:hover        { background:rgba(255,255,255,0.07); }
  .apxd-row.apxd-danger:hover { background:rgba(255,34,0,0.11); }
  .apxd-saved-row        { display:flex; align-items:center; transition:background 0.13s; }
  .apxd-saved-row:hover  { background:rgba(255,255,255,0.06); }
  .apxd-trash            { cursor:pointer; color:rgba(255,255,255,0.22); transition:color 0.14s; }
  .apxd-trash:hover      { color:rgba(255,60,40,0.9) !important; }
  .apxd-add-row          { cursor:pointer; width:100%; display:flex; align-items:center; border:none; text-align:left; background:transparent; transition:background 0.13s; }
  .apxd-add-row:hover    { background:rgba(255,255,255,0.06); }
  .apxd-backbtn          { cursor:pointer; transition:background 0.14s,color 0.14s; }
  .apxd-backbtn:hover    { background:rgba(255,255,255,0.14) !important; color:white !important; }
`;
if (typeof document !== 'undefined' && !document.getElementById('apex-drop-css')) {
    const s = document.createElement('style');
    s.id = 'apex-drop-css';
    s.textContent = PORTAL_CSS;
    document.head.appendChild(s);
}

// ── Navbar global CSS injected once ──────────────────────────────────
const NAVBAR_CSS = [
    `.apx-nav-link {`,
    `  position:relative; display:inline-flex; align-items:center;`,
    `  padding:6px 13px;`,
    `  font-family:'Barlow Condensed',sans-serif; font-weight:700; font-size:12px; letter-spacing:0.16em;`,
    `  color:rgba(245,243,238,0.48); text-decoration:none; cursor:pointer;`,
    `  border-radius:3px; transition:color 0.22s ease; overflow:hidden; white-space:nowrap;`,
    `}`,
    `.apx-nav-link::after {`,
    `  content:''; position:absolute; bottom:2px; left:13px; right:13px; height:1.5px;`,
    `  background:#FF2200; transform:scaleX(0); transform-origin:left center;`,
    `  transition:transform 0.28s cubic-bezier(0.23,1,0.32,1); border-radius:1px;`,
    `}`,
    `.apx-nav-link:hover { color:rgba(245,243,238,0.9); }`,
    `.apx-nav-link:hover::after { transform:scaleX(1); }`,
    `.apx-nav-link.active { color:#F5F3EE; }`,
    `.apx-nav-link.active::after { transform:scaleX(1); }`,
    `.apx-icon-btn {`,
    `  position:relative; background:none; border:none; cursor:pointer;`,
    `  display:flex; align-items:center; justify-content:center;`,
    `  border-radius:6px; padding:8px;`,
    `  transition:color 0.18s, background 0.2s, transform 0.18s;`,
    `}`,
    `.apx-icon-btn:hover { background:rgba(255,255,255,0.07); transform:translateY(-1px); }`,
    `.apx-icon-btn:active { transform:scale(0.92) !important; }`,
    `@keyframes apx-blink { 0%,100%{opacity:1} 50%{opacity:0.4} }`,
].join('\n');
if (typeof document !== 'undefined' && !document.getElementById('apex-nav-css')) {
    const ns = document.createElement('style');
    ns.id = 'apex-nav-css';
    ns.textContent = NAVBAR_CSS;
    document.head.appendChild(ns);
}

// ─── localStorage helpers ─────────────────────────────────────
const ACCT_KEY = 'apex_saved_accounts';
const getSaved = () => { try { return JSON.parse(localStorage.getItem(ACCT_KEY) || '[]'); } catch { return []; } };
const upsertAcct = (u) => {
    if (!u?.id) return;
    const list = getSaved(), idx = list.findIndex(a => a.id === u.id);
    const e = { id: u.id, name: u.name, email: u.email, avatar: u.avatar || null };
    if (idx >= 0) list[idx] = e; else list.push(e);
    localStorage.setItem(ACCT_KEY, JSON.stringify(list));
};
const forgetAcct = (id) =>
    localStorage.setItem(ACCT_KEY, JSON.stringify(getSaved().filter(a => a.id !== id)));

// ─── Nav routes ───────────────────────────────────────────────
const NAV_ROUTES = [
    { label: 'COLLECTION', path: '/collection' },
    { label: 'DROPS', path: '/drops' },
    { label: 'COLLAB', path: '/collab' },
    { label: 'STORIES', path: '/stories' },
    { label: 'ABOUT', path: '/about' },
];

// ─── Design tokens ────────────────────────────────────────────
const T = {
    BEBAS: "'Bebas Neue', sans-serif",
    BARLOWC: "'Barlow Condensed', sans-serif",
    BARLOW: "'Barlow', sans-serif",
    RED: '#FF2200',
    BG: '#121212',
    BORDER: 'rgba(255,255,255,0.11)',
    TEXT: '#F5F3EE',
    MUTED: 'rgba(255,255,255,0.42)',
    DIM: 'rgba(255,255,255,0.28)',
};

// ─── Icons ────────────────────────────────────────────────────
const Ico = ({ s = 16, color = 'currentColor', ch }) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none"
        stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        style={{ display: 'block', flexShrink: 0 }}>
        {ch}
    </svg>
);
const IcoSearch = ({ s = 18, color = 'currentColor' }) => <Ico s={s} color={color} ch={<><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></>} />;
const IcoHeart = ({ s = 18, filled = false, color = 'currentColor' }) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill={filled ? color : 'none'} stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block', flexShrink: 0 }}>
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
);
const IcoBag = ({ s = 18, color = 'currentColor' }) => <Ico s={s} color={color} ch={<><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" /></>} />;
const IcoChevD = ({ s = 10 }) => <Ico s={s} ch={<polyline points="6 9 12 15 18 9" />} />;
const IcoChevL = ({ s = 11 }) => <Ico s={s} ch={<polyline points="15 18 9 12 15 6" />} />;
const IcoChevR = ({ s = 12 }) => <Ico s={s} ch={<polyline points="9 18 15 12 9 6" />} />;
const IcoUser = ({ s = 16 }) => <Ico s={s} ch={<><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></>} />;
const IcoOrders = ({ s = 16 }) => <Ico s={s} ch={<><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></>} />;
const IcoWish = ({ s = 16 }) => <Ico s={s} ch={<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />} />;
const IcoSwitch = ({ s = 16 }) => <Ico s={s} ch={<><path d="M17 1l4 4-4 4" /><path d="M3 11V9a4 4 0 0 1 4-4h14" /><path d="M7 23l-4-4 4-4" /><path d="M21 13v2a4 4 0 0 1-4 4H3" /></>} />;
const IcoSignOut = ({ s = 16 }) => <Ico s={s} ch={<><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></>} />;
const IcoTrash = ({ s = 15 }) => <Ico s={s} ch={<><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4h6v2" /></>} />;
const IcoCheck = ({ s = 11 }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block', flexShrink: 0 }}><polyline points="20 6 9 17 4 12" /></svg>;
const IcoPlus = ({ s = 14 }) => <Ico s={s} ch={<><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></>} />;
const IcoAdmin = ({ s = 16 }) => <Ico s={s} ch={<><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></>} />;

// Deterministic hue per account id
const acctGrad = (id = '') => {
    let h = 0; for (const c of id) h = (h * 31 + c.charCodeAt(0)) % 360;
    return `linear-gradient(135deg,hsl(${h},55%,40%),hsl(${(h + 60) % 360},50%,28%))`;
};

// ─── Avatar ───────────────────────────────────────────────────
function Ava({ user, d = 36, fs = 13, grad }) {
    const [err, setErr] = useState(false);
    const txt = (user?.name || user?.email || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
    return (
        <div style={{
            width: d, height: d, minWidth: d, minHeight: d, borderRadius: '50%', flexShrink: 0,
            background: grad || 'linear-gradient(135deg,#FF2200,#ff6b00)',
            overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
            {user?.avatar && !err
                ? <img src={user.avatar} alt="" onError={() => setErr(true)} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                : <span style={{ fontFamily: T.BEBAS, fontSize: fs, color: 'white', lineHeight: 1, display: 'block' }}>{txt}</span>}
        </div>
    );
}

// ─────────────────────────────────────────────────────────────
// Row — every single style is INLINE so nothing from the app's
// CSS cascade can interfere.  className is only used for hover.
// ─────────────────────────────────────────────────────────────
function Row({ icon, label, sub, right, danger = false, onClick, py = 12, px = 16 }) {
    return (
        <button
            onClick={onClick}
            className={`apxd-row${danger ? ' apxd-danger' : ''}`}
            style={{
                // Explicit dimensions — nothing can shrink this
                width: '100%',
                padding: `${py}px ${px}px`,
                gap: 12,
                display: 'flex',
                alignItems: 'center',
                color: danger ? '#ff6644' : T.TEXT,
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
            }}>
            {/* Icon slot — fixed 20×20 box so it never compresses */}
            {icon && (
                <span style={{
                    width: 20, height: 20, minWidth: 20, minHeight: 20, flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: danger ? 'rgba(255,100,68,0.9)' : 'rgba(255,255,255,0.52)',
                }}>
                    {icon}
                </span>
            )}

            {/* Text block — flex:1 but with explicit overflow clip */}
            <span style={{
                flex: 1,
                // Do NOT set minWidth:0 here — that causes the flex child
                // to collapse its intrinsic size. Instead rely on overflow.
                overflow: 'hidden',
                display: 'block',
            }}>
                <span style={{
                    display: 'block',
                    fontFamily: T.BARLOWC,
                    fontWeight: 700,
                    fontSize: 13,
                    lineHeight: '18px',
                    letterSpacing: '0.09em',
                    color: danger ? '#ff6644' : T.TEXT,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                }}>
                    {label}
                </span>
                {sub && (
                    <span style={{
                        display: 'block',
                        fontFamily: T.BARLOW,
                        fontSize: 11,
                        lineHeight: '15px',
                        color: T.DIM,
                        marginTop: 2,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                    }}>
                        {sub}
                    </span>
                )}
            </span>

            {/* Right slot */}
            {right && (
                <span style={{ flexShrink: 0, display: 'flex', alignItems: 'center', color: 'rgba(255,255,255,0.32)' }}>
                    {right}
                </span>
            )}
        </button>
    );
}

const HR = () => <div style={{ height: 1, background: 'rgba(255,255,255,0.08)', margin: '3px 0' }} />;

function BackBtn({ onClick }) {
    return (
        <button onClick={onClick} className="apxd-backbtn"
            style={{
                width: 28, height: 28, minWidth: 28, flexShrink: 0,
                borderRadius: '50%', border: '1px solid rgba(255,255,255,0.15)',
                background: 'rgba(255,255,255,0.07)',
                color: 'rgba(255,255,255,0.6)',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
            <IcoChevL s={11} />
        </button>
    );
}

// ─────────────────────────────────────────────────────────────
// MAIN PANEL
// ─────────────────────────────────────────────────────────────
function MainPanel({ user, others, onNav, onClose, onGoSwitch, onSignOut, isAdmin = false }) {
    return (
        <div style={{ width: '100%', color: T.TEXT }}>

            {/* ── User header ───────────────────────── */}
            <div style={{
                padding: '16px 18px 14px',
                background: 'linear-gradient(135deg,rgba(255,34,0,0.07) 0%,rgba(255,34,0,0.02) 100%)',
                borderBottom: '1px solid rgba(255,255,255,0.09)',
                display: 'flex', alignItems: 'center', gap: 13,
            }}>
                <Ava user={user} d={42} fs={16} />

                <div style={{ flex: 1, overflow: 'hidden', minWidth: 0 }}>
                    <div style={{
                        fontFamily: T.BARLOWC, fontWeight: 700,
                        fontSize: 15, lineHeight: '20px', letterSpacing: '0.05em',
                        color: 'white',
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>
                        {user?.name || 'APEX USER'}
                    </div>
                    <div style={{
                        fontFamily: T.BARLOW, fontSize: 11, lineHeight: '16px',
                        color: 'rgba(255,255,255,0.48)',
                        marginTop: 3,
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>
                        {user?.email}
                    </div>
                </div>

                {/* Active badge */}
                <div style={{
                    display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0,
                    background: 'rgba(34,197,94,0.11)',
                    border: '1px solid rgba(34,197,94,0.30)',
                    padding: '3px 9px', borderRadius: 10,
                }}>
                    <div style={{
                        width: 6, height: 6, minWidth: 6, borderRadius: '50%',
                        background: '#22C55E', boxShadow: '0 0 7px #22C55E',
                    }} />
                    <span style={{
                        fontFamily: T.BARLOWC, fontWeight: 700,
                        fontSize: 9, letterSpacing: '0.16em', color: '#22C55E',
                    }}>ACTIVE</span>
                </div>
            </div>

            {/* ── Nav rows ──────────────────────────── */}
            <div style={{ paddingTop: 5 }}>
                <Row icon={<IcoUser />} label="MY PROFILE" sub="Account overview" py={11} px={18} onClick={() => { onNav('/profile'); onClose(); }} />
                <Row icon={<IcoOrders />} label="ORDER HISTORY" sub="Track your orders" py={11} px={18} onClick={() => { onNav('/profile'); onClose(); }} />
                <Row icon={<IcoWish />} label="WISHLIST" sub="Saved items" py={11} px={18} onClick={() => { onNav('/wishlist'); onClose(); }} />
                {isAdmin && (
                    <>
                        <div style={{ height: 1, background: 'rgba(255,34,0,0.22)', margin: '3px 16px' }} />
                        <Row
                            icon={<IcoAdmin />}
                            label="ADMIN DASHBOARD"
                            sub="Orders · Customers · Analytics"
                            py={11} px={18}
                            onClick={() => { onNav('/admin'); onClose(); }}
                            right={
                                <span style={{
                                    fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 8,
                                    letterSpacing: '0.18em', color: '#FF2200', background: 'rgba(255,34,0,0.13)',
                                    border: '1px solid rgba(255,34,0,0.32)', padding: '2px 6px', borderRadius: 2
                                }}>ADMIN</span>
                            }
                        />
                    </>
                )}
            </div>

            <HR />

            <Row
                icon={<IcoSwitch />}
                label="SWITCH ACCOUNT"
                sub={others.length > 0
                    ? `${others.length} saved account${others.length !== 1 ? 's' : ''}`
                    : 'Add another account'}
                right={<IcoChevR s={12} />}
                py={11} px={18}
                onClick={onGoSwitch}
            />

            <HR />

            <div style={{ paddingBottom: 5 }}>
                <Row icon={<IcoSignOut />} label="SIGN OUT" danger py={11} px={18} onClick={onSignOut} />
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────
// SWITCH PANEL
// ─────────────────────────────────────────────────────────────
function SwitchPanel({ user, others, switching, onBack, onSwitch, onRemove, onAdd }) {
    return (
        <div style={{ width: '100%', color: T.TEXT }}>

            {/* Header */}
            <div style={{
                display: 'flex', alignItems: 'center', gap: 11,
                padding: '13px 18px',
                borderBottom: '1px solid rgba(255,255,255,0.09)',
            }}>
                <BackBtn onClick={onBack} />
                <span style={{
                    fontFamily: T.BARLOWC, fontWeight: 700,
                    fontSize: 11, letterSpacing: '0.22em',
                    color: 'rgba(255,255,255,0.55)',
                }}>SWITCH ACCOUNT</span>
            </div>

            {/* Current account (read-only) */}
            <div style={{
                display: 'flex', alignItems: 'center', gap: 13,
                padding: '12px 18px',
                borderBottom: '1px solid rgba(255,255,255,0.07)',
            }}>
                <Ava user={user} d={36} fs={13} />
                <div style={{ flex: 1, overflow: 'hidden', minWidth: 0 }}>
                    <div style={{
                        fontFamily: T.BARLOWC, fontWeight: 700,
                        fontSize: 13, lineHeight: '18px',
                        color: 'white',
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>{user?.name}</div>
                    <div style={{
                        fontFamily: T.BARLOW, fontSize: 11, lineHeight: '16px',
                        color: 'rgba(255,255,255,0.44)', marginTop: 2,
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>{user?.email}</div>
                </div>
                <div style={{
                    width: 22, height: 22, minWidth: 22, borderRadius: '50%', flexShrink: 0,
                    background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.42)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    <IcoCheck s={11} />
                </div>
            </div>

            {/* Other saved accounts */}
            {others.length > 0 && (
                <div>
                    <div style={{
                        padding: '8px 18px 4px',
                        fontFamily: T.BARLOWC, fontWeight: 700,
                        fontSize: 9, letterSpacing: '0.24em',
                        color: 'rgba(255,255,255,0.32)',
                    }}>OTHER ACCOUNTS</div>

                    {others.map(acc => (
                        <div key={acc.id} className="apxd-saved-row">
                            {/* Click to switch */}
                            <button
                                onClick={() => onSwitch(acc)}
                                disabled={!!switching}
                                style={{
                                    flex: 1, minWidth: 0,
                                    display: 'flex', alignItems: 'center', gap: 12,
                                    padding: '10px 0 10px 18px',
                                    background: 'none', border: 'none',
                                    cursor: switching ? 'wait' : 'pointer',
                                    textAlign: 'left', overflow: 'hidden',
                                }}>
                                <Ava user={acc} d={34} fs={12} grad={acctGrad(acc.id)} />
                                <div style={{ flex: 1, overflow: 'hidden', minWidth: 0 }}>
                                    <div style={{
                                        fontFamily: T.BARLOWC, fontWeight: 700,
                                        fontSize: 13, lineHeight: '18px',
                                        color: switching === acc.id ? 'rgba(255,255,255,0.42)' : 'rgba(255,255,255,0.9)',
                                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                                    }}>
                                        {switching === acc.id ? 'SWITCHING…' : acc.name}
                                    </div>
                                    <div style={{
                                        fontFamily: T.BARLOW, fontSize: 11, lineHeight: '15px',
                                        color: 'rgba(255,255,255,0.4)', marginTop: 2,
                                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                                    }}>{acc.email}</div>
                                </div>
                            </button>

                            {/* Remove button */}
                            <button
                                onClick={e => onRemove(e, acc.id)}
                                className="apxd-trash"
                                style={{
                                    width: 36, height: 36, minWidth: 36, flexShrink: 0,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    background: 'none', border: 'none',
                                    cursor: 'pointer', marginRight: 10, borderRadius: 4,
                                }}>
                                <IcoTrash s={14} />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <HR />

            {/* Add account */}
            <div style={{ paddingBottom: 5 }}>
                <button onClick={onAdd} className="apxd-add-row"
                    style={{
                        width: '100%',
                        display: 'flex', alignItems: 'center', gap: 13,
                        padding: '11px 18px',
                        background: 'transparent', border: 'none',
                        cursor: 'pointer', textAlign: 'left',
                    }}>
                    <div style={{
                        width: 34, height: 34, minWidth: 34, flexShrink: 0, borderRadius: '50%',
                        border: '1.5px dashed rgba(255,255,255,0.3)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'rgba(255,255,255,0.5)',
                    }}>
                        <IcoPlus s={14} />
                    </div>
                    <div style={{ overflow: 'hidden', minWidth: 0 }}>
                        <div style={{
                            fontFamily: T.BARLOWC, fontWeight: 700,
                            fontSize: 13, letterSpacing: '0.09em', lineHeight: '18px',
                            color: 'rgba(255,255,255,0.7)',
                        }}>ADD ACCOUNT</div>
                        <div style={{
                            fontFamily: T.BARLOW, fontSize: 11, lineHeight: '15px',
                            color: 'rgba(255,255,255,0.38)', marginTop: 2,
                        }}>Sign in with another account</div>
                    </div>
                </button>
            </div>
        </div>
    );
}


// ─────────────────────────────────────────────────────────────
// SWITCH MODAL
// Renders directly into document.body (NOT the portal root which
// has pointer-events:none). Uses Clerk's useSignIn hook to auth
// the saved account in-place, then setActive to swap sessions.
// Phases: 'password' → 'code' (2FA) → 'done'
//         'forgot' → 'forgot_sent'
// ─────────────────────────────────────────────────────────────
function SwitchModal({ account, onClose, onSuccess, clerkSetActive, clerkClient }) {
    const { signIn, isLoaded: signInLoaded } = useSignIn();
    const { setActive: hookSetActive, client: hookClient } = useClerk();
    // prefer props (from ProfileButton which already has them), fall back to own hooks
    const setActive = clerkSetActive || hookSetActive;
    const client = clerkClient || hookClient;

    const [phase, setPhase] = useState('password');
    const [password, setPassword] = useState('');
    const [code, setCode] = useState('');
    const [showPw, setShowPw] = useState(false);
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(false);
    const inputRef = useRef(null);
    const [bodyEl, setBodyEl] = useState(null);

    // Render into document.body so pointer-events:none on #apex-drop-root
    // never blocks this modal's inputs and buttons.
    useEffect(() => { setBodyEl(document.body); }, []);

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        requestAnimationFrame(() => inputRef.current?.focus());
        const onKey = (e) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', onKey);
        return () => {
            document.body.style.overflow = '';
            window.removeEventListener('keydown', onKey);
        };
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (phase === 'code' || phase === 'forgot') {
            requestAnimationFrame(() => inputRef.current?.focus());
        }
    }, [phase]);

    // ── Password submit ────────────────────────────────────────
    async function submitPassword(e) {
        e?.preventDefault();
        if (!password || !signInLoaded) return;
        setError(''); setBusy(true);
        try {
            const result = await signIn.create({ identifier: account.email, password });
            if (result.status === 'complete') {
                await finalize(result);
            } else if (result.status === 'needs_second_factor') {
                const factor = result.supportedSecondFactors?.find(f =>
                    f.strategy === 'email_code' || f.strategy === 'totp' || f.strategy === 'phone_code'
                );
                if (factor?.strategy === 'email_code') {
                    await signIn.prepareSecondFactor({ strategy: 'email_code' });
                }
                setPhase('code');
            } else {
                setError('Sign-in incomplete. Please try again.');
            }
        } catch (err) {
            const clerkErr = err?.errors?.[0];
            // Clerk throws "identifier_already_signed_in" when this account already has
            // an active session on this browser. The session ID is in clerkErr.meta.
            // Extract it and call setActive() directly — no password needed.
            if (clerkErr?.code === 'identifier_already_signed_in') {
                const existingSessionId = clerkErr?.meta?.sessionId || clerkErr?.meta?.SessionID;
                if (existingSessionId) {
                    try {
                        await setActive({ session: existingSessionId });
                        window.location.reload();
                        return;
                    } catch { /* fall through */ }
                }
                // Also try scanning client.sessions by email
                const existing = client?.sessions?.find(s =>
                    s.user?.primaryEmailAddress?.emailAddress === account.email ||
                    s.user?.emailAddresses?.some(em => em.emailAddress === account.email)
                );
                if (existing) {
                    try {
                        await setActive({ session: existing.id });
                        window.location.reload();
                        return;
                    } catch { /* fall through */ }
                }
                setError('This account is already active on this browser. Refreshing…');
                setTimeout(() => window.location.reload(), 1200);
                return;
            }
            if (clerkErr?.code === 'session_exists') {
                // Single-session mode: sign out first, then reload so the sign-in
                // can proceed on the fresh page via the password form.
                setError('Switching…');
                setTimeout(() => window.location.reload(), 800);
                return;
            }
            setError(clerkErr?.longMessage || clerkErr?.message || 'Incorrect password.');
        }
        setBusy(false);
    }

    // ── 2FA code submit ────────────────────────────────────────
    async function submitCode(e) {
        e?.preventDefault();
        if (!code) return;
        setError(''); setBusy(true);
        try {
            const result = await signIn.attemptSecondFactor({ strategy: 'email_code', code });
            if (result.status === 'complete') { await finalize(result); }
            else { setError('Verification failed. Check your code and try again.'); }
        } catch (err) {
            setError(err?.errors?.[0]?.message || 'Invalid code.');
        }
        setBusy(false);
    }

    // ── Forgot password — send reset link ─────────────────────
    async function sendResetEmail(e) {
        e?.preventDefault();
        if (!signInLoaded) return;
        setError(''); setBusy(true);
        try {
            // Create a sign-in attempt for this email, then prepare the
            // email_link first factor so Clerk sends the reset email.
            await signIn.create({ identifier: account.email });
            await signIn.prepareFirstFactor({
                strategy: 'reset_password_email_code',
                emailAddressId: signIn.supportedFirstFactors?.find(
                    f => f.strategy === 'reset_password_email_code'
                )?.emailAddressId,
            });
            setPhase('forgot_sent');
        } catch (err) {
            setError(err?.errors?.[0]?.message || 'Could not send reset email. Try again.');
        }
        setBusy(false);
    }

    // ── Finalize — swap session ────────────────────────────────
    async function finalize(result) {
        setPhase('done');
        try {
            if (window.Clerk?.setActive) {
                await window.Clerk.setActive({ session: result.createdSessionId });
            } else {
                sessionStorage.setItem('apex_switched', '1');
                window.location.href = window.location.pathname;
                return;
            }
        } catch {
            sessionStorage.setItem('apex_switched', '1');
            window.location.href = window.location.pathname;
            return;
        }
        onSuccess(account);
    }

    const INP = {
        width: '100%', background: 'rgba(255,255,255,0.07)',
        border: '1px solid rgba(255,255,255,0.18)', borderRadius: 4,
        padding: '12px 14px', color: '#fff',
        fontFamily: "'Barlow',sans-serif", fontSize: 14,
        outline: 'none', boxSizing: 'border-box',
    };

    const BTN_PRIMARY = (disabled) => ({
        marginTop: 16, width: '100%',
        background: disabled ? 'rgba(255,34,0,0.35)' : '#FF2200',
        border: 'none', borderRadius: 4, padding: '13px',
        fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700,
        fontSize: 14, letterSpacing: '0.14em', color: '#fff',
        cursor: disabled ? 'not-allowed' : 'pointer', transition: 'background 0.15s',
    });

    const ERR = error ? (
        <div style={{
            marginTop: 10, padding: '10px 14px',
            background: 'rgba(255,34,0,0.1)', border: '1px solid rgba(255,34,0,0.25)',
            borderRadius: 4, fontFamily: "'Barlow',sans-serif", fontSize: 12, color: '#ff7755',
        }}>{error}</div>
    ) : null;

    if (!bodyEl) return null;

    const modal = (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 99999,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 16, fontFamily: "'Barlow',sans-serif",
        }}>
            {/* Backdrop */}
            <div onClick={onClose} style={{
                position: 'absolute', inset: 0,
                background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)',
            }} />

            {/* Card */}
            <div style={{
                position: 'relative', width: '100%', maxWidth: 400,
                background: '#181818', border: '1px solid rgba(255,255,255,0.13)',
                borderRadius: 12, boxShadow: '0 32px 96px rgba(0,0,0,0.95)',
                overflow: 'hidden',
            }}>
                <div style={{ height: 3, background: 'linear-gradient(90deg,#FF2200,#ff6b00)' }} />

                {/* Header */}
                <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                    <div style={{
                        fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700,
                        fontSize: 10, letterSpacing: '0.28em', color: '#FF2200', marginBottom: 10,
                    }}>
                        {phase === 'code' ? 'VERIFICATION REQUIRED'
                            : phase === 'forgot' ? 'RESET PASSWORD'
                                : phase === 'forgot_sent' ? 'CHECK YOUR EMAIL'
                                    : 'SWITCH ACCOUNT'}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <Ava user={account} d={42} fs={15} grad={acctGrad(account.id)} />
                        <div style={{ overflow: 'hidden', minWidth: 0 }}>
                            <div style={{
                                fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700,
                                fontSize: 15, color: '#fff',
                                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                            }}>{account.name}</div>
                            <div style={{
                                fontSize: 12, color: 'rgba(255,255,255,0.45)', marginTop: 2,
                                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                            }}>{account.email}</div>
                        </div>
                    </div>
                </div>

                {/* Body */}
                <div style={{ padding: '20px 24px 24px' }}>

                    {/* ── DONE ── */}
                    {phase === 'done' && (
                        <div style={{ textAlign: 'center', padding: '16px 0' }}>
                            <div style={{
                                width: 52, height: 52, borderRadius: '50%',
                                background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.4)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px',
                            }}>
                                <IcoCheck s={24} />
                            </div>
                            <div style={{
                                fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700,
                                fontSize: 15, letterSpacing: '0.08em', color: '#fff',
                            }}>SWITCHING…</div>
                        </div>
                    )}

                    {/* ── FORGOT SENT ── */}
                    {phase === 'forgot_sent' && (
                        <div style={{ textAlign: 'center', padding: '8px 0' }}>
                            <div style={{
                                width: 52, height: 52, borderRadius: '50%',
                                background: 'rgba(255,165,0,0.1)', border: '1px solid rgba(255,165,0,0.35)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px',
                            }}>
                                <Ico s={24} color='#ffb347' ch={<><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></>} />
                            </div>
                            <div style={{
                                fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700,
                                fontSize: 14, letterSpacing: '0.08em', color: '#fff', marginBottom: 8,
                            }}>EMAIL SENT</div>
                            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, marginBottom: 16 }}>
                                Check <strong style={{ color: 'rgba(255,255,255,0.75)' }}>{account.email}</strong> for a password reset link.
                            </div>
                            <button onClick={onClose}
                                style={{ ...BTN_PRIMARY(false), marginTop: 0 }}>
                                CLOSE
                            </button>
                        </div>
                    )}

                    {/* ── FORGOT FORM ── */}
                    {phase === 'forgot' && (
                        <form onSubmit={sendResetEmail}>
                            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, marginBottom: 16 }}>
                                We'll send a password reset link to <strong style={{ color: 'rgba(255,255,255,0.8)' }}>{account.email}</strong>.
                            </div>
                            {ERR}
                            <button type="submit" disabled={busy}
                                style={BTN_PRIMARY(busy)}>
                                {busy ? 'SENDING…' : 'SEND RESET EMAIL →'}
                            </button>
                            <div style={{ marginTop: 12, textAlign: 'center' }}>
                                <button type="button" onClick={() => { setError(''); setPhase('password'); }}
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>
                                    ← Back to sign in
                                </button>
                            </div>
                        </form>
                    )}

                    {/* ── 2FA CODE ── */}
                    {phase === 'code' && (
                        <form onSubmit={submitCode}>
                            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, marginBottom: 16 }}>
                                Enter the verification code sent to <strong style={{ color: 'rgba(255,255,255,0.8)' }}>{account.email}</strong>
                            </div>
                            <input ref={inputRef} type="text" inputMode="numeric" placeholder="000000"
                                value={code} onChange={e => { setCode(e.target.value); setError(''); }}
                                style={{ ...INP, letterSpacing: '0.3em', textAlign: 'center', fontSize: 22, padding: '14px' }} />
                            {ERR}
                            <button type="submit" disabled={busy || code.length < 4}
                                style={BTN_PRIMARY(busy || code.length < 4)}>
                                {busy ? 'VERIFYING…' : 'VERIFY CODE →'}
                            </button>
                        </form>
                    )}

                    {/* ── PASSWORD ── */}
                    {phase === 'password' && (
                        <form onSubmit={submitPassword}>
                            <div style={{
                                fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700,
                                fontSize: 10, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.4)', marginBottom: 8,
                            }}>PASSWORD</div>
                            <div style={{ position: 'relative' }}>
                                <input ref={inputRef}
                                    type={showPw ? 'text' : 'password'}
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={e => { setPassword(e.target.value); setError(''); }}
                                    style={{ ...INP, paddingRight: 44 }}
                                />
                                <button type="button" onClick={() => setShowPw(p => !p)}
                                    style={{
                                        position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                                        background: 'none', border: 'none', cursor: 'pointer',
                                        color: 'rgba(255,255,255,0.4)', padding: 4, display: 'flex',
                                    }}>
                                    {showPw
                                        ? <Ico s={16} ch={<><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" /><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" /><line x1="1" y1="1" x2="23" y2="23" /></>} />
                                        : <Ico s={16} ch={<><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></>} />
                                    }
                                </button>
                            </div>
                            {ERR}
                            <button type="submit" disabled={busy || !password}
                                style={BTN_PRIMARY(busy || !password)}>
                                {busy ? 'SIGNING IN…' : 'SWITCH ACCOUNT →'}
                            </button>
                            <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <button type="button" onClick={() => { setError(''); setPhase('forgot'); }}
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: 'rgba(255,100,68,0.7)', padding: 0 }}>
                                    Forgot password?
                                </button>
                                <button type="button" onClick={onClose}
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: 'rgba(255,255,255,0.3)', padding: 0 }}>
                                    Cancel
                                </button>
                            </div>
                        </form>
                    )}

                </div>
            </div>
        </div>
    );

    return createPortal(modal, bodyEl);
}


// ─────────────────────────────────────────────────────────────
// DESKTOP PROFILE BUTTON + DROPDOWN
// ─────────────────────────────────────────────────────────────
function ProfileButton({ navigate }) {
    const { user, logout } = useAuth();
    const { client, setActive } = useClerk();

    const [open, setOpen] = useState(false);
    const [panel, setPanel] = useState('main');
    const [saved, setSaved] = useState(getSaved);
    const [switching, setSwitching] = useState(null);
    const [switchModal, setSwitchModal] = useState(null);
    const [pos, setPos] = useState({ top: 72, right: 16 });
    const [avaErr, setAvaErr] = useState(false);

    const btnRef = useRef(null);
    const closeTimer = useRef(null);
    const portalEl = useRef(null);
    useEffect(() => { portalEl.current = getPortal(); }, []);

    useEffect(() => { if (user) upsertAcct(user); }, [user?.id]); // eslint-disable-line
    useEffect(() => { if (open) setSaved(getSaved()); }, [open]);

    function calcPos() {
        if (!btnRef.current) return;
        const r = btnRef.current.getBoundingClientRect();
        setPos({ top: Math.round(r.bottom + 10), right: Math.round(window.innerWidth - r.right) });
    }
    const panelLocked = useRef(false);
    function openDrop() { calcPos(); clearTimeout(closeTimer.current); setOpen(true); }
    // 600ms delay + panelLocked: prevents close during switch panel transition
    function startClose() {
        if (panelLocked.current) return;
        closeTimer.current = setTimeout(() => { if (!panelLocked.current) { setOpen(false); setPanel('main'); } }, 600);
    }
    function keepOpen() { clearTimeout(closeTimer.current); }
    function goSwitch() {
        panelLocked.current = true;
        keepOpen();
        setPanel('switch');
        setTimeout(() => { panelLocked.current = false; }, 700);
    }
    function goMain() {
        panelLocked.current = true;
        setPanel('main');
        setTimeout(() => { panelLocked.current = false; }, 700);
    }
    useEffect(() => () => clearTimeout(closeTimer.current), []);
    useEffect(() => {
        if (!open) return;
        const fn = () => calcPos();
        window.addEventListener('resize', fn);
        return () => window.removeEventListener('resize', fn);
    }, [open]);

    const others = saved.filter(a => a.id !== user?.id);
    const initials = (user?.name || 'ME').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

    async function handleSwitch(acc) {
        setOpen(false);
        setPanel('main');
        setSwitching(acc.id);
        // Check if this account already has an active session on this browser client.
        // If so, swap instantly — no password needed.
        try {
            const existing = client?.sessions?.find(s =>
                s.user?.primaryEmailAddress?.emailAddress === acc.email ||
                s.user?.emailAddresses?.some(e => e.emailAddress === acc.email)
            );
            if (existing) {
                await setActive({ session: existing.id });
                window.location.reload();
                return;
            }
        } catch { /* fall through to modal */ }
        setSwitching(null);
        setSwitchModal(acc);
    }
    async function handleAdd() {
        setOpen(false);
        setPanel('main');
        // Store intent so /sign-up page knows to log out current user first
        sessionStorage.setItem('apex_add_account', '1');
        navigate('/sign-up');
    }
    function handleRemove(e, id) { e.stopPropagation(); forgetAcct(id); setSaved(getSaved()); }

    // ── The actual dropdown DOM ──────────────────────────────────
    const dropdown = open ? (
        <div
            className="apxd-shell"
            onMouseEnter={keepOpen}
            onMouseLeave={startClose}
            onMouseDown={keepOpen}
            onClick={keepOpen}
            style={{
                // position:fixed so it floats above everything
                position: 'fixed', top: pos.top, right: pos.right,
                // Hard-coded 300px width — can NEVER be overridden by parent CSS
                width: 300, minWidth: 300,

                // Visual shell
                background: 'rgba(10,10,10,0.98)',
                border: '1px solid rgba(255,255,255,0.10)',
                borderRadius: 10,
                boxShadow: '0 24px 70px rgba(0,0,0,0.95), 0 0 0 1px rgba(255,34,0,0.07), inset 0 1px 0 rgba(255,255,255,0.04)',
                zIndex: 9999,

                // Visibility + animation
                opacity: open ? 1 : 0,
                transform: open ? 'translateY(0) scale(1)' : 'translateY(-10px) scale(0.97)',
                transition: 'opacity 0.2s ease, transform 0.2s cubic-bezier(0.23,1,0.32,1)',

                // Allow panels to overflow visually while clipping the rounded corners
                overflow: 'hidden',
                color: T.TEXT,

                // Ensure font-size is reset — never inherit from portal container
                fontSize: 14,
                lineHeight: 1.4,
                fontFamily: T.BARLOW,
            }}>

            {/* Arrow caret */}
            <div style={{
                position: 'absolute', top: -6, right: 14, width: 13, height: 13, zIndex: 2,
                background: T.BG,
                border: `1px solid ${T.BORDER}`, borderBottom: 'none', borderRight: 'none',
                transform: 'rotate(45deg)',
            }} />

            {/* Panel container — relative so absolute panel can overlay during transition */}
            <div style={{ position: 'relative' }}>

                {/* MAIN panel */}
                <div style={{
                    position: panel === 'main' ? 'relative' : 'absolute',
                    top: 0, left: 0, right: 0,
                    opacity: panel === 'main' ? 1 : 0,
                    transform: panel === 'main' ? 'translateX(0)' : 'translateX(-18px)',
                    visibility: panel === 'main' ? 'visible' : 'hidden',
                    pointerEvents: panel === 'main' ? 'auto' : 'none',
                    transition: 'opacity 0.22s ease, transform 0.22s ease',
                }}>
                    <MainPanel
                        user={user} others={others}
                        isAdmin={user?.isAdmin === true}
                        onNav={navigate} onClose={() => setOpen(false)}
                        onGoSwitch={goSwitch}
                        onSignOut={() => { logout(); navigate('/'); setOpen(false); }}
                    />
                </div>

                {/* SWITCH panel */}
                <div style={{
                    position: panel === 'switch' ? 'relative' : 'absolute',
                    top: 0, left: 0, right: 0,
                    opacity: panel === 'switch' ? 1 : 0,
                    transform: panel === 'switch' ? 'translateX(0)' : 'translateX(18px)',
                    visibility: panel === 'switch' ? 'visible' : 'hidden',
                    pointerEvents: panel === 'switch' ? 'auto' : 'none',
                    transition: 'opacity 0.22s ease, transform 0.22s ease',
                }}>
                    <SwitchPanel
                        user={user} others={others} switching={switching}
                        onBack={goMain}
                        onSwitch={handleSwitch}
                        onRemove={handleRemove}
                        onAdd={handleAdd}
                    />
                </div>
            </div>
        </div>
    ) : null;

    return (
        <div style={{ position: 'relative' }} onMouseEnter={openDrop} onMouseLeave={startClose}>
            {/* Switch account modal — in-app, no page navigation */}
            {switchModal && (
                <SwitchModal
                    account={switchModal}
                    clerkSetActive={setActive}
                    clerkClient={client}
                    onClose={() => { setSwitchModal(null); setSwitching(null); }}
                    onSuccess={() => { setSwitchModal(null); setSwitching(null); }}
                />
            )}
            {/* Avatar trigger */}
            <button ref={btnRef} onClick={() => navigate('/profile')}
                style={{
                    width: 36, height: 36, minWidth: 36, borderRadius: '50%', padding: 0, flexShrink: 0,
                    background: 'linear-gradient(135deg,#FF2200,#ff6b00)',
                    border: `2px solid ${open ? 'rgba(255,34,0,0.78)' : 'rgba(255,34,0,0.32)'}`,
                    cursor: 'pointer', overflow: 'hidden',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'border-color 0.2s, box-shadow 0.2s, transform 0.2s',
                    boxShadow: open ? '0 0 22px rgba(255,34,0,0.55)' : 'none',
                    transform: open ? 'scale(1.08)' : 'scale(1)',
                }}>
                {user?.avatar && !avaErr
                    ? <img src={user.avatar} alt="" onError={() => setAvaErr(true)} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                    : <span style={{ fontFamily: T.BEBAS, fontSize: 13, color: 'white', lineHeight: 1 }}>{initials}</span>}
            </button>

            {/* Portal render */}
            {portalEl.current && dropdown && createPortal(dropdown, portalEl.current)}
        </div>
    );
}

// ─────────────────────────────────────────────────────────────
// MOBILE / TABLET BOTTOM SHEET
// ─────────────────────────────────────────────────────────────
function AccountSheet({ user, onClose }) {
    const { logout } = useAuth();
    const { client: asClient, setActive: asSetActive } = useClerk();
    const navigate = useNavigate();

    const [panel, setPanel] = useState('main');
    const [saved, setSaved] = useState(getSaved);
    const [switching, setSwitching] = useState(null);
    const [switchModal, setSwitchModal] = useState(null);
    const [vis, setVis] = useState(false);
    const portalEl = useRef(null);
    useEffect(() => { portalEl.current = getPortal(); }, []);

    const others = saved.filter(a => a.id !== user?.id);

    useEffect(() => {
        requestAnimationFrame(() => setVis(true));
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = ''; };
    }, []);

    useEffect(() => { if (panel === 'switch') setSaved(getSaved()); }, [panel]);

    function dismiss() { setVis(false); setTimeout(onClose, 340); }

    async function handleSwitch(acc) {
        setSwitching(acc.id);
        // Check for existing session on this client first
        try {
            const existing = asClient?.sessions?.find(s =>
                s.user?.primaryEmailAddress?.emailAddress === acc.email ||
                s.user?.emailAddresses?.some(e => e.emailAddress === acc.email)
            );
            if (existing) {
                await asSetActive({ session: existing.id });
                window.location.reload();
                return;
            }
        } catch { /* fall through to modal */ }
        setSwitching(null);
        setSwitchModal(acc);
    }
    function handleAdd() {
        dismiss();
        sessionStorage.setItem('apex_add_account', '1');
        navigate('/sign-up');
    }
    function handleRemove(e, id) { e.stopPropagation(); forgetAcct(id); setSaved(getSaved()); }

    const pStyle = (active) => ({
        position: active ? 'relative' : 'absolute',
        top: 0, left: 0, right: 0,
        opacity: active ? 1 : 0,
        transform: active ? 'translateX(0)' : 'translateX(20px)',
        visibility: active ? 'visible' : 'hidden',
        pointerEvents: active ? 'auto' : 'none',
        transition: 'opacity 0.2s ease, transform 0.2s ease',
    });

    const sheet = (
        <div className="apxd-shell" style={{ color: T.TEXT, fontFamily: T.BARLOW }}>
            {/* Switch account modal */}
            {switchModal && (
                <SwitchModal
                    account={switchModal}
                    clerkSetActive={asSetActive}
                    clerkClient={asClient}
                    onClose={() => { setSwitchModal(null); setSwitching(null); dismiss(); }}
                    onSuccess={() => { setSwitchModal(null); setSwitching(null); }}
                />
            )}
            {/* Backdrop */}
            <div onClick={dismiss} style={{
                position: 'fixed', inset: 0, zIndex: 8000,
                background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(6px)',
                opacity: vis ? 1 : 0, transition: 'opacity 0.3s',
            }} />

            {/* Sheet panel */}
            <div style={{
                position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 8001,
                background: T.BG,
                borderTop: `1px solid ${T.BORDER}`,
                borderRadius: '18px 18px 0 0',
                boxShadow: '0 -20px 64px rgba(0,0,0,0.7)',
                transform: vis ? 'translateY(0)' : 'translateY(100%)',
                transition: 'transform 0.34s cubic-bezier(0.23,1,0.32,1)',
                maxHeight: '88vh', overflowY: 'auto',
                paddingBottom: 'max(env(safe-area-inset-bottom,0px),20px)',
                fontSize: 14, lineHeight: 1.4,
            }}>
                {/* Drag handle */}
                <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 4px' }}>
                    <div style={{ width: 40, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.18)' }} />
                </div>

                {/* Panel container */}
                <div style={{ position: 'relative' }}>
                    {/* Main panel */}
                    <div style={pStyle(panel === 'main')}>
                        {/* Header */}
                        <div style={{
                            padding: '16px 22px 14px',
                            background: 'rgba(255,34,0,0.045)',
                            borderBottom: '1px solid rgba(255,255,255,0.09)',
                            display: 'flex', alignItems: 'center', gap: 14,
                        }}>
                            <Ava user={user} d={48} fs={18} />
                            <div style={{ flex: 1, overflow: 'hidden', minWidth: 0 }}>
                                <div style={{
                                    fontFamily: T.BARLOWC, fontWeight: 700,
                                    fontSize: 17, lineHeight: '22px', letterSpacing: '0.05em',
                                    color: 'white',
                                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                                }}>{user?.name}</div>
                                <div style={{
                                    fontFamily: T.BARLOW, fontSize: 12, lineHeight: '17px',
                                    color: 'rgba(255,255,255,0.48)', marginTop: 3,
                                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                                }}>{user?.email}</div>
                            </div>
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0,
                                background: 'rgba(34,197,94,0.11)', border: '1px solid rgba(34,197,94,0.30)',
                                padding: '4px 10px', borderRadius: 10,
                            }}>
                                <div style={{ width: 6, height: 6, minWidth: 6, borderRadius: '50%', background: '#22C55E', boxShadow: '0 0 7px #22C55E' }} />
                                <span style={{ fontFamily: T.BARLOWC, fontWeight: 700, fontSize: 9, letterSpacing: '0.16em', color: '#22C55E' }}>ACTIVE</span>
                            </div>
                        </div>

                        {/* Nav rows */}
                        <div style={{ paddingTop: 6 }}>
                            <Row icon={<IcoUser s={18} />} label="MY PROFILE" sub="Account overview" py={14} px={22} onClick={() => { navigate('/profile'); dismiss(); }} />
                            <Row icon={<IcoOrders s={18} />} label="ORDER HISTORY" sub="Track your orders" py={14} px={22} onClick={() => { navigate('/profile'); dismiss(); }} />
                            <Row icon={<IcoWish s={18} />} label="WISHLIST" sub="Saved items" py={14} px={22} onClick={() => { navigate('/wishlist'); dismiss(); }} />
                            {user?.isAdmin === true && (
                                <>
                                    <div style={{ height: 1, background: 'rgba(255,34,0,0.22)', margin: '3px 16px' }} />
                                    <Row
                                        icon={<IcoAdmin s={18} />}
                                        label="ADMIN DASHBOARD"
                                        sub="Orders · Customers · Analytics"
                                        py={14} px={22}
                                        onClick={() => { navigate('/admin'); dismiss(); }}
                                        right={
                                            <span style={{
                                                fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 9,
                                                letterSpacing: '0.18em', color: '#FF2200', background: 'rgba(255,34,0,0.13)',
                                                border: '1px solid rgba(255,34,0,0.32)', padding: '2px 8px', borderRadius: 2
                                            }}>ADMIN</span>
                                        }
                                    />
                                </>
                            )}
                        </div>
                        <HR />
                        <Row
                            icon={<IcoSwitch s={18} />}
                            label="SWITCH ACCOUNT"
                            sub={others.length > 0 ? `${others.length} saved account${others.length !== 1 ? 's' : ''}` : 'Add another account'}
                            right={<IcoChevR s={14} />}
                            py={14} px={22}
                            onClick={() => setPanel('switch')}
                        />
                        <HR />
                        <div style={{ paddingBottom: 8 }}>
                            <Row icon={<IcoSignOut s={18} />} label="SIGN OUT" danger py={14} px={22} onClick={() => { logout(); navigate('/'); dismiss(); }} />
                        </div>
                    </div>

                    {/* Switch panel */}
                    <div style={pStyle(panel === 'switch')}>
                        {/* Header */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '14px 22px', borderBottom: '1px solid rgba(255,255,255,0.09)' }}>
                            <BackBtn onClick={() => setPanel('main')} />
                            <span style={{ fontFamily: T.BARLOWC, fontWeight: 700, fontSize: 13, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.55)' }}>SWITCH ACCOUNT</span>
                        </div>

                        {/* Current account */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 22px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                            <Ava user={user} d={44} fs={16} />
                            <div style={{ flex: 1, overflow: 'hidden', minWidth: 0 }}>
                                <div style={{ fontFamily: T.BARLOWC, fontWeight: 700, fontSize: 15, lineHeight: '20px', color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name}</div>
                                <div style={{ fontFamily: T.BARLOW, fontSize: 12, lineHeight: '17px', color: 'rgba(255,255,255,0.44)', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email}</div>
                            </div>
                            <div style={{ width: 24, height: 24, minWidth: 24, borderRadius: '50%', background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.42)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <IcoCheck s={12} />
                            </div>
                        </div>

                        {/* Other accounts */}
                        {others.length > 0 && (
                            <div>
                                <div style={{ padding: '9px 22px 4px', fontFamily: T.BARLOWC, fontWeight: 700, fontSize: 10, letterSpacing: '0.22em', color: 'rgba(255,255,255,0.32)' }}>OTHER ACCOUNTS</div>
                                {others.map(acc => (
                                    <div key={acc.id} className="apxd-saved-row" style={{ display: 'flex', alignItems: 'center' }}>
                                        <button onClick={() => handleSwitch(acc)} disabled={!!switching}
                                            style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 14, padding: '12px 0 12px 22px', background: 'none', border: 'none', cursor: switching ? 'wait' : 'pointer', textAlign: 'left', overflow: 'hidden' }}>
                                            <Ava user={acc} d={40} fs={15} grad={acctGrad(acc.id)} />
                                            <div style={{ flex: 1, overflow: 'hidden', minWidth: 0 }}>
                                                <div style={{ fontFamily: T.BARLOWC, fontWeight: 700, fontSize: 14, lineHeight: '19px', color: switching === acc.id ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.9)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{switching === acc.id ? 'SWITCHING…' : acc.name}</div>
                                                <div style={{ fontFamily: T.BARLOW, fontSize: 12, lineHeight: '16px', color: 'rgba(255,255,255,0.42)', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{acc.email}</div>
                                            </div>
                                        </button>
                                        <button onClick={e => handleRemove(e, acc.id)} className="apxd-trash"
                                            style={{ width: 44, height: 44, minWidth: 44, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', marginRight: 14, borderRadius: 4 }}>
                                            <IcoTrash s={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        <HR />
                        <div style={{ paddingBottom: 8 }}>
                            <button onClick={handleAdd} className="apxd-add-row"
                                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 14, padding: '13px 22px', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
                                <div style={{ width: 40, height: 40, minWidth: 40, borderRadius: '50%', border: '1.5px dashed rgba(255,255,255,0.30)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: 'rgba(255,255,255,0.52)' }}>
                                    <IcoPlus s={16} />
                                </div>
                                <div style={{ overflow: 'hidden', minWidth: 0 }}>
                                    <div style={{ fontFamily: T.BARLOWC, fontWeight: 700, fontSize: 14, letterSpacing: '0.09em', lineHeight: '19px', color: 'rgba(255,255,255,0.7)' }}>ADD ACCOUNT</div>
                                    <div style={{ fontFamily: T.BARLOW, fontSize: 12, lineHeight: '16px', color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>Sign in with another account</div>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    if (!portalEl.current) return null;
    return createPortal(sheet, portalEl.current);
}

// ─────────────────────────────────────────────────────────────
// JOIN APEX BUTTON (logged-out)
// ─────────────────────────────────────────────────────────────
function JoinApexBtn({ navigate }) {
    const [open, setOpen] = useState(false);
    const [pos, setPos] = useState({ top: 72, right: 16 });
    const btnRef = useRef(null);
    const timer = useRef(null);
    const portalEl = useRef(null);
    useEffect(() => { portalEl.current = getPortal(); }, []);

    function calcPos() {
        if (!btnRef.current) return;
        const r = btnRef.current.getBoundingClientRect();
        setPos({ top: Math.round(r.bottom + 10), right: Math.round(window.innerWidth - r.right) });
    }
    const show = () => { calcPos(); clearTimeout(timer.current); setOpen(true); };
    const hide = () => { timer.current = setTimeout(() => setOpen(false), 200); };
    useEffect(() => () => clearTimeout(timer.current), []);

    const menu = open ? (
        <div className="apxd-shell" onMouseEnter={show} onMouseLeave={hide}
            style={{
                position: 'fixed', top: pos.top, right: pos.right,
                width: 220, minWidth: 220,
                background: T.BG, border: `1px solid ${T.BORDER}`,
                borderRadius: 10, boxShadow: '0 24px 64px rgba(0,0,0,0.82)',
                opacity: 1, zIndex: 9999, overflow: 'hidden',
                color: T.TEXT, fontFamily: T.BARLOW, fontSize: 14,
            }}>
            <div style={{ position: 'absolute', top: -6, right: 22, width: 12, height: 12, background: T.BG, border: `1px solid ${T.BORDER}`, borderBottom: 'none', borderRight: 'none', transform: 'rotate(45deg)', zIndex: 1 }} />
            <div style={{ padding: '5px 0' }}>
                <Row label="CREATE ACCOUNT" sub="New to APEX? Join free" py={12} px={16} onClick={() => { navigate('/sign-up'); setOpen(false); }} />
                <HR />
                <Row label="SIGN IN" sub="Already a member" py={12} px={16} onClick={() => { navigate('/sign-in'); setOpen(false); }} />
            </div>
        </div>
    ) : null;

    return (
        <div style={{ position: 'relative' }} onMouseEnter={show} onMouseLeave={hide}>
            <button ref={btnRef} className="btn-primary" onClick={() => navigate('/sign-up')}
                style={{
                    padding: '8px 20px', fontSize: 12, whiteSpace: 'nowrap',
                    display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0,
                    letterSpacing: '0.12em', fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700,
                    background: 'linear-gradient(135deg,#FF2200,#cc1800)',
                    border: 'none', borderRadius: 3, cursor: 'pointer', color: 'white',
                    boxShadow: '0 0 0 0 rgba(255,34,0,0)',
                    transition: 'box-shadow 0.25s,transform 0.18s',
                }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 0 22px rgba(255,34,0,0.45)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 0 0 0 rgba(255,34,0,0)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                JOIN APEX
                <span style={{ display: 'flex', opacity: 0.75, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.22s', flexShrink: 0 }}>
                    <IcoChevD s={10} />
                </span>
            </button>
            {portalEl.current && menu && createPortal(menu, portalEl.current)}
        </div>
    );
}

// ─────────────────────────────────────────────────────────────
// MAIN NAVBAR
// ─────────────────────────────────────────────────────────────
export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [sheetOpen, setSheetOpen] = useState(false);
    const { cartCount, toggleCart } = useCart();
    const { wishlistCount } = useWishlist();
    const { isLoggedIn, user, logout } = useAuth();
    const { isMobile, isTablet } = useBreakpoint();
    const navigate = useNavigate();
    const [mobAvaErr, setMobAvaErr] = useState(false);

    const initials = (user?.name || 'ME').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
    const iconColor = 'rgba(245,243,238,0.92)';
    const px = isMobile ? 16 : isTablet ? 24 : 48;
    const close = () => setMenuOpen(false);
    const openSearch = () => { setSearchOpen(true); setMenuOpen(false); };

    useEffect(() => { const fn = () => setScrolled(window.scrollY > 40); window.addEventListener('scroll', fn); return () => window.removeEventListener('scroll', fn); }, []);
    useEffect(() => { if (!searchOpen) document.body.style.overflow = menuOpen ? 'hidden' : ''; return () => { if (!searchOpen) document.body.style.overflow = ''; }; }, [menuOpen, searchOpen]);
    useEffect(() => { const fn = e => { if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); setSearchOpen(true); setMenuOpen(false); } }; window.addEventListener('keydown', fn); return () => window.removeEventListener('keydown', fn); }, []);

    return (
        <>
            {sheetOpen && isLoggedIn && <AccountSheet user={user} onClose={() => setSheetOpen(false)} />}

            <nav style={{
                position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000, height: 64,
                padding: `0 ${px}px`,
                background: scrolled ? 'rgba(4,4,4,0.98)' : 'rgba(6,6,6,0.94)',
                backdropFilter: 'blur(28px) saturate(180%)',
                WebkitBackdropFilter: 'blur(28px) saturate(180%)',
                borderBottom: scrolled
                    ? '1px solid rgba(255,255,255,0.09)'
                    : '1px solid rgba(255,255,255,0.05)',
                boxShadow: scrolled
                    ? '0 1px 0 rgba(255,34,0,0.08), 0 8px 40px rgba(0,0,0,0.7)'
                    : 'none',
                transition: 'background 0.4s, border-color 0.4s, box-shadow 0.4s',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
                {/* Logo */}
                <NavLink to="/" onClick={close} style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', flexShrink: 0 }}
                    onMouseEnter={e => { const icon = e.currentTarget.querySelector('.apx-logo-icon'); if (icon) icon.style.boxShadow = '0 0 18px rgba(255,34,0,0.65)'; }}
                    onMouseLeave={e => { const icon = e.currentTarget.querySelector('.apx-logo-icon'); if (icon) icon.style.boxShadow = '0 0 0px transparent'; }}>
                    <div className="apx-logo-icon" style={{
                        width: 32, height: 32, minWidth: 32,
                        background: 'linear-gradient(135deg,#FF2200,#cc1a00)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        clipPath: 'polygon(12% 0%,88% 0%,100% 12%,100% 88%,88% 100%,12% 100%,0% 88%,0% 12%)',
                        transition: 'box-shadow 0.28s',
                    }}>
                        <span style={{ fontFamily: T.BEBAS, fontSize: 19, color: 'white', lineHeight: 1, letterSpacing: '-0.02em' }}>A</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
                        <span style={{ fontFamily: T.BEBAS, fontSize: isMobile ? 19 : 22, letterSpacing: '0.18em', color: 'white', whiteSpace: 'nowrap', lineHeight: 1 }}>APEX KICKS</span>
                        {!isMobile && <span style={{ fontFamily: T.BARLOWC, fontSize: 7, letterSpacing: '0.38em', color: 'rgba(255,34,0,0.65)', lineHeight: 1, marginTop: 2 }}>PREMIUM FOOTWEAR</span>}
                    </div>
                </NavLink>

                {/* Desktop nav links — animated underline */}
                {!isTablet && (
                    <div style={{ display: 'flex', gap: 0, alignItems: 'center' }}>
                        {NAV_ROUTES.map(({ label, path }) => (
                            <NavLink key={path} to={path} className={({ isActive }) => `apx-nav-link${isActive ? ' active' : ''}`}>{label}</NavLink>
                        ))}
                    </div>
                )}

                {/* Right icons */}
                <div style={{ display: 'flex', gap: isMobile ? 0 : 2, alignItems: 'center', flexShrink: 0 }}>

                    {/* Search */}
                    {!isMobile ? (
                        <button onClick={openSearch} className="apx-icon-btn"
                            style={{
                                display: 'flex', alignItems: 'center', gap: 8,
                                background: 'rgba(255,255,255,0.04)',
                                border: '1px solid rgba(255,255,255,0.09)',
                                color: 'rgba(255,255,255,0.42)',
                                padding: '7px 14px', borderRadius: 4, cursor: 'pointer',
                                fontFamily: T.BARLOWC, fontSize: 12, letterSpacing: '0.08em', flexShrink: 0,
                                transition: 'border-color 0.2s,color 0.2s,background 0.2s',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,34,0,0.35)'; e.currentTarget.style.color = 'rgba(255,255,255,0.75)'; e.currentTarget.style.background = 'rgba(255,34,0,0.05)'; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.09)'; e.currentTarget.style.color = 'rgba(255,255,255,0.42)'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}>
                            <IcoSearch s={13} /><span style={{ marginRight: 2 }}>SEARCH</span>
                            <span style={{ fontSize: 9, background: 'rgba(255,255,255,0.07)', padding: '2px 5px', borderRadius: 2, color: 'rgba(255,255,255,0.28)', letterSpacing: '0.04em' }}>⌘K</span>
                        </button>
                    ) : (
                        <button onClick={openSearch} className="apx-icon-btn" style={{ color: iconColor, padding: 8 }}>
                            <IcoSearch s={20} />
                        </button>
                    )}

                    {/* Wishlist */}
                    <button onClick={() => navigate('/wishlist')} className="apx-icon-btn"
                        style={{ position: 'relative', color: wishlistCount > 0 ? T.RED : iconColor, padding: 8 }}>
                        <IcoHeart s={21} color={wishlistCount > 0 ? T.RED : iconColor} filled={wishlistCount > 0} />
                        {wishlistCount > 0 && (
                            <span style={{
                                position: 'absolute', top: 3, right: 3,
                                minWidth: 15, height: 15,
                                background: T.RED, borderRadius: '50%',
                                fontSize: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontFamily: T.BARLOWC, fontWeight: 700, color: 'white',
                                boxShadow: '0 0 6px rgba(255,34,0,0.7)',
                            }}>{wishlistCount}</span>
                        )}
                    </button>

                    {/* Cart — slightly larger, perfectly aligned */}
                    <button onClick={toggleCart} className="apx-icon-btn"
                        style={{ position: 'relative', color: cartCount > 0 ? T.RED : iconColor, padding: 8 }}>
                        <IcoBag s={22} color={cartCount > 0 ? '#FF4422' : iconColor} />
                        {cartCount > 0 && (
                            <span style={{
                                position: 'absolute', top: 3, right: 3,
                                minWidth: 15, height: 15,
                                background: T.RED, borderRadius: '50%',
                                fontSize: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontFamily: T.BARLOWC, fontWeight: 700, color: 'white', lineHeight: 1,
                                boxShadow: '0 0 8px rgba(255,34,0,0.8)',
                            }}>{cartCount}</span>
                        )}
                    </button>

                    {/* Desktop: profile or join */}
                    {!isTablet && (isLoggedIn ? <ProfileButton navigate={navigate} /> : <JoinApexBtn navigate={navigate} />)}

                    {/* Tablet/mobile avatar — opens bottom sheet */}
                    {isTablet && isLoggedIn && (
                        <button onClick={() => setSheetOpen(true)}
                            style={{ width: 32, height: 32, minWidth: 32, borderRadius: '50%', padding: 0, background: 'linear-gradient(135deg,#FF2200,#ff6b00)', border: '2px solid rgba(255,34,0,0.4)', cursor: 'pointer', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            {user?.avatar && !mobAvaErr
                                ? <img src={user.avatar} alt="" onError={() => setMobAvaErr(true)} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                                : <span style={{ fontFamily: T.BEBAS, fontSize: 12, color: 'white', lineHeight: 1 }}>{initials}</span>}
                        </button>
                    )}

                    {/* Hamburger — refined */}
                    {isTablet && (
                        <button onClick={() => setMenuOpen(o => !o)} aria-label="Menu"
                            style={{
                                background: 'none', border: '1px solid rgba(255,255,255,0.10)',
                                cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 5,
                                padding: '8px 10px', zIndex: 1001, flexShrink: 0, borderRadius: 4,
                                transition: 'border-color 0.2s,background 0.2s',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,34,0,0.4)'; e.currentTarget.style.background = 'rgba(255,34,0,0.05)'; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.10)'; e.currentTarget.style.background = 'none'; }}>
                            <span style={{ display: 'block', width: 20, height: 1.5, background: 'white', transition: 'all 0.32s cubic-bezier(0.23,1,0.32,1)', transform: menuOpen ? 'translateY(6.5px) rotate(45deg)' : 'none', borderRadius: 1 }} />
                            <span style={{ display: 'block', width: 20, height: 1.5, background: 'white', transition: 'all 0.32s', opacity: menuOpen ? 0 : 1, borderRadius: 1 }} />
                            <span style={{ display: 'block', width: 20, height: 1.5, background: 'white', transition: 'all 0.32s cubic-bezier(0.23,1,0.32,1)', transform: menuOpen ? 'translateY(-6.5px) rotate(-45deg)' : 'none', borderRadius: 1 }} />
                        </button>
                    )}
                </div>
            </nav>

            {/* Mobile fullscreen menu */}
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(4,4,4,0.99)', backdropFilter: 'blur(24px)', zIndex: 999, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, transform: menuOpen ? 'translateX(0)' : 'translateX(100%)', transition: 'transform 0.42s cubic-bezier(0.23,1,0.32,1)' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg,transparent,rgba(255,34,0,0.4),transparent)' }} />
                <button onClick={openSearch} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', padding: '12px 24px', borderRadius: 2, cursor: 'pointer', marginBottom: 6, width: '72%' }}>
                    <IcoSearch s={16} /><span style={{ fontFamily: T.BARLOWC, fontWeight: 600, fontSize: 14, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.4)' }}>SEARCH KICKS...</span>
                </button>

                {[{ label: 'HOME', path: '/' }, ...NAV_ROUTES, { label: 'WISHLIST', path: '/wishlist' }, ...(isLoggedIn ? [{ label: 'MY PROFILE', path: '/profile' }] : []), ...(user?.isAdmin === true ? [{ label: 'ADMIN', path: '/admin' }] : [])].map(({ label, path }) => (
                    <NavLink key={path} to={path} onClick={close}
                        style={{ fontFamily: T.BEBAS, fontSize: 'clamp(28px,7vw,48px)', color: 'rgba(255,255,255,0.5)', textDecoration: 'none', letterSpacing: '0.08em', transition: 'color 0.2s' }}
                        onMouseEnter={e => e.currentTarget.style.color = 'white'}
                        onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}>
                        {label}{label === 'WISHLIST' && wishlistCount > 0 ? ` (${wishlistCount})` : ''}
                    </NavLink>
                ))}

                {isLoggedIn && (
                    <button onClick={() => { close(); setTimeout(() => setSheetOpen(true), 420); }}
                        style={{ fontFamily: T.BEBAS, fontSize: 'clamp(22px,5.5vw,36px)', color: 'rgba(255,34,0,0.75)', background: 'none', border: 'none', cursor: 'pointer', letterSpacing: '0.08em', display: 'flex', alignItems: 'center', gap: 10, marginTop: 4 }}>
                        <IcoSwitch s={24} /> SWITCH ACCOUNT
                    </button>
                )}

                <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                    {isLoggedIn ? (
                        <button onClick={() => { logout(); navigate('/'); close(); }}
                            style={{ padding: '12px 28px', background: 'transparent', border: '1px solid rgba(255,34,0,0.4)', color: 'rgba(255,34,0,0.8)', fontFamily: T.BARLOWC, fontWeight: 700, fontSize: 13, letterSpacing: '0.12em', cursor: 'pointer', borderRadius: 2 }}>
                            SIGN OUT
                        </button>
                    ) : (
                        <>
                            <button className="btn-primary" style={{ padding: '12px 28px', fontSize: 13 }} onClick={() => { navigate('/sign-up'); close(); }}>JOIN APEX</button>
                            <button style={{ padding: '12px 28px', background: 'transparent', border: '1px solid rgba(255,255,255,0.18)', color: 'rgba(255,255,255,0.65)', fontFamily: T.BARLOWC, fontWeight: 700, fontSize: 13, letterSpacing: '0.12em', cursor: 'pointer', borderRadius: 2 }} onClick={() => { navigate('/sign-in'); close(); }}>SIGN IN</button>
                        </>
                    )}
                </div>
            </div>

            <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
        </>
    );
}