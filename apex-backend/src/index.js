// apex-backend/src/index.js
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import usersRouter from './routes/users.js';
import productsRouter from './routes/products.js';
import ordersRouter from './routes/orders.js';
import wishlistRouter from './routes/wishlist.js';
import addressesRouter from './routes/addresses.js';
import inventoryRouter from './routes/inventory.js';
import adminRouter from './routes/admin.js';
import newsletterRouter from './routes/newsletter.js';

const app = express();
const PORT = process.env.PORT || 4000;

// ── CORS ───────────────────────────────────────────────────────────────────
// Accepts localhost in dev + any production URLs set in CLIENT_URL
// CLIENT_URL can be a single URL or comma-separated list:
//   e.g. "https://apex-kicks.vercel.app,https://apex-kicks-git-main.vercel.app"
const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
    ...(process.env.CLIENT_URL
        ? process.env.CLIENT_URL.split(',').map(u => u.trim())
        : []),
];

app.use(helmet());
app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (curl, Postman, server-to-server)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) return callback(null, true);
        callback(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true,
}));

app.use('/api', rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    message: { error: 'Too many requests — please try again later.' },
}));

// IMPORTANT: Stripe webhook needs raw body — must be before express.json()
app.use('/api/orders/webhook', express.raw({ type: 'application/json' }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'production') app.use(morgan('dev'));

app.get('/health', (_req, res) => res.json({ ok: true, env: process.env.NODE_ENV }));

app.use('/api/users', usersRouter);
app.use('/api/products', productsRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/wishlist', wishlistRouter);
app.use('/api/addresses', addressesRouter);
app.use('/api/inventory', inventoryRouter);
app.use('/api/admin', adminRouter);
app.use('/api/newsletter', newsletterRouter);

app.use((_req, res) => res.status(404).json({ error: 'Route not found.' }));
app.use((err, _req, res, _next) => {
    console.error('[Unhandled error]', err);
    res.status(500).json({ error: 'Internal server error.' });
});

app.listen(PORT, () => {
    const e = process.env;
    console.log(`\n🚀  APEX KICKS API  →  http://localhost:${PORT}`);
    console.log(`   Allowed origins: ${allowedOrigins.join(', ')}`);
    console.log(`   Database  : ${e.DATABASE_URL ? '✓' : '✗ missing'}`);
    console.log(`   Clerk     : ${e.CLERK_SECRET_KEY ? '✓' : '✗ missing'}`);
    console.log(`   Stripe    : ${e.STRIPE_SECRET_KEY ? '✓' : '✗ missing'}`);
    console.log(`   Webhook   : ${e.STRIPE_WEBHOOK_SECRET ? '✓' : '✗ missing'}\n`);
});