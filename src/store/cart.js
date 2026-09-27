import { reactive, computed } from 'vue';
import api from '../config/axios';
import { productService } from '../services/productService';
import { getCheckoutOwner } from '../utils/checkoutSafety';
import { trackAddToCart, trackEvent } from '../utils/metaPixel';

// Per-token localStorage keys (shared-preferences style)
// Using the customer token guarantees the same cart is loaded even if authState.user
// hasn't been restored yet when this module first runs.
const TOKEN_KEY = 'c_token';

const getCartKey = () => {
  const token = localStorage.getItem(TOKEN_KEY);
  return token ? `cart_${token}` : 'cart_guest';
};

const getWishlistKey = () => {
  const token = localStorage.getItem(TOKEN_KEY);
  return token ? `wishlist_${token}` : 'wishlist_guest';
};

// Load with fallback to legacy keys ('cart' / 'wishlist') so existing carts
// saved before the per-token keys were introduced are migrated, not lost.
const parseStoredList = (raw, key) => {
  if (!raw) return [];
  try {
    const value = JSON.parse(raw);
    return Array.isArray(value) ? value : [];
  } catch (_) {
    localStorage.removeItem(key);
    return [];
  }
};

const loadWithMigration = (key, legacyKey) => {
  const raw = localStorage.getItem(key);
  if (raw) return parseStoredList(raw, key);
  const legacy = localStorage.getItem(legacyKey);
  if (legacy) {
    localStorage.setItem(key, legacy);
    localStorage.removeItem(legacyKey);
    return parseStoredList(legacy, key);
  }
  return [];
};

const normalizeCartItems = (items) => items
  .filter(item => item && typeof item === 'object' && item.id !== null && item.id !== undefined)
  .map(item => {
    const res = {
      ...item,
      quantity: Math.min(999, Math.max(1, Math.floor(Number(item.quantity) || 1))),
    };
    if (item.selectedAttributes && typeof item.selectedAttributes === 'object' && Object.keys(item.selectedAttributes).length > 0) {
      res.selectedAttributes = item.selectedAttributes;
      const attrKey = Object.keys(item.selectedAttributes).sort().map(k => `${k}:${item.selectedAttributes[k]}`).join('|');
      res.cart_item_key = item.cart_item_key || `${item.id}_${attrKey}`;
    } else if (item.cart_item_key) {
      res.cart_item_key = item.cart_item_key;
    }
    return res;
  });

const loadCart = () => normalizeCartItems(loadWithMigration(getCartKey(), 'cart'));
const loadWishlist = () => loadWithMigration(getWishlistKey(), 'wishlist');

export const cartState = reactive({
  items: loadCart(),
  wishlist: loadWishlist(),
  lastAddedProduct: null,
  showModal: false,

  // Simple methods
  addToCart(product, quantity = 1, selectedAttributes = null) {
    const token = localStorage.getItem('c_token');
    if (!token) {
      if (window.openAuthModal) window.openAuthModal();
      return;
    }
    const safeQuantity = Math.min(999, Math.max(1, Math.floor(Number(quantity) || 1)));
    
    // Normalize attributes
    const attrs = selectedAttributes && typeof selectedAttributes === 'object' && Object.keys(selectedAttributes).length > 0
      ? { ...selectedAttributes }
      : (product.selectedAttributes && typeof product.selectedAttributes === 'object' && Object.keys(product.selectedAttributes).length > 0
        ? { ...product.selectedAttributes }
        : null);

    const attrKey = attrs ? Object.keys(attrs).sort().map(k => `${k}:${attrs[k]}`).join('|') : '';
    const itemKey = attrs ? `${product.id}_${attrKey}` : null;

    const existing = this.items.find(item => {
      if (itemKey && item.cart_item_key) {
        return item.cart_item_key === itemKey;
      }
      if (!itemKey && !item.cart_item_key) {
        return item.id === product.id;
      }
      return false;
    });

    if (existing) {
      Object.assign(existing, { ...product, quantity: existing.quantity });
      if (attrs) {
        existing.selectedAttributes = attrs;
        existing.cart_item_key = itemKey;
      }
      existing.quantity = Math.min(999, existing.quantity + safeQuantity);
    } else {
      const newItem = {
        ...product,
        quantity: safeQuantity,
      };
      if (attrs) {
        newItem.selectedAttributes = attrs;
        newItem.cart_item_key = itemKey;
      }
      this.items.push(newItem);
    }
    this.lastAddedProduct = product;
    this.showModal = true;
    this.save();
    
    // Meta Pixel AddToCart Event
    trackAddToCart(product, safeQuantity);

    setTimeout(() => {
      this.showModal = false;
    }, 3500);
  },

  removeFromCart(identifier) {
    // If identifier matches cart_item_key, remove only that variant. Otherwise remove by product id.
    const hasKeyMatch = this.items.some(item => item.cart_item_key === identifier);
    if (hasKeyMatch) {
      this.items = this.items.filter(item => item.cart_item_key !== identifier);
    } else {
      this.items = this.items.filter(item => item.id !== identifier);
    }
    this.save();
  },

  updateQuantity(identifier, quantity) {
    const item = this.items.find(i => i.cart_item_key === identifier || i.id === identifier);
    if (item) {
      item.quantity = Math.min(999, Math.max(1, Math.floor(Number(quantity) || 1)));
      this.save();
    }
  },

  async refreshCartItems() {
    if (!this.items.length) return;

    const ownerToken = localStorage.getItem(TOKEN_KEY) || 'guest';
    const snapshotItems = this.items.map(item => ({ ...item }));

    try {
      const latestProducts = await Promise.all(
        snapshotItems.map(async (item) => {
          try {
            return await productService.getProductById(item.id);
          } catch (_) {
            return null;
          }
        })
      );

      // A request started for one account must never hydrate another account's cart.
      const currentToken = localStorage.getItem(TOKEN_KEY) || 'guest';
      if (currentToken !== ownerToken) return;

      this.items = snapshotItems.map((item, index) => {
        const latestProduct = latestProducts[index];
        return latestProduct ? { ...latestProduct, quantity: item.quantity } : item;
      });
      this.save();
    } catch (err) {
      console.error('Cart refresh failed', err);
    }
  },

  async toggleWishlist(product) {
    const token = localStorage.getItem('c_token');
    if (!token) {
      // User is not logged in, trigger auth modal
      if (window.openAuthModal) {
        window.openAuthModal();
      }
      return;
    }

    const index = this.wishlist.findIndex(item => item.id === product.id);
    if (index > -1) {
      this.wishlist.splice(index, 1);
    } else {
      this.wishlist.push(product);
      // Meta Pixel AddToWishlist Event
      trackEvent('AddToWishlist', {
        content_name: product.name || product.arabic_name || product.english_name || '',
        content_ids: [String(product.id || '')],
        content_type: 'product',
        value: parseFloat(product.sale_price || product.price || 0),
        currency: 'JOD',
      });
    }
    this.save();

    // Sync with backend if logged in
    try {
      await api.post('/frontend/wishlist/toggle', { product_id: product.id });
    } catch (err) {
      console.error('Wishlist sync failed', err);
    }
  },

  isInWishlist(productId) {
    return this.wishlist.some(item => item.id === productId);
  },

  save() {
    this.saveCart();
    this.saveWishlist();
  },

  saveCart() {
    localStorage.setItem(getCartKey(), JSON.stringify(this.items));
  },

  saveWishlist() {
    localStorage.setItem(getWishlistKey(), JSON.stringify(this.wishlist));
  },

  clearCart() {
    localStorage.removeItem(getCartKey());
    this.items = [];
  },

  clearWishlist() {
    localStorage.removeItem(getWishlistKey());
    this.wishlist = [];
  },

  // Remove only the quantities included in the confirmed order. This keeps
  // products added in another tab while checkout was processing. Always use
  // the latest persisted cart because this tab's reactive snapshot may be
  // stale when another tab has changed the cart.
  removePurchasedItems(purchasedItems = [], { expectedOwner = null } = {}) {
    if (expectedOwner && getCheckoutOwner(localStorage) !== expectedOwner) {
      throw new Error('Checkout owner changed before cart cleanup');
    }
    const purchasedQuantities = new Map();
    for (const purchasedItem of purchasedItems) {
      const productId = purchasedItem?.product_id ?? purchasedItem?.id;
      const quantity = Math.max(0, Number(purchasedItem?.quantity) || 0);
      if (productId === null || productId === undefined || quantity <= 0) continue;
      const normalizedProductId = String(productId);
      purchasedQuantities.set(
        normalizedProductId,
        (purchasedQuantities.get(normalizedProductId) || 0) + quantity
      );
    }

    const latestPersistedItems = loadCart();
    this.items = latestPersistedItems.flatMap((item) => {
      const purchasedQuantity = purchasedQuantities.get(String(item.id)) || 0;
      if (purchasedQuantity <= 0) return [item];
      const remainingQuantity = (Number(item.quantity) || 0) - purchasedQuantity;
      return remainingQuantity > 0 ? [{ ...item, quantity: remainingQuantity }] : [];
    });
    this.saveCart();
  },

  clear() {
    this.clearCart();
    this.clearWishlist();
  },

  // Reload cart/wishlist from storage using the current token key.
  // Called when auth state changes (login/logout/init).
  syncWithToken() {
    this.items = loadCart();
    this.wishlist = loadWishlist();
  },

  // When a guest logs in, copy any items saved under the guest key to the
  // new token-based key so the cart is not lost.
  migrateToToken(token) {
    if (!token) return;
    const guestCart = parseStoredList(localStorage.getItem('cart_guest'), 'cart_guest');
    const guestWishlist = parseStoredList(localStorage.getItem('wishlist_guest'), 'wishlist_guest');
    const tokenCartKey = `cart_${token}`;
    const tokenWishlistKey = `wishlist_${token}`;
    if (guestCart.length && !localStorage.getItem(tokenCartKey)) {
      localStorage.setItem(tokenCartKey, JSON.stringify(guestCart));
    }
    if (guestWishlist.length && !localStorage.getItem(tokenWishlistKey)) {
      localStorage.setItem(tokenWishlistKey, JSON.stringify(guestWishlist));
    }
    localStorage.removeItem('cart_guest');
    localStorage.removeItem('wishlist_guest');
  }
});

// Computed properties (safer as separate exports)
export const cartSubtotal = computed(() => {
  return cartState.items.reduce((sum, item) => {
    const price = parseFloat(item.price) || 0;
    const discount = parseFloat(item.discount) || 0;
    return sum + (price - discount) * item.quantity;
  }, 0);
});

export const cartTotal = computed(() => {
  return cartSubtotal.value;
});

export const cartCount = computed(() => {
  return cartState.items.length;
});

export const wishlistCount = computed(() => {
  return cartState.wishlist.length;
});

// For convenience, add them to cartState as well (reactive proxies)
Object.defineProperty(cartState, 'subtotal', { get: () => cartSubtotal.value });
Object.defineProperty(cartState, 'total', { get: () => cartTotal.value });
Object.defineProperty(cartState, 'count', { get: () => cartCount.value });
Object.defineProperty(cartState, 'wishlistCount', { get: () => wishlistCount.value });
