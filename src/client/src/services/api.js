import axios from 'axios';

const getBaseURL = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (!envUrl) return 'http://localhost:5000/api';
  const clean = envUrl.trim().replace(/\/+$/, '');
  return clean.endsWith('/api') ? clean : `${clean}/api`;
};

const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Automatically inject JWT Bearer Token into requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('amazon_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor for response handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      'Server connection error. Please ensure backend is running.';
    return Promise.reject(new Error(message));
  }
);

// Customer & Auth APIs
export const customerAPI = {
  register: async (customerData) => {
    const res = await api.post('/customers/register', customerData);
    return res.data;
  },
  login: async (credentials) => {
    const res = await api.post('/customers/login', credentials);
    return res.data;
  },
  getProfile: async () => {
    const res = await api.get('/customers/profile');
    return res.data;
  },
  updateProfile: async (data) => {
    const res = await api.put('/customers/profile', data);
    return res.data;
  },
};

// Products API
export const productAPI = {
  getProducts: async (category = '', search = '') => {
    const params = {};
    if (category && category !== 'All') params.category = category;
    if (search) params.search = search;
    const res = await api.get('/products', { params });
    return res.data;
  },
  getProductById: async (id) => {
    const res = await api.get(`/products/${id}`);
    return res.data;
  },
};

// Orders API
export const orderAPI = {
  createOrder: async (orderData) => {
    const res = await api.post('/orders', orderData);
    return res.data;
  },
  getAllOrders: async () => {
    const res = await api.get('/orders');
    return res.data;
  },
  getMyOrders: async (email = '') => {
    const res = await api.get('/orders/myorders', { params: { email } });
    return res.data;
  },
  getOrderById: async (orderId) => {
    const res = await api.get(`/orders/${orderId}`);
    return res.data;
  },
};

// Payments API
export const paymentAPI = {
  processPayment: async (paymentData) => {
    const res = await api.post('/payments/process', paymentData);
    return res.data;
  },
  getPaymentHistory: async () => {
    const res = await api.get('/payments/history');
    return res.data;
  },
};

// Admin Dashboard & Management APIs
export const adminAPI = {
  getStats: async () => {
    const res = await api.get('/admin/stats');
    return res.data;
  },
  getCustomers: async (search = '') => {
    const res = await api.get('/admin/customers', { params: { search } });
    return res.data;
  },
  getProducts: async (search = '', category = 'All') => {
    const res = await api.get('/admin/products', { params: { search, category } });
    return res.data;
  },
  createProduct: async (productData) => {
    const res = await api.post('/admin/products', productData);
    return res.data;
  },
  deleteProduct: async (productId) => {
    const res = await api.delete(`/admin/products/${productId}`);
    return res.data;
  },
  getOrders: async (search = '', status = 'All') => {
    const res = await api.get('/admin/orders', { params: { search, status } });
    return res.data;
  },
  updateOrderStatus: async (orderId, status) => {
    const res = await api.put(`/admin/orders/${orderId}/status`, { status });
    return res.data;
  },
  getPayments: async (search = '', status = 'All') => {
    const res = await api.get('/admin/payments', { params: { search, status } });
    return res.data;
  },
};

export default api;
