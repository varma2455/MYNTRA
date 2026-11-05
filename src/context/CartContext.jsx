import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { cartService } from '../services/cartService';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const { success, error, info } = useToast();
  const [cart, setCart] = useState({ items: [], summary: {} });
  const [loading, setLoading] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCart({ items: [], summary: {} });
      setAppliedCoupon(null);
      return;
    }
    try {
      setLoading(true);
      const data = await cartService.getCart();
      if (data) {
        setCart(data);
      }
    } catch (err) {
      console.error('Failed to fetch cart:', err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = async ({ productId, selectedSize, selectedColor, quantity = 1, productName }) => {
    if (!isAuthenticated) {
      info('Please log in to continue');
      return { requiresAuth: true };
    }

    try {
      setLoading(true);
      const updatedCart = await cartService.addToCart({
        productId,
        selectedSize,
        selectedColor,
        quantity,
      });
      setCart(updatedCart);
      success(updatedCart?.message || (productName ? `Added "${productName}" to your shopping bag!` : 'Product added successfully.'));
      return { success: true, cart: updatedCart };
    } catch (err) {
      const msg = err.response?.data?.message || (!navigator.onLine ? 'Unable to connect to the server' : 'Failed to add item to bag');
      error(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    try {
      setLoading(true);
      const updatedCart = await cartService.updateCartItem(itemId, { quantity });
      setCart(updatedCart);
      return updatedCart;
    } catch (err) {
      const msg = err.response?.data?.message || (!navigator.onLine ? 'Unable to connect to the server' : 'Failed to update item quantity');
      error(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      setLoading(true);
      const updatedCart = await cartService.removeFromCart(itemId);
      setCart(updatedCart);
      success(updatedCart?.message || 'Item removed from shopping bag');
      return updatedCart;
    } catch (err) {
      const msg = err.response?.data?.message || (!navigator.onLine ? 'Unable to connect to the server' : 'Failed to remove item');
      error(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    try {
      setLoading(true);
      await cartService.clearCart();
      setCart({ items: [], summary: {} });
      setAppliedCoupon(null);
    } catch (err) {
      console.error('Failed to clear cart:', err);
    } finally {
      setLoading(false);
    }
  };

  const applyCoupon = async (code) => {
    try {
      setLoading(true);
      const subtotal = cart.summary?.subtotal || 0;
      const res = await cartService.applyCoupon({ code, cartSubtotal: subtotal });
      setAppliedCoupon(res);
      await fetchCart();
      success(res?.message || `Coupon "${res.code}" applied! You saved ₹${res.discountAmount}`);
      return res;
    } catch (err) {
      const msg = err.response?.data?.message || (!navigator.onLine ? 'Unable to connect to the server' : 'Invalid or expired coupon code');
      error(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    info('Coupon removed');
  };

  const totalItems = cart.summary?.totalItems ?? (cart.items || []).reduce((acc, it) => acc + (it.quantity || 1), 0);

  const rawSubtotal = cart.summary?.subtotal ?? 0;
  const rawMrp = cart.summary?.totalMrp ?? cart.summary?.mrpTotal ?? rawSubtotal;
  const rawDiscount = cart.summary?.totalDiscount ?? cart.summary?.productDiscount ?? Math.max(0, rawMrp - rawSubtotal);
  const couponDiscount = appliedCoupon ? appliedCoupon.discountAmount : (cart.summary?.couponDiscount || 0);
  const deliveryCharge = cart.summary?.deliveryCharge ?? (rawSubtotal > 1199 || rawSubtotal === 0 ? 0 : 79);
  const convenienceFee = cart.summary?.convenienceFee ?? (rawSubtotal > 0 ? 20 : 0);
  const totalAmount = Math.max(0, rawSubtotal - couponDiscount + deliveryCharge + convenienceFee);

  const summary = {
    totalItems,
    mrpTotal: rawMrp,
    totalMrp: rawMrp,
    subtotal: rawSubtotal,
    productDiscount: rawDiscount,
    totalDiscount: rawDiscount,
    deliveryCharge,
    convenienceFee,
    couponDiscount,
    couponCode: appliedCoupon ? appliedCoupon.code : null,
    total: totalAmount,
    totalAmount,
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        items: cart.items || [],
        summary,
        cartCount: totalItems,
        totalItems,
        loading,
        appliedCoupon,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        applyCoupon,
        removeCoupon,
        refreshCart: fetchCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
