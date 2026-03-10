import useBreakpoint from '../../hooks/useBreakPoint';

const PRESETS = {
    products: {
        icon: '👟',
        title: 'NO KICKS FOUND',
        message: 'Nothing matches that filter right now. Try a different category or clear your filters.',
        cta: 'CLEAR FILTERS',
    },
    stories: {
        icon: '📖',
        title: 'NO STORIES YET',
        message: "We haven't published anything in this category yet. Check back soon.",
        cta: 'VIEW ALL STORIES',
    },
    search: {
        icon: '🔍',
        title: 'NO RESULTS',
        message: 'Try a different search term or browse our full collection.',
        cta: 'BROWSE ALL',
    },
    cart: {
        icon: '👟',
        title: 'YOUR CART IS EMPTY',
        message: "Looks like you haven't added anything yet. Go find your next pair.",
        cta: 'SHOP NOW',
    },
};

export default function EmptyState({
    type = 'products',
    title,
    message,
    icon,
    ctaLabel,
    onCta,
    accent = 'var(--red)',
}) {
    const { isMobile } = useBreakpoint();
    const preset = PRESETS[type] || PRESETS.products;

    const displayIcon = icon || preset.icon;
    const displayTitle = title || preset.title;
    const displayMessage = message || preset.message;
    const displayCta = ctaLabel || preset.cta;

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: isMobile ? '56px 24px' : '80px 40px',
            textAlign: 'center',
            width: '100%',
        }}>
            {/* Glowing icon ring */}
            <div style={{
                width: isMobile ? 80 : 100,
                height: isMobile ? 80 : 100,
                borderRadius: '50%',
                background: `radial-gradient(circle,${accent}18,transparent 70%)`,
                border: `1px solid ${accent}30`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: isMobile ? 34 : 42,
                marginBottom: 24,
            }}>
                {displayIcon}
            </div>

            {/* Title */}
            <h3 className="display-heading" style={{
                fontSize: isMobile ? 28 : 36,
                color: 'rgba(255,255,255,0.7)',
                marginBottom: 12,
                lineHeight: 1,
            }}>
                {displayTitle}
            </h3>

            {/* Message */}
            <p style={{
                fontFamily: "'Barlow',sans-serif",
                fontSize: isMobile ? 13 : 14,
                color: 'rgba(255,255,255,0.3)',
                lineHeight: 1.7,
                maxWidth: 340,
                marginBottom: onCta ? 28 : 0,
            }}>
                {displayMessage}
            </p>

            {/* CTA button */}
            {onCta && (
                <button
                    onClick={onCta}
                    className="btn-outline"
                    style={{ padding: isMobile ? '12px 28px' : '13px 32px', fontSize: 12 }}>
                    {displayCta} →
                </button>
            )}
        </div>
    );
}