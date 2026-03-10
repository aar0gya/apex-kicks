export const PRODUCTS = [
    // ── RUNNING ───────────────────────────────────────────────
    {
        id: 1,
        name: 'APEX PHANTOM',
        brand: 'APEX', price: 249, tag: 'NEW DROP',
        color: '#E8D5B7', accent: '#FF4500', img: '👟',
        desc: 'Ultra-light carbon fiber sole. Built for the relentless.',
        category: 'RUNNING',
    },
    {
        id: 2,
        name: 'VOID RUNNER',
        brand: 'APEX', price: 189, tag: 'BESTSELLER',
        color: '#C8E6FF', accent: '#0066FF', img: '👟',
        desc: 'Maximum cushion. Zero compromise. Pure street dominance.',
        category: 'RUNNING',
    },
    {
        id: 7,
        name: 'STORM PACER',
        brand: 'APEX', price: 209, tag: 'NEW',
        color: '#D0E8FF', accent: '#00AAFF', img: '👟',
        desc: 'All-weather grip meets featherweight construction. Own any terrain.',
        category: 'RUNNING',
    },
    {
        id: 8,
        name: 'QUANTUM STRIDE',
        brand: 'APEX', price: 269, tag: 'HOT',
        color: '#FFD6E0', accent: '#FF0055', img: '👟',
        desc: 'Propulsive energy return with every footstrike. Run further, recover faster.',
        category: 'RUNNING',
    },
    {
        id: 9,
        name: 'AERO GHOST',
        brand: 'APEX', price: 179, tag: 'SALE',
        color: '#E8F5E8', accent: '#44BB44', img: '👟',
        desc: 'So light you forget you have them on. Long-distance perfected.',
        category: 'RUNNING',
    },

    // ── LIFESTYLE ─────────────────────────────────────────────
    {
        id: 3,
        name: 'CHROME LEGEND',
        brand: 'APEX', price: 319, tag: 'LIMITED',
        color: '#D4EDDA', accent: '#00C851', img: '👟',
        desc: 'Heritage silhouette reimagined for the next generation.',
        category: 'LIFESTYLE',
    },
    {
        id: 10,
        name: 'CANVAS SOUL',
        brand: 'APEX', price: 149, tag: 'NEW',
        color: '#FFF8E7', accent: '#D4A017', img: '👟',
        desc: 'Premium vulcanised canvas with hand-stitched detailing. Culture underfoot.',
        category: 'LIFESTYLE',
    },
    {
        id: 11,
        name: 'TERRACE CL',
        brand: 'APEX', price: 199, tag: 'BESTSELLER',
        color: '#F0E6FF', accent: '#9B59B6', img: '👟',
        desc: 'Court-to-street crossover with a clean leather upper and gum sole.',
        category: 'LIFESTYLE',
    },
    {
        id: 12,
        name: 'SUEDE DRIFT',
        brand: 'APEX', price: 229, tag: 'HOT',
        color: '#FFEEDD', accent: '#CC6633', img: '👟',
        desc: 'Butter-soft premium suede. Minimal design, maximum presence.',
        category: 'LIFESTYLE',
    },
    {
        id: 13,
        name: 'VELVET PEAK',
        brand: 'APEX', price: 289, tag: 'LIMITED',
        color: '#EDE0FF', accent: '#7B2FBE', img: '👟',
        desc: 'Luxurious velvet uppers meet chunky heritage outsole. Built to be seen.',
        category: 'LIFESTYLE',
    },

    // ── TRAINING ─────────────────────────────────────────────
    {
        id: 4,
        name: 'EMBER FORCE',
        brand: 'APEX', price: 279, tag: 'HOT',
        color: '#FFE4CC', accent: '#FF6B35', img: '👟',
        desc: 'Reactive foam technology that moves before you do.',
        category: 'TRAINING',
    },
    {
        id: 6,
        name: 'SOLAR STRIKE',
        brand: 'APEX', price: 229, tag: 'NEW',
        color: '#FFF3CC', accent: '#FFB800', img: '👟',
        desc: 'Energy return technology that fuels every stride.',
        category: 'TRAINING',
    },
    {
        id: 14,
        name: 'IRON CROSS XT',
        brand: 'APEX', price: 239, tag: 'NEW',
        color: '#E8E0D8', accent: '#888877', img: '👟',
        desc: 'Cross-training beast. Lateral support for lifts, agility for the floor.',
        category: 'TRAINING',
    },
    {
        id: 15,
        name: 'FLEX TITAN',
        brand: 'APEX', price: 199, tag: 'BESTSELLER',
        color: '#D8F0FF', accent: '#0099CC', img: '👟',
        desc: 'Flexible zoned cushioning adapts to every movement pattern. Train smarter.',
        category: 'TRAINING',
    },
    {
        id: 16,
        name: 'GROUND FORCE',
        brand: 'APEX', price: 259, tag: 'HOT',
        color: '#FFE8D0', accent: '#E65C00', img: '👟',
        desc: 'Wide base, low drop. Built for powerlifters who demand stability.',
        category: 'TRAINING',
    },

    // ── COLLAB ────────────────────────────────────────────────
    {
        id: 5,
        name: 'OBSIDIAN PRO',
        brand: 'APEX', price: 359, tag: 'EXCLUSIVE',
        color: '#E8E8E8', accent: '#F5F5DC', img: '👟',
        desc: 'The pinnacle of performance engineering. Zero distractions.',
        category: 'COLLAB',
    },
    {
        id: 17,
        name: 'NEON × MARZ',
        brand: 'APEX × MARZ', price: 429, tag: 'LIMITED',
        color: '#CCFFE0', accent: '#00FF88', img: '👟',
        desc: 'Tokyo graffiti culture explodes across premium leather. Only 500 made.',
        category: 'COLLAB',
    },
    {
        id: 18,
        name: 'LUNAR × LUNA',
        brand: 'APEX × LUNA', price: 499, tag: 'EXCLUSIVE',
        color: '#E0D0FF', accent: '#8855FF', img: '👟',
        desc: 'Celestial hand-painted uppers on buttery suede. A wearable artwork.',
        category: 'COLLAB',
    },
    {
        id: 19,
        name: 'JADE × KOTO',
        brand: 'APEX × KOTO', price: 389, tag: 'LIMITED',
        color: '#D0FFE8', accent: '#00BB66', img: '👟',
        desc: 'Minimalist Japanese philosophy meets Western performance engineering.',
        category: 'COLLAB',
    },
    {
        id: 20,
        name: 'GOLD × VALE',
        brand: 'APEX × VALE', price: 549, tag: 'EXCLUSIVE',
        color: '#FFF8CC', accent: '#CCAA00', img: '👟',
        desc: "London's most coveted collab. All-black with 24k gold detailing.",
        category: 'COLLAB',
    },
];

export const CATEGORIES = ['ALL', 'RUNNING', 'LIFESTYLE', 'TRAINING', 'COLLAB'];

export const TESTIMONIALS = [
    {
        name: 'MARCUS L.', rating: 5, loc: 'NYC',
        text: 'The Phantom X2 changed how I train. Zero break-in period, maximum comfort from day one.',
    },
    {
        name: 'SASHA K.', rating: 5, loc: 'LONDON',
        text: "Finally a sneaker brand that doesn't sacrifice style for performance. Apex is different.",
    },
    {
        name: 'DEV R.', rating: 5, loc: 'TOKYO',
        text: 'Void Runner is now my daily go-to. The foam is genuinely something else. Worth every dollar.',
    },
];

export const TICKER_ITEMS = [
    'NEW DROP: PHANTOM X2',
    'FREE SHIPPING OVER $150',
    'LIMITED COLLAB OUT NOW',
    'VOID RUNNER — RESTOCKED',
    'JOIN APEX ELITE — EARLY ACCESS',
];

export const NAV_LINKS = ['COLLECTION', 'DROPS', 'COLLAB', 'STORIES', 'ABOUT'];

export const STATS = [
    ['50K+', 'CUSTOMERS'],
    ['200+', 'STYLES'],
    ['98%', 'RATED'],
    ['72H', 'DELIVERY'],
];

export const BRAND_FEATURES = [
    ['🏆', 'AWARD WINNING', '3 consecutive years, Best Sneaker Brand'],
    ['🌍', 'SUSTAINABLE', '60% recycled materials across all lines'],
    ['⚡', 'PERFORMANCE', 'Used by 200+ professional athletes'],
    ['🎨', 'DESIGN', 'Collaboration with 50+ global artists'],
];

export const FOOTER_LINKS = [
    ['SHOP', ['New Arrivals', 'Running', 'Lifestyle', 'Training', 'Collab', 'Sale']],
    ['COMPANY', ['Our Story', 'Careers', 'Press', 'Sustainability', 'Partners']],
    ['HELP', ['FAQ', 'Shipping', 'Returns', 'Size Guide', 'Contact Us']],
];