import React from 'react';
import { Box } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import AuthPromptDialog from '../components/shop/AuthPromptDialog';
import CartDrawer from '../components/shop/CartDrawer';
import CheckoutDialog from '../components/shop/CheckoutDialog';
import ProductCatalog from '../components/shop/ProductCatalog';
import ShopFooter from '../components/shop/ShopFooter';
import ShopHeader from '../components/shop/ShopHeader';
import ShopHero from '../components/shop/ShopHero';
import ShopNotice from '../components/shop/ShopNotice';
import WishlistDrawer from '../components/shop/WishlistDrawer';
import useShopPage from '../hooks/useShopPage';

const ShopPage = () => {
  const shop = useShopPage();
  const navigate = useNavigate();
  const location = useLocation();
  const contentColor = shop.darkMode ? '#EAF3FF' : '#0B2F5E';
  const surfaceColor = shop.darkMode ? '#0E2340' : '#FFFFFF';
  const pageColor = shop.darkMode ? '#061527' : '#F3F8FC';

  React.useEffect(() => {
    if (location.state?.checkoutAfterAdd) shop.setCheckoutOpen(true);
    if (location.state?.cartAfterAdd) shop.setCartOpen(true);
    if (!location.state?.checkoutAfterAdd && !location.state?.cartAfterAdd) return;
    navigate(location.pathname, { replace: true, state: null });
  }, [location.key, location.pathname, location.state, navigate, shop.setCartOpen, shop.setCheckoutOpen]);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: pageColor, color: contentColor, transition: 'background-color .2s ease' }}>
      <ShopHeader
        contentColor={contentColor}
        surfaceColor={surfaceColor}
        darkMode={shop.darkMode}
        isCustomer={shop.isCustomer}
        user={shop.user}
        query={shop.query}
        setQuery={shop.setQuery}
        setCurrentPage={shop.setCurrentPage}
        wishlistOpen={shop.wishlistOpen}
        wishlistCount={shop.wishlistItems.length}
        onOpenWishlist={shop.openWishlist}
        cartQuantity={shop.cartQuantity}
        onOpenCart={() => shop.setCartOpen(true)}
        onOpenProfile={() => navigate('/account')}
        onToggleDarkMode={() => shop.setDarkMode((value) => !value)}
        onSignIn={() => { window.location.href = '/'; }}
      />
      <ShopHero onShopProducts={() => document.getElementById('product-catalog')?.scrollIntoView({ behavior: 'smooth' })} />
      <ProductCatalog
        contentColor={contentColor}
        surfaceColor={surfaceColor}
        isCustomer={shop.isCustomer}
        setCurrentPage={shop.setCurrentPage}
        setFilterOpen={shop.setFilterOpen}
        filterOpen={shop.filterOpen}
        error={shop.error}
        loading={shop.loading}
        products={shop.products}
        customerWishlistProductIds={shop.customerWishlistProductIds}
        handleAddToCart={shop.handleAddToCart}
        handleWishlistToggle={shop.handleWishlistToggle}
        onOpenProduct={(product) => navigate(`/product/${product.id}`)}
        pageCount={shop.pageCount}
        currentPage={shop.currentPage}
        pageNumbers={shop.pageNumbers}
        activeFilterCount={shop.activeFilterCount}
        filterProps={{
          categories: shop.categories,
          selectedCategory: shop.selectedCategory,
          setSelectedCategory: shop.setSelectedCategory,
          setCurrentPage: shop.setCurrentPage,
          priceRange: shop.priceRange,
          setPriceRange: shop.setPriceRange,
          minimumRating: shop.minimumRating,
          setMinimumRating: shop.setMinimumRating,
          sort: shop.sort,
          setSort: shop.setSort,
          setQuery: shop.setQuery,
          setDebouncedQuery: shop.setDebouncedQuery,
          filterOpen: shop.filterOpen,
          setFilterOpen: shop.setFilterOpen,
          surfaceColor,
          contentColor,
        }}
      />
      <ShopFooter />
      <CartDrawer
        open={shop.cartOpen}
        onClose={() => shop.setCartOpen(false)}
        pageColor={pageColor}
        contentColor={contentColor}
        surfaceColor={surfaceColor}
        cartQuantity={shop.cartQuantity}
        cartItems={shop.cartItems}
        handleQuantityChange={shop.handleQuantityChange}
        cartSubtotal={shop.cartSubtotal}
        isCustomer={shop.isCustomer}
        onOpenAuth={() => shop.setAuthPromptOpen(true)}
        onOpenCheckout={() => shop.setCheckoutOpen(true)}
        clearCart={shop.clearCart}
      />
      <WishlistDrawer
        open={shop.wishlistOpen}
        onClose={() => shop.setWishlistOpen(false)}
        pageColor={pageColor}
        contentColor={contentColor}
        surfaceColor={surfaceColor}
        wishlistItems={shop.wishlistItems}
        onAddToCart={shop.handleAddToCart}
        onRemove={shop.handleWishlistToggle}
      />
      <AuthPromptDialog
        open={shop.authPromptOpen}
        onClose={() => shop.setAuthPromptOpen(false)}
        onLogin={() => { window.location.href = '/'; }}
      />
      <CheckoutDialog
        open={shop.checkoutOpen}
        onClose={() => shop.setCheckoutOpen(false)}
        handleCheckout={shop.handleCheckout}
        checkoutForm={shop.checkoutForm}
        setCheckoutForm={shop.setCheckoutForm}
        cartSubtotal={shop.cartSubtotal}
        cartItems={shop.cartItems}
      />
      <ShopNotice notice={shop.notice} onClose={() => shop.setNotice('')} />
    </Box>
  );
};

export default ShopPage;
