// apex-backend/src/routes/products.js
import { Router } from 'express';
import prisma from '../lib/prisma.js';

const router = Router();

// ── GET /api/products ─────────────────────────────────────────
// Public — no auth required.
// Supports ?category=&brand=&minPrice=&maxPrice=&page=&limit=
router.get('/', async (req, res) => {
    try {
        const {
            category, brand,
            minPrice, maxPrice,
            page = 1,
            limit = 12,
            sort = 'createdAt',
        } = req.query;

        const where = {};
        if (category) where.category = category;
        if (brand) where.brand = brand;
        if (minPrice || maxPrice) {
            where.price = {};
            if (minPrice) where.price.gte = Number(minPrice) * 100;
            if (maxPrice) where.price.lte = Number(maxPrice) * 100;
        }

        const orderBy = sort === 'price_asc' ? { price: 'asc' }
            : sort === 'price_desc' ? { price: 'desc' }
                : { createdAt: 'desc' };

        const [products, total] = await Promise.all([
            prisma.product.findMany({
                where,
                orderBy,
                skip: (Number(page) - 1) * Number(limit),
                take: Number(limit),
            }),
            prisma.product.count({ where }),
        ]);

        res.json({
            products: products.map(formatProduct),
            total,
            page: Number(page),
            pages: Math.ceil(total / Number(limit)),
        });
    } catch (err) {
        console.error('[GET /products]', err);
        res.status(500).json({ error: 'Failed to load products.' });
    }
});

// ── GET /api/products/:id ─────────────────────────────────────
router.get('/:id', async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (isNaN(id)) return res.status(400).json({ error: 'Invalid product id.' });

        const product = await prisma.product.findUnique({ where: { id } });
        if (!product) return res.status(404).json({ error: 'Product not found.' });

        res.json(formatProduct(product));
    } catch (err) {
        res.status(500).json({ error: 'Failed to load product.' });
    }
});

// ── POST /api/products/seed ───────────────────────────────────
// DEV ONLY — seeds the DB with your existing frontend product data.
// Disable this route in production (NODE_ENV check).
router.post('/seed', async (req, res) => {
    if (process.env.NODE_ENV !== 'development') {
        return res.status(403).json({ error: 'Seed endpoint disabled in production.' });
    }

    const PRODUCTS = [
        { id: 1, slug: 'apex-phantom-x2', name: 'APEX PHANTOM X2', brand: 'APEX', category: 'RUNNING', price: 24900, desc: 'The pinnacle of performance engineering. Carbon plate meets ReactFoam+ for an unmatched ride.', tag: 'EXCLUSIVE', color: '#1a1a2e', accent: '#ff2200', imageKey: 'y2MeW09zrdg', stock: { '7': 3, '7.5': 2, '8': 5, '8.5': 4, '9': 6, '9.5': 3, '10': 2 } },
        { id: 2, slug: 'quantum-stride', name: 'QUANTUM STRIDE', brand: 'APEX', category: 'RUNNING', price: 26900, desc: 'Zero-gravity cushioning for maximum daily comfort and street-ready style.', tag: 'NEW DROP', color: '#0d1b2a', accent: '#00d4ff', imageKey: 'se7_4lAzTMk', stock: { '7': 4, '8': 3, '8.5': 5, '9': 4, '10': 2, '11': 1 } },
        { id: 3, slug: 'chrome-legend', name: 'CHROME LEGEND', brand: 'APEX', category: 'LIFESTYLE', price: 31900, desc: 'Premium leather construction for those who refuse to compromise on quality or aesthetics.', tag: 'COLLAB', color: '#1c1c1e', accent: '#c8a951', imageKey: 'ISg37AI2A-s', stock: { '7': 1, '8': 3, '9': 4, '9.5': 2, '10': 3 } },
        { id: 4, slug: 'ember-force', name: 'EMBER FORCE', brand: 'APEX', category: 'TRAINING', price: 21900, desc: 'Built for the athlete who trains harder than everyone else. Period.', tag: 'BESTSELLER', color: '#1a0a00', accent: '#ff6b00', imageKey: 'Rskp4qr3JHE', stock: { '7': 6, '8': 4, '8.5': 3, '9': 5, '10': 2 } },
        { id: 5, slug: 'obsidian-pro', name: 'OBSIDIAN PRO', brand: 'APEX', category: 'LIFESTYLE', price: 35900, desc: 'The pinnacle of performance engineering. Zero distractions.', tag: 'EXCLUSIVE', color: '#0a0a0a', accent: '#ffffff', imageKey: 'VmCONfuzAn4', stock: { '7': 2, '8': 1, '9': 3, '10': 2, '11': 1 } },
        { id: 6, slug: 'void-runner', name: 'VOID RUNNER', brand: 'APEX', category: 'RUNNING', price: 18900, desc: 'Engineered for maximum energy return. Every step gives back.', tag: 'NEW DROP', color: '#001a0d', accent: '#00ff88', imageKey: 'WB4-O0LkVCI', stock: { '7': 5, '8': 4, '9': 3, '10': 4, '11': 2 } },
    ];

    try {
        await prisma.product.deleteMany();
        await Promise.all(
            PRODUCTS.map(p =>
                prisma.product.create({
                    data: {
                        id: p.id,
                        slug: p.slug,
                        name: p.name,
                        brand: p.brand,
                        category: p.category,
                        price: p.price,
                        desc: p.desc,
                        tag: p.tag,
                        color: p.color,
                        accent: p.accent,
                        imageKey: p.imageKey,
                        stock: p.stock,
                    },
                })
            )
        );
        res.json({ ok: true, seeded: PRODUCTS.length });
    } catch (err) {
        console.error('[POST /products/seed]', err);
        res.status(500).json({ error: err.message });
    }
});

// ── Format helper ─────────────────────────────────────────────
function formatProduct(p) {
    return {
        ...p,
        price: p.price / 100,          // convert cents → dollars for frontend
        imageUrl: `https://images.unsplash.com/photo-${p.imageKey}?w=800&q=80`,
    };
}

export default router;