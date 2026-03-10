// apex-backend/src/routes/orders.js
// Phase 6 addition: email notifications via Resend.
// Phase 6b addition: POST /api/orders/:id/cancel — user self-cancellation (PENDING only)

import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import prisma from '../lib/prisma.js';
import { z } from 'zod';
import { sendOrderConfirmation, sendProcessingEmail, sendStatusUpdateEmail, notifyTeamOrderDeleted } from '../lib/emails.js';

const router = Router();

// Stripe is optional — only initialised when the key is present
let stripe = null;
if (process.env.STRIPE_SECRET_KEY) {
    const Stripe = (await import('stripe')).default;
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
}

// ── Validation ────────────────────────────────────────────────
const ItemSchema = z.object({
    productId: z.number().int().positive(),
    name: z.string().optional(),
    size: z.coerce.string().min(1),
    qty: z.number().int().positive(),
    price: z.number().positive(),
});

const CreateOrderSchema = z.object({
    items: z.array(ItemSchema).min(1),
    shipping: z.object({
        method: z.enum(['standard', 'express', 'overnight']),
    }).optional().default({ method: 'standard' }),
    shippingAddress: z.object({
        firstName: z.string().optional().default(''),
        lastName: z.string().optional().default(''),
        line1: z.string().optional().default(''),
        line2: z.string().optional().default(''),
        city: z.string().optional().default(''),
        state: z.string().optional().default(''),
        zip: z.string().optional().default(''),
        country: z.string().optional().default('US'),
    }).optional(),
});

const UpdateStatusSchema = z.object({
    status: z.enum(['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']),
    note: z.string().optional(),
    trackingNumber: z.string().optional(),
    trackingCarrier: z.string().optional(),
    trackingUrl: z.string().url().optional().or(z.literal('')),
});

// ── Helpers ───────────────────────────────────────────────────
const SHIPPING_RATES = { standard: 0, express: 1200, overnight: 2800 };

function calcShippingCents(subtotalCents, method) {
    if (subtotalCents >= 15000) return 0;
    return SHIPPING_RATES[method] ?? 0;
}

function fmt(order) {
    return {
        ...order,
        subtotal: order.subtotal / 100,
        shipping: order.shipping / 100,
        total: order.total / 100,
        items: order.items?.map(item => ({ ...item, price: item.price / 100 })),
    };
}

// ── GET /api/orders ───────────────────────────────────────────
router.get('/', ...protect, async (req, res) => {
    try {
        const orders = await prisma.order.findMany({
            where: { userId: req.userId },
            include: { items: true, address: true, events: { orderBy: { createdAt: 'asc' } } },
            orderBy: { createdAt: 'desc' },
        });
        res.json(orders.map(fmt));
    } catch (err) {
        console.error('[GET /orders]', err.message);
        res.status(500).json({ error: 'Failed to load orders.' });
    }
});

// ── GET /api/orders/:id ───────────────────────────────────────
router.get('/:id', ...protect, async (req, res) => {
    try {
        const order = await prisma.order.findFirst({
            where: { id: req.params.id, userId: req.userId },
            include: { items: true, address: true, events: { orderBy: { createdAt: 'asc' } } },
        });
        if (!order) return res.status(404).json({ error: 'Order not found.' });
        res.json(fmt(order));
    } catch (err) {
        res.status(500).json({ error: 'Failed to load order.' });
    }
});

// ── POST /api/orders ──────────────────────────────────────────
router.post('/', ...protect, async (req, res) => {
    const parsed = CreateOrderSchema.safeParse(req.body);
    if (!parsed.success) {
        const { fieldErrors, formErrors } = parsed.error.flatten();
        const parts = [
            ...formErrors,
            ...Object.entries(fieldErrors).map(([k, v]) => `${k}: ${v.join(', ')}`),
        ];
        return res.status(400).json({ error: parts.join(' · ') || 'Invalid request body.' });
    }

    const { items, shipping, shippingAddress } = parsed.data;

    // Stock check
    const stockIssues = [];
    for (const item of items) {
        const row = await prisma.productSize.findUnique({
            where: { productId_size: { productId: item.productId, size: item.size } },
        }).catch(() => null);
        if (row && row.stock < item.qty) {
            stockIssues.push(
                `${item.name} (US ${item.size}): ${row.stock === 0 ? 'sold out' : `only ${row.stock} left`}`
            );
        }
    }
    if (stockIssues.length > 0) {
        return res.status(409).json({ error: 'Some items are out of stock: ' + stockIssues.join('; '), details: stockIssues });
    }

    const subtotal = Math.round(items.reduce((s, i) => s + i.price * i.qty, 0) * 100);
    const shippingCost = calcShippingCents(subtotal, shipping.method);
    const total = subtotal + shippingCost;

    try {
        let clientSecret = null;
        let stripePaymentId = null;
        if (stripe) {
            const pi = await stripe.paymentIntents.create({
                amount: total,
                currency: 'usd',
                automatic_payment_methods: { enabled: true },
                metadata: { userId: req.userId },
            });
            clientSecret = pi.client_secret;
            stripePaymentId = pi.id;
        }

        let addressId = null;
        if (shippingAddress?.line1) {
            const addr = await prisma.address.create({
                data: {
                    userId: req.userId,
                    firstName: shippingAddress.firstName,
                    lastName: shippingAddress.lastName,
                    line1: shippingAddress.line1,
                    line2: shippingAddress.line2 || null,
                    city: shippingAddress.city,
                    state: shippingAddress.state,
                    zip: shippingAddress.zip,
                    country: shippingAddress.country,
                    isDefault: false,
                },
            });
            addressId = addr.id;
        }

        const stockDecrements = items.map(item =>
            prisma.productSize.updateMany({
                where: { productId: item.productId, size: item.size, stock: { gte: item.qty } },
                data: { stock: { decrement: item.qty } },
            })
        );

        const [order] = await prisma.$transaction([
            prisma.order.create({
                data: {
                    userId: req.userId,
                    status: 'PENDING',
                    subtotal,
                    shipping: shippingCost,
                    total,
                    stripePaymentId,
                    addressId,
                    items: {
                        create: items.map(item => ({
                            productId: item.productId,
                            name: item.name,
                            size: item.size,
                            qty: item.qty,
                            price: Math.round(item.price * 100),
                        })),
                    },
                    events: {
                        create: [{ status: 'PENDING', note: 'Order placed — awaiting payment confirmation.' }],
                    },
                },
                include: { items: true, address: true, events: true },
            }),
            ...stockDecrements,
        ]);

        console.log(`[POST /orders] Created ${order.id} (PI: ${stripePaymentId ?? 'none'})`);
        res.status(201).json({ order: fmt(order), clientSecret });

        // Fire-and-forget confirmation email
        const user = await prisma.user.findUnique({ where: { id: req.userId } });
        sendOrderConfirmation(fmt({ ...order, address: order.address }), user).catch(console.error);

    } catch (err) {
        console.error('[POST /orders]', err.message);
        res.status(500).json({ error: 'Failed to create order: ' + err.message });
    }
});

// ── POST /api/orders/:id/cancel ───────────────────────────────
// User self-cancellation — only allowed while status is PENDING.
// Restores stock and creates a timeline event automatically.
router.post('/:id/cancel', ...protect, async (req, res) => {
    try {
        // 1. Load the order — must belong to the requesting user
        const order = await prisma.order.findFirst({
            where: { id: req.params.id, userId: req.userId },
            include: { items: true },
        });

        if (!order) {
            return res.status(404).json({ error: 'Order not found.' });
        }

        // 2. Only PENDING orders can be self-cancelled
        if (order.status !== 'PENDING') {
            const friendly = {
                PROCESSING: 'Your order is already being prepared and can no longer be cancelled. Please contact support.',
                SHIPPED: 'Your order has already shipped and cannot be cancelled.',
                DELIVERED: 'Your order has already been delivered.',
                CANCELLED: 'This order has already been cancelled.',
            }[order.status] ?? 'This order cannot be cancelled at this stage.';
            return res.status(409).json({ error: friendly });
        }

        // 3. Restore stock for every item in the order
        const stockRestores = order.items.map(item =>
            prisma.productSize.updateMany({
                where: { productId: item.productId, size: item.size },
                data: { stock: { increment: item.qty } },
            })
        );

        // 4. Cancel order + create timeline event in one transaction
        const [updated] = await prisma.$transaction([
            prisma.order.update({
                where: { id: order.id },
                data: { status: 'CANCELLED' },
                include: { items: true, address: true, events: { orderBy: { createdAt: 'asc' } } },
            }),
            prisma.orderEvent.create({
                data: {
                    orderId: order.id,
                    status: 'CANCELLED',
                    note: 'Order cancelled by customer.',
                },
            }),
            ...stockRestores,
        ]);

        console.log(`[POST /orders/:id/cancel] ${order.id} cancelled by user ${req.userId}`);
        res.json(fmt(updated));

    } catch (err) {
        console.error('[POST /orders/:id/cancel]', err.message);
        res.status(500).json({ error: 'Failed to cancel order.' });
    }
});

// ── PATCH /api/orders/:id/status ─────────────────────────────
router.patch('/:id/status', ...protect, async (req, res) => {
    const parsed = UpdateStatusSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'Invalid status update.' });

    const { status, note, trackingNumber, trackingCarrier, trackingUrl } = parsed.data;

    try {
        const existing = await prisma.order.findFirst({
            where: { id: req.params.id, userId: req.userId },
        });
        if (!existing) return res.status(404).json({ error: 'Order not found.' });

        const autoNotes = {
            PENDING: 'Order placed.',
            PROCESSING: 'Payment confirmed — order is being prepared.',
            SHIPPED: trackingNumber
                ? `Shipped via ${trackingCarrier || 'carrier'} — tracking: ${trackingNumber}`
                : 'Order has been shipped.',
            DELIVERED: 'Order delivered. Enjoy your kicks! 🔥',
            CANCELLED: 'Order cancelled.',
        };

        const stockRestores = [];
        if (status === 'CANCELLED' && existing.status !== 'CANCELLED') {
            const orderItems = await prisma.orderItem.findMany({ where: { orderId: req.params.id } });
            for (const item of orderItems) {
                stockRestores.push(
                    prisma.productSize.updateMany({
                        where: { productId: item.productId, size: item.size },
                        data: { stock: { increment: item.qty } },
                    })
                );
            }
        }

        const [order] = await prisma.$transaction([
            prisma.order.update({
                where: { id: req.params.id },
                data: {
                    status,
                    ...(trackingNumber && { trackingNumber }),
                    ...(trackingCarrier && { trackingCarrier }),
                    ...(trackingUrl && { trackingUrl }),
                },
                include: { items: true, address: true, events: { orderBy: { createdAt: 'asc' } } },
            }),
            prisma.orderEvent.create({
                data: { orderId: req.params.id, status, note: note || autoNotes[status] },
            }),
            ...stockRestores,
        ]);

        res.json(fmt(order));
    } catch (err) {
        console.error('[PATCH /orders/:id/status]', err.message);
        res.status(500).json({ error: 'Failed to update order.' });
    }
});


// ── DELETE /api/orders/:id ────────────────────────────────────
// User can delete CANCELLED or DELIVERED orders from their history.
router.delete('/:id', ...protect, async (req, res) => {
    try {
        const order = await prisma.order.findFirst({
            where: { id: req.params.id, userId: req.userId },
        });

        if (!order) {
            return res.status(404).json({ error: 'Order not found.' });
        }

        const deletable = ['CANCELLED', 'DELIVERED'];
        if (!deletable.includes(order.status)) {
            return res.status(409).json({
                error: 'Only cancelled or delivered orders can be deleted from your history.',
            });
        }

        // Cascade delete: events + items + order (in correct order)
        await prisma.$transaction([
            prisma.orderEvent.deleteMany({ where: { orderId: order.id } }),
            prisma.orderItem.deleteMany({ where: { orderId: order.id } }),
            prisma.order.delete({ where: { id: order.id } }),
        ]);

        console.log(`[DELETE /orders/:id] ${order.id} deleted by user ${req.userId}`);
        res.json({ success: true, deletedId: order.id });

        // Fire-and-forget: notify admin team about the deletion
        const user = await prisma.user.findUnique({ where: { id: req.userId } }).catch(() => null);
        notifyTeamOrderDeleted(order, user).catch(console.error);

    } catch (err) {
        console.error('[DELETE /orders/:id]', err.message);
        res.status(500).json({ error: 'Failed to delete order.' });
    }
});

// ── POST /api/orders/webhook ──────────────────────────────────
router.post('/webhook', async (req, res) => {
    if (!stripe) return res.json({ received: true });

    const sig = req.headers['stripe-signature'];
    const secret = process.env.STRIPE_WEBHOOK_SECRET;
    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, secret);
    } catch (err) {
        console.error('[webhook] Bad signature:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    console.log('[webhook]', event.type);

    try {
        if (event.type === 'payment_intent.succeeded') {
            const pi = event.data.object;
            const order = await prisma.order.findFirst({
                where: { stripePaymentId: pi.id },
                include: { items: true, address: true },
            });
            if (order && order.status !== 'PROCESSING') {
                await prisma.$transaction([
                    prisma.order.update({ where: { id: order.id }, data: { status: 'PROCESSING' } }),
                    prisma.orderEvent.create({
                        data: { orderId: order.id, status: 'PROCESSING', note: 'Payment confirmed — order is being prepared.' },
                    }),
                ]);
                console.log(`[webhook] ${pi.id} → PROCESSING`);
                const user = await prisma.user.findUnique({ where: { id: order.userId } });
                sendProcessingEmail(fmt({ ...order, status: 'PROCESSING' }), user).catch(console.error);
            }
        }

        if (event.type === 'payment_intent.payment_failed') {
            const pi = event.data.object;
            const order = await prisma.order.findFirst({ where: { stripePaymentId: pi.id } });
            if (order && order.status !== 'CANCELLED') {
                const orderItems = await prisma.orderItem.findMany({ where: { orderId: order.id } });
                await prisma.$transaction([
                    prisma.order.update({ where: { id: order.id }, data: { status: 'CANCELLED' } }),
                    prisma.orderEvent.create({
                        data: { orderId: order.id, status: 'CANCELLED', note: 'Payment failed — order cancelled.' },
                    }),
                    ...orderItems.map(item =>
                        prisma.productSize.updateMany({
                            where: { productId: item.productId, size: item.size },
                            data: { stock: { increment: item.qty } },
                        })
                    ),
                ]);
            }
        }
    } catch (err) {
        console.error('[webhook] DB error:', err.message);
    }

    res.json({ received: true });
});

export default router;