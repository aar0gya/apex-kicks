<div align="center">

<img src="public/apex-logo.png" alt="APEX KICKS" width="80"/>

# APEX KICKS

**Premium sneaker e-commerce platform built for drop culture.**

[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![Node.js](https://img.shields.io/badge/Node.js-20-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-4169E1?style=flat-square&logo=postgresql&logoColor=white)](https://neon.tech)
[![Stripe](https://img.shields.io/badge/Payments-Stripe-635BFF?style=flat-square&logo=stripe&logoColor=white)](https://stripe.com)
[![Clerk](https://img.shields.io/badge/Auth-Clerk-6C47FF?style=flat-square&logo=clerk&logoColor=white)](https://clerk.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-FF2200?style=flat-square)](LICENSE)

[Live Demo](https://apex-kicks.vercel.app/) · [Report a Bug](issues) · [Request a Feature](issues)

---

</div>

---

## Overview

APEX KICKS is a full-stack sneaker e-commerce application built from the ground up with a production-level architecture. It features a dark, editorial aesthetic inspired by premium sneaker culture — complete with real payment processing, live inventory management, order tracking, an admin dashboard, and a transactional email system.

This project was built across multiple development phases, each layering in production-grade features on top of a clean React foundation.

---

## Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 18 + Vite | UI framework and build tooling |
| React Router v6 | Client-side routing |
| Clerk | Authentication (sign up, sign in, multi-account) |
| Stripe.js + Elements | PCI-compliant payment card form |
| Context API | Cart, wishlist, auth, and toast state |

### Backend
| Technology | Purpose |
|---|---|
| Node.js + Express | REST API server |
| Prisma ORM | Type-safe database access |
| PostgreSQL (Neon) | Serverless hosted database |
| Clerk JWT | Server-side auth middleware |
| Stripe | Payment intents + webhook processing |
| Resend | Transactional email delivery |
| Zod | Request body validation |

---

## Features

### Storefront
- **Home page** — animated hero, featured drop, brand story, newsletter signup
- **Collection page** — filtering by category, search, grid/list toggle, quick-view modals
- **Drops page** — limited releases with countdown timers
- **Product detail** — multi-angle image gallery, size guide modal (US/UK/EU with men's and women's charts), live stock levels, low-stock warnings, wishlist toggle
- **Stories page** — editorial articles with reader mode and scroll progress
- **Collab page** — artist collaboration applications with form submission
- **About page** — brand story with flip cards and parallax effects

### Checkout & Payments
- Multi-step checkout form (address → payment → confirm)
- Stripe payment processing with real card forms
- Stripe webhook integration — order status auto-updates to `PROCESSING` on payment success
- Order cancellation for `PENDING` orders with automatic stock restoration

### Account & Profile
- Clerk authentication — email/password and Google OAuth
- Multi-account switcher in the profile dropdown
- Profile dashboard with live order history
- Animated order timeline with status tracking (Pending → Processing → Shipped → Delivered)
- Order detail slide-in panel with items, totals, shipping address, and tracking info
- Persistent wishlist synced to the database

### Inventory
- Real-time stock levels per product per size
- Stock deducted on checkout, restored on cancellation
- Seed script with realistic stock distribution across all products and sizes

### Admin Dashboard
- Protected by `isAdmin` flag in the database
- **Overview tab** — revenue stats, 30-day chart, top products, order counts by status
- **Orders tab** — paginated order list with status filter and search, status update with tracking info
- **Customers tab** — paginated customer list with total spend and order count
- **Inventory tab** — stock levels across all products with low-stock and sold-out indicators
- Every status change triggers a customer notification email

### Email Notifications
All emails built with responsive HTML templates matching the APEX KICKS dark aesthetic:

| Trigger | Email |
|---|---|
| New account created | Welcome to APEX KICKS |
| Order placed | Order confirmation with itemised receipt |
| Payment confirmed (Stripe webhook) | Processing confirmation |
| Admin updates order status | Status update (Processing / Shipped / Delivered / Cancelled) |
| Newsletter signup | Welcome to APEX ELITE |
| Collab application submitted | Application received confirmation + team notification |
| User deletes order from history | Internal team notification |

---

## Project Structure

```
apex-kicks/
├── public/                    # Static assets
├── src/
│   ├── components/
│   │   ├── layout/            # Navbar, CartDrawer, Footer
│   │   ├── sections/          # Homepage sections
│   │   └── ui/                # Shared components (Toast, Cursor, etc.)
│   ├── context/               # CartContext, WishlistContext, AuthContext, ToastContext
│   ├── data/                  # Product data, shoe images registry
│   ├── hooks/                 # useBreakpoint, useInventory, useInView
│   ├── lib/                   # API client (api.js)
│   ├── pages/                 # All page components
│   └── styles/                # global.css
│
└── apex-backend/
    ├── prisma/
    │   └── schema.prisma      # Database schema
    └── src/
        ├── lib/               # emails.js, prisma.js
        ├── middleware/        # auth.js, adminAuth.js
        ├── routes/            # users, orders, products, wishlist, inventory, admin, newsletter
        └── scripts/           # seedInventory.js
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- A [Neon](https://neon.tech) PostgreSQL database (free tier works)
- A [Clerk](https://clerk.com) account (free tier works)
- A [Stripe](https://stripe.com) account (test mode)
- A [Resend](https://resend.com) account (free tier works)

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/apex-kicks.git
cd apex-kicks
```

### 2. Install frontend dependencies

```bash
npm install
```

### 3. Set up the frontend environment

Create `apex-kicks/.env`:

```env
REACT_APP_CLERK_PUBLISHABLE_KEY=pk_test_...
REACT_APP_API_URL=http://localhost:4000
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### 4. Install backend dependencies

```bash
cd apex-backend
npm install
```

### 5. Set up the backend environment

Create `apex-backend/.env`:

```env
DATABASE_URL=postgresql://user:password@host/dbname
CLERK_SECRET_KEY=sk_test_...
CLERK_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
RESEND_API_KEY=re_...
EMAIL_FROM=APEX KICKS <onboarding@resend.dev>
EMAIL_REPLY_TO=support@apexkicks.com
EMAIL_TO_OVERRIDE=your@email.com
TEAM_EMAIL=your@email.com
```

> **Note on `EMAIL_TO_OVERRIDE`:** Resend's free tier with the shared `onboarding@resend.dev` sender can only deliver to your own verified email. Set this variable to your email and all notifications will land there. To send to any address, verify a domain at [resend.com/domains](https://resend.com/domains) and update `EMAIL_FROM` accordingly.

### 6. Set up the database

```bash
cd apex-backend
npx prisma migrate deploy
npx prisma generate
node src/scripts/seedInventory.js
```

### 7. Grant admin access

In your Neon SQL console, run:

```sql
UPDATE "User" SET "isAdmin" = true WHERE email = 'your@email.com';
```

### 8. Run the development servers

In `apex-backend/`:
```bash
npm run dev
```

In `apex-kicks/` (separate terminal):
```bash
npm start
```

### 9. Set up Stripe webhooks (for payment confirmation emails)

```bash
stripe listen --forward-to localhost:4000/api/stripe/webhook
```

The app will be running at `http://localhost:3000`.

---

## Environment Variables Reference

### Frontend (`apex-kicks/.env`)

| Variable | Description |
|---|---|
| `REACT_APP_CLERK_PUBLISHABLE_KEY` | Clerk publishable key from your dashboard |
| `REACT_APP_API_URL` | Backend API base URL |
| `REACT_APP_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key |

### Backend (`apex-backend/.env`)

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `CLERK_SECRET_KEY` | Clerk secret key |
| `CLERK_PUBLISHABLE_KEY` | Clerk publishable key (used for JWKS URL) |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `RESEND_API_KEY` | Resend API key for email delivery |
| `EMAIL_FROM` | Sender address (must be verified in Resend) |
| `EMAIL_REPLY_TO` | Reply-to address |
| `EMAIL_TO_OVERRIDE` | Dev override — redirect all emails here |
| `TEAM_EMAIL` | Admin notification recipient |

---

## Roadmap

- [ ] Product reviews and ratings
- [ ] Size recommendation engine
- [ ] Waitlist / notify-me for sold-out sizes
- [ ] Discount codes and promotions
- [ ] Mobile app (React Native)
- [ ] Deploy to production (Vercel + Railway)

---

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

Built with 🔥 by [Aarogya Bikram Thapa](https://github.com/aar0gya)

</div>
