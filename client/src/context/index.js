import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { translations } from '../i18n/translations';
import io from 'socket.io-client';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

// ─── LANG ──────────────────────────────────────────────
const LangCtx = createContext();
export const LangProvider = ({ children }) => {
  const [lang, setLang] = useState(() => localStorage.getItem('ft_lang') || 'fr');
  const t = translations[lang] || translations.fr;
  const changeLang = (l) => { setLang(l); localStorage.setItem('ft_lang', l); };
  return <LangCtx.Provider value={{ lang, t, changeLang }}>{children}</LangCtx.Provider>;
};
export const useLang = () => useContext(LangCtx);

// ─── AUTH ──────────────────────────────────────────────
const AuthCtx = createContext();
export const AuthProvider = ({ children }) => {
  const [user, setUser]           = useState(null);
  const [loading, setLoading]     = useState(true);
  const [socket, setSocket]       = useState(null);
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('ft_token');
    if (!token) { setLoading(false); return; }
    fetch(`${API}/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : null)
      .then(u => { if (u) setUser(u); else localStorage.removeItem('ft_token'); })
      .catch(() => localStorage.removeItem('ft_token'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!user) return;
    const s = io(SOCKET_URL, { transports: ['websocket'] });
    s.emit(user.role === 'admin' ? 'joinAdmin' : 'join', user._id);
    setSocket(s);
    return () => s.disconnect();
  }, [user]);

  const apiFetch = async (path, method = 'GET', body) => {
    const token = localStorage.getItem('ft_token');
    const res = await fetch(`${API}${path}`, {
      method,
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: body ? JSON.stringify(body) : undefined,
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json.message || 'Error');
    return json;
  };

  const login = async (data) => {
    const json = await apiFetch('/auth/login', 'POST', data);
    localStorage.setItem('ft_token', json.token);
    setUser(json.user);
    return json;
  };

  const register = async (data) => {
    const json = await apiFetch('/auth/register', 'POST', data);
    localStorage.setItem('ft_token', json.token);
    setUser(json.user);
    setShowWelcome(true);
    return json;
  };

  const logout = () => {
    localStorage.removeItem('ft_token');
    setUser(null);
    socket?.disconnect();
    setSocket(null);
  };

  return (
    <AuthCtx.Provider value={{ user, loading, login, register, logout, socket, showWelcome, setShowWelcome }}>
      {children}
    </AuthCtx.Provider>
  );
};
export const useAuth = () => useContext(AuthCtx);

// ─── CART ──────────────────────────────────────────────
const CartCtx = createContext();
export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    try { return JSON.parse(localStorage.getItem('ft_cart')) || []; } catch { return []; }
  });

  const persist = (items) => { setCart(items); localStorage.setItem('ft_cart', JSON.stringify(items)); };

  const addToCart = useCallback((item) => {
    setCart(prev => {
      const key = `${item.type}_${item._id}`;
      const exists = prev.find(i => i.key === key);
      const next = exists
        ? prev.map(i => i.key === key ? { ...i, quantity: i.quantity + (item.quantity || 1) } : i)
        : [...prev, { ...item, key, quantity: item.quantity || 1 }];
      localStorage.setItem('ft_cart', JSON.stringify(next));
      return next;
    });
  }, []);

  const removeFromCart = (key) => persist(cart.filter(i => i.key !== key));
  const updateQty = (key, qty) => qty < 1 ? removeFromCart(key) : persist(cart.map(i => i.key === key ? { ...i, quantity: qty } : i));
  const clearCart = () => persist([]);
  const total = cart.reduce((s, i) => s + (i.final_price || i.price) * i.quantity, 0);

  return <CartCtx.Provider value={{ cart, addToCart, removeFromCart, updateQty, clearCart, total }}>{children}</CartCtx.Provider>;
};
export const useCart = () => useContext(CartCtx);
