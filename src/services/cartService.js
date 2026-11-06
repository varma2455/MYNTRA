import supabase from '../lib/supabase';
import { mapProduct } from './productService';

// Helper to compute summary securely
const calculateCartSummary = (items = []) => {
  let totalItems = 0;
  let mrpTotal = 0;
  let subtotal = 0;

  for (const it of items) {
    const qty = it.quantity || 1;
    totalItems += qty;
    const itemOriginalPrice = Number(it.product?.originalPrice || it.price);
    const itemSellingPrice = Number(it.price);

    mrpTotal += itemOriginalPrice * qty;
    subtotal += itemSellingPrice * qty;
  }

  const productDiscount = Math.max(0, mrpTotal - subtotal);
  const deliveryCharge = subtotal > 1199 || subtotal === 0 ? 0 : 79;
  const convenienceFee = subtotal > 0 ? 20 : 0;
  const totalAmount = subtotal + deliveryCharge + convenienceFee;

  return {
    totalItems,
    mrpTotal,
    totalMrp: mrpTotal,
    subtotal,
    productDiscount,
    totalDiscount: productDiscount,
    deliveryCharge,
    convenienceFee,
    totalAmount,
    total: totalAmount,
  };
};

export const cartService = {
  // Helper to ensure authenticated user has an active cart
  async getOrCreateCartId(userId) {
    let { data: cart } = await supabase
      .from('carts')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    if (!cart) {
      const { data: newCart, error } = await supabase
        .from('carts')
        .insert({ user_id: userId })
        .select('id')
        .single();
      if (error) throw error;
      cart = newCart;
    }
    return cart.id;
  },

  async getCart() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { items: [], summary: calculateCartSummary([]) };
    }

    const cartId = await this.getOrCreateCartId(user.id);

    const { data: rawItems, error } = await supabase
      .from('cart_items')
      .select('*, product:products(*)')
      .eq('cart_id', cartId)
      .order('added_at', { ascending: false });

    if (error) {
      console.error('Error fetching cart items:', error);
      throw error;
    }

    const items = (rawItems || []).map((it) => {
      const productObj = it.product ? mapProduct(it.product) : null;
      return {
        _id: it.id,
        id: it.id,
        product: productObj,
        productId: productObj?.id || it.legacy_product_id || it.product_id,
        name: it.name || productObj?.name || 'Item',
        image: it.image || productObj?.images?.[0] || '',
        selectedSize: it.selected_size,
        selectedColor: it.selected_color || { name: 'Standard', hex: '#000000' },
        quantity: it.quantity,
        price: Number(it.price),
        discount: Number(it.discount || 0),
        finalPrice: Number(it.final_price || it.price),
      };
    });

    const summary = calculateCartSummary(items);
    return { items, summary };
  },

  async addToCart({ productId, selectedSize, selectedColor, quantity = 1 }) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Authentication required');

    // Resolve Product UUID
    let pgProdId = productId;
    let productRow = null;
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(productId)) {
      const { data: p } = await supabase
        .from('products')
        .select('*')
        .or(`legacy_id.eq.${productId},sku.eq.${productId}`)
        .maybeSingle();
      if (p) {
        pgProdId = p.id;
        productRow = p;
      }
    } else {
      const { data: p } = await supabase.from('products').select('*').eq('id', pgProdId).maybeSingle();
      productRow = p;
    }

    if (!productRow) {
      throw new Error('Product not found in catalog');
    }

    // Validate inventory
    const { data: inv } = await supabase
      .from('inventory')
      .select('quantity')
      .eq('product_id', pgProdId)
      .maybeSingle();

    const availableStock = inv?.quantity ?? productRow.stock_quantity ?? 50;
    if (availableStock < quantity) {
      throw new Error(`Insufficient stock. Only ${availableStock} units remaining.`);
    }

    const cartId = await this.getOrCreateCartId(user.id);
    const size = selectedSize || productRow.sizes?.[0] || 'Free Size';
    const color = selectedColor || productRow.colors?.[0] || { name: 'Standard', hex: '#000000' };

    // Check if item already exists in cart with this size
    const { data: existingItem } = await supabase
      .from('cart_items')
      .select('id, quantity')
      .eq('cart_id', cartId)
      .eq('product_id', pgProdId)
      .eq('selected_size', size)
      .maybeSingle();

    if (existingItem) {
      const newQty = existingItem.quantity + quantity;
      if (availableStock < newQty) {
        throw new Error(`Cannot add more than available stock (${availableStock} units).`);
      }
      await supabase
        .from('cart_items')
        .update({ quantity: newQty })
        .eq('id', existingItem.id);
    } else {
      await supabase.from('cart_items').insert({
        cart_id: cartId,
        product_id: pgProdId,
        legacy_product_id: productRow.legacy_id || productId,
        name: productRow.name,
        image: productRow.images?.[0] || '',
        selected_size: size,
        selected_color: color,
        quantity,
        price: productRow.selling_price,
        discount: (productRow.original_price - productRow.selling_price) || 0,
        final_price: productRow.selling_price,
      });
    }

    return await this.getCart();
  },

  async updateCartItem(itemId, { quantity, selectedSize }) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Authentication required');

    if (quantity <= 0) {
      return await this.removeFromCart(itemId);
    }

    const updateData = {};
    if (quantity !== undefined) updateData.quantity = quantity;
    if (selectedSize) updateData.selected_size = selectedSize;

    const { error } = await supabase
      .from('cart_items')
      .update(updateData)
      .eq('id', itemId);

    if (error) throw error;
    return await this.getCart();
  },

  async removeFromCart(itemId) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Authentication required');

    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', itemId);

    if (error) throw error;
    return await this.getCart();
  },

  async clearCart() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { items: [], summary: calculateCartSummary([]) };

    const cartId = await this.getOrCreateCartId(user.id);
    await supabase.from('cart_items').delete().eq('cart_id', cartId);

    return { items: [], summary: calculateCartSummary([]) };
  },

  async applyCoupon({ code, cartSubtotal }) {
    if (!code) throw new Error('Please enter a coupon code');

    const { data: coupon, error } = await supabase
      .from('coupons')
      .select('*')
      .ilike('code', code.trim())
      .eq('is_active', true)
      .maybeSingle();

    if (error || !coupon) {
      const err = new Error(`Coupon "${code}" is invalid or expired.`);
      err.response = { data: { message: err.message } };
      throw err;
    }

    if (cartSubtotal < Number(coupon.minimum_order_value || 0)) {
      const err = new Error(
        `This coupon requires a minimum cart subtotal of ₹${coupon.minimum_order_value}.`
      );
      err.response = { data: { message: err.message } };
      throw err;
    }

    let discountAmount = 0;
    if (coupon.discount_type === 'flat') {
      discountAmount = Number(coupon.discount_value);
    } else if (coupon.discount_type === 'percentage') {
      discountAmount = Math.round((cartSubtotal * Number(coupon.discount_value)) / 100);
    }

    return {
      success: true,
      code: coupon.code,
      discountType: coupon.discount_type,
      discountValue: Number(coupon.discount_value),
      discountAmount,
      description: coupon.description,
      message: `Coupon "${coupon.code}" applied! You saved ₹${discountAmount}.`,
    };
  },

  async getCoupons() {
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('is_active', true)
      .order('discount_value', { ascending: false });

    if (error) throw error;
    return data || [];
  },
};

export default cartService;
