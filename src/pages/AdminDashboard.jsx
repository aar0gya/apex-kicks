// apex-kicks/src/pages/AdminDashboard.jsx
/* eslint-disable react-hooks/exhaustive-deps */
// Phase 5 — Admin Dashboard
// Tabs: Overview (analytics + chart) · Orders · Customers · Inventory
// Protected: only renders if user.isAdmin === true (checked via backend)

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../lib/api';

// ── Palette (matches APEX dark theme) ────────────────────────
const C = {
    bg: '#080808',
    surface: '#111111',
    surface2: '#181818',
    border: 'rgba(255,255,255,0.07)',
    border2: 'rgba(255,255,255,0.12)',
    text: '#ffffff',
    muted: 'rgba(255,255,255,0.45)',
    muted2: 'rgba(255,255,255,0.25)',
    red: '#ff2200',
    redDim: 'rgba(255,34,0,0.12)',
    green: '#00C851',
    greenDim: 'rgba(0,200,81,0.1)',
    amber: '#FFB800',
    amberDim: 'rgba(255,184,0,0.1)',
    blue: '#3B9EFF',
    blueDim: 'rgba(59,158,255,0.1)',
};

const STATUS_META = {
    PENDING: { label: 'Pending', color: C.amber, bg: C.amberDim },
    PROCESSING: { label: 'Processing', color: C.blue, bg: C.blueDim },
    SHIPPED: { label: 'Shipped', color: '#a78bfa', bg: 'rgba(167,139,250,0.1)' },
    DELIVERED: { label: 'Delivered', color: C.green, bg: C.greenDim },
    CANCELLED: { label: 'Cancelled', color: C.muted, bg: 'rgba(255,255,255,0.05)' },
};

// ── Helpers ───────────────────────────────────────────────────
function fmtMoney(n) { return '$' + (n ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
function fmtDate(d) { return d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'; }
function fmtDateShort(d) { return d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''; }
function orderId(id) { return id ? `#${id.slice(-8).toUpperCase()}` : '—'; }

// ── Shared UI primitives ──────────────────────────────────────
function StatusBadge({ status }) {
    const m = STATUS_META[status] || { label: status, color: C.muted, bg: 'rgba(255,255,255,0.05)' };
    return (
        <span style={{
            padding: '3px 10px', borderRadius: 3, background: m.bg, color: m.color,
            fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 11, letterSpacing: '0.1em', whiteSpace: 'nowrap'
        }}>
            {m.label.toUpperCase()}
        </span>
    );
}

function Pill({ children, active, onClick }) {
    return (
        <button onClick={onClick} style={{
            padding: '6px 16px', borderRadius: 3, cursor: 'pointer', transition: 'all 0.15s',
            background: active ? C.red : 'transparent',
            border: active ? 'none' : `1px solid ${C.border}`,
            color: active ? 'white' : C.muted,
            fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 12, letterSpacing: '0.12em',
        }}>{children}</button>
    );
}

function Input({ value, onChange, placeholder, style = {} }) {
    return (
        <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
            style={{
                padding: '8px 14px', background: C.surface2, border: `1px solid ${C.border}`,
                borderRadius: 3, color: C.text, fontFamily: "'Barlow',sans-serif", fontSize: 13,
                outline: 'none', ...style
            }} />
    );
}

function Spinner() {
    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 60 }}>
            <div style={{
                width: 32, height: 32, border: `2px solid ${C.border}`, borderTopColor: C.red,
                borderRadius: '50%', animation: 'adSpin 0.7s linear infinite'
            }} />
            <style>{`@keyframes adSpin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}

function StatCard({ label, value, sub, subColor, icon }) {
    return (
        <div style={{
            background: C.surface, border: `1px solid ${C.border}`, borderRadius: 6,
            padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 10
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span style={{
                    fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 10,
                    letterSpacing: '0.2em', color: C.muted
                }}>{label}</span>
                <span style={{ fontSize: 18 }}>{icon}</span>
            </div>
            <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 36, color: C.text, lineHeight: 1 }}>{value}</div>
            {sub && <div style={{ fontFamily: "'Barlow',sans-serif", fontSize: 12, color: subColor || C.muted }}>{sub}</div>}
        </div>
    );
}

// ── Mini Bar Chart ────────────────────────────────────────────
function RevenueChart({ data }) {
    if (!data?.length) return null;
    const max = Math.max(...data.map(d => d.revenue), 1);

    return (
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 6, padding: '20px 24px' }}>
            <div style={{
                fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 10,
                letterSpacing: '0.2em', color: C.muted, marginBottom: 20
            }}>DAILY REVENUE — LAST 30 DAYS</div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 120 }}>
                {data.map((d, i) => {
                    const h = Math.max(2, (d.revenue / max) * 110);
                    const isLast7 = i >= data.length - 7;
                    return (
                        <div key={d.date} title={`${fmtDateShort(d.date)}: ${fmtMoney(d.revenue)}`}
                            style={{
                                flex: 1, height: h, background: isLast7 ? C.red : 'rgba(255,34,0,0.3)',
                                borderRadius: '2px 2px 0 0', cursor: 'default', transition: 'opacity 0.15s',
                                minWidth: 4
                            }} />
                    );
                })}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
                <span style={{ fontFamily: "'Barlow',sans-serif", fontSize: 10, color: C.muted2 }}>{fmtDateShort(data[0]?.date)}</span>
                <span style={{ fontFamily: "'Barlow',sans-serif", fontSize: 10, color: C.muted2 }}>Today</span>
            </div>
            <div style={{ display: 'flex', gap: 16, marginTop: 14, paddingTop: 14, borderTop: `1px solid ${C.border}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 10, height: 10, background: C.red, borderRadius: 2 }} />
                    <span style={{ fontFamily: "'Barlow',sans-serif", fontSize: 11, color: C.muted }}>Last 7 days</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 10, height: 10, background: 'rgba(255,34,0,0.3)', borderRadius: 2 }} />
                    <span style={{ fontFamily: "'Barlow',sans-serif", fontSize: 11, color: C.muted }}>30-day window</span>
                </div>
            </div>
        </div>
    );
}

// ══════════════════════════════════════════════════════════════
// TAB 1 — OVERVIEW
// ══════════════════════════════════════════════════════════════
function OverviewTab({ stats }) {
    if (!stats) return <Spinner />;
    const { revenue, orders, customers, topProducts, dailyChart } = stats;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* KPI cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
                <StatCard label="ALL-TIME REVENUE" value={fmtMoney(revenue.allTime)} icon="💰"
                    sub={`${fmtMoney(revenue.last30)} this month`} subColor={C.green} />
                <StatCard label="REVENUE THIS WEEK" value={fmtMoney(revenue.last7)} icon="📈"
                    sub={`${fmtMoney(revenue.last30)} this month`} />
                <StatCard label="TOTAL ORDERS" value={orders.total?.toLocaleString() ?? '0'} icon="📦"
                    sub={`${orders.last30} this month`} />
                <StatCard label="TOTAL CUSTOMERS" value={customers.total?.toLocaleString() ?? '0'} icon="👥"
                    sub={`+${customers.new30} this month`} subColor={C.green} />
                <StatCard label="PENDING ATTENTION" value={(orders.pending + orders.processing) || 0} icon="⚡"
                    sub={`${orders.pending} pending · ${orders.processing} processing`} subColor={C.amber} />
            </div>

            {/* Chart */}
            <RevenueChart data={dailyChart} />

            {/* Bottom row: order status + top products */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {/* Orders by status */}
                <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 6, padding: '20px 24px' }}>
                    <div style={{
                        fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 10,
                        letterSpacing: '0.2em', color: C.muted, marginBottom: 16
                    }}>ORDERS BY STATUS</div>
                    {Object.entries(STATUS_META).map(([key, meta]) => {
                        const count = orders.byStatus?.[key] ?? 0;
                        const total = Math.max(1, orders.total);
                        return (
                            <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                                <span style={{
                                    width: 80, fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700,
                                    fontSize: 10, letterSpacing: '0.1em', color: meta.color
                                }}>{meta.label.toUpperCase()}</span>
                                <div style={{ flex: 1, height: 6, background: C.surface2, borderRadius: 3, overflow: 'hidden' }}>
                                    <div style={{
                                        height: '100%', width: `${(count / total) * 100}%`,
                                        background: meta.color, borderRadius: 3, transition: 'width 0.5s ease'
                                    }} />
                                </div>
                                <span style={{
                                    width: 32, textAlign: 'right', fontFamily: "'Barlow',sans-serif",
                                    fontSize: 12, color: C.muted
                                }}>{count}</span>
                            </div>
                        );
                    })}
                </div>

                {/* Top products */}
                <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 6, padding: '20px 24px' }}>
                    <div style={{
                        fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 10,
                        letterSpacing: '0.2em', color: C.muted, marginBottom: 16
                    }}>TOP PRODUCTS BY REVENUE</div>
                    {topProducts?.length === 0 && <div style={{ color: C.muted, fontSize: 13 }}>No sales yet.</div>}
                    {topProducts?.map((p, i) => (
                        <div key={`${p.productId}-${i}`} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                            <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 18, color: i === 0 ? C.red : C.muted2, width: 20 }}>{i + 1}</span>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{
                                    fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 12,
                                    color: C.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                                }}>{p.name}</div>
                                <div style={{ fontFamily: "'Barlow',sans-serif", fontSize: 11, color: C.muted }}>{p.unitsSold} units sold</div>
                            </div>
                            <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 16, color: C.green }}>{fmtMoney(p.revenue)}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// ══════════════════════════════════════════════════════════════
// TAB 2 — ORDERS
// ══════════════════════════════════════════════════════════════
// ── makeApi: returns API helpers that always fetch a fresh token ─────────
// This prevents "exp claim timestamp check failed" (401) on long sessions.
function useApi(getToken) {
    return {
        get: async (path) => { const t = await getToken(); return api.get(path, t); },
        patch: async (path, body) => { const t = await getToken(); return api.patch(path, body, t); },
    };
}

function OrdersTab({ getToken, addToast }) {
    const apix = useApi(getToken);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [status, setStatus] = useState('ALL');
    const [search, setSearch] = useState('');
    const [selected, setSelected] = useState(null);   // order detail modal
    const [saving, setSaving] = useState(false);

    const load = useCallback(async () => { // eslint-disable-line react-hooks/exhaustive-deps
        setLoading(true);
        try {
            const params = new URLSearchParams({ page, limit: 20 });
            if (status !== 'ALL') params.set('status', status);
            if (search.trim()) params.set('search', search.trim());
            const data = await apix.get(`/admin/orders?${params}`);
            setOrders(data.orders);
            setPages(data.pagination.pages);
            setTotal(data.pagination.total);
        } catch (err) {
            addToast('error', 'Failed to load orders', err.message);
        } finally {
            setLoading(false);
        }
    }, [page, status, search, getToken]);

    useEffect(() => { load(); }, [load]);

    // Open detail panel
    async function openOrder(id) {
        try {
            const data = await apix.get(`/admin/orders/${id}`);
            setSelected(data);
        } catch (err) {
            addToast('error', 'Failed to load order', err.message);
        }
    }

    // Save status + tracking
    async function saveOrder(patch) {
        if (!selected) return;
        setSaving(true);
        try {
            const updated = await apix.patch(`/admin/orders/${selected.id}/status`, patch);
            setSelected(updated);
            setOrders(prev => prev.map(o => o.id === updated.id ? updated : o));
            addToast('success', 'Order updated', `${orderId(updated.id)} → ${updated.status}`);
        } catch (err) {
            addToast('error', 'Update failed', err.message);
        } finally {
            setSaving(false);
        }
    }

    const STATUS_FILTERS = ['ALL', 'PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

    return (
        <div style={{ display: 'flex', gap: 20, height: 'calc(100vh - 220px)', minHeight: 500 }}>
            {/* Left: order list */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12, overflow: 'hidden' }}>
                {/* Filters */}
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {STATUS_FILTERS.map(s => (
                        <Pill key={s} active={status === s} onClick={() => { setStatus(s); setPage(1); }}>{s}</Pill>
                    ))}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    <Input value={search} onChange={v => { setSearch(v); setPage(1); }}
                        placeholder="Search order ID, email, tracking..." style={{ flex: 1 }} />
                    <span style={{
                        fontFamily: "'Barlow',sans-serif", fontSize: 12, color: C.muted,
                        display: 'flex', alignItems: 'center', whiteSpace: 'nowrap'
                    }}>{total} orders</span>
                </div>

                {/* Table */}
                <div style={{
                    flex: 1, overflowY: 'auto', background: C.surface,
                    border: `1px solid ${C.border}`, borderRadius: 6
                }}>
                    {loading ? <Spinner /> : orders.length === 0 ? (
                        <div style={{
                            padding: 40, textAlign: 'center', color: C.muted,
                            fontFamily: "'Barlow',sans-serif", fontSize: 14
                        }}>No orders found.</div>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                                    {['ORDER', 'CUSTOMER', 'DATE', 'TOTAL', 'STATUS', ''].map(h => (
                                        <th key={h} style={{
                                            padding: '10px 16px', textAlign: 'left',
                                            fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700,
                                            fontSize: 9, letterSpacing: '0.15em', color: C.muted
                                        }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map(o => (
                                    <tr key={o.id} onClick={() => openOrder(o.id)}
                                        style={{
                                            borderBottom: `1px solid ${C.border}`, cursor: 'pointer',
                                            background: selected?.id === o.id ? C.redDim : 'transparent',
                                            transition: 'background 0.15s'
                                        }}
                                        onMouseEnter={e => { if (selected?.id !== o.id) e.currentTarget.style.background = C.surface2; }}
                                        onMouseLeave={e => { if (selected?.id !== o.id) e.currentTarget.style.background = 'transparent'; }}>
                                        <td style={{ padding: '12px 16px' }}>
                                            <span style={{
                                                fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700,
                                                fontSize: 13, color: C.text
                                            }}>{orderId(o.id)}</span>
                                        </td>
                                        <td style={{ padding: '12px 16px' }}>
                                            <div style={{ fontFamily: "'Barlow',sans-serif", fontSize: 13, color: C.text }}>{o.user?.name || '—'}</div>
                                            <div style={{ fontFamily: "'Barlow',sans-serif", fontSize: 11, color: C.muted }}>{o.user?.email}</div>
                                        </td>
                                        <td style={{ padding: '12px 16px' }}>
                                            <span style={{ fontFamily: "'Barlow',sans-serif", fontSize: 12, color: C.muted }}>{fmtDate(o.createdAt)}</span>
                                        </td>
                                        <td style={{ padding: '12px 16px' }}>
                                            <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 16, color: C.text }}>{fmtMoney(o.total)}</span>
                                        </td>
                                        <td style={{ padding: '12px 16px' }}><StatusBadge status={o.status} /></td>
                                        <td style={{ padding: '12px 16px' }}>
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Pagination */}
                {pages > 1 && (
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 6 }}>
                        {Array.from({ length: Math.min(pages, 7) }, (_, i) => i + 1).map(p => (
                            <button key={p} onClick={() => setPage(p)} style={{
                                width: 32, height: 32, borderRadius: 3, cursor: 'pointer',
                                background: p === page ? C.red : C.surface2,
                                border: `1px solid ${p === page ? C.red : C.border}`,
                                color: p === page ? 'white' : C.muted,
                                fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 13,
                            }}>{p}</button>
                        ))}
                    </div>
                )}
            </div>

            {/* Right: detail panel */}
            {selected && <OrderDetailPanel order={selected} onSave={saveOrder} saving={saving}
                onClose={() => setSelected(null)} />}
        </div>
    );
}

function OrderDetailPanel({ order, onSave, saving, onClose }) {
    const [status, setStatus] = useState(order.status);
    const [note, setNote] = useState('');
    const [tracking, setTracking] = useState(order.trackingNumber || '');
    const [carrier, setCarrier] = useState(order.trackingCarrier || '');
    const [url, setUrl] = useState(order.trackingUrl || '');

    // Sync when order changes (from parent update)
    useEffect(() => {
        setStatus(order.status);
        setTracking(order.trackingNumber || '');
        setCarrier(order.trackingCarrier || '');
        setUrl(order.trackingUrl || '');
    }, [order.id, order.status, order.trackingNumber, order.trackingCarrier, order.trackingUrl]);

    function handleSave() {
        onSave({
            status, note: note.trim() || undefined, trackingNumber: tracking || undefined,
            trackingCarrier: carrier || undefined, trackingUrl: url || undefined
        });
        setNote('');
    }

    const lbl = {
        fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 9,
        letterSpacing: '0.18em', color: C.muted, marginBottom: 6, display: 'block'
    };
    const inp = {
        width: '100%', padding: '9px 12px', background: C.surface2, border: `1px solid ${C.border}`,
        borderRadius: 3, color: C.text, fontFamily: "'Barlow',sans-serif", fontSize: 13,
        outline: 'none', boxSizing: 'border-box'
    };

    return (
        <div style={{
            width: 340, flexShrink: 0, background: C.surface, border: `1px solid ${C.border}`,
            borderRadius: 6, overflowY: 'auto', display: 'flex', flexDirection: 'column'
        }}>
            {/* Header */}
            <div style={{
                padding: '16px 20px', borderBottom: `1px solid ${C.border}`,
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0,
                background: C.surface, zIndex: 1
            }}>
                <div>
                    <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 20, color: C.text }}>{orderId(order.id)}</div>
                    <div style={{ fontFamily: "'Barlow',sans-serif", fontSize: 11, color: C.muted }}>{fmtDate(order.createdAt)}</div>
                </div>
                <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted, padding: 4 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                </button>
            </div>

            <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 20, flex: 1 }}>
                {/* Customer */}
                <div>
                    <span style={lbl}>CUSTOMER</span>
                    <div style={{ fontFamily: "'Barlow',sans-serif", fontSize: 13, color: C.text }}>{order.user?.name || '—'}</div>
                    <div style={{ fontFamily: "'Barlow',sans-serif", fontSize: 12, color: C.muted }}>{order.user?.email}</div>
                </div>

                {/* Items */}
                <div>
                    <span style={lbl}>ITEMS ({order.items?.length})</span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {order.items?.map((item, i) => (
                            <div key={i} style={{
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                padding: '8px 10px', background: C.surface2, borderRadius: 3
                            }}>
                                <div>
                                    <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 12, color: C.text }}>{item.name}</div>
                                    <div style={{ fontFamily: "'Barlow',sans-serif", fontSize: 11, color: C.muted }}>US {item.size} · Qty {item.qty}</div>
                                </div>
                                <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 15, color: C.text }}>{fmtMoney(item.price * item.qty)}</span>
                            </div>
                        ))}
                    </div>
                    <div style={{
                        display: 'flex', justifyContent: 'space-between', marginTop: 10,
                        paddingTop: 10, borderTop: `1px solid ${C.border}`
                    }}>
                        <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 14, color: C.text }}>TOTAL</span>
                        <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 18, color: C.green }}>{fmtMoney(order.total)}</span>
                    </div>
                </div>

                {/* Address */}
                {order.address && (
                    <div>
                        <span style={lbl}>SHIP TO</span>
                        <div style={{ fontFamily: "'Barlow',sans-serif", fontSize: 12, color: C.muted, lineHeight: 1.8 }}>
                            {order.address.firstName} {order.address.lastName}<br />
                            {order.address.line1}{order.address.line2 ? `, ${order.address.line2}` : ''}<br />
                            {order.address.city}, {order.address.state} {order.address.zip}
                        </div>
                    </div>
                )}

                {/* Update status */}
                <div>
                    <span style={lbl}>UPDATE STATUS</span>
                    <select value={status} onChange={e => setStatus(e.target.value)} style={{ ...inp }}>
                        {Object.keys(STATUS_META).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>

                {/* Tracking */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <span style={lbl}>TRACKING INFO</span>
                    <input value={tracking} onChange={e => setTracking(e.target.value)}
                        placeholder="Tracking number" style={inp} />
                    <input value={carrier} onChange={e => setCarrier(e.target.value)}
                        placeholder="Carrier (UPS, FedEx, USPS...)" style={inp} />
                    <input value={url} onChange={e => setUrl(e.target.value)}
                        placeholder="Tracking URL (optional)" style={inp} />
                </div>

                {/* Note */}
                <div>
                    <span style={lbl}>INTERNAL NOTE (optional)</span>
                    <textarea value={note} onChange={e => setNote(e.target.value)}
                        placeholder="Note for timeline..." rows={3}
                        style={{ ...inp, resize: 'vertical', lineHeight: 1.5 }} />
                </div>

                {/* Save */}
                <button onClick={handleSave} disabled={saving} style={{
                    padding: '12px', background: C.red, border: 'none', borderRadius: 3, cursor: saving ? 'not-allowed' : 'pointer',
                    color: 'white', fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700,
                    fontSize: 14, letterSpacing: '0.12em', opacity: saving ? 0.7 : 1, transition: 'opacity 0.2s',
                }}>
                    {saving ? 'SAVING...' : 'SAVE CHANGES'}
                </button>

                {/* Timeline */}
                {order.events?.length > 0 && (
                    <div>
                        <span style={lbl}>TIMELINE</span>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                            {[...order.events].reverse().map((ev, i) => (
                                <div key={ev.id} style={{
                                    display: 'flex', gap: 12, paddingBottom: i < order.events.length - 1 ? 16 : 0,
                                    position: 'relative'
                                }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: STATUS_META[ev.status]?.color || C.muted, marginTop: 4 }} />
                                        {i < order.events.length - 1 && <div style={{ width: 1, flex: 1, background: C.border, marginTop: 4 }} />}
                                    </div>
                                    <div style={{ flex: 1, paddingBottom: 12 }}>
                                        <div style={{
                                            fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 11,
                                            color: STATUS_META[ev.status]?.color || C.muted, letterSpacing: '0.08em'
                                        }}>{ev.status}</div>
                                        {ev.note && <div style={{ fontFamily: "'Barlow',sans-serif", fontSize: 11, color: C.muted, marginTop: 2, lineHeight: 1.4 }}>{ev.note}</div>}
                                        <div style={{ fontFamily: "'Barlow',sans-serif", fontSize: 10, color: C.muted2, marginTop: 3 }}>{fmtDate(ev.createdAt)}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// ══════════════════════════════════════════════════════════════
// TAB 3 — CUSTOMERS
// ══════════════════════════════════════════════════════════════
function CustomersTab({ getToken, addToast }) {
    const apix = useApi(getToken);
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [search, setSearch] = useState('');
    const [selected, setSelected] = useState(null);

    const load = useCallback(async () => { // eslint-disable-line react-hooks/exhaustive-deps
        setLoading(true);
        try {
            const params = new URLSearchParams({ page, limit: 20 });
            if (search.trim()) params.set('search', search.trim());
            const data = await apix.get(`/admin/customers?${params}`);
            setCustomers(data.customers);
            setPages(data.pagination.pages);
            setTotal(data.pagination.total);
        } catch (err) {
            addToast('error', 'Failed to load customers', err.message);
        } finally {
            setLoading(false);
        }
    }, [page, search, getToken]);

    useEffect(() => { load(); }, [load]);

    async function openCustomer(id) {
        try {
            const data = await apix.get(`/admin/customers/${id}`);
            setSelected(data);
        } catch (err) {
            addToast('error', 'Failed to load customer', err.message);
        }
    }

    return (
        <div style={{ display: 'flex', gap: 20, height: 'calc(100vh - 220px)', minHeight: 500 }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12, overflow: 'hidden' }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <Input value={search} onChange={v => { setSearch(v); setPage(1); }}
                        placeholder="Search by name or email..." style={{ flex: 1 }} />
                    <span style={{ fontFamily: "'Barlow',sans-serif", fontSize: 12, color: C.muted, whiteSpace: 'nowrap' }}>{total} customers</span>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', background: C.surface, border: `1px solid ${C.border}`, borderRadius: 6 }}>
                    {loading ? <Spinner /> : customers.length === 0 ? (
                        <div style={{ padding: 40, textAlign: 'center', color: C.muted, fontFamily: "'Barlow',sans-serif", fontSize: 14 }}>No customers found.</div>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                                    {['CUSTOMER', 'JOINED', 'ORDERS', 'TOTAL SPENT', 'LAST ORDER', ''].map(h => (
                                        <th key={h} style={{
                                            padding: '10px 16px', textAlign: 'left', fontFamily: "'Barlow Condensed',sans-serif",
                                            fontWeight: 700, fontSize: 9, letterSpacing: '0.15em', color: C.muted
                                        }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {customers.map(c => (
                                    <tr key={c.id} onClick={() => openCustomer(c.id)}
                                        style={{
                                            borderBottom: `1px solid ${C.border}`, cursor: 'pointer',
                                            background: selected?.id === c.id ? C.redDim : 'transparent', transition: 'background 0.15s'
                                        }}
                                        onMouseEnter={e => { if (selected?.id !== c.id) e.currentTarget.style.background = C.surface2; }}
                                        onMouseLeave={e => { if (selected?.id !== c.id) e.currentTarget.style.background = 'transparent'; }}>
                                        <td style={{ padding: '12px 16px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                {c.avatar
                                                    ? <img src={c.avatar} alt="" style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }} />
                                                    : <div style={{
                                                        width: 32, height: 32, borderRadius: '50%', background: C.redDim,
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        fontFamily: "'Bebas Neue',sans-serif", fontSize: 14, color: C.red
                                                    }}>
                                                        {(c.name || c.email || '?')[0].toUpperCase()}
                                                    </div>
                                                }
                                                <div>
                                                    <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 13, color: C.text }}>
                                                        {c.name || '—'} {c.isAdmin && <span style={{ color: C.red, fontSize: 10 }}>ADMIN</span>}
                                                    </div>
                                                    <div style={{ fontFamily: "'Barlow',sans-serif", fontSize: 11, color: C.muted }}>{c.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '12px 16px' }}>
                                            <span style={{ fontFamily: "'Barlow',sans-serif", fontSize: 12, color: C.muted }}>{fmtDate(c.joinedAt)}</span>
                                        </td>
                                        <td style={{ padding: '12px 16px' }}>
                                            <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 18, color: C.text }}>{c.orderCount}</span>
                                        </td>
                                        <td style={{ padding: '12px 16px' }}>
                                            <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 16, color: C.green }}>{fmtMoney(c.totalSpend)}</span>
                                        </td>
                                        <td style={{ padding: '12px 16px' }}>
                                            <span style={{ fontFamily: "'Barlow',sans-serif", fontSize: 12, color: C.muted }}>{fmtDate(c.lastOrderAt)}</span>
                                        </td>
                                        <td style={{ padding: '12px 16px' }}>
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {pages > 1 && (
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 6 }}>
                        {Array.from({ length: Math.min(pages, 7) }, (_, i) => i + 1).map(p => (
                            <button key={p} onClick={() => setPage(p)} style={{
                                width: 32, height: 32, borderRadius: 3, cursor: 'pointer',
                                background: p === page ? C.red : C.surface2,
                                border: `1px solid ${p === page ? C.red : C.border}`,
                                color: p === page ? 'white' : C.muted,
                                fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 13,
                            }}>{p}</button>
                        ))}
                    </div>
                )}
            </div>

            {/* Customer detail panel */}
            {selected && (
                <div style={{
                    width: 340, flexShrink: 0, background: C.surface, border: `1px solid ${C.border}`,
                    borderRadius: 6, overflowY: 'auto'
                }}>
                    <div style={{
                        padding: '16px 20px', borderBottom: `1px solid ${C.border}`,
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        position: 'sticky', top: 0, background: C.surface, zIndex: 1
                    }}>
                        <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 20, color: C.text }}>{selected.name || selected.email}</div>
                        <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                        </button>
                    </div>
                    <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 20 }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                            {[
                                { label: 'TOTAL SPENT', value: fmtMoney(selected.totalSpend) },
                                { label: 'ORDERS', value: selected.orderCount },
                                { label: 'JOINED', value: fmtDate(selected.joinedAt) },
                                { label: 'EMAIL', value: selected.email },
                            ].map(item => (
                                <div key={item.label} style={{ background: C.surface2, borderRadius: 4, padding: '12px 14px' }}>
                                    <div style={{
                                        fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 9,
                                        letterSpacing: '0.15em', color: C.muted, marginBottom: 4
                                    }}>{item.label}</div>
                                    <div style={{
                                        fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 14,
                                        color: C.text, wordBreak: 'break-all'
                                    }}>{item.value}</div>
                                </div>
                            ))}
                        </div>

                        <div>
                            <div style={{
                                fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 10,
                                letterSpacing: '0.18em', color: C.muted, marginBottom: 12
                            }}>ORDER HISTORY</div>
                            {selected.orders?.length === 0 && <div style={{ color: C.muted, fontSize: 13, fontFamily: "'Barlow',sans-serif" }}>No orders yet.</div>}
                            {selected.orders?.map(o => (
                                <div key={o.id} style={{
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                    padding: '10px 0', borderBottom: `1px solid ${C.border}`
                                }}>
                                    <div>
                                        <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 13, color: C.text }}>{orderId(o.id)}</div>
                                        <div style={{ fontFamily: "'Barlow',sans-serif", fontSize: 11, color: C.muted }}>{fmtDate(o.createdAt)}</div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <StatusBadge status={o.status} />
                                        <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 15, color: C.text }}>{fmtMoney(o.total)}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// ══════════════════════════════════════════════════════════════
// TAB 4 — INVENTORY
// ══════════════════════════════════════════════════════════════
function InventoryTab({ getToken, addToast }) {
    const apix = useApi(getToken);
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        apix.get('/admin/inventory')
            .then(data => setInventory(data))
            .catch(err => addToast('error', 'Failed to load inventory', err.message))
            .finally(() => setLoading(false));
    }, [getToken]);

    if (loading) return <Spinner />;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {inventory.map(product => {
                const pct = product.totalStock === 0 ? 0 : Math.min(100, (product.totalStock / 200) * 100);
                return (
                    <div key={product.id} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 6, padding: '20px 24px' }}>
                        {/* Product header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 22, color: C.text }}>{product.name}</span>
                                    {product.totalStock === 0 && (
                                        <span style={{
                                            padding: '2px 8px', background: 'rgba(255,255,255,0.06)', borderRadius: 3,
                                            fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 10, color: C.muted, letterSpacing: '0.1em'
                                        }}>SOLD OUT</span>
                                    )}
                                    {product.totalStock > 0 && product.totalStock <= 15 && (
                                        <span style={{
                                            padding: '2px 8px', background: C.amberDim, borderRadius: 3,
                                            fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 10, color: C.amber, letterSpacing: '0.1em'
                                        }}>LOW STOCK</span>
                                    )}
                                </div>
                                <div style={{ fontFamily: "'Barlow',sans-serif", fontSize: 12, color: C.muted, marginTop: 2 }}>
                                    {product.category} · {fmtMoney(product.price)}
                                </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 28, color: product.totalStock === 0 ? C.muted : C.text, lineHeight: 1 }}>{product.totalStock}</div>
                                <div style={{ fontFamily: "'Barlow',sans-serif", fontSize: 11, color: C.muted }}>total units</div>
                            </div>
                        </div>

                        {/* Stock bar */}
                        <div style={{ height: 4, background: C.surface2, borderRadius: 2, marginBottom: 16, overflow: 'hidden' }}>
                            <div style={{
                                height: '100%', width: `${pct}%`, borderRadius: 2,
                                background: product.totalStock === 0 ? C.border : product.totalStock <= 15 ? C.amber : C.green,
                                transition: 'width 0.5s ease'
                            }} />
                        </div>

                        {/* Size grid */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                            {product.sizes.map(sz => (
                                <div key={sz.size} style={{
                                    padding: '6px 10px', borderRadius: 3, minWidth: 52, textAlign: 'center',
                                    background: sz.soldOut ? 'rgba(255,255,255,0.03)' : sz.lowStock ? C.amberDim : C.greenDim,
                                    border: `1px solid ${sz.soldOut ? C.border : sz.lowStock ? C.amber + '44' : C.green + '44'}`,
                                }}>
                                    <div style={{
                                        fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 11,
                                        color: sz.soldOut ? C.muted2 : sz.lowStock ? C.amber : C.green
                                    }}>US {sz.size}</div>
                                    <div style={{
                                        fontFamily: "'Bebas Neue',sans-serif", fontSize: 16,
                                        color: sz.soldOut ? C.muted2 : C.text, lineHeight: 1.2
                                    }}>
                                        {sz.soldOut ? '—' : sz.stock}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Summary row */}
                        <div style={{ display: 'flex', gap: 20, marginTop: 14, paddingTop: 14, borderTop: `1px solid ${C.border}` }}>
                            <span style={{ fontFamily: "'Barlow',sans-serif", fontSize: 12, color: C.green }}>
                                {product.sizes.length - product.soldOutSizes - product.lowStockSizes} sizes healthy
                            </span>
                            {product.lowStockSizes > 0 && (
                                <span style={{ fontFamily: "'Barlow',sans-serif", fontSize: 12, color: C.amber }}>{product.lowStockSizes} low stock</span>
                            )}
                            {product.soldOutSizes > 0 && (
                                <span style={{ fontFamily: "'Barlow',sans-serif", fontSize: 12, color: C.muted }}>{product.soldOutSizes} sold out</span>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

// ══════════════════════════════════════════════════════════════
// ROOT — AdminDashboard
// ══════════════════════════════════════════════════════════════
const TABS = ['OVERVIEW', 'ORDERS', 'CUSTOMERS', 'INVENTORY'];

export default function AdminDashboard() {
    const { user, isLoggedIn, isLoaded, getToken } = useAuth();
    const addToast = useToast();
    const navigate = useNavigate();

    const [tab, setTab] = useState(0);
    const [isAdmin, setIsAdmin] = useState(false);
    const [checking, setChecking] = useState(true);
    const [stats, setStats] = useState(null);

    // Get token + verify admin on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        if (!isLoaded) return;
        if (!isLoggedIn) { navigate('/sign-in'); return; }

        (async () => {
            try {
                // Try hitting admin stats — 403 means not admin
                const t = await getToken();
                const data = await api.get('/admin/stats', t);
                setStats(data);
                setIsAdmin(true);
            } catch (err) {
                if (err.status === 403) {
                    addToast('error', 'Access denied', 'Admin access required.');
                    navigate('/');
                } else {
                    addToast('error', 'Failed to load dashboard', err.message);
                }
            } finally {
                setChecking(false);
            }
        })();
    }, [isLoaded, isLoggedIn]);

    if (!isLoaded || checking) return (
        <div style={{
            paddingTop: 64, minHeight: '100vh', background: C.bg, display: 'flex',
            alignItems: 'center', justifyContent: 'center'
        }}>
            <Spinner />
        </div>
    );

    if (!isAdmin) return null;

    return (
        <div style={{ paddingTop: 64, minHeight: '100vh', background: C.bg, color: C.text }}>
            {/* Page header */}
            <div style={{ borderBottom: `1px solid ${C.border}`, padding: '32px 40px 24px' }}>
                <div style={{ maxWidth: 1400, margin: '0 auto' }}>
                    <div style={{
                        fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 10,
                        letterSpacing: '0.25em', color: C.red, marginBottom: 6
                    }}>APEX KICKS</div>
                    <h1 style={{
                        fontFamily: "'Bebas Neue',sans-serif", fontSize: 48, lineHeight: 0.92,
                        color: C.text, margin: 0, letterSpacing: '0.02em'
                    }}>ADMIN DASHBOARD</h1>
                    <div style={{ fontFamily: "'Barlow',sans-serif", fontSize: 13, color: C.muted, marginTop: 8 }}>
                        Logged in as <strong style={{ color: C.text }}>{user?.email}</strong>
                    </div>
                </div>
            </div>

            {/* Tab bar */}
            <div style={{ borderBottom: `1px solid ${C.border}`, padding: '0 40px' }}>
                <div style={{ maxWidth: 1400, margin: '0 auto', display: 'flex', gap: 0 }}>
                    {TABS.map((t, i) => (
                        <button key={t} onClick={() => setTab(i)} style={{
                            padding: '16px 24px', background: 'none', border: 'none',
                            borderBottom: `2px solid ${tab === i ? C.red : 'transparent'}`,
                            color: tab === i ? C.text : C.muted, cursor: 'pointer',
                            fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700,
                            fontSize: 13, letterSpacing: '0.12em', transition: 'all 0.15s',
                        }}>{t}</button>
                    ))}
                </div>
            </div>

            {/* Content */}
            <div style={{ maxWidth: 1400, margin: '0 auto', padding: '32px 40px 80px' }}>
                {tab === 0 && <OverviewTab stats={stats} />}
                {tab === 1 && <OrdersTab getToken={getToken} addToast={addToast} />}
                {tab === 2 && <CustomersTab getToken={getToken} addToast={addToast} />}
                {tab === 3 && <InventoryTab getToken={getToken} addToast={addToast} />}
            </div>
        </div>
    );
}