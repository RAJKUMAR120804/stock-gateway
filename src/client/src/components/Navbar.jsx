import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { CATEGORIES } from '../data/products';

export default function Navbar() {
  const {
    currentView,
    setCurrentView,
    user,
    cartTotalUnits,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    logout,
  } = useShop();

  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentView('home');
  };

  return (
    <header className="bg-[#131921] text-white sticky top-0 z-50 shadow-md">
      {/* 1. TOP MAIN NAVIGATION BAR */}
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between gap-3 sm:gap-4">
        {/* Stock Shop Logo */}
        <div
          onClick={() => {
            setSelectedCategory('All');
            setSearchQuery('');
            setCurrentView('home');
          }}
          className="flex items-center cursor-pointer border border-transparent hover:border-white p-1 rounded transition select-none"
        >
          <span className="text-2xl font-black tracking-tight text-white flex items-center">
            stock<span className="text-[#febd69]"> shop</span>
          </span>
          <span className="text-[10px] text-[#febd69] font-bold ml-1.5 px-1.5 py-0.5 bg-[#232f3e] rounded uppercase tracking-wider">
            Store
          </span>
        </div>

        {/* Deliver to Location */}
        <div
          onClick={() => (user ? setCurrentView('profile') : setCurrentView('login'))}
          className="hidden md:flex flex-col text-xs border border-transparent hover:border-white p-1.5 rounded cursor-pointer leading-tight select-none"
        >
          <span className="text-gray-400">Deliver to {user ? user.name.split(' ')[0] : 'Customer'}</span>
          <span className="font-bold flex items-center text-sm text-white">
            📍 {user?.address?.city || 'India'} {user?.address?.pincode ? `- ${user.address.pincode}` : ''}
          </span>
        </div>

        {/* Amazon Search Bar */}
        <form
          onSubmit={handleSearchSubmit}
          className="flex-1 max-w-2xl mx-1 sm:mx-3 flex items-center"
        >
          <div className="flex w-full rounded-md overflow-hidden bg-white text-gray-800 focus-within:ring-2 focus-within:ring-[#febd69]">
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentView('home');
              }}
              className="bg-gray-100 hover:bg-gray-200 text-xs text-gray-700 font-semibold px-2 sm:px-3 py-2 border-r border-gray-300 focus:outline-none cursor-pointer"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Stock Shop / Products, electronics & gadgets"
              className="w-full px-3 py-2 text-xs sm:text-sm focus:outline-none text-gray-900"
            />

            <button
              type="submit"
              className="bg-[#febd69] hover:bg-[#f3a847] px-4 sm:px-5 flex items-center justify-center text-gray-900 transition cursor-pointer"
            >
              🔍
            </button>
          </div>
        </form>

        {/* Right Navigation Actions */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Admin Dashboard Pill */}
          <button
            onClick={() => setCurrentView('admin')}
            className={`border px-2 py-1.5 rounded text-xs text-left transition select-none cursor-pointer ${
              currentView === 'admin'
                ? 'border-purple-400 bg-purple-900/50 text-purple-200'
                : 'border-purple-500/60 hover:border-purple-400 text-purple-300 bg-purple-950/30'
            }`}
          >
            <span className="block text-[10px] text-purple-300">Portal</span>
            <span className="font-bold text-xs sm:text-sm flex items-center gap-1">
              👑 Admin
            </span>
          </button>

          {/* Account & Lists */}
          <div className="relative">
            <button
              onClick={() => setAccountDropdownOpen(!accountDropdownOpen)}
              onMouseEnter={() => setAccountDropdownOpen(true)}
              className="border border-transparent hover:border-white px-2 py-1.5 rounded cursor-pointer text-xs text-left leading-tight block select-none"
            >
              <span className="text-gray-300 block text-[11px]">
                Hello, {user ? user.name.split(' ')[0] : 'sign in'}
              </span>
              <span className="font-bold text-xs sm:text-sm flex items-center gap-1">
                Account & Lists ▾
              </span>
            </button>

            {accountDropdownOpen && (
              <div
                onMouseLeave={() => setAccountDropdownOpen(false)}
                className="absolute right-0 top-full mt-1 w-56 bg-white text-gray-900 rounded-lg shadow-2xl border border-gray-200 py-3 z-50 text-xs animate-in fade-in zoom-in-95 duration-150"
              >
                {user ? (
                  <div className="px-4 pb-2 border-b border-gray-100">
                    <p className="font-bold text-gray-900">{user.name}</p>
                    <p className="text-[11px] text-gray-500 truncate">{user.email}</p>
                  </div>
                ) : (
                  <div className="px-4 pb-3 border-b border-gray-100 text-center">
                    <button
                      onClick={() => {
                        setAccountDropdownOpen(false);
                        setCurrentView('login');
                      }}
                      className="w-full bg-[#ffd814] hover:bg-[#f7ca00] text-gray-900 font-bold py-1.5 rounded-md text-xs shadow-xs mb-1.5 cursor-pointer"
                    >
                      Sign in
                    </button>
                    <p className="text-[11px] text-gray-600">
                      New customer?{' '}
                      <span
                        onClick={() => {
                          setAccountDropdownOpen(false);
                          setCurrentView('register');
                        }}
                        className="text-blue-600 hover:underline cursor-pointer font-semibold"
                      >
                        Start here.
                      </span>
                    </p>
                  </div>
                )}

                <div className="py-1">
                  <button
                    onClick={() => {
                      setAccountDropdownOpen(false);
                      setCurrentView('profile');
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center justify-between"
                  >
                    <span>Your Account & Profile</span>
                    <span>→</span>
                  </button>
                  <button
                    onClick={() => {
                      setAccountDropdownOpen(false);
                      setCurrentView('orders');
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center justify-between"
                  >
                    <span>Your Orders</span>
                    <span>→</span>
                  </button>
                  <button
                    onClick={() => {
                      setAccountDropdownOpen(false);
                      setCurrentView('admin');
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-purple-50 text-purple-900 font-semibold cursor-pointer flex items-center justify-between"
                  >
                    <span>Admin Dashboard (Sales & Stats)</span>
                    <span>👑</span>
                  </button>
                </div>

                {user && (
                  <div className="pt-2 border-t border-gray-100 px-4">
                    <button
                      onClick={() => {
                        setAccountDropdownOpen(false);
                        logout();
                        setCurrentView('login');
                      }}
                      className="text-xs text-red-600 hover:underline font-semibold cursor-pointer"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Returns & Orders */}
          <button
            onClick={() => setCurrentView('orders')}
            className={`border px-2 py-1.5 rounded text-xs text-left transition select-none cursor-pointer ${
              currentView === 'orders'
                ? 'border-[#febd69] text-[#febd69]'
                : 'border-transparent hover:border-white text-white'
            }`}
          >
            <span className="block text-gray-300 text-[11px]">Returns</span>
            <span className="font-bold text-xs sm:text-sm">& Orders</span>
          </button>

          {/* Cart */}
          <button
            onClick={() => setCurrentView('cart')}
            className={`flex items-center gap-1 border px-2 py-1 rounded cursor-pointer relative select-none transition ${
              currentView === 'cart'
                ? 'border-[#febd69] text-[#febd69]'
                : 'border-transparent hover:border-white text-white'
            }`}
          >
            <div className="relative flex items-center">
              <span className="text-2xl sm:text-3xl">🛒</span>
              <span className="absolute -top-1 left-3 bg-[#febd69] text-gray-900 font-black text-xs w-5 h-5 rounded-full flex items-center justify-center shadow">
                {cartTotalUnits}
              </span>
            </div>
            <span className="font-bold text-xs sm:text-sm hidden sm:inline ml-1">Cart</span>
          </button>
        </div>
      </div>

      {/* 2. SECONDARY CATEGORY RIBBON */}
      <div className="bg-[#232f3e] text-gray-200 text-xs px-4 py-1.5 flex items-center gap-4 overflow-x-auto whitespace-nowrap scrollbar-none">
        <button
          onClick={() => {
            setSelectedCategory('All');
            setCurrentView('home');
          }}
          className={`font-bold text-white flex items-center gap-1 cursor-pointer px-2 py-1 rounded hover:bg-gray-700 transition ${
            selectedCategory === 'All' ? 'bg-gray-700 ring-1 ring-[#febd69]' : ''
          }`}
        >
          ☰ All
        </button>

        {CATEGORIES.filter((c) => c !== 'All').map((cat) => (
          <button
            key={cat}
            onClick={() => {
              setSelectedCategory(cat);
              setCurrentView('home');
            }}
            className={`cursor-pointer px-2 py-1 rounded transition hover:text-white hover:bg-gray-700 ${
              selectedCategory === cat ? 'bg-gray-700 text-[#febd69] font-bold' : ''
            }`}
          >
            {cat}
          </button>
        ))}

        <span
          onClick={() => setCurrentView('home')}
          className="cursor-pointer hover:text-white px-2 py-1 hover:bg-gray-700 rounded"
        >
          Today's Deals
        </span>
        <span
          onClick={() => setCurrentView('admin')}
          className="cursor-pointer text-purple-300 hover:text-white px-2 py-1 hover:bg-gray-700 rounded font-bold"
        >
          👑 Admin Analytics
        </span>
        <span
          onClick={() => setCurrentView('checkout')}
          className="cursor-pointer hover:text-white px-2 py-1 hover:bg-gray-700 rounded"
        >
          Stock Shop Pay
        </span>

        <span className="ml-auto text-[#febd69] font-semibold hidden md:inline text-[11px]">
          🚀 Final Project Submission Complete
        </span>
      </div>
    </header>
  );
}
