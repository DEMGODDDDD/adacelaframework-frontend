import React from 'react';
import {
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Chip,
  IconButton,
  Rating,
  Stack,
  Tooltip,
  Typography,
  Button,
  Box,
} from '@mui/material';
import { Favorite, FavoriteBorder, ShoppingCartOutlined } from '@mui/icons-material';
import { getProductPrice } from '../../models/entities';
import { currency, FALLBACK_IMAGE, getMediaUrl } from './shopUtils';

const ProductCard = ({ product, wished, onAdd, onWish, onOpen }) => {
  const price = getProductPrice(product);
  const hasSale = product.sale_price !== null
    && product.sale_price !== undefined
    && Number(product.sale_price) < Number(product.price);
  const stock = Number(product.stock_quantity ?? 0);

  return (
    <Card
      elevation={0}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        border: '1px solid #D9E7F3',
        borderRadius: 3,
        overflow: 'hidden',
        transition: 'transform .2s ease, box-shadow .2s ease',
        '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 14px 30px rgba(7,28,58,.12)' },
      }}
    >
      <Box sx={{ position: 'relative' }}>
        <Box
          component="button"
          type="button"
          aria-label={`View ${product.name} details`}
          onClick={() => onOpen(product)}
          sx={{ display: 'block', width: '100%', p: 0, border: 0, bgcolor: 'transparent', cursor: 'pointer', textAlign: 'left' }}
        >
          <CardMedia
            component="img"
            height="190"
            loading="lazy"
            decoding="async"
            image={getMediaUrl(product.image || product.images?.[0]?.image) || FALLBACK_IMAGE}
            alt={product.name}
            onError={(event) => {
              event.currentTarget.onerror = null;
              event.currentTarget.src = FALLBACK_IMAGE;
            }}
            sx={{ objectFit: 'cover', bgcolor: '#EAF4FA' }}
          />
        </Box>
        {product.featured && (
          <Chip
            label="Featured"
            size="small"
            sx={{ position: 'absolute', top: 12, left: 12, bgcolor: '#22C7E0', color: '#071C3A', fontWeight: 800 }}
          />
        )}
        {hasSale && (
          <Chip
            label="Sale"
            size="small"
            sx={{ position: 'absolute', top: 12, right: 56, bgcolor: '#FFB020', color: '#071C3A', fontWeight: 800 }}
          />
        )}
        <Tooltip title={wished ? 'Remove from wishlist' : 'Add to wishlist'}>
          <IconButton
            aria-label={wished ? 'Remove from wishlist' : 'Add to wishlist'}
            onClick={() => onWish(product)}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              bgcolor: '#FFFFFF',
              color: wished ? '#FF5C5C' : '#0B2F5E',
              '&:hover': { bgcolor: '#F1F7FC' },
            }}
          >
            {wished ? <Favorite /> : <FavoriteBorder />}
          </IconButton>
        </Tooltip>
      </Box>
      <CardContent sx={{ flex: 1, px: 2.25, pt: 2 }}>
        <Typography variant="overline" sx={{ color: '#52708A', fontWeight: 800, letterSpacing: '.08em' }}>
          {product.category?.name || product.brand || 'Aquatics'}
        </Typography>
        <Typography
          component="button"
          onClick={() => onOpen(product)}
          sx={{
            border: 0,
            p: 0,
            display: 'block',
            width: '100%',
            color: '#071C3A',
            fontWeight: 800,
            fontSize: '1rem',
            textAlign: 'left',
            background: 'none',
            cursor: 'pointer',
            minHeight: 48,
            '&:hover': { color: '#1565D8' },
          }}
        >
          {product.name}
        </Typography>
        <Stack direction="row" spacing={0.75} sx={{ mt: 1, alignItems: 'center' }}>
          <Rating value={Number(product.average_rating || 0)} precision={0.5} size="small" readOnly />
          <Typography variant="caption" sx={{ color: '#567089' }}>
            {Number(product.average_rating || 0).toFixed(1)} ({product.reviews_count || 0})
          </Typography>
        </Stack>
        <Stack direction="row" spacing={1} sx={{ mt: 1.5, alignItems: 'baseline' }}>
          <Typography variant="h6" sx={{ color: '#0B2F5E', fontWeight: 900 }}>
            {currency.format(price)}
          </Typography>
          {hasSale && (
            <Typography variant="body2" sx={{ color: '#71869A', textDecoration: 'line-through' }}>
              {currency.format(Number(product.price))}
            </Typography>
          )}
        </Stack>
        <Typography
          variant="caption"
          sx={{
            display: 'block',
            mt: 1,
            fontWeight: 800,
            color: stock === 0 ? '#B42318' : stock <= 5 ? '#A65D00' : '#16804A',
          }}
        >
          {stock === 0 ? 'Out of Stock' : stock <= 5 ? `Only ${stock} left` : 'In stock'}
        </Typography>
      </CardContent>
      <CardActions sx={{ px: 2.25, pb: 2 }}>
        <Button
          fullWidth
          variant="contained"
          disabled={stock <= 0}
          startIcon={<ShoppingCartOutlined />}
          onClick={() => onAdd(product)}
          sx={{
            py: 1.1,
            borderRadius: 2,
            bgcolor: '#1565D8',
            fontWeight: 800,
            '&:hover': { bgcolor: '#0B2F5E' },
          }}
        >
          Add to Cart
        </Button>
      </CardActions>
    </Card>
  );
};

export default ProductCard;
