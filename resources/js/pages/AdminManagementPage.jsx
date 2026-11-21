import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import {
  Alert,
  AppBar,
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Drawer,
  Fade,
  FormControl,
  FormControlLabel,
  IconButton,
  InputLabel,
  LinearProgress,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Toolbar,
  Tooltip,
  Typography,
  useMediaQuery,
} from '@mui/material';
import {
  Assessment,
  Assignment,
  Dashboard,
  Inventory2,
  Logout,
  Menu as MenuIcon,
  NotificationsNone,
  PeopleAlt,
  RateReview,
  Storefront,
  TrendingUp,
} from '@mui/icons-material';
import api from '../services/api';
import authService from '../services/auth';
import { clearAdminGreeting, getAdminGreeting } from '../services/adminGreeting';
import { getMediaUrl } from '../components/shop/shopUtils';

const DRAWER_WIDTH = 264;
const NAVY = '#111827';
const AQUA = '#22d3ee';
const glassPaper = {
  border: '1px solid rgba(148, 212, 226, 0.35)',
  background: 'rgba(255,255,255,0.86)',
  backdropFilter: 'blur(16px)',
  borderRadius: 3,
};
const sections = [
  { key: 'overview', label: 'Dashboard Overview', path: '/admin', icon: <Dashboard /> },
  { key: 'users', label: 'User Management', path: '/admin/users', icon: <PeopleAlt /> },
  { key: 'products', label: 'Product Management', path: '/admin/products', icon: <Storefront /> },
  { key: 'inventory', label: 'Inventory Management', path: '/admin/inventory', icon: <Inventory2 /> },
  { key: 'orders', label: 'Order Management', path: '/admin/orders', icon: <Assignment /> },
  { key: 'reviews', label: 'Review Management', path: '/admin/reviews', icon: <RateReview /> },
  { key: 'analytics', label: 'Analytics & Reports', path: '/admin/analytics', icon: <Assessment /> },
];
const orderStatuses = [
  { value: 'pending', label: 'To Pay' },
  { value: 'processing', label: 'To Ship' },
  { value: 'shipped', label: 'To Receive' },
  { value: 'delivered', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'return_refund', label: 'Return / Refund' },
];
const emptyProduct = {
  name: '',
  sku: '',
  category_id: '',
  price: '',
  stock_quantity: 0,
  description: '',
  brand: '',
  image_url: '',
  featured: false,
  status: true,
};
const rowsFrom = (response) => response.data?.data ?? [];
const money = (value) => new Intl.NumberFormat('en-PH', {
  style: 'currency',
  currency: 'PHP',
  maximumFractionDigits: 2,
}).format(Number(value ?? 0));
const formatDate = (value) => value ? new Date(value).toLocaleDateString() : '—';
const orderLabel = (status) => orderStatuses.find((item) => item.value === status)?.label ?? status;

function AdminGuard({ children }) {
  const location = useLocation();
  const [state, setState] = useState('checking');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let active = true;

    async function verifyAdmin() {
      const token = authService.getToken();
      if (!token) {
        if (active) setState('denied');
        return;
      }

      try {
        const user = await authService.getUser();
        if (!active) return;
        if (user?.role !== 'admin' || user?.is_active === false) {
          authService.clearAuth();
          setState('denied');
          return;
        }
        authService.storeAuth(token, user);
        setState('allowed');
      } catch (error) {
        if (!active) return;
        authService.clearAuth();
        setErrorMessage(error.response?.data?.message || 'Please sign in with an administrator account.');
        setState('denied');
      }
    }

    verifyAdmin();
    return () => {
      active = false;
    };
  }, [location.pathname]);

  if (state === 'checking') {
    return (
      <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', bgcolor: '#effcff' }}>
        <Stack alignItems="center" spacing={2}>
          <CircularProgress />
          <Typography color="text.secondary">Verifying administrator access…</Typography>
        </Stack>
      </Box>
    );
  }

  if (state === 'denied') {
    return <Navigate to="/" replace state={{ from: location, adminAuthError: errorMessage }} />;
  }

  return children;
}

function StatCard({ title, value, hint, icon, accent }) {
  return (
    <Card sx={{ ...glassPaper, height: '100%', overflow: 'hidden', position: 'relative' }}>
      <Box sx={{ position: 'absolute', inset: '0 auto 0 0', width: 4, bgcolor: accent }} />
      <CardContent sx={{ p: 2.5 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography variant="body2" color="text.secondary">{title}</Typography>
            <Typography variant="h4" sx={{ mt: 1, color: NAVY, fontWeight: 800 }}>
              {value}
            </Typography>
            <Typography variant="caption" color="text.secondary">{hint}</Typography>
          </Box>
          <Avatar sx={{ bgcolor: `${accent}20`, color: accent }}>{icon}</Avatar>
        </Stack>
      </CardContent>
    </Card>
  );
}

function DataTable({ columns, children, minWidth = 800 }) {
  return (
    <TableContainer sx={{ ...glassPaper, overflowX: 'auto' }}>
      <Table size="small" sx={{ minWidth }}>
        <TableHead>
          <TableRow sx={{ '& th': { color: '#64748b', fontWeight: 700, whiteSpace: 'nowrap' } }}>
            {columns.map((column) => <TableCell key={column}>{column}</TableCell>)}
          </TableRow>
        </TableHead>
        <TableBody>{children}</TableBody>
      </Table>
    </TableContainer>
  );
}

function EmptyRow({ colSpan, message = 'No records found.' }) {
  return (
    <TableRow>
      <TableCell colSpan={colSpan} align="center" sx={{ py: 5, color: 'text.secondary' }}>
        {message}
      </TableCell>
    </TableRow>
  );
}

function SalesChart({ rows }) {
  const maxValue = Math.max(...rows.map((row) => Number(row.sales)), 1);
  const width = Math.max(rows.length * 58, 360);
  const height = 220;

  return (
    <Box sx={{ overflowX: 'auto', pb: 1 }}>
      <svg width={width} height={height} role="img" aria-label="Sales by period">
        {[0, 1, 2, 3].map((line) => (
          <line key={line} x1="24" x2={width - 12} y1={28 + line * 48} y2={28 + line * 48} stroke="#e2e8f0" />
        ))}
        {rows.map((row, index) => {
          const barHeight = Math.max((Number(row.sales) / maxValue) * 150, 3);
          const x = 36 + index * 58;
          return (
            <g key={row.period}>
              <rect x={x} y={188 - barHeight} width="30" height={barHeight} rx="6" fill={AQUA} />
              <text x={x + 15} y="207" textAnchor="middle" fill="#64748b" fontSize="10">
                {row.period.length > 7 ? row.period.slice(5) : row.period}
              </text>
              <title>{`${row.period}: ${money(row.sales)} from ${row.orders} orders`}</title>
            </g>
          );
        })}
      </svg>
    </Box>
  );
}

function AdminManagementPageView() {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery((theme) => theme.breakpoints.down('md'));
  const adminName = 'Dem';
  const [greeting] = useState(() => getAdminGreeting(adminName));
  const [mobileOpen, setMobileOpen] = useState(false);
  const section = sections.find((item) => item.path === location.pathname)?.key
    ?? (location.pathname.startsWith('/admin/') ? location.pathname.split('/')[2] : 'overview');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [overview, setOverview] = useState(null);
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [orders, setOrders] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [report, setReport] = useState(null);
  const [range, setRange] = useState('monthly');
  const [productDialog, setProductDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState(emptyProduct);
  const [reviewDialog, setReviewDialog] = useState(null);
  const [reviewReply, setReviewReply] = useState('');
  const [inventoryDialog, setInventoryDialog] = useState(null);
  const [stockDelta, setStockDelta] = useState('');
  const [stockThreshold, setStockThreshold] = useState('');

  const currentSection = sections.find((item) => item.key === section) ?? sections[0];

  const loadSection = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      if (section === 'overview') {
        const response = await api.get('/admin/dashboard');
        setOverview(response.data);
      } else if (section === 'users') {
        const response = await api.get('/users', { params: { per_page: 25, page: page + 1, search: query || undefined } });
        setUsers(rowsFrom(response));
        setPageCount(response.data?.meta?.total ?? 0);
      } else if (section === 'products') {
        const [productResponse, categoryResponse] = await Promise.all([
          api.get('/products', { params: { per_page: 25, page: page + 1, search: query || undefined } }),
          api.get('/categories', { params: { per_page: 100 } }),
        ]);
        setProducts(rowsFrom(productResponse));
        setCategories(rowsFrom(categoryResponse));
        setPageCount(productResponse.data?.meta?.total ?? 0);
      } else if (section === 'inventory') {
        const response = await api.get('/inventories', { params: { per_page: 25, page: page + 1 } });
        setInventory(rowsFrom(response));
        setPageCount(response.data?.meta?.total ?? 0);
      } else if (section === 'orders') {
        const response = await api.get('/orders', { params: { per_page: 25, page: page + 1 } });
        setOrders(rowsFrom(response));
        setPageCount(response.data?.meta?.total ?? 0);
      } else if (section === 'reviews') {
        const response = await api.get('/admin/reviews', {
          params: { per_page: 25, page: page + 1, search: query || undefined },
        });
        setReviews(rowsFrom(response));
        setPageCount(response.data?.meta?.total ?? 0);
      } else if (section === 'analytics') {
        const [response, inventoryResponse] = await Promise.all([
          api.get('/admin/reports', { params: { range } }),
          api.get('/inventories', { params: { per_page: 100 } }),
        ]);
        setReport(response.data);
        setInventory(rowsFrom(inventoryResponse));
        setPageCount(0);
      } else {
        navigate('/admin', { replace: true });
      }
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not load this admin view. Please retry.');
    } finally {
      setLoading(false);
    }
  }, [navigate, page, query, range, section]);

  useEffect(() => {
    setPage(0);
    setQuery('');
  }, [section]);

  useEffect(() => {
    const timeout = window.setTimeout(loadSection, section === 'users' || section === 'products' || section === 'reviews' ? 250 : 0);
    return () => window.clearTimeout(timeout);
  }, [loadSection, section]);

  const handleAction = async (action, successMessage) => {
    setError('');
    try {
      await action();
      setNotice(successMessage);
      await loadSection();
      return true;
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'The requested update failed.');
      return false;
    }
  };

  const openNewProduct = () => {
    setEditingProduct(null);
    setProductForm(emptyProduct);
    setProductDialog(true);
  };

  const openEditProduct = (product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name ?? '',
      sku: product.sku ?? '',
      category_id: product.category?.id ?? '',
      price: product.price ?? '',
      stock_quantity: product.stock_quantity ?? 0,
      description: product.description ?? '',
      brand: product.brand ?? '',
      image_url: product.image?.startsWith('http') ? product.image : '',
      featured: Boolean(product.featured),
      status: Boolean(product.status),
    });
    setProductDialog(true);
  };

  const saveProduct = async (event) => {
    event.preventDefault();
    const form = new FormData();
    Object.entries(productForm).forEach(([key, value]) => {
      if (value !== '' && value !== null && value !== undefined) {
        form.append(key, typeof value === 'boolean' ? (value ? '1' : '0') : String(value));
      }
    });
    const upload = event.currentTarget.elements.image.files[0];
    if (upload) {
      form.delete('image_url');
      form.append('image', upload);
    }
    if (editingProduct) form.append('_method', 'PATCH');

    setError('');
    try {
      if (editingProduct) {
        await api.post(`/products/${editingProduct.id}`, form, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        await api.post('/products', form, { headers: { 'Content-Type': 'multipart/form-data' } });
      }
      setProductDialog(false);
      setNotice(editingProduct ? 'Product updated.' : 'Product created.');
      await loadSection();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not save product. Check the required fields.');
    }
  };

  const exportCsv = (filename, rows) => {
    if (!rows.length) {
      setError('There is no data to export yet.');
      return;
    }
    const keys = Object.keys(rows[0]);
    const csv = [keys, ...rows.map((row) => keys.map((key) => row[key]))]
      .map((row) => row.map((value) => `"${String(value ?? '').replaceAll('"', '""')}"`).join(','))
      .join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportInventoryCsv = async () => {
    setError('');
    try {
      const rows = [];
      let currentPage = 1;
      let lastPage = 1;

      do {
        const response = await api.get('/inventories', {
          params: { per_page: 100, page: currentPage },
        });
        rows.push(...rowsFrom(response));
        lastPage = response.data?.meta?.last_page ?? 1;
        currentPage += 1;
      } while (currentPage <= lastPage);

      exportCsv('dem-aqua-inventory.csv', rows.map((item) => ({
        product: item.product?.name,
        sku: item.product?.sku,
        stock: item.stock_quantity,
        reorder_level: item.reorder_level,
      })));
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not export the inventory report.');
    }
  };

  const renderPagination = () => (
    <TablePagination
      component="div"
      count={pageCount}
      page={page}
      onPageChange={(_, nextPage) => setPage(nextPage)}
      rowsPerPage={25}
      rowsPerPageOptions={[25]}
      sx={{ color: '#475569' }}
    />
  );

  const renderOverview = () => {
    const metrics = overview?.metrics ?? {};
    const activity = overview?.recent_activity ?? [];
    return (
      <Stack spacing={3}>
        <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: 'repeat(2,1fr)', xl: 'repeat(5,1fr)' } }}>
          <StatCard title="Total Sales" value={money(metrics.total_sales)} hint="All active order revenue" icon={<TrendingUp />} accent="#0891b2" />
          <StatCard title="Total Orders" value={metrics.total_orders ?? 0} hint="Orders placed" icon={<Assignment />} accent="#2563eb" />
          <StatCard title="Active Products" value={metrics.active_products ?? 0} hint="Visible in the storefront" icon={<Storefront />} accent="#059669" />
          <StatCard title="Total Registered Users" value={metrics.registered_users ?? 0} hint="All customer and admin accounts" icon={<PeopleAlt />} accent="#7c3aed" />
          <StatCard title="Low Stock Alerts" value={metrics.low_stock_alerts ?? 0} hint="At or below reorder level" icon={<Inventory2 />} accent="#e11d48" />
        </Box>
        <Box sx={{ display: 'grid', gap: 2.5, gridTemplateColumns: { xs: '1fr', lg: '1.15fr 0.85fr' } }}>
          <Paper sx={{ ...glassPaper, p: 2.5 }}>
            <Typography variant="h6" sx={{ color: NAVY, fontWeight: 800, mb: 2 }}>Quick actions</Typography>
            <Stack direction="row" flexWrap="wrap" gap={1.25}>
              {[
                ['Add product', '/admin/products'],
                ['Manage orders', '/admin/orders'],
                ['Review inventory', '/admin/inventory'],
                ['Open reports', '/admin/analytics'],
              ].map(([label, path]) => (
                <Button key={label} variant="outlined" onClick={() => navigate(path)}>{label}</Button>
              ))}
            </Stack>
          </Paper>
          <Paper sx={{ ...glassPaper, p: 2.5 }}>
            <Typography variant="h6" sx={{ color: NAVY, fontWeight: 800, mb: 1 }}>Recent activity</Typography>
            <Stack divider={<Divider flexItem />} spacing={1}>
              {activity.length === 0 && <Typography color="text.secondary" sx={{ py: 2 }}>No recent orders or reviews.</Typography>}
              {activity.map((item) => (
                <Stack key={`${item.type}-${item.id}`} direction="row" justifyContent="space-between" gap={2} sx={{ py: 1 }}>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: NAVY }}>{item.label}</Typography>
                    <Typography variant="caption" color="text.secondary">{item.detail}</Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>{formatDate(item.created_at)}</Typography>
                </Stack>
              ))}
            </Stack>
          </Paper>
        </Box>
      </Stack>
    );
  };

  const renderUsers = () => (
    <Stack spacing={2}>
      <TextField size="small" label="Search name, email, or username" value={query} onChange={(event) => { setQuery(event.target.value); setPage(0); }} sx={{ maxWidth: 420 }} />
      <DataTable columns={['User', 'Contact', 'Role', 'Registered', 'Account', 'Actions']} minWidth={920}>
        {users.length === 0 && <EmptyRow colSpan={6} />}
        {users.map((user) => (
          <TableRow key={user.id} hover>
            <TableCell>
              <Stack direction="row" spacing={1.25} alignItems="center">
                <Avatar src={getMediaUrl(user.avatar)}>{user.first_name?.[0]}</Avatar>
                <Box>
                  <Typography sx={{ fontWeight: 700 }}>{user.full_name || `${user.first_name} ${user.last_name}`}</Typography>
                  <Typography variant="caption" color="text.secondary">{user.username || `#${user.id}`}</Typography>
                </Box>
              </Stack>
            </TableCell>
            <TableCell>{user.email}<Typography variant="caption" display="block" color="text.secondary">{user.phone || 'No phone'}</Typography></TableCell>
            <TableCell>
              <Select
                size="small"
                value={user.role}
                onChange={(event) => handleAction(
                  () => api.patch(`/users/${user.id}`, { role: event.target.value }),
                  'User role updated.'
                )}
              >
                <MenuItem value="customer">Customer</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
              </Select>
            </TableCell>
            <TableCell>{formatDate(user.created_at)}</TableCell>
            <TableCell><Chip size="small" color={user.is_active ? 'success' : 'default'} label={user.is_active ? 'Active' : 'Inactive'} /></TableCell>
            <TableCell>
              <Button
                size="small"
                color={user.is_active ? 'warning' : 'success'}
                onClick={() => handleAction(
                  () => api.patch(`/users/${user.id}`, { is_active: !user.is_active }),
                  user.is_active ? 'Account deactivated.' : 'Account reactivated.'
                )}
              >
                {user.is_active ? 'Deactivate' : 'Reactivate'}
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </DataTable>
      {renderPagination()}
    </Stack>
  );

  const renderProducts = () => (
    <Stack spacing={2}>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" gap={1}>
        <TextField size="small" label="Search products" value={query} onChange={(event) => { setQuery(event.target.value); setPage(0); }} sx={{ maxWidth: 420 }} />
        <Button variant="contained" onClick={openNewProduct}>Add product</Button>
      </Stack>
      <DataTable columns={['Product', 'SKU', 'Category', 'Price', 'Stock', 'Status', 'Actions']} minWidth={900}>
        {products.length === 0 && <EmptyRow colSpan={7} />}
        {products.map((product) => (
          <TableRow key={product.id} hover>
            <TableCell>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Avatar variant="rounded" src={getMediaUrl(product.image)} sx={{ width: 42, height: 42 }}>{product.name?.[0]}</Avatar>
                <Box><Typography sx={{ fontWeight: 700 }}>{product.name}</Typography>{product.featured && <Chip size="small" label="Featured" color="info" />}</Box>
              </Stack>
            </TableCell>
            <TableCell>{product.sku}</TableCell>
            <TableCell>{product.category?.name ?? '—'}</TableCell>
            <TableCell>{money(product.price)}</TableCell>
            <TableCell>{product.stock_quantity}</TableCell>
            <TableCell><Chip size="small" color={product.status ? 'success' : 'default'} label={product.status ? 'Active' : 'Hidden'} /></TableCell>
            <TableCell>
              <Stack direction="row">
                <Button size="small" onClick={() => openEditProduct(product)}>Edit</Button>
                <Button size="small" color={product.status ? 'warning' : 'success'} onClick={() => handleAction(
                  () => api.patch(`/products/${product.id}`, { status: !product.status }),
                  product.status ? 'Product hidden.' : 'Product activated.'
                )}>{product.status ? 'Hide' : 'Show'}</Button>
                <Button size="small" color="error" onClick={() => handleAction(
                  () => api.delete(`/products/${product.id}`),
                  'Product removed.'
                )}>Delete</Button>
              </Stack>
            </TableCell>
          </TableRow>
        ))}
      </DataTable>
      {renderPagination()}
    </Stack>
  );

  const renderInventory = () => (
    <Stack spacing={2}>
      <Alert severity="info">Use the adjustment control to add or subtract units. Stock cannot be reduced below zero.</Alert>
      <DataTable columns={['Product', 'SKU', 'On hand', 'Reorder level', 'Updated', 'Alert', 'Adjustment']} minWidth={900}>
        {inventory.length === 0 && <EmptyRow colSpan={7} />}
        {inventory.map((item) => {
          const low = item.stock_quantity <= item.reorder_level;
          return (
            <TableRow key={item.id} hover>
              <TableCell sx={{ fontWeight: 700 }}>{item.product?.name}</TableCell>
              <TableCell>{item.product?.sku}</TableCell>
              <TableCell>{item.stock_quantity}</TableCell>
              <TableCell>
                <TextField
                  size="small"
                  type="number"
                  defaultValue={item.reorder_level}
                  inputProps={{ min: 0 }}
                  sx={{ width: 96 }}
                  onBlur={(event) => {
                    const next = Number(event.target.value);
                    if (next !== item.reorder_level && next >= 0) {
                      handleAction(() => api.patch(`/inventories/${item.id}`, { reorder_level: next }), 'Reorder threshold saved.');
                    }
                  }}
                />
              </TableCell>
              <TableCell>{formatDate(item.updated_at)}</TableCell>
              <TableCell><Chip size="small" color={low ? 'error' : 'success'} label={low ? 'Reorder now' : 'Healthy'} /></TableCell>
              <TableCell>
                <Button size="small" variant="outlined" onClick={() => {
                  setInventoryDialog(item);
                  setStockDelta('');
                  setStockThreshold(String(item.reorder_level));
                }}>Adjust stock</Button>
              </TableCell>
            </TableRow>
          );
        })}
      </DataTable>
      {renderPagination()}
    </Stack>
  );

  const renderOrders = () => (
    <Stack spacing={2}>
      <DataTable columns={['Order', 'Customer', 'Placed', 'Total', 'Payment', 'Status']} minWidth={900}>
        {orders.length === 0 && <EmptyRow colSpan={6} />}
        {orders.map((order) => (
          <TableRow key={order.id} hover>
            <TableCell sx={{ fontWeight: 700 }}>{order.order_number}</TableCell>
            <TableCell>{order.user?.full_name ?? order.shipping_name}<Typography variant="caption" display="block" color="text.secondary">{order.user?.email}</Typography></TableCell>
            <TableCell>{formatDate(order.created_at)}</TableCell>
            <TableCell>{money(order.total)}</TableCell>
            <TableCell><Chip size="small" variant="outlined" label={String(order.payment_method).toUpperCase()} /></TableCell>
            <TableCell>
              <Select
                size="small"
                value={order.status}
                onChange={(event) => handleAction(
                  () => api.patch(`/orders/${order.id}`, { status: event.target.value }),
                  'Order status updated.'
                )}
              >
                {orderStatuses.map((item) => <MenuItem key={item.value} value={item.value}>{item.label}</MenuItem>)}
              </Select>
            </TableCell>
          </TableRow>
        ))}
      </DataTable>
      {renderPagination()}
    </Stack>
  );

  const renderReviews = () => (
    <Stack spacing={2}>
      <TextField size="small" label="Search reviewer or product" value={query} onChange={(event) => { setQuery(event.target.value); setPage(0); }} sx={{ maxWidth: 420 }} />
      <DataTable columns={['Customer / Product', 'Rating', 'Review', 'Moderation', 'Reply', 'Actions']} minWidth={1050}>
        {reviews.length === 0 && <EmptyRow colSpan={6} />}
        {reviews.map((review) => (
          <TableRow key={review.id} hover>
            <TableCell>
              <Typography sx={{ fontWeight: 700 }}>{review.user?.full_name ?? 'Customer'}</Typography>
              <Typography variant="caption" color="text.secondary">{review.product?.name}</Typography>
            </TableCell>
            <TableCell><Chip size="small" color="warning" label={`${review.rating} / 5`} /></TableCell>
            <TableCell sx={{ maxWidth: 280, whiteSpace: 'normal' }}>{review.comment || 'No written review'}</TableCell>
            <TableCell><Chip size="small" color={review.moderation_status === 'approved' ? 'success' : review.moderation_status === 'flagged' ? 'error' : 'warning'} label={review.moderation_status} /></TableCell>
            <TableCell sx={{ maxWidth: 220, whiteSpace: 'normal' }}>{review.admin_reply || '—'}</TableCell>
            <TableCell>
              <Stack direction="row">
                <Button size="small" color="success" onClick={() => handleAction(
                  () => api.patch(`/reviews/${review.id}`, { moderation_status: 'approved' }),
                  'Review approved.'
                )}>Approve</Button>
                <Button size="small" color="warning" onClick={() => handleAction(
                  () => api.patch(`/reviews/${review.id}`, { moderation_status: 'flagged' }),
                  'Review flagged.'
                )}>Flag</Button>
                <Button size="small" onClick={() => {
                  setReviewDialog(review);
                  setReviewReply(review.admin_reply || '');
                }}>Reply</Button>
              </Stack>
            </TableCell>
          </TableRow>
        ))}
      </DataTable>
      {renderPagination()}
    </Stack>
  );

  const renderAnalytics = () => (
    <Stack spacing={2.5}>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} gap={1}>
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel id="report-range-label">Date range</InputLabel>
          <Select labelId="report-range-label" value={range} label="Date range" onChange={(event) => setRange(event.target.value)}>
            <MenuItem value="daily">Daily · last 7 days</MenuItem>
            <MenuItem value="weekly">Weekly · last 8 weeks</MenuItem>
            <MenuItem value="monthly">Monthly · last 12 months</MenuItem>
          </Select>
        </FormControl>
        <Stack direction="row" gap={1}>
          <Button variant="outlined" onClick={() => exportCsv('dem-aqua-sales.csv', (report?.sales ?? []).map((row) => ({ period: row.period, sales: row.sales, orders: row.orders })))}>Export sales CSV</Button>
          <Button variant="outlined" onClick={exportInventoryCsv}>Export inventory CSV</Button>
          <Button variant="contained" onClick={() => window.print()}>Print / Save PDF</Button>
        </Stack>
      </Stack>
      <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: 'repeat(2,1fr)' } }}>
        <StatCard title="Revenue in range" value={money(report?.totals?.revenue)} hint={`${report?.totals?.orders ?? 0} orders`} icon={<TrendingUp />} accent="#0891b2" />
        <StatCard title="Report period" value={report?.range ?? range} hint={`${report?.start_date ?? ''} — ${report?.end_date ?? ''}`} icon={<Assessment />} accent="#7c3aed" />
      </Box>
      <Paper sx={{ ...glassPaper, p: 2.5 }}>
        <Typography variant="h6" sx={{ color: NAVY, fontWeight: 800, mb: 2 }}>Sales trend</Typography>
        {report?.sales?.length ? <SalesChart rows={report.sales} /> : <Typography color="text.secondary">No sales in the selected date range.</Typography>}
      </Paper>
      <Paper sx={{ ...glassPaper, p: 2.5 }}>
        <Typography variant="h6" sx={{ color: NAVY, fontWeight: 800, mb: 2 }}>Top-performing products</Typography>
        <Stack spacing={1.5}>
          {(report?.top_products ?? []).length === 0 && <Typography color="text.secondary">No product sales in this period.</Typography>}
          {(report?.top_products ?? []).map((product, index) => {
            const maxUnits = Math.max(...report.top_products.map((item) => item.units_sold), 1);
            return (
              <Box key={product.product_id}>
                <Stack direction="row" justifyContent="space-between" gap={2} sx={{ mb: 0.5 }}>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>{index + 1}. {product.name}</Typography>
                  <Typography variant="body2" color="text.secondary">{product.units_sold} sold · {money(product.revenue)}</Typography>
                </Stack>
                <LinearProgress variant="determinate" value={(product.units_sold / maxUnits) * 100} sx={{ height: 7, borderRadius: 4, '& .MuiLinearProgress-bar': { bgcolor: AQUA } }} />
              </Box>
            );
          })}
        </Stack>
      </Paper>
    </Stack>
  );

  const content = useMemo(() => {
    switch (section) {
      case 'users': return renderUsers();
      case 'products': return renderProducts();
      case 'inventory': return renderInventory();
      case 'orders': return renderOrders();
      case 'reviews': return renderReviews();
      case 'analytics': return renderAnalytics();
      default: return renderOverview();
    }
  }, [section, overview, users, products, categories, inventory, orders, reviews, report, range, query, page, pageCount]);

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: NAVY, color: '#e5faff' }}>
      <Box sx={{ px: 2.5, pt: 3, pb: 2, minHeight: 88, display: 'flex', alignItems: 'center' }}>
        <Typography variant="h6" sx={{ color: '#f8fafc', fontWeight: 800, lineHeight: 1.3 }}>
          {greeting}
        </Typography>
      </Box>
      <Divider sx={{ borderColor: 'rgba(148,163,184,.2)', mx: 2 }} />
      <Stack spacing={0.4} sx={{ px: 1.5, py: 2 }}>
        {sections.map((item) => (
          <Button
            key={item.key}
            startIcon={item.icon}
            onClick={() => {
              navigate(item.path);
              setMobileOpen(false);
            }}
            sx={{
              justifyContent: 'flex-start',
              gap: 1,
              px: 1.5,
              py: 1.25,
              color: section === item.key ? '#ecfeff' : '#a8bdca',
              bgcolor: section === item.key ? 'rgba(34,211,238,.15)' : 'transparent',
              borderLeft: section === item.key ? `3px solid ${AQUA}` : '3px solid transparent',
              '&:hover': { bgcolor: 'rgba(34,211,238,.1)' },
              '& .MuiButton-startIcon': { color: section === item.key ? AQUA : '#92a9b8' },
            }}
          >
            {item.label}
          </Button>
        ))}
      </Stack>
      <Box sx={{ flexGrow: 1 }} />
      <Button
        startIcon={<Logout />}
        onClick={async () => {
          await authService.logout().catch((logoutError) => console.error('Admin logout failed:', logoutError));
          authService.clearAuth();
          clearAdminGreeting();
          navigate('/', { replace: true });
        }}
        sx={{ justifyContent: 'flex-start', mx: 2, mb: 2, color: '#cbd5e1' }}
      >
        Sign out
      </Button>
    </Box>
  );

  const openInventoryDialog = Boolean(inventoryDialog);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#effcff', backgroundImage: 'radial-gradient(at 82% 0%, rgba(34,211,238,.14), transparent 38%), linear-gradient(135deg,#f8fdff,#eaf8fb)' }}>
      {isMobile && (
        <AppBar position="fixed" sx={{ bgcolor: NAVY }}>
          <Toolbar>
            <IconButton color="inherit" edge="start" onClick={() => setMobileOpen(true)}><MenuIcon /></IconButton>
            <Typography sx={{ flexGrow: 1, ml: 1, fontWeight: 800 }}>Admin workspace</Typography>
            <Tooltip title="Recent activity">
              <IconButton color="inherit" onClick={() => navigate('/admin')}><Badge variant="dot" color="info"><NotificationsNone /></Badge></IconButton>
            </Tooltip>
          </Toolbar>
        </AppBar>
      )}
      <Drawer
        variant={isMobile ? 'temporary' : 'permanent'}
        open={isMobile ? mobileOpen : true}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          width: isMobile ? undefined : DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box', border: 0, bgcolor: NAVY },
        }}
      >
        {drawerContent}
      </Drawer>
      <Box component="main" sx={{ ml: { md: `${DRAWER_WIDTH}px` }, pt: { xs: 9, md: 0 }, minHeight: '100vh' }}>
        {!isMobile && (
          <AppBar position="sticky" elevation={0} sx={{ bgcolor: 'rgba(255,255,255,.78)', color: NAVY, borderBottom: '1px solid #d9eef3', backdropFilter: 'blur(14px)' }}>
            <Toolbar sx={{ minHeight: '76px !important' }}>
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="caption" sx={{ color: '#0891b2', fontWeight: 800, letterSpacing: 1.2 }}>ADMINISTRATION</Typography>
                <Typography variant="h6" sx={{ color: NAVY, fontWeight: 800 }}>{currentSection.label}</Typography>
              </Box>
              <Tooltip title="Refresh this view">
                <IconButton onClick={loadSection}><Badge variant="dot" color="info"><NotificationsNone /></Badge></IconButton>
              </Tooltip>
              <Avatar sx={{ ml: 1, bgcolor: '#0e7490', width: 36, height: 36 }}>A</Avatar>
            </Toolbar>
          </AppBar>
        )}
        <Box sx={{ p: { xs: 2, sm: 3, lg: 4 }, maxWidth: 1680, mx: 'auto' }}>
          {isMobile && <Typography variant="h5" sx={{ color: NAVY, fontWeight: 800, mb: 2 }}>{currentSection.label}</Typography>}
          {error && <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>{error}</Alert>}
          {loading && <LinearProgress sx={{ mb: 2, borderRadius: 3 }} />}
          <Fade in key={section} timeout={220}>
            <Box>{content}</Box>
          </Fade>
        </Box>
      </Box>

      <Dialog open={productDialog} onClose={() => setProductDialog(false)} fullWidth maxWidth="sm">
        <Box component="form" onSubmit={saveProduct}>
          <DialogTitle>{editingProduct ? 'Edit product' : 'Create product'}</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ pt: 1 }}>
              <TextField required label="Product name" value={productForm.name} onChange={(event) => setProductForm({ ...productForm, name: event.target.value })} />
              <TextField required label="SKU" value={productForm.sku} onChange={(event) => setProductForm({ ...productForm, sku: event.target.value })} />
              <FormControl required>
                <InputLabel id="product-category-label">Category</InputLabel>
                <Select labelId="product-category-label" label="Category" value={productForm.category_id} onChange={(event) => setProductForm({ ...productForm, category_id: event.target.value })}>
                  {categories.map((category) => <MenuItem key={category.id} value={category.id}>{category.name}</MenuItem>)}
                </Select>
              </FormControl>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField required type="number" label="Price (₱)" value={productForm.price} inputProps={{ min: 0, step: '0.01' }} onChange={(event) => setProductForm({ ...productForm, price: event.target.value })} fullWidth />
                <TextField required type="number" label="Stock level" value={productForm.stock_quantity} inputProps={{ min: 0, step: 1 }} onChange={(event) => setProductForm({ ...productForm, stock_quantity: event.target.value })} fullWidth />
              </Stack>
              <TextField label="Brand" value={productForm.brand} onChange={(event) => setProductForm({ ...productForm, brand: event.target.value })} />
              <TextField multiline minRows={3} label="Description" value={productForm.description} onChange={(event) => setProductForm({ ...productForm, description: event.target.value })} />
              <TextField type="url" label="Image URL" value={productForm.image_url} onChange={(event) => setProductForm({ ...productForm, image_url: event.target.value })} />
              <Button component="label" variant="outlined">
                Upload image
                <input hidden name="image" type="file" accept="image/png,image/jpeg,image/webp" />
              </Button>
              <FormControlLabel control={<Switch checked={Boolean(productForm.featured)} onChange={(event) => setProductForm({ ...productForm, featured: event.target.checked })} />} label="Featured product" />
              <FormControlLabel control={<Switch checked={Boolean(productForm.status)} onChange={(event) => setProductForm({ ...productForm, status: event.target.checked })} />} label="Active in storefront" />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setProductDialog(false)}>Cancel</Button>
            <Button type="submit" variant="contained">{editingProduct ? 'Save changes' : 'Create product'}</Button>
          </DialogActions>
        </Box>
      </Dialog>

      <Dialog open={openInventoryDialog} onClose={() => setInventoryDialog(null)} fullWidth maxWidth="xs">
        <DialogTitle>Adjust stock</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <Typography>{inventoryDialog?.product?.name} · Current stock {inventoryDialog?.stock_quantity}</Typography>
            <TextField
              autoFocus
              type="number"
              label="Adjustment (use negative to subtract)"
              value={stockDelta}
              onChange={(event) => setStockDelta(event.target.value)}
              helperText="Enter a positive or negative whole number."
            />
            <TextField type="number" label="Reorder threshold" value={stockThreshold} onChange={(event) => setStockThreshold(event.target.value)} inputProps={{ min: 0 }} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setInventoryDialog(null)}>Cancel</Button>
          <Button variant="contained" disabled={!stockDelta || Number(stockDelta) === 0} onClick={() => handleAction(async () => {
            if (Number(stockDelta)) await api.patch(`/inventories/${inventoryDialog.id}/adjust`, { delta: Number(stockDelta) });
            await api.patch(`/inventories/${inventoryDialog.id}`, { reorder_level: Number(stockThreshold) });
            setInventoryDialog(null);
          }, 'Inventory updated.')}>Save adjustment</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(reviewDialog)} onClose={() => setReviewDialog(null)} fullWidth maxWidth="sm">
        <DialogTitle>Reply to customer review</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{reviewDialog?.comment || 'No written review.'}</Typography>
          <TextField fullWidth multiline minRows={4} label="Public reply" value={reviewReply} onChange={(event) => setReviewReply(event.target.value)} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReviewDialog(null)}>Cancel</Button>
          <Button variant="contained" onClick={async () => {
            const succeeded = await handleAction(
              () => api.patch(`/reviews/${reviewDialog.id}`, { admin_reply: reviewReply, moderation_status: 'approved' }),
              'Reply published.'
            );
            if (succeeded) setReviewDialog(null);
          }}>Publish reply</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={Boolean(notice)} autoHideDuration={3500} onClose={() => setNotice('')} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity="success" variant="filled" onClose={() => setNotice('')}>{notice}</Alert>
      </Snackbar>
    </Box>
  );
}

export default function AdminManagementPage() {
  return (
    <AdminGuard>
      <AdminManagementPageView />
    </AdminGuard>
  );
}
