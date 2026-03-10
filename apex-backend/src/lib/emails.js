// apex-backend/src/lib/emails.js
// Comprehensive email system via Resend.
// Handles: order confirmation, status updates, newsletter welcome,
//          collab application confirmation + internal team notification.

import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const FROM = process.env.EMAIL_FROM || 'APEX KICKS <noreply@apexkicks.com>';
const REPLY_TO = process.env.EMAIL_REPLY_TO || 'support@apexkicks.com';

// ── Design tokens ─────────────────────────────────────────────────────────
const RED = '#FF2200';
const BG = '#0A0A0A';
const CARD_BG = '#141414';
const BORDER = '#222222';
const TEXT_MAIN = '#F5F3EE';
const TEXT_MUTED = '#888888';
const BEBAS = "'Bebas Neue', Arial Black, sans-serif";
const BARLOW = "'Barlow', Arial, sans-serif";

const STATUS_META = {
  PENDING: { label: 'ORDER RECEIVED', icon: '📦', color: '#FBBF24', desc: "We've received your order and are confirming payment." },
  PROCESSING: { label: 'IN PRODUCTION', icon: '⚙️', color: '#60A5FA', desc: 'Payment confirmed! Your order is being packed and prepared.' },
  SHIPPED: { label: 'ON THE WAY', icon: '🚀', color: '#34D399', desc: 'Your kicks have left our warehouse and are heading to you.' },
  DELIVERED: { label: 'DELIVERED', icon: '✅', color: '#22C55E', desc: 'Your order has been delivered. Enjoy your new kicks!' },
  CANCELLED: { label: 'ORDER CANCELLED', icon: '❌', color: '#EF4444', desc: 'Your order has been cancelled and any charges will be refunded.' },
};

// ── HTML helpers ──────────────────────────────────────────────────────────
function wrap(bodyHtml) {
  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>APEX KICKS</title></head>
<body style="margin:0;padding:0;background:${BG};font-family:${BARLOW};color:${TEXT_MAIN};-webkit-font-smoothing:antialiased;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:${BG};min-height:100vh;">
<tr><td align="center" style="padding:40px 16px 60px;">
<table width="100%" style="max-width:580px;" cellpadding="0" cellspacing="0">
<tr><td style="padding-bottom:32px;">
  <table width="100%" cellpadding="0" cellspacing="0"><tr>
    <td><table cellpadding="0" cellspacing="0"><tr>
      <td style="background:${RED};width:36px;height:36px;text-align:center;vertical-align:middle;">
        <span style="font-family:${BEBAS};font-size:20px;color:#fff;line-height:1;">A</span>
      </td>
      <td style="padding-left:10px;vertical-align:middle;">
        <span style="font-family:${BEBAS};font-size:22px;letter-spacing:0.14em;color:#fff;">APEX KICKS</span>
      </td>
    </tr></table></td>
    <td align="right" style="vertical-align:middle;">
      <span style="font-family:${BARLOW};font-size:11px;letter-spacing:0.1em;color:${TEXT_MUTED};">EST. 2024</span>
    </td>
  </tr></table>
</td></tr>
${bodyHtml}
<tr><td style="padding-top:40px;border-top:1px solid ${BORDER};">
  <p style="font-family:${BARLOW};font-size:11px;color:${TEXT_MUTED};margin:0 0 8px;">
    You received this email because you have an account or subscription with APEX KICKS.
  </p>
  <p style="font-family:${BARLOW};font-size:11px;color:${TEXT_MUTED};margin:0;">
    © 2025 APEX KICKS · <a href="https://apexkicks.com/privacy" style="color:${TEXT_MUTED};text-decoration:underline;">Privacy</a>
    · <a href="https://apexkicks.com/unsubscribe" style="color:${TEXT_MUTED};text-decoration:underline;">Unsubscribe</a>
  </p>
</td></tr>
</table></td></tr></table></body></html>`;
}

function card(html) {
  return `<tr><td style="background:${CARD_BG};border:1px solid ${BORDER};border-radius:8px;padding:28px 28px;margin-bottom:20px;">${html}</td></tr><tr><td style="height:16px;"></td></tr>`;
}

function itemsTable(items = []) {
  if (!items?.length) return '';
  return `<table width="100%" cellpadding="0" cellspacing="0" style="margin-top:20px;">
    ${items.map(item => `<tr>
      <td style="padding:10px 0;border-bottom:1px solid ${BORDER};">
        <strong style="font-family:${BARLOW};font-size:14px;color:${TEXT_MAIN};display:block;">${item.name || 'Sneaker'}</strong>
        <span style="font-family:${BARLOW};font-size:12px;color:${TEXT_MUTED};">Size: US ${item.size} · Qty: ${item.qty}</span>
      </td>
      <td style="padding:10px 0;border-bottom:1px solid ${BORDER};text-align:right;font-family:${BEBAS};font-size:18px;color:#fff;vertical-align:top;">
        $${Number(item.price || 0).toFixed(2)}
      </td>
    </tr>`).join('')}
  </table>`;
}

function totalsBlock(order) {
  const sub = Number(order.subtotal || 0).toFixed(2);
  const ship = Number(order.shipping || 0).toFixed(2);
  const tot = Number(order.total || 0).toFixed(2);
  return `<table width="100%" cellpadding="0" cellspacing="0" style="margin-top:14px;">
    <tr>
      <td style="font-family:${BARLOW};font-size:13px;color:${TEXT_MUTED};padding:4px 0;">Subtotal</td>
      <td align="right" style="font-family:${BARLOW};font-size:13px;color:${TEXT_MUTED};padding:4px 0;">$${sub}</td>
    </tr><tr>
      <td style="font-family:${BARLOW};font-size:13px;color:${TEXT_MUTED};padding:4px 0;">Shipping</td>
      <td align="right" style="font-family:${BARLOW};font-size:13px;color:${TEXT_MUTED};padding:4px 0;">${Number(ship) === 0 ? 'FREE' : '$' + ship}</td>
    </tr><tr>
      <td style="font-family:${BEBAS};font-size:18px;color:#fff;padding:12px 0 0;border-top:1px solid ${BORDER};">TOTAL</td>
      <td align="right" style="font-family:${BEBAS};font-size:24px;color:${RED};padding:12px 0 0;border-top:1px solid ${BORDER};">$${tot}</td>
    </tr>
  </table>`;
}

function ctaBtn(label, url) {
  return `<a href="${url}" style="display:inline-block;padding:13px 34px;background:${RED};color:#fff;font-family:${BEBAS};font-size:14px;letter-spacing:0.16em;text-decoration:none;border-radius:2px;margin-top:22px;">${label}</a>`;
}

// ════════════════════════════════════════════════════════════════════════════
// 0. ACCOUNT WELCOME  (fires once, on first sign-up)
// ════════════════════════════════════════════════════════════════════════════
export async function sendWelcomeEmail({ email, name }) {
  if (!resend || !email) return;
  const display = name ? name.split(' ')[0].toUpperCase() : 'SNEAKERHEAD';

  const html = wrap(`
    ${card(`
      <div style="text-align:center;padding:8px 0 22px;">
        <div style="font-size:48px;margin-bottom:16px;">👟</div>
        <p style="font-family:${BEBAS};font-size:12px;letter-spacing:0.3em;color:${RED};margin:0 0 10px;">ACCOUNT CREATED</p>
        <h1 style="font-family:${BEBAS};font-size:38px;color:#fff;margin:0 0 16px;letter-spacing:0.04em;line-height:1.05;">
          WELCOME TO<br/><span style="color:${RED};">APEX KICKS,</span><br/>${display}.
        </h1>
        <p style="font-family:${BARLOW};font-size:14px;color:${TEXT_MUTED};margin:0 auto 24px;line-height:1.8;max-width:400px;">
          Your account is ready. You now have access to exclusive drops, order tracking,
          a personal wishlist, and member-only releases.
        </p>
        ${ctaBtn('START SHOPPING →', 'https://apexkicks.com/collection')}
      </div>
    `)}
    ${card(`
      <p style="font-family:${BEBAS};font-size:12px;letter-spacing:0.22em;color:${TEXT_MUTED};margin:0 0 18px;">YOUR APEX ACCOUNT INCLUDES</p>
      <table width="100%" cellpadding="0" cellspacing="0">
        ${[
      ['📦', 'ORDER TRACKING', 'Follow every step of your order in real time.'],
      ['❤️', 'PERSONAL WISHLIST', 'Save drops and come back when you\'re ready.'],
      ['⚡', 'EARLY DROP ACCESS', 'Members get first access to limited releases.'],
      ['🎨', 'COLLAB PREVIEWS', 'Inside access to upcoming artist collaborations.'],
    ].map(([ico, title, desc]) => `
          <tr>
            <td style="width:34px;vertical-align:top;padding:9px 0;font-size:20px;">${ico}</td>
            <td style="padding:9px 0 9px 10px;border-bottom:1px solid ${BORDER};">
              <strong style="font-family:${BEBAS};font-size:15px;color:#fff;letter-spacing:0.06em;display:block;">${title}</strong>
              <span style="font-family:${BARLOW};font-size:13px;color:${TEXT_MUTED};">${desc}</span>
            </td>
          </tr>`).join('')}
      </table>
    `)}
  `);

  await resend.emails.send({
    from: FROM, replyTo: REPLY_TO,
    to: email,
    subject: `👟 Welcome to APEX KICKS — You're in, ${name?.split(' ')[0] || 'Sneakerhead'}.`,
    html,
  });
  console.log(`[email] welcome → ${email}`);
}

// ════════════════════════════════════════════════════════════════════════════
// 1. ORDER CONFIRMATION
// ════════════════════════════════════════════════════════════════════════════
export async function sendOrderConfirmation(order, user) {
  if (!resend || !user?.email) return;
  const name = (user.name || '').split(' ')[0] || 'Sneakerhead';
  const ordId = (order.id || '').slice(-8).toUpperCase() || 'XXXXXXXX';

  const html = wrap(`
    ${card(`
      <p style="font-family:${BEBAS};font-size:12px;letter-spacing:0.28em;color:${RED};margin:0 0 8px;">ORDER CONFIRMED</p>
      <h1 style="font-family:${BEBAS};font-size:34px;color:#fff;margin:0 0 14px;letter-spacing:0.04em;line-height:1.1;">
        YOU'RE LOCKED IN,<br/>${name.toUpperCase()}.
      </h1>
      <p style="font-family:${BARLOW};font-size:14px;color:${TEXT_MUTED};margin:0 0 20px;line-height:1.75;">
        Order <strong style="color:${TEXT_MAIN};">#${ordId}</strong> has been received.
        Payment is being confirmed and we'll keep you updated every step of the way.
      </p>
      ${itemsTable(order.items)}
      ${totalsBlock(order)}
      ${ctaBtn('VIEW MY ORDER →', 'https://apexkicks.com/profile')}
    `)}
    ${card(`
      <p style="font-family:${BEBAS};font-size:12px;letter-spacing:0.22em;color:${TEXT_MUTED};margin:0 0 18px;">WHAT HAPPENS NEXT</p>
      <table width="100%" cellpadding="0" cellspacing="0">
        ${[
      ['⚙️', 'PROCESSING', 'Payment confirmed and order is prepared.'],
      ['📦', 'PACKING', 'Individually inspected and packed by hand.'],
      ['🚀', 'SHIPPING', 'Ships with real-time tracking updates.'],
      ['✅', 'DELIVERED', 'Your kicks arrive at your door.'],
    ].map(([ico, title, desc]) => `
          <tr>
            <td style="width:30px;vertical-align:top;padding:9px 0;font-size:20px;">${ico}</td>
            <td style="padding:9px 0 9px 10px;border-bottom:1px solid ${BORDER};">
              <strong style="font-family:${BEBAS};font-size:14px;color:#fff;letter-spacing:0.08em;display:block;">${title}</strong>
              <span style="font-family:${BARLOW};font-size:13px;color:${TEXT_MUTED};">${desc}</span>
            </td>
          </tr>`).join('')}
      </table>
    `)}
  `);

  await resend.emails.send({
    from: FROM, replyTo: REPLY_TO,
    to: user.email,
    subject: `📦 Order Confirmed — #${ordId} · $${Number(order.total || 0).toFixed(2)}`,
    html,
  });
  console.log(`[email] confirmation → ${user.email}`);
}

// ════════════════════════════════════════════════════════════════════════════
// 2. STATUS UPDATE (PROCESSING / SHIPPED / DELIVERED / CANCELLED)
// ════════════════════════════════════════════════════════════════════════════
export async function sendStatusUpdateEmail(order, user) {
  if (!resend || !user?.email) return;
  const meta = STATUS_META[order.status] || STATUS_META.PROCESSING;
  const name = (user.name || '').split(' ')[0] || 'Sneakerhead';
  const ordId = (order.id || '').slice(-8).toUpperCase() || 'XXXXXXXX';

  let headlineText = `ORDER UPDATE, ${name.toUpperCase()}.`;
  if (order.status === 'SHIPPED') headlineText = `YOUR KICKS ARE\nON THE MOVE!`;
  if (order.status === 'DELIVERED') headlineText = `ENJOY YOUR KICKS,\n${name.toUpperCase()}!`;
  if (order.status === 'CANCELLED') headlineText = `YOUR ORDER\nWAS CANCELLED.`;

  let trackingBlock = '';
  if (order.status === 'SHIPPED' && order.trackingNumber) {
    trackingBlock = `
      <div style="margin-top:18px;background:#1a1a1a;border:1px solid ${meta.color}44;border-radius:6px;padding:14px 18px;">
        <p style="font-family:${BEBAS};font-size:12px;letter-spacing:0.2em;color:${meta.color};margin:0 0 6px;">TRACKING INFO</p>
        <p style="font-family:${BARLOW};font-size:14px;color:${TEXT_MAIN};margin:0;">
          ${order.trackingCarrier || 'Carrier'} · <strong>${order.trackingNumber}</strong>
        </p>
        ${order.trackingUrl ? `<a href="${order.trackingUrl}" style="font-family:${BARLOW};font-size:13px;color:${meta.color};margin-top:6px;display:inline-block;">Track package →</a>` : ''}
      </div>`;
  }

  const html = wrap(`
    ${card(`
      <div style="font-size:36px;margin-bottom:12px;">${meta.icon}</div>
      <p style="font-family:${BEBAS};font-size:12px;letter-spacing:0.28em;color:${meta.color};margin:0 0 8px;">${meta.label}</p>
      <h1 style="font-family:${BEBAS};font-size:32px;color:#fff;margin:0 0 14px;letter-spacing:0.04em;line-height:1.1;white-space:pre-line;">${headlineText}</h1>
      <p style="font-family:${BARLOW};font-size:14px;color:${TEXT_MUTED};margin:0;line-height:1.75;">
        ${meta.desc} Order <strong style="color:${TEXT_MAIN};">#${ordId}</strong>.
      </p>
      ${trackingBlock}
      ${order.status !== 'CANCELLED' ? ctaBtn('VIEW ORDER STATUS →', 'https://apexkicks.com/profile') : ''}
    `)}
    ${order.items?.length ? card(`
      <p style="font-family:${BEBAS};font-size:12px;letter-spacing:0.2em;color:${TEXT_MUTED};margin:0 0 4px;">YOUR ORDER</p>
      ${itemsTable(order.items)}
      ${totalsBlock(order)}
    `) : ''}
  `);

  const subjects = {
    PROCESSING: `⚙️ Your order is being prepared — #${ordId}`,
    SHIPPED: `🚀 Your kicks have shipped! — #${ordId}`,
    DELIVERED: `✅ Delivered! Your APEX KICKS are here — #${ordId}`,
    CANCELLED: `❌ Order cancelled — #${ordId}`,
  };

  await resend.emails.send({
    from: FROM, replyTo: REPLY_TO,
    to: user.email,
    subject: subjects[order.status] || `Order Update — #${ordId}`,
    html,
  });
  console.log(`[email] status:${order.status} → ${user.email}`);
}

// Backward-compat alias
export const sendProcessingEmail = sendStatusUpdateEmail;

// ════════════════════════════════════════════════════════════════════════════
// 3. NEWSLETTER WELCOME
// ════════════════════════════════════════════════════════════════════════════
export async function sendNewsletterWelcome({ email, name, source = 'website' }) {
  if (!resend || !email) return;
  const display = name ? name.split(' ')[0].toUpperCase() : 'SNEAKERHEAD';

  const html = wrap(`
    ${card(`
      <div style="text-align:center;padding:8px 0 20px;">
        <div style="font-size:44px;margin-bottom:14px;">🔥</div>
        <p style="font-family:${BEBAS};font-size:12px;letter-spacing:0.3em;color:${RED};margin:0 0 10px;">YOU'RE IN THE CIRCLE</p>
        <h1 style="font-family:${BEBAS};font-size:38px;color:#fff;margin:0 0 18px;letter-spacing:0.04em;line-height:1.05;">
          WELCOME TO<br/><span style="color:${RED};">APEX ELITE,</span><br/>${display}.
        </h1>
        <p style="font-family:${BARLOW};font-size:14px;color:${TEXT_MUTED};margin:0 auto 24px;line-height:1.8;max-width:400px;">
          You're now part of a community that gets early access to drops, exclusive collabs,
          and insider stories from the world of sneaker culture.
        </p>
        ${ctaBtn('EXPLORE LATEST DROPS →', 'https://apexkicks.com/drops')}
      </div>
    `)}
    ${card(`
      <p style="font-family:${BEBAS};font-size:12px;letter-spacing:0.22em;color:${TEXT_MUTED};margin:0 0 18px;">WHAT YOU GET AS AN APEX INSIDER</p>
      <table width="100%" cellpadding="0" cellspacing="0">
        ${[
      ['⚡', 'EARLY DROP ACCESS', 'First in line when limited collabs and new silhouettes hit.'],
      ['🎨', 'COLLAB PREVIEWS', 'Behind-the-scenes at upcoming artist collaborations.'],
      ['📖', 'CULTURE STORIES', 'Deep dives into artists, cities, and scenes that move culture.'],
      ['🎁', 'EXCLUSIVE OFFERS', 'Member-only discounts and surprise early access codes.'],
    ].map(([ico, title, desc]) => `
          <tr>
            <td style="width:34px;vertical-align:top;padding:9px 0;font-size:20px;">${ico}</td>
            <td style="padding:9px 0 9px 10px;border-bottom:1px solid ${BORDER};">
              <strong style="font-family:${BEBAS};font-size:15px;color:#fff;letter-spacing:0.06em;display:block;">${title}</strong>
              <span style="font-family:${BARLOW};font-size:13px;color:${TEXT_MUTED};">${desc}</span>
            </td>
          </tr>`).join('')}
      </table>
    `)}
  `);

  await resend.emails.send({
    from: FROM, replyTo: REPLY_TO,
    to: email,
    subject: `🔥 Welcome to APEX ELITE — You're in the circle.`,
    html,
  });
  console.log(`[email] newsletter welcome → ${email}`);
}

// ════════════════════════════════════════════════════════════════════════════
// 4. COLLAB APPLICATION CONFIRMATION
// ════════════════════════════════════════════════════════════════════════════
export async function sendCollabApplicationEmail({ email, name, message, instagram }) {
  if (!resend || !email) return;
  const display = name ? name.split(' ')[0].toUpperCase() : 'CREATOR';

  const html = wrap(`
    ${card(`
      <div style="text-align:center;padding:8px 0 18px;">
        <div style="font-size:44px;margin-bottom:14px;">🎨</div>
        <p style="font-family:${BEBAS};font-size:12px;letter-spacing:0.3em;color:${RED};margin:0 0 10px;">APPLICATION RECEIVED</p>
        <h1 style="font-family:${BEBAS};font-size:36px;color:#fff;margin:0 0 16px;letter-spacing:0.04em;line-height:1.05;">
          YOUR VISION IS<br/><span style="color:${RED};">ON OUR RADAR,</span><br/>${display}.
        </h1>
        <p style="font-family:${BARLOW};font-size:14px;color:${TEXT_MUTED};margin:0 auto;line-height:1.8;max-width:420px;">
          We've received your collab application and our creative team is giving it personal attention —
          not a form letter. Expect to hear from us within 72 hours.
        </p>
      </div>
    `)}
    ${card(`
      <p style="font-family:${BEBAS};font-size:12px;letter-spacing:0.22em;color:${TEXT_MUTED};margin:0 0 14px;">YOUR APPLICATION</p>
      <table width="100%" cellpadding="0" cellspacing="0">
        ${[
      ['Name', name || '—'],
      ['Email', email],
      ['Instagram', instagram ? '@' + instagram.replace('@', '') : '—'],
    ].map(([label, val]) => `
          <tr>
            <td style="font-family:${BARLOW};font-size:11px;letter-spacing:0.12em;color:${TEXT_MUTED};padding:8px 0;width:110px;vertical-align:top;">${label.toUpperCase()}</td>
            <td style="font-family:${BARLOW};font-size:14px;color:${TEXT_MAIN};padding:8px 0;border-bottom:1px solid ${BORDER};">${val}</td>
          </tr>`).join('')}
      </table>
      ${message ? `
        <div style="margin-top:16px;background:#1a1a1a;border-left:3px solid ${RED};padding:14px 16px;border-radius:0 4px 4px 0;">
          <p style="font-family:${BEBAS};font-size:11px;letter-spacing:0.2em;color:${TEXT_MUTED};margin:0 0 8px;">YOUR MESSAGE</p>
          <p style="font-family:${BARLOW};font-size:14px;color:${TEXT_MUTED};margin:0;line-height:1.7;">${message}</p>
        </div>` : ''}
    `)}
    ${card(`
      <p style="font-family:${BEBAS};font-size:12px;letter-spacing:0.22em;color:${TEXT_MUTED};margin:0 0 18px;">WHAT HAPPENS NEXT</p>
      <table width="100%" cellpadding="0" cellspacing="0">
        ${[
        ['48–72 hrs', 'CREATIVE REVIEW', 'Our team reviews your portfolio and application.'],
        ['1 week', 'SHORTLIST', 'Shortlisted artists are contacted for a conversation.'],
        ['2–4 weeks', 'BRIEF CALL', 'A 30-min call to explore the collab concept.'],
        ['Ongoing', 'DEVELOPMENT', 'Selected artists enter our 6-week collaborative process.'],
      ].map(([time, title, desc]) => `
          <tr>
            <td style="width:80px;vertical-align:top;padding:9px 0;border-bottom:1px solid ${BORDER};">
              <span style="font-family:${BEBAS};font-size:12px;color:${RED};letter-spacing:0.08em;">${time}</span>
            </td>
            <td style="padding:9px 0 9px 12px;border-bottom:1px solid ${BORDER};">
              <strong style="font-family:${BEBAS};font-size:14px;color:#fff;letter-spacing:0.06em;display:block;">${title}</strong>
              <span style="font-family:${BARLOW};font-size:13px;color:${TEXT_MUTED};">${desc}</span>
            </td>
          </tr>`).join('')}
      </table>
      <p style="font-family:${BARLOW};font-size:13px;color:${TEXT_MUTED};margin:18px 0 0;line-height:1.7;">
        Questions? Reply to this email or DM us
        <a href="https://instagram.com/apexkicks" style="color:${RED};text-decoration:none;">@apexkicks</a>.
      </p>
    `)}
  `);

  await resend.emails.send({
    from: FROM, replyTo: REPLY_TO,
    to: email,
    subject: `🎨 Collab Application Received — We'll be in touch, ${name?.split(' ')[0] || 'Creator'}.`,
    html,
  });
  console.log(`[email] collab application → ${email}`);
}

export async function notifyTeamNewCollab({ email, name, message, instagram }) {
  const TEAM_EMAIL = process.env.TEAM_EMAIL;
  if (!resend || !TEAM_EMAIL) return;
  await resend.emails.send({
    from: FROM, replyTo: email,
    to: TEAM_EMAIL,
    subject: `[NEW COLLAB] Application from ${name || email}`,
    html: `<p><strong>Name:</strong> ${name || '—'}</p>
           <p><strong>Email:</strong> ${email}</p>
           <p><strong>Instagram:</strong> ${instagram || '—'}</p>
           <p><strong>Message:</strong><br/>${message || '—'}</p>`,
  });
}

// ── Backward-compat aliases (used by admin.js from Phase 6) ──────────────────
// admin.js imports sendShippingEmail — it now routes through sendStatusUpdateEmail
export async function sendShippingEmail(order, user) {
  return sendStatusUpdateEmail({ ...order, status: 'SHIPPED' }, user);
}

// ─────────────────────────────────────────────────────────────
// Notify admin team when a user deletes an order from history
// ─────────────────────────────────────────────────────────────
export async function notifyTeamOrderDeleted(order, user) {
  const TEAM_EMAIL = process.env.TEAM_EMAIL;
  if (!resend || !TEAM_EMAIL) return;

  const itemList = (order.items || [])
    .map(i => `<li style="margin:4px 0;color:#ccc;">${i.qty}× ${i.name || 'Item'} — US ${i.size} @ $${Number(i.price || 0).toFixed(2)}</li>`)
    .join('');

  await resend.emails.send({
    from: FROM,
    to: TEAM_EMAIL,
    subject: `[APEX KICKS] Order ${order.id.slice(0, 8).toUpperCase()} deleted by user`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;background:#111;color:#fff;padding:32px;border-radius:8px;">
        <h2 style="color:#FF2200;font-size:20px;margin:0 0 20px;">🗑️ Order Deleted by User</h2>
        <table style="width:100%;border-collapse:collapse;font-size:14px;color:#ccc;">
          <tr><td style="padding:6px 0;color:#888;">Order ID</td><td style="padding:6px 0;font-family:monospace;">${order.id}</td></tr>
          <tr><td style="padding:6px 0;color:#888;">User</td><td style="padding:6px 0;">${user?.name || 'Unknown'} &lt;${user?.email || 'N/A'}&gt;</td></tr>
          <tr><td style="padding:6px 0;color:#888;">Status at deletion</td><td style="padding:6px 0;">${order.status}</td></tr>
          <tr><td style="padding:6px 0;color:#888;">Order total</td><td style="padding:6px 0;">$${(Number(order.total || 0) / 100).toFixed(2)}</td></tr>
          <tr><td style="padding:6px 0;color:#888;">Placed at</td><td style="padding:6px 0;">${new Date(order.createdAt).toLocaleString()}</td></tr>
          <tr><td style="padding:6px 0;color:#888;">Deleted at</td><td style="padding:6px 0;">${new Date().toLocaleString()}</td></tr>
        </table>
        ${itemList ? `<div style="margin-top:18px;"><div style="color:#888;font-size:12px;margin-bottom:6px;">ITEMS</div><ul style="margin:0;padding:0 0 0 18px;">${itemList}</ul></div>` : ''}
        <p style="margin-top:24px;font-size:12px;color:#555;">This order has been permanently removed from the user's history.</p>
      </div>
    `,
  });
}