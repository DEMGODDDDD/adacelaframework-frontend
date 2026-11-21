import React from 'react';
import { Box } from '@mui/material';

const UnderwaterBackground = ({ className, ...props }) => (
  <Box
    component="section"
    sx={{
      position: 'fixed',
      inset: 0,
      zIndex: -1,
      backgroundImage: `
        linear-gradient(135deg, rgba(7, 41, 74, 0.58) 0%, rgba(11, 60, 101, 0.32) 45%, rgba(26, 156, 200, 0.18) 100%),
        url('/images/ocean-background-optimized.jpg')
      `,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      ...props,
    }}
    className={className}
  />
);

export default UnderwaterBackground;
