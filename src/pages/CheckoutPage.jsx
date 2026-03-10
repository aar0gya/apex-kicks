// apex-kicks/src/pages/CheckoutPage.jsx
//
// Phase 2 — Real Stripe Payments
//
// Payment flow:
//   Step 0  BAG      — review cart
//   Step 1  SHIPPING — address + delivery method
//   Step 2  PAYMENT  — Stripe Elements card form (PCI-compliant, runs in Stripe iframe)
//   Step 3  CONFIRM  — review totals, then:
//                       POST /api/orders  →  { order, clientSecret }
//                       stripe.confirmCardPayment(clientSecret)  →  charge card
//                       on success  →  SuccessScreen + clearCart()
//
// Backend webhook receives payment_intent.succeeded
// and flips order PENDING → PROCESSING asynchronously.

import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import {
    Elements,
    CardNumberElement,
    CardExpiryElement,
    CardCvcElement,
    useStripe,
    useElements,
} from '@stripe/react-stripe-js';

import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getShoeImage } from '../data/shoeImages';
import api from '../lib/api';
import useBreakpoint from '../hooks/useBreakPoint';

// ── Stripe singleton — created once outside component tree ────
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

// ── Constants ─────────────────────────────────────────────────
const STEPS = ['BAG', 'SHIPPING', 'PAYMENT', 'CONFIRM'];
const SHIPPING_RATES = { standard: 0, express: 12, overnight: 28 };

function calcShipping(subtotal, method) {
    if (subtotal >= 150) return 0;
    return SHIPPING_RATES[method] ?? 0;
}

// ── Shared field components ───────────────────────────────────
function Field({ label, placeholder, value, onChange, type = 'text', half = false, error }) {
    const [focused, setFocused] = useState(false);
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: half ? '1 1 calc(50% - 6px)' : '1 1 100%', minWidth: half ? 120 : 'auto' }}>
            <label style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 9, letterSpacing: '0.2em', color: error ? 'var(--red)' : 'rgba(255,255,255,0.4)' }}>{label}</label>
            <input
                type={type} value={value} placeholder={placeholder}
                onChange={e => onChange(e.target.value)}
                onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
                style={{ padding: '13px 16px', background: 'rgba(255,255,255,0.05)', border: `1px solid ${error ? 'var(--red)' : focused ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.09)'}`, borderRadius: 4, color: 'white', fontFamily: "'Barlow',sans-serif", fontSize: 14, outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box', width: '100%' }}
            />
            {error && <span style={{ fontFamily: "'Barlow',sans-serif", fontSize: 11, color: 'var(--red)' }}>{error}</span>}
        </div>
    );
}

// Wraps a Stripe Element with the same visual style as Field
function StripeField({ label, error, half = false, children }) {
    const [focused, setFocused] = useState(false);
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: half ? '1 1 calc(50% - 6px)' : '1 1 100%', minWidth: half ? 120 : 'auto' }}>
            <label style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 9, letterSpacing: '0.2em', color: error ? 'var(--red)' : 'rgba(255,255,255,0.4)' }}>{label}</label>
            <div
                onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
                style={{ padding: '13px 16px', background: 'rgba(255,255,255,0.05)', border: `1px solid ${error ? 'var(--red)' : focused ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.09)'}`, borderRadius: 4, transition: 'border-color 0.2s' }}>
                {children}
            </div>
            {error && <span style={{ fontFamily: "'Barlow',sans-serif", fontSize: 11, color: 'var(--red)' }}>{error}</span>}
        </div>
    );
}

// Appearance passed into every Stripe Element
const STRIPE_STYLE = {
    style: {
        base: {
            color: '#ffffff',
            fontFamily: "'Barlow', sans-serif",
            fontSize: '14px',
            fontSmoothing: 'antialiased',
            '::placeholder': { color: 'rgba(255,255,255,0.28)' },
        },
        invalid: { color: '#ff2200' },
    },
};

function BackBtn({ onClick, disabled }) {
    return (
        <button onClick={onClick} disabled={disabled} style={{ padding: '14px 24px', background: 'transparent', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.55)', fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 13, letterSpacing: '0.12em', cursor: 'pointer', borderRadius: 2, opacity: disabled ? 0.4 : 1 }}>
            ← BACK
        </button>
    );
}

// ── Step indicator ────────────────────────────────────────────
function StepIndicator({ current }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 40 }}>
            {STEPS.map((step, i) => {
                const done = i < current, active = i === current;
                return (
                    <div key={step} style={{ display: 'flex', alignItems: 'center', flex: i < STEPS.length - 1 ? 1 : 'none' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                            <div style={{ width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: done ? 'var(--red)' : active ? 'rgba(255,34,0,0.15)' : 'rgba(255,255,255,0.05)', border: `2px solid ${done || active ? 'var(--red)' : 'rgba(255,255,255,0.1)'}`, transition: 'all 0.3s' }}>
                                {done
                                    ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                                    : <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 11, color: active ? 'var(--red)' : 'rgba(255,255,255,0.25)' }}>{i + 1}</span>
                                }
                            </div>
                            <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 8, letterSpacing: '0.18em', color: active ? 'white' : done ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.2)', whiteSpace: 'nowrap' }}>{step}</span>
                        </div>
                        {i < STEPS.length - 1 && <div style={{ flex: 1, height: 1, background: i < current ? 'var(--red)' : 'rgba(255,255,255,0.08)', margin: '0 8px', marginBottom: 20, transition: 'background 0.3s' }} />}
                    </div>
                );
            })}
        </div>
    );
}

// ── Order summary sidebar ─────────────────────────────────────
function OrderSummary({ cartItems, subtotal, shippingMethod, isMobile }) {
    const shipping = calcShipping(subtotal, shippingMethod);
    const total = subtotal + shipping;
    return (
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 6, padding: isMobile ? 20 : 28, position: isMobile ? 'static' : 'sticky', top: 90 }}>
            <h3 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 20, letterSpacing: '0.05em', color: 'white', marginBottom: 20 }}>ORDER SUMMARY</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 20, maxHeight: 280, overflowY: 'auto', paddingRight: 4 }}>
                {cartItems.map((item, i) => (
                    <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                        <div style={{ width: 56, height: 56, borderRadius: 4, overflow: 'hidden', background: '#1a1a1a', flexShrink: 0, position: 'relative' }}>
                            <img src={getShoeImage(item.id, 0)} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            {(item.qty || 1) > 1 && (
                                <div style={{ position: 'absolute', top: -4, right: -4, width: 18, height: 18, background: 'var(--red)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 9, color: 'white' }}>{item.qty}</span>
                                </div>
                            )}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 12, letterSpacing: '0.06em', color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</div>
                            {item.size && <div style={{ fontFamily: "'Barlow',sans-serif", fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 1 }}>US {item.size}</div>}
                        </div>
                        <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 14, color: 'white', flexShrink: 0 }}>${(item.price * (item.qty || 1)).toFixed(2)}</div>
                    </div>
                ))}
            </div>
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontFamily: "'Barlow',sans-serif", fontSize: 13, color: 'rgba(255,255,255,0.45)' }}>Subtotal</span>
                    <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 14, color: 'white' }}>${subtotal.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontFamily: "'Barlow',sans-serif", fontSize: 13, color: 'rgba(255,255,255,0.45)' }}>Shipping</span>
                    <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 14, color: shipping === 0 ? '#00C851' : 'white' }}>{shipping === 0 ? 'FREE' : `$${shipping}`}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: 12, marginTop: 2 }}>
                    <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 18, color: 'white' }}>TOTAL</span>
                    <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 22, color: 'white' }}>${total.toFixed(2)}</span>
                </div>
            </div>
            {subtotal >= 150 && (
                <div style={{ marginTop: 14, padding: '8px 12px', background: 'rgba(0,200,81,0.08)', border: '1px solid rgba(0,200,81,0.2)', borderRadius: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#00C851" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                    <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 10, letterSpacing: '0.12em', color: '#00C851' }}>FREE SHIPPING UNLOCKED</span>
                </div>
            )}
        </div>
    );
}

// ── Step 0 — Bag ──────────────────────────────────────────────
function BagStep({ cartItems, subtotal, onNext, navigate }) {
    if (!cartItems.length) return (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 32, color: 'rgba(255,255,255,0.25)', marginBottom: 12 }}>YOUR BAG IS EMPTY</div>
            <button className="btn-primary" style={{ padding: '14px 36px', fontSize: 14 }} onClick={() => navigate('/collection')}>SHOP NOW →</button>
        </div>
    );
    return (
        <div>
            <h2 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 28, color: 'white', marginBottom: 24, letterSpacing: '0.04em' }}>
                YOUR BAG — {cartItems.length} ITEM{cartItems.length !== 1 ? 'S' : ''}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 32 }}>
                {cartItems.map((item, i) => (
                    <div key={i} style={{ display: 'flex', gap: 16, alignItems: 'center', padding: 16, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 4 }}>
                        <div style={{ width: 72, height: 72, borderRadius: 4, overflow: 'hidden', background: '#1a1a1a', flexShrink: 0 }}>
                            <img src={getShoeImage(item.id, 0)} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 17, color: 'white', letterSpacing: '0.04em' }}>{item.name}</div>
                            <div style={{ fontFamily: "'Barlow',sans-serif", fontSize: 12, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>
                                {item.size ? `US ${item.size}` : 'One size'} · Qty {item.qty || 1}
                            </div>
                        </div>
                        <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 22, color: 'white' }}>${(item.price * (item.qty || 1)).toFixed(2)}</div>
                    </div>
                ))}
            </div>
            <button className="btn-primary" style={{ width: '100%', padding: 16, fontSize: 14 }} onClick={onNext}>PROCEED TO SHIPPING →</button>
        </div>
    );
}

// ── Step 1 — Shipping ─────────────────────────────────────────
function ShippingStep({ form, setForm, errors, onNext, onBack }) {
    const f = field => ({ value: form[field] || '', onChange: v => setForm(p => ({ ...p, [field]: v })), error: errors[field] });
    return (
        <div>
            <h2 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 28, color: 'white', marginBottom: 24, letterSpacing: '0.04em' }}>SHIPPING INFO</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 32 }}>
                <Field label="FIRST NAME" placeholder="Alex" half {...f('firstName')} />
                <Field label="LAST NAME" placeholder="Runner" half {...f('lastName')} />
                <Field label="EMAIL ADDRESS" placeholder="alex@email.com" type="email" {...f('email')} />
                <Field label="PHONE (OPTIONAL)" placeholder="+1 555 000 0000" type="tel"   {...f('phone')} />
                <Field label="ADDRESS LINE 1" placeholder="123 Sneaker Ave"               {...f('address1')} />
                <Field label="ADDRESS LINE 2 (OPTIONAL)" placeholder="Apt, suite, unit..."         {...f('address2')} />
                <Field label="CITY" placeholder="New York" half {...f('city')} />
                <Field label="STATE / PROVINCE" placeholder="NY" half {...f('state')} />
                <Field label="ZIP / POSTAL CODE" placeholder="10001" half {...f('zip')} />
                <Field label="COUNTRY" placeholder="US" half {...f('country')} />
            </div>
            <div style={{ marginBottom: 32 }}>
                <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 10, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.4)', marginBottom: 12 }}>DELIVERY METHOD</div>
                {[
                    { id: 'standard', label: 'STANDARD SHIPPING', sub: '5–7 business days', price: 'FREE', note: 'Orders over $150' },
                    { id: 'express', label: 'EXPRESS SHIPPING', sub: '2–3 business days', price: '$12' },
                    { id: 'overnight', label: 'OVERNIGHT', sub: 'Next business day', price: '$28' },
                ].map(opt => (
                    <label key={opt.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', background: form.shipping === opt.id ? 'rgba(255,34,0,0.06)' : 'rgba(255,255,255,0.02)', border: `1px solid ${form.shipping === opt.id ? 'rgba(255,34,0,0.4)' : 'rgba(255,255,255,0.07)'}`, borderRadius: 4, marginBottom: 6, cursor: 'pointer', transition: 'all 0.2s' }}>
                        <input type="radio" name="shipping" value={opt.id} checked={form.shipping === opt.id} onChange={() => setForm(p => ({ ...p, shipping: opt.id }))} style={{ accentColor: 'var(--red)', width: 16, height: 16, flexShrink: 0 }} />
                        <div style={{ flex: 1 }}>
                            <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 12, letterSpacing: '0.1em', color: 'white' }}>{opt.label}</div>
                            <div style={{ fontFamily: "'Barlow',sans-serif", fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>{opt.sub}{opt.note ? ` · ${opt.note}` : ''}</div>
                        </div>
                        <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 16, color: opt.price === 'FREE' ? '#00C851' : 'white' }}>{opt.price}</div>
                    </label>
                ))}
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
                <BackBtn onClick={onBack} />
                <button className="btn-primary" style={{ flex: 1, padding: 14, fontSize: 14 }} onClick={onNext}>CONTINUE TO PAYMENT →</button>
            </div>
        </div>
    );
}

// ── Step 2 — Payment (Stripe Elements) ───────────────────────
function PaymentStep({ form, setForm, stripeError, onBack, onNext }) {
    return (
        <div>
            <h2 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 28, color: 'white', marginBottom: 24, letterSpacing: '0.04em' }}>PAYMENT</h2>

            {/* Payment brand row */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ padding: '6px 12px', background: '#1A1F71', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 5, height: 36, display: 'flex', alignItems: 'center' }}>
                    <span style={{ fontFamily: 'Arial', fontWeight: 900, fontStyle: 'italic', fontSize: 15, color: 'white', letterSpacing: -0.5 }}>VISA</span>
                </div>
                <div style={{ padding: '6px 10px', background: '#252525', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 5, height: 36, display: 'flex', alignItems: 'center' }}>
                    <svg width="38" height="24" viewBox="0 0 38 24"><circle cx="15" cy="12" r="10" fill="#EB001B" /><circle cx="23" cy="12" r="10" fill="#F79E1B" /><path d="M19 4.8a10 10 0 0 1 0 14.4A10 10 0 0 1 19 4.8z" fill="#FF5F00" /></svg>
                </div>
                <div style={{ padding: '6px 10px', background: '#007BC1', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 5, height: 36, display: 'flex', alignItems: 'center' }}>
                    <span style={{ fontFamily: 'Arial', fontWeight: 800, fontSize: 11, color: 'white', letterSpacing: 1 }}>AMEX</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginLeft: 'auto', padding: '6px 12px', background: 'rgba(0,200,81,0.08)', border: '1px solid rgba(0,200,81,0.2)', borderRadius: 5, height: 36, boxSizing: 'border-box' }}>
                    <svg width="11" height="13" viewBox="0 0 24 24" fill="none" stroke="#00C851" strokeWidth="2.5" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                    <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 9, letterSpacing: '0.12em', color: '#00C851' }}>256-BIT SSL</span>
                </div>
            </div>

            {/* Test card hint */}
            <div style={{ padding: '12px 16px', background: 'rgba(255,184,0,0.06)', border: '1px solid rgba(255,184,0,0.2)', borderRadius: 6, marginBottom: 24 }}>
                <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 9, letterSpacing: '0.18em', color: '#FFB800', marginBottom: 4 }}>STRIPE TEST MODE</div>
                <div style={{ fontFamily: "'Barlow',sans-serif", fontSize: 12, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7 }}>
                    Card: <strong style={{ color: 'rgba(255,255,255,0.85)', letterSpacing: '0.08em' }}>4242 4242 4242 4242</strong>
                    &nbsp;·&nbsp; Any future expiry &nbsp;·&nbsp; Any 3-digit CVC
                </div>
            </div>

            {/* Name on card — plain input (not a Stripe element) */}
            <div style={{ marginBottom: 16 }}>
                <Field
                    label="NAME ON CARD"
                    placeholder="Alex Runner"
                    value={form.cardName || ''}
                    onChange={v => setForm(p => ({ ...p, cardName: v }))}
                    error={form.cardNameError}
                />
            </div>

            {/* Card number — Stripe Element */}
            <div style={{ marginBottom: 16 }}>
                <StripeField label="CARD NUMBER">
                    <CardNumberElement options={STRIPE_STYLE} />
                </StripeField>
            </div>

            {/* Expiry + CVC side by side */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 28 }}>
                <StripeField label="EXPIRY DATE" half>
                    <CardExpiryElement options={STRIPE_STYLE} />
                </StripeField>
                <StripeField label="CVC" half>
                    <CardCvcElement options={STRIPE_STYLE} />
                </StripeField>
            </div>

            {stripeError && (
                <div style={{ padding: '12px 16px', background: 'rgba(255,34,0,0.08)', border: '1px solid rgba(255,34,0,0.25)', borderRadius: 6, marginBottom: 20 }}>
                    <span style={{ fontFamily: "'Barlow',sans-serif", fontSize: 13, color: '#ff6644' }}>{stripeError}</span>
                </div>
            )}

            <div style={{ display: 'flex', gap: 10 }}>
                <BackBtn onClick={onBack} />
                <button className="btn-primary" style={{ flex: 1, padding: 14, fontSize: 14 }} onClick={onNext}>
                    REVIEW ORDER →
                </button>
            </div>
        </div>
    );
}

// ── Step 3 — Confirm & Place ──────────────────────────────────
function ConfirmStep({ form, subtotal, onPlace, placing, stripeError, onBack }) {
    const shipping = calcShipping(subtotal, form.shipping);
    const total = subtotal + shipping;
    return (
        <div>
            <h2 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 28, color: 'white', marginBottom: 24, letterSpacing: '0.04em' }}>REVIEW & PLACE ORDER</h2>

            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 4, padding: '16px 20px', marginBottom: 14 }}>
                <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 9, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.35)', marginBottom: 8 }}>SHIPPING TO</div>
                <div style={{ fontFamily: "'Barlow',sans-serif", fontSize: 13, color: 'rgba(255,255,255,0.7)', lineHeight: 1.8 }}>
                    {form.firstName} {form.lastName}<br />
                    {form.address1}{form.address2 ? `, ${form.address2}` : ''}<br />
                    {form.city}, {form.state} {form.zip}
                </div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 4, padding: '16px 20px', marginBottom: 14 }}>
                <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 9, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.35)', marginBottom: 8 }}>PAYMENT</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: "'Barlow',sans-serif", fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>
                    <svg width="12" height="14" viewBox="0 0 24 24" fill="none" stroke="#00C851" strokeWidth="2.5" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                    Secured by Stripe · {form.cardName || 'Card on file'}
                </div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 4, padding: '16px 20px', marginBottom: 32 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontFamily: "'Barlow',sans-serif", fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>Subtotal</span>
                    <span style={{ fontFamily: "'Barlow',sans-serif", fontSize: 13, color: 'white' }}>${subtotal.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                    <span style={{ fontFamily: "'Barlow',sans-serif", fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>Shipping ({form.shipping})</span>
                    <span style={{ fontFamily: "'Barlow',sans-serif", fontSize: 13, color: shipping === 0 ? '#00C851' : 'white' }}>{shipping === 0 ? 'FREE' : `$${shipping}`}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: 12 }}>
                    <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 20, color: 'white' }}>TOTAL</span>
                    <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 24, color: 'white' }}>${total.toFixed(2)}</span>
                </div>
            </div>

            {stripeError && (
                <div style={{ padding: '12px 16px', background: 'rgba(255,34,0,0.08)', border: '1px solid rgba(255,34,0,0.25)', borderRadius: 6, marginBottom: 20 }}>
                    <span style={{ fontFamily: "'Barlow',sans-serif", fontSize: 13, color: '#ff6644' }}>{stripeError}</span>
                </div>
            )}

            <button className="btn-primary" disabled={placing} style={{ width: '100%', padding: 18, fontSize: 15, opacity: placing ? 0.7 : 1, transition: 'opacity 0.2s' }} onClick={onPlace}>
                {placing
                    ? <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                        <span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', display: 'inline-block', animation: 'ckSpin 0.7s linear infinite' }} />
                        PROCESSING PAYMENT...
                    </span>
                    : `PLACE ORDER — $${total.toFixed(2)}`
                }
            </button>
            <p style={{ textAlign: 'center', fontFamily: "'Barlow',sans-serif", fontSize: 11, color: 'rgba(255,255,255,0.25)', marginTop: 12, lineHeight: 1.6 }}>
                Payment processed securely by Stripe. We never store your card details.
            </p>
            <style>{`@keyframes ckSpin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}

// ── Success screen ────────────────────────────────────────────
function SuccessScreen({ orderId, navigate }) {
    const displayId = orderId ? `APX-${orderId.slice(-8).toUpperCase()}` : `APX-${Math.floor(10000 + Math.random() * 90000)}`;
    return (
        <div style={{ minHeight: '70vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '60px 24px' }}>
            <div style={{ width: 90, height: 90, borderRadius: '50%', background: 'rgba(0,200,81,0.1)', border: '2px solid rgba(0,200,81,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 28, animation: 'ckPopIn 0.5s cubic-bezier(0.23,1,0.32,1)' }}>
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#00C851" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
            </div>
            <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 10, letterSpacing: '0.3em', color: '#00C851', marginBottom: 12 }}>PAYMENT CONFIRMED</div>
            <h1 className="display-heading" style={{ fontSize: 'clamp(40px,7vw,72px)', lineHeight: 0.92, marginBottom: 16 }}>
                YOU'RE<br /><span style={{ color: 'var(--red)' }}>ALL SET.</span>
            </h1>
            <p style={{ fontFamily: "'Barlow',sans-serif", fontSize: 14, color: 'rgba(255,255,255,0.45)', maxWidth: 380, lineHeight: 1.8, marginBottom: 8 }}>
                Your order <strong style={{ color: 'white' }}>{displayId}</strong> is confirmed. We'll send tracking details to your email within 24 hours.
            </p>
            <p style={{ fontFamily: "'Barlow',sans-serif", fontSize: 13, color: 'rgba(255,255,255,0.3)', marginBottom: 40 }}>Estimated delivery: 3–5 business days.</p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
                <button className="btn-primary" style={{ padding: '14px 32px', fontSize: 14 }} onClick={() => navigate('/collection')}>KEEP SHOPPING →</button>
                <button onClick={() => navigate('/profile')} style={{ padding: '14px 32px', background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.6)', fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 13, letterSpacing: '0.12em', cursor: 'pointer', borderRadius: 2 }}>VIEW ORDERS</button>
            </div>
            <style>{`@keyframes ckPopIn { from { transform: scale(0.5); opacity: 0; } to { transform: scale(1); opacity: 1; } }`}</style>
        </div>
    );
}

// ── Inner checkout — uses Stripe hooks (must be inside <Elements>) ─
function CheckoutInner() {
    const { cartItems, total: subtotal, clearCart } = useCart();
    const { isLoggedIn, getToken } = useAuth();
    const addToast = useToast();
    const navigate = useNavigate();
    const { isMobile } = useBreakpoint();
    const stripe = useStripe();
    const elements = useElements();

    const [step, setStep] = useState(0);
    const [form, setForm] = useState({ shipping: 'standard' });
    const [errors, setErrors] = useState({});
    const [stripeError, setStripeError] = useState('');
    const [placing, setPlacing] = useState(false);
    const [success, setSuccess] = useState(false);
    const [doneOrderId, setDoneOrderId] = useState(null);

    // Holds { clientSecret, orderId } after POST /api/orders succeeds.
    // Using a ref prevents stale closure issues inside placeOrder.
    const pendingRef = useRef({ clientSecret: null, orderId: null });

    const px = isMobile ? 20 : 48;

    // ── Helpers ────────────────────────────────────────────────
    function goTo(n) {
        setErrors({});
        setStripeError('');
        setStep(n);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function validateShipping() {
        const e = {};
        ['firstName', 'lastName', 'email', 'address1', 'city', 'state', 'zip', 'country'].forEach(k => {
            if (!form[k]?.trim()) e[k] = 'Required';
        });
        if (form.email && !form.email.includes('@')) e.email = 'Enter a valid email';
        return e;
    }

    // ── Step nav ───────────────────────────────────────────────
    function handleShippingNext() {
        const e = validateShipping();
        if (Object.keys(e).length) { setErrors(e); return; }
        goTo(2);
    }

    function handlePaymentNext() {
        if (!form.cardName?.trim()) {
            setForm(p => ({ ...p, cardNameError: 'Required' }));
            return;
        }
        setForm(p => ({ ...p, cardNameError: undefined }));
        goTo(3);
    }

    // ── Place order: POST /api/orders then stripe.confirmCardPayment ─
    async function placeOrder() {
        if (!stripe || !elements) {
            setStripeError('Stripe has not loaded yet — please wait a moment.');
            return;
        }

        setPlacing(true);
        setStripeError('');

        try {
            // 1. Create order in DB + get Stripe clientSecret
            //    Only create once — reuse if user navigated back and re-submitted.
            let { clientSecret, orderId } = pendingRef.current;

            if (!clientSecret) {
                const token = isLoggedIn ? await getToken() : null;

                const { order, clientSecret: cs } = await api.post('/orders', {
                    items: cartItems.map(item => ({
                        productId: item.id,
                        name: item.name,
                        size: String(item.size ?? 'ONE'),  // coerce number → string (SIZES array stores numbers)
                        qty: item.qty || 1,
                        price: item.price,
                    })),
                    shipping: { method: form.shipping },
                    shippingAddress: {
                        firstName: form.firstName || '',
                        lastName: form.lastName || '',
                        line1: form.address1 || '',
                        line2: form.address2 || '',
                        city: form.city || '',
                        state: form.state || '',
                        zip: form.zip || '',
                        country: form.country || 'US',
                    },
                }, token);

                if (!cs) throw new Error('No clientSecret from server. Check STRIPE_SECRET_KEY in backend .env.');
                clientSecret = cs;
                orderId = order?.id;
                pendingRef.current = { clientSecret, orderId };
            }

            // 2. Confirm card payment with Stripe.js (this is where the card is charged)
            const cardElement = elements.getElement(CardNumberElement);
            const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                    card: cardElement,
                    billing_details: {
                        name: form.cardName || `${form.firstName} ${form.lastName}`,
                        email: form.email,
                    },
                },
            });

            if (error) {
                // Stripe provides clear, user-friendly error messages
                setStripeError(error.message);
                addToast('error', 'Payment failed', error.message);
                setPlacing(false);
                return;
            }

            if (paymentIntent?.status === 'succeeded') {
                // 3. Done — clear cart and show success screen
                setDoneOrderId(orderId);
                setSuccess(true);
                clearCart();
                addToast('success', 'Order confirmed!', 'Check your email for tracking info.');
            }
        } catch (err) {
            console.error('[CheckoutPage] placeOrder:', err);

            // 409 = one or more items sold out / out of stock
            if (err.status === 409) {
                const details = err.data?.details;
                const itemList = Array.isArray(details) && details.length
                    ? details.join(', ')
                    : err.message;
                setStripeError('');
                addToast('error', "DROPPED FROM THE LINEUP 👟", `These sizes sold out: ${itemList}. Remove them from your cart to continue.`);
                // Navigate back to bag so user can see and remove the items
                goTo(1);
                setPlacing(false);
                return;
            }

            setStripeError(err.message || 'Something went wrong. Please try again.');
            addToast('error', 'Order failed', err.message || 'Please try again.');
            setPlacing(false);
        }
    }

    // ── Render ─────────────────────────────────────────────────
    if (success) return (
        <div style={{ paddingTop: 64, minHeight: '100vh', background: '#080808' }}>
            <SuccessScreen orderId={doneOrderId} navigate={navigate} />
        </div>
    );

    return (
        <div style={{ paddingTop: 64, minHeight: '100vh', background: '#080808' }}>
            <div style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', padding: `${isMobile ? 28 : 40}px ${px}px 24px` }}>
                <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                    <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 10, letterSpacing: '0.25em', color: 'var(--red)' }}>SECURE CHECKOUT</span>
                    <h1 className="display-heading" style={{ fontSize: isMobile ? 40 : 56, marginTop: 6, lineHeight: 0.92 }}>CHECKOUT</h1>
                </div>
            </div>

            <div style={{ maxWidth: 1200, margin: '0 auto', padding: `${isMobile ? 28 : 48}px ${px}px 80px` }}>
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 380px', gap: isMobile ? 32 : 48, alignItems: 'flex-start' }}>
                    <div>
                        <StepIndicator current={step} />
                        {step === 0 && <BagStep cartItems={cartItems} subtotal={subtotal} onNext={() => goTo(1)} navigate={navigate} />}
                        {step === 1 && <ShippingStep form={form} setForm={setForm} errors={errors} onNext={handleShippingNext} onBack={() => goTo(0)} />}
                        {/* PaymentStep stays mounted on step 3 so Stripe card elements remain in the DOM.
                getElement(CardNumberElement) returns null if the element is unmounted. */}
                        <div style={{ display: step === 2 ? 'block' : 'none' }}>
                            <PaymentStep form={form} setForm={setForm} stripeError={stripeError} onBack={() => goTo(1)} onNext={handlePaymentNext} />
                        </div>
                        {step === 3 && <ConfirmStep form={form} subtotal={subtotal} onPlace={placeOrder} placing={placing} stripeError={stripeError} onBack={() => goTo(2)} />}
                    </div>
                    {(!isMobile || step === 0) && (
                        <OrderSummary cartItems={cartItems} subtotal={subtotal} shippingMethod={form.shipping} isMobile={isMobile} />
                    )}
                </div>
            </div>
        </div>
    );
}

// ── Root export — wraps everything in Stripe Elements provider ─
export default function CheckoutPage() {
    return (
        <Elements stripe={stripePromise}>
            <CheckoutInner />
        </Elements>
    );
}