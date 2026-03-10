import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import prisma from '../lib/prisma.js';

const router = Router();

// ── GET /api/wishlist ─────────────────────────────────────────
// Returns [{ id, productId, addedAt }] for the signed-in user.
router.get('/', ...protect, async (req, res) => {
    try {
        const items = await prisma.wishlistItem.findMany({
            where: { userId: req.userId },
            orderBy: { addedAt: 'desc' },
            select: { id: true, productId: true, addedAt: true },
        });
        res.json(items);
    } catch (err) {
        console.error('[GET /wishlist]', err.message);
        res.status(500).json({ error: 'Failed to load wishlist.' });
    }
});

// ── POST /api/wishlist/:productId ─────────────────────────────
// Toggle: adds if absent, removes if present.
router.post('/:productId', ...protect, async (req, res) => {
    try {
        const productId = Number(req.params.productId);
        if (isNaN(productId) || productId < 1) {
            return res.status(400).json({ error: 'Invalid product id.' });
        }

        const existing = await prisma.wishlistItem.findUnique({
            where: { userId_productId: { userId: req.userId, productId } },
        });

        if (existing) {
            await prisma.wishlistItem.delete({ where: { id: existing.id } });
            return res.json({ action: 'removed', productId });
        }

        const item = await prisma.wishlistItem.create({
            data: { userId: req.userId, productId },
            select: { id: true, productId: true, addedAt: true },
        });
        res.status(201).json({ action: 'added', ...item });
    } catch (err) {
        console.error('[POST /wishlist/:productId]', err.message);
        res.status(500).json({ error: 'Failed to update wishlist.' });
    }
});

// ── DELETE /api/wishlist ──────────────────────────────────────
router.delete('/', ...protect, async (req, res) => {
    try {
        const { count } = await prisma.wishlistItem.deleteMany({
            where: { userId: req.userId },
        });
        res.json({ ok: true, removed: count });
    } catch (err) {
        console.error('[DELETE /wishlist]', err.message);
        res.status(500).json({ error: 'Failed to clear wishlist.' });
    }
});

export default router;