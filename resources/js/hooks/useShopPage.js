import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import api from '../services/api';
import authService from '../services/auth';
import { getProductPrice } from '../models/entities';

const GUEST_CART_KEY = 'demgodAquatics.guestCart.v1';
const PAGE_SIZE = 8;

const readGuestCart = () => {
  try {
    const storedItems = JSON.parse(localStorage.getItem(GUEST_CART_KEY) || '[]');
    return Array.isArray(storedItems) ? storedItems : [];
  } catch {
    localStorage.removeItem(GUEST_CART_KEY);
    return [];
  }
};

const getResponseData = (response) => response.data?.data ?? response.data;

const useShopPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [sort, setSort] = useState('latest');
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [minimumRating, setMinimumRating] = useState(0);
  const [filterOpen, setFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageCount, setPageCount] = useState(1);
  const [cartItems, setCartItems] = useState(readGuestCart);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [isCustomer, setIsCustomer] = useState(Boolean(authService.getToken()));
  const [user, setUser] = useState(() => authService.getUserFromStorage());
  const [cartOpen, setCartOpen] = useState(false);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [authPromptOpen, setAuthPromptOpen] = useState(false);
  const [checkoutForm, setCheckoutForm] = useState({
    shipping_name: '',
    shipping_phone: '',
    shipping_address: '',
    shipping_city: '',
    shipping_state: '',
    shipping_zip: '',
    shipping_country: 'Philippines',
    payment_method: 'cod',
    notes: '',
  });
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('demgodAquatics.theme') === 'dark');
  const cartMergeStarted = useRef(false);

  const customerWishlistProductIds = useMemo(
    () => new Set(wishlistItems.map((item) => Number(item.product_id ?? item.product?.id))),
    [wishlistItems],
  );
  const cartQuantity = cartItems.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  const cartSubtotal = cartItems.reduce(
    (sum, item) => sum + Number(item.quantity || 0) * getProductPrice(item.product),
    0,
  );

  const loadCart = useCallback(async () => {
    const response = await api.get('/cart');
    setCartItems(getResponseData(response)?.items || []);
  }, []);

  useEffect(() => {
    let active = true;

    const loadCatalog = async () => {
      setLoading(true);
      setError('');
      try {
        const params = {
          per_page: PAGE_SIZE,
          page: currentPage,
          sort,
        };
        params.min_price = priceRange[0];
        params.max_price = priceRange[1];
        params.min_rating = minimumRating;
        if (selectedCategory) params.category_id = selectedCategory;
        if (debouncedQuery) params.search = debouncedQuery;

        const productResponse = await api.get('/products', { params });
        if (!active) return;
        setProducts(getResponseData(productResponse) || []);
        setPageCount(Math.max(1, Number(productResponse.data?.meta?.last_page || 1)));
      } catch (requestError) {
        if (active) setError(requestError.response?.data?.message || 'Unable to load the product catalog.');
      } finally {
        if (active) setLoading(false);
      }
    };

    loadCatalog();
    return () => {
      active = false;
    };
  }, [currentPage, debouncedQuery, minimumRating, priceRange, selectedCategory, sort]);

  useEffect(() => {
    let active = true;

    api.get('/categories', { params: { per_page: 100 } })
      .then((response) => {
        if (active) setCategories(getResponseData(response) || []);
      })
      .catch((requestError) => {
        if (active) setError(requestError.response?.data?.message || 'Unable to load product categories.');
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQuery(query.trim()), 250);
    return () => window.clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    if (!authService.getToken() || cartMergeStarted.current) return;
    cartMergeStarted.current = true;
    let active = true;

    const initializeCustomer = async () => {
      try {
        const [cartResponse, wishlistResponse] = await Promise.all([
          api.get('/cart'),
          api.get('/wishlist', { params: { per_page: 50 } }),
        ]);
        if (!active) return;

        const profile = authService.getUserFromStorage() || {};
        setUser(profile);
        setIsCustomer(true);
        setWishlistItems(getResponseData(wishlistResponse) || []);
        setCartItems(getResponseData(cartResponse)?.items || []);

        const guestItems = readGuestCart();
        if (guestItems.length > 0) {
          for (let index = 0; index < guestItems.length; index += 1) {
            const item = guestItems[index];
            await api.post('/cart', { product_id: item.product.id, quantity: item.quantity });
            const remainingItems = guestItems.slice(index + 1);
            if (remainingItems.length > 0) {
              localStorage.setItem(GUEST_CART_KEY, JSON.stringify(remainingItems));
            } else {
              localStorage.removeItem(GUEST_CART_KEY);
            }
          }
          await loadCart();
        }
        setCheckoutForm((current) => ({
          ...current,
          shipping_name: profile.full_name || [profile.first_name, profile.last_name].filter(Boolean).join(' '),
          shipping_phone: profile.phone || '',
          shipping_address: profile.address || '',
        }));
      } catch (requestError) {
        if (active) setError(requestError.response?.data?.message || 'Unable to load your account shopping data.');
      }
    };

    initializeCustomer();
    return () => {
      active = false;
    };
  }, [loadCart]);

  useEffect(() => {
    document.documentElement.dataset.theme = darkMode ? 'dark' : 'light';
    localStorage.setItem('demgodAquatics.theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  const firstPage = Math.max(1, currentPage - 2);
  const lastPage = Math.min(pageCount, currentPage + 2);
  const pageNumbers = Array.from({ length: lastPage - firstPage + 1 }, (_, index) => firstPage + index);
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (selectedCategory) count += 1;
    if (priceRange[0] > 0 || priceRange[1] < 5000) count += 1;
    if (minimumRating > 0) count += 1;
    if (sort !== 'latest') count += 1;
    return count;
  }, [minimumRating, priceRange, selectedCategory, sort]);

  const updateGuestCart = (nextItems) => {
    setCartItems(nextItems);
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(nextItems));
  };

  const handleAddToCart = async (product) => {
    try {
      if (isCustomer) {
        await api.post('/cart', { product_id: product.id, quantity: 1 });
        await loadCart();
      } else {
        const existing = cartItems.find((item) => Number(item.product.id) === Number(product.id));
        if (existing) {
          const nextQuantity = Number(existing.quantity) + 1;
          if (nextQuantity > Number(product.stock_quantity)) {
            setNotice('There is not enough stock to add another item.');
            return;
          }
          updateGuestCart(cartItems.map((item) => (
            Number(item.product.id) === Number(product.id) ? { ...item, quantity: nextQuantity } : item
          )));
        } else {
          updateGuestCart([...cartItems, { id: product.id, product, quantity: 1 }]);
        }
      }
      setNotice(`${product.name} added to cart.`);
    } catch (requestError) {
      setNotice(requestError.response?.data?.message || 'Unable to add this product to your cart.');
    }
  };

  const handleQuantityChange = async (item, delta) => {
    const quantity = Number(item.quantity) + delta;
    try {
      if (quantity <= 0) {
        if (isCustomer) {
          await api.delete(`/cart/${item.id}`);
          await loadCart();
        } else {
          updateGuestCart(cartItems.filter((cartItem) => Number(cartItem.product.id) !== Number(item.product.id)));
        }
        return;
      }

      if (quantity > Number(item.product.stock_quantity)) {
        setNotice('Requested quantity exceeds available stock.');
        return;
      }
      if (isCustomer) {
        await api.put(`/cart/${item.id}`, { quantity });
        await loadCart();
      } else {
        updateGuestCart(cartItems.map((cartItem) => (
          Number(cartItem.product.id) === Number(item.product.id) ? { ...cartItem, quantity } : cartItem
        )));
      }
    } catch (requestError) {
      setNotice(requestError.response?.data?.message || 'Unable to update your cart.');
    }
  };

  const handleWishlistToggle = async (product) => {
    if (!isCustomer) {
      setAuthPromptOpen(true);
      return;
    }
    const current = wishlistItems.find(
      (item) => Number(item.product_id ?? item.product?.id) === Number(product.id),
    );
    try {
      if (current) {
        await api.delete(`/wishlist/${current.id}`);
        setWishlistItems((items) => items.filter((item) => Number(item.id) !== Number(current.id)));
      } else {
        const response = await api.post('/wishlist', { product_id: product.id });
        const wishlistItem = getResponseData(response);
        setWishlistItems((items) => (
          items.some((item) => Number(item.product_id ?? item.product?.id) === Number(product.id))
            ? items
            : [...items, wishlistItem]
        ));
      }
    } catch (requestError) {
      setNotice(requestError.response?.data?.message || 'Unable to update your wishlist.');
    }
  };

  const openWishlist = () => {
    if (!isCustomer) setAuthPromptOpen(true);
    else setWishlistOpen(true);
  };

  const handleCheckout = async (event) => {
    event.preventDefault();
    try {
      const response = await api.post('/orders', checkoutForm);
      const order = getResponseData(response);
      await loadCart();
      setCheckoutOpen(false);
      setCartOpen(false);
      setNotice(`Order ${order.order_number} placed successfully.`);
    } catch (requestError) {
      setNotice(requestError.response?.data?.message || 'Unable to place your order. Please check your details and stock.');
    }
  };

  const clearCart = async () => {
    try {
      if (isCustomer) {
        await api.delete('/cart');
        await loadCart();
      } else {
        updateGuestCart([]);
      }
    } catch (requestError) {
      setNotice(requestError.response?.data?.message || 'Unable to clear your cart.');
    }
  };

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (requestError) {
      if (requestError.response?.status !== 401) {
        setNotice(requestError.response?.data?.message || 'Could not contact the server to sign out.');
      }
    } finally {
      authService.clearAuth();
      window.location.href = '/';
    }
  };

  return {
    products,
    categories,
    loading,
    error,
    notice,
    setNotice,
    query,
    setQuery,
    setDebouncedQuery,
    selectedCategory,
    setSelectedCategory,
    sort,
    setSort,
    priceRange,
    setPriceRange,
    minimumRating,
    setMinimumRating,
    filterOpen,
    setFilterOpen,
    currentPage,
    setCurrentPage,
    pageCount,
    pageNumbers,
    activeFilterCount,
    cartItems,
    wishlistItems,
    isCustomer,
    user,
    cartOpen,
    setCartOpen,
    wishlistOpen,
    setWishlistOpen,
    checkoutOpen,
    setCheckoutOpen,
    authPromptOpen,
    setAuthPromptOpen,
    checkoutForm,
    setCheckoutForm,
    darkMode,
    setDarkMode,
    customerWishlistProductIds,
    cartQuantity,
    cartSubtotal,
    handleAddToCart,
    handleQuantityChange,
    handleWishlistToggle,
    openWishlist,
    handleCheckout,
    clearCart,
    handleLogout,
  };
};

export default useShopPage;
