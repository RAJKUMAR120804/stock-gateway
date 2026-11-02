import React from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import OrdersPage from './pages/OrdersPage';
import AdminDashboard from './pages/AdminDashboard';
import { useShop } from './context/ShopContext';

export default function App() {
  const { currentView, notification, user, setCurrentView } = useShop();

  const renderActiveView = () => {
    // Protected views logic
    if ((currentView === 'profile' || currentView === 'orders') && !user) {
      return (
        <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
          <div className="w-16 h-16 bg-amber-100 text-amber-800 rounded-full flex items-center justify-center text-3xl mx-auto">
            🔐
          </div>
          <h2 className="text-xl font-bold text-gray-900">Sign in to view your {currentView}</h2>
          <p className="text-xs text-gray-600">
            Please log in with your customer account to view your MongoDB profile records and order history.
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <button
              onClick={() => setCurrentView('login')}
              className="bg-[#ffd814] hover:bg-[#f7ca00] text-gray-950 font-bold px-6 py-2 rounded-full text-xs shadow-xs cursor-pointer"
            >
              Sign In
            </button>
            <button
              onClick={() => setCurrentView('register')}
              className="bg-white hover:bg-gray-50 border border-gray-300 font-bold px-5 py-2 rounded-full text-xs text-gray-800 cursor-pointer"
            >
              Create Account
            </button>
          </div>
        </div>
      );
    }

    switch (currentView) {
      case 'cart':
        return <CartPage />;
      case 'checkout':
        return <CheckoutPage />;
      case 'login':
        return <LoginPage />;
      case 'register':
        return <RegisterPage />;
      case 'profile':
        return <ProfilePage />;
      case 'orders':
        return <OrdersPage />;
      case 'admin':
        return <AdminDashboard />;
      case 'home':
      default:
        return <HomePage />;
    }
  };

  const isAuthView = currentView === 'login' || currentView === 'register';

  return (
    <div className="min-h-screen bg-[#eaeded] flex flex-col font-sans text-gray-900 selection:bg-[#febd69] selection:text-black relative">
      {/* Global Notification Toast */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 max-w-sm animate-in fade-in slide-in-from-top-4 duration-200">
          <div
            className={`px-4 py-3 rounded-lg shadow-2xl border text-xs font-semibold flex items-center gap-2.5 ${
              notification.type === 'success'
                ? 'bg-emerald-900 text-white border-emerald-700'
                : notification.type === 'error'
                ? 'bg-red-900 text-white border-red-700'
                : 'bg-gray-900 text-white border-gray-700'
            }`}
          >
            <span>
              {notification.type === 'success'
                ? '✓'
                : notification.type === 'error'
                ? '⚠️'
                : 'ℹ️'}
            </span>
            <span className="flex-1">{notification.message}</span>
          </div>
        </div>
      )}

      {/* Header Navigation */}
      {!isAuthView && <Navbar />}

      {/* Dynamic View Body */}
      <main className="flex-1 w-full">
        {renderActiveView()}
      </main>

      {/* Global Amazon Footer */}
      {!isAuthView && <Footer />}
    </div>
  );
}
