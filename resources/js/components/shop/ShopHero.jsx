import React from 'react';
import { Box, Button, Container, Stack, Typography } from '@mui/material';
import { ArrowForward } from '@mui/icons-material';
import ScrollReveal from './ScrollReveal';

const ShopHero = ({ onShopProducts }) => (
  <ScrollReveal distance={16}>
    <Box
      sx={{
        position: 'relative',
        overflow: 'hidden',
        backgroundImage: "url('/images/arowana-hero-banner.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        color: '#FFFFFF',
        py: { xs: 7, md: 10 },
        minHeight: { md: 520 },
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <Container maxWidth="xl">
        <Stack direction="row" sx={{ alignItems: 'center' }}>
          <Box sx={{ maxWidth: 650 }}>
          <Typography variant="overline" sx={{ color: '#A8F3FF', fontWeight: 900, letterSpacing: '.18em', textShadow: '0 2px 8px rgba(0,0,0,.65)' }}>DEMGOD AQUATICS</Typography>
          <Typography variant="h1" sx={{ mt: 1, color: '#FFFFFF', fontWeight: 900, fontSize: { xs: '2.6rem', md: '4rem' }, lineHeight: 1.05 }}>
            Rule Your Reef.<br />Every Fish, <Box component="span" sx={{ color: '#8FE9F2' }}>Guaranteed.</Box>
          </Typography>
          <Typography sx={{ mt: 2, maxWidth: 590, color: '#FFFFFF', fontSize: { xs: '1rem', md: '1.15rem' }, lineHeight: 1.7, fontWeight: 500, textShadow: '0 2px 8px rgba(0,0,0,.7)' }}>
            Live fish, curated tanks, and everything your aquascape needs, hand-picked for healthier, happier tanks.
          </Typography>
          <Stack direction="row" sx={{ mt: 3, alignItems: 'center' }}>
            <Button
              variant="contained"
              onClick={onShopProducts}
              endIcon={<ArrowForward />}
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1,
                px: 2.5,
                py: 1.25,
                border: '1px solid rgba(255, 255, 255, 0.03)',
                borderRadius: 2,
                bgcolor: 'rgba(255, 255, 255, 0.06)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                color: '#fafafa',
                fontWeight: 900,
                boxShadow: '0 8px 24px rgba(0,0,0,.16)',
                '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.24)' },
              }}
            >
              Shop Products
            </Button>
          </Stack>
          <Stack direction="row" spacing={{ xs: 3, md: 5 }} sx={{ mt: 4, alignItems: 'center' }}>
            {[
              ['40k+', 'Tanks delivered'],
              ['98%', 'Live arrival rate'],
              ['4.9/5', 'Customer rating'],
            ].map(([value, label]) => (
              <Box key={label}>
                <Typography variant="h5" fontWeight={900} sx={{ color: '#FFFFFF', textShadow: '0 2px 8px rgba(0,0,0,.65)' }}>{value}</Typography>
                <Typography variant="caption" sx={{ color: '#FFFFFF', fontWeight: 600, textShadow: '0 2px 8px rgba(0,0,0,.75)' }}>{label}</Typography>
              </Box>
            ))}
          </Stack>
          </Box>
        </Stack>
      </Container>
    </Box>
  </ScrollReveal>
);

export default ShopHero;
