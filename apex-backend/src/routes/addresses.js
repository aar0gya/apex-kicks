// apex-backend/src/routes/addresses.js
import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import prisma from '../lib/prisma.js';
import { z } from 'zod';

const router = Router();

const AddressSchema = z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    line1: z.string().min(1),
    line2: z.string().optional(),
    city: z.string().min(1),
    state: z.string().min(1),
    zip: z.string().min(1),
    country: z.string().default('US'),
    isDefault: z.boolean().optional(),
});

// ── GET /api/addresses ────────────────────────────────────────
router.get('/', ...protect, async (req, res) => {
    const addresses = await prisma.address.findMany({
        where: { userId: req.userId },
        orderBy: [{ isDefault: 'desc' }, { id: 'desc' }],
    });
    res.json(addresses);
});

// ── POST /api/addresses ───────────────────────────────────────
router.post('/', ...protect, async (req, res) => {
    const parsed = AddressSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

    const { isDefault, ...data } = parsed.data;

    // If this is marked default, clear all others first
    if (isDefault) {
        await prisma.address.updateMany({
            where: { userId: req.userId },
            data: { isDefault: false },
        });
    }

    const address = await prisma.address.create({
        data: { ...data, userId: req.userId, isDefault: isDefault ?? false },
    });
    res.status(201).json(address);
});

// ── PATCH /api/addresses/:id ──────────────────────────────────
router.patch('/:id', ...protect, async (req, res) => {
    const parsed = AddressSchema.partial().safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

    const existing = await prisma.address.findFirst({
        where: { id: req.params.id, userId: req.userId },
    });
    if (!existing) return res.status(404).json({ error: 'Address not found.' });

    if (parsed.data.isDefault) {
        await prisma.address.updateMany({
            where: { userId: req.userId },
            data: { isDefault: false },
        });
    }

    const address = await prisma.address.update({
        where: { id: req.params.id },
        data: parsed.data,
    });
    res.json(address);
});

// ── DELETE /api/addresses/:id ─────────────────────────────────
router.delete('/:id', ...protect, async (req, res) => {
    const existing = await prisma.address.findFirst({
        where: { id: req.params.id, userId: req.userId },
    });
    if (!existing) return res.status(404).json({ error: 'Address not found.' });
    await prisma.address.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
});

export default router;