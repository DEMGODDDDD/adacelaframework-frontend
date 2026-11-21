import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Divider,
  Fade,
  IconButton,
  Paper,
  Stack,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  AccountCircleOutlined,
  ArrowBack,
  CloudUpload,
  EditOutlined,
  History,
  Logout,
  Save,
  ShoppingBagOutlined,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import authService from '../services/auth';
import ProfilePhotoCropDialog from '../components/shop/ProfilePhotoCropDialog';
import { currency, getAvatarUrl } from '../components/shop/shopUtils';

const getResponseData = (response) => response.data?.data ?? response.data;

const sections = [
  { id: 'profile', label: 'Profile settings', icon: <AccountCircleOutlined /> },
  { id: 'purchases', label: 'My Purchases', icon: <ShoppingBagOutlined /> },
  { id: 'cancelled', label: 'Cancelled', icon: <History /> },
  { id: 'returns', label: 'Return / Refund', icon: <History /> },
];

const orderStatusFilters = [
  { id: 'all', label: 'All orders' },
  { id: 'pending', label: 'To Pay' },
  { id: 'processing', label: 'To Ship' },
  { id: 'shipped', label: 'To Receive' },
  { id: 'delivered', label: 'To Rate' },
];

const statusColors = {
  pending: 'warning',
  processing: 'info',
  shipped: 'primary',
  delivered: 'success',
  cancelled: 'default',
  return_refund: 'warning',
};

const getInitialProfileForm = () => {
  const profile = authService.getUserFromStorage() || {};
  return {
    first_name: profile.first_name || '',
    last_name: profile.last_name || '',
    email: profile.email || '',
    phone: profile.phone || '',
  };
};

const AccountPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => authService.getUserFromStorage());
  const [orders, setOrders] = useState([]);
  const [activeSection, setActiveSection] = useState('profile');
  const [activeOrderStatus, setActiveOrderStatus] = useState('all');
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(true);
  const [ordersError, setOrdersError] = useState('');
  const [profileLoadError, setProfileLoadError] = useState('');
  const [form, setForm] = useState(getInitialProfileForm);
  const [avatarFile, setAvatarFile] = useState(null);
  const [cropSourceFile, setCropSourceFile] = useState(null);
  const [avatarRemoved, setAvatarRemoved] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [saving, setSaving] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [notice, setNotice] = useState('');

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate('/', { replace: true });
      return undefined;
    }

    let active = true;
    const loadAccount = async () => {
      setProfileLoading(true);
      setOrdersLoading(true);
      const results = await Promise.allSettled([
        authService.getUser(),
        api.get('/orders', { params: { per_page: 100 } }),
      ]);
      if (!active) return;

      const [profileResult, ordersResult] = results;
      if (profileResult.status === 'fulfilled') {
        const currentUser = getResponseData({ data: profileResult.value });
        setUser(currentUser);
        setForm({
          first_name: currentUser?.first_name || '',
          last_name: currentUser?.last_name || '',
          email: currentUser?.email || '',
          phone: currentUser?.phone || '',
        });
        authService.storeAuth(authService.getToken(), currentUser);
      } else {
        setProfileLoadError(profileResult.reason?.response?.data?.message || 'Unable to load your account details.');
      }
      setProfileLoading(false);

      if (ordersResult.status === 'fulfilled') {
        setOrders(getResponseData(ordersResult.value) || []);
      } else {
        setOrdersError(ordersResult.reason?.response?.data?.message || 'Unable to load your orders.');
      }
      setOrdersLoading(false);
    };

    loadAccount();
    return () => {
      active = false;
    };
  }, [navigate]);

  useEffect(() => {
    if (!avatarFile) {
      setAvatarPreview(avatarRemoved ? '' : getAvatarUrl(user?.avatar) || '');
      return undefined;
    }
    const objectUrl = URL.createObjectURL(avatarFile);
    setAvatarPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [avatarFile, avatarRemoved, user?.avatar]);

  const visibleOrders = useMemo(() => {
    if (activeSection === 'cancelled') return orders.filter((order) => order.status === 'cancelled');
    if (activeSection === 'returns') return orders.filter((order) => order.status === 'return_refund');
    if (activeSection !== 'purchases') return [];
    if (activeOrderStatus === 'all') return orders.filter((order) => !['cancelled', 'return_refund'].includes(order.status));
    return orders.filter((order) => order.status === activeOrderStatus);
  }, [activeOrderStatus, activeSection, orders]);

  const handleAvatarChange = (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (!['image/png', 'image/jpeg', 'image/jpg'].includes(file.type)
      && !['png', 'jpg', 'jpeg'].includes(fileExtension)) {
      setError('Please choose a PNG or JPG image.');
      return;
    }
    setError('');
    setCropSourceFile(file);
    setAvatarRemoved(false);
  };

  const editCurrentPhoto = async () => {
    if (avatarFile) {
      setCropSourceFile(avatarFile);
      return;
    }
    if (!avatarPreview) return;
    try {
      const response = await fetch(avatarPreview);
      if (!response.ok) throw new Error('Unable to load the current profile photo.');
      const imageBlob = await response.blob();
      const extension = imageBlob.type === 'image/png' ? 'png' : 'jpg';
      setCropSourceFile(new File([imageBlob], `profile-photo.${extension}`, { type: imageBlob.type }));
      setError('');
    } catch (photoError) {
      setError(photoError.message || 'Unable to edit the current profile photo.');
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setNotice('');
    setFieldErrors({});
    const formData = new FormData();
    Object.entries(form).forEach(([field, value]) => formData.append(field, value));
    if (avatarFile) formData.append('avatar', avatarFile);
    if (avatarRemoved) formData.append('remove_avatar', '1');

    try {
      const response = await api.post('/auth/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const updatedUser = getResponseData(response);
      authService.storeAuth(authService.getToken(), updatedUser);
      setUser(updatedUser);
      setAvatarFile(null);
      setAvatarRemoved(false);
      setNotice('Your account details have been updated.');
    } catch (saveError) {
      setError(saveError.response?.data?.message || 'Unable to save your account details.');
      setFieldErrors(saveError.response?.data?.errors || {});
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await api.post('/auth/logout');
    } catch (logoutError) {
      if (logoutError.response?.status !== 401) {
        setNotice(logoutError.response?.data?.message || 'Could not contact the server to sign out.');
      }
    } finally {
      authService.clearAuth();
      navigate('/', { replace: true });
    }
  };

  const updateField = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
    setFieldErrors((current) => ({ ...current, [field]: undefined }));
  };

  const renderProfile = () => (
    <Paper elevation={0} sx={{ p: { xs: 2, sm: 3 }, border: '1px solid #D9E7F3', borderRadius: 3 }}>
      <Stack spacing={2.5}>
        {profileLoadError && <Alert severity="warning">{profileLoadError}</Alert>}
        {error && <Alert severity="error">{error}</Alert>}
        {notice && <Alert severity="success">{notice}</Alert>}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} sx={{ alignItems: { xs: 'center', sm: 'flex-start' } }}>
          <Stack spacing={1.5} sx={{ alignItems: 'center', minWidth: { sm: 160 } }}>
            <Box sx={{ position: 'relative' }}>
              <Avatar
                src={avatarPreview || undefined}
                alt={`${form.first_name} ${form.last_name}`.trim() || 'Profile picture'}
                sx={{ width: 112, height: 112, bgcolor: '#22C7E0', fontSize: 38 }}
              />
              <Tooltip title="Edit profile photo">
                <span>
                  <IconButton
                    aria-label="Edit profile photo"
                    size="small"
                    onClick={editCurrentPhoto}
                    disabled={!avatarPreview || saving}
                    sx={{ position: 'absolute', top: 0, right: 0, bgcolor: 'background.paper', color: 'primary.main', boxShadow: 2 }}
                  >
                    <EditOutlined fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>
            </Box>
            <Button component="label" variant="outlined" startIcon={<CloudUpload />} disabled={saving}>
              Upload Photo
              <input hidden type="file" accept="image/png,image/jpeg,.png,.jpg,.jpeg" onChange={handleAvatarChange} />
            </Button>
            {avatarPreview && (
              <Button
                color="error"
                size="small"
                disabled={saving}
                onClick={() => {
                  setAvatarFile(null);
                  setAvatarRemoved(true);
                }}
              >
                Remove Photo
              </Button>
            )}
          </Stack>
          <Box component="form" onSubmit={handleSubmit} sx={{ flex: 1, minWidth: 0 }}>
            {profileLoading ? (
              <Stack sx={{ minHeight: 230, alignItems: 'center', justifyContent: 'center' }}>
                <CircularProgress size={28} />
              </Stack>
            ) : (
              <Stack spacing={2}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <TextField
                    label="First name"
                    required
                    fullWidth
                    value={form.first_name}
                    onChange={updateField('first_name')}
                    error={Boolean(fieldErrors.first_name)}
                    helperText={fieldErrors.first_name?.[0]}
                  />
                  <TextField
                    label="Last name"
                    required
                    fullWidth
                    value={form.last_name}
                    onChange={updateField('last_name')}
                    error={Boolean(fieldErrors.last_name)}
                    helperText={fieldErrors.last_name?.[0]}
                  />
                </Stack>
                <TextField
                  label="Email"
                  required
                  type="email"
                  fullWidth
                  value={form.email}
                  onChange={updateField('email')}
                  error={Boolean(fieldErrors.email)}
                  helperText={fieldErrors.email?.[0]}
                />
                <TextField
                  label="Contact number"
                  fullWidth
                  value={form.phone}
                  onChange={updateField('phone')}
                  error={Boolean(fieldErrors.phone)}
                  helperText={fieldErrors.phone?.[0]}
                />
                <Button type="submit" variant="contained" disabled={saving} startIcon={saving ? <CircularProgress size={18} color="inherit" /> : <Save />} sx={{ alignSelf: { sm: 'flex-end' }, px: 3 }}>
                  {saving ? 'Saving changes…' : 'Save changes'}
                </Button>
              </Stack>
            )}
          </Box>
        </Stack>
      </Stack>
    </Paper>
  );

  const renderOrderCard = (order) => (
    <Card key={order.id} variant="outlined" sx={{ borderColor: '#D9E7F3', borderRadius: 3 }}>
      <CardContent sx={{ p: { xs: 2, sm: 2.5 }, '&:last-child': { pb: { xs: 2, sm: 2.5 } } }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ justifyContent: 'space-between', alignItems: { sm: 'center' } }}>
          <Box>
            <Typography fontWeight={900}>{order.order_number || `Order #${order.id}`}</Typography>
            <Typography variant="body2" color="text.secondary">
              {order.created_at ? new Date(order.created_at).toLocaleDateString() : 'Date unavailable'}
            </Typography>
          </Box>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <Chip size="small" label={order.status === 'return_refund' ? 'Return / Refund' : order.status_label || order.status} color={statusColors[order.status] || 'default'} />
            <Typography fontWeight={900}>{currency.format(Number(order.total || 0))}</Typography>
          </Stack>
        </Stack>
        <Divider sx={{ my: 1.5 }} />
        <Stack spacing={1}>
          {(order.items || []).map((item) => (
            <Stack key={item.id} direction="row" spacing={1} sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" sx={{ minWidth: 0, overflowWrap: 'anywhere' }}>
                {item.product?.name || 'Product'} × {item.quantity}
              </Typography>
              <Typography variant="body2" fontWeight={700} sx={{ flexShrink: 0 }}>
                {currency.format(Number(item.total || 0))}
              </Typography>
            </Stack>
          ))}
          {(!order.items || order.items.length === 0) && (
            <Typography variant="body2" color="text.secondary">Order item details are unavailable.</Typography>
          )}
        </Stack>
      </CardContent>
    </Card>
  );

  const renderOrders = () => {
    if (ordersLoading) {
      return <Stack sx={{ py: 8, alignItems: 'center' }}><CircularProgress /><Typography sx={{ mt: 2 }}>Loading your orders…</Typography></Stack>;
    }
    if (ordersError) return <Alert severity="error">{ordersError}</Alert>;
    if (visibleOrders.length === 0) {
      return (
        <Paper elevation={0} sx={{ p: 5, textAlign: 'center', border: '1px solid #D9E7F3', borderRadius: 3 }}>
          <Typography variant="h6" fontWeight={800}>
            {activeSection === 'cancelled' ? 'No cancelled orders' : activeSection === 'returns' ? 'No return or refund requests' : 'No orders in this status'}
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 1 }}>
            {activeSection === 'returns' ? 'Return and refund updates will appear here.' : 'Your order updates will appear here.'}
          </Typography>
        </Paper>
      );
    }
    return <Stack spacing={2}>{visibleOrders.map(renderOrderCard)}</Stack>;
  };

  if (!authService.isAuthenticated()) return null;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#F3F8FC', color: '#0B2F5E' }}>
      <Paper square elevation={0} sx={{ borderBottom: '1px solid #D9E7F3' }}>
        <Container maxWidth="xl">
          <Stack direction="row" spacing={2} sx={{ py: 1.5, alignItems: 'center', justifyContent: 'space-between' }}>
            <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
              <IconButton aria-label="Back to shop" onClick={() => navigate('/shop')}><ArrowBack /></IconButton>
              <Avatar src="/images/dem-aqua-mark.png" alt="Dem Aqua" sx={{ width: 38, height: 38, bgcolor: '#22C7E0' }} />
              <Typography variant="h6" fontWeight={900}>Account</Typography>
            </Stack>
          </Stack>
        </Container>
      </Paper>

      <Container maxWidth="xl" sx={{ py: { xs: 3, md: 5 } }}>
        <Stack spacing={0.5} sx={{ mb: 3 }}>
          <Typography variant="h4" fontWeight={900}>Account & Orders</Typography>
          <Typography color="text.secondary">Manage your profile and keep track of your purchases.</Typography>
        </Stack>

        <Box sx={{ display: { xs: 'block', md: 'grid' }, gridTemplateColumns: { md: '250px minmax(0, 1fr)' }, gap: 3 }}>
          <Paper elevation={0} sx={{ p: 1.5, mb: { xs: 2, md: 0 }, border: '1px solid #D9E7F3', borderRadius: 3, alignSelf: 'start' }}>
            <Tabs
              orientation="vertical"
              value={activeSection}
              onChange={(_, value) => setActiveSection(value)}
              variant="scrollable"
              sx={{
                display: { xs: 'none', md: 'flex' },
                '& .MuiTabs-indicator': {
                  right: 0,
                  left: 'auto',
                  width: 3,
                  borderRadius: '3px 0 0 3px',
                },
                '& .MuiTab-root': {
                  minHeight: 48,
                  px: 1.5,
                  flexDirection: 'row',
                  justifyContent: 'flex-start',
                  alignItems: 'center',
                  gap: 1.5,
                  textAlign: 'left',
                  textTransform: 'none',
                  fontWeight: 700,
                  borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
                  '&:last-of-type': { borderBottom: 0 },
                  '& .MuiTab-iconWrapper': { m: 0, display: 'flex', alignItems: 'center' },
                },
              }}
            >
              {sections.map((section) => (
                <Tab
                  key={section.id}
                  value={section.id}
                  icon={section.icon}
                  iconPosition="start"
                  label={section.label}
                  sx={{ '& .MuiTab-wrapper': { alignItems: 'center' } }}
                />
              ))}
            </Tabs>
            <Stack direction="row" spacing={1} sx={{ display: { xs: 'flex', md: 'none' }, overflowX: 'auto' }}>
              {sections.map((section) => (
                <Chip
                  key={section.id}
                  icon={section.icon}
                  label={section.label}
                  clickable
                  color={activeSection === section.id ? 'primary' : 'default'}
                  variant={activeSection === section.id ? 'filled' : 'outlined'}
                  onClick={() => setActiveSection(section.id)}
                />
              ))}
            </Stack>
            <Divider sx={{ my: 1.5 }} />
            <Stack spacing={1} sx={{ px: 1 }}>
              <Typography variant="body2" fontWeight={800} noWrap>
                {user?.full_name || [user?.first_name, user?.last_name].filter(Boolean).join(' ') || user?.email}
              </Typography>
              <Button
                fullWidth
                color="error"
                variant="outlined"
                onClick={handleLogout}
                disabled={loggingOut}
                startIcon={loggingOut ? <CircularProgress size={18} color="inherit" /> : <Logout />}
              >
                {loggingOut ? 'Signing out…' : 'Sign Out'}
              </Button>
            </Stack>
          </Paper>

          <Box sx={{ minWidth: 0 }}>
            <Fade in key={activeSection} timeout={220} appear>
              <Box>
                {activeSection === 'profile' ? (
                  <>
                    <Typography variant="h5" fontWeight={900} sx={{ mb: 2 }}>Profile settings</Typography>
                    {renderProfile()}
                  </>
                ) : (
                  <>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mb: 2, alignItems: { sm: 'center' }, justifyContent: 'space-between' }}>
                      <Box>
                        <Typography variant="h5" fontWeight={900}>
                          {activeSection === 'purchases' ? 'My Purchases / Order History' : activeSection === 'cancelled' ? 'Cancelled Orders' : 'Return / Refund'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">Review order items, totals, and current status.</Typography>
                      </Box>
                    </Stack>
                    {activeSection === 'purchases' && (
                      <Tabs
                        value={activeOrderStatus}
                        onChange={(_, value) => setActiveOrderStatus(value)}
                        variant="scrollable"
                        scrollButtons="auto"
                        sx={{ mb: 2, borderBottom: '1px solid #D9E7F3', '& .MuiTab-root': { textTransform: 'none', fontWeight: 800 } }}
                      >
                        {orderStatusFilters.map((filter) => <Tab key={filter.id} value={filter.id} label={filter.label} />)}
                      </Tabs>
                    )}
                    {renderOrders()}
                  </>
                )}
              </Box>
            </Fade>
          </Box>
        </Box>
      </Container>
      <ProfilePhotoCropDialog
        file={cropSourceFile}
        onCancel={() => setCropSourceFile(null)}
        onConfirm={(croppedFile) => {
          setAvatarFile(croppedFile);
          setAvatarRemoved(false);
          setCropSourceFile(null);
        }}
      />
    </Box>
  );
};

export default AccountPage;
