import React, { useState, useEffect, useCallback } from 'react';
import { useShop } from '../context/ShopContext';
import { adminAPI } from '../services/api';
import { CATEGORIES } from '../data/products';

export default function AdminDashboard() {
  const { user, login, logout, setCurrentView, showNotification } = useShop();

  // Navigation Tab: 'overview' | 'customers' | 'products' | 'orders' | 'payments'
  const [activeTab, setActiveTab] = useState('overview');

  // Loading & Error States
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Admin Data from MongoDB
  const [stats, setStats] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [payments, setPayments] = useState([]);

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Add Product Form State
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [newProduct, setNewProduct] = useState({
    productName: '',
    category: 'Electronics',
    price: '',
    stockQuantity: 50,
    productImage: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500',
    description: '',
    badge: "Stock Shop's Choice",
  });
  const [submittingProduct, setSubmittingProduct] = useState(false);

  // Admin Credentials for Sign-In Gate
  const [adminEmail, setAdminEmail] = useState('admin@stockshop.com');
  const [adminPassword, setAdminPassword] = useState('admin123');
  const [authError, setAuthError] = useState('');
  const [authenticating, setAuthenticating] = useState(false);

  const isAdmin = user && user.role === 'admin';

  // 1. Fetch Overview Stats
  const loadStats = useCallback(async () => {
    try {
      const res = await adminAPI.getStats();
      if (res?.success) {
        setStats(res);
      }
    } catch (err) {
      setError(err.message);
    }
  }, []);

  // 2. Fetch Customers
  const loadCustomers = useCallback(async () => {
    try {
      const res = await adminAPI.getCustomers(searchQuery);
      if (res?.customers) setCustomers(res.customers);
    } catch (err) {
      console.warn('Customer load err:', err.message);
    }
  }, [searchQuery]);

  // 3. Fetch Products
  const loadProducts = useCallback(async () => {
    try {
      const res = await adminAPI.getProducts(searchQuery, categoryFilter);
      if (res?.products) setProducts(res.products);
    } catch (err) {
      console.warn('Product load err:', err.message);
    }
  }, [searchQuery, categoryFilter]);

  // 4. Fetch Orders
  const loadOrders = useCallback(async () => {
    try {
      const res = await adminAPI.getOrders(searchQuery, statusFilter);
      if (res?.orders) setOrders(res.orders);
    } catch (err) {
      console.warn('Order load err:', err.message);
    }
  }, [searchQuery, statusFilter]);

  // 5. Fetch Payments
  const loadPayments = useCallback(async () => {
    try {
      const res = await adminAPI.getPayments(searchQuery, statusFilter);
      if (res?.payments) setPayments(res.payments);
    } catch (err) {
      console.warn('Payment load err:', err.message);
    }
  }, [searchQuery, statusFilter]);

  // Load appropriate data based on active tab
  const refreshCurrentTab = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      if (activeTab === 'overview') {
        await loadStats();
      } else if (activeTab === 'customers') {
        await loadCustomers();
      } else if (activeTab === 'products') {
        await loadProducts();
      } else if (activeTab === 'orders') {
        await loadOrders();
      } else if (activeTab === 'payments') {
        await loadPayments();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [activeTab, loadStats, loadCustomers, loadProducts, loadOrders, loadPayments]);

  useEffect(() => {
    if (isAdmin) {
      refreshCurrentTab();
    }
  }, [isAdmin, activeTab, refreshCurrentTab]);

  // Handle Admin Quick Login
  const handleAdminLogin = async (e) => {
    if (e) e.preventDefault();
    setAuthError('');
    setAuthenticating(true);
    try {
      await login(adminEmail, adminPassword);
      showNotification('👑 Admin authentication successful!', 'success');
    } catch (err) {
      // Fallback try with demo admin
      try {
        await login('admin@amazon.com', 'admin123');
        showNotification('👑 Admin authentication successful!', 'success');
      } catch (e2) {
        setAuthError(e2.message || 'Invalid admin credentials');
      }
    } finally {
      setAuthenticating(false);
    }
  };

  // Add Product Handler
  const handleCreateProduct = async (e) => {
    e.preventDefault();
    if (!newProduct.productName || !newProduct.price) {
      showNotification('Please fill in product name and price', 'error');
      return;
    }
    setSubmittingProduct(true);
    try {
      const res = await adminAPI.createProduct(newProduct);
      if (res.success) {
        showNotification(`✓ Product "${newProduct.productName}" added to MongoDB!`, 'success');
        setShowAddProductModal(false);
        setNewProduct({
          productName: '',
          category: 'Electronics',
          price: '',
          stockQuantity: 50,
          productImage: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500',
          description: '',
          badge: "Stock Shop's Choice",
        });
        loadProducts();
      }
    } catch (err) {
      showNotification(err.message, 'error');
    } finally {
      setSubmittingProduct(false);
    }
  };

  // Delete Product Handler
  const handleDeleteProduct = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}" from the database?`)) return;
    try {
      await adminAPI.deleteProduct(id);
      showNotification(`Product "${name}" deleted`, 'info');
      loadProducts();
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  // Update Order Status Handler
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await adminAPI.updateOrderStatus(orderId, newStatus);
      showNotification(`Order ${orderId} updated to ${newStatus}`, 'success');
      loadOrders();
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  // ============================================================
  // ACCESS DENIED GATE: ONLY AUTHENTICATED ADMIN CAN ENTER
  // ============================================================
  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-20 h-20 bg-purple-100 text-purple-900 border-2 border-purple-300 rounded-full flex items-center justify-center text-4xl mx-auto shadow-md">
          👑
        </div>
        <div>
          <h1 className="text-2xl font-black text-gray-900">Administrator Portal</h1>
          <p className="text-xs text-gray-600 mt-1.5">
            Restricted area. Please sign in with administrator credentials to manage customers, catalog, orders, and payment records.
          </p>
        </div>

        {authError && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-xs">
            ⚠️ {authError}
          </div>
        )}

        <div className="bg-white p-6 rounded-xl border border-gray-300 shadow-md space-y-4 text-xs text-left">
          <form onSubmit={handleAdminLogin} className="space-y-3">
            <div>
              <label className="block text-gray-700 font-bold mb-1">Admin Email</label>
              <input
                type="email"
                required
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                placeholder="admin@stockshop.com"
                className="w-full border border-gray-300 rounded p-2 focus:ring-1 focus:ring-purple-500 font-mono text-xs"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-bold mb-1">Password</label>
              <input
                type="password"
                required
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                className="w-full border border-gray-300 rounded p-2 focus:ring-1 focus:ring-purple-500 text-xs"
              />
            </div>

            <button
              type="submit"
              disabled={authenticating}
              className="w-full bg-purple-900 hover:bg-purple-950 text-white font-bold py-2.5 rounded-lg text-xs shadow transition active:scale-95 cursor-pointer disabled:opacity-50"
            >
              {authenticating ? 'Authenticating Admin...' : 'Sign In as Administrator'}
            </button>
          </form>

          <div className="pt-2 border-t border-gray-200 text-center">
            <span className="text-[11px] text-gray-500 block mb-2 font-medium">Quick Demo Access:</span>
            <button
              onClick={() => handleAdminLogin()}
              disabled={authenticating}
              className="w-full bg-purple-50 hover:bg-purple-100 border border-purple-300 text-purple-900 font-bold py-2 rounded-lg text-xs cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>⚡ One-Click Administrator Sign-In</span>
            </button>
          </div>
        </div>

        <button
          onClick={() => setCurrentView('home')}
          className="text-xs text-gray-600 hover:text-gray-900 hover:underline cursor-pointer"
        >
          ← Return to Stock Shop Storefront
        </button>
      </div>
    );
  }

  // ============================================================
  // AUTHENTICATED ADMIN DASHBOARD
  // ============================================================
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Top Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-gray-300 gap-4">
        <div>
          <div className="inline-flex items-center gap-2 bg-purple-900 text-purple-100 font-bold text-xs px-3 py-1 rounded-full mb-1 shadow-xs">
            <span>👑</span>
            <span>Administrator Control Center</span>
            <span className="bg-purple-800 text-[10px] px-1.5 py-0.2 rounded font-mono">
              {user?.email || 'admin@stockshop.com'}
            </span>
          </div>
          <h1 className="text-2xl font-black text-gray-900">
            Stock Shop: Executive Management Dashboard
          </h1>
          <p className="text-xs text-gray-500">
            Real-time MongoDB collections: <code className="bg-gray-100 px-1 py-0.5 rounded font-mono">customers</code>, <code className="bg-gray-100 px-1 py-0.5 rounded font-mono">products</code>, <code className="bg-gray-100 px-1 py-0.5 rounded font-mono">orders</code>, <code className="bg-gray-100 px-1 py-0.5 rounded font-mono">payments</code>.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={refreshCurrentTab}
            disabled={loading}
            className="border border-gray-300 bg-white hover:bg-gray-100 text-gray-800 text-xs font-bold px-3 py-2 rounded-lg shadow-2xs transition cursor-pointer flex items-center gap-1.5"
          >
            <span className={loading ? 'animate-spin' : ''}>🔄</span> Refresh
          </button>
          <button
            onClick={() => setCurrentView('home')}
            className="bg-[#ffd814] hover:bg-[#f7ca00] text-gray-900 text-xs font-bold px-4 py-2 rounded-lg shadow-xs transition cursor-pointer"
          >
            ← View Storefront
          </button>
          <button
            onClick={() => {
              logout();
              setCurrentView('login');
            }}
            className="bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 text-xs font-bold px-3 py-2 rounded-lg transition cursor-pointer"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 overflow-x-auto whitespace-nowrap text-xs pb-1 font-semibold">
        <button
          onClick={() => {
            setActiveTab('overview');
            setSearchQuery('');
          }}
          className={`px-4 py-2.5 rounded-t-lg transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'overview'
              ? 'bg-purple-900 text-white font-bold shadow'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          <span>📊</span>
          <span>Overview & Metrics</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('customers');
            setSearchQuery('');
          }}
          className={`px-4 py-2.5 rounded-t-lg transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'customers'
              ? 'bg-purple-900 text-white font-bold shadow'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          <span>👥</span>
          <span>Manage Customers</span>
          {stats?.stats?.totalCustomers ? (
            <span className="bg-purple-800 text-purple-200 text-[10px] px-1.5 py-0.5 rounded-full">
              {stats.stats.totalCustomers}
            </span>
          ) : null}
        </button>

        <button
          onClick={() => {
            setActiveTab('products');
            setSearchQuery('');
          }}
          className={`px-4 py-2.5 rounded-t-lg transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'products'
              ? 'bg-purple-900 text-white font-bold shadow'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          <span>📦</span>
          <span>Manage Products</span>
          {stats?.stats?.totalProducts ? (
            <span className="bg-purple-800 text-purple-200 text-[10px] px-1.5 py-0.5 rounded-full">
              {stats.stats.totalProducts}
            </span>
          ) : null}
        </button>

        <button
          onClick={() => {
            setActiveTab('orders');
            setSearchQuery('');
          }}
          className={`px-4 py-2.5 rounded-t-lg transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'orders'
              ? 'bg-purple-900 text-white font-bold shadow'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          <span>🛒</span>
          <span>Manage Orders</span>
          {stats?.stats?.totalOrders ? (
            <span className="bg-purple-800 text-purple-200 text-[10px] px-1.5 py-0.5 rounded-full">
              {stats.stats.totalOrders}
            </span>
          ) : null}
        </button>

        <button
          onClick={() => {
            setActiveTab('payments');
            setSearchQuery('');
          }}
          className={`px-4 py-2.5 rounded-t-lg transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'payments'
              ? 'bg-purple-900 text-white font-bold shadow'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          <span>💳</span>
          <span>Payment Transactions</span>
          {stats?.stats?.successfulPayments ? (
            <span className="bg-emerald-600 text-white text-[10px] px-1.5 py-0.5 rounded-full">
              {stats.stats.successfulPayments}
            </span>
          ) : null}
        </button>
      </div>

      {/* Global Error Banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-xs">
          ⚠️ {error}
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 1: OVERVIEW & 7 CORE KPI CARDS                          */}
      {/* ============================================================ */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Top 7 Metrics Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Total Registered Customers */}
            <div
              onClick={() => setActiveTab('customers')}
              className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs hover:border-purple-300 hover:shadow-md transition cursor-pointer space-y-2"
            >
              <div className="flex justify-between items-start">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                  Registered Customers
                </span>
                <span className="p-2 bg-purple-50 text-purple-800 rounded-lg text-base">👥</span>
              </div>
              <div className="text-3xl font-black text-gray-900">
                {stats?.stats?.totalCustomers || 0}
              </div>
              <span className="text-[11px] text-purple-700 font-semibold block">
                Manage accounts & addresses →
              </span>
            </div>

            {/* 2. Total Products */}
            <div
              onClick={() => setActiveTab('products')}
              className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs hover:border-blue-300 hover:shadow-md transition cursor-pointer space-y-2"
            >
              <div className="flex justify-between items-start">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                  Total Products
                </span>
                <span className="p-2 bg-blue-50 text-blue-800 rounded-lg text-base">📦</span>
              </div>
              <div className="text-3xl font-black text-gray-900">
                {stats?.stats?.totalProducts || 0}
              </div>
              <span className="text-[11px] text-blue-600 font-semibold block">
                Catalog & Inventory items →
              </span>
            </div>

            {/* 3. Total Orders */}
            <div
              onClick={() => setActiveTab('orders')}
              className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs hover:border-amber-300 hover:shadow-md transition cursor-pointer space-y-2"
            >
              <div className="flex justify-between items-start">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                  Total Orders
                </span>
                <span className="p-2 bg-amber-50 text-amber-800 rounded-lg text-base">🛒</span>
              </div>
              <div className="text-3xl font-black text-gray-900">
                {stats?.stats?.totalOrders || 0}
              </div>
              <span className="text-[11px] text-amber-700 font-semibold block">
                All order trackings →
              </span>
            </div>

            {/* 4. Total Sales Revenue */}
            <div
              onClick={() => setActiveTab('payments')}
              className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs hover:border-emerald-300 hover:shadow-md transition cursor-pointer space-y-2"
            >
              <div className="flex justify-between items-start">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                  Total Demo Sales
                </span>
                <span className="p-2 bg-emerald-50 text-emerald-800 rounded-lg text-base">💰</span>
              </div>
              <div className="text-3xl font-black text-[#b12704]">
                ₹{Number(stats?.stats?.totalSalesRevenue || 0).toLocaleString('en-IN')}
              </div>
              <span className="text-[11px] text-emerald-700 font-semibold block">
                From approved transactions →
              </span>
            </div>
          </div>

          {/* Payment Status Breakdown Cards (3 Cards) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 5. Successful Payments */}
            <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-emerald-900 uppercase block">
                  Successful Payments
                </span>
                <div className="text-2xl font-black text-emerald-700">
                  {stats?.stats?.successfulPayments || 0}
                </div>
                <span className="text-[11px] text-emerald-800">Funds Captured (Approved)</span>
              </div>
              <span className="text-3xl">✅</span>
            </div>

            {/* 6. Failed Payments */}
            <div className="bg-red-50 border border-red-200 p-4 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-red-900 uppercase block">
                  Failed Payments
                </span>
                <div className="text-2xl font-black text-red-700">
                  {stats?.stats?.failedPayments || 0}
                </div>
                <span className="text-[11px] text-red-800">Declined by test network</span>
              </div>
              <span className="text-3xl">❌</span>
            </div>

            {/* 7. Pending Payments */}
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-amber-900 uppercase block">
                  Pending Payments
                </span>
                <div className="text-2xl font-black text-amber-700">
                  {stats?.stats?.pendingPayments || 0}
                </div>
                <span className="text-[11px] text-amber-800">Awaiting banking confirmation</span>
              </div>
              <span className="text-3xl">⏳</span>
            </div>
          </div>

          {/* Database System Banner */}
          <div className="bg-white p-4 rounded-xl border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
              <div>
                <span className="font-bold text-gray-900">Database Engine: </span>
                <span className="text-gray-700">{stats?.storage || 'MongoDB / In-Memory'}</span>
              </div>
            </div>
            <div className="text-gray-500 text-[11px]">
              Currency: <strong>INR (₹)</strong> • Academic Demo Gateway Mode
            </div>
          </div>

          {/* Recent Orders & Payments Preview Grids */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Orders */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs space-y-3">
              <div className="flex justify-between items-center border-b pb-2">
                <h3 className="font-bold text-gray-900 text-sm">Recent Customer Orders</h3>
                <button
                  onClick={() => setActiveTab('orders')}
                  className="text-xs text-purple-700 hover:underline font-semibold"
                >
                  View All Orders →
                </button>
              </div>

              {!stats?.recentOrders || stats.recentOrders.length === 0 ? (
                <p className="text-xs text-gray-400 py-6 text-center">No orders placed yet.</p>
              ) : (
                <div className="divide-y divide-gray-100 text-xs">
                  {stats.recentOrders.map((o) => (
                    <div key={o.orderId} className="py-2.5 flex justify-between items-center">
                      <div>
                        <span className="font-bold text-gray-900 block">{o.orderId}</span>
                        <span className="text-gray-500 text-[11px]">
                          {o.customerDetails?.fullName || o.customerDetails?.name} • {o.productsPurchased?.length || 1} item(s)
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-[#b12704] block">
                          ₹{Number(o.totalAmount || 0).toLocaleString('en-IN')}
                        </span>
                        <span className="text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-semibold border border-emerald-200">
                          {o.orderStatus || 'Confirmed'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Transactions */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs space-y-3">
              <div className="flex justify-between items-center border-b pb-2">
                <h3 className="font-bold text-gray-900 text-sm">Recent Payment Transactions</h3>
                <button
                  onClick={() => setActiveTab('payments')}
                  className="text-xs text-purple-700 hover:underline font-semibold"
                >
                  View All Payments →
                </button>
              </div>

              {!stats?.recentTransactions || stats.recentTransactions.length === 0 ? (
                <p className="text-xs text-gray-400 py-6 text-center">No transactions recorded yet.</p>
              ) : (
                <div className="divide-y divide-gray-100 text-xs">
                  {stats.recentTransactions.map((t) => (
                    <div key={t.transactionId} className="py-2.5 flex justify-between items-center">
                      <div>
                        <span className="font-mono font-bold text-blue-600 block">
                          {t.transactionId}
                        </span>
                        <span className="text-gray-500 text-[11px]">
                          {t.paymentMethod} • Order: {t.orderId}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-gray-900 block">
                          ₹{Number(t.amount || 0).toLocaleString('en-IN')}
                        </span>
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                            t.paymentStatus === 'SUCCESS'
                              ? 'bg-emerald-100 text-emerald-800'
                              : t.paymentStatus === 'FAILED'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {t.paymentStatus || 'SUCCESS'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 2: MANAGE CUSTOMERS                                      */}
      {/* ============================================================ */}
      {activeTab === 'customers' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Manage Registered Customers</h2>
              <p className="text-xs text-gray-500">
                View customer accounts saved in MongoDB database (<code className="font-mono">customers</code> collection).
              </p>
            </div>

            {/* Search Box */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by Name, Email, or Customer ID..."
                className="border border-gray-300 rounded-lg px-3 py-2 text-xs w-64 sm:w-80 focus:ring-1 focus:ring-purple-500 focus:outline-none"
              />
              <button
                onClick={loadCustomers}
                className="bg-purple-900 hover:bg-purple-950 text-white text-xs font-bold px-3 py-2 rounded-lg cursor-pointer"
              >
                Search
              </button>
            </div>
          </div>

          {loading ? (
            <div className="py-12 text-center text-xs text-gray-500">
              <span className="animate-spin text-2xl block mb-2">⏳</span>
              Loading customer records from MongoDB...
            </div>
          ) : customers.length === 0 ? (
            <div className="py-12 text-center text-xs text-gray-500">
              No customers found matching "{searchQuery}".
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-700">
                <thead className="bg-gray-100 uppercase text-[11px] text-gray-600 font-bold border-b">
                  <tr>
                    <th className="py-3 px-4">Customer ID</th>
                    <th className="py-3 px-4">Full Name</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Phone Number</th>
                    <th className="py-3 px-4">Delivery Address</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Registration Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {customers.map((c) => (
                    <tr key={c.customerId || c._id} className="hover:bg-gray-50 transition">
                      <td className="py-3 px-4 font-mono font-bold text-purple-900">
                        {c.customerId || c._id}
                      </td>
                      <td className="py-3 px-4 font-bold text-gray-900">{c.fullName || c.name}</td>
                      <td className="py-3 px-4 text-gray-600">{c.email}</td>
                      <td className="py-3 px-4 text-gray-600">{c.phoneNumber || c.phone || 'N/A'}</td>
                      <td className="py-3 px-4 text-gray-600 max-w-xs truncate">
                        {c.address?.street ? `${c.address.street}, ${c.address.city || ''} (${c.address.pincode || ''})` : 'Registered Online'}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            c.role === 'admin'
                              ? 'bg-purple-100 text-purple-800 border border-purple-200'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {c.role || 'customer'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-500 text-[11px]">
                        {c.registrationDate ? new Date(c.registrationDate).toLocaleDateString() : 'Active'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 3: MANAGE PRODUCTS                                       */}
      {/* ============================================================ */}
      {activeTab === 'products' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Manage Catalog Products</h2>
              <p className="text-xs text-gray-500">
                Products stored in MongoDB database (<code className="font-mono">products</code> collection).
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Category Filter */}
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-2.5 py-2 text-xs bg-white focus:ring-1 focus:ring-purple-500"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>

              {/* Search Box */}
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="border border-gray-300 rounded-lg px-3 py-2 text-xs w-48 sm:w-60 focus:ring-1 focus:ring-purple-500"
              />

              <button
                onClick={() => setShowAddProductModal(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-2 rounded-lg cursor-pointer flex items-center gap-1 shadow-xs"
              >
                <span>➕ Add Product</span>
              </button>
            </div>
          </div>

          {loading ? (
            <div className="py-12 text-center text-xs text-gray-500">
              <span className="animate-spin text-2xl block mb-2">⏳</span>
              Loading products catalog from database...
            </div>
          ) : products.length === 0 ? (
            <div className="py-12 text-center text-xs text-gray-500">
              No products found matching criteria.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-700">
                <thead className="bg-gray-100 uppercase text-[11px] text-gray-600 font-bold border-b">
                  <tr>
                    <th className="py-3 px-4">Image</th>
                    <th className="py-3 px-4">Product Name & ID</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Price</th>
                    <th className="py-3 px-4">Stock</th>
                    <th className="py-3 px-4">Badge</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {products.map((p) => (
                    <tr key={p.productId || p._id} className="hover:bg-gray-50 transition">
                      <td className="py-3 px-4">
                        <img
                          src={p.productImage || p.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500'}
                          alt={p.productName || p.title}
                          className="w-12 h-12 object-contain bg-white rounded border p-1"
                        />
                      </td>
                      <td className="py-3 px-4 max-w-sm">
                        <span className="font-bold text-gray-900 block">{p.productName || p.title}</span>
                        <span className="font-mono text-[10px] text-gray-500">{p.productId || p._id}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="bg-gray-100 text-gray-800 text-[10px] px-2 py-0.5 rounded font-semibold">
                          {p.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold text-[#b12704]">
                        ₹{Number(p.price || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-4 font-semibold text-gray-800">
                        {p.stockQuantity || 50} units
                      </td>
                      <td className="py-3 px-4">
                        <span className="bg-amber-100 text-amber-800 text-[10px] px-2 py-0.5 rounded font-bold">
                          {p.badge || "Stock Shop's Choice"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleDeleteProduct(p.productId || p._id, p.productName || p.title)}
                          className="bg-red-50 hover:bg-red-100 text-red-600 font-bold px-2.5 py-1 rounded text-xs transition cursor-pointer border border-red-200"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Add Product Modal */}
          {showAddProductModal && (
            <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
              <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center border-b pb-3">
                  <h3 className="font-bold text-gray-900 text-base">Add New Product to Database</h3>
                  <button
                    onClick={() => setShowAddProductModal(false)}
                    className="text-gray-400 hover:text-gray-600 text-lg font-bold cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleCreateProduct} className="space-y-3 text-xs">
                  <div>
                    <label className="block text-gray-700 font-bold mb-1">Product Title *</label>
                    <input
                      type="text"
                      required
                      value={newProduct.productName}
                      onChange={(e) => setNewProduct({ ...newProduct, productName: e.target.value })}
                      placeholder="e.g. Wireless Noise Cancelling Headphones"
                      className="w-full border rounded p-2 focus:ring-1 focus:ring-purple-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-gray-700 font-bold mb-1">Category *</label>
                      <select
                        value={newProduct.category}
                        onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                        className="w-full border rounded p-2 bg-white"
                      >
                        {CATEGORIES.filter((c) => c !== 'All').map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-gray-700 font-bold mb-1">Price (₹) *</label>
                      <input
                        type="number"
                        required
                        min="1"
                        value={newProduct.price}
                        onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                        placeholder="e.g. 2999"
                        className="w-full border rounded p-2"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-gray-700 font-bold mb-1">Stock Quantity</label>
                      <input
                        type="number"
                        min="1"
                        value={newProduct.stockQuantity}
                        onChange={(e) => setNewProduct({ ...newProduct, stockQuantity: e.target.value })}
                        className="w-full border rounded p-2"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 font-bold mb-1">Badge Tag</label>
                      <input
                        type="text"
                        value={newProduct.badge}
                        onChange={(e) => setNewProduct({ ...newProduct, badge: e.target.value })}
                        placeholder="Best Seller / Limited Deal"
                        className="w-full border rounded p-2"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-700 font-bold mb-1">Image URL</label>
                    <input
                      type="url"
                      value={newProduct.productImage}
                      onChange={(e) => setNewProduct({ ...newProduct, productImage: e.target.value })}
                      className="w-full border rounded p-2"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-bold mb-1">Description</label>
                    <textarea
                      rows="3"
                      value={newProduct.description}
                      onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                      placeholder="Product details, specs, and warranty..."
                      className="w-full border rounded p-2"
                    ></textarea>
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t">
                    <button
                      type="button"
                      onClick={() => setShowAddProductModal(false)}
                      className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded text-xs font-semibold cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submittingProduct}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2 rounded text-xs shadow cursor-pointer disabled:opacity-50"
                    >
                      {submittingProduct ? 'Saving to Database...' : 'Save Product'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 4: MANAGE ORDERS                                         */}
      {/* ============================================================ */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Manage Customer Orders</h2>
              <p className="text-xs text-gray-500">
                Orders saved in MongoDB (<code className="font-mono">orders</code> collection).
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Order Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-2.5 py-2 text-xs bg-white focus:ring-1 focus:ring-purple-500"
              >
                <option value="All">All Statuses</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Processing">Processing</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>

              {/* Search Box */}
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Order ID, Email, Customer..."
                className="border border-gray-300 rounded-lg px-3 py-2 text-xs w-48 sm:w-72 focus:ring-1 focus:ring-purple-500"
              />

              <button
                onClick={loadOrders}
                className="bg-purple-900 hover:bg-purple-950 text-white text-xs font-bold px-3 py-2 rounded-lg cursor-pointer"
              >
                Filter
              </button>
            </div>
          </div>

          {loading ? (
            <div className="py-12 text-center text-xs text-gray-500">
              <span className="animate-spin text-2xl block mb-2">⏳</span>
              Loading orders from MongoDB database...
            </div>
          ) : orders.length === 0 ? (
            <div className="py-12 text-center text-xs text-gray-500">
              No orders found matching criteria.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-700">
                <thead className="bg-gray-100 uppercase text-[11px] text-gray-600 font-bold border-b">
                  <tr>
                    <th className="py-3 px-4">Order ID & Date</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Purchased Items</th>
                    <th className="py-3 px-4">Total Amount</th>
                    <th className="py-3 px-4">Payment ID</th>
                    <th className="py-3 px-4">Order Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {orders.map((o) => {
                    const items = o.productsPurchased || o.items || [];
                    const status = o.orderStatus || o.status || 'Confirmed';

                    return (
                      <tr key={o.orderId} className="hover:bg-gray-50 transition">
                        <td className="py-3 px-4">
                          <span className="font-bold text-gray-900 block font-mono">{o.orderId}</span>
                          <span className="text-gray-400 text-[10px]">
                            {o.orderDate || o.createdAt ? new Date(o.orderDate || o.createdAt).toLocaleDateString() : 'Today'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-semibold text-gray-900 block">
                            {o.customerDetails?.fullName || o.customerDetails?.name || 'Customer'}
                          </span>
                          <span className="text-gray-500 text-[11px]">{o.customerDetails?.email}</span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="space-y-1">
                            {items.map((it, idx) => (
                              <div key={idx} className="flex items-center gap-1.5 text-[11px]">
                                <span className="font-semibold text-gray-800">
                                  {it.productName || it.title}
                                </span>
                                <span className="text-gray-500">×{it.quantity || 1}</span>
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="py-3 px-4 font-black text-[#b12704]">
                          ₹{Number(o.totalAmount || 0).toLocaleString('en-IN')}
                        </td>
                        <td className="py-3 px-4 font-mono text-[11px] text-purple-700">
                          {o.paymentId || o.transactionId || 'TXN-DEMO'}
                        </td>
                        <td className="py-3 px-4">
                          <select
                            value={status}
                            onChange={(e) => handleUpdateOrderStatus(o.orderId, e.target.value)}
                            className={`text-xs font-bold px-2 py-1 rounded border cursor-pointer ${
                              status === 'Confirmed'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                : status === 'Processing'
                                ? 'bg-amber-50 text-amber-800 border-amber-300'
                                : status === 'Delivered'
                                ? 'bg-blue-50 text-blue-800 border-blue-300'
                                : 'bg-red-50 text-red-800 border-red-300'
                            }`}
                          >
                            <option value="Confirmed">Confirmed</option>
                            <option value="Processing">Processing</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 5: VIEW PAYMENT TRANSACTIONS                             */}
      {/* ============================================================ */}
      {activeTab === 'payments' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Simulated Payment Gateway Records</h2>
              <p className="text-xs text-gray-500">
                Payment transactions persisted in MongoDB collection (<code className="font-mono">payments</code>).
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Payment Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-2.5 py-2 text-xs bg-white focus:ring-1 focus:ring-purple-500"
              >
                <option value="All">All Payment Outcomes</option>
                <option value="SUCCESS">SUCCESS (Approved)</option>
                <option value="FAILED">FAILED (Declined)</option>
                <option value="PENDING">PENDING (Processing)</option>
              </select>

              {/* Search Box */}
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Transaction ID, Order, Method..."
                className="border border-gray-300 rounded-lg px-3 py-2 text-xs w-48 sm:w-72 focus:ring-1 focus:ring-purple-500"
              />

              <button
                onClick={loadPayments}
                className="bg-purple-900 hover:bg-purple-950 text-white text-xs font-bold px-3 py-2 rounded-lg cursor-pointer"
              >
                Filter
              </button>
            </div>
          </div>

          {loading ? (
            <div className="py-12 text-center text-xs text-gray-500">
              <span className="animate-spin text-2xl block mb-2">⏳</span>
              Loading payment records from database...
            </div>
          ) : payments.length === 0 ? (
            <div className="py-12 text-center text-xs text-gray-500">
              No payment transactions found matching criteria.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-700">
                <thead className="bg-gray-100 uppercase text-[11px] text-gray-600 font-bold border-b">
                  <tr>
                    <th className="py-3 px-4">Transaction ID</th>
                    <th className="py-3 px-4">Order Reference</th>
                    <th className="py-3 px-4">Customer ID</th>
                    <th className="py-3 px-4">Method & Masked Info</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Gateway Message</th>
                    <th className="py-3 px-4">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {payments.map((t) => {
                    const status = t.paymentStatus || t.status || 'SUCCESS';

                    return (
                      <tr key={t.transactionId} className="hover:bg-gray-50 transition">
                        <td className="py-3 px-4 font-mono font-bold text-blue-700">
                          {t.transactionId}
                        </td>
                        <td className="py-3 px-4 font-mono text-gray-700">{t.orderId}</td>
                        <td className="py-3 px-4 font-mono text-gray-500 text-[11px]">
                          {t.customerId || 'CUST-DEMO'}
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-semibold text-gray-900 block">{t.paymentMethod}</span>
                          <span className="text-gray-500 text-[10px] font-mono">
                            {t.paymentDetails?.maskedCard || t.paymentDetails?.upiId || t.paymentDetails?.bankName || 'Simulated Approval'}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-bold text-gray-900">
                          ₹{Number(t.amount || 0).toLocaleString('en-IN')}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              status === 'SUCCESS'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : status === 'FAILED'
                                ? 'bg-red-100 text-red-800 border border-red-300'
                                : 'bg-amber-100 text-amber-800 border border-amber-300'
                            }`}
                          >
                            {status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-600 max-w-xs text-[11px] truncate">
                          {t.paymentDetails?.gatewayResponse || 'Simulated Gateway Response'}
                        </td>
                        <td className="py-3 px-4 text-gray-500 text-[11px]">
                          {t.transactionDate ? new Date(t.transactionDate).toLocaleString() : 'Just now'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
