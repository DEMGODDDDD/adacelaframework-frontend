import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  Divider,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  PersonOutlineOutlined as GuestIcon,
  PersonAdd,
  Person,
  AdminPanelSettings,
  TrendingUp,
  Favorite,
  LocalShipping,
  Verified,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import AuthForms from '../components/auth/AuthForms';
import HeroBanner from '../components/ui/HeroBanner';
import UnderwaterBackground from '../components/ui/UnderwaterBackground';
import SplitModal from '../components/ui/SplitModal';
import { useAuth } from '../hooks/useAuth';
import { refreshAdminGreeting } from '../services/adminGreeting';

const WelcomePage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [activeTab, setActiveTab] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(true);
  const modalRef = useRef(null);

  const { user, isAuthenticated, login, register, loginAdmin } = useAuth();

  const tabs = [
    { id: 'login', label: 'Login', icon: <Person />, desc: 'Welcome back! Sign in to your account' },
    { id: 'register', label: 'Sign Up', icon: <PersonAdd />, desc: 'Create your account and start exploring' },
    { id: 'guest', label: 'Guest', icon: <GuestIcon />, desc: 'Browse our collection without an account' },
    { id: 'admin', label: 'Admin', icon: <AdminPanelSettings />, desc: 'Administrator access only' },
  ];

  const handleAuthSubmit = async (formData, type) => {
    setIsLoading(true);
    setError('');
    setSuccess('');
    try {
      if (type === 'login') {
        await login(formData.email, formData.password);
        setSuccess('Welcome back! Redirecting...');
      } else if (type === 'register') {
        await register(formData.name, formData.email, formData.password);
        setSuccess('Account created! Redirecting to the shop...');
      } else if (type === 'guest') {
        setSuccess('Entering as guest...');
        window.location.href = '/shop';
      } else if (type === 'admin') {
        const result = await loginAdmin(formData.username, formData.password);
        if (result.user?.role === 'admin') {
          refreshAdminGreeting();
          setSuccess('Admin access granted. Redirecting...');
          setTimeout(() => window.location.href = '/admin', 1500);
        } else {
          throw new Error('Admin access required');
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      const destination = user?.role === 'admin' ? '/admin' : '/shop';
      window.location.replace(destination);
    }
  }, [isAuthenticated, user]);

  const modalContent = (
    <>
      <Box sx={{ flex: isMobile ? '1 1 100%' : '0 0 38%', display: 'flex', flexDirection: 'column' }}>
        <HeroBanner />
      </Box>
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          p: { xs: 3, sm: 4, md: 5 },
          overflow: 'auto',
          bgcolor: '#FFFFFF',
        }}
      >
        <Box sx={{ mb: 3, pr: 5 }}>
          <Typography
            variant="h4"
            component="h2"
            sx={{
              color: '#0e1d29',
              fontFamily: '"Signate Grotesk", "Poppins", sans-serif',
              fontWeight: 800,
              mb: 1,
            }}
          >
            Dem Aquatics
          </Typography>
          <Typography variant="body1" sx={{ color: '#13222b', fontWeight: 400 }}>
            {tabs[activeTab].desc}
          </Typography>
        </Box>

        <Divider sx={{ mb: 2.5, borderColor: '#B8E2EE' }} />

        <Tabs
          value={activeTab}
          onChange={(e, value) => setActiveTab(value)}
          variant="fullWidth"
          sx={{
            minHeight: 44,
            '& .MuiTabs-indicator': {
              height: 3,
              background: 'linear-gradient(90deg, #1A9CC8 0%, #27AED2 100%)',
            },
            '& .MuiTab-root': {
              minHeight: 44,
              fontSize: '0.875rem',
              textTransform: 'none',
              fontWeight: 700,
              color: '#476B7F',
              opacity: 1,
              whiteSpace: 'nowrap',
              transition: 'color 180ms ease',
              '& .MuiTab-iconWrapper': {
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                marginBottom: 0,
              },
              '&:hover, &:focus-visible, &:active': {
                color: '#0B3C65',
                opacity: 1,
              },
              '&.Mui-selected': {
                color: '#0B3C65',
                fontWeight: 900,
                opacity: 1,
              },
            },
          }}
        >
          {tabs.map((tab) => (
            <Tab
              key={tab.id}
              label={(
                <Box
                  component="span"
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 1,
                    width: '100%',
                    lineHeight: 1.2,
                    whiteSpace: 'nowrap',
                  }}
                >
                  <Box component="span" sx={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                    {tab.icon}
                  </Box>
                  <Box component="span">{tab.label}</Box>
                </Box>
              )}
            />
          ))}
        </Tabs>

        <Box sx={{ mt: 2.5 }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
            >
              <AuthForms
                mode={tabs[activeTab].id}
                onSubmit={handleAuthSubmit}
                onSwitchMode={setActiveTab}
                error={error}
                success={success}
                isLoading={isLoading}
              />
            </motion.div>
          </AnimatePresence>
        </Box>

        {tabs[activeTab].id === 'admin' && (
          <Box sx={{ mt: 3, p: 2, backgroundColor: '#F0F8FC', border: '1px solid #B8E2EE', borderRadius: 1.5 }}>
            <Typography variant="body2" sx={{ color: '#0B3C65' }}>
              <strong>Admin Access:</strong> Requires valid administrator credentials.
              Contact system administrator for access.
            </Typography>
          </Box>
        )}
      </Box>
    </>
  );

  return (
    <Box sx={{ minHeight: '100vh', position: 'relative' }}>
      <UnderwaterBackground />

      <Box
        component="main"
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          px: { xs: 2, sm: 3 },
          py: 4,
          position: 'relative',
          zIndex: 1,
        }}
      >
        {showModal && (
          <SplitModal
            isOpen={showModal}
            isMobile={isMobile}
            modalRef={modalRef}
            sx={{
              maxWidth: { xs: '100%', md: 900 },
            }}
          >
            {modalContent}
          </SplitModal>
        )}

        {!showModal && isAuthenticated && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="welcome-success"
          >
            <Paper
              elevation={3}
              sx={{
                maxWidth: 500,
                width: '100%',
                p: 5,
                textAlign: 'center',
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(175, 228, 246, 0.5)',
              }}
            >
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #1A9CC8, #27AED2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 3,
                }}
              >
                <Verified sx={{ fontSize: 40, color: 'white' }} />
              </Box>
              <Typography variant="h4" component="h2" sx={{ fontWeight: 800, mb: 2 }}>
                Welcome{user?.role === 'admin' ? ', Admin' : ''}!
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                Redirecting you to your dashboard...
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    p: 1,
                    backgroundColor: 'rgba(26, 156, 200, 0.1)',
                    borderRadius: 2,
                  }}
                >
                  <TrendingUp sx={{ fontSize: 20, color: '#1A9CC8' }} />
                  <Typography variant="body2" color="#1A9CC8">Live Stats</Typography>
                </Box>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    p: 1,
                    backgroundColor: 'rgba(39, 174, 210, 0.1)',
                    borderRadius: 2,
                  }}
                >
                  <Favorite sx={{ fontSize: 20, color: '#27AED2' }} />
                  <Typography variant="body2" color="#27AED2">Wishlist</Typography>
                </Box>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    p: 1,
                    backgroundColor: 'rgba(11, 60, 101, 0.1)',
                    borderRadius: 2,
                  }}
                >
                  <LocalShipping sx={{ fontSize: 20, color: '#0B3C65' }} />
                  <Typography variant="body2" color="#0B3C65">Fast Delivery</Typography>
                </Box>
              </Box>
            </Paper>
          </motion.div>
        )}
      </Box>
    </Box>
  );
};

export default WelcomePage;
