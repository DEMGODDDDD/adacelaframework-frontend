export const entityModels = {
  users: {
    primaryKey: 'id',
    fields: ['first_name', 'last_name', 'email', 'password', 'avatar', 'role'],
    relationships: {
      orders: ['hasMany', 'orders', 'user_id'],
      cart: ['hasOne', 'carts', 'user_id'],
      wishlist: ['hasMany', 'wishlists', 'user_id'],
      reviews: ['hasMany', 'reviews', 'user_id'],
    },
  },
  categories: {
    primaryKey: 'id',
    fields: ['name', 'description', 'image', 'status'],
    relationships: {
      products: ['hasMany', 'products', 'category_id'],
    },
  },
  products: {
    primaryKey: 'id',
    fields: ['category_id', 'name', 'sku', 'description', 'brand', 'price', 'sale_price', 'status', 'featured'],
    relationships: {
      category: ['belongsTo', 'categories', 'category_id'],
      inventory: ['hasOne', 'inventories', 'product_id'],
      cartItems: ['hasMany', 'cart_items', 'product_id'],
      orderItems: ['hasMany', 'order_items', 'product_id'],
      wishlist: ['hasMany', 'wishlists', 'product_id'],
      reviews: ['hasMany', 'reviews', 'product_id'],
    },
  },
  inventories: {
    primaryKey: 'id',
    fields: ['stock_quantity', 'updated_at'],
    relationships: {
      product: ['belongsTo', 'products', 'product_id'],
    },
  },
  carts: {
    primaryKey: 'id',
    fields: ['user_id'],
    relationships: {
      user: ['belongsTo', 'users', 'user_id'],
      items: ['hasMany', 'cart_items', 'cart_id'],
    },
  },
  cartItems: {
    primaryKey: 'id',
    fields: ['cart_id', 'product_id', 'quantity'],
    relationships: {
      cart: ['belongsTo', 'carts', 'cart_id'],
      product: ['belongsTo', 'products', 'product_id'],
    },
  },
  orders: {
    primaryKey: 'id',
    fields: ['user_id', 'status', 'payment_method', 'shipping_address', 'shipping_phone', 'subtotal', 'shipping_fee', 'tax', 'total'],
    relationships: {
      user: ['belongsTo', 'users', 'user_id'],
      items: ['hasMany', 'order_items', 'order_id'],
      reviews: ['hasMany', 'reviews', 'order_id'],
    },
  },
  orderItems: {
    primaryKey: 'id',
    fields: ['order_id', 'product_id', 'quantity', 'price', 'total'],
    relationships: {
      order: ['belongsTo', 'orders', 'order_id'],
      product: ['belongsTo', 'products', 'product_id'],
    },
  },
  wishlist: {
    primaryKey: 'id',
    fields: ['user_id', 'product_id'],
    relationships: {
      user: ['belongsTo', 'users', 'user_id'],
      product: ['belongsTo', 'products', 'product_id'],
    },
  },
  reviews: {
    primaryKey: 'id',
    fields: ['user_id', 'product_id', 'order_id', 'rating', 'comment'],
    relationships: {
      user: ['belongsTo', 'users', 'user_id'],
      product: ['belongsTo', 'products', 'product_id'],
      order: ['belongsTo', 'orders', 'order_id'],
    },
  },
};

export const getProductPrice = (product) => Number(product?.final_price ?? product?.sale_price ?? product?.price ?? 0);
