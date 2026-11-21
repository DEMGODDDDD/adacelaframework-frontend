import React from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { currency } from './shopUtils';

const OrdersDialog = ({ open, onClose, orders, onOpenProduct }) => (
  <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
    <DialogTitle sx={{ fontWeight: 900 }}>Your Order History</DialogTitle>
    <DialogContent dividers>
      {orders.length === 0 ? (
        <Typography color="text.secondary">Your placed orders will appear here.</Typography>
      ) : (
        <Stack spacing={2}>
          {orders.map((order) => (
            <Paper key={order.id} variant="outlined" sx={{ p: 2 }}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ justifyContent: 'space-between' }}>
                <Box>
                  <Typography fontWeight={900}>{order.order_number}</Typography>
                  <Typography variant="body2" color="text.secondary">{new Date(order.created_at).toLocaleDateString()} · {order.status}</Typography>
                </Box>
                <Typography fontWeight={900}>{currency.format(Number(order.total))}</Typography>
              </Stack>
              <Divider sx={{ my: 1.25 }} />
              {(order.items || []).map((item) => (
                <Stack key={item.id} direction="row" spacing={1} sx={{ py: 0.5, justifyContent: 'space-between', alignItems: 'center' }}>
                  <Button color="inherit" onClick={() => onOpenProduct(item.product)} sx={{ textTransform: 'none', justifyContent: 'flex-start' }}>
                    {item.product?.name || 'Product'} × {item.quantity}
                  </Button>
                  <Typography variant="body2">{currency.format(Number(item.total))}</Typography>
                </Stack>
              ))}
              {order.status === 'delivered' && <Typography variant="caption" color="success.main">Select a product above to leave a review.</Typography>}
            </Paper>
          ))}
        </Stack>
      )}
    </DialogContent>
    <DialogActions><Button onClick={onClose}>Close</Button></DialogActions>
  </Dialog>
);

export default OrdersDialog;
