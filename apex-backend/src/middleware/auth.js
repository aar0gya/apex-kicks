// apex-backend/src/middleware/auth.js
// Verifies Clerk JWTs using jose + your Clerk JWKS endpoint.
// Requires: CLERK_JWKS_URL in .env

import { createRemoteJWKSet, jwtVerify } from 'jose';
import prisma from '../lib/prisma.js';

const JWKS_URL = process.env.CLERK_JWKS_URL;

if (!JWKS_URL) {
  console.error('❌  CLERK_JWKS_URL is missing from .env — auth will fail.');
} else {
  console.log('✅  Clerk JWKS URL:', JWKS_URL);
}

// jose fetches and caches the public keys automatically
const JWKS = JWKS_URL ? createRemoteJWKSet(new URL(JWKS_URL)) : null;

// ── Step 1: Verify the JWT ────────────────────────────────────
export async function requireAuth(req, res, next) {
  try {
    if (!JWKS) {
      return res.status(500).json({ error: 'Server auth not configured (missing CLERK_JWKS_URL).' });
    }

    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : null;

    if (!token) {
      return res.status(401).json({ error: 'No token provided.' });
    }

    const { payload } = await jwtVerify(token, JWKS, {
      clockTolerance: 60, // tolerate 60s clock skew
    });

    if (!payload?.sub) {
      return res.status(401).json({ error: 'Token missing user ID.' });
    }

    req.userId = payload.sub;
    next();
  } catch (err) {
    console.error('[requireAuth]', err.message);
    return res.status(401).json({ error: 'Unauthorized — ' + err.message });
  }
}

// ── Step 2: Load (or auto-create) the DB User ────────────────
export async function loadUser(req, res, next) {
  try {
    let user = await prisma.user.findUnique({ where: { id: req.userId } });

    if (!user) {
      user = await prisma.user.create({
        data: {
          id: req.userId,
          email: `${req.userId}@pending.clerk`,
          name: null,
        },
      });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error('[loadUser]', err.message);
    res.status(500).json({ error: 'Failed to load user.' });
  }
}

export const protect = [requireAuth, loadUser];