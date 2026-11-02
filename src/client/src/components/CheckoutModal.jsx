import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function CheckoutModal({
  isOpen,
  onClose,
  cartItems,
  onOrderSuccess,
}) {
  if (!isOpen) return null;

  const { customer: authCustomer } = useAuth();
  const totalAmount = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  // Form State: Customer Details
  const [customer, setCustomer] = useState({
    name: authCustomer?.name || 'Ragavi M',
    email: authCustomer?.email || 'ragavi@example.com',
    phone: authCustomer?.phone || '9876543210',
    street: authCustomer?.address?.street || 'Flat 402, Royal Palms, Outer Ring Road',
    city: authCustomer?.address?.city || 'Bengaluru',
    state: authCustomer?.address?.state || 'Karnataka',
    pincode: authCustomer?.address?.pincode || '560103',
  });

  useEffect(() => {
    if (authCustomer) {
      setCustomer((prev) => ({
        ...prev,
        name: authCustomer.name || prev.name,
        email: authCustomer.email || prev.email,
        phone: authCustomer.phone || prev.phone,
        street: authCustomer.address?.street || prev.street,
        city: authCustomer.address?.city || prev.city,
        state: authCustomer.address?.state || prev.state,
        pincode: authCustomer.address?.pincode || prev.pincode,
      }));
    }
  }, [authCustomer]);

  // Payment State
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: '4532 8920 1234 5678',
    cardHolder: authCustomer?.name || 'Ragavi M',
    expiry: '12/28',
    cvv: '888',
    upiId: 'ragavi@okhdfcbank',
    bank: 'HDFC Bank',
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [orderReceipt, setOrderReceipt] = useState(null);

  // Quick fill dummy card details
  const handleQuickFill = () => {
    setPaymentDetails({
      cardNumber: '4532 8920 1234 5678',
      cardHolder: customer.name || 'Test Customer',
      expiry: '12/28',
      cvv: '888',
      upiId: 'customer@okaxis',
      bank: 'HDFC Bank',
    });
  };

  const handlePayNow = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const payload = {
        customer: {
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          address: {
            street: customer.street,
            city: customer.city,
            state: customer.state,
            pincode: customer.pincode,
          },
        },
        items: cartItems,
        amount: totalAmount,
        paymentMethod,
        paymentDetails,
      };

      // Axios call with auto-injected JWT token
      const res = await api.post('/pay/process', payload);
      const data = res.data;

      if (!data.success) {
        throw new Error(data.message || 'Payment simulation failed.');
      }

      setOrderReceipt(data.order);
      if (onOrderSuccess) {
        onOrderSuccess(data.order);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to connect to backend server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-3xl rounded-xl shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* Stock Shop Header */}
        <div className="bg-[#131921] px-6 py-3.5 flex items-center justify-between text-white border-b border-[#febd69]">
          <div className="flex items-center gap-2">
            <span className="text-xl font-black text-white">
              stock<span className="text-[#febd69]"> shop</span>
            </span>
            <span className="text-xs bg-[#febd69] text-gray-900 font-bold px-2 py-0.5 rounded ml-2">
              Secure Checkout 🔒
            </span>
          </div>
          {!orderReceipt && (
            <button
              onClick={onClose}
              className="text-gray-300 hover:text-white text-xl font-bold cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {orderReceipt ? (
            /* ============================================================ */
            /* SUCCESS ORDER RECEIPT VIEW                                   */
            /* ============================================================ */
            <div className="text-center py-6 space-y-5 animate-in fade-in duration-300">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-3xl mx-auto shadow-inner">
                ✓
              </div>

              <div>
                <h2 className="text-2xl font-black text-gray-900">
                  Order Placed Successfully!
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  Thank you for shopping on Stock Shop. A confirmation email has been dispatched to{' '}
                  <strong className="text-gray-800">{orderReceipt.customerDetails?.email}</strong>.
                </p>
              </div>

              {/* Receipt Box */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-5 max-w-xl mx-auto text-left text-xs space-y-3">
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-500">Order ID:</span>
                  <span className="font-mono font-bold text-gray-900">{orderReceipt.orderId}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-500">Transaction ID:</span>
                  <span className="font-mono font-bold text-blue-600">
                    {orderReceipt.transactionId || 'TXN-DEMO-2026'}
                  </span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-500">Customer Name:</span>
                  <span className="font-semibold text-gray-900">{orderReceipt.customerDetails?.name}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-500">Delivery Address:</span>
                  <span className="font-medium text-gray-700 text-right">
                    {orderReceipt.customerDetails?.address?.street},{' '}
                    {orderReceipt.customerDetails?.address?.city} -{' '}
                    {orderReceipt.customerDetails?.address?.pincode}
                  </span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-500">Payment Method:</span>
                  <span className="font-semibold uppercase text-emerald-700">
                    {orderReceipt.paymentMethod} (PAID)
                  </span>
                </div>
                <div className="flex justify-between pt-1 text-sm font-bold">
                  <span>Total Amount Paid:</span>
                  <span className="text-[#b12704]">
                    ₹{orderReceipt.totalAmount?.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <div className="flex justify-center gap-3 pt-3">
                <button
                  onClick={onClose}
                  className="bg-[#ffd814] hover:bg-[#f7ca00] text-gray-900 font-bold px-6 py-2 rounded-full text-xs shadow transition cursor-pointer"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          ) : (
            /* ============================================================ */
            /* CHECKOUT FORM: CUSTOMER DETAILS + PAYMENT GATEWAY           */
            /* ============================================================ */
            <form onSubmit={handlePayNow} className="space-y-6">
              {errorMsg && (
                <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-3 text-xs rounded">
                  <strong>Error: </strong> {errorMsg}
                </div>
              )}

              {/* SECTION 1: Customer Details */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                  <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <span className="bg-[#131921] text-white w-5 h-5 rounded-full flex items-center justify-center text-xs">
                      1
                    </span>
                    Customer & Shipping Details
                  </h3>
                  {authCustomer ? (
                    <span className="text-[11px] text-emerald-700 font-semibold">
                      ✓ Pre-filled from Account ({authCustomer.email})
                    </span>
                  ) : (
                    <span className="text-[11px] text-gray-500">Guest / Manual Checkout</span>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-gray-700 font-medium mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={customer.name}
                      onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                      placeholder="e.g. John Doe"
                      className="w-full border border-gray-300 rounded p-2 focus:ring-1 focus:ring-[#febd69] focus:outline-none bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={customer.email}
                      onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                      placeholder="e.g. user@example.com"
                      className="w-full border border-gray-300 rounded p-2 focus:ring-1 focus:ring-[#febd69] focus:outline-none bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-1">Mobile Number</label>
                    <input
                      type="tel"
                      value={customer.phone}
                      onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                      placeholder="10-digit mobile number"
                      className="w-full border border-gray-300 rounded p-2 focus:ring-1 focus:ring-[#febd69] focus:outline-none bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-1">PIN Code *</label>
                    <input
                      type="text"
                      required
                      value={customer.pincode}
                      onChange={(e) => setCustomer({ ...customer, pincode: e.target.value })}
                      placeholder="6-digit PIN code"
                      className="w-full border border-gray-300 rounded p-2 focus:ring-1 focus:ring-[#febd69] focus:outline-none bg-white"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-gray-700 font-medium mb-1">Flat, House no., Building, Street *</label>
                    <input
                      type="text"
                      required
                      value={customer.street}
                      onChange={(e) => setCustomer({ ...customer, street: e.target.value })}
                      placeholder="Street address"
                      className="w-full border border-gray-300 rounded p-2 focus:ring-1 focus:ring-[#febd69] focus:outline-none bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-1">Town / City</label>
                    <input
                      type="text"
                      value={customer.city}
                      onChange={(e) => setCustomer({ ...customer, city: e.target.value })}
                      className="w-full border border-gray-300 rounded p-2 focus:ring-1 focus:ring-[#febd69] focus:outline-none bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-1">State</label>
                    <input
                      type="text"
                      value={customer.state}
                      onChange={(e) => setCustomer({ ...customer, state: e.target.value })}
                      className="w-full border border-gray-300 rounded p-2 focus:ring-1 focus:ring-[#febd69] focus:outline-none bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: Payment Gateway Simulation */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                  <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <span className="bg-[#131921] text-white w-5 h-5 rounded-full flex items-center justify-center text-xs">
                      2
                    </span>
                    Payment Gateway (Select Method)
                  </h3>
                  <button
                    type="button"
                    onClick={handleQuickFill}
                    className="text-[11px] text-blue-600 hover:underline font-semibold cursor-pointer"
                  >
                    ⚡ Auto-fill Test Details
                  </button>
                </div>

                {/* Payment Option Tabs */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'card', label: 'Credit / Debit Card', icon: '💳' },
                    { id: 'upi', label: 'UPI / QR', icon: '📱' },
                    { id: 'netbanking', label: 'Net Banking', icon: '🏛️' },
                    { id: 'cod', label: 'Cash on Delivery', icon: '💵' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setPaymentMethod(tab.id)}
                      className={`p-2.5 rounded-lg border text-xs font-semibold flex flex-col items-center gap-1 transition cursor-pointer ${
                        paymentMethod === tab.id
                          ? 'border-[#f3a847] bg-[#fef8f2] text-gray-900 shadow-xs ring-1 ring-[#f3a847]'
                          : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <span className="text-lg">{tab.icon}</span>
                      <span>{tab.label}</span>
                    </button>
                  ))}
                </div>

                {/* Sub-form based on method */}
                {paymentMethod === 'card' && (
                  <div className="bg-white p-3.5 rounded border border-gray-200 space-y-3 text-xs">
                    <div>
                      <label className="block text-gray-700 font-medium mb-1">Card Number</label>
                      <input
                        type="text"
                        value={paymentDetails.cardNumber}
                        onChange={(e) => setPaymentDetails({ ...paymentDetails, cardNumber: e.target.value })}
                        placeholder="4532 8920 1234 5678"
                        className="w-full border border-gray-300 rounded p-2 focus:ring-1 focus:ring-[#febd69] font-mono"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-gray-700 font-medium mb-1">Expiry Date</label>
                        <input
                          type="text"
                          value={paymentDetails.expiry}
                          onChange={(e) => setPaymentDetails({ ...paymentDetails, expiry: e.target.value })}
                          placeholder="MM/YY"
                          className="w-full border border-gray-300 rounded p-2 focus:ring-1 focus:ring-[#febd69]"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 font-medium mb-1">CVV / CVC</label>
                        <input
                          type="password"
                          maxLength={4}
                          value={paymentDetails.cvv}
                          onChange={(e) => setPaymentDetails({ ...paymentDetails, cvv: e.target.value })}
                          placeholder="•••"
                          className="w-full border border-gray-300 rounded p-2 focus:ring-1 focus:ring-[#febd69] font-mono"
                        />
                      </div>
                    </div>
                    <p className="text-[10px] text-gray-400">
                      🔒 Simulated demo: Any 16-digit card and 3-digit CVV will succeed.
                    </p>
                  </div>
                )}

                {paymentMethod === 'upi' && (
                  <div className="bg-white p-3.5 rounded border border-gray-200 space-y-2 text-xs">
                    <label className="block text-gray-700 font-medium">Virtual Payment Address (UPI ID)</label>
                    <input
                      type="text"
                      value={paymentDetails.upiId}
                      onChange={(e) => setPaymentDetails({ ...paymentDetails, upiId: e.target.value })}
                      placeholder="e.g. mobile@upi or username@okhdfcbank"
                      className="w-full border border-gray-300 rounded p-2 focus:ring-1 focus:ring-[#febd69]"
                    />
                    <div className="flex gap-2 text-[10px] text-gray-500 pt-1">
                      <span className="bg-gray-100 px-2 py-0.5 rounded">Google Pay</span>
                      <span className="bg-gray-100 px-2 py-0.5 rounded">PhonePe</span>
                      <span className="bg-gray-100 px-2 py-0.5 rounded">Paytm</span>
                      <span className="bg-gray-100 px-2 py-0.5 rounded">Stock Shop Pay UPI</span>
                    </div>
                  </div>
                )}

                {paymentMethod === 'netbanking' && (
                  <div className="bg-white p-3.5 rounded border border-gray-200 space-y-2 text-xs">
                    <label className="block text-gray-700 font-medium">Select Your Bank</label>
                    <select
                      value={paymentDetails.bank}
                      onChange={(e) => setPaymentDetails({ ...paymentDetails, bank: e.target.value })}
                      className="w-full border border-gray-300 rounded p-2 focus:ring-1 focus:ring-[#febd69] bg-white"
                    >
                      <option>HDFC Bank</option>
                      <option>State Bank of India (SBI)</option>
                      <option>ICICI Bank</option>
                      <option>Axis Bank</option>
                      <option>Kotak Mahindra Bank</option>
                    </select>
                  </div>
                )}

                {paymentMethod === 'cod' && (
                  <div className="bg-white p-3.5 rounded border border-gray-200 text-xs text-gray-600">
                    💵 Pay in cash upon delivery at your doorstep. No prepayment required.
                  </div>
                )}
              </div>

              {/* Order Items Preview */}
              <div className="border border-gray-200 rounded-lg p-3 bg-gray-50 text-xs flex justify-between items-center">
                <div>
                  <span className="font-semibold text-gray-800">Review Items: </span>
                  <span className="text-gray-600">{cartItems.length} items in package</span>
                </div>
                <div className="text-sm font-bold text-[#b12704]">
                  Total: ₹{totalAmount.toLocaleString('en-IN')}
                </div>
              </div>

              {/* Pay Now Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#ffd814] hover:bg-[#f7ca00] text-gray-900 font-bold py-3 px-4 rounded-full text-sm shadow-md transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <span className="inline-block animate-spin">⏳</span>
                    <span>Processing Payment with Gateway...</span>
                  </>
                ) : (
                  <>
                    <span>Pay ₹{totalAmount.toLocaleString('en-IN')} with Stock Shop Pay</span>
                    <span>→</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
