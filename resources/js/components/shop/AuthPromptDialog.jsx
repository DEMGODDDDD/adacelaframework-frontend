import React from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';

const AuthPromptDialog = ({ open, onClose, onLogin }) => (
  <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
    <DialogTitle sx={{ fontWeight: 900 }}>Sign in to continue</DialogTitle>
    <DialogContent>
      <Typography color="text.secondary">
        Create an account or sign in to use your wishlist and checkout. Your guest cart is saved on this device and will be merged after sign-in.
      </Typography>
    </DialogContent>
    <DialogActions sx={{ px: 3, pb: 2.5 }}>
      <Button onClick={onClose}>Keep browsing</Button>
      <Button variant="contained" onClick={onLogin}>Login / Register</Button>
    </DialogActions>
  </Dialog>
);

export default AuthPromptDialog;
