import React from 'react';
import { Alert, Snackbar } from '@mui/material';

const ShopNotice = ({ notice, onClose }) => (
  <Snackbar open={Boolean(notice)} autoHideDuration={4500} onClose={onClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
    <Alert onClose={onClose} severity="info" variant="filled" sx={{ width: '100%' }}>{notice}</Alert>
  </Snackbar>
);

export default ShopNotice;
