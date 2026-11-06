import supabase from '../lib/supabase';
import { mapProduct } from './productService';

export const wishlistService = {
  async getOrCreateWishlistId(userId) {
    let { data: wl } = await supabase
      .from('wishlists')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    if (!wl) {
      const { data: newWl, error } = await supabase
        .from('wishlists')
        .insert({ user_id: userId })
        .select('id')
        .single();
      if (error) throw error;
      wl = newWl;
    }
    return wl.id;
  },

  async resolveProductId(productOrId) {
    const id = typeof productOrId === 'string' ? productOrId : productOrId.id || productOrId._id;
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
      return id;
    }
    const { data: prod } = await supabase
      .from('products')
      .select('id')
      .or(`legacy_id.eq.${id},sku.eq.${id}`)
      .maybeSingle();
    return prod ? prod.id : id;
  },

  async getWishlist() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { products: [] };

    const wishlistId = await this.getOrCreateWishlistId(user.id);

    const { data: items, error } = await supabase
      .from('wishlist_items')
      .select('product_id, product:products(*)')
      .eq('wishlist_id', wishlistId);

    if (error) throw error;

    const products = (items || [])
      .map((it) => (it.product ? mapProduct(it.product) : null))
      .filter(Boolean);

    return { products };
  },

  async toggleWishlist(productId) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Authentication required');

    const wishlistId = await this.getOrCreateWishlistId(user.id);
    const pgProdId = await this.resolveProductId(productId);

    // Check if item exists in wishlist
    const { data: existing } = await supabase
      .from('wishlist_items')
      .select('id')
      .eq('wishlist_id', wishlistId)
      .eq('product_id', pgProdId)
      .maybeSingle();

    let isAdded = false;
    if (existing) {
      await supabase.from('wishlist_items').delete().eq('id', existing.id);
      isAdded = false;
    } else {
      await supabase.from('wishlist_items').insert({
        wishlist_id: wishlistId,
        product_id: pgProdId,
      });
      isAdded = true;
    }

    const { products } = await this.getWishlist();
    return { isAdded, products };
  },

  async addToWishlist(productId) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Authentication required');

    const wishlistId = await this.getOrCreateWishlistId(user.id);
    const pgProdId = await this.resolveProductId(productId);

    await supabase.from('wishlist_items').upsert({
      wishlist_id: wishlistId,
      product_id: pgProdId,
    }, { onConflict: 'wishlist_id,product_id' });

    return await this.getWishlist();
  },

  async removeFromWishlist(productId) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { products: [] };

    const wishlistId = await this.getOrCreateWishlistId(user.id);
    const pgProdId = await this.resolveProductId(productId);

    await supabase
      .from('wishlist_items')
      .delete()
      .eq('wishlist_id', wishlistId)
      .eq('product_id', pgProdId);

    return await this.getWishlist();
  },
};

export default wishlistService;
