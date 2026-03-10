import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { getShoeImage } from '../../data/shoeImages';
import useBreakpoint from '../../hooks/useBreakPoint';

const FREE_SHIPPING_THRESHOLD = 150;

export default function CartDrawer() {
    const { cartItems, cartOpen, total, closeCart, removeFromCart, updateQty } = useCart();
    const { isMobile } = useBreakpoint();
    const navigate = useNavigate();
    const width = isMobile ? '100vw' : '440px';
    const progressPct = Math.min((total / FREE_SHIPPING_THRESHOLD) * 100, 100);
    const remaining = Math.max(FREE_SHIPPING_THRESHOLD - total, 0);

    return (
        <>
            {/* Backdrop */}
            <div
                onClick={closeCart}
                style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', zIndex: 2000, opacity: cartOpen ? 1 : 0, pointerEvents: cartOpen ? 'all' : 'none', transition: 'opacity 0.3s' }}
            />

            {/* Drawer */}
            <div style={{
                position: 'fixed', right: 0, top: 0, bottom: 0, width,
                background: '#0D0D0D', borderLeft: '1px solid rgba(255,255,255,0.08)',
                zIndex: 2001,
                transform: cartOpen ? 'translateX(0)' : 'translateX(100%)',
                transition: 'transform 0.4s cubic-bezier(0.23,1,0.32,1)',
                display: 'flex', flexDirection: 'column',
            }}>
                {/* Header */}
                <div style={{ padding: isMobile ? '20px 20px 16px' : '24px 28px 18px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <div className="display-heading" style={{ fontSize: isMobile ? 22 : 26 }}>YOUR CART</div>
                        {cartItems.length > 0 && (
                            <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 10, letterSpacing: '0.12em', color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>
                                {cartItems.reduce((s, i) => s + (i.qty || 1), 0)} ITEM{cartItems.reduce((s, i) => s + (i.qty || 1), 0) !== 1 ? 'S' : ''}
                            </div>
                        )}
                    </div>
                    <button onClick={closeCart} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.12)', color: 'white', width: 32, height: 32, fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>×</button>
                </div>

                {/* Shipping progress */}
                {cartItems.length > 0 && (
                    <div style={{ padding: '12px 28px', background: '#111', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                            <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 10, letterSpacing: '0.12em', color: 'rgba(255,255,255,0.4)' }}>
                                {remaining > 0 ? `$${remaining} AWAY FROM FREE SHIPPING` : '🎉 YOU\'VE UNLOCKED FREE SHIPPING!'}
                            </span>
                        </div>
                        <div style={{ height: 3, background: 'rgba(255,255,255,0.08)', borderRadius: 2, overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${progressPct}%`, background: progressPct >= 100 ? '#00C851' : 'var(--red)', borderRadius: 2, transition: 'width 0.5s cubic-bezier(0.23,1,0.32,1)' }} />
                        </div>
                    </div>
                )}

                {/* Items */}
                <div style={{ flex: 1, overflowY: 'auto', padding: isMobile ? '16px 20px' : '16px 28px' }}>
                    {cartItems.length === 0 ? (
                        <div style={{ textAlign: 'center', marginTop: 80, color: 'rgba(255,255,255,0.3)' }}>
                            <div style={{ fontSize: 52, marginBottom: 14 }}>🛍</div>
                            <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 24, marginBottom: 8 }}>YOUR CART IS EMPTY</div>
                            <div style={{ fontFamily: "'Barlow',sans-serif", fontSize: 13, marginBottom: 24, color: 'rgba(255,255,255,0.25)' }}>Add something to get started.</div>
                            <button className="btn-primary" style={{ padding: '12px 28px', fontSize: 13 }} onClick={() => { closeCart(); navigate('/collection'); }}>SHOP NOW →</button>
                        </div>
                    ) : cartItems.map((item, i) => (
                        <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'center', padding: '14px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                            {/* Thumbnail */}
                            <div style={{ width: 72, height: 72, flexShrink: 0, borderRadius: 3, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.07)' }}>
                                <img src={getShoeImage(item.id, 0)} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                            </div>

                            {/* Info */}
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div className="display-heading" style={{ fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</div>
                                {item.size && (
                                    <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 9, letterSpacing: '0.12em', color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>US {item.size}</div>
                                )}
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
                                    {/* Qty controls */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 0, border: '1px solid rgba(255,255,255,0.1)', borderRadius: 2, overflow: 'hidden' }}>
                                        <button onClick={() => updateQty(i, -1)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', width: 24, height: 24, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', lineHeight: 1 }}>−</button>
                                        <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 12, color: 'white', padding: '0 8px', minWidth: 28, textAlign: 'center' }}>{item.qty || 1}</span>
                                        <button onClick={() => updateQty(i, +1)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', width: 24, height: 24, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', lineHeight: 1 }}>+</button>
                                    </div>
                                    <div style={{ color: 'var(--red)', fontFamily: "'Bebas Neue',sans-serif", fontSize: 17 }}>${(item.price * (item.qty || 1))}</div>
                                </div>
                            </div>

                            <button onClick={() => removeFromCart(i)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.25)', fontSize: 14, cursor: 'pointer', flexShrink: 0, padding: 4 }}>✕</button>
                        </div>
                    ))}
                </div>

                {/* Footer */}
                {cartItems.length > 0 && (
                    <div style={{ padding: isMobile ? '16px 20px' : '20px 28px', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                            <span style={{ fontFamily: "'Barlow Condensed',sans-serif", letterSpacing: '0.1em', color: 'rgba(255,255,255,0.4)', fontSize: 11 }}>SUBTOTAL</span>
                            <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 20 }}>${total}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                            <span style={{ fontFamily: "'Barlow Condensed',sans-serif", letterSpacing: '0.1em', color: 'rgba(255,255,255,0.4)', fontSize: 11 }}>SHIPPING</span>
                            <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 12, color: total >= FREE_SHIPPING_THRESHOLD ? '#00C851' : 'rgba(255,255,255,0.5)' }}>
                                {total >= FREE_SHIPPING_THRESHOLD ? 'FREE' : `$${(12.99).toFixed(2)}`}
                            </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                            <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, letterSpacing: '0.12em', fontSize: 13 }}>TOTAL</span>
                            <span className="display-heading" style={{ fontSize: 26 }}>${(total >= FREE_SHIPPING_THRESHOLD ? total : total + 12.99).toFixed(2)}</span>
                        </div>
                        <button className="btn-primary" style={{ width: '100%', padding: '16px', fontSize: 14, marginBottom: 8 }}
                            onClick={() => { closeCart(); navigate('/checkout'); }}>
                            CHECKOUT →
                        </button>
                        <button className="btn-outline" onClick={closeCart} style={{ width: '100%', padding: '12px', fontSize: 13 }}>CONTINUE SHOPPING</button>
                    </div>
                )}
            </div>
        </>
    );
}