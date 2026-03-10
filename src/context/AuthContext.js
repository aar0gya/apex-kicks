// apex-kicks/src/context/AuthContext.js
// Wraps Clerk and syncs the signed-in user to our backend DB.
// getToken() is wrapped to always return a fresh JWT for API calls.
//
// Change from previous version:
//   logout(opts) now accepts an optional { redirectUrl } param.
//   Pass { redirectUrl: window.location.href } to sign out in place
//   (no page navigation). Default (no args) still redirects to '/'.

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useUser, useAuth as useClerkAuth, useClerk } from '@clerk/clerk-react';
import api from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const { isLoaded, isSignedIn, user: clerkUser } = useUser();
    const { getToken: clerkGetToken } = useClerkAuth();
    const { signOut } = useClerk();

    const [backendUser, setBackendUser] = useState(null);

    // Wrap getToken to always fetch a fresh JWT
    const getToken = useCallback(async () => {
        try {
            const token = await clerkGetToken({ skipCache: true });
            return token;
        } catch (err) {
            console.warn('[AuthContext] getToken failed:', err.message);
            return null;
        }
    }, [clerkGetToken]);

    // Sync to backend whenever the signed-in user changes
    useEffect(() => {
        if (!isLoaded) return;
        if (isSignedIn && clerkUser) {
            syncToBackend();
        } else {
            setBackendUser(null);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isLoaded, isSignedIn, clerkUser?.id]);

    const syncToBackend = useCallback(async () => {
        try {
            const token = await getToken();
            if (!token) return;
            const result = await api.post('/users/sync', {
                email: clerkUser.primaryEmailAddress?.emailAddress,
                name: clerkUser.fullName || clerkUser.firstName || '',
                avatar: clerkUser.imageUrl,
            }, token);
            if (result?.user) setBackendUser(result.user);
        } catch (err) {
            console.warn('[AuthContext] Backend sync failed:', err.message);
        }
    }, [clerkUser, getToken]);

    // logout(opts) — opts.redirectUrl controls where Clerk sends the user after sign-out.
    //   logout()                          → redirects to '/' (normal sign-out)
    //   logout({ redirectUrl: loc.href }) → stays on current page (for account switching)
    const logout = useCallback(async (opts = {}) => {
        const redirectUrl = opts.redirectUrl ?? '/';
        await signOut({ redirectUrl });
        setBackendUser(null);
    }, [signOut]);

    const user = isSignedIn && clerkUser
        ? {
            id: clerkUser.id,
            name: clerkUser.fullName || clerkUser.firstName || 'Member',
            email: clerkUser.primaryEmailAddress?.emailAddress || '',
            avatar: clerkUser.imageUrl,
            ...backendUser,
        }
        : null;

    return (
        <AuthContext.Provider value={{ user, isLoggedIn: !!user, isLoaded, getToken, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
    return ctx;
}