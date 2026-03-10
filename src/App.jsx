// apex-kicks/src/App.jsx
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { ClerkProvider, SignIn, SignUp, useClerk } from '@clerk/clerk-react';

import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';

import Cursor from './components/ui/Cursor';
import ToastContainer from './components/ui/Toast';
import Navbar from './components/layout/Navbar';
import CartDrawer from './components/layout/CartDrawer';
import Footer from './components/layout/Footer';

import HomePage from './pages/HomePage';
import CollectionPage from './pages/CollectionPage';
import DropsPage from './pages/DropsPage';
import CollabPage from './pages/CollabPage';
import StoriesPage from './pages/StoriesPage';
import AboutPage from './pages/AboutPage';
import ProductDetailPage from './pages/ProductDetailPage';
import ProfilePage from './pages/ProfilePage';
import WishlistPage from './pages/WishlistPage';
import CheckoutPage from './pages/CheckoutPage';
import AdminDashboard from './pages/AdminDashboard';

const CLERK_KEY = process.env.REACT_APP_CLERK_PUBLISHABLE_KEY;

// Shared Clerk appearance that matches the APEX dark theme
const clerkAppearance = {
  variables: {
    colorPrimary: '#ff2200',
    colorBackground: '#111111',
    colorText: '#ffffff',
    colorTextSecondary: 'rgba(255,255,255,0.5)',
    colorInputBackground: '#1a1a1a',
    colorInputText: '#ffffff',
    borderRadius: '4px',
    fontFamily: "'Barlow', sans-serif",
  },
  elements: {
    card: {
      border: '1px solid rgba(255,255,255,0.08)',
      boxShadow: '0 32px 80px rgba(0,0,0,0.8)',
      background: '#111111',
    },
    headerTitle: {
      fontFamily: "'Bebas Neue', sans-serif",
      fontSize: 28,
      letterSpacing: '0.06em',
      color: '#ffffff',
    },
    headerSubtitle: { color: 'rgba(255,255,255,0.45)' },
    socialButtonsBlockButton: { border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.04)' },
    formButtonPrimary: {
      background: '#ff2200',
      fontFamily: "'Barlow Condensed', sans-serif",
      fontWeight: 700,
      letterSpacing: '0.12em',
      fontSize: 14,
    },
    footerActionLink: { color: '#ff2200' },
    formFieldLabel: { color: 'rgba(255,255,255,0.6)', fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: '0.1em', fontSize: 11 },
    identityPreviewText: { color: 'rgba(255,255,255,0.7)' },
  },
};

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }); }, [pathname]);
  return null;
}

function ClerkSignInPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#080808', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, paddingTop: 88 }}>
      <SignIn routing="path" path="/sign-in" signUpUrl="/sign-up" afterSignInUrl="/profile" appearance={clerkAppearance} />
    </div>
  );
}

// ── ClerkSignUpPage — handles "add another account" flow ─────────────────────
// When the Navbar sets sessionStorage item 'apex_add_account', we sign out the
// current Clerk session BEFORE rendering the sign-up form so the user starts
// fresh without being redirected away by Clerk's existing-session detection.
function ClerkSignUpPage() {
  const { signOut } = useClerk();

  useEffect(() => {
    const needsSignOut = sessionStorage.getItem('apex_add_account');
    if (!needsSignOut) return;
    sessionStorage.removeItem('apex_add_account');
    signOut({ redirectUrl: '/sign-up' }).catch(() => { });
  }, [signOut]);

  return (
    <div style={{ minHeight: '100vh', background: '#080808', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, paddingTop: 88 }}>
      <SignUp routing="path" path="/sign-up" signInUrl="/sign-in" afterSignUpUrl="/profile" appearance={clerkAppearance} />
    </div>
  );
}

function AuthRedirect() {
  const navigate = useNavigate();
  const { search } = useLocation();
  useEffect(() => {
    const mode = new URLSearchParams(search).get('mode');
    navigate(mode === 'login' ? '/sign-in' : '/sign-up', { replace: true });
  }, [navigate, search]); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}

function AppShell() {
  const { pathname } = useLocation();
  const isAuthPage = pathname.startsWith('/sign-in') || pathname.startsWith('/sign-up');

  return (
    <ToastProvider>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <ScrollToTop />
            <Cursor />

            {!isAuthPage && <Navbar />}

            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/collection" element={<CollectionPage />} />
              <Route path="/drops" element={<DropsPage />} />
              <Route path="/collab" element={<CollabPage />} />
              <Route path="/stories" element={<StoriesPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/product/:id" element={<ProductDetailPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/wishlist" element={<WishlistPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/sign-in/*" element={<ClerkSignInPage />} />
              <Route path="/sign-up/*" element={<ClerkSignUpPage />} />
              <Route path="/auth" element={<AuthRedirect />} />
              <Route path="*" element={<HomePage />} />
            </Routes>

            {!isAuthPage && <Footer />}
            {!isAuthPage && <CartDrawer />}
            <ToastContainer />
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </ToastProvider>
  );
}

export default function App() {
  return (
    <ClerkProvider
      publishableKey={CLERK_KEY}
      afterSignOutUrl="/"
    >
      <BrowserRouter>
        <AppShell />
      </BrowserRouter>
    </ClerkProvider>
  );
}