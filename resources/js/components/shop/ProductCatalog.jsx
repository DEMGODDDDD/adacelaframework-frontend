import React from 'react';
import {
  Alert,
  Badge,
  Box,
  Button,
  CircularProgress,
  Container,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { Tune } from '@mui/icons-material';
import ProductCard from './ProductCard';
import ProductFiltersPanel from './ProductFiltersPanel';
import ScrollReveal from './ScrollReveal';

const ProductCatalog = ({
  contentColor,
  surfaceColor,
  isCustomer,
  setCurrentPage,
  setFilterOpen,
  filterOpen,
  error,
  loading,
  products,
  customerWishlistProductIds,
  handleAddToCart,
  handleWishlistToggle,
  onOpenProduct,
  pageCount,
  currentPage,
  pageNumbers,
  filterProps,
  activeFilterCount,
}) => (
  <Container maxWidth="xl" sx={{ py: { xs: 4, md: 6 }, scrollMarginTop: { xs: '120px', md: '96px' } }} id="product-catalog">
    <ScrollReveal distance={14}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3, justifyContent: 'space-between', alignItems: { sm: 'center' } }}>
        <Box>
          {!isCustomer && (
            <Typography variant="overline" sx={{ color: '#1565D8', fontWeight: 900, letterSpacing: '.14em' }}>
              Browse as a guest
            </Typography>
          )}
          <Typography variant="h4" sx={{ fontWeight: 900, color: contentColor }}>
            Shop All Products
          </Typography>
        </Box>
        <Badge
          badgeContent={activeFilterCount > 0 ? activeFilterCount : 0}
          color="primary"
          invisible={activeFilterCount === 0}
          sx={{
            '& .MuiBadge-badge': {
              minWidth: 18,
              height: 18,
              fontSize: 11,
              fontWeight: 800,
              right: 8,
              top: 8,
            },
          }}
        >
          <Button
            variant={activeFilterCount > 0 ? 'contained' : 'outlined'}
            startIcon={<Tune />}
            onClick={() => setFilterOpen((open) => !open)}
            sx={{
              minWidth: 132,
              borderRadius: 2,
              px: 2.2,
              py: 1,
              fontWeight: 800,
            }}
          >
            Filters
          </Button>
        </Badge>
      </Stack>
    </ScrollReveal>

    <ProductFiltersPanel {...filterProps} />

    {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

    {loading ? (
      <Stack sx={{ py: 10, alignItems: 'center' }}><CircularProgress /><Typography sx={{ mt: 2 }}>Loading the aquarium shop...</Typography></Stack>
    ) : (
      <>
        {products.length === 0 ? (
          <ScrollReveal>
            <Paper elevation={0} sx={{ p: 6, textAlign: 'center', bgcolor: surfaceColor, borderRadius: 3 }}>
              <Typography variant="h6" fontWeight={800}>No products match your filters.</Typography>
              <Typography color="text.secondary" sx={{ mt: 1 }}>Try a different category, search, or price range.</Typography>
            </Paper>
          </ScrollReveal>
        ) : (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(4, minmax(0, 1fr))' }, gap: 2.5 }}>
            {products.map((product, index) => (
              <ScrollReveal key={product.id} delay={Math.min(index * 70, 350)} distance={18} scale={0.985}>
                <ProductCard
                  product={product}
                  wished={customerWishlistProductIds.has(Number(product.id))}
                  onAdd={handleAddToCart}
                  onWish={handleWishlistToggle}
                  onOpen={onOpenProduct}
                />
              </ScrollReveal>
            ))}
          </Box>
        )}
        {pageCount > 1 && (
          <ScrollReveal>
            <Stack direction="row" spacing={1} sx={{ mt: 4, justifyContent: 'center' }}>
              <Button disabled={currentPage <= 1} onClick={() => setCurrentPage((page) => page - 1)}>Previous</Button>
              {pageNumbers.map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? 'contained' : 'outlined'}
                  onClick={() => setCurrentPage(page)}
                  sx={{ minWidth: 40 }}
                >
                  {page}
                </Button>
              ))}
              <Button disabled={currentPage >= pageCount} onClick={() => setCurrentPage((page) => page + 1)}>Next</Button>
            </Stack>
          </ScrollReveal>
        )}
      </>
    )}
  </Container>
);

export default ProductCatalog;
