import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';

export default function CheckoutPage() {
  const { cart, cartSubtotal, user, executePaymentSimulation, setCurrentView } = useShop();

  // Customer Information State
  const [customer, setCustomer] = useState({
    fullName: user?.fullName || user?.name || 'Ragavi M',
    email: user?.email || 'ragavi@example.com',
    phoneNumber: user?.phoneNumber || user?.phone || '9876543210',
    street: user?.address?.street || 'Flat 402, Royal Palms, Outer Ring Road',
    city: user?.address?.city || 'Bengaluru',
    state: user?.address?.state || 'Karnataka',
    pincode: user?.address?.pincode || '560103',
  });

  // Payment Method Selection: 'UPI' | 'DEBIT_CARD' | 'CREDIT_CARD' | 'NETBANKING'
  const [paymentMethod, setPaymentMethod] = useState('DEBIT_CARD');

  // Academic Demo Details (No real secrets or real PINs)
  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: '4532 8920 1234 5678',
    cardHolder: user?.fullName || user?.name || 'Ragavi M',
    expiry: '12/28',
    cvv: '888',
    upiId: 'demo@okhdfcbank',
    bankName: 'HDFC Bank',
  });

  // Academic Simulation Outcome Controller: 'SUCCESS' | 'FAILED' | 'PENDING'
  const [simulationOutcome, setSimulationOutcome] = useState('SUCCESS');

  // Loading & State
  const [processing, setProcessing] = useState(false);
  const [paymentResult, setPaymentResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const handleFillDemoCard = () => {
    setPaymentDetails({
      cardNumber: '4532 8920 1234 5678',
      cardHolder: customer.fullName || 'Demo Cardholder',
      expiry: '12/28',
      cvv: '888',
      upiId: 'student@okaxis',
      bankName: 'HDFC Bank',
    });
  };

  const handlePayNow = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (cart.length === 0 && !paymentResult) {
      setErrorMessage('Your cart is empty. Please add items to proceed.');
      return;
    }

    if (!customer.fullName || !customer.email || !customer.street || !customer.pincode) {
      setErrorMessage('Please fill in all required customer details.');
      return;
    }

    setProcessing(true);

    try {
      const payload = {
        customerId: user?.customerId || user?.id || 'CUST-DEMO',
        customerDetails: {
          fullName: customer.fullName,
          email: customer.email,
          phoneNumber: customer.phoneNumber,
          address: {
            street: customer.street,
            city: customer.city,
            state: customer.state,
            pincode: customer.pincode,
            country: 'India',
          },
        },
        items: cart,
        amount: cartSubtotal,
        paymentMethod,
        paymentDetails,
        simulationOutcome, // User selected test result: SUCCESS / FAILED / PENDING
      };

      const data = await executePaymentSimulation(payload);
      setPaymentResult(data);
    } catch (err) {
      // Local fallback simulation if server returns error or offline
      const fallbackTxn = `TXN-DEMO-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
      const fallbackOrder = `ORD-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;

      const simulatedResponse = {
        success: simulationOutcome !== 'FAILED',
        outcome: simulationOutcome,
        message:
          simulationOutcome === 'SUCCESS'
            ? 'Simulated Gateway Approval: Funds captured (Academic Demo)'
            : simulationOutcome === 'FAILED'
            ? 'Simulated Gateway Decline: Test card rejected by demo bank'
            : 'Simulated Gateway Pending: Awaiting test network settlement',
        transaction: {
          transactionId: fallbackTxn,
          orderId: fallbackOrder,
          amount: cartSubtotal,
          paymentMethod,
          paymentStatus: simulationOutcome,
          transactionDate: new Date().toISOString(),
        },
        order: {
          orderId: fallbackOrder,
          totalAmount: cartSubtotal,
          orderStatus: simulationOutcome === 'SUCCESS' ? 'Confirmed' : 'Pending',
          customerDetails: customer,
        },
      };

      setPaymentResult(simulatedResponse);
    } finally {
      setProcessing(false);
    }
  };

  // ============================================================
  // RESULT SCREEN: SUCCESS, FAILED, OR PENDING
  // ============================================================
  if (paymentResult) {
    const isSuccess = paymentResult.outcome === 'SUCCESS';
    const isFailed = paymentResult.outcome === 'FAILED';
    const isPending = paymentResult.outcome === 'PENDING';

    return (
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-2xl overflow-hidden p-8 text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
          {/* Academic Banner */}
          <div className="bg-amber-100 text-amber-900 font-extrabold text-xs px-3 py-1.5 rounded-full inline-block border border-amber-300">
            ⚠️ ACADEMIC DEMO PAYMENT GATEWAY — NO REAL MONEY PROCESSED
          </div>

          {/* Dynamic Status Icon */}
          <div
            className={`w-20 h-20 rounded-full flex items-center justify-center text-4xl mx-auto shadow-inner ${
              isSuccess
                ? 'bg-emerald-100 text-emerald-600'
                : isFailed
                ? 'bg-red-100 text-red-600'
                : 'bg-amber-100 text-amber-600 animate-pulse'
            }`}
          >
            {isSuccess ? '✓' : isFailed ? '✕' : '⏳'}
          </div>

          {/* Heading */}
          <div>
            <h1 className="text-3xl font-black text-gray-900">
              {isSuccess
                ? 'Payment Successful!'
                : isFailed
                ? 'Payment Failed / Declined'
                : 'Payment Pending Authorization'}
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              {paymentResult.message || 'Simulated transaction processed.'}
            </p>
          </div>

          {/* Receipt Breakdown */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 max-w-xl mx-auto text-left text-xs space-y-3">
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-500">Transaction ID:</span>
              <span className="font-mono font-bold text-blue-600">
                {paymentResult.transaction?.transactionId}
              </span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-500">Order ID:</span>
              <span className="font-mono font-bold text-gray-900">
                {paymentResult.order?.orderId || paymentResult.transaction?.orderId}
              </span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-500">Customer Name:</span>
              <span className="font-semibold text-gray-900">{customer.fullName}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-500">Customer Email:</span>
              <span className="text-gray-700">{customer.email}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-500">Payment Option:</span>
              <span className="font-bold uppercase text-gray-900">{paymentMethod}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-500">Gateway Status:</span>
              <span
                className={`font-black uppercase px-2 py-0.5 rounded text-[11px] ${
                  isSuccess
                    ? 'bg-emerald-100 text-emerald-800'
                    : isFailed
                    ? 'bg-red-100 text-red-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {paymentResult.outcome}
              </span>
            </div>
            <div className="flex justify-between pt-2 text-base font-black">
              <span>Amount:</span>
              <span className="text-[#b12704]">
                ₹{paymentResult.transaction?.amount?.toLocaleString('en-IN') || cartSubtotal.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap justify-center gap-3 pt-3">
            {isSuccess ? (
              <>
                <button
                  onClick={() => setCurrentView('orders')}
                  className="bg-[#ffd814] hover:bg-[#f7ca00] text-gray-950 font-bold px-6 py-2.5 rounded-full text-xs shadow-md transition cursor-pointer"
                >
                  📦 View Order in History
                </button>
                <button
                  onClick={() => setCurrentView('admin')}
                  className="bg-purple-100 hover:bg-purple-200 text-purple-900 border border-purple-300 font-bold px-6 py-2.5 rounded-full text-xs shadow-xs transition cursor-pointer"
                >
                  👑 Check Transaction in Admin Portal
                </button>
              </>
            ) : (
              <button
                onClick={() => setPaymentResult(null)}
                className="bg-[#ffd814] hover:bg-[#f7ca00] text-gray-950 font-bold px-6 py-2.5 rounded-full text-xs shadow-md transition cursor-pointer"
              >
                🔄 Try Payment Again
              </button>
            )}

            <button
              onClick={() => {
                setPaymentResult(null);
                setCurrentView('home');
              }}
              className="bg-white hover:bg-gray-100 text-gray-800 font-semibold px-6 py-2.5 rounded-full text-xs border border-gray-300 shadow-xs transition cursor-pointer"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // MAIN PAYMENT & CHECKOUT PAGE
  // ============================================================
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      {/* DEMO NOTICE BANNER (Strict Requirement) */}
      <div className="bg-amber-50 border-2 border-dashed border-amber-400 p-4 rounded-xl text-center shadow-xs">
        <span className="text-sm font-black text-amber-900 uppercase tracking-wider block">
          🛡️ DEMO PAYMENT GATEWAY — NO REAL MONEY PROCESSED
        </span>
        <p className="text-xs text-amber-800 mt-0.5">
          Academic simulation project. No actual bank transfers are made. Never enter real credit card numbers, CVVs, or bank UPI PINs.
        </p>
      </div>

      <div className="flex items-center justify-between pb-3 border-b border-gray-300">
        <h1 className="text-2xl font-black text-gray-900">
          Checkout & Payment Gateway
        </h1>
        <button
          onClick={() => setCurrentView('cart')}
          className="text-xs text-blue-600 hover:underline font-bold cursor-pointer"
        >
          ← Return to Cart
        </button>
      </div>

      {errorMessage && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-3 text-xs rounded">
          <strong>Validation Error:</strong> {errorMessage}
        </div>
      )}

      <form onSubmit={handlePayNow} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ============================================================ */}
        {/* LEFT 2 COLUMNS: CUSTOMER INFO & PAYMENT OPTIONS              */}
        {/* ============================================================ */}
        <div className="lg:col-span-2 space-y-6">
          {/* SECTION 1: Customer Information */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-gray-900 border-b pb-2 flex items-center gap-2">
              <span className="bg-[#131921] text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">
                1
              </span>
              Customer Information & Shipping Address
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={customer.fullName}
                  onChange={(e) => setCustomer({ ...customer, fullName: e.target.value })}
                  className="w-full border border-gray-300 rounded p-2 focus:ring-1 focus:ring-[#febd69] focus:outline-none bg-white"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={customer.email}
                  onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                  className="w-full border border-gray-300 rounded p-2 focus:ring-1 focus:ring-[#febd69] focus:outline-none bg-white"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={customer.phoneNumber}
                  onChange={(e) => setCustomer({ ...customer, phoneNumber: e.target.value })}
                  className="w-full border border-gray-300 rounded p-2 focus:ring-1 focus:ring-[#febd69] focus:outline-none bg-white"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1">PIN Code *</label>
                <input
                  type="text"
                  required
                  value={customer.pincode}
                  onChange={(e) => setCustomer({ ...customer, pincode: e.target.value })}
                  className="w-full border border-gray-300 rounded p-2 focus:ring-1 focus:ring-[#febd69] focus:outline-none bg-white"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-gray-700 font-semibold mb-1">Shipping Street Address *</label>
                <input
                  type="text"
                  required
                  value={customer.street}
                  onChange={(e) => setCustomer({ ...customer, street: e.target.value })}
                  className="w-full border border-gray-300 rounded p-2 focus:ring-1 focus:ring-[#febd69] focus:outline-none bg-white"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1">City</label>
                <input
                  type="text"
                  value={customer.city}
                  onChange={(e) => setCustomer({ ...customer, city: e.target.value })}
                  className="w-full border border-gray-300 rounded p-2 focus:ring-1 focus:ring-[#febd69] focus:outline-none bg-white"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1">State</label>
                <input
                  type="text"
                  value={customer.state}
                  onChange={(e) => setCustomer({ ...customer, state: e.target.value })}
                  className="w-full border border-gray-300 rounded p-2 focus:ring-1 focus:ring-[#febd69] focus:outline-none bg-white"
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: Payment Options Selection */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-xs space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <span className="bg-[#131921] text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">
                  2
                </span>
                Select Payment Option
              </h3>
              <button
                type="button"
                onClick={handleFillDemoCard}
                className="text-xs text-blue-600 hover:underline font-bold cursor-pointer"
              >
                ⚡ Auto-fill Test Details
              </button>
            </div>

            {/* 4 Payment Option Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { id: 'UPI', label: 'UPI / QR', icon: '📱' },
                { id: 'DEBIT_CARD', label: 'Debit Card', icon: '💳' },
                { id: 'CREDIT_CARD', label: 'Credit Card', icon: '💳' },
                { id: 'NETBANKING', label: 'Net Banking', icon: '🏛️' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setPaymentMethod(opt.id)}
                  className={`p-3.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition cursor-pointer ${
                    paymentMethod === opt.id
                      ? 'border-[#f3a847] bg-[#fef8f2] text-gray-950 ring-2 ring-[#f3a847] shadow-xs'
                      : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-2xl">{opt.icon}</span>
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>

            {/* UPI Option */}
            {paymentMethod === 'UPI' && (
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3 text-xs">
                <label className="block text-gray-700 font-bold">Virtual Payment Address (UPI ID)</label>
                <input
                  type="text"
                  value={paymentDetails.upiId}
                  onChange={(e) => setPaymentDetails({ ...paymentDetails, upiId: e.target.value })}
                  placeholder="e.g. mobile@upi or username@okhdfcbank"
                  className="w-full border border-gray-300 rounded p-2 focus:ring-1 focus:ring-[#febd69] bg-white font-mono"
                />
                <div className="flex gap-2 text-[10px] text-gray-600 pt-1">
                  <span className="bg-white border px-2 py-0.5 rounded font-semibold">Google Pay</span>
                  <span className="bg-white border px-2 py-0.5 rounded font-semibold">PhonePe</span>
                  <span className="bg-white border px-2 py-0.5 rounded font-semibold">Paytm</span>
                  <span className="bg-white border px-2 py-0.5 rounded font-semibold">Stock Shop Pay UPI</span>
                </div>
              </div>
            )}

            {/* Debit or Credit Card Option */}
            {(paymentMethod === 'DEBIT_CARD' || paymentMethod === 'CREDIT_CARD') && (
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3 text-xs">
                <div>
                  <label className="block text-gray-700 font-bold mb-1">
                    Demo {paymentMethod === 'DEBIT_CARD' ? 'Debit' : 'Credit'} Card Number
                  </label>
                  <input
                    type="text"
                    value={paymentDetails.cardNumber}
                    onChange={(e) => setPaymentDetails({ ...paymentDetails, cardNumber: e.target.value })}
                    placeholder="4532 8920 1234 5678"
                    className="w-full border border-gray-300 rounded p-2 focus:ring-1 focus:ring-[#febd69] font-mono text-sm bg-white"
                  />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <label className="block text-gray-700 font-bold mb-1">Cardholder Name</label>
                    <input
                      type="text"
                      value={paymentDetails.cardHolder}
                      onChange={(e) => setPaymentDetails({ ...paymentDetails, cardHolder: e.target.value })}
                      className="w-full border border-gray-300 rounded p-2 focus:ring-1 focus:ring-[#febd69] bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-bold mb-1">Expiry</label>
                    <input
                      type="text"
                      value={paymentDetails.expiry}
                      onChange={(e) => setPaymentDetails({ ...paymentDetails, expiry: e.target.value })}
                      placeholder="MM/YY"
                      className="w-full border border-gray-300 rounded p-2 focus:ring-1 focus:ring-[#febd69] bg-white text-center"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-gray-700 font-bold mb-1">CVV (Simulated)</label>
                  <input
                    type="password"
                    maxLength={4}
                    value={paymentDetails.cvv}
                    onChange={(e) => setPaymentDetails({ ...paymentDetails, cvv: e.target.value })}
                    placeholder="•••"
                    className="w-28 border border-gray-300 rounded p-2 focus:ring-1 focus:ring-[#febd69] font-mono text-center bg-white"
                  />
                </div>
              </div>
            )}

            {/* Net Banking Option */}
            {paymentMethod === 'NETBANKING' && (
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-2 text-xs">
                <label className="block text-gray-700 font-bold">Select Simulated Bank</label>
                <select
                  value={paymentDetails.bankName}
                  onChange={(e) => setPaymentDetails({ ...paymentDetails, bankName: e.target.value })}
                  className="w-full border border-gray-300 rounded p-2 focus:ring-1 focus:ring-[#febd69] bg-white font-semibold cursor-pointer"
                >
                  <option>HDFC Bank</option>
                  <option>State Bank of India (SBI)</option>
                  <option>ICICI Bank</option>
                  <option>Axis Bank</option>
                  <option>Kotak Mahindra Bank</option>
                </select>
              </div>
            )}
          </div>

          {/* SECTION 3: Academic Simulation Outcome Selector */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 shadow-xs space-y-3 text-xs">
            <span className="font-bold text-blue-950 uppercase tracking-wide flex items-center gap-1.5">
              <span>🧪</span>
              <span>Demo Gateway Result Simulation Controller</span>
            </span>
            <p className="text-blue-900 text-[11px]">
              Select which simulated response the backend server should return for this test:
            </p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'SUCCESS', label: '✓ Success (200 OK)', color: 'bg-emerald-600 text-white' },
                { id: 'FAILED', label: '✕ Failed (Decline)', color: 'bg-red-600 text-white' },
                { id: 'PENDING', label: '⏳ Pending (Processing)', color: 'bg-amber-600 text-white' },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setSimulationOutcome(m.id)}
                  className={`py-2 px-3 rounded-lg text-xs font-bold transition cursor-pointer border ${
                    simulationOutcome === m.id
                      ? `${m.color} shadow-md ring-2 ring-blue-500`
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* RIGHT 1 COLUMN: ORDER SUMMARY & PAY BUTTON                   */}
        {/* ============================================================ */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-xs space-y-4">
            <button
              type="submit"
              disabled={processing}
              className="w-full bg-[#ffd814] hover:bg-[#f7ca00] text-gray-950 font-black py-3.5 rounded-full text-sm shadow-md transition active:scale-95 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {processing ? (
                <>
                  <span className="inline-block animate-spin">⏳</span>
                  <span>Connecting to Test Gateway...</span>
                </>
              ) : (
                <>
                  <span>Pay ₹{cartSubtotal.toLocaleString('en-IN')} (Demo)</span>
                  <span>🔒</span>
                </>
              )}
            </button>

            <div className="border-t border-gray-200 pt-3 space-y-2 text-xs">
              <h4 className="font-bold text-gray-900 text-sm">Order Summary</h4>
              <div className="flex justify-between text-gray-600">
                <span>Items Subtotal:</span>
                <span className="font-semibold text-gray-900">₹{cartSubtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-emerald-700 font-semibold">
                <span>Prime Delivery:</span>
                <span>FREE</span>
              </div>
              <div className="flex justify-between text-base font-black text-gray-900 pt-2 border-t border-gray-100">
                <span>Total Amount:</span>
                <span className="text-[#b12704]">₹{cartSubtotal.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Items in Package */}
            <div className="border-t border-gray-200 pt-3 text-xs space-y-2">
              <span className="font-bold text-gray-700 block">
                Products in Package ({cart.length}):
              </span>
              <div className="max-h-52 overflow-y-auto divide-y divide-gray-100 pr-1">
                {cart.map((item) => (
                  <div key={item.id} className="py-2 flex items-center justify-between gap-2">
                    <span className="line-clamp-1 text-gray-800 text-[11px]">
                      {item.title}
                    </span>
                    <span className="text-[11px] font-bold text-gray-900 shrink-0">
                      {item.quantity} × ₹{item.price.toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
