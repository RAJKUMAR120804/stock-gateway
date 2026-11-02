import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';

export default function ProfilePage() {
  const { user, updateProfile, orders, cartTotalUnits, setCurrentView, logout } = useShop();

  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || 'Ragavi M',
    email: user?.email || 'ragavi@example.com',
    phone: user?.phone || '9876543210',
    street: user?.address?.street || 'Flat 402, Royal Palms, Outer Ring Road',
    city: user?.address?.city || 'Bengaluru',
    state: user?.address?.state || 'Karnataka',
    pincode: user?.address?.pincode || '560103',
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    updateProfile({
      name: profileData.name,
      email: profileData.email,
      phone: profileData.phone,
      address: {
        street: profileData.street,
        city: profileData.city,
        state: profileData.state,
        pincode: profileData.pincode,
      },
    });
    setIsEditing(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-300 gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Your Account & Customer Profile</h1>
          <p className="text-xs text-gray-500 mt-1">
            Manage your personal credentials, contact info, and default delivery addresses.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setCurrentView('orders')}
            className="bg-white border border-gray-300 text-gray-800 font-bold px-4 py-2 rounded-lg text-xs hover:bg-gray-50 shadow-2xs transition cursor-pointer"
          >
            📦 Your Orders ({orders.length})
          </button>
          <button
            onClick={() => {
              logout();
              setCurrentView('login');
            }}
            className="bg-red-50 border border-red-200 text-red-700 font-bold px-4 py-2 rounded-lg text-xs hover:bg-red-100 transition cursor-pointer"
          >
            Sign Out
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div className="bg-emerald-50 border-l-4 border-emerald-500 text-emerald-800 p-3 text-xs rounded animate-in fade-in">
          ✓ Profile and delivery address successfully saved!
        </div>
      )}

      {/* Top Profile Summary Card */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-[#131921] text-[#febd69] font-black text-2xl flex items-center justify-center shadow-inner">
            {profileData.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-gray-900">{profileData.name}</h2>
              <span className="bg-[#febd69] text-gray-950 font-bold text-[10px] px-2 py-0.5 rounded-full uppercase">
                Prime Member
              </span>
            </div>
            <p className="text-xs text-gray-500">{profileData.email}</p>
            <p className="text-xs text-gray-500">Phone: {profileData.phone}</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="flex items-center gap-4 text-center text-xs">
          <div className="bg-gray-50 border border-gray-200 p-3 rounded-lg min-w-[90px]">
            <span className="text-lg font-black text-gray-900 block">{orders.length}</span>
            <span className="text-gray-500 text-[11px]">Orders</span>
          </div>
          <div className="bg-gray-50 border border-gray-200 p-3 rounded-lg min-w-[90px]">
            <span className="text-lg font-black text-gray-900 block">{cartTotalUnits}</span>
            <span className="text-gray-500 text-[11px]">Cart Items</span>
          </div>
          <div className="bg-gray-50 border border-gray-200 p-3 rounded-lg min-w-[90px]">
            <span className="text-lg font-black text-emerald-700 block">Active</span>
            <span className="text-gray-500 text-[11px]">Status</span>
          </div>
        </div>
      </div>

      {/* Profile Details & Address Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-xs space-y-6">
        <div className="flex justify-between items-center border-b border-gray-200 pb-3">
          <h3 className="text-base font-bold text-gray-900">Personal Information & Address</h3>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="bg-[#ffd814] hover:bg-[#f7ca00] text-gray-900 font-bold px-4 py-1.5 rounded-full text-xs shadow-2xs transition cursor-pointer"
            >
              ✎ Edit Details
            </button>
          ) : (
            <button
              onClick={() => setIsEditing(false)}
              className="text-xs text-gray-600 hover:underline cursor-pointer"
            >
              Cancel
            </button>
          )}
        </div>

        {!isEditing ? (
          /* View Mode */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div className="space-y-3 bg-gray-50 p-4 rounded-lg border border-gray-100">
              <h4 className="font-bold text-gray-900 uppercase text-[11px] border-b pb-1">
                Account Details
              </h4>
              <div>
                <span className="text-gray-500 block text-[11px]">Customer Name:</span>
                <span className="font-semibold text-gray-800 text-sm">{profileData.name}</span>
              </div>
              <div>
                <span className="text-gray-500 block text-[11px]">Email Address:</span>
                <span className="font-semibold text-gray-800 text-sm">{profileData.email}</span>
              </div>
              <div>
                <span className="text-gray-500 block text-[11px]">Phone:</span>
                <span className="font-semibold text-gray-800 text-sm">{profileData.phone}</span>
              </div>
            </div>

            <div className="space-y-3 bg-gray-50 p-4 rounded-lg border border-gray-100">
              <h4 className="font-bold text-gray-900 uppercase text-[11px] border-b pb-1">
                Default Shipping Address
              </h4>
              <div>
                <span className="text-gray-500 block text-[11px]">Street:</span>
                <span className="font-semibold text-gray-800 text-sm">{profileData.street}</span>
              </div>
              <div>
                <span className="text-gray-500 block text-[11px]">City, State & PIN:</span>
                <span className="font-semibold text-gray-800 text-sm">
                  {profileData.city}, {profileData.state} - {profileData.pincode}
                </span>
              </div>
              <div>
                <span className="text-gray-500 block text-[11px]">Country:</span>
                <span className="font-semibold text-gray-800 text-sm">India 🇮🇳</span>
              </div>
            </div>
          </div>
        ) : (
          /* Edit Form */
          <form onSubmit={handleSave} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 font-bold mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  className="w-full border border-gray-300 rounded p-2 focus:ring-1 focus:ring-[#febd69]"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  className="w-full border border-gray-300 rounded p-2 focus:ring-1 focus:ring-[#febd69]"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                  className="w-full border border-gray-300 rounded p-2 focus:ring-1 focus:ring-[#febd69]"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">PIN Code</label>
                <input
                  type="text"
                  value={profileData.pincode}
                  onChange={(e) => setProfileData({ ...profileData, pincode: e.target.value })}
                  className="w-full border border-gray-300 rounded p-2 focus:ring-1 focus:ring-[#febd69]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-gray-700 font-bold mb-1">Street Address</label>
                <input
                  type="text"
                  value={profileData.street}
                  onChange={(e) => setProfileData({ ...profileData, street: e.target.value })}
                  className="w-full border border-gray-300 rounded p-2 focus:ring-1 focus:ring-[#febd69]"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">City</label>
                <input
                  type="text"
                  value={profileData.city}
                  onChange={(e) => setProfileData({ ...profileData, city: e.target.value })}
                  className="w-full border border-gray-300 rounded p-2 focus:ring-1 focus:ring-[#febd69]"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">State</label>
                <input
                  type="text"
                  value={profileData.state}
                  onChange={(e) => setProfileData({ ...profileData, state: e.target.value })}
                  className="w-full border border-gray-300 rounded p-2 focus:ring-1 focus:ring-[#febd69]"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                className="bg-[#ffd814] hover:bg-[#f7ca00] text-gray-900 font-bold px-6 py-2 rounded-full text-xs shadow-xs transition cursor-pointer"
              >
                Save Changes
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold px-5 py-2 rounded-full text-xs transition cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

