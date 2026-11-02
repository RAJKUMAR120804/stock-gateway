import api from './api';

export const authService = {
  // Register a new customer
  register: async (customerData) => {
    const response = await api.post('/auth/register', customerData);
    if (response.data.token) {
      localStorage.setItem('amazon_token', response.data.token);
      localStorage.setItem('amazon_customer', JSON.stringify(response.data.customer));
    }
    return response.data;
  },

  // Customer or Admin Login
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    if (response.data.token) {
      localStorage.setItem('amazon_token', response.data.token);
      localStorage.setItem('amazon_customer', JSON.stringify(response.data.customer));
    }
    return response.data;
  },

  // Get current logged-in customer profile
  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  // Logout
  logout: () => {
    localStorage.removeItem('amazon_token');
    localStorage.removeItem('amazon_customer');
  },

  // Get stored customer
  getCurrentCustomer: () => {
    const stored = localStorage.getItem('amazon_customer');
    try {
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  },
};

