import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';

export default function RegisterPage() {
  const { register, setCurrentView } = useShop();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    street: '',
    city: '',
    state: 'Karnataka',
    pincode: '',
  });

  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (formData.password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    try {
      await register({
        fullName: formData.name,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        phoneNumber: formData.phone,
        password: formData.password,
        address: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
        },
      });
      // Navigation is handled inside context
    } catch (err) {
      setErrorMsg(err.message || 'Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center px-4 py-8">
      {/* Stock Shop Header Logo */}
      <div
        onClick={() => setCurrentView('home')}
        className="text-3xl font-black text-gray-900 mb-6 cursor-pointer select-none"
      >
        stock<span className="text-[#febd69]"> shop</span>
      </div>

      {/* Main Registration Card */}
      <div className="w-full max-w-md bg-white p-7 rounded-lg border border-gray-300 shadow-xs space-y-4">
        <h1 className="text-2xl font-bold text-gray-900">Create Account</h1>

        {errorMsg && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-2.5 text-xs rounded">
            ⚠️ {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block text-gray-800 font-bold mb-1">Your name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="First and last name"
              className="w-full border border-gray-400 rounded p-2 focus:ring-1 focus:ring-[#febd69] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-gray-800 font-bold mb-1">Mobile number *</label>
            <input
              type="tel"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="10-digit mobile number"
              className="w-full border border-gray-400 rounded p-2 focus:ring-1 focus:ring-[#febd69] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-gray-800 font-bold mb-1">Email *</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="name@example.com"
              className="w-full border border-gray-400 rounded p-2 focus:ring-1 focus:ring-[#febd69] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-gray-800 font-bold mb-1">Password *</label>
            <input
              type="password"
              required
              minLength={6}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="At least 6 characters"
              className="w-full border border-gray-400 rounded p-2 focus:ring-1 focus:ring-[#febd69] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-gray-800 font-bold mb-1">Re-enter password *</label>
            <input
              type="password"
              required
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              placeholder="Confirm password"
              className="w-full border border-gray-400 rounded p-2 focus:ring-1 focus:ring-[#febd69] focus:outline-none"
            />
          </div>

          {/* Delivery Address Details */}
          <div className="pt-2 border-t border-gray-200 space-y-2">
            <span className="font-bold text-gray-800 block text-[11px] uppercase tracking-wide">
              Default Shipping Address (Saved to MongoDB):
            </span>
            <div>
              <input
                type="text"
                required
                value={formData.street}
                onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                placeholder="Flat / House no. / Street address *"
                className="w-full border border-gray-300 rounded p-2 focus:ring-1 focus:ring-[#febd69]"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                required
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="City *"
                className="w-full border border-gray-300 rounded p-2 focus:ring-1 focus:ring-[#febd69]"
              />
              <input
                type="text"
                required
                value={formData.pincode}
                onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                placeholder="PIN code *"
                className="w-full border border-gray-300 rounded p-2 focus:ring-1 focus:ring-[#febd69]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-[#ffd814] hover:bg-[#f7ca00] text-gray-950 font-bold py-2.5 rounded-md text-xs shadow-xs transition active:scale-95 cursor-pointer mt-2 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <span className="animate-spin text-sm">⏳</span> Creating Customer Record in MongoDB...
              </>
            ) : (
              'Create your Stock Shop account'
            )}
          </button>
        </form>

        <p className="text-[11px] text-gray-600 leading-normal pt-2 border-t border-gray-200">
          Already have an account?{' '}
          <span
            onClick={() => setCurrentView('login')}
            className="text-blue-600 hover:underline font-bold cursor-pointer"
          >
            Sign in ▸
          </span>
        </p>
      </div>
    </div>
  );
}
