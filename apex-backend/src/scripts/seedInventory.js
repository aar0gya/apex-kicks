// apex-backend/src/scripts/seedInventory.js
// Resets and reseeds all product inventory with realistic varied stock.
//
// Run with:
//   node src/scripts/seedInventory.js
//
// Stock story per product:
//   APEX PHANTOM    — New Drop: healthy mid-sizes, edge sizes sold out
//   VOID RUNNER     — Bestseller: best stocked product overall
//   CHROME LEGEND   — Limited: critically low across ALL sizes, near sold out
//   EMBER FORCE     — Hot seller: mid-sizes selling out, low stock warning
//   OBSIDIAN PRO    — Exclusive: almost entirely sold out (only 3 sizes left)
//   SOLAR STRIKE    — New arrival: well stocked, 1 size sold out

import dns from 'dns';
dns.setDefaultResultOrder('ipv4first');

import prisma from '../lib/prisma.js';

const SIZES = ['6','6.5','7','7.5','8','8.5','9','9.5','10','10.5','11','11.5','12','13'];

// ── Stock map ─────────────────────────────────────────────────
// 0  = sold out (crossed out in UI)
// 1-3 = low stock (amber dot + "ONLY N LEFT")
// 4+  = normal
const STOCK_MAP = {

  // ── APEX PHANTOM — New Drop ───────────────────────────────
  // Mid-sizes flew off shelves. Edges never restocked.
  1: {
    '6':   0,   // sold out
    '6.5': 0,   // sold out
    '7':   6,
    '7.5': 9,
    '8':   14,
    '8.5': 18,
    '9':   20,
    '9.5': 16,
    '10':  12,
    '10.5':8,
    '11':  5,
    '11.5':2,   // low stock
    '12':  1,   // low stock
    '13':  0,   // sold out
  },

  // ── VOID RUNNER — Bestseller ──────────────────────────────
  // Constantly restocked. Most sizes available. Flagship product.
  2: {
    '6':   4,
    '6.5': 5,
    '7':   10,
    '7.5': 14,
    '8':   22,
    '8.5': 25,
    '9':   28,
    '9.5': 24,
    '10':  20,
    '10.5':17,
    '11':  13,
    '11.5':9,
    '12':  6,
    '13':  3,   // low stock
  },

  // ── CHROME LEGEND — Limited Edition ──────────────────────
  // Only 300 pairs made globally. Almost gone. Low stock banner.
  3: {
    '6':   0,   // sold out
    '6.5': 0,   // sold out
    '7':   0,   // sold out
    '7.5': 1,   // low stock
    '8':   2,   // low stock
    '8.5': 3,   // low stock
    '9':   2,   // low stock
    '9.5': 1,   // low stock
    '10':  1,   // low stock
    '10.5':0,   // sold out
    '11':  0,   // sold out
    '11.5':0,   // sold out
    '12':  0,   // sold out
    '13':  0,   // sold out
  },

  // ── EMBER FORCE — Hot Seller ──────────────────────────────
  // Selling fast. Popular sizes drying up, low stock warning showing.
  4: {
    '6':   2,   // low stock
    '6.5': 2,   // low stock
    '7':   4,
    '7.5': 5,
    '8':   3,   // low stock
    '8.5': 2,   // low stock
    '9':   0,   // sold out — most popular size gone
    '9.5': 1,   // low stock
    '10':  3,   // low stock
    '10.5':4,
    '11':  5,
    '11.5':3,   // low stock
    '12':  2,   // low stock
    '13':  0,   // sold out
  },

  // ── OBSIDIAN PRO — Exclusive Collab ──────────────────────
  // Only 150 pairs made. Almost entirely sold out. Collector's item.
  5: {
    '6':   0,   // sold out
    '6.5': 0,   // sold out
    '7':   0,   // sold out
    '7.5': 0,   // sold out
    '8':   0,   // sold out
    '8.5': 1,   // low stock — last one
    '9':   0,   // sold out
    '9.5': 2,   // low stock
    '10':  1,   // low stock
    '10.5':0,   // sold out
    '11':  0,   // sold out
    '11.5':0,   // sold out
    '12':  0,   // sold out
    '13':  0,   // sold out
  },

  // ── SOLAR STRIKE — New Arrival ────────────────────────────
  // Fresh drop, well stocked. Size 9 pre-order sold out at launch.
  6: {
    '6':   4,
    '6.5': 6,
    '7':   9,
    '7.5': 11,
    '8':   16,
    '8.5': 19,
    '9':   0,   // sold out — launch hype cleaned it out
    '9.5': 17,
    '10':  14,
    '10.5':11,
    '11':  8,
    '11.5':6,
    '12':  4,
    '13':  2,   // low stock
  },
};

const PRODUCTS = [
  { id: 1, name: 'APEX PHANTOM',  price: 24900, tag: 'NEW DROP',   category: 'RUNNING',   description: 'Ultra-light carbon fiber sole. Built for the relentless.'          },
  { id: 2, name: 'VOID RUNNER',   price: 18900, tag: 'BESTSELLER', category: 'RUNNING',   description: 'Maximum cushion. Zero compromise. Pure street dominance.'           },
  { id: 3, name: 'CHROME LEGEND', price: 31900, tag: 'LIMITED',    category: 'LIFESTYLE', description: 'Heritage silhouette reimagined for the next generation.'            },
  { id: 4, name: 'EMBER FORCE',   price: 27900, tag: 'HOT',        category: 'TRAINING',  description: 'Reactive foam technology that moves before you do.'                 },
  { id: 5, name: 'OBSIDIAN PRO',  price: 35900, tag: 'EXCLUSIVE',  category: 'COLLAB',    description: 'The pinnacle of performance engineering. Zero distractions.'        },
  { id: 6, name: 'SOLAR STRIKE',  price: 22900, tag: 'NEW',        category: 'TRAINING',  description: 'Energy return technology that fuels every stride.'                  },
];

// Threshold: sizes at or below this show the amber "low stock" dot
const LOW_THRESHOLD = 3;

async function seed() {
  console.log('🌱  Seeding APEX KICKS inventory...\n');

  for (const product of PRODUCTS) {
    // Upsert product record
    await prisma.product.upsert({
      where:  { id: product.id },
      update: {
        name:        product.name,
        price:       product.price,
        tag:         product.tag,
        category:    product.category,
        description: product.description,
        isActive:    true,
      },
      create: { ...product, brand: 'APEX', isActive: true },
    });

    const stockMap = STOCK_MAP[product.id] || {};
    let soldOutCount = 0;
    let lowStockCount = 0;

    // Upsert each size
    for (const size of SIZES) {
      const stock = stockMap[size] ?? 8;
      await prisma.productSize.upsert({
        where:  { productId_size: { productId: product.id, size } },
        update: { stock, lowStockThreshold: LOW_THRESHOLD },
        create: { productId: product.id, size, stock, lowStockThreshold: LOW_THRESHOLD },
      });
      if (stock === 0) soldOutCount++;
      else if (stock <= LOW_THRESHOLD) lowStockCount++;
    }

    const totalStock = Object.values(stockMap).reduce((a, b) => a + b, 0);
    const statusIcon = totalStock === 0 ? '🚫' : totalStock <= 10 ? '⚠️ ' : '✓ ';
    console.log(`  ${statusIcon} Product ${product.id}: ${product.name.padEnd(16)} ${String(totalStock).padStart(4)} units  |  ${soldOutCount} sizes sold out, ${lowStockCount} sizes low stock`);
  }

  console.log('\n✅  Seed complete.\n');

  // Summary table
  console.log('━'.repeat(60));
  console.log('  INVENTORY SUMMARY');
  console.log('━'.repeat(60));

  const allSizes = await prisma.productSize.findMany({
    include: { product: true },
    orderBy: [{ productId: 'asc' }, { size: 'asc' }],
  });

  const grouped = {};
  allSizes.forEach(s => {
    if (!grouped[s.productId]) grouped[s.productId] = { name: s.product.name, sizes: [] };
    grouped[s.productId].sizes.push(s);
  });

  Object.values(grouped).forEach(({ name, sizes }) => {
    const total    = sizes.reduce((sum, s) => sum + s.stock, 0);
    const soldOut  = sizes.filter(s => s.stock === 0).length;
    const lowStock = sizes.filter(s => s.stock > 0 && s.stock <= LOW_THRESHOLD).length;
    const avail    = sizes.filter(s => s.stock > 0).length;
    const flag     = total === 0 ? '🚫 SOLD OUT' : total <= 10 ? '⚠️  LOW STOCK' : '✅ IN STOCK';
    console.log(`  ${flag.padEnd(16)}  ${name.padEnd(16)} ${String(total).padStart(4)} units  (${avail} sizes available, ${soldOut} sold out, ${lowStock} low)`);
  });

  console.log('━'.repeat(60));
}

seed()
  .catch(e => { console.error('\n❌  Seed failed:', e.message); process.exit(1); })
  .finally(() => prisma.$disconnect());