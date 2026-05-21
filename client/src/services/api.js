const BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const req = async (method, path, body, isForm = false) => {
  const token = localStorage.getItem('ft_token');
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (!isForm && body) headers['Content-Type'] = 'application/json';
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: isForm ? body : body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.message || 'Error');
  return json;
};

// Named exports for backward compat
export const getAnimals        = (p)    => req('GET', `/animals${p ? '?' + new URLSearchParams(p) : ''}`);
export const getAnimal         = (id)   => req('GET', `/animals/${id}`);
export const createAnimal      = (fd)   => req('POST', '/animals', fd, true);
export const updateAnimal      = (id,d) => req('PUT', `/animals/${id}`, d, d instanceof FormData);
export const deleteAnimal      = (id)   => req('DELETE', `/animals/${id}`);
export const getAnimalLogs     = (id)   => req('GET', `/animals/${id}/logs`);
export const addAnimalLog      = (id,d) => req('POST', `/animals/${id}/logs`, d);

export const getProducts       = ()     => req('GET', '/products');
export const createProduct     = (d)    => req('POST', '/products', d);
export const updateProduct     = (id,d) => req('PUT', `/products/${id}`, d);
export const deleteProduct     = (id)   => req('DELETE', `/products/${id}`);

export const getPromotions     = ()     => req('GET', '/promotions');
export const createPromotion   = (d)    => req('POST', '/promotions', d);
export const deletePromotion   = (id)   => req('DELETE', `/promotions/${id}`);

export const getOrders         = ()     => req('GET', '/orders');
export const createOrder       = (d)    => req('POST', '/orders', d);
export const updateOrderStatus = (id,s) => req('PUT', `/orders/${id}/status`, { status: s });

export const getComments       = (aid)  => req('GET', `/comments/${aid}`);
export const getRecentComments = ()     => req('GET', '/comments/recent');
export const addComment        = (d)    => req('POST', '/comments', d);
export const deleteComment     = (id)   => req('DELETE', `/comments/${id}`);

export const getMyMessages     = ()     => req('GET', '/messages/my');
export const getAllMessages     = ()     => req('GET', '/messages/all');
export const getUserMessages   = (uid)  => req('GET', `/messages/user/${uid}`);
export const sendMessage       = (d)    => req('POST', '/messages', d);

export const getNotifications  = ()     => req('GET', '/notifications');
export const markAllRead       = ()     => req('PUT', '/notifications/read-all');

export const getStats          = ()     => req('GET', '/stats');

// Video ad
export const getVideo          = ()     => req('GET', '/video');
export const setVideo          = (d)    => req('POST', '/video', d);
