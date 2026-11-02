import React from 'react';

export default function CartDrawer({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
}) {
  if (!isOpen) return null;

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs transition-opacity">
      <div className="w-full max-w-md bg-white h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="bg-[#232f3e] text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🛒</span>
            <h2 className="text-lg font-bold">Shopping Cart ({cartItems.length} items)</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-300 hover:text-white text-2xl font-bold cursor-pointer p-1"
          >
            ✕
          </button>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-4 divide-y divide-gray-200">
          {cartItems.length === 0 ? (
            <div className="py-16 text-center text-gray-500">
              <span className="text-5xl block mb-2">🛍️</span>
              <p className="text-base font-semibold text-gray-700">Your Stock Shop Cart is empty</p>
              <p className="text-xs text-gray-400 mt-1">Explore our deals and add items to your cart</p>
              <button
                onClick={onClose}
                className="mt-4 bg-[#ffd814] hover:bg-[#f7ca00] text-gray-900 font-semibold px-6 py-2 rounded-full text-xs shadow"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            cartItems.map((item) => (
              <div key={item.id} className="py-4 flex gap-3 items-start">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-20 h-20 object-contain rounded bg-gray-50 p-1 border border-gray-100"
                />
                <div className="flex-1">
                  <h4 className="text-xs font-semibold text-gray-900 line-clamp-2">
                    {item.title}
                  </h4>
                  <div className="text-sm font-bold text-gray-900 mt-1">
                    ₹{item.price.toLocaleString('en-IN')}
                  </div>
                  <span className="text-[11px] text-emerald-600 font-medium">In stock</span>

                  {/* Quantity & Delete Controls */}
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex items-center border border-gray-300 rounded-md bg-gray-50">
                      <button
                        onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                        className="px-2 py-0.5 text-gray-600 hover:bg-gray-200 text-xs font-bold"
                      >
                        -
                      </button>
                      <span className="px-2 text-xs font-semibold text-gray-800">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                        className="px-2 py-0.5 text-gray-600 hover:bg-gray-200 text-xs font-bold"
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={() => onRemoveItem(item.id)}
                      className="text-xs text-red-600 hover:underline cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer & Checkout Action */}
        {cartItems.length > 0 && (
          <div className="border-t border-gray-200 p-4 bg-gray-50 space-y-3">
            <div className="space-y-1.5 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-gray-800">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-emerald-700">
                <span>Prime Delivery</span>
                <span className="font-semibold">FREE</span>
              </div>
              <div className="flex justify-between text-base font-bold text-gray-900 pt-2 border-t border-gray-200">
                <span>Order Total</span>
                <span className="text-[#b12704]">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <button
              onClick={() => {
                onClose();
                onProceedToCheckout();
              }}
              className="w-full bg-[#ffd814] hover:bg-[#f7ca00] text-gray-900 font-bold py-2.5 px-4 rounded-full text-sm shadow-md transition cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Proceed to Buy</span>
              <span className="text-xs font-normal">({cartItems.length} items)</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

