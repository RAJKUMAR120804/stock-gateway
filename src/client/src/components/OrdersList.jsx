import React, { useEffect, useState } from 'react';
import api from '../services/api';

export default function OrdersList({ onBackToStore }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [storageType, setStorageType] = useState('');

  const fetchOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/orders');
      const data = res.data;
      if (data.success) {
        setOrders(data.orders || []);
        setStorageType(data.storage || 'MongoDB');
      } else {
        setError(data.message || 'Failed to retrieve orders.');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Could not connect to backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Title & Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-300 gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            📦 Customer Purchased Orders & Payment Records
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Real-time orders stored in database: <span className="font-semibold text-blue-700">{storageType || 'MongoDB'}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchOrders}
            className="border border-gray-300 bg-white hover:bg-gray-100 text-gray-800 text-xs font-semibold px-3 py-1.5 rounded-md shadow-xs cursor-pointer"
          >
            🔄 Refresh Orders
          </button>
          <button
            onClick={onBackToStore}
            className="bg-[#ffd814] hover:bg-[#f7ca00] text-gray-900 text-xs font-bold px-4 py-1.5 rounded-full shadow-xs cursor-pointer"
          >
            ← Back to Stock Shop Store
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-500">
          <span className="text-3xl block animate-spin mb-2">⏳</span>
          <p className="text-sm font-semibold">Loading Customer Purchase Records...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg text-xs space-y-2">
          <p className="font-bold text-sm">Connection Warning</p>
          <p>{error}</p>
          <p className="text-[11px] text-gray-600">
            Tip: Run <code>npm run dev</code> inside <code>E:\payment gateway\src\server</code>.
          </p>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-10 text-center space-y-3">
          <span className="text-5xl block">📦</span>
          <h3 className="text-lg font-bold text-gray-800">No Orders Placed Yet</h3>
          <p className="text-xs text-gray-500 max-w-md mx-auto">
            You haven't placed any orders yet. Go to the store, add some items to your cart, fill the customer details, and try the payment gateway!
          </p>
          <button
            onClick={onBackToStore}
            className="bg-[#ffd814] hover:bg-[#f7ca00] text-gray-900 font-bold px-6 py-2 rounded-full text-xs shadow-md mt-2 cursor-pointer"
          >
            Start Shopping Now
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order.orderId || order._id}
              className="bg-white border border-gray-200 rounded-lg shadow-xs overflow-hidden"
            >
              {/* Order Header bar */}
              <div className="bg-gray-100 px-4 py-3 border-b border-gray-200 flex flex-wrap justify-between items-center text-xs text-gray-600 gap-y-2">
                <div className="flex flex-wrap gap-x-8 gap-y-1">
                  <div>
                    <span className="block text-[11px] text-gray-500 uppercase">ORDER PLACED</span>
                    <span className="font-medium text-gray-800">
                      {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'Just now'}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[11px] text-gray-500 uppercase">TOTAL AMOUNT</span>
                    <span className="font-bold text-gray-900">
                      ₹{order.totalAmount?.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[11px] text-gray-500 uppercase">SHIP TO</span>
                    <span className="font-semibold text-blue-600 hover:underline cursor-pointer">
                      {order.customerDetails?.name || 'Customer'}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="block text-[11px] text-gray-500 uppercase">ORDER # {order.orderId}</span>
                  <span className="text-[11px] font-mono text-gray-700">
                    Txn: {order.transactionId || 'TXN-DEMO'}
                  </span>
                </div>
              </div>

              {/* Order Body: Customer details & Items */}
              <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left 2 cols: Items */}
                <div className="md:col-span-2 space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                      ✓ Payment {order.paymentStatus || 'SUCCESS'}
                    </span>
                    <span className="text-xs text-gray-500">
                      via <strong>{order.paymentMethod?.toUpperCase()}</strong> Gateway
                    </span>
                  </div>

                  <div className="divide-y divide-gray-100">
                    {order.items?.map((item, idx) => (
                      <div key={idx} className="py-2.5 flex items-center gap-3">
                        <img
                          src={item.image || 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=200'}
                          alt={item.title}
                          className="w-16 h-16 object-contain bg-gray-50 rounded p-1 border border-gray-100"
                        />
                        <div className="flex-1">
                          <h4 className="text-xs font-semibold text-gray-900 line-clamp-2">
                            {item.title}
                          </h4>
                          <div className="text-xs text-gray-600 mt-0.5">
                            Qty: <span className="font-bold">{item.quantity}</span> × ₹{item.price?.toLocaleString('en-IN')}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right col: Customer Info & Address Card */}
                <div className="bg-gray-50 border border-gray-200 rounded-md p-3.5 text-xs space-y-2">
                  <h4 className="font-bold text-gray-900 border-b border-gray-200 pb-1 flex items-center gap-1">
                    👤 Customer Information
                  </h4>
                  <div>
                    <span className="text-gray-500 block text-[11px]">Name:</span>
                    <span className="font-semibold text-gray-800">{order.customerDetails?.name}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-[11px]">Email:</span>
                    <span className="text-gray-700">{order.customerDetails?.email}</span>
                  </div>
                  {order.customerDetails?.phone && (
                    <div>
                      <span className="text-gray-500 block text-[11px]">Phone:</span>
                      <span className="text-gray-700">{order.customerDetails?.phone}</span>
                    </div>
                  )}
                  <div className="pt-1">
                    <span className="text-gray-500 block text-[11px]">Delivery Address:</span>
                    <p className="text-gray-700 leading-tight">
                      {order.customerDetails?.address?.street && `${order.customerDetails.address.street}, `}
                      {order.customerDetails?.address?.city && `${order.customerDetails.address.city}, `}
                      {order.customerDetails?.address?.state && `${order.customerDetails.address.state} `}
                      {order.customerDetails?.address?.pincode && `- ${order.customerDetails.address.pincode}`}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

