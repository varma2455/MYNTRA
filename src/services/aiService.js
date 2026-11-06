import supabase from '../lib/supabase';
import { mapProduct } from './productService';

export const aiService = {
  async naturalLanguageSearch(query, limit = 20) {
    try {
      const { data, error } = await supabase.functions.invoke('ai-concierge', {
        body: { action: 'search', query, limit },
      });
      if (!error && data?.products) {
        return {
          ...data,
          products: (data.products || []).map(mapProduct),
        };
      }
    } catch (err) {
      console.warn('Edge Function AI search fallback:', err);
    }

    // Direct PostgreSQL text search fallback
    const rawQuery = (query || '').toLowerCase().trim();
    let detectedGender = null;
    if (/\b(men|man|gents|male|boy)\b/i.test(rawQuery)) detectedGender = 'men';
    else if (/\b(women|woman|ladies|female|girl)\b/i.test(rawQuery)) detectedGender = 'women';
    else if (/\b(kids|kid|child|baby)\b/i.test(rawQuery)) detectedGender = 'kids';

    let maxPrice = null;
    const priceMatch = rawQuery.match(/under\s*(?:rs\.?|inr|₹)?\s*(\d+)/i) || rawQuery.match(/below\s*(\d+)/i);
    if (priceMatch) maxPrice = parseInt(priceMatch[1], 10);

    const words = rawQuery
      .replace(/under\s*\d+/gi, '')
      .replace(/below\s*\d+/gi, '')
      .replace(/\b(for|in|with|of|the|and|show|me|find|buy)\b/gi, '')
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    let dbQuery = supabase.from('products').select('*').eq('is_active', true);
    if (detectedGender) dbQuery = dbQuery.eq('gender', detectedGender);
    if (maxPrice) dbQuery = dbQuery.lte('selling_price', maxPrice);

    if (words.length > 0) {
      const term = words[0];
      dbQuery = dbQuery.or(
        `name.ilike.%${term}%,brand.ilike.%${term}%,category.ilike.%${term}%,description.ilike.%${term}%`
      );
    }

    const { data: prods } = await dbQuery.limit(limit);

    return {
      success: true,
      aiSource: 'postgresql_ai_engine',
      interpretedQuery: { raw: query, detectedGender, maxPrice, keywords: words },
      count: prods?.length || 0,
      products: (prods || []).map(mapProduct),
    };
  },

  async getOutfitRecommendation(productId) {
    try {
      const { data, error } = await supabase.functions.invoke('ai-concierge', {
        body: { action: 'outfit', productId },
      });
      if (!error && data?.outfitBundle) {
        return {
          ...data,
          outfitBundle: (data.outfitBundle || []).map(mapProduct),
        };
      }
    } catch (err) {
      console.warn('Edge Function outfit recommendation fallback:', err);
    }

    // Direct PostgreSQL coordinator fallback
    const { data: baseProduct } = await supabase
      .from('products')
      .select('*')
      .or(`id.eq.${productId},legacy_id.eq.${productId},sku.eq.${productId}`)
      .maybeSingle();

    if (!baseProduct) throw new Error('Base product not found');

    const { data: recommendations } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .neq('category', baseProduct.category)
      .order('rating', { ascending: false })
      .limit(4);

    return {
      success: true,
      aiSource: 'fashion_coordination_engine',
      baseProduct: {
        id: baseProduct.legacy_id || baseProduct.id,
        name: baseProduct.name,
        brand: baseProduct.brand,
        sellingPrice: Number(baseProduct.selling_price),
        image: baseProduct.images?.[0] || '',
      },
      styleTheme: 'Curated Designer Ensemble',
      styleAdvice: `Pair this ${baseProduct.name} with coordinated footwear and statement accessories for an effortless runway silhouette.`,
      outfitBundle: (recommendations || []).map(mapProduct),
      bundleDiscount: 15,
    };
  },

  async chatSupport(message, history = []) {
    try {
      const { data, error } = await supabase.functions.invoke('ai-concierge', {
        body: { action: 'chat', message, history },
      });
      if (!error && data?.reply) {
        return data;
      }
    } catch (err) {
      console.warn('Edge Function chat fallback:', err);
    }

    const clean = (message || '').toLowerCase().trim();
    let reply = 'Hello! I am your Myntra Pro AI Fashion Concierge. How may I assist you with sizing, orders, or styling today?';

    if (/track|order|status/i.test(clean)) {
      reply = "You can track your orders in real time in the 'Orders' section. Each order provides live waypoint scan updates and courier OTP verification.";
    } else if (/return|exchange|refund/i.test(clean)) {
      reply = 'We offer a 14-day doorstep return and exchange guarantee. Couriers will pick up the package from your door, and refunds are processed within 2-4 hours.';
    } else if (/size|fit|chart/i.test(clean)) {
      reply = "Every fashion item features a detailed 'Size Guide' with bust, waist, and length measurements in centimeters and inches to ensure your fit.";
    } else if (/coupon|discount|offer/i.test(clean)) {
      reply = "Use coupon code 'FIRST100' for ₹100 OFF on orders above ₹799, or 'SAVE200' for ₹200 OFF on orders exceeding ₹1499!";
    }

    return {
      success: true,
      aiSource: 'intelligent_concierge_rules',
      reply,
      timestamp: new Date().toISOString(),
    };
  },

  async getPersonalizedRecommendations(params = {}) {
    const limit = params.limit || 8;
    try {
      const { data, error } = await supabase.functions.invoke('ai-concierge', {
        body: { action: 'recommendations', ...params, limit },
      });
      if (!error && data?.products) {
        return {
          ...data,
          products: (data.products || []).map(mapProduct),
        };
      }
    } catch (err) {
      console.warn('Edge Function recommendations fallback:', err);
    }

    let query = supabase.from('products').select('*').eq('is_active', true);
    if (params.category) query = query.eq('category', params.category);
    if (params.gender) query = query.eq('gender', params.gender);

    const { data: prods } = await query
      .order('rating_count', { ascending: false })
      .order('rating', { ascending: false })
      .limit(limit);

    return {
      success: true,
      aiSource: 'collaborative_fashion_filtering',
      products: (prods || []).map(mapProduct),
    };
  },
};

export default aiService;
