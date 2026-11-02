import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';

export default function CartPage() {
  const {
    cart,
    cartTotalUnits,
    cartSubtotal,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    setCurrentView,
  } = useShop();

  const [couponCode, setCouponCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [couponMsg, setCouponMsg] = useState('');

  const applyCoupon = (e) => {
    e.preventDefault();
    const clean = couponCode.trim().toUpperCase();
    if (clean === 'STOCK10' || clean === 'AMAZON10') {
      setDiscountPercent(10);
      setCouponMsg('✓ Coupon STOCK10 applied! 10% discount added.');
    } else {
      setCouponMsg('✕ Invalid coupon code. Try code: STOCK10');
    }
  };

  const discountAmount = Math.round((cartSubtotal * discountPercent) / 100);
  const finalTotal = cartSubtotal - discountAmount;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* ============================================================ */}
        {/* LEFT COLUMN: SHOPPING CART ITEMS LIST                        */}
        {/* ============================================================ */}
        <div className="flex-1 bg-white p-6 rounded-lg border border-gray-200 shadow-xs w-full">
          <div className="flex justify-between items-end pb-3 border-b border-gray-200">
            <div>
              <h1 className="text-2xl font-black text-gray-900">Shopping Cart</h1>
              <span className="text-xs text-gray-500">
                {cart.length > 0 ? 'Deselect all items' : 'Your cart is empty'}
              </span>
            </div>
            {cart.length > 0 && (
              <span className="text-xs text-gray-500 font-semibold hidden sm:inline">Price</span>
            )}
          </div>

          {cart.length === 0 ? (
            <div className="text-center py-16 space-y-4">
              <span className="text-6xl block">🛒</span>
              <h2 className="text-xl font-bold text-gray-800">Your Stock Shop Cart is empty</h2>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                Your shopping cart is waiting for you. Give it purpose — fill it with electronics, gadgets, and deals.
              </p>
              <button
                onClick={() => setCurrentView('home')}
                className="bg-[#ffd814] hover:bg-[#f7ca00] text-gray-900 font-bold px-6 py-2.5 rounded-full text-xs shadow-md cursor-pointer transition active:scale-95"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {cart.map((item) => (
                <div key={item.id} className="py-5 flex flex-col sm:flex-row gap-4">
                  {/* Product Image */}
                  <div className="w-28 h-28 sm:w-36 sm:h-36 bg-gray-50 rounded-md border border-gray-100 p-2 flex items-center justify-center shrink-0">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 space-y-1.5">
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="font-semibold text-gray-900 text-sm hover:text-[#c45500] cursor-pointer">
                        {item.title}
                      </h3>
                      <span className="font-black text-base text-gray-900 sm:text-right shrink-0">
                        ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div className="text-xs text-emerald-700 font-semibold">
                      ✓ In stock • Eligible for FREE Shipping
                    </div>

                    <div className="text-[11px] text-gray-500">
                      Category: <span className="font-medium text-gray-700">{item.category}</span>
                    </div>

                    {/* Quantity & Action Controls */}
                    <div className="flex flex-wrap items-center gap-3 pt-2 text-xs">
                      <div className="flex items-center border border-gray-300 rounded-md bg-gray-50 shadow-2xs">
                        <button
                          onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                          className="px-2.5 py-1 text-gray-700 hover:bg-gray-200 font-bold cursor-pointer"
                        >
                          -
                        </button>
                        <span className="px-3 font-bold text-gray-900 select-none">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                          className="px-2.5 py-1 text-gray-700 hover:bg-gray-200 font-bold cursor-pointer"
                        >
                          +
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-blue-600 hover:underline cursor-pointer"
                      >
                        Delete
                      </button>

                      <span className="text-gray-300">|</span>

                      <button
                        onClick={() => alert(`Saved ${item.title} for later!`)}
                        className="text-blue-600 hover:underline cursor-pointer"
                      >
                        Save for later
                      </button>

                      <span className="text-gray-300">|</span>

                      <span className="text-gray-500 text-[11px]">
                        Unit Price: ₹{item.price.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>
              ))}

              <div className="pt-4 flex justify-between items-center text-xs">
                <button
                  onClick={clearCart}
                  className="text-red-600 hover:underline font-semibold cursor-pointer"
                >
                  Clear all items from cart
                </button>
                <div className="text-base text-right font-medium text-gray-800">
                  Subtotal ({cartTotalUnits} items):{' '}
                  <span className="font-black text-gray-900 text-lg">
                    ₹{cartSubtotal.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ============================================================ */}
        {/* RIGHT COLUMN: ORDER SUMMARY CARD                             */}
        {/* ============================================================ */}
        {cart.length > 0 && (
          <div className="w-full lg:w-80 bg-white p-6 rounded-lg border border-gray-200 shadow-xs space-y-4 shrink-0">
            {/* Free Delivery Bar */}
            <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-md text-xs space-y-1">
              <span className="font-bold text-emerald-800 flex items-center gap-1">
                ✓ Free Delivery with Prime
              </span>
              <p className="text-gray-600 text-[11px]">
                Your order qualifies for FREE Delivery by Tomorrow.
              </p>
            </div>

            {/* Subtotal & Items Breakdown */}
            <div className="space-y-2 border-b border-gray-200 pb-4 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>Items Subtotal:</span>
                <span className="font-semibold text-gray-900">
                  ₹{cartSubtotal.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="flex justify-between text-emerald-700">
                <span>Delivery:</span>
                <span className="font-bold">FREE</span>
              </div>

              {discountPercent > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Discount ({discountPercent}% off):</span>
                  <span className="font-bold">-₹{discountAmount.toLocaleString('en-IN')}</span>
                </div>
              )}

              <div className="flex justify-between text-base font-black text-gray-900 pt-2 border-t border-gray-100">
                <span>Order Total:</span>
                <span className="text-[#b12704]">
                  ₹{finalTotal.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Promo Code Input */}
            <form onSubmit={applyCoupon} className="space-y-1.5 text-xs">
              <label className="block text-gray-700 font-semibold">
                Gift Card or Promo Code:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="e.g. STOCK10"
                  className="flex-1 border border-gray-300 rounded p-1.5 focus:ring-1 focus:ring-[#febd69] uppercase font-mono text-xs"
                />
                <button
                  type="submit"
                  className="bg-gray-100 hover:bg-gray-200 border border-gray-300 font-bold px-3 py-1.5 rounded cursor-pointer"
                >
                  Apply
                </button>
              </div>
              {couponMsg && (
                <p
                  className={`text-[11px] font-semibold ${
                    couponMsg.startsWith('✓') ? 'text-emerald-700' : 'text-red-600'
                  }`}
                >
                  {couponMsg}
                </p>
              )}
            </form>

            {/* Proceed to Checkout Button */}
            <button
              onClick={() => setCurrentView('checkout')}
              className="w-full bg-[#ffd814] hover:bg-[#f7ca00] text-gray-900 font-black py-3 rounded-full text-sm shadow-md transition active:scale-95 cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Proceed to Buy</span>
              <span className="text-xs font-normal">({cartTotalUnits} items)</span>
            </button>

            <div className="text-[11px] text-gray-500 text-center flex items-center justify-center gap-1 pt-1">
              <span>🔒</span>
              <span>100% Purchase Protection & Secure Payment</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

