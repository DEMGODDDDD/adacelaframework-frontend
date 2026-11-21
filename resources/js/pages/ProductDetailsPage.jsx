import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Breadcrumbs,
  Button,
  CircularProgress,
  Container,
  FormControl,
  IconButton,
  InputLabel,
  Link,
  MenuItem,
  Paper,
  Rating,
  Select,
  Snackbar,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  ArrowBack,
  Favorite,
  FavoriteBorder,
  ShoppingCartOutlined,
} from '@mui/icons-material';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import authService from '../services/auth';
import { getProductPrice } from '../models/entities';
import { currency, FALLBACK_IMAGE, getMediaUrl } from '../components/shop/shopUtils';

const GUEST_CART_KEY = 'demgodAquatics.guestCart.v1';
const getResponseData = (response) => response.data?.data ?? response.data;

const readGuestCart = () => {
  try {
    const value = JSON.parse(localStorage.getItem(GUEST_CART_KEY) || '[]');
    return Array.isArray(value) ? value : [];
  } catch {
    localStorage.removeItem(GUEST_CART_KEY);
    return [];
  }
};

const getProductImages = (product) => {
  const images = (product?.images || []).map((image) => getMediaUrl(image.image)).filter(Boolean);
  const primaryImage = getMediaUrl(product?.image);
  if (primaryImage && !images.includes(primaryImage)) images.unshift(primaryImage);
  return images.length ? images : [FALLBACK_IMAGE];
};

const ProductDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [isCustomer, setIsCustomer] = useState(() => authService.isCustomer());
  const [wishlistItem, setWishlistItem] = useState(null);
  const [eligibleOrders, setEligibleOrders] = useState([]);
  const [reviewOrderId, setReviewOrderId] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewError, setReviewError] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [cartSubmitting, setCartSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    setProduct(null);

    api.get(`/products/${id}`)
      .then((response) => {
        if (!active) return;
        const details = getResponseData(response);
        setProduct(details);
        setSelectedImage(getProductImages(details)[0]);
      })
      .catch((requestError) => {
        if (active) setError(requestError.response?.data?.message || 'Unable to load this product.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id]);

  useEffect(() => {
    let active = true;
    const customer = authService.isCustomer();
    setIsCustomer(customer);
    setWishlistItem(null);
    setEligibleOrders([]);
    if (!customer) return undefined;

    Promise.all([
      api.get('/wishlist', { params: { per_page: 100 } }),
      api.get('/orders', { params: { per_page: 100 } }),
    ])
      .then(([wishlistResponse, ordersResponse]) => {
        if (!active) return;
        const wishlist = getResponseData(wishlistResponse) || [];
        const orderList = getResponseData(ordersResponse) || [];
        setWishlistItem(wishlist.find((item) => Number(item.product_id) === Number(id)) || null);
        setEligibleOrders(orderList.filter((order) => (
          order.status === 'delivered'
          && order.items?.some((item) => Number(item.product_id) === Number(id))
        )));
      })
      .catch((requestError) => {
        if (active) {
          const message = requestError.response?.data?.message || 'Unable to load your wishlist or review eligibility.';
          setReviewError(message);
          setNotice(message);
        }
      });

    return () => {
      active = false;
    };
  }, [id]);

  const images = useMemo(() => getProductImages(product), [product]);
  const price = product ? getProductPrice(product) : 0;
  const stock = Number(product?.stock_quantity ?? 0);
  const hasStock = Boolean(product?.in_stock) && stock > 0;
  const reviews = product?.reviews || [];

  const addToCart = async () => {
    if (!product || !hasStock || cartSubmitting) return false;
    setCartSubmitting(true);
    try {
      if (isCustomer) {
        await api.post('/cart', { product_id: product.id, quantity: 1 });
      } else {
        const cart = readGuestCart();
        const existing = cart.find((item) => Number(item.product?.id) === Number(product.id));
        if (existing) {
          if (Number(existing.quantity) + 1 > stock) {
            setNotice('There is not enough stock to add another item.');
            return false;
          }
          existing.quantity = Number(existing.quantity) + 1;
        } else {
          cart.push({ id: product.id, product, quantity: 1 });
        }
        localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cart));
      }
      setNotice(`${product.name} added to cart.`);
      return true;
    } catch (requestError) {
      setNotice(requestError.response?.data?.message || 'Unable to add this product to your cart.');
      return false;
    } finally {
      setCartSubmitting(false);
    }
  };

  const toggleWishlist = async () => {
    if (!product) return;
    if (!isCustomer) {
      navigate('/', { state: { returnTo: location.pathname } });
      return;
    }
    try {
      if (wishlistItem) {
        await api.delete(`/wishlist/${wishlistItem.id}`);
        setWishlistItem(null);
        setNotice('Removed from your wishlist.');
      } else {
        const response = await api.post('/wishlist', { product_id: product.id });
        setWishlistItem(getResponseData(response));
        setNotice('Added to your wishlist.');
      }
    } catch (requestError) {
      setNotice(requestError.response?.data?.message || 'Unable to update your wishlist.');
    }
  };

  const buyNow = async () => {
    const added = await addToCart();
    if (added) {
      navigate('/shop', {
        state: isCustomer ? { checkoutAfterAdd: true } : { cartAfterAdd: true },
      });
    }
  };

  const submitReview = async (event) => {
    event.preventDefault();
    if (!product || !reviewOrderId || !isCustomer) return;
    setReviewSubmitting(true);
    setReviewError('');
    try {
      await api.post('/reviews', {
        product_id: product.id,
        order_id: reviewOrderId,
        rating: reviewRating,
        comment: reviewComment,
      });
      const response = await api.get(`/products/${id}`);
      setProduct(getResponseData(response));
      setReviewComment('');
      setNotice('Thank you. Your review has been submitted.');
    } catch (requestError) {
      setReviewError(requestError.response?.data?.message || 'Unable to submit your review.');
    } finally {
      setReviewSubmitting(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#F3F8FC', color: '#0B2F5E' }}>
      <Paper square elevation={0} sx={{ borderBottom: '1px solid #D9E7F3' }}>
        <Container maxWidth="xl">
          <Stack direction="row" sx={{ minHeight: 72, alignItems: 'center' }}>
            <Button
              startIcon={<ArrowBack />}
              onClick={() => navigate('/shop')}
              sx={{ fontWeight: 800 }}
            >
              Back to Shop
            </Button>
          </Stack>
        </Container>
      </Paper>

      <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 } }}>
        <Breadcrumbs sx={{ mb: 3 }}>
          <Link underline="hover" color="inherit" component="button" onClick={() => navigate('/shop')}>
            Shop
          </Link>
          <Typography color="text.primary">{product?.name || 'Product details'}</Typography>
        </Breadcrumbs>

        {loading ? (
          <Stack sx={{ minHeight: 360, alignItems: 'center', justifyContent: 'center' }}>
            <CircularProgress />
            <Typography sx={{ mt: 2 }}>Loading product details…</Typography>
          </Stack>
        ) : error ? (
          <Alert severity="error" action={<Button color="inherit" onClick={() => navigate('/shop')}>Back to shop</Button>}>
            {error}
          </Alert>
        ) : product && (
          <Stack spacing={4}>
            <Paper elevation={0} sx={{ p: { xs: 2, md: 3 }, border: '1px solid #D9E7F3', borderRadius: 3 }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1.05fr) minmax(0, .95fr)' }, gap: { xs: 3, md: 5 } }}>
                <Stack spacing={1.5} sx={{ minWidth: 0 }}>
                  <Box
                    component="img"
                    src={selectedImage || FALLBACK_IMAGE}
                    alt={product.name}
                    onError={(event) => {
                      event.currentTarget.onerror = null;
                      event.currentTarget.src = FALLBACK_IMAGE;
                    }}
                    sx={{
                      width: '100%',
                      aspectRatio: '1 / 1',
                      maxHeight: { md: 560 },
                      objectFit: 'contain',
                      bgcolor: '#EAF4FA',
                      borderRadius: 3,
                      transition: 'transform 220ms ease',
                      '&:hover': { transform: 'scale(1.025)' },
                    }}
                  />
                  {images.length > 1 && (
                    <Stack direction="row" spacing={1} sx={{ overflowX: 'auto', pb: 0.5 }}>
                      {images.map((image, index) => (
                        <Box
                          key={`${image}-${index}`}
                          component="button"
                          type="button"
                          aria-label={`View product image ${index + 1}`}
                          onClick={() => setSelectedImage(image)}
                          sx={{
                            flex: '0 0 76px',
                            width: 76,
                            height: 76,
                            p: 0,
                            border: selectedImage === image ? '2px solid #0B3C65' : '1px solid #D9E7F3',
                            borderRadius: 2,
                            overflow: 'hidden',
                            bgcolor: '#EAF4FA',
                            cursor: 'pointer',
                          }}
                        >
                          <Box component="img" src={image} alt="" sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </Box>
                      ))}
                    </Stack>
                  )}
                </Stack>

                <Stack spacing={2} sx={{ minWidth: 0 }}>
                  <Typography variant="overline" color="primary" fontWeight={800}>
                    {product.category?.name || product.brand || 'Aquatics'}
                  </Typography>
                  <Typography variant="h4" fontWeight={900}>{product.name}</Typography>
                  <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                    <Rating value={Number(product.average_rating || 0)} readOnly precision={0.5} />
                    <Typography variant="body2" color="text.secondary">
                      {Number(product.average_rating || 0).toFixed(1)} ({product.reviews_count || reviews.length} reviews)
                    </Typography>
                  </Stack>
                  <Typography variant="h5" color="primary" fontWeight={900}>{currency.format(price)}</Typography>
                  <Typography sx={{ whiteSpace: 'pre-line' }}>
                    {product.description || 'No product description is available.'}
                  </Typography>
                  <Alert severity={hasStock ? (stock <= 5 ? 'warning' : 'success') : 'error'} sx={{ alignSelf: 'flex-start' }}>
                    {!hasStock ? 'Out of stock' : stock <= 5 ? `Only ${stock} left in stock` : 'In stock'}
                  </Alert>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ pt: 1 }}>
                    <Tooltip title={wishlistItem ? 'Remove from wishlist' : 'Add to wishlist'}>
                      <span>
                        <IconButton
                          aria-label={wishlistItem ? 'Remove from wishlist' : 'Add to wishlist'}
                          onClick={toggleWishlist}
                          sx={{ border: '1px solid #B8D1E4', borderRadius: 2, alignSelf: { xs: 'flex-start', sm: 'auto' } }}
                        >
                          {wishlistItem ? <Favorite color="error" /> : <FavoriteBorder />}
                        </IconButton>
                      </span>
                    </Tooltip>
                    <Button
                      variant="outlined"
                      startIcon={<ShoppingCartOutlined />}
                      disabled={!hasStock || cartSubmitting}
                      onClick={addToCart}
                      sx={{ flex: 1, py: 1.25, fontWeight: 800 }}
                    >
                      {cartSubmitting ? 'Adding…' : 'Add to Cart'}
                    </Button>
                    <Button
                      variant="contained"
                      disabled={!hasStock || cartSubmitting}
                      onClick={buyNow}
                      sx={{ flex: 1, py: 1.25, fontWeight: 900 }}
                    >
                      Buy Now
                    </Button>
                  </Stack>
                </Stack>
              </Box>
            </Paper>

            <Box>
              <Typography variant="h5" fontWeight={900} sx={{ mb: 2 }}>Customer Reviews</Typography>
              {reviews.length === 0 ? (
                <Paper elevation={0} sx={{ p: 2.5, border: '1px solid #D9E7F3', borderRadius: 3 }}>
                  <Typography color="text.secondary">No reviews yet.</Typography>
                </Paper>
              ) : (
                <Stack spacing={1.5}>
                  {reviews.map((review) => (
                    <Paper key={review.id} elevation={0} sx={{ p: 2, border: '1px solid #D9E7F3', borderRadius: 3 }}>
                      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', minWidth: 0 }}>
                          <Avatar sx={{ width: 34, height: 34, bgcolor: '#1A9CC8', fontSize: 14 }}>
                            {(review.user?.full_name || 'C').slice(0, 1).toUpperCase()}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight={800}>{review.user?.full_name || 'Customer'}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {review.created_at ? new Date(review.created_at).toLocaleDateString() : ''}
                            </Typography>
                          </Box>
                        </Stack>
                        <Rating value={Number(review.rating)} readOnly size="small" />
                      </Stack>
                      {review.comment && <Typography sx={{ mt: 1 }}>{review.comment}</Typography>}
                      {review.admin_reply && (
                        <Box sx={{ mt: 1.5, ml: 2, pl: 1.5, borderLeft: '3px solid #22C7E0' }}>
                          <Typography variant="caption" fontWeight={800} color="primary.main">Store response</Typography>
                          <Typography variant="body2">{review.admin_reply}</Typography>
                        </Box>
                      )}
                    </Paper>
                  ))}
                </Stack>
              )}
              {isCustomer && eligibleOrders.some((order) => (
                !reviews.some((review) => Number(review.order_id) === Number(order.id))
              )) && (
                <Paper component="form" onSubmit={submitReview} elevation={0} sx={{ mt: 2, p: 2.5, border: '1px solid #D9E7F3', borderRadius: 3 }}>
                  <Typography variant="h6" fontWeight={900}>Review this product</Typography>
                  {reviewError && <Alert severity="error" sx={{ mt: 1 }}>{reviewError}</Alert>}
                  <Stack spacing={1.5} sx={{ mt: 2 }}>
                    <FormControl fullWidth size="small">
                      <InputLabel id="review-order-label">Delivered order</InputLabel>
                      <Select
                        labelId="review-order-label"
                        label="Delivered order"
                        value={reviewOrderId}
                        onChange={(event) => setReviewOrderId(event.target.value)}
                      >
                        {eligibleOrders
                          .filter((order) => !reviews.some((review) => Number(review.order_id) === Number(order.id)))
                          .map((order) => <MenuItem key={order.id} value={order.id}>{order.order_number}</MenuItem>)}
                      </Select>
                    </FormControl>
                    <Rating value={reviewRating} onChange={(_, value) => setReviewRating(value || 5)} />
                    <TextField
                      fullWidth
                      multiline
                      minRows={2}
                      label="Your review"
                      value={reviewComment}
                      onChange={(event) => setReviewComment(event.target.value)}
                    />
                    <Button type="submit" variant="contained" disabled={!reviewOrderId || reviewSubmitting} sx={{ alignSelf: 'flex-start' }}>
                      {reviewSubmitting ? 'Submitting…' : 'Submit Review'}
                    </Button>
                  </Stack>
                </Paper>
              )}
            </Box>
          </Stack>
        )}
      </Container>
      <Snackbar open={Boolean(notice)} autoHideDuration={4000} onClose={() => setNotice('')}>
        <Alert severity="info" onClose={() => setNotice('')} sx={{ width: '100%' }}>{notice}</Alert>
      </Snackbar>
    </Box>
  );
};

export default ProductDetailsPage;
