// apex-backend/src/routes/inventory.js
// Phase 4 — live inventory API
//
// GET  /api/inventory            — all products with per-size stock (public)
// GET  /api/inventory/:productId — single product stock (public)
// PATCH /api/inventory/:productId/:size — set/adjust stock (auth required)

import { Router } from 'express';
import { z } from 'zod';
import { protect } from '../middleware/auth.js';
import prisma from '../lib/prisma.js';

const router = Router();

// ── GET /api/inventory ────────────────────────────────────────
router.get('/', async (req, res) => {
    try {
        const products = await prisma.product.findMany({
            where: { isActive: true },
            include: { sizes: { orderBy: { size: 'asc' } } },
            orderBy: { id: 'asc' },
        });
        res.json(products.map(fmtProduct));
    } catch (err) {
        console.error('[GET /inventory]', err.message);
        res.status(500).json({ error: 'Failed to load inventory.' });
    }
});

// ── GET /api/inventory/:productId ────────────────────────────
router.get('/:productId', async (req, res) => {
    const id = parseInt(req.params.productId, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid productId.' });
    try {
        const product = await prisma.product.findUnique({
            where: { id },
            include: { sizes: { orderBy: { size: 'asc' } } },
        });
        if (!product) return res.status(404).json({ error: 'Product not found.' });
        res.json(fmtProduct(product));
    } catch (err) {
        res.status(500).json({ error: 'Failed to load product inventory.' });
    }
});

// ── PATCH /api/inventory/:productId/:size ─────────────────────
const PatchSchema = z.union([
    z.object({ stock: z.number().int().min(0) }),
    z.object({ delta: z.number().int() }),
]);

router.patch('/:productId/:size', ...protect, async (req, res) => {
    const productId = parseInt(req.params.productId, 10);
    const { size } = req.params;
    if (isNaN(productId)) return res.status(400).json({ error: 'Invalid productId.' });

    const parsed = PatchSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'Provide either { stock: N } or { delta: N }.' });

    try {
        const existing = await prisma.productSize.findUnique({
            where: { productId_size: { productId, size } },
        });
        if (!existing) return res.status(404).json({ error: 'Size not found for this product.' });

        const newStock = 'stock' in parsed.data
            ? parsed.data.stock
            : Math.max(0, existing.stock + parsed.data.delta);

        const updated = await prisma.productSize.update({
            where: { productId_size: { productId, size } },
            data: { stock: newStock },
        });

        res.json(fmtSize(updated));
    } catch (err) {
        console.error('[PATCH /inventory]', err.message);
        res.status(500).json({ error: 'Failed to update stock.' });
    }
});

// ── Formatters ────────────────────────────────────────────────
function fmtSize(s) {
    return {
        size: s.size,
        stock: s.stock,
        available: s.stock > 0,
        lowStock: s.stock > 0 && s.stock <= s.lowStockThreshold,
        soldOut: s.stock === 0,
        threshold: s.lowStockThreshold,
    };
}

function fmtProduct(p) {
    const sizeMap = {};
    for (const s of p.sizes) sizeMap[s.size] = fmtSize(s);

    const totalStock = p.sizes.reduce((sum, s) => sum + s.stock, 0);
    const availSizes = p.sizes.filter(s => s.stock > 0).map(s => s.size);
    const lowStockSizes = p.sizes.filter(s => s.stock > 0 && s.stock <= s.lowStockThreshold).map(s => s.size);

    return {
        id: p.id,
        name: p.name,
        brand: p.brand,
        price: p.price / 100,
        tag: p.tag,
        category: p.category,
        description: p.description,
        isActive: p.isActive,
        totalStock,
        soldOut: totalStock === 0,
        lowStock: totalStock > 0 && totalStock <= 5,
        availableSizes: availSizes,
        lowStockSizes,
        sizes: sizeMap,
    };
}

export default router;