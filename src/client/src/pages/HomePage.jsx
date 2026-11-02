import React from 'react';
import { useShop } from '../context/ShopContext';
import ProductCard from '../components/ProductCard';

export default function HomePage() {
  const {
    filteredProducts,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    setCurrentView,
  } = useShop();

  return (
    <div className="space-y-6">
      {/* ============================================================ */}
      {/* 1. AMAZON PROMO HERO BANNER                                  */}
      {/* ============================================================ */}
      <div className="relative bg-gradient-to-r from-[#131921] via-[#232f3e] to-[#37475a] text-white py-12 px-6 sm:px-12 shadow-md overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-[#febd69]/10 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
          <div className="space-y-4 max-w-2xl text-center md:text-left">
            <div className="inline-flex items-center gap-2 bg-[#febd69] text-gray-950 font-black text-xs px-3 py-1 rounded-full uppercase tracking-wider shadow">
              <span>⚡</span>
              <span>Great Indian Festival & Gateway Demo</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              Up to <span className="text-[#febd69]">50% Off</span> on Electronics & Gadgets
            </h1>

            <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
              Explore authentic Stock Shop UI: customer profile management, real-time shopping cart calculation, and simulated payment processing with cards & UPI.
            </p>

            <div className="flex flex-wrap gap-3 justify-center md:justify-start pt-2">
              <button
                onClick={() => {
                  setSelectedCategory('Electronics');
                  setSearchQuery('');
                }}
                className="bg-[#ffd814] hover:bg-[#f7ca00] text-gray-950 font-bold px-6 py-2.5 rounded-full text-xs sm:text-sm shadow-md transition active:scale-95 cursor-pointer"
              >
                Explore Electronics
              </button>
              <button
                onClick={() => setCurrentView('orders')}
                className="bg-white/10 hover:bg-white/20 text-white font-semibold px-6 py-2.5 rounded-full text-xs sm:text-sm border border-white/30 backdrop-blur-xs transition cursor-pointer"
              >
                Track Past Orders
              </button>
            </div>
          </div>

          {/* Quick Value Cards on right */}
          <div className="grid grid-cols-2 gap-3 w-full sm:w-auto text-xs">
            <div
              onClick={() => setSelectedCategory('Audio')}
              className="bg-white/10 hover:bg-white/20 border border-white/15 backdrop-blur-md p-4 rounded-xl cursor-pointer transition text-center space-y-1"
            >
              <span className="text-2xl block">🎧</span>
              <span className="font-bold text-white block">Audio & Sound</span>
              <span className="text-[10px] text-[#febd69]">Up to 30% off</span>
            </div>
            <div
              onClick={() => setSelectedCategory('Wearables')}
              className="bg-white/10 hover:bg-white/20 border border-white/15 backdrop-blur-md p-4 rounded-xl cursor-pointer transition text-center space-y-1"
            >
              <span className="text-2xl block">⌚</span>
              <span className="font-bold text-white block">Smartwatches</span>
              <span className="text-[10px] text-[#febd69]">Special deals</span>
            </div>
            <div
              onClick={() => setSelectedCategory('Gaming')}
              className="bg-white/10 hover:bg-white/20 border border-white/15 backdrop-blur-md p-4 rounded-xl cursor-pointer transition text-center space-y-1"
            >
              <span className="text-2xl block">🎮</span>
              <span className="font-bold text-white block">Gaming Consoles</span>
              <span className="text-[10px] text-[#febd69]">PS5 & Gear</span>
            </div>
            <div
              onClick={() => setCurrentView('checkout')}
              className="bg-white/10 hover:bg-white/20 border border-white/15 backdrop-blur-md p-4 rounded-xl cursor-pointer transition text-center space-y-1"
            >
              <span className="text-2xl block">💳</span>
              <span className="font-bold text-white block">Stock Shop Pay</span>
              <span className="text-[10px] text-[#febd69]">Simulated Gateway</span>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. TRUST HIGHLIGHT BAR                                       */}
      {/* ============================================================ */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center text-xs">
          <div className="flex items-center justify-center gap-2">
            <span className="text-xl">🚚</span>
            <div className="text-left">
              <span className="font-bold block text-gray-900">Fast & Free Delivery</span>
              <span className="text-gray-500 text-[11px]">Free with Stock Shop Prime</span>
            </div>
          </div>
          <div className="flex items-center justify-center gap-2">
            <span className="text-xl">🔒</span>
            <div className="text-left">
              <span className="font-bold block text-gray-900">100% Secure Payment</span>
              <span className="text-gray-500 text-[11px]">Encrypted transactions</span>
            </div>
          </div>
          <div className="flex items-center justify-center gap-2">
            <span className="text-xl">🔄</span>
            <div className="text-left">
              <span className="font-bold block text-gray-900">7-Day Easy Returns</span>
              <span className="text-gray-500 text-[11px]">Hassle-free replacement</span>
            </div>
          </div>
          <div className="flex items-center justify-center gap-2">
            <span className="text-xl">💬</span>
            <div className="text-left">
              <span className="font-bold block text-gray-900">24/7 Customer Help</span>
              <span className="text-gray-500 text-[11px]">Dedicated support</span>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 3. PRODUCT CATALOGUE SECTION                                 */}
      {/* ============================================================ */}
      <div className="max-w-7xl mx-auto px-4 pb-12">
        {/* Filter & Count Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-300 gap-2 mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <span>Featured Deals & Popular Products</span>
              {selectedCategory !== 'All' && (
                <span className="text-xs bg-[#232f3e] text-white px-2 py-0.5 rounded font-normal">
                  Category: {selectedCategory}
                </span>
              )}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Showing {filteredProducts.length} items{' '}
              {searchQuery && `matching "${searchQuery}"`}
            </p>
          </div>

          {(selectedCategory !== 'All' || searchQuery) && (
            <button
              onClick={() => {
                setSelectedCategory('All');
                setSearchQuery('');
              }}
              className="text-xs text-blue-600 hover:underline font-semibold cursor-pointer text-left"
            >
              Clear filters ✕
            </button>
          )}
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center space-y-3">
            <span className="text-4xl block">🔍</span>
            <h3 className="text-base font-bold text-gray-900">No matching products found</h3>
            <p className="text-xs text-gray-500 max-w-md mx-auto">
              We couldn't find any products matching your current category or search criteria.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('All');
                setSearchQuery('');
              }}
              className="bg-[#ffd814] hover:bg-[#f7ca00] text-gray-900 font-bold px-5 py-2 rounded-full text-xs shadow-xs cursor-pointer"
            >
              View All Products
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

