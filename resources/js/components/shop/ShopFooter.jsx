import React from 'react';
import { Box, Container, Stack, Typography } from '@mui/material';
import ScrollReveal from './ScrollReveal';

const ShopFooter = () => (
  <ScrollReveal>
    <Box component="footer" sx={{ bgcolor: '#071C3A', color: '#FFFFFF', py: 4 }}>
      <Container maxWidth="xl">
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ justifyContent: 'space-between' }}>
          <Box>
            <Typography fontWeight={900}>DEMGOD AQUATICS</Typography>
            <Typography variant="body2" sx={{ mt: 0.75, color: '#DCEBFA' }}>Thoughtful aquatics for healthier tanks.</Typography>
          </Box>
          <Typography variant="body2" sx={{ color: '#DCEBFA' }}>Customer support · support@demgod.com</Typography>
        </Stack>
      </Container>
    </Box>
  </ScrollReveal>
);

export default ShopFooter;
