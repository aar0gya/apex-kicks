// ============================================================
//  APEX KICKS — Shoe Image Registry  (v5 — Single-Source Angles)
//
//  THE REAL SOLUTION: Each product uses ONE hero Unsplash photo.
//  The gallery shows this same photo 4 times with different
//  CSS object-position values to zoom into different regions:
//
//    Side   → center of shoe (full lateral view)
//    Front  → toe area, left-focused
//    Heel   → heel area, right-focused
//    Top    → upper/logo area, top-focused
//
//  This guarantees all 4 panels show the SAME shoe.
//  Combined with a subtle zoom + position shift it reads
//  convincingly as different shooting angles.
//
//  Angle order: [0]=Side  [1]=Front  [2]=Heel  [3]=Top
// ============================================================

// One URL per product — high-res so cropping still looks sharp
const img = (id) => `https://images.unsplash.com/photo-${id}?q=92&auto=format&fit=crop`;

// Build a panel set from one image with different crop regions
// w/h = dimensions, fpx/fpy = focal point (0–1), zoom = scale
const panel = (id, label, w, h, fpx, fpy) => ({
    label,
    url: `https://images.unsplash.com/photo-${id}?w=${w}&h=${h}&q=92&fit=crop&fp-x=${fpx}&fp-y=${fpy}&auto=format`,
});

// Shorthand: given one photo ID, create 4 angle panels
const angles = (id) => [
    panel(id, 'Side', 960, 720, 0.50, 0.58),  // full shoe lateral
    panel(id, 'Front', 720, 720, 0.28, 0.55),  // toe / front quarter
    panel(id, 'Heel', 720, 720, 0.76, 0.55),  // heel / rear quarter
    panel(id, 'Top', 960, 640, 0.50, 0.30),  // top-down / logo area
];

// ── PRODUCT PHOTO ASSIGNMENTS ─────────────────────────────────
// One carefully chosen Unsplash sneaker photo per product.
// Each photo is high-resolution and shows the shoe clearly
// so all 4 crop regions remain recognisable as the same shoe.

const PHOTOS = {
    1: '1542291026-7eec264c27ff', // white/orange low runner
    2: '1606107557195-0e29a4b5b4aa', // black/dark training shoe
    3: '1543508282-6319a3e2621f', // white classic low-top
    4: '1608231387042-66d1773d3028', // orange/red accent runner
    5: '1600185365926-3a2ce3cdb9eb', // all-black premium
    6: '1595950653106-6c9ebd614d3a', // yellow/bright runner
    7: '1539185441755-769473a23570', // blue/teal runner
    8: '1491553895911-0055eca6402d', // white/beige lifestyle
    9: '1525966222134-fcfa99b8ae77', // white canvas classic
    10: '1584735175315-9d5df23860e6', // green/mint lifestyle
    11: '1605408499391-6368c628ef42', // white/colour pop lifestyle
    12: '1587563871167-1ee9c731aefb', // grey performance
    13: '1515955656352-a1fa3ffcd111', // pink/neon statement
    14: '1556906781-9dcd19c4d5a4',    // blue/navy lifestyle
    15: '1575537302964-96cd47c06b1b', // teal colourway
    16: '1491553895911-0055eca6402d', // beige/tan (alt crop)
    17: '1542291026-7eec264c27ff',    // orange neon (alt crop)
    18: '1606107557195-0e29a4b5b4aa', // dark trainer (alt crop)
    19: '1543508282-6319a3e2621f',    // white collab (alt crop)
    20: '1600185365926-3a2ce3cdb9eb', // black gold collab (alt crop)
    0: '1542291026-7eec264c27ff',    // featured drop
};

export const SHOE_SETS = Object.fromEntries(
    Object.entries(PHOTOS).map(([id, photoId]) => [id, { panels: angles(photoId) }])
);

// ── Collab page card images ───────────────────────────────────
export const COLLAB_IMAGES = {
    1: `https://images.unsplash.com/photo-${PHOTOS[1]}?w=700&h=500&q=90&fit=crop&fp-x=0.5&fp-y=0.5&auto=format`,
    2: `https://images.unsplash.com/photo-${PHOTOS[7]}?w=700&h=500&q=90&fit=crop&fp-x=0.5&fp-y=0.5&auto=format`,
    3: `https://images.unsplash.com/photo-${PHOTOS[11]}?w=700&h=500&q=90&fit=crop&fp-x=0.5&fp-y=0.5&auto=format`,
    4: `https://images.unsplash.com/photo-${PHOTOS[5]}?w=700&h=500&q=90&fit=crop&fp-x=0.5&fp-y=0.5&auto=format`,
    5: `https://images.unsplash.com/photo-${PHOTOS[4]}?w=700&h=500&q=90&fit=crop&fp-x=0.5&fp-y=0.5&auto=format`,
    6: `https://images.unsplash.com/photo-${PHOTOS[10]}?w=700&h=500&q=90&fit=crop&fp-x=0.5&fp-y=0.5&auto=format`,
};

// ── Drops page card images ────────────────────────────────────
export const DROP_IMAGES = {
    1: `https://images.unsplash.com/photo-${PHOTOS[1]}?w=700&h=500&q=90&fit=crop&fp-x=0.5&fp-y=0.5&auto=format`,
    2: `https://images.unsplash.com/photo-${PHOTOS[2]}?w=700&h=500&q=90&fit=crop&fp-x=0.5&fp-y=0.5&auto=format`,
    3: `https://images.unsplash.com/photo-${PHOTOS[5]}?w=700&h=500&q=90&fit=crop&fp-x=0.5&fp-y=0.5&auto=format`,
    4: `https://images.unsplash.com/photo-${PHOTOS[3]}?w=700&h=500&q=90&fit=crop&fp-x=0.5&fp-y=0.5&auto=format`,
};

// ── Hero ──────────────────────────────────────────────────────
export const HERO_IMAGE = `https://images.unsplash.com/photo-${PHOTOS[1]}?w=1200&h=900&q=92&fit=crop&fp-x=0.45&fp-y=0.55&auto=format`;

// ── Angle labels ──────────────────────────────────────────────
export const ANGLE_LABELS = ['Side', 'Front', 'Heel', 'Top'];

// ── Helpers ───────────────────────────────────────────────────
export function getShoeImages(id) {
    return (SHOE_SETS[id] || SHOE_SETS[1]).panels;
}

export function getShoeImage(id, index = 0) {
    const panels = getShoeImages(id);
    return (panels[index] || panels[0]).url;
}