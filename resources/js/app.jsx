import React, { lazy, Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider, CssBaseline, GlobalStyles } from '@mui/material';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import '../css/app.css';
import theme from './theme/theme';

const ShopPage = lazy(() => import('./pages/ShopPage'));
const AccountPage = lazy(() => import('./pages/AccountPage'));
const ProductDetailsPage = lazy(() => import('./pages/ProductDetailsPage'));
const WelcomePage = lazy(() => import('./pages/WelcomePage'));
const AdminManagementPage = lazy(() => import('./pages/AdminManagementPage'));

class AppErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Application render failed:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <main style={{ minHeight: '100vh', display: 'grid', placeContent: 'center', gap: 16, padding: 24, textAlign: 'center', fontFamily: 'sans-serif' }}>
          <h1>We couldn’t load your Demgod Aquatics page.</h1>
          <p>Please reload the page or return to sign in.</p>
          <div>
            <button type="button" onClick={() => window.location.reload()}>Reload page</button>
            {' '}
            <a href="/">Return to sign in</a>
          </div>
        </main>
      );
    }

    return this.props.children;
  }
}

const globalStyles = (theme) => ({
  '*': {
    margin: 0,
    padding: 0,
    boxSizing: 'border-box',
    scrollbarWidth: 'thin',
    scrollbarColor: 'rgba(26, 156, 200, 0.32) transparent',
  },
  html: {
    scrollBehavior: 'smooth',
    WebkitFontSmoothing: 'antialiased',
    MozOsxFontSmoothing: 'grayscale',
  },
  body: {
    fontFamily: theme.typography.fontFamily,
    backgroundColor: theme.palette.background.default,
    color: theme.palette.text.primary,
    minHeight: '100vh',
  },
  '#root': {
    minHeight: '100vh',
  },
  '::selection': {
    backgroundColor: theme.palette.secondary.light,
    color: theme.palette.primary.main,
  },
  '::-webkit-scrollbar': {
    width: 5,
    height: 5,
  },
  '::-webkit-scrollbar-track': {
    background: 'transparent',
  },
  '::-webkit-scrollbar-thumb': {
    background: 'linear-gradient(180deg, rgba(26, 156, 200, 0.32), rgba(39, 174, 210, 0.32))',
    borderRadius: 999,
    '&:hover': {
      background: 'linear-gradient(180deg, rgba(11, 60, 101, 0.48), rgba(26, 156, 200, 0.48))',
    },
  },
  '::-webkit-scrollbar-corner': {
    background: 'transparent',
  },
  '@keyframes float': {
    '0%, 100%': { transform: 'translateY(0) translateX(0)' },
    '50%': { transform: 'translateY(-20px) translateX(10px)' },
  },
  '@keyframes floatReverse': {
    '0%, 100%': { transform: 'translateY(0) translateX(0)' },
    '50%': { transform: 'translateY(20px) translateX(-10px)' },
  },
  '@keyframes bubble': {
    '0%': { transform: 'translateY(100vh) scale(0)', opacity: 0 },
    '10%': { opacity: 0.6 },
    '90%': { opacity: 0.3 },
    '100%': { transform: 'translateY(-100vh) scale(1)', opacity: 0 },
  },
  '@keyframes wave': {
    '0%, 100%': { transform: 'translateX(0)' },
    '50%': { transform: 'translateX(-20px)' },
  },
  '@keyframes swim': {
    '0%, 100%': { transform: 'translateX(0) rotate(0deg)' },
    '25%': { transform: 'translateX(15px) rotate(3deg)' },
    '75%': { transform: 'translateX(-15px) rotate(-3deg)' },
  },
  '@keyframes pulse': {
    '0%, 100%': { opacity: 0.3, transform: 'scale(1)' },
    '50%': { opacity: 0.6, transform: 'scale(1.05)' },
  },
  '@keyframes shimmer': {
    '0%': { backgroundPosition: '-200% 0' },
    '100%': { backgroundPosition: '200% 0' },
  },
  '@keyframes spin': {
    '0%': { transform: 'rotate(0deg)' },
    '100%': { transform: 'rotate(360deg)' },
  },
});

const App = () => (
  <AppErrorBoundary>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <GlobalStyles styles={globalStyles} />
      <BrowserRouter>
        <Suspense fallback={<div role="status">Loading Demgod Aquatics...</div>}>
          <Routes>
            <Route path="/" element={<WelcomePage />} />
            <Route path="/shop" element={<ShopPage />} />
            <Route path="/customer" element={<ShopPage />} />
            <Route path="/account" element={<AccountPage />} />
            <Route path="/profile" element={<AccountPage />} />
            <Route path="/product/:id" element={<ProductDetailsPage />} />
            <Route path="/admin/*" element={<AdminManagementPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ThemeProvider>
  </AppErrorBoundary>
);

const root = document.getElementById('root');

if (root) {
  ReactDOM.createRoot(root).render(<App />);
}