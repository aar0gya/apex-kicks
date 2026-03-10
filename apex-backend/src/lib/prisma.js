// apex-backend/src/lib/prisma.js
// Forces IPv4 DNS resolution — fixes Neon connection failures on
// Windows machines where IPv6 is attempted first and times out.
// Connection error 10054 (ECONNRESET from Neon/PgBouncer) is handled
// by Prisma automatically on the next query — no action needed.
import dns from 'dns';
import { PrismaClient } from '@prisma/client';

// Force Node.js to prefer IPv4 addresses when resolving hostnames.
dns.setDefaultResultOrder('ipv4first');

const prisma = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
    // Connection pool settings tuned for Neon serverless PostgreSQL.
    // connection_limit=5 avoids exhausting the free-tier pool.
    // connect_timeout=10 gives enough time for cold-start wake-up.
    datasources: {
        db: {
            url: process.env.DATABASE_URL +
                (process.env.DATABASE_URL?.includes('?')
                    ? '&connection_limit=5&connect_timeout=10'
                    : '?connection_limit=5&connect_timeout=10'),
        },
    },
});

prisma.$connect()
    .then(() => console.log('✅  Database connected'))
    .catch(err => console.error('⚠️  DB connect failed — will retry on first request:', err.message));

// ── Error 10054 / ECONNRESET note ─────────────────────────────────────────
// Neon serverless PostgreSQL closes idle connections after ~5 minutes.
// Prisma automatically reconnects on the next query, so the 10054 error
// in the log is benign — it does NOT cause failed requests.
// If you see it frequently, ensure DATABASE_URL contains:
//   ?sslmode=require&connection_limit=5&connect_timeout=10
// For NeonDB, use the pooled connection string (port 5432 with pooler).
// ─────────────────────────────────────────────────────────────────────────

export default prisma;