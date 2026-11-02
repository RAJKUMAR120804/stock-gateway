import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';

export default function LoginPage() {
  const { login, setCurrentView } = useShop();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }
    setSubmitting(true);
    try {
      await login(email, password);
      // Navigation to 'home' is handled inside context
    } catch (err) {
      setErrorMsg(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemoCustomer = async () => {
    setErrorMsg('');
    setSubmitting(true);
    try {
      await login('ragavi@example.com', 'admin123');
    } catch (err) {
      // Fallback demo try
      try {
        await login('ragavi@example.com', 'demo123');
      } catch (e) {
        setErrorMsg(e.message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemoAdmin = async () => {
    setErrorMsg('');
    setSubmitting(true);
    try {
      await login('admin@amazon.com', 'admin123');
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex flex-col items-center justify-center px-4 py-8">
      {/* Stock Shop Header Logo */}
      <div
        onClick={() => setCurrentView('home')}
        className="text-3xl font-black text-gray-900 mb-6 cursor-pointer select-none"
      >
        stock<span className="text-[#febd69]"> shop</span>
      </div>

      {/* Main Login Card */}
      <div className="w-full max-w-sm bg-white p-7 rounded-lg border border-gray-300 shadow-xs space-y-4">
        <h1 className="text-2xl font-bold text-gray-900">Sign in</h1>

        {errorMsg && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-2.5 text-xs rounded">
            ⚠️ {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block text-gray-800 font-bold mb-1">
              Email or mobile phone number
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full border border-gray-400 rounded p-2 focus:ring-1 focus:ring-[#febd69] focus:outline-none"
            />
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <label className="text-gray-800 font-bold">Password</label>
              <span className="text-blue-600 hover:underline cursor-pointer">Forgot password?</span>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full border border-gray-400 rounded p-2 focus:ring-1 focus:ring-[#febd69] focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-[#ffd814] hover:bg-[#f7ca00] text-gray-950 font-bold py-2.5 rounded-md text-xs shadow-xs transition active:scale-95 cursor-pointer mt-1 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <span className="animate-spin text-sm">⏳</span> Authenticating with MongoDB...
              </>
            ) : (
              'Sign in'
            )}
          </button>
        </form>

        <p className="text-[11px] text-gray-600 leading-normal pt-1">
          By continuing, you agree to Stock Shop's{' '}
          <span className="text-blue-600 hover:underline cursor-pointer">Conditions of Use</span> and{' '}
          <span className="text-blue-600 hover:underline cursor-pointer">Privacy Notice</span>.
        </p>

        {/* Quick Demo Login Pills */}
        <div className="pt-3 border-t border-gray-200 text-center space-y-2">
          <span className="text-[11px] text-gray-500 block font-semibold">One-Click Demo Logins:</span>
          <div className="flex gap-2 justify-center">
            <button
              onClick={handleDemoCustomer}
              disabled={submitting}
              className="bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold px-3 py-1 rounded-full hover:bg-blue-100 cursor-pointer disabled:opacity-50"
            >
              👤 Customer (Ragavi)
            </button>
            <button
              onClick={handleDemoAdmin}
              disabled={submitting}
              className="bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-bold px-3 py-1 rounded-full hover:bg-purple-100 cursor-pointer disabled:opacity-50"
            >
              👑 Admin (Admin)
            </button>
          </div>
        </div>
      </div>

      {/* New to Stock Shop separator */}
      <div className="w-full max-w-sm mt-6 text-center">
        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="flex-shrink mx-3 text-gray-500 text-xs">New to Stock Shop?</span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>

        <button
          onClick={() => setCurrentView('register')}
          className="w-full bg-white hover:bg-gray-50 text-gray-900 font-semibold py-2 rounded-md text-xs border border-gray-400 shadow-2xs mt-2 transition cursor-pointer"
        >
          Create your Stock Shop account
        </button>
      </div>
    </div>
  );
}
