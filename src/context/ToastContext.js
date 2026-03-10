import { createContext, useContext, useState, useCallback } from 'react';

const defaultValue = {
    toasts: [],
    addToast: () => { },
    removeToast: () => { },
};

const ToastContext = createContext(defaultValue);

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((type, title, message) => {
        const id = Date.now() + Math.random();
        setToasts(prev => [...prev, { id, type, title, message }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 3500);
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
            {children}
        </ToastContext.Provider>
    );
}

// Returns stable addToast function — safe to use inside other providers
export function useToast() {
    const ctx = useContext(ToastContext);
    return ctx.addToast;
}

// Returns toasts array + removeToast for the container
export function useToasts() {
    const ctx = useContext(ToastContext);
    return { toasts: ctx.toasts, removeToast: ctx.removeToast };
}