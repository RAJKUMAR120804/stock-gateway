import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { customerAPI, productAPI, orderAPI, paymentAPI } from '../services/api';
import { PRODUCTS as FALLBACK_PRODUCTS } from '../data/products';

const ShopContext = createContext();

export function ShopProvider({ children }) {
  // Navigation View: 'home' | 'cart' | 'checkout' | 'login' | 'register' | 'profile' | 'orders' | 'admin'
  const [currentView, setCurrentView] = useState('home');

  // Loading & Notification states
  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState('');
  const [notification, setNotification] = useState(null); // { type: 'success' | 'error' | 'info', message: '' }

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification((prev) => (prev?.message === message ? null : prev));
    }, 4000);
  };

  // Products from MongoDB
  const [products, setProducts] = useState(FALLBACK_PRODUCTS);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Cart (Persisted in localStorage)
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('amazon_frontend_cart');
      return saved ? JSON.parse(saved) : [{ ...FALLBACK_PRODUCTS[0], quantity: 1 }];
    } catch {
      return [{ ...FALLBACK_PRODUCTS[0], quantity: 1 }];
    }
  });

  // User State (Authenticated via JWT from MongoDB / Backend)
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('amazon_customer');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Orders State
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // 1. Fetch Products from MongoDB / Backend API
  const fetchProducts = useCallback(async () => {
    setLoadingProducts(true);
    try {
      const res = await productAPI.getProducts(selectedCategory, searchQuery);
      if (res?.products && res.products.length > 0) {
        const normalized = res.products.map((p) => ({
          id: p.productId || p._id || p.id,
          productId: p.productId || p._id || p.id,
          title: p.productName || p.title,
          productName: p.productName || p.title,
          price: Number(p.price),
          originalPrice: p.originalPrice || Math.round(Number(p.price) * 1.25),
          image: p.productImage || p.image,
          productImage: p.productImage || p.image,
          category: p.category,
          description: p.description,
          rating: p.rating || 4.7,
          reviews: p.reviewsCount || p.reviews || 2150,
          badge: p.badge || '',
          stockQuantity: p.stockQuantity || 50,
        }));
        setProducts(normalized);
      }
    } catch (err) {
      console.warn('Backend products fetch warning (using cached catalog):', err.message);
    } finally {
      setLoadingProducts(false);
    }
  }, [selectedCategory, searchQuery]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // 2. Fetch User Profile on initial mount if JWT token exists
  useEffect(() => {
    const token = localStorage.getItem('amazon_token');
    if (token) {
      customerAPI
        .getProfile()
        .then((res) => {
          if (res?.customer) {
            const cust = {
              id: res.customer.customerId || res.customer._id,
              customerId: res.customer.customerId,
              name: res.customer.fullName || res.customer.name,
              fullName: res.customer.fullName,
              email: res.customer.email,
              phone: res.customer.phoneNumber || res.customer.phone,
              phoneNumber: res.customer.phoneNumber,
              role: res.customer.role || 'customer',
              address: res.customer.address || {},
              registrationDate: res.customer.registrationDate,
            };
            setUser(cust);
            localStorage.setItem('amazon_customer', JSON.stringify(cust));
          }
        })
        .catch((err) => {
          console.warn('Profile sync session warning:', err.message);
        });
    }
  }, []);

  // 3. Fetch Orders History from MongoDB / Backend
  const fetchOrders = useCallback(async () => {
    setLoadingOrders(true);
    try {
      const email = user?.email || '';
      const res = await orderAPI.getMyOrders(email);
      if (res?.orders) {
        setOrders(res.orders);
      }
    } catch (err) {
      console.warn('Order history fetch warning:', err.message);
    } finally {
      setLoadingOrders(false);
    }
  }, [user?.email]);

  useEffect(() => {
    if (user?.email) {
      fetchOrders();
    }
  }, [user?.email, fetchOrders]);

  // Persist Cart
  useEffect(() => {
    localStorage.setItem('amazon_frontend_cart', JSON.stringify(cart));
  }, [cart]);

  // Cart Management
  const addToCart = (product, quantity = 1) => {
    setCart((prevCart) => {
      const prodId = product.id || product.productId;
      const existing = prevCart.find((item) => (item.id || item.productId) === prodId);
      if (existing) {
        return prevCart.map((item) =>
          (item.id || item.productId) === prodId ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [
        ...prevCart,
        {
          id: prodId,
          productId: prodId,
          title: product.title || product.productName,
          productName: product.productName || product.title,
          price: Number(product.price),
          image: product.image || product.productImage,
          productImage: product.productImage || product.image,
          category: product.category,
          rating: product.rating,
          quantity,
        },
      ];
    });
    showNotification(`Added "${(product.title || product.productName).slice(0, 30)}..." to your Cart 🛒`, 'success');
  };

  const updateCartQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) =>
        (item.id === productId || item.productId === productId) ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeFromCart = (productId) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId && item.productId !== productId));
    showNotification('Item removed from cart', 'info');
  };

  const clearCart = () => {
    setCart([]);
  };

  // 4. Customer Registration (MongoDB REST API)
  const register = async (userData) => {
    setLoading(true);
    setGlobalError('');
    try {
      const res = await customerAPI.register({
        fullName: userData.fullName || userData.name,
        email: userData.email,
        password: userData.password,
        phoneNumber: userData.phoneNumber || userData.phone,
        address: userData.address || {
          street: userData.street || '',
          city: userData.city || '',
          state: userData.state || '',
          pincode: userData.pincode || '',
        },
      });

      if (res.token) {
        localStorage.setItem('amazon_token', res.token);
      }

      const registeredCustomer = {
        id: res.customer.customerId || res.customer._id,
        customerId: res.customer.customerId,
        name: res.customer.fullName,
        fullName: res.customer.fullName,
        email: res.customer.email,
        phone: res.customer.phoneNumber,
        phoneNumber: res.customer.phoneNumber,
        role: res.customer.role || 'customer',
        address: res.customer.address,
        registrationDate: res.customer.registrationDate,
      };

      setUser(registeredCustomer);
      localStorage.setItem('amazon_customer', JSON.stringify(registeredCustomer));
      showNotification('🎉 Registration successful! Account saved in MongoDB.', 'success');
      setCurrentView('home');
      return registeredCustomer;
    } catch (err) {
      setGlobalError(err.message);
      showNotification(err.message, 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 5. Customer Login (MongoDB REST API + JWT)
  const login = async (email, password) => {
    setLoading(true);
    setGlobalError('');
    try {
      const res = await customerAPI.login({ email, password });

      if (res.token) {
        localStorage.setItem('amazon_token', res.token);
      }

      const loggedCustomer = {
        id: res.customer.customerId || res.customer._id,
        customerId: res.customer.customerId,
        name: res.customer.fullName,
        fullName: res.customer.fullName,
        email: res.customer.email,
        phone: res.customer.phoneNumber,
        phoneNumber: res.customer.phoneNumber,
        role: res.customer.role || 'customer',
        address: res.customer.address,
        registrationDate: res.customer.registrationDate,
      };

      setUser(loggedCustomer);
      localStorage.setItem('amazon_customer', JSON.stringify(loggedCustomer));
      showNotification(`Welcome back, ${loggedCustomer.name}!`, 'success');
      
      // Auto-load orders for this customer
      fetchOrders();
      setCurrentView('home');
      return loggedCustomer;
    } catch (err) {
      setGlobalError(err.message);
      showNotification(err.message, 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 6. Update Customer Profile (MongoDB REST API)
  const updateProfile = async (updatedData) => {
    setLoading(true);
    try {
      const res = await customerAPI.updateProfile(updatedData);
      if (res.customer) {
        const updated = {
          ...user,
          name: res.customer.fullName || user.name,
          fullName: res.customer.fullName || user.fullName,
          phone: res.customer.phoneNumber || user.phone,
          phoneNumber: res.customer.phoneNumber || user.phoneNumber,
          address: res.customer.address || user.address,
        };
        setUser(updated);
        localStorage.setItem('amazon_customer', JSON.stringify(updated));
        showNotification('Profile updated successfully in MongoDB!', 'success');
      }
    } catch (err) {
      showNotification(err.message, 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 7. Logout
  const logout = () => {
    localStorage.removeItem('amazon_token');
    localStorage.removeItem('amazon_customer');
    setUser(null);
    setOrders([]);
    showNotification('Logged out successfully.', 'info');
    setCurrentView('login');
  };

  // 8. Simulated Payment Gateway & Order Placement
  const executePaymentSimulation = async (paymentPayload) => {
    setLoading(true);
    try {
      const res = await paymentAPI.processPayment(paymentPayload);
      if (res.outcome === 'SUCCESS') {
        clearCart();
        fetchOrders();
        showNotification(`✅ Payment Approved! Transaction ID: ${res.transaction.transactionId}`, 'success');
      } else if (res.outcome === 'PENDING') {
        showNotification(`⏳ Payment Pending: Bank processing transaction.`, 'info');
      } else {
        showNotification(`❌ Payment Failed: Simulated bank decline.`, 'error');
      }
      return res;
    } catch (err) {
      showNotification(err.message, 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Filtered Products for Search / Category
  const filteredProducts = products.filter((p) => {
    const matchesCategory =
      selectedCategory === 'All' || p.category?.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const cartTotalUnits = cart.reduce((acc, item) => acc + (item.quantity || 1), 0);
  const cartSubtotal = cart.reduce((acc, item) => acc + Number(item.price || 0) * (item.quantity || 1), 0);

  return (
    <ShopContext.Provider
      value={{
        currentView,
        setCurrentView,
        products,
        filteredProducts,
        loadingProducts,
        selectedCategory,
        setSelectedCategory,
        searchQuery,
        setSearchQuery,
        cart,
        cartTotalUnits,
        cartSubtotal,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        orders,
        loadingOrders,
        fetchOrders,
        user,
        isAuthenticated: !!user,
        loading,
        globalError,
        notification,
        showNotification,
        login,
        register,
        logout,
        updateProfile,
        executePaymentSimulation,
      }}
    >
      {children}
    </ShopContext.Provider>
  );
}

export const useShop = () => useContext(ShopContext);
