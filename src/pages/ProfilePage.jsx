// apex-kicks/src/pages/ProfilePage.jsx
// Per-user profile — all data is fetched live from the backend for the
// currently signed-in Clerk user. No mock data. Falls back gracefully
// when the API isn't reachable (e.g. backend not running yet).

import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { getShoeImage } from '../data/shoeImages';
import { PRODUCTS } from '../data/products';
import useBreakpoint from '../hooks/useBreakPoint';
import api from '../lib/api';

// ── Constants ─────────────────────────────────────────────────
const STATUS_CONFIG = {
    PENDING: { color: '#FFB800', bg: 'rgba(255,184,0,0.1)', label: 'Pending', icon: '🕐', desc: 'Order received, awaiting payment' },
    PROCESSING: { color: '#0099CC', bg: 'rgba(0,153,204,0.1)', label: 'Processing', icon: '⚙️', desc: 'Payment confirmed, being prepared' },
    SHIPPED: { color: '#C850C0', bg: 'rgba(200,80,192,0.1)', label: 'Shipped', icon: '🚚', desc: 'On its way to you' },
    DELIVERED: { color: '#00C851', bg: 'rgba(0,200,81,0.1)', label: 'Delivered', icon: '✅', desc: 'Successfully delivered' },
    CANCELLED: { color: '#FF4444', bg: 'rgba(255,68,68,0.1)', label: 'Cancelled', icon: '✗', desc: 'Order was cancelled' },
};

const STATUS_ORDER = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED'];

// ── Animated counter ──────────────────────────────────────────
function useCountUp(target, duration = 900, prefix = '', suffix = '') {
    const [display, setDisplay] = useState(prefix + '0' + suffix);
    const raf = useRef(null);
    useEffect(() => {
        if (target === null || target === undefined) return;
        const numTarget = parseFloat(String(target).replace(/[^0-9.]/g, '')) || 0;
        const start = performance.now();
        const tick = (now) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = numTarget * eased;
            const formatted = numTarget % 1 !== 0 ? current.toFixed(0) : Math.floor(current).toLocaleString();
            setDisplay(prefix + formatted + suffix);
            if (progress < 1) raf.current = requestAnimationFrame(tick);
        };
        raf.current = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf.current);
    }, [target, duration, prefix, suffix]);
    return display;
}

// ── Stat card ─────────────────────────────────────────────────
function StatCard({ label, value, prefix = '', suffix = '', accent = 'var(--red)', icon, loading }) {
    const displayed = useCountUp(loading ? 0 : (value ?? 0), 1000, prefix, suffix);
    return (
        <div style={{
            background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 8, padding: '22px 24px 20px', flex: '1 1 140px', minWidth: 130,
            position: 'relative', overflow: 'hidden', transition: 'border-color 0.2s, transform 0.2s',
        }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = `${accent}44`; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; e.currentTarget.style.transform = 'none'; }}>
            <div style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, borderRadius: '50%', background: accent, opacity: 0.06, filter: 'blur(20px)', pointerEvents: 'none' }} />
            <div style={{ fontSize: 18, marginBottom: 10, lineHeight: 1 }}>{icon}</div>
            {loading ? (
                <div style={{ height: 36, width: '60%', background: 'rgba(255,255,255,0.06)', borderRadius: 4, marginBottom: 8 }} />
            ) : (
                <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 34, color: accent, lineHeight: 1, marginBottom: 6, letterSpacing: '0.02em' }}>{displayed}</div>
            )}
            <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 9, letterSpacing: '0.22em', color: 'rgba(255,255,255,0.32)' }}>{label}</div>
        </div>
    );
}

// ── Status pill ───────────────────────────────────────────────
function StatusPill({ status }) {
    const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.PENDING;
    return (
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 12px', background: cfg.bg, borderRadius: 20, border: `1px solid ${cfg.color}33` }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: cfg.color, flexShrink: 0, boxShadow: `0 0 6px ${cfg.color}` }} />
            <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 10, letterSpacing: '0.14em', color: cfg.color }}>{cfg.label.toUpperCase()}</span>
        </div>
    );
}

// ── Skeleton ──────────────────────────────────────────────────
function Skeleton({ w = '100%', h = 16, radius = 4, mb = 0 }) {
    return <div style={{ width: w, height: h, borderRadius: radius, background: 'rgba(255,255,255,0.06)', marginBottom: mb }} />;
}

// ── Empty state ───────────────────────────────────────────────
function EmptyState({ icon, title, subtitle, action, onAction }) {
    return (
        <div style={{ textAlign: 'center', padding: '80px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            <div style={{ fontSize: 48, opacity: 0.3 }}>{icon}</div>
            <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 28, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.04em' }}>{title}</div>
            <div style={{ fontFamily: "'Barlow',sans-serif", fontSize: 14, color: 'rgba(255,255,255,0.25)', maxWidth: 280, lineHeight: 1.7 }}>{subtitle}</div>
            {action && <button className="btn-primary" style={{ marginTop: 8, padding: '12px 32px', fontSize: 13 }} onClick={onAction}>{action}</button>}
        </div>
    );
}

// ── Activity timeline item ─────────────────────────────────────
function ActivityItem({ icon, text, time, color = 'var(--red)' }) {
    return (
        <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: `${color}18`, border: `1px solid ${color}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 14 }}>{icon}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: "'Barlow',sans-serif", fontSize: 13, color: 'rgba(255,255,255,0.65)', lineHeight: 1.5 }}>{text}</div>
                <div style={{ fontFamily: "'Barlow',sans-serif", fontSize: 11, color: 'rgba(255,255,255,0.28)', marginTop: 3 }}>{time}</div>
            </div>
        </div>
    );
}

// ── Prefs toggles ─────────────────────────────────────────────
const PREFS_DEFAULT = [
    { label: 'Order confirmation emails', on: true },
    { label: 'New drop notifications', on: true },
    { label: 'Wishlist price drop alerts', on: false },
];
function TogglePrefs() {
    const [prefs, setPrefs] = useState(PREFS_DEFAULT);
    const toggle = (i) => setPrefs(prev => prev.map((p, idx) => idx === i ? { ...p, on: !p.on } : p));
    return (
        <>
            {prefs.map(({ label, on }, i) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <span style={{ fontFamily: "'Barlow',sans-serif", fontSize: 14, color: 'rgba(255,255,255,0.55)' }}>{label}</span>
                    <button onClick={() => toggle(i)} style={{ width: 44, height: 24, borderRadius: 12, background: on ? 'var(--red)' : 'rgba(255,255,255,0.1)', border: 'none', cursor: 'pointer', transition: 'background 0.3s', position: 'relative', flexShrink: 0 }}>
                        <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'white', position: 'absolute', top: 3, left: on ? 23 : 3, transition: 'left 0.25s cubic-bezier(0.23,1,0.32,1)', boxShadow: '0 1px 4px rgba(0,0,0,0.4)' }} />
                    </button>
                </div>
            ))}
        </>
    );
}

// ══════════════════════════════════════════════════════════════
// ORDER DETAIL MODAL
// Full-page slide-in with: status progress, timeline, items,
// shipping address, tracking, totals.
// ══════════════════════════════════════════════════════════════
function OrderDetailModal({ order: initialOrder, onClose, onOrderCancelled, isMobile, getToken }) {
    const [visible, setVisible] = useState(false);
    const [order, setOrder] = useState(initialOrder);
    const [cancelStep, setCancelStep] = useState('idle');  // idle | confirm | loading | done | error
    const [cancelError, setCancelError] = useState('');

    // Animate in on mount
    useEffect(() => {
        requestAnimationFrame(() => setVisible(true));
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = ''; };
    }, []);

    function handleClose() {
        setVisible(false);
        setTimeout(onClose, 320);
    }

    // Close on Escape
    useEffect(() => {
        const fn = (e) => { if (e.key === 'Escape') handleClose(); };
        window.addEventListener('keydown', fn);
        return () => window.removeEventListener('keydown', fn);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // Cancel order API call
    async function handleConfirmCancel() {
        setCancelStep('loading');
        try {
            const token = await getToken();
            const res = await fetch(
                `${process.env.REACT_APP_API_URL || 'http://localhost:4000'}/api/orders/${order.id}/cancel`,
                { method: 'POST', headers: { Authorization: `Bearer ${token}` } }
            );
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to cancel order.');
            setOrder(data);           // update local order to CANCELLED
            onOrderCancelled(data);   // tell parent to refresh list
            setCancelStep('done');
        } catch (err) {
            setCancelError(err.message);
            setCancelStep('error');
        }
    }

    if (!order) return null;

    const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDING;
    const isCancelled = order.status === 'CANCELLED';
    const isPending = order.status === 'PENDING';

    // Progress step index (0–3) — PENDING=0, PROCESSING=1, SHIPPED=2, DELIVERED=3
    const currentStep = isCancelled ? -1 : STATUS_ORDER.indexOf(order.status);

    const fmtDate = (d) => d
        ? new Date(d).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
        : '—';

    const fmtDateShort = (d) => d
        ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        : '—';

    const displayId = `APX-${order.id?.slice(-8).toUpperCase()}`;

    return (
        <>
            {/* Backdrop */}
            <div
                onClick={handleClose}
                style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)',
                    zIndex: 1100,
                    opacity: visible ? 1 : 0,
                    transition: 'opacity 0.3s ease',
                }}
            />

            {/* Slide-in panel */}
            <div style={{
                position: 'fixed', top: 0, right: 0, bottom: 0,
                width: isMobile ? '100%' : '560px',
                background: '#0e0e0e',
                borderLeft: '1px solid rgba(255,255,255,0.08)',
                zIndex: 1101,
                overflowY: 'auto',
                transform: visible ? 'translateX(0)' : 'translateX(100%)',
                transition: 'transform 0.32s cubic-bezier(0.23,1,0.32,1)',
                display: 'flex',
                flexDirection: 'column',
            }}>

                {/* ── Header ── */}
                <div style={{
                    position: 'sticky', top: 0, zIndex: 10,
                    background: '#0e0e0e', borderBottom: '1px solid rgba(255,255,255,0.07)',
                    padding: '20px 24px',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                    <div>
                        <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 9, letterSpacing: '0.25em', color: 'rgba(255,255,255,0.3)', marginBottom: 4 }}>ORDER DETAILS</div>
                        <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 24, color: 'white', letterSpacing: '0.06em' }}>{displayId}</div>
                    </div>
                    <button onClick={handleClose} style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.5)', transition: 'all 0.2s', flexShrink: 0 }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,34,0,0.12)'; e.currentTarget.style.color = 'var(--red)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                    </button>
                </div>

                {/* ── Content ── */}
                <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 24, flex: 1 }}>

                    {/* Status hero */}
                    <div style={{ background: `${cfg.color}0d`, border: `1px solid ${cfg.color}33`, borderRadius: 10, padding: '20px 22px', display: 'flex', alignItems: 'center', gap: 16 }}>
                        <div style={{ fontSize: 32, lineHeight: 1 }}>{cfg.icon}</div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 26, color: cfg.color, lineHeight: 1, letterSpacing: '0.04em' }}>{cfg.label.toUpperCase()}</div>
                            <div style={{ fontFamily: "'Barlow',sans-serif", fontSize: 13, color: 'rgba(255,255,255,0.45)', marginTop: 3 }}>{cfg.desc}</div>
                        </div>
                        <StatusPill status={order.status} />
                    </div>

                    {/* Progress bar — only for non-cancelled */}
                    {!isCancelled && (
                        <div>
                            <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 9, letterSpacing: '0.22em', color: 'rgba(255,255,255,0.3)', marginBottom: 14 }}>ORDER PROGRESS</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
                                {STATUS_ORDER.map((s, i) => {
                                    const scfg = STATUS_CONFIG[s];
                                    const done = i <= currentStep;
                                    const current = i === currentStep;
                                    return (
                                        <div key={s} style={{ display: 'flex', alignItems: 'center', flex: i < STATUS_ORDER.length - 1 ? 1 : 'none' }}>
                                            {/* Step circle */}
                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, position: 'relative' }}>
                                                <div style={{
                                                    width: current ? 32 : 26, height: current ? 32 : 26,
                                                    borderRadius: '50%',
                                                    background: done ? scfg.color : 'rgba(255,255,255,0.06)',
                                                    border: `2px solid ${done ? scfg.color : 'rgba(255,255,255,0.12)'}`,
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    fontSize: current ? 14 : 11,
                                                    transition: 'all 0.3s',
                                                    boxShadow: current ? `0 0 16px ${scfg.color}55` : 'none',
                                                    flexShrink: 0,
                                                }}>
                                                    {done ? (current ? scfg.icon : '✓') : ''}
                                                </div>
                                                <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 8, letterSpacing: '0.12em', color: done ? scfg.color : 'rgba(255,255,255,0.22)', whiteSpace: 'nowrap', textAlign: 'center', position: 'absolute', top: current ? 38 : 32 }}>
                                                    {scfg.label.toUpperCase()}
                                                </div>
                                            </div>
                                            {/* Connector line */}
                                            {i < STATUS_ORDER.length - 1 && (
                                                <div style={{ flex: 1, height: 2, background: i < currentStep ? cfg.color : 'rgba(255,255,255,0.08)', margin: '0 4px', transition: 'background 0.4s' }} />
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Cancelled banner */}
                    {isCancelled && (
                        <div style={{ background: 'rgba(255,68,68,0.07)', border: '1px solid rgba(255,68,68,0.25)', borderRadius: 8, padding: '16px 20px' }}>
                            <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 12, letterSpacing: '0.14em', color: '#FF4444', marginBottom: 4 }}>ORDER CANCELLED</div>
                            <div style={{ fontFamily: "'Barlow',sans-serif", fontSize: 13, color: 'rgba(255,255,255,0.4)', lineHeight: 1.6 }}>This order has been cancelled. Any payment has been refunded to your original payment method within 5–10 business days.</div>
                        </div>
                    )}

                    {/* Order meta */}
                    <div style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, padding: '18px 20px' }}>
                        <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 9, letterSpacing: '0.22em', color: 'rgba(255,255,255,0.3)', marginBottom: 14 }}>ORDER INFO</div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 20px' }}>
                            {[
                                { label: 'ORDER ID', value: displayId },
                                { label: 'DATE', value: fmtDateShort(order.createdAt) },
                                { label: 'ITEMS', value: `${order.items?.length ?? 0} item${(order.items?.length ?? 0) !== 1 ? 's' : ''}` },
                                { label: 'PAYMENT', value: order.stripePaymentId ? `···${order.stripePaymentId.slice(-6).toUpperCase()}` : 'Card' },
                            ].map(({ label, value }) => (
                                <div key={label}>
                                    <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 9, letterSpacing: '0.18em', color: 'rgba(255,255,255,0.3)', marginBottom: 4 }}>{label}</div>
                                    <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 14, color: 'rgba(255,255,255,0.8)' }}>{value}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Tracking info — only if shipped */}
                    {(order.trackingNumber || order.trackingUrl) && (
                        <div style={{ background: 'rgba(200,80,192,0.06)', border: '1px solid rgba(200,80,192,0.25)', borderRadius: 8, padding: '18px 20px' }}>
                            <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 9, letterSpacing: '0.22em', color: '#C850C0', marginBottom: 14 }}>🚚 TRACKING INFO</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                {order.trackingCarrier && (
                                    <div>
                                        <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 9, letterSpacing: '0.18em', color: 'rgba(255,255,255,0.3)', marginBottom: 3 }}>CARRIER</div>
                                        <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 16, color: 'white' }}>{order.trackingCarrier}</div>
                                    </div>
                                )}
                                {order.trackingNumber && (
                                    <div>
                                        <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 9, letterSpacing: '0.18em', color: 'rgba(255,255,255,0.3)', marginBottom: 3 }}>TRACKING NUMBER</div>
                                        <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 16, color: 'white', letterSpacing: '0.06em' }}>{order.trackingNumber}</div>
                                    </div>
                                )}
                                {(order.trackingUrl || order.trackingNumber) && (
                                    <a
                                        href={order.trackingUrl || `https://www.google.com/search?q=${encodeURIComponent((order.trackingCarrier || '') + ' ' + order.trackingNumber)}`}
                                        target="_blank" rel="noreferrer"
                                        style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 4, padding: '10px 20px', background: '#C850C0', borderRadius: 4, fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 12, letterSpacing: '0.14em', color: 'white', textDecoration: 'none', transition: 'opacity 0.2s', width: 'fit-content' }}
                                        onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                                        onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                                        TRACK MY PACKAGE →
                                    </a>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Items */}
                    <div>
                        <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 9, letterSpacing: '0.22em', color: 'rgba(255,255,255,0.3)', marginBottom: 12 }}>ITEMS IN THIS ORDER</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {order.items?.map((item, i) => {
                                const pid = item.productId ?? 1;
                                const prod = PRODUCTS.find(p => p.id === pid);
                                const name = item.name || prod?.name || `Product #${pid}`;
                                return (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8 }}>
                                        <div style={{ width: 56, height: 56, borderRadius: 6, overflow: 'hidden', flexShrink: 0, background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.07)' }}>
                                            <img src={getShoeImage(pid, 0)} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 14, color: 'white', letterSpacing: '0.04em', marginBottom: 3 }}>{name}</div>
                                            <div style={{ fontFamily: "'Barlow',sans-serif", fontSize: 12, color: 'rgba(255,255,255,0.38)' }}>
                                                US {item.size} &nbsp;·&nbsp; Qty {item.qty}
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                            <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 20, color: 'white', lineHeight: 1 }}>${((item.price ?? 0) * item.qty).toFixed(0)}</div>
                                            {item.qty > 1 && <div style={{ fontFamily: "'Barlow',sans-serif", fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>${(item.price ?? 0).toFixed(0)} each</div>}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Totals */}
                    <div style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, padding: '18px 20px' }}>
                        <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 9, letterSpacing: '0.22em', color: 'rgba(255,255,255,0.3)', marginBottom: 14 }}>ORDER SUMMARY</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ fontFamily: "'Barlow',sans-serif", fontSize: 13, color: 'rgba(255,255,255,0.45)' }}>Subtotal</span>
                                <span style={{ fontFamily: "'Barlow',sans-serif", fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>${(order.subtotal ?? 0).toFixed(2)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ fontFamily: "'Barlow',sans-serif", fontSize: 13, color: 'rgba(255,255,255,0.45)' }}>Shipping</span>
                                <span style={{ fontFamily: "'Barlow',sans-serif", fontSize: 13, color: (order.shipping ?? 0) === 0 ? '#00C851' : 'rgba(255,255,255,0.7)' }}>
                                    {(order.shipping ?? 0) === 0 ? 'FREE' : `$${order.shipping.toFixed(2)}`}
                                </span>
                            </div>
                            <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '4px 0' }} />
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 18, color: 'white', letterSpacing: '0.04em' }}>TOTAL</span>
                                <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 28, color: 'white', letterSpacing: '0.02em' }}>${(order.total ?? 0).toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Shipping address */}
                    {order.address && (
                        <div style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, padding: '18px 20px' }}>
                            <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 9, letterSpacing: '0.22em', color: 'rgba(255,255,255,0.3)', marginBottom: 14 }}>📍 SHIPPING ADDRESS</div>
                            <div style={{ fontFamily: "'Barlow',sans-serif", fontSize: 14, color: 'rgba(255,255,255,0.65)', lineHeight: 1.9 }}>
                                <strong style={{ color: 'white' }}>{order.address.firstName} {order.address.lastName}</strong><br />
                                {order.address.line1}{order.address.line2 ? `, ${order.address.line2}` : ''}<br />
                                {order.address.city}, {order.address.state} {order.address.zip}<br />
                                {order.address.country}
                            </div>
                        </div>
                    )}

                    {/* Timeline / order events */}
                    {order.events?.length > 0 && (
                        <div>
                            <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 9, letterSpacing: '0.22em', color: 'rgba(255,255,255,0.3)', marginBottom: 16 }}>ORDER TIMELINE</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                                {[...order.events].reverse().map((ev, i, arr) => {
                                    const evcfg = STATUS_CONFIG[ev.status] || STATUS_CONFIG.PENDING;
                                    return (
                                        <div key={ev.id || i} style={{ display: 'flex', gap: 14 }}>
                                            {/* Timeline spine */}
                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                                                <div style={{ width: 10, height: 10, borderRadius: '50%', background: evcfg.color, marginTop: 4, boxShadow: `0 0 8px ${evcfg.color}66`, flexShrink: 0 }} />
                                                {i < arr.length - 1 && <div style={{ width: 1, flex: 1, background: 'rgba(255,255,255,0.07)', margin: '4px 0' }} />}
                                            </div>
                                            {/* Content */}
                                            <div style={{ paddingBottom: i < arr.length - 1 ? 20 : 0, flex: 1 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                                                    <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 11, letterSpacing: '0.1em', color: evcfg.color }}>{evcfg.label.toUpperCase()}</span>
                                                    {i === 0 && <span style={{ fontFamily: "'Barlow',sans-serif", fontSize: 9, color: 'rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.05)', borderRadius: 10, padding: '2px 7px', letterSpacing: '0.1em' }}>LATEST</span>}
                                                </div>
                                                {ev.note && <div style={{ fontFamily: "'Barlow',sans-serif", fontSize: 12, color: 'rgba(255,255,255,0.45)', lineHeight: 1.5, marginBottom: 3 }}>{ev.note}</div>}
                                                <div style={{ fontFamily: "'Barlow',sans-serif", fontSize: 11, color: 'rgba(255,255,255,0.22)' }}>{fmtDate(ev.createdAt)}</div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* ── Cancel order — only shown for PENDING ── */}
                    {isPending && cancelStep !== 'done' && (
                        <div style={{ background: 'rgba(255,68,68,0.04)', border: '1px solid rgba(255,68,68,0.18)', borderRadius: 8, padding: '20px 22px' }}>
                            <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 9, letterSpacing: '0.22em', color: 'rgba(255,68,68,0.7)', marginBottom: 10 }}>CANCEL ORDER</div>

                            {cancelStep === 'idle' && (
                                <>
                                    <p style={{ fontFamily: "'Barlow',sans-serif", fontSize: 13, color: 'rgba(255,255,255,0.4)', lineHeight: 1.6, marginBottom: 14 }}>
                                        You can cancel this order while it's still pending. Stock will be restored and any payment will be refunded.
                                    </p>
                                    <button
                                        onClick={() => setCancelStep('confirm')}
                                        style={{ padding: '10px 22px', background: 'transparent', border: '1px solid rgba(255,68,68,0.4)', color: 'rgba(255,68,68,0.8)', fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 11, letterSpacing: '0.14em', cursor: 'pointer', borderRadius: 4, transition: 'all 0.2s' }}
                                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,68,68,0.1)'; e.currentTarget.style.color = '#FF4444'; }}
                                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,68,68,0.8)'; }}>
                                        REQUEST CANCELLATION
                                    </button>
                                </>
                            )}

                            {cancelStep === 'confirm' && (
                                <>
                                    <p style={{ fontFamily: "'Barlow',sans-serif", fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6, marginBottom: 16 }}>
                                        Are you sure you want to cancel <strong style={{ color: 'white' }}>APX-{order.id?.slice(-8).toUpperCase()}</strong>? This cannot be undone.
                                    </p>
                                    <div style={{ display: 'flex', gap: 10 }}>
                                        <button
                                            onClick={handleConfirmCancel}
                                            style={{ padding: '10px 22px', background: '#FF4444', border: 'none', color: 'white', fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 11, letterSpacing: '0.14em', cursor: 'pointer', borderRadius: 4, transition: 'opacity 0.2s' }}
                                            onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                                            onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                                            YES, CANCEL ORDER
                                        </button>
                                        <button
                                            onClick={() => setCancelStep('idle')}
                                            style={{ padding: '10px 22px', background: 'transparent', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.45)', fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 11, letterSpacing: '0.14em', cursor: 'pointer', borderRadius: 4, transition: 'all 0.2s' }}
                                            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; }}
                                            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = 'rgba(255,255,255,0.45)'; }}>
                                            KEEP ORDER
                                        </button>
                                    </div>
                                </>
                            )}

                            {cancelStep === 'loading' && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <div style={{ width: 16, height: 16, border: '2px solid rgba(255,68,68,0.3)', borderTopColor: '#FF4444', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                                    <span style={{ fontFamily: "'Barlow',sans-serif", fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>Cancelling your order…</span>
                                </div>
                            )}

                            {cancelStep === 'error' && (
                                <>
                                    <p style={{ fontFamily: "'Barlow',sans-serif", fontSize: 13, color: '#FF4444', marginBottom: 12 }}>{cancelError}</p>
                                    <button
                                        onClick={() => { setCancelStep('idle'); setCancelError(''); }}
                                        style={{ padding: '8px 18px', background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.5)', fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 10, letterSpacing: '0.12em', cursor: 'pointer', borderRadius: 4 }}>
                                        TRY AGAIN
                                    </button>
                                </>
                            )}
                        </div>
                    )}

                    {/* Cancellation success message */}
                    {cancelStep === 'done' && (
                        <div style={{ background: 'rgba(255,68,68,0.07)', border: '1px solid rgba(255,68,68,0.3)', borderRadius: 8, padding: '20px 22px', display: 'flex', alignItems: 'center', gap: 14 }}>
                            <div style={{ fontSize: 28, lineHeight: 1 }}>✓</div>
                            <div>
                                <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 18, color: '#FF4444', letterSpacing: '0.04em', marginBottom: 4 }}>ORDER CANCELLED</div>
                                <div style={{ fontFamily: "'Barlow',sans-serif", fontSize: 12, color: 'rgba(255,255,255,0.4)', lineHeight: 1.6 }}>Your order has been cancelled and stock restored. Any payment will be refunded within 5–10 business days.</div>
                            </div>
                        </div>
                    )}

                    {/* Footer spacer */}
                    <div style={{ height: 24 }} />
                </div>
            </div>
        </>
    );
}

// ── Order row ─────────────────────────────────────────────────
function OrderRow({ order, index, isMobile, onView, onDelete }) {
    const [expanded, setExpanded] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const firstItem = order.items?.[0];
    const productId = firstItem?.productId ?? 1;
    const canDelete = order.status === 'CANCELLED' || order.status === 'DELIVERED';

    return (
        <div style={{
            background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 8, overflow: 'hidden', transition: 'border-color 0.2s',
            animation: `fadeUp 0.4s ${0.05 * index}s both`,
        }}>
            {/* Main row — click to expand */}
            <div
                style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 12 : 20, padding: isMobile ? '16px' : '20px 24px', cursor: 'pointer', flexWrap: isMobile ? 'wrap' : 'nowrap' }}
                onClick={() => setExpanded(e => !e)}>
                {/* Thumbnail */}
                <div style={{ width: 60, height: 60, borderRadius: 6, overflow: 'hidden', flexShrink: 0, background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.07)' }}>
                    <img src={getShoeImage(productId, 0)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>

                {/* ID + date */}
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 17, color: 'white', letterSpacing: '0.06em' }}>
                        APX-{order.id?.slice(-8).toUpperCase() || 'ORDER'}
                    </div>
                    <div style={{ fontFamily: "'Barlow',sans-serif", fontSize: 12, color: 'rgba(255,255,255,0.35)', marginTop: 3 }}>
                        {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        {' · '}
                        {order.items?.length ?? 0} item{(order.items?.length ?? 0) !== 1 ? 's' : ''}
                    </div>
                </div>

                {!isMobile && <StatusPill status={order.status} />}

                <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 26, color: 'white', flexShrink: 0 }}>
                    ${(order.total ?? 0).toFixed(0)}
                </div>

                <div style={{ color: 'rgba(255,255,255,0.3)', flexShrink: 0, transition: 'transform 0.3s', transform: expanded ? 'rotate(180deg)' : 'none' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="6 9 12 15 18 9" /></svg>
                </div>
            </div>

            {/* Expanded preview */}
            {expanded && (
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '16px 24px 20px', background: 'rgba(0,0,0,0.2)' }}>
                    {isMobile && <div style={{ marginBottom: 12 }}><StatusPill status={order.status} /></div>}

                    {order.items?.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {order.items.map((item, i) => {
                                const pid = item.productId ?? 1;
                                const prod = PRODUCTS.find(p => p.id === pid);
                                return (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: 6, border: '1px solid rgba(255,255,255,0.05)' }}>
                                        <div style={{ width: 44, height: 44, borderRadius: 4, overflow: 'hidden', flexShrink: 0, background: '#1a1a1a' }}>
                                            <img src={getShoeImage(pid, 0)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 13, color: 'rgba(255,255,255,0.8)', letterSpacing: '0.04em' }}>{item.name || prod?.name || `Product #${pid}`}</div>
                                            <div style={{ fontFamily: "'Barlow',sans-serif", fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>US {item.size} · Qty {item.qty}</div>
                                        </div>
                                        <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 18, color: 'rgba(255,255,255,0.7)' }}>${((item.price ?? 0) * item.qty).toFixed(0)}</div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div style={{ fontFamily: "'Barlow',sans-serif", fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>No item details available.</div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.05)', gap: 10, flexWrap: 'wrap' }}>
                        <div style={{ fontFamily: "'Barlow',sans-serif", fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>
                            Shipping: {order.shipping > 0 ? `$${order.shipping.toFixed(2)}` : 'FREE'} · Total: ${(order.total ?? 0).toFixed(2)}
                        </div>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                            {/* Delete button — only for CANCELLED or DELIVERED */}
                            {canDelete && !confirmDelete && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); setConfirmDelete(true); }}
                                    style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 10, letterSpacing: '0.12em', padding: '9px 16px', background: 'transparent', border: '1px solid rgba(255,68,68,0.28)', color: 'rgba(255,68,68,0.65)', cursor: 'pointer', borderRadius: 4, transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 6 }}
                                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,68,68,0.1)'; e.currentTarget.style.borderColor = 'rgba(255,68,68,0.5)'; e.currentTarget.style.color = '#FF4444'; }}
                                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(255,68,68,0.28)'; e.currentTarget.style.color = 'rgba(255,68,68,0.65)'; }}>
                                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M9 6V4h6v2" /></svg>
                                    REMOVE
                                </button>
                            )}
                            {/* Confirm delete */}
                            {confirmDelete && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <span style={{ fontFamily: "'Barlow',sans-serif", fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>Remove this order?</span>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onDelete(order.id); }}
                                        style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 10, letterSpacing: '0.1em', padding: '7px 14px', background: 'rgba(255,68,68,0.15)', border: '1px solid rgba(255,68,68,0.4)', color: '#FF4444', cursor: 'pointer', borderRadius: 4 }}>
                                        YES, REMOVE
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setConfirmDelete(false); }}
                                        style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 10, letterSpacing: '0.1em', padding: '7px 14px', background: 'transparent', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', borderRadius: 4 }}>
                                        CANCEL
                                    </button>
                                </div>
                            )}
                            <button
                                onClick={(e) => { e.stopPropagation(); onView(order); }}
                                style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 10, letterSpacing: '0.14em', padding: '9px 20px', background: 'var(--red)', border: 'none', color: 'white', cursor: 'pointer', borderRadius: 4, transition: 'all 0.2s' }}
                                onMouseEnter={e => e.currentTarget.style.background = '#cc1a00'}
                                onMouseLeave={e => e.currentTarget.style.background = 'var(--red)'}>
                                VIEW DETAILS →
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// ═════════════════════════════════════════════════════════════
//  MAIN PROFILE PAGE
// ═════════════════════════════════════════════════════════════
export default function ProfilePage() {
    const { user, logout, isLoggedIn, isLoaded, getToken } = useAuth();
    const { wishlistItems, toggleWishlist, removeFromWishlist } = useWishlist();
    const { addToCart } = useCart();
    const addToast = useToast();
    const navigate = useNavigate();
    const { isMobile, isTablet } = useBreakpoint();
    const px = isMobile ? 16 : isTablet ? 32 : 48;

    const [activeTab, setActiveTab] = useState('orders');
    const [entered, setEntered] = useState(false);
    const [orders, setOrders] = useState([]);
    const [ordersLoading, setOrdersLoading] = useState(true);
    const [statsLoading, setStatsLoading] = useState(true);
    const [stats, setStats] = useState({ orderCount: 0, totalSpent: 0, apexPoints: 0 });

    // ── Order detail modal ───────────────────────────────────
    const [selectedOrder, setSelectedOrder] = useState(null);

    // ── Redirect if not logged in ────────────────────────────
    useEffect(() => {
        if (!isLoaded) return;
        if (!isLoggedIn) { navigate('/sign-in'); return; }
        requestAnimationFrame(() => setEntered(true));
    }, [isLoaded, isLoggedIn, navigate]);

    // ── Fetch orders ─────────────────────────────────────────
    const fetchOrders = useCallback(async () => {
        if (!isLoggedIn || !getToken) return;
        try {
            setOrdersLoading(true);
            const token = await getToken();
            const data = await api.get('/orders', token);
            const list = Array.isArray(data) ? data : [];
            setOrders(list);
            const totalSpent = list.reduce((s, o) => s + (o.total ?? 0), 0);
            const apexPoints = Math.floor(totalSpent * 2.14);
            setStats({ orderCount: list.length, totalSpent, apexPoints });
        } catch (err) {
            console.warn('[ProfilePage] Could not fetch orders:', err.message);
            setOrders([]);
            setStats({ orderCount: 0, totalSpent: 0, apexPoints: 0 });
        } finally {
            setOrdersLoading(false);
            setStatsLoading(false);
        }
    }, [isLoggedIn, getToken]);

    useEffect(() => { fetchOrders(); }, [fetchOrders]);

    // ── Handlers ─────────────────────────────────────────────
    const handleLogout = async () => {
        await logout();
        addToast('info', 'Signed out', 'See you next time!');
        navigate('/');
    };

    const handleViewOrder = (order) => setSelectedOrder(order);

    const handleDeleteOrder = async (orderId) => {
        // Optimistic update — remove from UI immediately
        setOrders(prev => prev.filter(o => o.id !== orderId));
        try {
            const token = await getToken();
            await api.delete(`/orders/${orderId}`, token);
            addToast('success', 'Order removed', 'Order removed from your history.');
        } catch (err) {
            // Revert on failure — re-fetch to restore accurate list
            fetchOrders();
            addToast('error', 'Delete failed', err?.message || 'Could not remove order.');
        }
    };

    const handleMoveToCart = (product) => {
        addToCart(product);
        removeFromWishlist(product.id);
    };

    if (!isLoaded || !user) return null;

    const initials = (user.name || 'A B').split(' ').map(w => w[0]).filter(Boolean).join('').slice(0, 2).toUpperCase();
    const memberSince = user.createdAt
        ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
        : new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    const activityFeed = [
        ...wishlistItems.slice(0, 3).map(p => ({ icon: '♥', color: '#C850C0', text: `Added ${p.name} to wishlist`, time: 'Recently' })),
        ...orders.slice(0, 4).map(o => ({ icon: '📦', color: '#00C851', text: `Order APX-${o.id?.slice(-8).toUpperCase()} — ${STATUS_CONFIG[o.status]?.label ?? o.status}`, time: new Date(o.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) })),
    ].slice(0, 6);

    const TABS = [
        { id: 'orders', label: 'ORDER HISTORY', count: stats.orderCount },
        { id: 'wishlist', label: 'WISHLIST', count: wishlistItems.length },
        { id: 'activity', label: 'ACTIVITY' },
        { id: 'settings', label: 'SETTINGS' },
    ];

    return (
        <div style={{ paddingTop: 64, minHeight: '100vh', background: '#080808' }}>

            {/* ── ORDER DETAIL MODAL ──────────────────────────── */}
            {selectedOrder && (
                <OrderDetailModal
                    order={selectedOrder}
                    onClose={() => setSelectedOrder(null)}
                    onOrderCancelled={(updatedOrder) => {
                        setOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
                        setSelectedOrder(updatedOrder);
                    }}
                    getToken={getToken}
                    isMobile={isMobile}
                />
            )}

            {/* ── HERO BANNER ──────────────────────────────────── */}
            <div style={{ position: 'relative', overflow: 'hidden', background: 'linear-gradient(135deg,#0c0c0c 0%,#110808 60%,#0c0c0c 100%)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,34,0,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,34,0,0.03) 1px,transparent 1px)', backgroundSize: '48px 48px', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', top: '-20%', right: '5%', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle,rgba(255,34,0,0.07) 0%,transparent 65%)', pointerEvents: 'none' }} />

                <div style={{ maxWidth: 1200, margin: '0 auto', padding: `${isMobile ? 36 : 52}px ${px}px`, position: 'relative', display: 'flex', alignItems: 'center', gap: isMobile ? 16 : 32, flexWrap: 'wrap' }}>
                    {/* Avatar */}
                    <div style={{
                        width: isMobile ? 68 : 88, height: isMobile ? 68 : 88, borderRadius: '50%', flexShrink: 0,
                        background: user.avatar ? 'transparent' : 'linear-gradient(135deg,var(--red) 0%,#ff6b00 100%)',
                        border: '2px solid rgba(255,34,0,0.35)', boxShadow: '0 0 32px rgba(255,34,0,0.22)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
                        opacity: entered ? 1 : 0, transform: entered ? 'scale(1)' : 'scale(0.75)',
                        transition: 'opacity 0.5s, transform 0.5s cubic-bezier(0.23,1,0.32,1)',
                    }}>
                        {user.avatar
                            ? <img src={user.avatar} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            : <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: isMobile ? 26 : 34, color: 'white', lineHeight: 1 }}>{initials}</span>
                        }
                    </div>

                    {/* Name */}
                    <div style={{ flex: 1, minWidth: 0, opacity: entered ? 1 : 0, transform: entered ? 'translateY(0)' : 'translateY(14px)', transition: 'opacity 0.5s 0.1s, transform 0.5s 0.1s' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
                            <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 9, letterSpacing: '0.28em', color: 'var(--red)', background: 'rgba(255,34,0,0.1)', border: '1px solid rgba(255,34,0,0.25)', padding: '3px 10px', borderRadius: 2 }}>APEX MEMBER</span>
                            <span style={{ fontFamily: "'Barlow',sans-serif", fontSize: 11, color: 'rgba(255,255,255,0.28)' }}>Since {memberSince}</span>
                        </div>
                        <h1 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: isMobile ? 30 : 46, letterSpacing: '0.04em', color: 'white', lineHeight: 1, marginBottom: 4 }}>{(user.name || 'Member').toUpperCase()}</h1>
                        <div style={{ fontFamily: "'Barlow',sans-serif", fontSize: 13, color: 'rgba(255,255,255,0.38)' }}>{user.email}</div>
                    </div>

                    <button onClick={handleLogout}
                        style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 10, letterSpacing: '0.16em', padding: '10px 22px', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.38)', cursor: 'pointer', borderRadius: 4, transition: 'all 0.2s', flexShrink: 0 }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,34,0,0.5)'; e.currentTarget.style.color = 'var(--red)'; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'rgba(255,255,255,0.38)'; }}>
                        SIGN OUT
                    </button>
                </div>
            </div>

            {/* ── STATS ────────────────────────────────────────── */}
            <div style={{ maxWidth: 1200, margin: '0 auto', padding: `28px ${px}px 0`, opacity: entered ? 1 : 0, transform: entered ? 'translateY(0)' : 'translateY(16px)', transition: 'opacity 0.5s 0.18s, transform 0.5s 0.18s' }}>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    <StatCard icon="📦" label="ORDERS PLACED" value={stats.orderCount} loading={statsLoading} />
                    <StatCard icon="♥" label="WISHLIST ITEMS" value={wishlistItems.length} loading={false} accent="#C850C0" />
                    <StatCard icon="💸" label="TOTAL SPENT" value={stats.totalSpent} prefix="$" loading={statsLoading} accent="#FFB800" />
                    <StatCard icon="⚡" label="APEX POINTS" value={stats.apexPoints} loading={statsLoading} accent="#00C851" />
                </div>
            </div>

            {/* ── TABS ─────────────────────────────────────────── */}
            <div style={{ maxWidth: 1200, margin: '0 auto', padding: `28px ${px}px 80px` }}>
                <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.07)', marginBottom: 28, overflowX: 'auto' }}>
                    {TABS.map(({ id, label, count }) => (
                        <button key={id} onClick={() => setActiveTab(id)} style={{
                            fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: isMobile ? 10 : 11, letterSpacing: '0.15em',
                            padding: isMobile ? '12px 14px' : '14px 22px',
                            background: 'none', border: 'none', whiteSpace: 'nowrap',
                            borderBottom: `2px solid ${activeTab === id ? 'var(--red)' : 'transparent'}`,
                            color: activeTab === id ? 'white' : 'rgba(255,255,255,0.3)',
                            cursor: 'pointer', transition: 'color 0.2s, border-color 0.2s', marginBottom: -1,
                        }}>
                            {label}
                            {count !== undefined && count > 0 && (
                                <span style={{ marginLeft: 6, fontFamily: "'Barlow',sans-serif", fontSize: 10, background: activeTab === id ? 'var(--red)' : 'rgba(255,255,255,0.12)', color: 'white', borderRadius: 10, padding: '1px 7px' }}>{count}</span>
                            )}
                        </button>
                    ))}
                </div>

                {/* ══ ORDERS TAB ══════════════════════════════════ */}
                {activeTab === 'orders' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {ordersLoading ? (
                            Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '20px 24px', display: 'flex', gap: 16, alignItems: 'center' }}>
                                    <Skeleton w={60} h={60} radius={6} />
                                    <div style={{ flex: 1 }}><Skeleton w="40%" h={16} mb={8} /><Skeleton w="25%" h={11} /></div>
                                    <Skeleton w={80} h={24} />
                                </div>
                            ))
                        ) : orders.length > 0 ? (
                            orders.map((order, i) => (
                                <OrderRow key={order.id} order={order} index={i} isMobile={isMobile} onView={handleViewOrder} onDelete={handleDeleteOrder} />
                            ))
                        ) : (
                            <EmptyState icon="📦" title="NO ORDERS YET" subtitle="Your order history will appear here after your first purchase." action="SHOP NOW →" onAction={() => navigate('/collection')} />
                        )}
                    </div>
                )}

                {/* ══ WISHLIST TAB ════════════════════════════════ */}
                {activeTab === 'wishlist' && (
                    <div>
                        {wishlistItems.length > 0 ? (
                            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${isMobile ? 2 : isTablet ? 3 : 4}, 1fr)`, gap: isMobile ? 10 : 16 }}>
                                {wishlistItems.map((p, i) => (
                                    <div key={p.id} style={{ background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, overflow: 'hidden', animation: `fadeUp 0.4s ${0.05 * i}s both`, position: 'relative' }}>
                                        <div style={{ height: isMobile ? 130 : 160, overflow: 'hidden', background: `linear-gradient(135deg,${p.color || '#111'}22,${p.accent || '#333'}18)`, cursor: 'pointer', position: 'relative' }} onClick={() => navigate(`/product/${p.id}`)}>
                                            <img src={getShoeImage(p.id, 0)} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s' }}
                                                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.06)'}
                                                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'} />
                                            <button onClick={e => { e.stopPropagation(); toggleWishlist(p); }}
                                                style={{ position: 'absolute', top: 8, right: 8, width: 28, height: 28, borderRadius: '50%', background: 'rgba(0,0,0,0.65)', border: '1px solid rgba(255,255,255,0.15)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ff4444', transition: 'all 0.2s', backdropFilter: 'blur(4px)' }}
                                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,68,68,0.25)'}
                                                onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0.65)'}>
                                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                                            </button>
                                        </div>
                                        <div style={{ padding: '12px 14px 14px' }}>
                                            <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 9, letterSpacing: '0.18em', color: 'rgba(255,255,255,0.3)', marginBottom: 3 }}>{p.brand}</div>
                                            <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: isMobile ? 14 : 16, color: 'white', marginBottom: 4, letterSpacing: '0.04em', lineHeight: 1.1 }}>{p.name}</div>
                                            <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: isMobile ? 18 : 22, color: p.accent || 'var(--red)', marginBottom: 12 }}>${p.price}</div>
                                            <div style={{ display: 'flex', gap: 6 }}>
                                                <button onClick={() => handleMoveToCart(p)} style={{ flex: 1, padding: '8px 0', fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 10, letterSpacing: '0.12em', background: 'var(--red)', border: 'none', color: 'white', cursor: 'pointer', borderRadius: 4, transition: 'background 0.2s' }}
                                                    onMouseEnter={e => e.currentTarget.style.background = '#cc1a00'}
                                                    onMouseLeave={e => e.currentTarget.style.background = 'var(--red)'}>ADD TO CART</button>
                                                <button onClick={() => navigate(`/product/${p.id}`)} style={{ padding: '8px 12px', fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 10, letterSpacing: '0.1em', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', borderRadius: 4, transition: 'all 0.2s' }}
                                                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'; e.currentTarget.style.color = 'white'; }}
                                                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; }}>VIEW</button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <EmptyState icon="♥" title="WISHLIST IS EMPTY" subtitle="Save the sneakers you love and they'll appear here for easy access." action="EXPLORE KICKS →" onAction={() => navigate('/collection')} />
                        )}
                    </div>
                )}

                {/* ══ ACTIVITY TAB ════════════════════════════════ */}
                {activeTab === 'activity' && (
                    <div style={{ maxWidth: 640 }}>
                        {activityFeed.length > 0 ? (
                            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, padding: '8px 20px' }}>
                                <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 10, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.3)', padding: '12px 0 4px' }}>RECENT ACTIVITY</div>
                                {activityFeed.map((item, i) => <ActivityItem key={i} {...item} />)}
                            </div>
                        ) : (
                            <EmptyState icon="⚡" title="NO ACTIVITY YET" subtitle="Your orders, wishlist saves, and site activity will appear here." action="START EXPLORING →" onAction={() => navigate('/collection')} />
                        )}
                        <div style={{ marginTop: 20, background: 'linear-gradient(135deg,rgba(0,200,81,0.07),rgba(0,153,204,0.05))', border: '1px solid rgba(0,200,81,0.2)', borderRadius: 8, padding: '22px 24px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                                <div>
                                    <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 9, letterSpacing: '0.24em', color: '#00C851', marginBottom: 6 }}>⚡ APEX REWARDS</div>
                                    <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 32, color: '#00C851', lineHeight: 1 }}>{stats.apexPoints.toLocaleString()} PTS</div>
                                    <div style={{ fontFamily: "'Barlow',sans-serif", fontSize: 12, color: 'rgba(255,255,255,0.35)', marginTop: 4 }}>Earn 2 pts per $1 spent · {Math.max(0, 5000 - stats.apexPoints).toLocaleString()} pts to next tier</div>
                                </div>
                                <div style={{ background: 'rgba(0,200,81,0.1)', border: '1px solid rgba(0,200,81,0.2)', borderRadius: 6, padding: '10px 18px', textAlign: 'center' }}>
                                    <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 14, color: '#00C851', letterSpacing: '0.1em' }}>
                                        {stats.apexPoints < 1000 ? 'MEMBER' : stats.apexPoints < 5000 ? 'SILVER' : stats.apexPoints < 15000 ? 'GOLD' : 'ELITE'}
                                    </div>
                                    <div style={{ fontFamily: "'Barlow',sans-serif", fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>Current tier</div>
                                </div>
                            </div>
                            <div style={{ marginTop: 16, height: 4, background: 'rgba(255,255,255,0.07)', borderRadius: 2, overflow: 'hidden' }}>
                                <div style={{ height: '100%', width: `${Math.min(100, (stats.apexPoints / 5000) * 100)}%`, background: 'linear-gradient(90deg,#00C851,#0099CC)', borderRadius: 2, transition: 'width 1s ease' }} />
                            </div>
                        </div>
                    </div>
                )}

                {/* ══ SETTINGS TAB ════════════════════════════════ */}
                {activeTab === 'settings' && (
                    <div style={{ maxWidth: 560 }}>
                        <div style={{ marginBottom: 32 }}>
                            <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 10, letterSpacing: '0.22em', color: 'rgba(255,255,255,0.35)', marginBottom: 16, paddingBottom: 10, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>PROFILE INFORMATION</div>
                            {[
                                { label: 'FULL NAME', value: user.name },
                                { label: 'EMAIL ADDRESS', value: user.email },
                                { label: 'MEMBER SINCE', value: memberSince },
                            ].map(({ label, value }) => (
                                <div key={label} style={{ marginBottom: 18 }}>
                                    <label style={{ display: 'block', fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 9, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.35)', marginBottom: 8 }}>{label}</label>
                                    <input value={value || ''} readOnly onChange={() => { }}
                                        style={{ width: '100%', padding: '13px 16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 6, color: 'rgba(255,255,255,0.6)', fontFamily: "'Barlow',sans-serif", fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
                                </div>
                            ))}
                            <p style={{ fontFamily: "'Barlow',sans-serif", fontSize: 12, color: 'rgba(255,255,255,0.25)', lineHeight: 1.7, marginTop: 8 }}>
                                To update your name or email, visit your{' '}
                                <a href="https://accounts.clerk.dev/user" target="_blank" rel="noreferrer" style={{ color: 'var(--red)', textDecoration: 'underline' }}>Clerk account settings</a>.
                            </p>
                        </div>
                        <div style={{ marginBottom: 32 }}>
                            <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 10, letterSpacing: '0.22em', color: 'rgba(255,255,255,0.35)', marginBottom: 16, paddingBottom: 10, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>PREFERENCES</div>
                            <TogglePrefs />
                        </div>
                        <div style={{ padding: '24px', background: 'rgba(255,34,0,0.04)', border: '1px solid rgba(255,34,0,0.18)', borderRadius: 8 }}>
                            <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 10, letterSpacing: '0.2em', color: 'rgba(255,34,0,0.7)', marginBottom: 12 }}>DANGER ZONE</div>
                            <button onClick={handleLogout}
                                style={{ padding: '11px 24px', background: 'rgba(255,34,0,0.08)', border: '1px solid rgba(255,34,0,0.3)', color: 'rgba(255,34,0,0.8)', fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 11, letterSpacing: '0.15em', cursor: 'pointer', borderRadius: 4, transition: 'all 0.2s' }}
                                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,34,0,0.15)'; e.currentTarget.style.color = 'var(--red)'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,34,0,0.08)'; e.currentTarget.style.color = 'rgba(255,34,0,0.8)'; }}>
                                SIGN OUT OF APEX
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:none; } }
        @keyframes spin    { to { transform: rotate(360deg); } }
      `}</style>
        </div>
    );
}