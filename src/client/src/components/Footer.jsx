import React from 'react';
import { useShop } from '../context/ShopContext';

export default function Footer() {
  const { setCurrentView } = useShop();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#232f3e] text-gray-300 text-xs mt-16 select-none">
      {/* Back to top bar */}
      <div
        onClick={scrollToTop}
        className="bg-[#37475a] hover:bg-[#485769] text-center py-3 text-white font-medium cursor-pointer transition text-xs tracking-wider"
      >
        Back to top
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-8 border-b border-gray-700">
        <div>
          <h4 className="text-white font-bold mb-3 text-sm">Get to Know Us</h4>
          <ul className="space-y-2 text-gray-400">
            <li className="hover:underline cursor-pointer">About Stock Shop</li>
            <li className="hover:underline cursor-pointer">Careers</li>
            <li className="hover:underline cursor-pointer">Press Releases</li>
            <li className="hover:underline cursor-pointer">Stock Shop Science</li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-bold mb-3 text-sm">Connect with Us</h4>
          <ul className="space-y-2 text-gray-400">
            <li className="hover:underline cursor-pointer">Facebook</li>
            <li className="hover:underline cursor-pointer">Twitter / X</li>
            <li className="hover:underline cursor-pointer">Instagram</li>
            <li className="hover:underline cursor-pointer">LinkedIn</li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-bold mb-3 text-sm">Make Money with Us</h4>
          <ul className="space-y-2 text-gray-400">
            <li className="hover:underline cursor-pointer">Sell on Stock Shop</li>
            <li className="hover:underline cursor-pointer">Protect and Build Your Brand</li>
            <li className="hover:underline cursor-pointer">Stock Shop Global Selling</li>
            <li className="hover:underline cursor-pointer">Become an Affiliate</li>
            <li className="hover:underline cursor-pointer">Fulfilment by Stock Shop</li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-bold mb-3 text-sm">Stock Shop Payment Products</h4>
          <ul className="space-y-2 text-gray-400">
            <li
              onClick={() => setCurrentView('checkout')}
              className="text-[#febd69] font-semibold hover:underline cursor-pointer"
            >
              Stock Shop Pay Gateway
            </li>
            <li className="hover:underline cursor-pointer">Credit Card Marketplace</li>
            <li className="hover:underline cursor-pointer">Shop with Reward Points</li>
            <li className="hover:underline cursor-pointer">Reload Your Balance</li>
            <li className="hover:underline cursor-pointer">Simulated Card & UPI Processing</li>
          </ul>
        </div>
      </div>

      {/* Middle logo & regional bar */}
      <div className="py-8 flex flex-col sm:flex-row items-center justify-center gap-6 border-b border-gray-700 text-xs">
        <div
          onClick={() => setCurrentView('home')}
          className="text-2xl font-black text-white cursor-pointer"
        >
          stock<span className="text-[#febd69]"> shop</span>
        </div>
        <div className="flex gap-3 text-gray-300">
          <span className="border border-gray-600 px-3 py-1 rounded cursor-pointer hover:border-gray-400">
            🌐 English
          </span>
          <span className="border border-gray-600 px-3 py-1 rounded cursor-pointer hover:border-gray-400">
            🇮🇳 India
          </span>
        </div>
      </div>

      {/* Copyright */}
      <div className="text-center py-6 text-gray-400 text-[11px] space-y-1">
        <p className="space-x-4">
          <span className="hover:underline cursor-pointer">Conditions of Use & Sale</span>
          <span className="hover:underline cursor-pointer">Privacy Notice</span>
          <span className="hover:underline cursor-pointer">Interest-Based Ads</span>
        </p>
        <p>© 2026 Stock Shop E-Commerce Customer Management and Payment System. All rights reserved.</p>
      </div>
    </footer>
  );
}
