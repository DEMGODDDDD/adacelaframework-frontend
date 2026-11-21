import React from 'react';
import {
  AppBar,
  Avatar,
  Badge,
  Box,
  Container,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  AccountCircleOutlined,
  FavoriteBorder,
  Search,
  ShoppingCartOutlined,
} from '@mui/icons-material';

const ShopHeader = ({
  contentColor,
  surfaceColor,
  darkMode,
  isCustomer,
  user,
  query,
  setQuery,
  setCurrentPage,
  wishlistOpen,
  wishlistCount,
  onOpenWishlist,
  cartQuantity,
  onOpenCart,
  onOpenProfile,
  onToggleDarkMode,
  onSignIn,
}) => (
  <AppBar position="sticky" elevation={0} sx={{ bgcolor: surfaceColor, color: contentColor, borderBottom: '1px solid #D9E7F3' }}>
    <Container maxWidth="xl" disableGutters>
      <Toolbar sx={{ gap: { xs: 1, md: 2 }, px: { xs: 2, md: 3 }, py: 1, alignItems: 'center', flexWrap: { xs: 'wrap', md: 'nowrap' } }}>
        <Stack direction="row" spacing={1} sx={{ flex: '0 0 auto', alignItems: 'center' }}>
          <Avatar src="/images/dem-aqua-mark.png" alt="Dem Aqua" sx={{ width: 42, height: 42, bgcolor: '#22C7E0' }} />
          {isCustomer && (
            <Typography variant="body2" sx={{ fontWeight: 800, color: 'inherit', whiteSpace: 'nowrap' }}>
              Welcome, {user?.first_name || 'Aquarist'}
            </Typography>
          )}
        </Stack>
        <Box sx={{ order: { xs: 3, md: 0 }, flex: { xs: '1 0 100%', md: '1 1 0' }, minWidth: 0, display: 'flex', justifyContent: 'center' }}>
          <TextField
            fullWidth
            size="small"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search fish, tanks, equipment..."
            sx={{
              width: '100%',
              maxWidth: 600,
              '& .MuiOutlinedInput-root': { borderRadius: 3, bgcolor: darkMode ? '#132C4A' : '#F3F8FC' },
            }}
            slotProps={{
              input: {
                startAdornment: <InputAdornment position="start"><Search sx={{ color: darkMode ? '#B8CCE0' : '#36536E' }} /></InputAdornment>,
              },
              htmlInput: { 'aria-label': 'Search products' },
            }}
          />
        </Box>
        <Stack direction="row" spacing={{ xs: 0, md: 1 }} sx={{ order: { xs: 2, md: 0 }, ml: { xs: 'auto', md: 0 }, alignItems: 'center', justifyContent: 'flex-end', flex: '0 0 auto' }}>
          <Tooltip title="Wishlist">
            <IconButton aria-label="Wishlist" onClick={onOpenWishlist} sx={{ color: wishlistOpen ? '#FF5C5C' : 'inherit', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
              <Badge badgeContent={wishlistCount} color="error"><FavoriteBorder /></Badge>
            </IconButton>
          </Tooltip>
          <Tooltip title="Shopping cart">
            <IconButton aria-label="Shopping cart" onClick={onOpenCart} sx={{ color: 'inherit', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
              <Badge badgeContent={cartQuantity} color="primary"><ShoppingCartOutlined /></Badge>
            </IconButton>
          </Tooltip>
          {isCustomer ? (
            <Tooltip title="Account and Orders">
              <IconButton
                aria-label="Open profile"
                onClick={onOpenProfile}
                sx={{ color: 'inherit', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <AccountCircleOutlined />
              </IconButton>
            </Tooltip>
          ) : (
            <Tooltip title="Sign in">
              <IconButton aria-label="Sign in" onClick={onSignIn} sx={{ color: 'inherit' }}>
                <AccountCircleOutlined />
              </IconButton>
            </Tooltip>
          )}
          <IconButton aria-label="Toggle dark theme" size="small" onClick={onToggleDarkMode} sx={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography component="span" sx={{ color: '#1565D8', fontSize: 20 }}>{darkMode ? '☀' : '◐'}</Typography>
          </IconButton>
        </Stack>
      </Toolbar>
    </Container>
  </AppBar>
);

export default ShopHeader;
