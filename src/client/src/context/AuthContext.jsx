import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedCustomer = authService.getCurrentCustomer();
    if (savedCustomer) {
      setCustomer(savedCustomer);
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const data = await authService.login({ email, password });
    setCustomer(data.customer);
    return data;
  };

  const register = async (customerData) => {
    const data = await authService.register(customerData);
    setCustomer(data.customer);
    return data;
  };

  const logout = () => {
    authService.logout();
    setCustomer(null);
  };

  return (
    <AuthContext.Provider
      value={{
        customer,
        isAuthenticated: !!customer,
        isAdmin: customer?.role === 'admin',
        login,
        register,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

