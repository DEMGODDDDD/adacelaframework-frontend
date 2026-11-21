import React from 'react';
import {
  Button,
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { currency } from './shopUtils';

const CheckoutDialog = ({ open, onClose, handleCheckout, checkoutForm, setCheckoutForm, cartSubtotal, cartItems }) => (
  <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
    <DialogTitle sx={{ fontWeight: 900 }}>Checkout</DialogTitle>
    <Box component="form" onSubmit={handleCheckout}>
      <DialogContent>
        <Stack spacing={2}>
          <TextField label="Full name" required value={checkoutForm.shipping_name} onChange={(event) => setCheckoutForm({ ...checkoutForm, shipping_name: event.target.value })} />
          <TextField label="Contact number" required value={checkoutForm.shipping_phone} onChange={(event) => setCheckoutForm({ ...checkoutForm, shipping_phone: event.target.value })} />
          <TextField label="Shipping address" required multiline minRows={2} value={checkoutForm.shipping_address} onChange={(event) => setCheckoutForm({ ...checkoutForm, shipping_address: event.target.value })} />
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField fullWidth label="City" value={checkoutForm.shipping_city} onChange={(event) => setCheckoutForm({ ...checkoutForm, shipping_city: event.target.value })} />
            <TextField fullWidth label="Province / State" value={checkoutForm.shipping_state} onChange={(event) => setCheckoutForm({ ...checkoutForm, shipping_state: event.target.value })} />
          </Stack>
          <TextField label="ZIP code" value={checkoutForm.shipping_zip} onChange={(event) => setCheckoutForm({ ...checkoutForm, shipping_zip: event.target.value })} />
          <FormControl fullWidth>
            <InputLabel id="payment-method-label">Payment method</InputLabel>
            <Select labelId="payment-method-label" label="Payment method" value={checkoutForm.payment_method} onChange={(event) => setCheckoutForm({ ...checkoutForm, payment_method: event.target.value })}>
              <MenuItem value="cod">Cash on Delivery</MenuItem>
              <MenuItem value="gcash">GCash</MenuItem>
              <MenuItem value="paypal">PayPal</MenuItem>
            </Select>
          </FormControl>
          <TextField label="Order notes (optional)" multiline minRows={2} value={checkoutForm.notes} onChange={(event) => setCheckoutForm({ ...checkoutForm, notes: event.target.value })} />
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Stack direction="row" sx={{ justifyContent: 'space-between' }}><Typography>Subtotal</Typography><Typography>{currency.format(cartSubtotal)}</Typography></Stack>
            <Stack direction="row" sx={{ justifyContent: 'space-between' }}><Typography>Shipping</Typography><Typography>{cartSubtotal >= 1000 ? 'Free' : currency.format(150)}</Typography></Stack>
            <Stack direction="row" sx={{ justifyContent: 'space-between' }}><Typography>VAT (12%)</Typography><Typography>{currency.format(cartSubtotal * 0.12)}</Typography></Stack>
            <Divider sx={{ my: 1 }} />
            <Stack direction="row" sx={{ justifyContent: 'space-between' }}><Typography fontWeight={900}>Estimated total</Typography><Typography fontWeight={900}>{currency.format(cartSubtotal + (cartSubtotal >= 1000 ? 0 : 150) + cartSubtotal * 0.12)}</Typography></Stack>
          </Paper>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button type="submit" variant="contained" disabled={!cartItems.length}>Place order</Button>
      </DialogActions>
    </Box>
  </Dialog>
);

export default CheckoutDialog;
