/**
 * Auth Store - Customer Authentication
 * 
 * Simple, clean, reactive state for customer sessions.
 * Token is stored under 'c_token' to avoid conflicts with admin token.
 */
import { reactive, computed } from 'vue';
import api from '../config/axios';
import { cartState } from './cart';
import { clearCustomerToken, getCustomerToken, setCustomerToken } from '../utils/customerSession.js';

const CUSTOMER_USER_KEY = 'c_user';

const getStoredUser = () => {
  try {
    const raw = localStorage.getItem(CUSTOMER_USER_KEY) || sessionStorage.getItem(CUSTOMER_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const getResponseUser = (payload) => payload?.user || payload?.customer || payload?.admin || payload?.data || null;

// ─── State ────────────────────────────────────────────────────────────────────
export const authState = reactive({
  token: getCustomerToken(),
  user: null,
  loading: false,
});

// ─── Computed ─────────────────────────────────────────────────────────────────
export const isLoggedIn = computed(() => !!authState.token);
export const currentUser = computed(() => authState.user);

// ─── Actions ──────────────────────────────────────────────────────────────────
export const authActions = {
  /**
   * Run on app mount to restore user from existing token
   */
  async init() {
    if (!authState.token) return;
    // The Mastergas auth contract returns the user with the login response and does
    // not expose a profile endpoint in the auth collection. Restore only the
    // session user; authentication itself always happens through the API.
    authState.user = getStoredUser();
    cartState.syncWithToken();
  },

  /**
   * Login with email & password
   */
  async login(credentials, options = {}) {
    authState.loading = true;
    try {
      const res = await api.post('/v1/login', credentials);
      this._setSession(res.data.token, getResponseUser(res.data), options.remember ?? true);
      return res.data;
    } finally {
      authState.loading = false;
    }
  },

  /**
   * Register a new customer
   */
  async register(data) {
    authState.loading = true;
    try {
      const res = await api.post('/v1/register', data);
      this._setSession(res.data.token, getResponseUser(res.data));
      return res.data;
    } finally {
      authState.loading = false;
    }
  },

  /**
   * Logout the current customer
   */
  async logout() {
    try {
      await api.post('/v1/logout');
    } catch (_) {
      // Even if the server call fails, clear locally
    }
    this._clearSession();
    window.location.href = '/';
  },

  // ─── Private Helpers ────────────────────────────────────────────────────────
  _setSession(token, user, remember = true) {
    authState.token = token;
    authState.user = user;
    setCustomerToken(token, remember);
    const storage = remember ? localStorage : sessionStorage;
    storage.setItem(CUSTOMER_USER_KEY, JSON.stringify(user || {}));
    // Preserve any guest cart/wishlist by moving it to the new token key
    cartState.migrateToToken(token);
    cartState.syncWithToken();
  },

  _clearSession() {
    // Clear the authenticated user's data before removing the token, otherwise
    // cartState would resolve the guest storage keys and leave user data behind.
    cartState.clear();
    authState.token = null;
    authState.user = null;
    clearCustomerToken();
    localStorage.removeItem(CUSTOMER_USER_KEY);
    sessionStorage.removeItem(CUSTOMER_USER_KEY);
  },
};
