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
  Add,
  Close,
  DeleteOutlineOutlined,
  Remove,
  ShoppingCartOutlined,
} from '@mui/icons-material';
import { getProductPrice } from '../../models/entities';
import { currency, FALLBACK_IMAGE, getMediaUrl } from './shopUtils';

const CartDrawer = ({
  open,
  onClose,
  pageColor,
  contentColor,
  surfaceColor,
  cartQuantity,
  cartItems,
  handleQuantityChange,
  cartSubtotal,
  isCustomer,
  onOpenAuth,
  onOpenCheckout,
  clearCart,
}) => (
  <Drawer anchor="right" open={open} onClose={onClose}>
    <Box sx={{ width: { xs: '100vw', sm: 420 }, maxWidth: '100vw', p: 2.5, bgcolor: pageColor, color: contentColor, minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h5" fontWeight={900}>Your Cart</Typography>
          <Typography variant="body2" color="text.secondary">{cartQuantity} item{cartQuantity === 1 ? '' : 's'}</Typography>
        </Box>
        <IconButton aria-label="Close cart" onClick={onClose}><Close /></IconButton>
      </Stack>
      <Divider sx={{ my: 2 }} />
      <Box sx={{ flex: 1, overflowY: 'auto' }}>
        {cartItems.length === 0 ? (
          <Paper elevation={0} sx={{ p: 3, textAlign: 'center', bgcolor: surfaceColor, borderRadius: 3 }}>
            <ShoppingCartOutlined sx={{ fontSize: 42, color: '#7890A7' }} />
            <Typography fontWeight={800} sx={{ mt: 1 }}>Your cart is empty</Typography>
          </Paper>
        ) : cartItems.map((item) => (
          <Stack key={item.id ?? item.product.id} direction="row" spacing={1.5} sx={{ py: 1.5, alignItems: 'center', borderBottom: '1px solid #D9E7F3' }}>
            <Box component="img" src={getMediaUrl(item.product.image || item.product.images?.[0]?.image) || FALLBACK_IMAGE} alt="" sx={{ width: 68, height: 68, objectFit: 'cover', borderRadius: 2 }} />
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="body2" fontWeight={800} noWrap>{item.product.name}</Typography>
              <Typography variant="body2" sx={{ color: '#1565D8', fontWeight: 800 }}>{currency.format(getProductPrice(item.product))}</Typography>
              <Stack direction="row" spacing={0.5} sx={{ mt: 0.5, alignItems: 'center' }}>
                <IconButton size="small" aria-label="Decrease quantity" onClick={() => handleQuantityChange(item, -1)}><Remove fontSize="small" /></IconButton>
                <Typography variant="body2" fontWeight={800}>{item.quantity}</Typography>
                <IconButton size="small" aria-label="Increase quantity" onClick={() => handleQuantityChange(item, 1)}><Add fontSize="small" /></IconButton>
              </Stack>
            </Box>
            <IconButton size="small" aria-label="Remove from cart" onClick={() => handleQuantityChange(item, -Number(item.quantity))}>
              <DeleteOutlineOutlined />
            </IconButton>
          </Stack>
        ))}
      </Box>
      <Divider sx={{ my: 2 }} />
      <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
        <Typography fontWeight={800}>Subtotal</Typography>
        <Typography fontWeight={900}>{currency.format(cartSubtotal)}</Typography>
      </Stack>
      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>Shipping and tax are calculated at checkout.</Typography>
      <Button
        fullWidth
        variant="contained"
        disabled={cartItems.length === 0}
        onClick={() => {
          if (!isCustomer) onOpenAuth();
          else onOpenCheckout();
        }}
        sx={{ mt: 2, py: 1.25, fontWeight: 900 }}
      >
        Proceed to Checkout
      </Button>
      <Button color="inherit" onClick={clearCart} disabled={!cartItems.length} sx={{ mt: 1 }}>Clear cart</Button>
    </Box>
  </Drawer>
);

export default CartDrawer;
