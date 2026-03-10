// apex-kicks/src/pages/OrderDetailPage.jsx
//
// Phase 3 — Order Tracking & Status
//
// Shows a single order with:
//   - Status badge + animated progress bar across all 5 stages
//   - Live timeline of OrderEvents (PENDING → PROCESSING → SHIPPED → DELIVERED)
//   - Tracking number + carrier link (if shipped)
//   - Full item breakdown with product images
//   - Shipping address summary
//   - Cost breakdown

import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getShoeImage } from '../data/shoeImages';
import { PRODUCTS } from '../data/products';
import api from '../lib/api';
import useBreakpoint from '../hooks/useBreakPoint';

// ── Status config ─────────────────────────────────────────────
const STATUS_CONFIG = {
    PENDING: { color: '#FFB800', bg: 'rgba(255,184,0,0.1)', label: 'Pending', icon: '🕐', desc: 'Awaiting payment confirmation' },
    PROCESSING: { color: '#0099CC', bg: 'rgba(0,153,204,0.1)', label: 'Processing', icon: '⚙️', desc: 'Payment confirmed, preparing order' },
    SHIPPED: { color: '#C850C0', bg: 'rgba(200,80,192,0.1)', label: 'Shipped', icon: '🚚', desc: 'On its way to you' },
    DELIVERED: { color: '#00C851', bg: 'rgba(0,200,81,0.1)', label: 'Delivered', icon: '✅', desc: 'Your order has arrived' },
    CANCELLED: { color: '#FF4444', bg: 'rgba(255,68,68,0.1)', label: 'Cancelled', icon: '✕', desc: 'Order was cancelled' },
};

// The ordered stages for the progress track (cancelled breaks out separately)
const STAGES = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED'];

function stageIndex(status) {
    const i = STAGES.indexOf(status);
    return i === -1 ? 0 : i;
}

// ── Status pill ───────────────────────────────────────────────
function StatusPill({ status }) {
    const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.PENDING;
    return (
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '7px 16px', background: cfg.bg, borderRadius: 20, border: `1px solid ${cfg.color}44` }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: cfg.color, boxShadow: `0 0 8px ${cfg.color}`, flexShrink: 0 }} />
            <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 11, letterSpacing: '0.16em', color: cfg.color }}>{cfg.label.toUpperCase()}</span>
        </div>
    );
}

// ── Animated progress track ───────────────────────────────────
function StatusTrack({ status, isMobile }) {
    const [animated, setAnimated] = useState(false);
    const cancelled = status === 'CANCELLED';
    const current = stageIndex(status);

    useEffect(() => {
        const t = setTimeout(() => setAnimated(true), 200);
        return () => clearTimeout(t);
    }, []);

    if (cancelled) {
        return (
            <div style={{ padding: '20px 0', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,68,68,0.12)', border: '2px solid #FF4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FF4444" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                </div>
                <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 13, letterSpacing: '0.12em', color: '#FF4444' }}>ORDER CANCELLED</span>
            </div>
        );
    }

    return (
        <div style={{ padding: '8px 0 4px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', position: 'relative' }}>

                {/* Progress line behind the dots */}
                <div style={{ position: 'absolute', top: 17, left: 17, right: 17, height: 2, background: 'rgba(255,255,255,0.08)', zIndex: 0 }} />
                <div style={{
                    position: 'absolute', top: 17, left: 17, height: 2,
                    width: animated ? `calc(${(current / (STAGES.length - 1)) * 100}% * ((100% - 34px) / 100%))` : '0%',
                    background: `linear-gradient(90deg, ${STATUS_CONFIG[STAGES[0]].color}, ${STATUS_CONFIG[status].color})`,
                    transition: 'width 0.8s cubic-bezier(0.23,1,0.32,1)',
                    zIndex: 1,
                    // Approximate: fill proportionally across the track
                    maxWidth: `calc(${(current / (STAGES.length - 1)) * 100}% - ${(current / (STAGES.length - 1)) * 34}px + ${current > 0 ? 17 : 0}px)`,
                }} />

                {STAGES.map((stage, i) => {
                    const done = i <= current;
                    const active = i === current;
                    const cfg = STATUS_CONFIG[stage];
                    return (
                        <div key={stage} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: i === 0 ? 'flex-start' : i === STAGES.length - 1 ? 'flex-end' : 'center', position: 'relative', zIndex: 2 }}>
                            {/* Dot */}
                            <div style={{
                                width: 34, height: 34, borderRadius: '50%',
                                background: done ? cfg.color : 'rgba(255,255,255,0.06)',
                                border: `2px solid ${done ? cfg.color : 'rgba(255,255,255,0.12)'}`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                transition: 'all 0.5s ease',
                                boxShadow: active ? `0 0 16px ${cfg.color}66` : 'none',
                                flexShrink: 0,
                            }}>
                                {done
                                    ? (active
                                        ? <span style={{ fontSize: 14 }}>{cfg.icon}</span>
                                        : <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                                    )
                                    : <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 11, color: 'rgba(255,255,255,0.2)' }}>{i + 1}</span>
                                }
                            </div>

                            {/* Label */}
                            <div style={{
                                fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700,
                                fontSize: isMobile ? 8 : 9, letterSpacing: '0.14em',
                                color: active ? cfg.color : done ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.2)',
                                marginTop: 8, whiteSpace: 'nowrap',
                                textAlign: i === 0 ? 'left' : i === STAGES.length - 1 ? 'right' : 'center',
                                transition: 'color 0.4s',
                            }}>{cfg.label.toUpperCase()}</div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// ── Timeline event row ────────────────────────────────────────
function TimelineEvent({ event, isLast }) {
    const cfg = STATUS_CONFIG[event.status] || STATUS_CONFIG.PENDING;
    const date = new Date(event.createdAt);
    return (
        <div style={{ display: 'flex', gap: 16, position: 'relative' }}>
            {/* Vertical line */}
            {!isLast && (
                <div style={{ position: 'absolute', left: 15, top: 32, bottom: -8, width: 2, background: 'rgba(255,255,255,0.06)' }} />
            )}
            {/* Dot */}
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: cfg.bg, border: `1px solid ${cfg.color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                <span style={{ fontSize: 12 }}>{cfg.icon}</span>
            </div>
            {/* Content */}
            <div style={{ flex: 1, paddingBottom: isLast ? 0 : 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 4 }}>
                    <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 12, letterSpacing: '0.1em', color: cfg.color }}>{cfg.label.toUpperCase()}</span>
                    <span style={{ fontFamily: "'Barlow',sans-serif", fontSize: 11, color: 'rgba(255,255,255,0.28)' }}>
                        {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        {' · '}
                        {date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                    </span>
                </div>
                {event.note && (
                    <div style={{ fontFamily: "'Barlow',sans-serif", fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>{event.note}</div>
                )}
            </div>
        </div>
    );
}

// ── Skeleton loader ───────────────────────────────────────────
function Skeleton({ w = '100%', h = 16, radius = 4, mb = 0 }) {
    return <div style={{ width: w, height: h, borderRadius: radius, background: 'rgba(255,255,255,0.06)', marginBottom: mb, animation: 'shimmer 1.4s infinite' }} />;
}

// ── Section card ──────────────────────────────────────────────
function Card({ children, style = {} }) {
    return (
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, padding: '24px', ...style }}>
            {children}
        </div>
    );
}

function SectionLabel({ children }) {
    return (
        <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 9, letterSpacing: '0.24em', color: 'rgba(255,255,255,0.3)', marginBottom: 16, paddingBottom: 10, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            {children}
        </div>
    );
}

// ═════════════════════════════════════════════════════════════
// MAIN PAGE
// ═════════════════════════════════════════════════════════════
export default function OrderDetailPage() {
    const { id } = useParams();
    const { isLoggedIn, getToken, isLoaded } = useAuth();
    const addToast = useToast();
    const navigate = useNavigate();
    const { isMobile } = useBreakpoint();

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [entered, setEntered] = useState(false);

    const px = isMobile ? 16 : 48;

    const fetchOrder = useCallback(async () => {
        if (!isLoggedIn || !getToken) return;
        try {
            setLoading(true);
            const token = await getToken();
            const data = await api.get(`/orders/${id}`, token);
            setOrder(data);
            requestAnimationFrame(() => setEntered(true));
        } catch (err) {
            console.error('[OrderDetailPage]', err.message);
            addToast('error', 'Order not found', 'This order does not exist or belongs to another account.');
            navigate('/profile');
        } finally {
            setLoading(false);
        }
    }, [id, isLoggedIn, getToken, addToast, navigate]);

    useEffect(() => {
        if (!isLoaded) return;
        if (!isLoggedIn) { navigate('/sign-in'); return; }
        fetchOrder();
    }, [isLoaded, isLoggedIn, fetchOrder, navigate]);

    // ── Helpers ────────────────────────────────────────────────
    const displayId = order ? `APX-${order.id.slice(-8).toUpperCase()}` : '—';
    const cfg = order ? (STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDING) : null;

    const estimatedDelivery = () => {
        if (!order) return null;
        if (order.status === 'DELIVERED') return null;
        if (order.status === 'CANCELLED') return null;
        const base = new Date(order.createdAt);
        const days = order.status === 'SHIPPED' ? 2 : order.status === 'PROCESSING' ? 4 : 7;
        base.setDate(base.getDate() + days);
        return base.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    };

    // ── Loading skeleton ───────────────────────────────────────
    if (loading) return (
        <div style={{ paddingTop: 64, minHeight: '100vh', background: '#080808' }}>
            <div style={{ maxWidth: 900, margin: '0 auto', padding: `48px ${px}px 80px` }}>
                <Skeleton w={120} h={12} mb={24} />
                <Skeleton w="55%" h={44} mb={12} />
                <Skeleton w="35%" h={16} mb={40} />
                <Skeleton h={120} radius={8} mb={16} />
                <Skeleton h={200} radius={8} mb={16} />
                <Skeleton h={160} radius={8} />
            </div>
            <style>{`@keyframes shimmer { 0%{opacity:.6} 50%{opacity:1} 100%{opacity:.6} }`}</style>
        </div>
    );

    if (!order) return null;

    const eta = estimatedDelivery();

    return (
        <div style={{ paddingTop: 64, minHeight: '100vh', background: '#080808' }}>

            {/* ── Header ─────────────────────────────────────────── */}
            <div style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', padding: `${isMobile ? 28 : 40}px ${px}px 24px` }}>
                <div style={{ maxWidth: 900, margin: '0 auto' }}>
                    {/* Breadcrumb */}
                    <button onClick={() => navigate('/profile')} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 10, letterSpacing: '0.14em', cursor: 'pointer', marginBottom: 16, padding: 0, transition: 'color 0.2s' }}
                        onMouseEnter={e => e.currentTarget.style.color = 'white'}
                        onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.3)'}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6" /></svg>
                        BACK TO PROFILE
                    </button>

                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, opacity: entered ? 1 : 0, transform: entered ? 'none' : 'translateY(10px)', transition: 'opacity 0.5s, transform 0.5s' }}>
                        <div>
                            <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 10, letterSpacing: '0.25em', color: 'var(--red)' }}>ORDER TRACKING</span>
                            <h1 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: isMobile ? 36 : 52, color: 'white', lineHeight: 0.95, marginTop: 6, letterSpacing: '0.04em' }}>{displayId}</h1>
                            <div style={{ fontFamily: "'Barlow',sans-serif", fontSize: 13, color: 'rgba(255,255,255,0.35)', marginTop: 8 }}>
                                Placed {new Date(order.createdAt).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                                {' · '}
                                {order.items?.length ?? 0} item{(order.items?.length ?? 0) !== 1 ? 's' : ''}
                            </div>
                        </div>
                        <StatusPill status={order.status} />
                    </div>
                </div>
            </div>

            <div style={{ maxWidth: 900, margin: '0 auto', padding: `32px ${px}px 80px`, opacity: entered ? 1 : 0, transition: 'opacity 0.5s 0.1s' }}>
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 300px', gap: 20, alignItems: 'flex-start' }}>

                    {/* ── LEFT COLUMN ──────────────────────────────── */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                        {/* Status progress track */}
                        <Card>
                            <SectionLabel>ORDER STATUS</SectionLabel>
                            <StatusTrack status={order.status} isMobile={isMobile} />

                            {/* ETA or delivery message */}
                            {order.status === 'DELIVERED' ? (
                                <div style={{ marginTop: 20, padding: '12px 16px', background: 'rgba(0,200,81,0.07)', border: '1px solid rgba(0,200,81,0.2)', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#00C851" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                                    <span style={{ fontFamily: "'Barlow',sans-serif", fontSize: 13, color: '#00C851' }}>Your order has been delivered. Enjoy your kicks! 🔥</span>
                                </div>
                            ) : order.status !== 'CANCELLED' && eta ? (
                                <div style={{ marginTop: 20, padding: '12px 16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                                    <span style={{ fontFamily: "'Barlow',sans-serif", fontSize: 13, color: 'rgba(255,255,255,0.45)' }}>
                                        Estimated delivery: <strong style={{ color: 'white' }}>{eta}</strong>
                                    </span>
                                </div>
                            ) : null}
                        </Card>

                        {/* Tracking info (shown if shipped) */}
                        {order.trackingNumber && (
                            <Card style={{ background: `linear-gradient(135deg, ${cfg.bg}, rgba(255,255,255,0.01))`, border: `1px solid ${cfg.color}33` }}>
                                <SectionLabel>TRACKING INFORMATION</SectionLabel>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                                    <div>
                                        <div style={{ fontFamily: "'Barlow',sans-serif", fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>
                                            {order.trackingCarrier || 'Carrier'} · Tracking number
                                        </div>
                                        <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 22, color: 'white', letterSpacing: '0.06em' }}>
                                            {order.trackingNumber}
                                        </div>
                                    </div>
                                    {order.trackingUrl ? (
                                        <a href={order.trackingUrl} target="_blank" rel="noreferrer"
                                            style={{ padding: '10px 22px', background: cfg.color, color: 'white', fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 11, letterSpacing: '0.14em', borderRadius: 4, textDecoration: 'none', transition: 'opacity 0.2s', display: 'inline-block' }}
                                            onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                                            onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                                            TRACK PACKAGE →
                                        </a>
                                    ) : (
                                        <button
                                            onClick={() => { navigator.clipboard.writeText(order.trackingNumber); addToast('success', 'Copied!', 'Tracking number copied to clipboard.'); }}
                                            style={{ padding: '10px 22px', background: 'transparent', border: `1px solid ${cfg.color}66`, color: cfg.color, fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 11, letterSpacing: '0.14em', borderRadius: 4, cursor: 'pointer', transition: 'all 0.2s' }}>
                                            COPY NUMBER
                                        </button>
                                    )}
                                </div>
                            </Card>
                        )}

                        {/* Status timeline */}
                        {order.events && order.events.length > 0 && (
                            <Card>
                                <SectionLabel>TIMELINE</SectionLabel>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    {[...order.events].reverse().map((ev, i, arr) => (
                                        <TimelineEvent key={ev.id} event={ev} isLast={i === arr.length - 1} />
                                    ))}
                                </div>
                            </Card>
                        )}

                        {/* Items */}
                        <Card>
                            <SectionLabel>ITEMS IN THIS ORDER</SectionLabel>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                {order.items?.map((item, i) => {
                                    const pid = item.productId ?? 1;
                                    const prod = PRODUCTS.find(p => p.id === pid);
                                    return (
                                        <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'center', padding: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 6 }}>
                                            <div style={{ width: 64, height: 64, borderRadius: 6, overflow: 'hidden', background: '#111', flexShrink: 0, cursor: 'pointer' }} onClick={() => navigate(`/product/${pid}`)}>
                                                <img src={getShoeImage(pid, 0)} alt={item.name || prod?.name} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }}
                                                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.08)'}
                                                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'} />
                                            </div>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 16, color: 'white', letterSpacing: '0.04em', marginBottom: 3 }}>
                                                    {item.name || prod?.name || 'Product'}
                                                </div>
                                                <div style={{ fontFamily: "'Barlow',sans-serif", fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>
                                                    US {item.size} · Qty {item.qty}
                                                </div>
                                            </div>
                                            <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 20, color: 'white', flexShrink: 0 }}>
                                                ${(item.price * item.qty).toFixed(2)}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </Card>
                    </div>

                    {/* ── RIGHT COLUMN ─────────────────────────────── */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                        {/* Cost breakdown */}
                        <Card>
                            <SectionLabel>ORDER TOTAL</SectionLabel>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ fontFamily: "'Barlow',sans-serif", fontSize: 13, color: 'rgba(255,255,255,0.45)' }}>Subtotal</span>
                                    <span style={{ fontFamily: "'Barlow',sans-serif", fontSize: 13, color: 'white' }}>${order.subtotal?.toFixed(2)}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ fontFamily: "'Barlow',sans-serif", fontSize: 13, color: 'rgba(255,255,255,0.45)' }}>Shipping</span>
                                    <span style={{ fontFamily: "'Barlow',sans-serif", fontSize: 13, color: order.shipping === 0 ? '#00C851' : 'white' }}>
                                        {order.shipping === 0 ? 'FREE' : `$${order.shipping?.toFixed(2)}`}
                                    </span>
                                </div>
                                <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: 12, marginTop: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 18, color: 'white' }}>TOTAL</span>
                                    <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 26, color: 'white' }}>${order.total?.toFixed(2)}</span>
                                </div>
                            </div>
                        </Card>

                        {/* Shipping address */}
                        {order.address && (
                            <Card>
                                <SectionLabel>SHIPPING ADDRESS</SectionLabel>
                                <div style={{ fontFamily: "'Barlow',sans-serif", fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.9 }}>
                                    <strong style={{ color: 'white', display: 'block', marginBottom: 2 }}>
                                        {order.address.firstName} {order.address.lastName}
                                    </strong>
                                    {order.address.line1}<br />
                                    {order.address.line2 && <>{order.address.line2}<br /></>}
                                    {order.address.city}, {order.address.state} {order.address.zip}<br />
                                    {order.address.country}
                                </div>
                            </Card>
                        )}

                        {/* Order meta */}
                        <Card>
                            <SectionLabel>ORDER INFO</SectionLabel>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                {[
                                    { label: 'Order ID', value: displayId },
                                    { label: 'Placed', value: new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) },
                                    { label: 'Payment', value: order.stripePaymentId ? 'Stripe · ' + order.stripePaymentId.slice(-8).toUpperCase() : 'Stripe' },
                                    { label: 'Status', value: STATUS_CONFIG[order.status]?.label || order.status },
                                ].map(({ label, value }) => (
                                    <div key={label} style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                                        <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 9, letterSpacing: '0.16em', color: 'rgba(255,255,255,0.3)', whiteSpace: 'nowrap' }}>{label.toUpperCase()}</span>
                                        <span style={{ fontFamily: "'Barlow',sans-serif", fontSize: 12, color: 'rgba(255,255,255,0.6)', textAlign: 'right', wordBreak: 'break-all' }}>{value}</span>
                                    </div>
                                ))}
                            </div>
                        </Card>

                        {/* Help CTA */}
                        <div style={{ padding: '18px 20px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, textAlign: 'center' }}>
                            <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 10, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.3)', marginBottom: 10 }}>NEED HELP?</div>
                            <button
                                onClick={() => addToast('info', 'Support', 'Email us at support@apexkicks.com')}
                                style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 11, letterSpacing: '0.14em', padding: '10px 24px', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.45)', cursor: 'pointer', borderRadius: 4, width: '100%', transition: 'all 0.2s' }}
                                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--red)'; e.currentTarget.style.color = 'var(--red)'; }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'rgba(255,255,255,0.45)'; }}>
                                CONTACT SUPPORT
                            </button>
                        </div>
                    </div>

                </div>
            </div>

            <style>{`
        @keyframes shimmer { 0%{opacity:.6} 50%{opacity:1} 100%{opacity:.6} }
      `}</style>
        </div>
    );
}