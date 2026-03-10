// apex-backend/src/routes/users.js
import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import prisma from '../lib/prisma.js';
import { z } from 'zod';
import { sendWelcomeEmail } from '../lib/emails.js';

const router = Router();

// ── GET /api/users/me ─────────────────────────────────────────
router.get('/me', ...protect, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.userId },
            include: { _count: { select: { orders: true, wishlist: true } } },
        });
        if (!user) return res.status(404).json({ error: 'User not found.' });
        res.json({
            id: user.id,
            email: user.email,
            name: user.name,
            avatar: user.avatar,
            isAdmin: user.isAdmin,
            orderCount: user._count.orders,
            wishlistCount: user._count.wishlist,
            createdAt: user.createdAt,
        });
    } catch (err) {
        console.error('[GET /users/me]', err);
        res.status(500).json({ error: 'Failed to load profile.' });
    }
});

// ── POST /api/users/sync ──────────────────────────────────────
// Called right after sign-in. Creates or updates the User row.
// avatar is optional — Clerk can return various URL formats.
const SyncSchema = z.object({
    email: z.string().email(),
    name: z.string().optional().nullable(),
    avatar: z.string().optional().nullable(),   // allow any string — Clerk URLs vary
});

router.post('/sync', ...protect, async (req, res) => {
    try {
        const parsed = SyncSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ error: parsed.error.flatten() });
        }

        const { email, name, avatar } = parsed.data;

        // Check if this user exists already before upserting
        const existing = await prisma.user.findUnique({ where: { id: req.userId } });
        const isNewUser = !existing;

        const user = await prisma.user.upsert({
            where: { id: req.userId },
            update: {
                email,
                name: name ?? undefined,
                avatar: avatar ?? undefined,
            },
            create: {
                id: req.userId,
                email,
                name: name ?? null,
                avatar: avatar ?? null,
            },
        });

        res.json({ ok: true, user: { id: user.id, email: user.email, name: user.name, avatar: user.avatar, isAdmin: user.isAdmin } });

        // Fire welcome email only for brand-new accounts
        if (isNewUser) {
            sendWelcomeEmail({ email: user.email, name: user.name }).catch(console.error);
        }
    } catch (err) {
        console.error('[POST /users/sync]', err.message);
        res.status(500).json({ error: 'Sync failed: ' + err.message });
    }
});

// ── PATCH /api/users/me ───────────────────────────────────────
router.patch('/me', ...protect, async (req, res) => {
    try {
        const { name } = req.body;
        if (!name || typeof name !== 'string') {
            return res.status(400).json({ error: 'Name is required.' });
        }
        const user = await prisma.user.update({
            where: { id: req.userId },
            data: { name: name.trim() },
        });
        res.json({ ok: true, name: user.name });
    } catch (err) {
        res.status(500).json({ error: 'Update failed.' });
    }
});

export default router;