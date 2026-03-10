// apex-kicks/src/context/CartContext.js
import { createContext, useContext, useState, useCallback } from 'react';
import { useToast } from './ToastContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
    const [cartItems, setCartItems] = useState([]);
    const [cartOpen, setCartOpen] = useState(false);
    const addToast = useToast();

    const addToCart = useCallback((product) => {
        setCartItems(prev => {
            const idx = prev.findIndex(i => i.id === product.id && i.size === product.size);
            if (idx !== -1) {
                const updated = [...prev];
                updated[idx] = { ...updated[idx], qty: (updated[idx].qty || 1) + 1 };
                return updated;
            }
            return [...prev, { ...product, qty: 1 }];
        });
        setCartOpen(true);
        const sizeLabel = product.size ? ` · US ${product.size}` : '';
        addToast('success', product.name, `Added to cart${sizeLabel}`);
    }, [addToast]);

    const removeFromCart = useCallback((index) => {
        setCartItems(prev => {
            const item = prev[index];
            if (item) addToast('info', item.name, 'Removed from cart');
            return prev.filter((_, i) => i !== index);
        });
    }, [addToast]);

    const updateQty = useCallback((index, delta) => {
        setCartItems(prev => {
            const updated = [...prev];
            const newQty = (updated[index].qty || 1) + delta;
            if (newQty <= 0) {
                addToast('info', updated[index].name, 'Removed from cart');
                return updated.filter((_, i) => i !== index);
            }
            updated[index] = { ...updated[index], qty: newQty };
            return updated;
        });
    }, [addToast]);

    // Empties the cart after a successful Stripe payment
    const clearCart = useCallback(() => {
        setCartItems([]);
        setCartOpen(false);
    }, []);

    const toggleCart = useCallback(() => setCartOpen(prev => !prev), []);
    const closeCart = useCallback(() => setCartOpen(false), []);

    const cartCount = cartItems.reduce((sum, i) => sum + (i.qty || 1), 0);
    const total = cartItems.reduce((sum, i) => sum + i.price * (i.qty || 1), 0);

    return (
        <CartContext.Provider value={{
            cartItems, cartOpen, cartCount, total,
            addToCart, removeFromCart, updateQty,
            clearCart, toggleCart, closeCart,
        }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const ctx = useContext(CartContext);
    if (!ctx) throw new Error('useCart must be used inside CartProvider');
    return ctx;
}