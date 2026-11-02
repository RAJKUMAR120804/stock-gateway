import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';

export default function ProductCard({ product }) {
  const { addToCart, setCurrentView } = useShop();
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    addToCart(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const handleBuyNow = () => {
    addToCart(product, 1);
    setCurrentView('checkout');
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 hover:shadow-xl transition-all duration-300 p-4 flex flex-col justify-between group">
      <div>
        {/* Top Badges */}
        <div className="flex justify-between items-center mb-2 min-h-[22px]">
          {product.badge ? (
            <span
              className={`text-[10px] font-extrabold px-2 py-0.5 rounded shadow-xs uppercase tracking-wide ${
                product.badge === 'Best Seller'
                  ? 'bg-[#e67a00] text-white'
                  : (product.badge === "Stock Shop's Choice" || product.badge === "Amazon's Choice")
                  ? 'bg-[#232f3e] text-white'
                  : 'bg-red-600 text-white'
              }`}
            >
              {product.badge}
            </span>
          ) : <span />}

          <span className="text-[11px] text-gray-500 font-medium">
            {product.category}
          </span>
        </div>

        {/* Product Image Container */}
        <div className="h-52 w-full flex items-center justify-center overflow-hidden mb-3 bg-gray-50 rounded-md p-2">
          <img
            src={product.image}
            alt={product.title}
            className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        </div>

        {/* Product Title */}
        <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 hover:text-[#c45500] cursor-pointer mb-1 leading-snug">
          {product.title}
        </h3>

        {/* Ratings & Reviews */}
        <div className="flex items-center gap-1.5 mb-2">
          <div className="flex text-amber-500 text-xs">
            {'★'.repeat(Math.floor(product.rating))}
            {product.rating % 1 !== 0 && '½'}
          </div>
          <span className="text-xs text-blue-600 hover:underline cursor-pointer">
            {product.reviews.toLocaleString()} ratings
          </span>
        </div>

        {/* Price Section */}
        <div className="mb-2">
          <div className="flex items-baseline gap-2">
            <span className="text-xs text-red-700 font-bold bg-red-50 px-1.5 py-0.5 rounded">
              {product.discount}
            </span>
            <span className="text-xl font-black text-gray-900">
              ₹{product.price.toLocaleString('en-IN')}
            </span>
          </div>
          <div className="text-xs text-gray-500 mt-0.5">
            M.R.P.: <span className="line-through">₹{product.originalPrice.toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* Prime Badge & Delivery Note */}
        {product.prime && (
          <div className="flex items-center gap-1.5 text-xs text-gray-700 mb-2">
            <span className="bg-[#00a8e1] text-white font-black px-1.5 py-0.2 rounded text-[10px] tracking-tight">
              prime
            </span>
            <span className="text-[11px]">
              FREE delivery <strong>Tomorrow</strong>
            </span>
          </div>
        )}

        <div className="text-[11px] text-emerald-700 font-semibold mb-3">
          ✓ In stock • Ships from Stock Shop
        </div>
      </div>

      {/* Buttons: Add to Cart & Buy Now */}
      <div className="space-y-2 pt-2 border-t border-gray-100">
        <button
          onClick={handleAdd}
          className={`w-full font-bold py-2 px-3 rounded-full text-xs shadow-sm transition active:scale-95 cursor-pointer flex items-center justify-center gap-1 ${
            added
              ? 'bg-emerald-600 text-white'
              : 'bg-[#ffd814] hover:bg-[#f7ca00] text-gray-900'
          }`}
        >
          {added ? (
            <>
              <span>✓</span>
              <span>Added to Cart!</span>
            </>
          ) : (
            <>
              <span>🛒</span>
              <span>Add to Cart</span>
            </>
          )}
        </button>

        <button
          onClick={handleBuyNow}
          className="w-full bg-[#ffa41c] hover:bg-[#fa8900] text-gray-900 font-bold py-1.5 px-3 rounded-full text-xs shadow-sm transition active:scale-95 cursor-pointer"
        >
          Buy Now
        </button>
      </div>
    </div>
  );
}
