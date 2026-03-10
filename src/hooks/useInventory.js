// apex-kicks/src/hooks/useInventory.js
// Phase 4 — fetches live inventory from /api/inventory
//
// Usage:
//   const { inventory, loading } = useInventory();         // all products
//   const { inventory, loading } = useInventory(productId); // one product
//
// Returns:
//   inventory — Map<productId, { sizes: { [size]: { stock, available, lowStock, soldOut } }, soldOut, totalStock }>
//   getSize(productId, size) — convenience accessor

import { useState, useEffect, useCallback, useRef } from 'react';

// Module-level cache so the API is only called once per page load
// across all components that use this hook.
let _cache = null;
let _loading = false;
let _listeners = [];

function notifyAll(data) {
    _cache = data;
    _loading = false;
    _listeners.forEach(fn => fn(data));
}

async function fetchAll() {
    if (_cache) return _cache;
    if (_loading) return null;
    _loading = true;
    try {
        const res = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:4000'}/api/inventory`);
        const data = await res.json();
        if (!Array.isArray(data)) return null;
        // Convert to Map keyed by productId
        const map = new Map();
        data.forEach(p => map.set(p.id, p));
        notifyAll(map);
        return map;
    } catch (err) {
        console.warn('[useInventory] Failed to fetch inventory:', err.message);
        _loading = false;
        return null;
    }
}

export default function useInventory(productId = null) {
    const [inventory, setInventory] = useState(_cache);
    const [loading, setLoading] = useState(!_cache);
    const mounted = useRef(true);

    const refresh = useCallback(async () => {
        _cache = null;   // invalidate cache
        _loading = false;
        setLoading(true);
        const data = await fetchAll();
        if (mounted.current) {
            setInventory(data);
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        mounted.current = true;
        if (_cache) {
            setInventory(_cache);
            setLoading(false);
        } else {
            _listeners.push(data => {
                if (mounted.current) {
                    setInventory(data);
                    setLoading(false);
                }
            });
            fetchAll();
        }
        return () => { mounted.current = false; };
    }, []);

    // If a productId is provided, extract just that product's data
    const product = inventory && productId != null ? inventory.get(productId) : null;

    // Convenience: get stock info for one size
    const getSize = (pid, size) => {
        const p = inventory?.get(pid);
        return p?.sizes?.[String(size)] ?? null;
    };

    return {
        inventory,   // full Map — all products
        product,     // just the requested product (if productId passed)
        loading,
        refresh,
        getSize,
    };
}