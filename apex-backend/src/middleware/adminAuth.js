// apex-backend/src/middleware/adminAuth.js
// Extends the normal protect middleware with an admin check.
// Usage: import { adminProtect } from './adminAuth.js';
//        router.get('/secret', ...adminProtect, handler);

import { requireAuth, loadUser } from './auth.js';
import prisma from '../lib/prisma.js';

// ── Step 3: verify isAdmin flag ───────────────────────────────
async function requireAdmin(req, res, next) {
    try {
        const user = await prisma.user.findUnique({ where: { id: req.userId } });
        if (!user?.isAdmin) {
            return res.status(403).json({ error: 'Admin access required.' });
        }
        next();
    } catch (err) {
        console.error('[requireAdmin]', err.message);
        res.status(500).json({ error: 'Admin check failed.' });
    }
}

// Full chain: verify JWT → load user → check admin
export const adminProtect = [requireAuth, loadUser, requireAdmin];