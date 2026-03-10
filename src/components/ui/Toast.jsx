import { useToasts } from '../../context/ToastContext';
import { useEffect, useState } from 'react';

const ICONS = { success: '✓', error: '✕', info: 'ℹ', warning: '⚠' };
const COLORS = {
    success: '#00C851',
    error: 'var(--red)',
    info: '#0099CC',
    warning: '#FFB800',
};

function ToastItem({ toast, onRemove }) {
    const [visible, setVisible] = useState(false);
    useEffect(() => {
        requestAnimationFrame(() => setVisible(true));
    }, []);

    const color = COLORS[toast.type] || COLORS.info;

    return (
        <div
            onClick={() => onRemove(toast.id)}
            style={{
                display: 'flex', alignItems: 'flex-start', gap: 12,
                background: '#161616',
                border: `1px solid ${color}44`,
                borderLeft: `3px solid ${color}`,
                padding: '14px 16px',
                borderRadius: 3,
                minWidth: 280, maxWidth: 360,
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden',
                transform: visible ? 'translateX(0)' : 'translateX(120%)',
                opacity: visible ? 1 : 0,
                transition: 'transform 0.35s cubic-bezier(0.23,1,0.32,1), opacity 0.35s',
                boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            }}>
            {/* Icon */}
            <div style={{
                width: 22, height: 22, borderRadius: '50%',
                background: color + '22',
                border: `1px solid ${color}66`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, color, flexShrink: 0, fontWeight: 700,
            }}>
                {ICONS[toast.type]}
            </div>

            {/* Text */}
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                    fontFamily: "'Barlow Condensed',sans-serif",
                    fontWeight: 700, fontSize: 12, letterSpacing: '0.08em',
                    color: 'rgba(255,255,255,0.9)',
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}>
                    {toast.title}
                </div>
                {toast.message && (
                    <div style={{
                        fontFamily: "'Barlow',sans-serif",
                        fontSize: 11, color: 'rgba(255,255,255,0.45)', marginTop: 2,
                    }}>
                        {toast.message}
                    </div>
                )}
            </div>

            {/* Dismiss */}
            <button style={{
                background: 'none', border: 'none',
                color: 'rgba(255,255,255,0.25)', fontSize: 14,
                cursor: 'pointer', padding: 0, flexShrink: 0,
                lineHeight: 1,
            }}>×</button>

            {/* Progress bar */}
            <div style={{
                position: 'absolute', bottom: 0, left: 0,
                height: 2, background: color,
                animation: 'toastProgress 3.5s linear forwards',
            }} />

            <style>{`
        @keyframes toastProgress {
          from { width: 100%; }
          to   { width: 0%; }
        }
      `}</style>
        </div>
    );
}

export default function ToastContainer() {
    const { toasts = [], removeToast } = useToasts();

    return (
        <div style={{
            position: 'fixed',
            bottom: 24, right: 24,
            zIndex: 9999,
            display: 'flex', flexDirection: 'column', gap: 10,
            pointerEvents: 'none',
        }}>
            {toasts.map(t => (
                <div key={t.id} style={{ pointerEvents: 'all' }}>
                    <ToastItem toast={t} onRemove={removeToast} />
                </div>
            ))}
        </div>
    );
}