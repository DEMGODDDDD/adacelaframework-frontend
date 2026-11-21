import React from 'react';
import { Box, Typography } from '@mui/material';
import { Verified, LocalShipping, SupportAgent } from '@mui/icons-material';

const HeroBanner = () => {
  const items = [
    { icon: <Verified />, label: 'Curated aquatic livestock and supplies' },
    { icon: <LocalShipping />, label: 'Protected packing for local delivery' },
    { icon: <SupportAgent />, label: 'Care guidance from aquarium keepers' },
  ];

  return (
    <Box
      sx={{
        flex: 1,
        minHeight: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden',
        background: '#0B3C65',
        color: '#FFFFFF',
        p: { xs: 3, sm: 4, md: 5 },
      }}
    >
      <Box
        component="img"
        src="/images/goldfish.png"
        alt="Fancy goldfish underwater"
        sx={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: 'center',
          filter: 'brightness(1.12) saturate(1.08)',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, rgba(7, 41, 74, 0.72) 0%, rgba(11, 60, 101, 0.38) 46%, rgba(7, 41, 74, 0.76) 100%)',
        }}
      />

      <Box sx={{ position: 'relative', zIndex: 1 }}>
        <Typography
          variant="overline"
          sx={{
            color: '#AFE4F6',
            fontWeight: 700,
            letterSpacing: '0.12em',
          }}
        >
        </Typography>
        <Typography
          variant="h3"
          component="h1"
          sx={{
            mt: 2,
            maxWidth: 340,
            color: '#FFFFFF',
            fontSize: { xs: '1.95rem', md: '2.35rem' },
            lineHeight: 1.15,
            fontWeight: 900,
          }}
        >
          PREMIUM FISH AND EQUIPMENT,
           HEALTHIER TANKS.
        </Typography>
        <Typography
          variant="body1"
          sx={{
            mt: 2,
            mb: 6,
            maxWidth: 330,
            color: '#FFFFFF',
            fontWeight: 600,
          }}
        >
          Fish, tank essentials, and reef care products selected for serious aquarium keepers.
        </Typography>
      </Box>

      <Box sx={{ position: 'relative', zIndex: 1, display: 'grid', gap: 2.25, mt: { xs: 4, md: 0 } }}>
        {items.map((item) => (
          <Box
            key={item.label}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              color: '#FFFFFF',
            }}
          >
            <Box sx={{ color: '#AFE4F6', display: 'flex', alignItems: 'center', flexShrink: 0 }}>{item.icon}</Box>
            <Typography variant="body2" sx={{ color: 'inherit', fontWeight: 600 }}>
              {item.label}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default HeroBanner;
