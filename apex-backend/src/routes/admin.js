// apex-backend/src/routes/admin.js
// Phase 5 — Admin Dashboard API
// All routes require isAdmin = true on the requesting user.
//
// GET  /api/admin/stats              — revenue, order counts, top products, daily chart
// GET  /api/admin/orders             — paginated order list with filters
// GET  /api/admin/orders/:id         — single order full detail
// PATCH /api/admin/orders/:id/status — update status + tracking
// GET  /api/admin/customers          — paginated customer list
// GET  /api/admin/customers/:id      — single customer with order history
// GET  /api/admin/inventory          — stock levels across all products

import { Router } from 'express';
import { z } from 'zod';
import { adminProtect } from '../middleware/adminAuth.js';
import prisma from '../lib/prisma.js';
import { sendStatusUpdateEmail } from '../lib/emails.js';

const router = Router();

// ── GET /api/admin/stats ──────────────────────────────────────
router.get('/stats', ...adminProtect, async (req, res) => {
    try {
        const now = new Date();
        const day30 = new Date(now - 30 * 24 * 60 * 60 * 1000);
        const day7 = new Date(now - 7 * 24 * 60 * 60 * 1000);

        // Total revenue (completed orders only)
        const revenueAll = await prisma.order.aggregate({
            where: { status: { in: ['PROCESSING', 'SHIPPED', 'DELIVERED'] } },
            _sum: { total: true },
            _count: { id: true },
        });

        // Revenue last 30 days
        const revenue30 = await prisma.order.aggregate({
            where: { status: { in: ['PROCESSING', 'SHIPPED', 'DELIVERED'] }, createdAt: { gte: day30 } },
            _sum: { total: true },
            _count: { id: true },
        });

        // Revenue last 7 days
        const revenue7 = await prisma.order.aggregate({
            where: { status: { in: ['PROCESSING', 'SHIPPED', 'DELIVERED'] }, createdAt: { gte: day7 } },
            _sum: { total: true },
            _count: { id: true },
        });

        // All order counts by status
        const ordersByStatus = await prisma.order.groupBy({
            by: ['status'],
            _count: { id: true },
        });

        // Total customers
        const customerCount = await prisma.user.count();
        const newCustomers30 = await prisma.user.count({ where: { createdAt: { gte: day30 } } });

        // Top products by revenue
        const topItems = await prisma.orderItem.groupBy({
            by: ['productId', 'name'],
            _sum: { price: true, qty: true },
            _count: { id: true },
            orderBy: { _sum: { price: 'desc' } },
            take: 6,
        });

        // Daily revenue for the last 30 days (chart data)
        const dailyOrders = await prisma.order.findMany({
            where: { status: { in: ['PROCESSING', 'SHIPPED', 'DELIVERED'] }, createdAt: { gte: day30 } },
            select: { total: true, createdAt: true },
            orderBy: { createdAt: 'asc' },
        });

        // Bucket by day
        const dailyMap = {};
        for (let i = 29; i >= 0; i--) {
            const d = new Date(now - i * 24 * 60 * 60 * 1000);
            const key = d.toISOString().slice(0, 10);
            dailyMap[key] = 0;
        }
        dailyOrders.forEach(o => {
            const key = o.createdAt.toISOString().slice(0, 10);
            if (dailyMap[key] !== undefined) dailyMap[key] += o.total / 100;
        });

        const dailyChart = Object.entries(dailyMap).map(([date, revenue]) => ({ date, revenue }));

        // Pending orders needing attention
        const pendingCount = await prisma.order.count({ where: { status: 'PENDING' } });
        const processingCount = await prisma.order.count({ where: { status: 'PROCESSING' } });

        res.json({
            revenue: {
                allTime: (revenueAll._sum.total ?? 0) / 100,
                last30: (revenue30._sum.total ?? 0) / 100,
                last7: (revenue7._sum.total ?? 0) / 100,
            },
            orders: {
                total: revenueAll._count.id,
                last30: revenue30._count.id,
                byStatus: Object.fromEntries(ordersByStatus.map(r => [r.status, r._count.id])),
                pending: pendingCount,
                processing: processingCount,
            },
            customers: {
                total: customerCount,
                new30: newCustomers30,
            },
            topProducts: topItems.map(item => ({
                productId: item.productId,
                name: item.name || `Product #${item.productId}`,
                revenue: (item._sum.price ?? 0) / 100,
                unitsSold: item._sum.qty ?? 0,
                orders: item._count.id,
            })),
            dailyChart,
        });
    } catch (err) {
        console.error('[GET /admin/stats]', err.message);
        res.status(500).json({ error: 'Failed to load stats.' });
    }
});

// ── GET /api/admin/orders ─────────────────────────────────────
router.get('/orders', ...adminProtect, async (req, res) => {
    const page = Math.max(1, parseInt(req.query.page || '1'));
    const limit = Math.min(50, parseInt(req.query.limit || '20'));
    const status = req.query.status;
    const search = req.query.search?.trim();

    const where = {};
    if (status && status !== 'ALL') where.status = status;
    if (search) {
        where.OR = [
            { id: { contains: search, mode: 'insensitive' } },
            { user: { email: { contains: search, mode: 'insensitive' } } },
            { user: { name: { contains: search, mode: 'insensitive' } } },
            { stripePaymentId: { contains: search, mode: 'insensitive' } },
            { trackingNumber: { contains: search, mode: 'insensitive' } },
        ];
    }

    try {
        const [orders, total] = await Promise.all([
            prisma.order.findMany({
                where,
                include: {
                    user: { select: { id: true, email: true, name: true, avatar: true } },
                    items: true,
                    address: true,
                    events: { orderBy: { createdAt: 'desc' }, take: 1 },
                },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma.order.count({ where }),
        ]);

        res.json({
            orders: orders.map(fmtOrder),
            pagination: { page, limit, total, pages: Math.ceil(total / limit) },
        });
    } catch (err) {
        console.error('[GET /admin/orders]', err.message);
        res.status(500).json({ error: 'Failed to load orders.' });
    }
});

// ── GET /api/admin/orders/:id ─────────────────────────────────
router.get('/orders/:id', ...adminProtect, async (req, res) => {
    try {
        const order = await prisma.order.findUnique({
            where: { id: req.params.id },
            include: {
                user: { select: { id: true, email: true, name: true, avatar: true } },
                items: true,
                address: true,
                events: { orderBy: { createdAt: 'asc' } },
            },
        });
        if (!order) return res.status(404).json({ error: 'Order not found.' });
        res.json(fmtOrder(order));
    } catch (err) {
        res.status(500).json({ error: 'Failed to load order.' });
    }
});

// ── PATCH /api/admin/orders/:id/status ───────────────────────
const UpdateSchema = z.object({
    status: z.enum(['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']),
    note: z.string().optional(),
    trackingNumber: z.string().optional(),
    trackingCarrier: z.string().optional(),
    trackingUrl: z.string().optional(),
});

router.patch('/orders/:id/status', ...adminProtect, async (req, res) => {
    const parsed = UpdateSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'Invalid fields.' });

    const { status, note, trackingNumber, trackingCarrier, trackingUrl } = parsed.data;

    try {
        const existing = await prisma.order.findUnique({ where: { id: req.params.id } });
        if (!existing) return res.status(404).json({ error: 'Order not found.' });

        const autoNote = {
            PENDING: 'Order placed.',
            PROCESSING: 'Payment confirmed — order is being prepared.',
            SHIPPED: trackingNumber ? `Shipped via ${trackingCarrier || 'carrier'} — tracking: ${trackingNumber}` : 'Order has been shipped.',
            DELIVERED: 'Order delivered. Enjoy your kicks! 🔥',
            CANCELLED: 'Order cancelled by admin.',
        }[status] ?? status;

        // Restore stock if cancelling a non-cancelled order
        const restores = [];
        if (status === 'CANCELLED' && existing.status !== 'CANCELLED') {
            const items = await prisma.orderItem.findMany({ where: { orderId: req.params.id } });
            items.forEach(item => restores.push(
                prisma.productSize.updateMany({
                    where: { productId: item.productId, size: item.size },
                    data: { stock: { increment: item.qty } },
                })
            ));
        }

        const [order] = await prisma.$transaction([
            prisma.order.update({
                where: { id: req.params.id },
                data: {
                    status,
                    ...(trackingNumber ? { trackingNumber } : {}),
                    ...(trackingCarrier ? { trackingCarrier } : {}),
                    ...(trackingUrl ? { trackingUrl } : {}),
                },
                include: {
                    user: { select: { id: true, email: true, name: true, avatar: true } },
                    items: true,
                    address: true,
                    events: { orderBy: { createdAt: 'asc' } },
                },
            }),
            prisma.orderEvent.create({
                data: { orderId: req.params.id, status, note: note || autoNote },
            }),
            ...restores,
        ]);

        console.log(`[ADMIN] Order ${req.params.id} → ${status} by ${req.userId}`);
        res.json(fmtOrder(order));

        // Email customer about their order status change
        if (order.user?.email) {
            sendStatusUpdateEmail(fmtOrder(order), order.user).catch(console.error);
        }
    } catch (err) {
        console.error('[PATCH /admin/orders/:id/status]', err.message);
        res.status(500).json({ error: 'Failed to update order.' });
    }
});

// ── GET /api/admin/customers ──────────────────────────────────
router.get('/customers', ...adminProtect, async (req, res) => {
    const page = Math.max(1, parseInt(req.query.page || '1'));
    const limit = Math.min(50, parseInt(req.query.limit || '20'));
    const search = req.query.search?.trim();

    const where = {};
    if (search) {
        where.OR = [
            { email: { contains: search, mode: 'insensitive' } },
            { name: { contains: search, mode: 'insensitive' } },
        ];
    }

    try {
        const [customers, total] = await Promise.all([
            prisma.user.findMany({
                where,
                include: {
                    _count: { select: { orders: true, wishlist: true } },
                    orders: {
                        where: { status: { in: ['PROCESSING', 'SHIPPED', 'DELIVERED'] } },
                        select: { total: true, createdAt: true },
                        orderBy: { createdAt: 'desc' },
                        take: 1,
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma.user.count({ where }),
        ]);

        // Get total spend per customer
        const spendMap = await prisma.order.groupBy({
            by: ['userId'],
            where: { status: { in: ['PROCESSING', 'SHIPPED', 'DELIVERED'] } },
            _sum: { total: true },
        });
        const spend = Object.fromEntries(spendMap.map(r => [r.userId, (r._sum.total ?? 0) / 100]));

        res.json({
            customers: customers.map(c => ({
                id: c.id,
                email: c.email,
                name: c.name,
                avatar: c.avatar,
                isAdmin: c.isAdmin,
                orderCount: c._count.orders,
                totalSpend: spend[c.id] ?? 0,
                lastOrderAt: c.orders[0]?.createdAt ?? null,
                joinedAt: c.createdAt,
            })),
            pagination: { page, limit, total, pages: Math.ceil(total / limit) },
        });
    } catch (err) {
        console.error('[GET /admin/customers]', err.message);
        res.status(500).json({ error: 'Failed to load customers.' });
    }
});

// ── GET /api/admin/customers/:id ─────────────────────────────
router.get('/customers/:id', ...adminProtect, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.params.id },
            include: {
                orders: {
                    include: { items: true },
                    orderBy: { createdAt: 'desc' },
                },
                _count: { select: { orders: true, wishlist: true } },
            },
        });
        if (!user) return res.status(404).json({ error: 'Customer not found.' });

        const totalSpend = user.orders
            .filter(o => ['PROCESSING', 'SHIPPED', 'DELIVERED'].includes(o.status))
            .reduce((sum, o) => sum + o.total, 0) / 100;

        res.json({
            id: user.id,
            email: user.email,
            name: user.name,
            avatar: user.avatar,
            isAdmin: user.isAdmin,
            totalSpend,
            orderCount: user._count.orders,
            joinedAt: user.createdAt,
            orders: user.orders.map(fmtOrder),
        });
    } catch (err) {
        res.status(500).json({ error: 'Failed to load customer.' });
    }
});

// ── GET /api/admin/inventory ──────────────────────────────────
router.get('/inventory', ...adminProtect, async (req, res) => {
    try {
        const products = await prisma.product.findMany({
            include: { sizes: { orderBy: { size: 'asc' } } },
            orderBy: { id: 'asc' },
        });

        res.json(products.map(p => {
            const total = p.sizes.reduce((s, sz) => s + sz.stock, 0);
            const soldOut = p.sizes.filter(sz => sz.stock === 0).length;
            const lowStock = p.sizes.filter(sz => sz.stock > 0 && sz.stock <= sz.lowStockThreshold).length;
            return {
                id: p.id,
                name: p.name,
                category: p.category,
                price: p.price / 100,
                totalStock: total,
                soldOutSizes: soldOut,
                lowStockSizes: lowStock,
                sizes: p.sizes.map(sz => ({
                    size: sz.size,
                    stock: sz.stock,
                    lowStock: sz.stock > 0 && sz.stock <= sz.lowStockThreshold,
                    soldOut: sz.stock === 0,
                })),
            };
        }));
    } catch (err) {
        res.status(500).json({ error: 'Failed to load inventory.' });
    }
});

// ── Format helper ─────────────────────────────────────────────
function fmtOrder(o) {
    return {
        ...o,
        subtotal: o.subtotal / 100,
        shipping: o.shipping / 100,
        total: o.total / 100,
        items: o.items?.map(i => ({ ...i, price: i.price / 100 })),
    };
}

export default router;