// apex-kicks/src/context/WishlistContext.js
//
// PERSISTENT WISHLIST — survives page reloads and browser restarts.
//
// Strategy:
//   • Signed-in users  → state synced to backend DB (NeonDB via Prisma).
//                         Loaded fresh from DB on every sign-in.
//                         Every toggle immediately calls the API then updates local state.
//   • Guests           → state stored in localStorage so it isn't lost on refresh.
//                         On sign-in the guest wishlist is silently migrated to the DB.
//
// Components consuming this context have ZERO changes — the same
// { wishlistItems, toggleWishlist, removeFromWishlist, isWishlisted, wishlistCount }
// API is preserved exactly.

import {
    createContext, useContext, useState,
    useCallback, useEffect, useRef,
} from 'react';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import { PRODUCTS } from '../data/products';
import api from '../lib/api';

const WishlistContext = createContext(null);

const LS_KEY = 'apex_guest_wishlist'; // localStorage key for guests

// ── Helpers ───────────────────────────────────────────────────
function loadGuestWishlist() {
    try {
        const raw = localStorage.getItem(LS_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

function saveGuestWishlist(items) {
    try {
        localStorage.setItem(LS_KEY, JSON.stringify(items));
    } catch { /* storage quota exceeded — silently skip */ }
}

// Turn a raw DB row { productId, id, addedAt } into a full product object
// by looking it up in the local PRODUCTS array.
function enrichFromDB(dbRow) {
    const product = PRODUCTS.find(p => p.id === dbRow.productId);
    if (!product) return null;           // product removed from catalog — skip
    return { ...product, _wishlistId: dbRow.id, _addedAt: dbRow.addedAt };
}

// ─────────────────────────────────────────────────────────────
export function WishlistProvider({ children }) {
    const { isLoggedIn, isLoaded, getToken } = useAuth();
    const addToast = useToast();

    const [wishlistItems, setWishlistItems] = useState([]);
    const [loading, setLoading] = useState(false);

    // Prevent duplicate simultaneous fetches
    const fetchingRef = useRef(false);
    // Track prev login state to detect the sign-in moment
    const prevLoggedIn = useRef(false);

    // ── Load wishlist whenever auth state changes ─────────────
    useEffect(() => {
        if (!isLoaded) return;

        if (isLoggedIn) {
            // Just signed in (or page reload while signed in)
            const justSignedIn = !prevLoggedIn.current;
            loadFromBackend(justSignedIn);
        } else {
            // Signed out — switch to guest localStorage wishlist
            setWishlistItems(loadGuestWishlist());
        }

        prevLoggedIn.current = isLoggedIn;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isLoaded, isLoggedIn]);

    // ── Fetch all wishlist items from backend ─────────────────
    const loadFromBackend = useCallback(async (migrateGuest = false) => {
        if (fetchingRef.current) return;
        fetchingRef.current = true;
        setLoading(true);

        try {
            const token = await getToken();
            const dbRows = await api.get('/wishlist', token);   // [{ id, productId, addedAt }]
            const dbItems = dbRows
                .map(enrichFromDB)
                .filter(Boolean);                                    // drop removed products

            // ── Migrate guest wishlist to DB on first sign-in ────
            if (migrateGuest) {
                const guestItems = loadGuestWishlist();
                const dbIds = new Set(dbItems.map(p => p.id));

                const toMigrate = guestItems.filter(p => !dbIds.has(p.id));
                if (toMigrate.length > 0) {
                    await Promise.allSettled(
                        toMigrate.map(p =>
                            api.post(`/wishlist/${p.id}`, {}, token)
                                .catch(() => {/* ignore individual failures */ })
                        )
                    );
                    // Re-fetch to get the merged list
                    const merged = await api.get('/wishlist', token);
                    setWishlistItems(merged.map(enrichFromDB).filter(Boolean));
                    localStorage.removeItem(LS_KEY);   // guest wishlist migrated — clear it
                    return;
                }
                // Nothing to migrate — clear guest store anyway
                localStorage.removeItem(LS_KEY);
            }

            setWishlistItems(dbItems);
        } catch (err) {
            console.warn('[WishlistContext] Backend unavailable, using localStorage:', err.message);
            // Backend unreachable — fall back to localStorage so UI still works
            setWishlistItems(loadGuestWishlist());
        } finally {
            setLoading(false);
            fetchingRef.current = false;
        }
    }, [getToken]);

    // ── Toggle (add / remove) ─────────────────────────────────
    const toggleWishlist = useCallback(async (product) => {
        const alreadyIn = wishlistItems.some(p => p.id === product.id);

        // Optimistic update — feels instant
        if (alreadyIn) {
            setWishlistItems(prev => prev.filter(p => p.id !== product.id));
            addToast('info', product.name, 'Removed from wishlist');
        } else {
            setWishlistItems(prev => [...prev, { ...product, _addedAt: new Date().toISOString() }]);
            addToast('success', product.name, 'Saved to wishlist ♥');
        }

        if (isLoggedIn) {
            // Persist to backend
            try {
                const token = await getToken();
                await api.post(`/wishlist/${product.id}`, {}, token);
            } catch (err) {
                console.warn('[WishlistContext] Toggle failed on backend:', err.message);
                // Roll back optimistic update
                if (alreadyIn) {
                    setWishlistItems(prev => [...prev, product]);
                    addToast('error', 'Error', 'Could not remove — please try again.');
                } else {
                    setWishlistItems(prev => prev.filter(p => p.id !== product.id));
                    addToast('error', 'Error', 'Could not save — please try again.');
                }
            }
        } else {
            // Guest — persist to localStorage
            setWishlistItems(prev => {
                const updated = alreadyIn
                    ? prev.filter(p => p.id !== product.id)
                    : [...prev.filter(p => p.id !== product.id), product]; // dedup
                saveGuestWishlist(updated);
                return updated;
            });
        }
    }, [wishlistItems, isLoggedIn, getToken, addToast]);

    // ── Remove a single item ──────────────────────────────────
    const removeFromWishlist = useCallback(async (productId) => {
        const product = wishlistItems.find(p => p.id === productId);
        if (!product) return;

        setWishlistItems(prev => prev.filter(p => p.id !== productId));
        if (product.name) addToast('info', product.name, 'Removed from wishlist');

        if (isLoggedIn) {
            try {
                const token = await getToken();
                await api.post(`/wishlist/${productId}`, {}, token);  // toggle off
            } catch (err) {
                console.warn('[WishlistContext] Remove failed:', err.message);
                setWishlistItems(prev => [...prev, product]);          // roll back
            }
        } else {
            setWishlistItems(prev => {
                const updated = prev.filter(p => p.id !== productId);
                saveGuestWishlist(updated);
                return updated;
            });
        }
    }, [wishlistItems, isLoggedIn, getToken, addToast]);

    // ── isWishlisted ──────────────────────────────────────────
    const isWishlisted = useCallback(
        (productId) => wishlistItems.some(p => p.id === productId),
        [wishlistItems]
    );

    return (
        <WishlistContext.Provider value={{
            wishlistItems,
            wishlistCount: wishlistItems.length,
            wishlistLoading: loading,
            toggleWishlist,
            removeFromWishlist,
            isWishlisted,
        }}>
            {children}
        </WishlistContext.Provider>
    );
}

export function useWishlist() {
    const ctx = useContext(WishlistContext);
    if (!ctx) throw new Error('useWishlist must be used inside WishlistProvider');
    return ctx;
}