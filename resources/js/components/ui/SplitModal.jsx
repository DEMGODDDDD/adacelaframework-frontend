import React from 'react';
import { Box, Paper } from '@mui/material';

const SplitModal = ({
  children,
  isOpen,
  isMobile,
  modalRef,
  sx = {},
  ...props
}) => {
  if (!isOpen) return null;

  return (
    <>
      <Box
        component="div"
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(7, 41, 74, 0.54)',
          backdropFilter: 'blur(5px)',
          zIndex: 1300,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: { xs: 2, sm: 3 },
        }}
      >
        <Box
          ref={modalRef}
          onClick={(event) => event.stopPropagation()}
          sx={{
            width: '100%',
            maxWidth: 900,
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <Paper
            elevation={0}
            variant="outlined"
            sx={{
              ...sx,
              position: 'relative',
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              borderRadius: 2,
              overflow: 'hidden',
              background: '#FFFFFF',
              border: '1px solid rgba(175, 228, 246, 0.72)',
              boxShadow: '0 24px 70px rgba(11, 60, 101, 0.32)',
              maxHeight: 'calc(100vh - 48px)',
              width: '100%',
            }}
            {...props}
          >
            <Box
              sx={{
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                width: '100%',
                minHeight: isMobile ? 'auto' : 560,
              }}
            >
              {children}
            </Box>
          </Paper>
        </Box>
      </Box>
    </>
  );
};

export default SplitModal;
