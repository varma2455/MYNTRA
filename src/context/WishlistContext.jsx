import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { wishlistService } from '../services/wishlistService';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

const WishlistContext = createContext(null);

export const WishlistProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const { success, error, info } = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchWishlist = useCallback(async () => {
    if (!isAuthenticated) {
      setItems([]);
      return;
    }
    try {
      setLoading(true);
      const data = await wishlistService.getWishlist();
      setItems(data?.products || []);
    } catch (err) {
      console.error('Failed to fetch wishlist:', err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const isInWishlist = useCallback(
    (productOrId) => {
      if (!productOrId) return false;
      const targetId = typeof productOrId === 'string' ? productOrId : productOrId._id || productOrId.id;
      return items.some((item) => item._id === targetId || item.id === targetId);
    },
    [items]
  );

  const toggleWishlist = async (product) => {
    if (!isAuthenticated) {
      info('Please log in to add items to your wishlist');
      return { requiresAuth: true };
    }

    const productId = product._id || product.id;
    try {
      const data = await wishlistService.toggleWishlist(productId);
      if (data?.products) {
        setItems(data.products);
        if (data.isAdded) {
          success(`Added "${product.name || 'Item'}" to your wishlist`);
        } else {
          info(`Removed "${product.name || 'Item'}" from wishlist`);
        }
      }
      return data;
    } catch (err) {
      error(err.response?.data?.message || 'Failed to update wishlist');
      throw err;
    }
  };

  const removeFromWishlist = async (productOrId) => {
    if (!isAuthenticated) return;
    const productId = typeof productOrId === 'string' ? productOrId : productOrId._id || productOrId.id;
    try {
      const data = await wishlistService.removeFromWishlist(productId);
      if (data?.products) {
        setItems(data.products);
        success('Item removed from wishlist');
      }
      return data;
    } catch (err) {
      error(err.response?.data?.message || 'Failed to remove from wishlist');
      throw err;
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        items,
        wishlistCount: items.length,
        loading,
        isInWishlist,
        toggleWishlist,
        removeFromWishlist,
        refreshWishlist: fetchWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
