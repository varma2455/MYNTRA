import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('myntra_token') || null);
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('myntra_user');
    try {
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  // Sync token and user to localStorage
  const saveAuthSession = (newToken, newUser) => {
    setToken(newToken);
    setUser(newUser);
    if (newToken) {
      localStorage.setItem('myntra_token', newToken);
    } else {
      localStorage.removeItem('myntra_token');
    }
    if (newUser) {
      localStorage.setItem('myntra_user', JSON.stringify(newUser));
    } else {
      localStorage.removeItem('myntra_user');
    }
  };

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('myntra_token');
    localStorage.removeItem('myntra_user');
  }, []);

  // Check and refresh user profile on app load
  useEffect(() => {
    let isMounted = true;

    const verifySession = async () => {
      const savedToken = localStorage.getItem('myntra_token');
      if (!savedToken) {
        if (isMounted) setLoading(false);
        return;
      }

      try {
        const data = await authService.getProfile();
        if (isMounted && data?.user) {
          setUser(data.user);
          localStorage.setItem('myntra_user', JSON.stringify(data.user));
        }
      } catch (err) {
        console.warn('Authentication token verification failed:', err.message);
        if (isMounted) {
          logout();
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    verifySession();

    // Listen for unauthorized events from api interceptor
    const handleUnauthorized = () => {
      logout();
    };
    window.addEventListener('auth:unauthorized', handleUnauthorized);

    return () => {
      isMounted = false;
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, [logout]);

  const login = async (credentials) => {
    const data = await authService.login(credentials);
    if (data.token && data.user) {
      saveAuthSession(data.token, data.user);
    }
    return data;
  };

  const register = async (userData) => {
    const data = await authService.register(userData);
    if (data.token && data.user) {
      saveAuthSession(data.token, data.user);
    }
    return data;
  };

  const updateProfile = async (profileData) => {
    const data = await authService.updateProfile(profileData);
    if (data?.user) {
      setUser(data.user);
      localStorage.setItem('myntra_user', JSON.stringify(data.user));
    }
    return data;
  };

  const addAddress = async (addressData) => {
    const data = await authService.addAddress(addressData);
    if (data?.savedAddresses) {
      setUser((prev) => {
        const updated = { ...prev, savedAddresses: data.savedAddresses };
        localStorage.setItem('myntra_user', JSON.stringify(updated));
        return updated;
      });
    }
    return data;
  };

  const deleteAddress = async (addressId) => {
    const data = await authService.deleteAddress(addressId);
    if (data?.savedAddresses) {
      setUser((prev) => {
        const updated = { ...prev, savedAddresses: data.savedAddresses };
        localStorage.setItem('myntra_user', JSON.stringify(updated));
        return updated;
      });
    }
    return data;
  };

  const setDefaultAddress = async (addressId) => {
    const data = await authService.setDefaultAddress(addressId);
    if (data?.savedAddresses) {
      setUser((prev) => {
        const updated = { ...prev, savedAddresses: data.savedAddresses };
        localStorage.setItem('myntra_user', JSON.stringify(updated));
        return updated;
      });
    }
    return data;
  };

  const role = user?.role || 'guest';
  const isAuthenticated = !!token && !!user;
  const isSuperAdmin = role === 'super_admin' || role === 'admin';
  const isCompanyStaff = role === 'company_staff' || isSuperAdmin;
  const isTransportManager = role === 'transport_manager' || isSuperAdmin;
  const isDeliveryStaff = role === 'delivery_staff' || isSuperAdmin;
  const isCustomer = role === 'customer';

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        loading,
        isAuthenticated,
        role,
        isSuperAdmin,
        isCompanyStaff,
        isTransportManager,
        isDeliveryStaff,
        isCustomer,
        login,
        register,
        logout,
        updateProfile,
        addAddress,
        deleteAddress,
        setDefaultAddress,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
