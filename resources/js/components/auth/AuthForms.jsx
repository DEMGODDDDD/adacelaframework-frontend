import React, { useState, useRef } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  InputAdornment,
  IconButton,
  FormControlLabel,
  Checkbox,
  Link,
} from '@mui/material';
import {
  Person,
  Lock,
  EmailOutlined,
  PersonAdd,
  Visibility,
  VisibilityOff,
  AdminPanelSettings,
  Pets,
  ArrowForward,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

const AuthForms = ({ mode, onSubmit, onSwitchMode, error, success, isLoading }) => {
  const colors = {
    navy: '#0B3C65',
    navyDark: '#07294A',
    cyan: '#1A9CC8',
    aqua: '#27AED2',
    pale: '#AFE4F6',
    slate: '#476B7F',
    border: '#A9DDEB',
    danger: '#B91C1C',
  };
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    rememberMe: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const formRef = useRef(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (mode !== 'guest' && mode !== 'admin') {
      if (mode === 'register') {
        if (!formData.name.trim()) newErrors.name = 'Full name is required';
        else if (formData.name.trim().length < 2) newErrors.name = 'Name must be at least 2 characters';
      }

      if (!formData.email.trim()) newErrors.email = 'Email is required';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email format';

      if (!formData.password) newErrors.password = 'Password is required';
      else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
      else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
        newErrors.password = 'Password must contain uppercase, lowercase, and number';
      }

      if (mode === 'register' && formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    if (mode === 'admin') {
      if (!formData.username.trim()) newErrors.username = 'Admin username is required';
      if (!formData.password) newErrors.password = 'Admin password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      const submitData = { ...formData };
      if (mode === 'register' || mode === 'login') {
        delete submitData.confirmPassword;
        delete submitData.rememberMe;
      } else if (mode === 'guest') {
        submitData.mode = 'guest';
      } else if (mode === 'admin') {
        delete submitData.confirmPassword;
        delete submitData.rememberMe;
      }
      onSubmit(submitData, mode);
    }
  };

  const getModeConfig = () => {
    switch (mode) {
      case 'login':
        return {
          title: 'Welcome Back',
          subtitle: 'Sign in to your account',
          icon: <Person sx={{ fontSize: 38, color: colors.cyan }} />,
          submitLabel: 'Sign In',
          showRegisterLink: true,
        };
      case 'register':
        return {
          title: 'Create Account',
          subtitle: 'Join Dem Aquatics today',
          icon: <PersonAdd sx={{ fontSize: 38, color: colors.cyan }} />,
          submitLabel: 'Create Account',
          showLoginLink: true,
        };
      case 'guest':
        return {
          title: 'Enter as Guest',
          subtitle: 'Browse our collection without an account',
          icon: <Pets sx={{ fontSize: 38, color: colors.aqua }} />,
          submitLabel: 'Continue as Guest',
          isGuest: true,
        };
      case 'admin':
        return {
          title: 'Admin Access',
          subtitle: 'Administrator login required',
          icon: <AdminPanelSettings sx={{ fontSize: 38, color: colors.navy }} />,
          submitLabel: 'Access Admin Panel',
        };
      default:
        return {};
    }
  };

  const config = getModeConfig();

  const inputFields = () => {
    if (mode === 'guest') return null;

    return (
      <>
        {(mode === 'register') && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <TextField
              fullWidth
              label="Full Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              error={!!errors.name}
              helperText={errors.name}
              margin="normal"
              variant="outlined"
              size="small"
              slotProps={{
                input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Person sx={{ color: colors.slate }} />
                  </InputAdornment>
                ),
                },
              }}
              autoComplete="name"
              autoFocus
            />
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: mode === 'register' ? 0.2 : 0.1 }}
        >
          <TextField
            fullWidth
            label={mode === 'admin' ? 'Admin username or email' : 'Email Address'}
            name={mode === 'admin' ? 'username' : 'email'}
            type={mode === 'admin' ? 'text' : 'email'}
            value={mode === 'admin' ? formData.username : formData.email}
            onChange={handleChange}
            error={!!errors[mode === 'admin' ? 'username' : 'email']}
            helperText={errors[mode === 'admin' ? 'username' : 'email']}
            margin="normal"
            variant="outlined"
            size="small"
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    {mode === 'admin'
                      ? <Person sx={{ color: colors.slate }} />
                      : <EmailOutlined sx={{ color: colors.slate }} />}
                  </InputAdornment>
                ),
              },
            }}
            autoComplete={mode === 'admin' ? 'username' : 'email'}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <TextField
            fullWidth
            label="Password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={handleChange}
            error={!!errors.password}
            helperText={errors.password}
            margin="normal"
            variant="outlined"
            size="small"
            slotProps={{
              input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Lock sx={{ color: colors.slate }} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                    aria-label="Toggle password visibility"
                    sx={{ color: colors.slate }}
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
              },
            }}
            autoComplete={mode === 'login' || mode === 'admin' ? 'current-password' : 'new-password'}
          />
        </motion.div>

        {(mode === 'register') && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <TextField
              fullWidth
              label="Confirm Password"
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={handleChange}
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword}
              margin="normal"
              variant="outlined"
              size="small"
              slotProps={{
                input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock sx={{ color: colors.slate }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      edge="end"
                      aria-label="Toggle password visibility"
                      sx={{ color: colors.slate }}
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
                  },
                }}
              autoComplete="new-password"
            />
          </motion.div>
        )}

        {(mode === 'login' || mode === 'register') && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
          >
            <FormControlLabel
              control={
                <Checkbox
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  color="primary"
                  sx={{ '& .MuiSvgIcon-root': { color: colors.cyan } }}
                />
              }
              label="Remember me for 30 days"
              labelPlacement="end"
              sx={{ mt: 1 }}
            />
          </motion.div>
        )}
      </>
    );
  };

  const switchLinks = () => {
    if (config.showRegisterLink) {
      return (
        <Typography variant="body2" align="center" sx={{ mt: 3 }}>
          Don't have an account?{' '}
          <Link
            onClick={(e) => {
              e.preventDefault();
              setFormData({ name: '', email: '', username: '', password: '', confirmPassword: '', rememberMe: false });
              setErrors({});
              onSwitchMode?.(1);
            }}
            sx={{ fontWeight: 800, textDecoration: 'none', color: colors.cyan, cursor: 'pointer' }}
          >
            Create an account
          </Link>
        </Typography>
      );
    }
    if (config.showLoginLink) {
      return (
        <Typography variant="body2" align="center" sx={{ mt: 3 }}>
          Already have an account?{' '}
          <Link
            onClick={(e) => {
              e.preventDefault();
              setFormData({ name: '', email: '', username: '', password: '', confirmPassword: '', rememberMe: false });
              setErrors({});
              onSwitchMode?.(0);
            }}
            sx={{ fontWeight: 800, textDecoration: 'none', color: colors.cyan, cursor: 'pointer' }}
          >
            Sign in
          </Link>
        </Typography>
      );
    }
    return null;
  };

  return (
    <Box ref={formRef} component="form" onSubmit={handleSubmit} noValidate sx={{ width: '100%' }}>
      <AnimatePresence mode="wait">
        {error && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <Alert severity="error" sx={{ mb: 3, borderRadius: 1.5 }} icon={<Lock sx={{ color: colors.danger }} />}>
              {error}
            </Alert>
          </motion.div>
        )}
        {success && (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <Alert severity="success" sx={{ mb: 3, borderRadius: 1.5 }}>
              {success}
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      <Box>
        <AnimatePresence mode="wait">
          {inputFields()}
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
        >
          <Button
            type="submit"
            fullWidth
            size="large"
            variant="contained"
            disabled={isLoading}
            startIcon={isLoading || mode !== 'admin' ? null : <AdminPanelSettings />}
            endIcon={isLoading ? null : <ArrowForward />}
            sx={{
              py: 1.35,
              fontSize: '1rem',
              fontWeight: 700,
              borderRadius: 1.5,
              px: 2.5,
              color: '#FFFFFF',
              backgroundColor: '#12417F',
              border: '1px solid #0B2F5E',
              boxShadow: '0 4px 12px rgba(11, 47, 94, 0.2)',
              transition: 'background-color 180ms ease, box-shadow 180ms ease',
              '&:hover': {
                backgroundColor: '#1565D8',
                boxShadow: '0 6px 16px rgba(11, 47, 94, 0.28)',
              },
              '&:active': {
                backgroundColor: '#0B2F5E',
                boxShadow: '0 2px 6px rgba(11, 47, 94, 0.24)',
              },
              '&:focus-visible': {
                outline: '3px solid rgba(21, 101, 216, 0.35)',
                outlineOffset: 2,
              },
              '&:disabled': {
                color: '#FFFFFF',
                backgroundColor: '#54718D',
                boxShadow: 'none',
              },
            }}
          >
            {isLoading ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  sx={{
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    border: '3px solid rgba(255,255,255,0.3)',
                    borderTopColor: 'white',
                    animation: 'spin 1s linear infinite',
                  }}
                />
                <span>Processing...</span>
              </Box>
            ) : config.submitLabel}
          </Button>
        </motion.div>

        {switchLinks()}

      </Box>
    </Box>
  );
};

export default AuthForms;
