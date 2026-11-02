import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function AuthModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const { login, register } = useAuth();
  const [tab, setTab] = useState('login'); // 'login' | 'register'
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register state
  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    pincode: '',
  });

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);
    try {
      await login(loginEmail, loginPassword);
      onClose();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);
    try {
      await register({
        name: registerData.name,
        email: registerData.email,
        password: registerData.password,
        phone: registerData.phone,
        address: {
          street: registerData.street,
          city: registerData.city,
          state: registerData.state,
          pincode: registerData.pincode,
        },
      });
      onClose();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAdmin = () => {
    setTab('login');
    setLoginEmail('admin@amazon.com');
    setLoginPassword('admin123');
  };

  const fillDemoCustomer = () => {
    setTab('login');
    setLoginEmail('ragavi@example.com');
    setLoginPassword('customer123');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-md rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Stock Shop Header */}
        <div className="bg-[#131921] px-6 py-4 flex items-center justify-between text-white border-b border-[#febd69]">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black text-white">
              stock<span className="text-[#febd69]"> shop</span>
            </span>
            <span className="text-xs bg-[#232f3e] text-[#febd69] font-semibold px-2 py-0.5 rounded">
              Customer Account
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-xl font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-gray-200 bg-gray-50 text-xs font-bold">
          <button
            onClick={() => {
              setTab('login');
              setErrorMsg('');
            }}
            className={`flex-1 py-3 text-center border-b-2 transition cursor-pointer ${
              tab === 'login'
                ? 'border-[#f3a847] bg-white text-gray-900 shadow-xs'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            Sign-In
          </button>
          <button
            onClick={() => {
              setTab('register');
              setErrorMsg('');
            }}
            className={`flex-1 py-3 text-center border-b-2 transition cursor-pointer ${
              tab === 'register'
                ? 'border-[#f3a847] bg-white text-gray-900 shadow-xs'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6">
          {errorMsg && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-500 text-red-700 p-3 text-xs rounded">
              {errorMsg}
            </div>
          )}

          {tab === 'login' ? (
            /* ============================================================ */
            /* SIGN-IN FORM                                                 */
            /* ============================================================ */
            <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-700 font-semibold mb-1">
                  Email address
                </label>
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full border border-gray-300 rounded p-2.5 focus:ring-1 focus:ring-[#febd69] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full border border-gray-300 rounded p-2.5 focus:ring-1 focus:ring-[#febd69] focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#ffd814] hover:bg-[#f7ca00] text-gray-900 font-bold py-2.5 rounded-full text-xs shadow transition cursor-pointer disabled:opacity-50"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>

              {/* Demo Fill Pills */}
              <div className="pt-2 border-t border-gray-100 space-y-1.5 text-center">
                <span className="text-[11px] text-gray-400 block">Quick Demo Logins:</span>
                <div className="flex justify-center gap-2">
                  <button
                    type="button"
                    onClick={fillDemoAdmin}
                    className="text-[10px] bg-purple-50 text-purple-700 border border-purple-200 px-2.5 py-1 rounded-full font-medium hover:bg-purple-100 cursor-pointer"
                  >
                    👑 Admin (admin@amazon.com)
                  </button>
                  <button
                    type="button"
                    onClick={fillDemoCustomer}
                    className="text-[10px] bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-1 rounded-full font-medium hover:bg-blue-100 cursor-pointer"
                  >
                    👤 Customer (ragavi@example.com)
                  </button>
                </div>
              </div>
            </form>
          ) : (
            /* ============================================================ */
            /* REGISTRATION FORM                                            */
            /* ============================================================ */
            <form onSubmit={handleRegisterSubmit} className="space-y-3 text-xs max-h-[60vh] overflow-y-auto pr-1">
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Your name *</label>
                <input
                  type="text"
                  required
                  value={registerData.name}
                  onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                  placeholder="First and last name"
                  className="w-full border border-gray-300 rounded p-2 focus:ring-1 focus:ring-[#febd69] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1">Email *</label>
                <input
                  type="email"
                  required
                  value={registerData.email}
                  onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                  placeholder="name@example.com"
                  className="w-full border border-gray-300 rounded p-2 focus:ring-1 focus:ring-[#febd69] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1">Password * (at least 6 characters)</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={registerData.password}
                  onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full border border-gray-300 rounded p-2 focus:ring-1 focus:ring-[#febd69] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1">Mobile number</label>
                <input
                  type="tel"
                  value={registerData.phone}
                  onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })}
                  placeholder="10-digit mobile number"
                  className="w-full border border-gray-300 rounded p-2 focus:ring-1 focus:ring-[#febd69] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1">Street address</label>
                <input
                  type="text"
                  value={registerData.street}
                  onChange={(e) => setRegisterData({ ...registerData, street: e.target.value })}
                  placeholder="Flat, House no., Apartment"
                  className="w-full border border-gray-300 rounded p-2 focus:ring-1 focus:ring-[#febd69] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">City</label>
                  <input
                    type="text"
                    value={registerData.city}
                    onChange={(e) => setRegisterData({ ...registerData, city: e.target.value })}
                    placeholder="City"
                    className="w-full border border-gray-300 rounded p-2 focus:ring-1 focus:ring-[#febd69] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">PIN code</label>
                  <input
                    type="text"
                    value={registerData.pincode}
                    onChange={(e) => setRegisterData({ ...registerData, pincode: e.target.value })}
                    placeholder="PIN code"
                    className="w-full border border-gray-300 rounded p-2 focus:ring-1 focus:ring-[#febd69] focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#ffd814] hover:bg-[#f7ca00] text-gray-900 font-bold py-2.5 rounded-full text-xs shadow transition cursor-pointer mt-2 disabled:opacity-50"
              >
                {loading ? 'Creating your account...' : 'Create your Stock Shop account'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

