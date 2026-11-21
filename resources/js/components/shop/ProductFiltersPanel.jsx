import React, { useState } from 'react';
import {
  Box,
  Button,
  Divider,
  Drawer,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Rating,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { Close, Tune } from '@mui/icons-material';
import { currency } from './shopUtils';

const ProductFiltersPanel = ({
  categories,
  selectedCategory,
  setSelectedCategory,
  setCurrentPage,
  priceRange,
  setPriceRange,
  minimumRating,
  setMinimumRating,
  sort,
  setSort,
  setQuery,
  setDebouncedQuery,
  filterOpen,
  setFilterOpen,
  surfaceColor,
  contentColor,
}) => {
  const [draftSort, setDraftSort] = useState(sort);
  const [draftCategory, setDraftCategory] = useState(selectedCategory ?? '');
  const [draftMinPrice, setDraftMinPrice] = useState(String(priceRange[0]));
  const [draftMaxPrice, setDraftMaxPrice] = useState(String(priceRange[1]));
  const [draftMinimumRating, setDraftMinimumRating] = useState(minimumRating);

  React.useEffect(() => {
    if (!filterOpen) return;
    setDraftSort(sort);
    setDraftCategory(selectedCategory ?? '');
    setDraftMinPrice(String(priceRange[0]));
    setDraftMaxPrice(String(priceRange[1]));
    setDraftMinimumRating(minimumRating);
  }, [filterOpen, sort, selectedCategory, priceRange, minimumRating]);

  const minPriceValue = Number(draftMinPrice);
  const maxPriceValue = Number(draftMaxPrice);
  const minPriceValid = draftMinPrice !== ''
    && Number.isFinite(minPriceValue)
    && minPriceValue >= 0
    && minPriceValue <= 5000;
  const maxPriceValid = draftMaxPrice !== ''
    && Number.isFinite(maxPriceValue)
    && maxPriceValue >= 0
    && maxPriceValue <= 5000;
  const priceRangeValid = minPriceValid
    && maxPriceValid
    && minPriceValue <= maxPriceValue;

  const updatePriceInput = (setValue) => (event) => {
    const value = event.target.value;
    if (value === '') {
      setValue('');
      return;
    }

    const parsedValue = Number(value);
    setValue(Number.isFinite(parsedValue) ? String(Math.max(0, parsedValue)) : '0');
  };

  const resetFilters = () => {
    setDraftSort('latest');
    setDraftCategory('');
    setDraftMinPrice('0');
    setDraftMaxPrice('5000');
    setDraftMinimumRating(0);
    setPriceRange([0, 5000]);
    setMinimumRating(0);
    setSelectedCategory(null);
    setSort('latest');
    setQuery('');
    setDebouncedQuery('');
    setCurrentPage(1);
    setFilterOpen(false);
  };

  const applyFilters = () => {
    setSort(draftSort);
    setSelectedCategory(draftCategory || null);
    setPriceRange([minPriceValue, maxPriceValue]);
    setMinimumRating(draftMinimumRating);
    setCurrentPage(1);
    setFilterOpen(false);
  };

  return (
    <Drawer
      anchor="right"
      open={filterOpen}
      onClose={() => setFilterOpen(false)}
      transitionDuration={250}
      sx={{
        '& .MuiDrawer-paper': {
          width: { xs: '100vw', sm: 'min(90vw, 360px)', md: 400 },
          maxWidth: '100vw',
          minWidth: 0,
          boxSizing: 'border-box',
          p: 3,
          bgcolor: surfaceColor,
          color: contentColor,
          borderLeft: '1px solid rgba(22, 93, 156, 0.18)',
          overflowX: 'clip',
        },
      }}
    >
      <Stack sx={{ height: '100%', minWidth: 0 }}>
        <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center' }}>
            <Tune color="primary" />
            <Typography variant="h6" sx={{ fontWeight: 900 }}>Filters</Typography>
          </Stack>
          <IconButton onClick={() => setFilterOpen(false)} aria-label="Close filters" size="small">
            <Close fontSize="small" />
          </IconButton>
        </Stack>

        <Divider sx={{ mb: 3 }} />

        <Stack spacing={2.5} sx={{ flex: 1, minWidth: 0, width: '100%', overflowX: 'clip' }}>
          <FormControl size="small" fullWidth>
            <InputLabel id="filter-sort-label">Sort by</InputLabel>
            <Select
              labelId="filter-sort-label"
              value={draftSort}
              label="Sort by"
              onChange={(event) => setDraftSort(event.target.value)}
            >
              <MenuItem value="latest">Newest</MenuItem>
              <MenuItem value="price_low">Price: Low to High</MenuItem>
              <MenuItem value="price_high">Price: High to Low</MenuItem>
              <MenuItem value="rating">Highest Rated</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" fullWidth>
            <InputLabel id="filter-category-label">Category</InputLabel>
            <Select
              labelId="filter-category-label"
              value={draftCategory}
              label="Category"
              onChange={(event) => setDraftCategory(event.target.value)}
            >
              <MenuItem value="">All categories</MenuItem>
              {categories.map((category) => (
                <MenuItem key={category.id} value={category.id}>{category.name}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box>
            <Stack
              spacing={1}
              sx={{ minWidth: 0 }}
            >
              <Typography variant="subtitle2" fontWeight={900}>Price range</Typography>
              <Stack direction="row" spacing={1.5} sx={{ minWidth: 0 }}>
                <TextField
                  label="Minimum"
                  type="number"
                  size="small"
                  fullWidth
                  value={draftMinPrice}
                  onChange={updatePriceInput(setDraftMinPrice)}
                  error={!minPriceValid || (maxPriceValid && minPriceValue > maxPriceValue)}
                  helperText={!minPriceValid ? 'Enter ₱0–₱5,000' : (maxPriceValid && minPriceValue > maxPriceValue ? 'Must not exceed maximum' : ' ')}
                  inputProps={{ min: 0, max: 5000, step: 0.01, 'aria-label': 'Minimum price' }}
                  InputProps={{ startAdornment: <InputAdornment position="start">₱</InputAdornment> }}
                />
                <TextField
                  label="Maximum"
                  type="number"
                  size="small"
                  fullWidth
                  value={draftMaxPrice}
                  onChange={updatePriceInput(setDraftMaxPrice)}
                  error={!maxPriceValid || (minPriceValid && maxPriceValue < minPriceValue)}
                  helperText={!maxPriceValid ? 'Enter ₱0–₱5,000' : (minPriceValid && maxPriceValue < minPriceValue ? 'Must exceed minimum' : ' ')}
                  inputProps={{ min: 0, max: 5000, step: 0.01, 'aria-label': 'Maximum price' }}
                  InputProps={{ startAdornment: <InputAdornment position="start">₱</InputAdornment> }}
                />
              </Stack>
              <Typography variant="caption" color="text.secondary">
                Amounts must be between {currency.format(0)} and {currency.format(5000)}.
              </Typography>
            </Stack>
          </Box>

          <Box>
            <Typography variant="subtitle2" fontWeight={900} sx={{ mb: 1 }}>Minimum rating</Typography>
            <Rating
              value={draftMinimumRating}
              onChange={(_, value) => setDraftMinimumRating(value || 0)}
            />
          </Box>
        </Stack>

        <Stack spacing={2} sx={{ mt: 3 }}>
          <Button fullWidth variant="text" onClick={resetFilters} sx={{ justifyContent: 'center', fontWeight: 700 }}>
            Clear Filters
          </Button>
          <Button fullWidth variant="contained" onClick={applyFilters} disabled={!priceRangeValid} sx={{ borderRadius: 2, fontWeight: 800 }}>
            Apply Filters
          </Button>
        </Stack>
      </Stack>
    </Drawer>
  );
};

export default ProductFiltersPanel;
