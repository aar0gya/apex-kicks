// apex-backend/src/routes/newsletter.js
// Handles email subscriptions (newsletter) and collab applications.
// Both are rate-limited and send confirmation emails via Resend.

import { Router } from 'express';
import { z } from 'zod';
import {
    sendNewsletterWelcome,
    sendCollabApplicationEmail,
    notifyTeamNewCollab,
} from '../lib/emails.js';

const router = Router();

// ── In-memory dedup (replace with Redis/DB in production) ────────────────
const newsletterSubscribed = new Set();
const collabApplied = new Set();

// ── Validation ────────────────────────────────────────────────────────────
const NewsletterSchema = z.object({
    email: z.string().email('Please enter a valid email address.'),
    name: z.string().max(80).optional(),
    source: z.string().max(40).optional().default('website'),
});

const CollabSchema = z.object({
    email: z.string().email('Please enter a valid email address.'),
    name: z.string().min(2, 'Name must be at least 2 characters.').max(80),
    instagram: z.string().max(50).optional(),
    message: z.string().max(1000).optional(),
});

// ── POST /api/newsletter ──────────────────────────────────────────────────
router.post('/', async (req, res) => {
    const parsed = NewsletterSchema.safeParse(req.body);
    if (!parsed.success) {
        const msg = parsed.error.errors.map(e => e.message).join(' · ');
        return res.status(400).json({ error: msg });
    }

    const { email, name, source } = parsed.data;

    // Gentle dedup — in production you'd check a DB/Resend audience
    if (newsletterSubscribed.has(email.toLowerCase())) {
        return res.json({ success: true, already: true, message: "You're already on the list!" });
    }
    newsletterSubscribed.add(email.toLowerCase());

    try {
        await sendNewsletterWelcome({ email, name, source });
        console.log(`[newsletter] subscribed: ${email} (source: ${source})`);
        res.json({ success: true, message: 'Welcome to APEX ELITE! Check your inbox.' });
    } catch (err) {
        console.error('[newsletter] email error:', err.message);
        // Still return success — we don't want to block the UX over email failures
        res.json({ success: true, message: 'Welcome to APEX ELITE!' });
    }
});

// ── POST /api/newsletter/collab ───────────────────────────────────────────
router.post('/collab', async (req, res) => {
    const parsed = CollabSchema.safeParse(req.body);
    if (!parsed.success) {
        const msg = parsed.error.errors.map(e => e.message).join(' · ');
        return res.status(400).json({ error: msg });
    }

    const { email, name, instagram, message } = parsed.data;

    if (collabApplied.has(email.toLowerCase())) {
        return res.json({
            success: true,
            already: true,
            message: "We've already received your application. Our team will be in touch soon!",
        });
    }
    collabApplied.add(email.toLowerCase());

    try {
        await Promise.allSettled([
            sendCollabApplicationEmail({ email, name, instagram, message }),
            notifyTeamNewCollab({ email, name, instagram, message }),
        ]);
        console.log(`[collab] application from: ${email} (${name})`);
        res.json({
            success: true,
            message: "Application received! We'll be in touch within 72 hours.",
        });
    } catch (err) {
        console.error('[collab] email error:', err.message);
        res.json({
            success: true,
            message: "Application received! We'll be in touch soon.",
        });
    }
});

export default router;