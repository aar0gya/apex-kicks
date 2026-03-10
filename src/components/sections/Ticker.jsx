import { TICKER_ITEMS } from '../../data/products';

// Repeat items enough times to create a seamless loop
const REPEATED = [...TICKER_ITEMS, ...TICKER_ITEMS, ...TICKER_ITEMS, ...TICKER_ITEMS];

/**
 * Ticker — infinite scrolling announcement marquee in brand red.
 * CSS animation runs at a constant pace via .marquee-track class.
 */
function Ticker() {
    return (
        <div
            style={{
                background: 'var(--red)',
                padding: '5px 5px',
                overflow: 'hidden',
                position: 'relative',
                zIndex: 100,
            }}
        >
            <div
                className="marquee-track"
                style={{ gap: 60, alignItems: 'center' }}
            >
                {REPEATED.map((item, i) => (
                    <span
                        key={i}
                        style={{
                            fontFamily: "'Barlow Condensed', sans-serif",
                            fontWeight: 700,
                            letterSpacing: '0.15em',
                            fontSize: 15,
                            whiteSpace: 'nowrap',
                            display: 'flex',
                            alignItems: 'center',
                            paddingTop: 80,
                            paddingBottom: 10,
                            gap: 16,
                        }}
                    >
                        {item}
                        <span style={{ opacity: 0.5, fontSize: 8 }}>◆</span>
                    </span>
                ))}
            </div>
        </div>
    );
}

export default Ticker;