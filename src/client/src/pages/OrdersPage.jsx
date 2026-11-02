import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';

export default function OrdersPage() {
  const { orders, loadingOrders, fetchOrders, setCurrentView, addToCart } = useShop();
  const [filterQuery, setFilterQuery] = useState('');

  const filteredOrders = orders.filter((order) => {
    if (!filterQuery) return true;
    const q = filterQuery.toLowerCase();
    const matchesId = order.orderId?.toLowerCase().includes(q) || order.paymentId?.toLowerCase().includes(q) || order.transactionId?.toLowerCase().includes(q);
    const items = order.productsPurchased || order.items || [];
    const matchesItem = items.some((item) =>
      (item.title || item.productName)?.toLowerCase().includes(q)
    );
    return matchesId || matchesItem;
  });

  const handleBuyAgain = (item) => {
    addToCart(
      {
        id: item.productId || item.id,
        productId: item.productId || item.id,
        title: item.productName || item.title,
        price: item.price,
        image: item.productImage || item.image,
      },
      1
    );
    setCurrentView('cart');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      {/* Header & Breadcrumb */}
      <div className="border-b border-gray-300 pb-4">
        <div className="text-xs text-gray-500 mb-1 flex items-center gap-1">
          <span
            onClick={() => setCurrentView('profile')}
            className="hover:underline cursor-pointer text-blue-600"
          >
            Your Account
          </span>
          <span>›</span>
          <span className="text-gray-800 font-semibold">Your Orders</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-gray-900">Your Orders & Transaction History</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Synced directly with MongoDB database collection: <code className="bg-gray-100 px-1 py-0.5 rounded font-mono">orders</code>
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => fetchOrders()}
              disabled={loadingOrders}
              className="bg-white border border-gray-300 text-gray-800 font-bold px-3 py-2 rounded-lg text-xs hover:bg-gray-50 shadow-2xs transition cursor-pointer flex items-center gap-1.5"
            >
              <span className={loadingOrders ? 'animate-spin' : ''}>🔄</span> Refresh Orders
            </button>
            <button
              onClick={() => setCurrentView('home')}
              className="bg-[#ffd814] hover:bg-[#f7ca00] text-gray-900 font-bold px-4 py-2 rounded-lg text-xs shadow-2xs transition cursor-pointer"
            >
              ← Back to Store
            </button>
          </div>
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-3 text-xs">
        {/* Stock Shop Filter Tabs */}
        <div className="flex items-center gap-6 font-semibold overflow-x-auto whitespace-nowrap">
          <span className="border-b-2 border-[#e67a00] text-gray-900 pb-2 cursor-pointer font-bold">
            Orders ({orders.length})
          </span>
          <span
            onClick={() => setCurrentView('home')}
            className="text-gray-600 hover:text-gray-900 pb-2 cursor-pointer"
          >
            Buy Again
          </span>
        </div>

        {/* Search Orders */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            placeholder="Search orders or items"
            className="border border-gray-300 rounded-md px-3 py-1.5 focus:ring-1 focus:ring-[#febd69] focus:outline-none w-64 bg-white text-xs"
          />
          {filterQuery && (
            <button
              onClick={() => setFilterQuery('')}
              className="text-xs text-blue-600 hover:underline cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {loadingOrders && (
        <div className="text-center py-8 text-xs text-gray-500 flex items-center justify-center gap-2">
          <span className="animate-spin text-lg">⏳</span> Loading customer orders from MongoDB database...
        </div>
      )}

      {/* Orders List */}
      {!loadingOrders && filteredOrders.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center space-y-3">
          <span className="text-5xl block">📦</span>
          <h3 className="text-base font-bold text-gray-900">No Orders Found</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            {filterQuery
              ? `No orders matched "${filterQuery}".`
              : "Looks like you haven't placed an order yet."}
          </p>
          <button
            onClick={() => setCurrentView('home')}
            className="bg-[#ffd814] hover:bg-[#f7ca00] text-gray-900 font-bold px-6 py-2 rounded-full text-xs shadow-xs cursor-pointer"
          >
            Start Shopping
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredOrders.map((order) => {
            const items = order.productsPurchased || order.items || [];
            const txnId = order.paymentId || order.transactionId || 'TXN-DEMO-PAY';
            const orderDate = order.orderDate || order.createdAt;

            return (
              <div
                key={order.orderId}
                className="bg-white rounded-lg border border-gray-200 shadow-xs overflow-hidden"
              >
                {/* Order Header Card */}
                <div className="bg-gray-100 px-4 py-3 border-b border-gray-200 flex flex-wrap justify-between items-center text-xs text-gray-600 gap-y-2">
                  <div className="flex flex-wrap gap-x-8 gap-y-1">
                    <div>
                      <span className="block text-[11px] text-gray-500 uppercase">ORDER PLACED</span>
                      <span className="font-semibold text-gray-900">
                        {orderDate ? new Date(orderDate).toLocaleDateString() : 'Today'}
                      </span>
                    </div>
                    <div>
                      <span className="block text-[11px] text-gray-500 uppercase">TOTAL AMOUNT</span>
                      <span className="font-bold text-gray-900">
                        ₹{Number(order.totalAmount || 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div>
                      <span className="block text-[11px] text-gray-500 uppercase">SHIP TO</span>
                      <span className="font-bold text-blue-600 hover:underline cursor-pointer">
                        {order.customerDetails?.fullName || order.customerDetails?.name || 'Customer'}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="block text-[11px] text-gray-500 uppercase">
                      ORDER # {order.orderId}
                    </span>
                    <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                      Txn: {txnId}
                    </span>
                  </div>
                </div>

                {/* Order Body Details */}
                <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Left 2 Cols: Order Status & Item List */}
                  <div className="md:col-span-2 space-y-4">
                    <div className="flex items-center gap-2">
                      <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        <span>✓</span>
                        <span>{order.orderStatus || order.status || 'Confirmed'}</span>
                      </span>
                      <span className="text-xs text-gray-500">
                        Saved in MongoDB Collection: <strong>orders</strong>
                      </span>
                    </div>

                    <div className="divide-y divide-gray-100">
                      {items.map((item, idx) => (
                        <div key={item.productId || item.id || idx} className="py-3 flex items-start gap-4">
                          <img
                            src={item.productImage || item.image || 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500'}
                            alt={item.productName || item.title}
                            className="w-20 h-20 object-contain rounded bg-gray-50 p-1 border border-gray-100 shrink-0"
                          />
                          <div className="flex-1 space-y-1">
                            <h4 className="text-xs sm:text-sm font-semibold text-gray-900 hover:text-[#c45500] cursor-pointer">
                              {item.productName || item.title}
                            </h4>
                            <div className="text-xs font-bold text-gray-900">
                              Qty: {item.quantity} × ₹{Number(item.price || 0).toLocaleString('en-IN')}
                            </div>

                            <div className="flex gap-2 pt-1">
                              <button
                                onClick={() => handleBuyAgain(item)}
                                className="bg-[#ffd814] hover:bg-[#f7ca00] text-gray-900 text-[11px] font-bold px-3 py-1 rounded-full shadow-2xs transition cursor-pointer"
                              >
                                Buy it again
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right 1 Col: Customer Details & Invoice Actions */}
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3 text-xs self-start">
                    <h4 className="font-bold text-gray-900 border-b pb-1.5 uppercase text-[11px]">
                      Customer & Delivery Record
                    </h4>
                    <div>
                      <span className="text-gray-500 block text-[11px]">Customer Name:</span>
                      <span className="font-semibold text-gray-900">
                        {order.customerDetails?.fullName || order.customerDetails?.name || 'Customer'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500 block text-[11px]">Email:</span>
                      <span className="text-gray-700">{order.customerDetails?.email}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block text-[11px]">Shipping Destination:</span>
                      <span className="text-gray-700">
                        {order.customerDetails?.address?.street || 'Default Street'},{' '}
                        {order.customerDetails?.address?.city || 'City'} -{' '}
                        {order.customerDetails?.address?.pincode || 'Pincode'}
                      </span>
                    </div>

                    <div className="pt-2 border-t border-gray-200 space-y-2">
                      <button
                        onClick={() =>
                          alert(
                            `INVOICE RECEIPT\nOrder ID: ${order.orderId}\nTransaction ID: ${txnId}\nCustomer: ${order.customerDetails?.fullName || order.customerDetails?.name}\nTotal: ₹${order.totalAmount}\nDatabase: MongoDB / In-Memory`
                          )
                        }
                        className="w-full bg-white hover:bg-gray-100 border border-gray-300 font-bold py-1.5 rounded-md text-xs text-gray-800 shadow-2xs transition cursor-pointer"
                      >
                        📄 View Invoice
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
