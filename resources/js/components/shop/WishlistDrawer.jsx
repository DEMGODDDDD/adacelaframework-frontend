import React from 'react';
import {
  Box,
  Button,
  Divider,
  Drawer,
  IconButton,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import {
  AddShoppingCart,
  Close,
  DeleteOutlineOutlined,
  FavoriteBorder,
} from '@mui/icons-material';
import { getProductPrice } from '../../models/entities';
import { currency, FALLBACK_IMAGE, getMediaUrl } from './shopUtils';

const WishlistDrawer = ({
  open,
  onClose,
  pageColor,
  contentColor,
  surfaceColor,
  wishlistItems,
  onAddToCart,
  onRemove,
}) => (
  <Drawer anchor="right" open={open} onClose={onClose}>
    <Box sx={{ width: { xs: '100vw', sm: 420 }, maxWidth: '100vw', p: 2.5, bgcolor: pageColor, color: contentColor, minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h5" fontWeight={900}>Your Wishlist</Typography>
          <Typography variant="body2" color="text.secondary">
            {wishlistItems.length} saved item{wishlistItems.length === 1 ? '' : 's'}
          </Typography>
        </Box>
        <IconButton aria-label="Close wishlist" onClick={onClose}><Close /></IconButton>
      </Stack>
      <Divider sx={{ my: 2 }} />
      <Box sx={{ flex: 1, overflowY: 'auto' }}>
        {wishlistItems.length === 0 ? (
          <Paper elevation={0} sx={{ p: 3, textAlign: 'center', bgcolor: surfaceColor, borderRadius: 3 }}>
            <FavoriteBorder sx={{ fontSize: 42, color: '#7890A7' }} />
            <Typography fontWeight={800} sx={{ mt: 1 }}>Your wishlist is empty</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Tap the heart on a product to save it here.
            </Typography>
          </Paper>
        ) : wishlistItems.map((item) => {
          const product = item.product;
          if (!product) return null;

          return (
            <Stack key={item.id} direction="row" spacing={1.5} sx={{ py: 1.5, alignItems: 'center', borderBottom: '1px solid #D9E7F3' }}>
              <Box
                component="img"
                src={getMediaUrl(product.image || product.images?.[0]?.image) || FALLBACK_IMAGE}
                alt={product.name}
                sx={{ width: 68, height: 68, objectFit: 'cover', borderRadius: 2 }}
              />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="body2" fontWeight={800} noWrap>{product.name}</Typography>
                <Typography variant="body2" sx={{ color: '#1565D8', fontWeight: 800 }}>
                  {currency.format(getProductPrice(product))}
                </Typography>
                <Button
                  size="small"
                  variant="contained"
                  startIcon={<AddShoppingCart />}
                  disabled={Number(product.stock_quantity) <= 0}
                  onClick={() => onAddToCart(product)}
                  sx={{ mt: 0.75, fontWeight: 800 }}
                >
                  Add to Cart
                </Button>
              </Box>
              <IconButton
                size="small"
                aria-label={`Remove ${product.name} from wishlist`}
                onClick={() => onRemove(product)}
              >
                <DeleteOutlineOutlined />
              </IconButton>
            </Stack>
          );
        })}
      </Box>
    </Box>
  </Drawer>
);

export default WishlistDrawer;
