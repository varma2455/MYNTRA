import supabase from '../lib/supabase';

export const mapProduct = (p) => {
  if (!p) return null;
  return {
    _id: p.id,
    id: p.legacy_id || p.id,
    legacyId: p.legacy_id,
    sku: p.sku,
    name: p.name,
    brand: p.brand,
    brandRef: p.brand_id,
    category: p.category,
    categoryId: p.category_id,
    categoryName: p.category_name || p.category,
    subCategory: p.sub_category,
    subCategoryName: p.sub_category_name,
    gender: p.gender,
    images: Array.isArray(p.images) ? p.images : [],
    videoUrl: p.video_url || '',
    sellingPrice: Number(p.selling_price),
    originalPrice: Number(p.original_price),
    discountPercentage: Number(p.discount_percentage || 0),
    rating: Number(p.rating || 4.5),
    ratingCount: Number(p.rating_count || 0),
    reviewCount: Number(p.review_count || 0),
    sizes: Array.isArray(p.sizes) ? p.sizes : [],
    colors: Array.isArray(p.colors) ? p.colors : [],
    description: p.description || '',
    details: Array.isArray(p.details) ? p.details : [],
    isNewArrival: !!p.is_new_arrival,
    isTrending: !!p.is_trending,
    isBestseller: !!p.is_bestseller,
    isDealOfTheDay: !!p.is_deal_of_the_day,
    inStock: !!p.in_stock,
    stockQuantity: Number(p.stock_quantity ?? 50),
    stockCount: Number(p.stock_quantity ?? 50),
    isActive: p.is_active !== false,
    searchKeywords: Array.isArray(p.search_keywords) ? p.search_keywords : [],
    deliveryDays: p.delivery_days || 2,
    createdAt: p.created_at,
    updatedAt: p.updated_at,
  };
};

export const mapCategory = (c) => {
  if (!c) return null;
  return {
    _id: c.id,
    id: c.slug || c.id,
    slug: c.slug,
    name: c.name,
    image: c.image,
    bannerImage: c.banner_image || '',
    itemCountText: c.item_count_text || '50+ Styles',
    productCount: c.product_count || 0,
    subCategories: c.sub_categories || [],
    isActive: c.is_active,
    featured: c.featured,
    displayOrder: c.display_order,
  };
};

export const productService = {
  async getProducts(params = {}) {
    let query = supabase.from('products').select('*', { count: 'exact' });

    // Active status filter
    query = query.eq('is_active', true);

    // 1. Category
    if (params.category && params.category !== 'all') {
      query = query.eq('category', params.category.toLowerCase().trim());
    }

    // 2. Subcategory
    if (params.subCategory) {
      query = query.eq('sub_category', params.subCategory.trim());
    }

    // 3. Brand
    if (params.brand) {
      const brands = Array.isArray(params.brand)
        ? params.brand
        : params.brand.split(',').map((b) => b.trim()).filter(Boolean);
      if (brands.length === 1) {
        query = query.ilike('brand', brands[0]);
      } else if (brands.length > 1) {
        query = query.in('brand', brands);
      }
    }

    // 4. Price Bracket
    if (params.minPrice) {
      query = query.gte('selling_price', Number(params.minPrice));
    }
    if (params.maxPrice) {
      query = query.lte('selling_price', Number(params.maxPrice));
    }

    // 5. Discount Filter
    if (params.minDiscount) {
      query = query.gte('discount_percentage', Number(params.minDiscount));
    }

    // 6. Rating Filter
    if (params.minRating) {
      query = query.gte('rating', Number(params.minRating));
    }

    // 7. Sizes (overlap with Postgres array)
    if (params.sizes) {
      const sizeList = Array.isArray(params.sizes)
        ? params.sizes
        : params.sizes.split(',').map((s) => s.trim()).filter(Boolean);
      if (sizeList.length > 0) {
        query = query.overlaps('sizes', sizeList);
      }
    }

    // 8. Colors Filter
    if (params.colors) {
      const colorList = Array.isArray(params.colors)
        ? params.colors
        : params.colors.split(',').map((c) => c.trim()).filter(Boolean);
      if (colorList.length > 0) {
        const colorConditions = colorList.map((c) => `colors.cs.[{"name":"${c}"}]`).join(',');
        query = query.or(colorConditions);
      }
    }

    // 9. Availability Filter
    if (params.availability === 'in_stock') {
      query = query.eq('in_stock', true).gt('stock_quantity', 0);
    }

    // 10. Natural Language / Free Text Search
    if (params.q) {
      const term = params.q.trim();
      query = query.or(
        `name.ilike.%${term}%,brand.ilike.%${term}%,category.ilike.%${term}%,description.ilike.%${term}%`
      );
    }

    // 11. Sorting
    switch (params.sortBy) {
      case 'price_low_high':
        query = query.order('selling_price', { ascending: true });
        break;
      case 'price_high_low':
        query = query.order('selling_price', { ascending: false });
        break;
      case 'rating':
      case 'customer_rating':
        query = query.order('rating', { ascending: false }).order('rating_count', { ascending: false });
        break;
      case 'discount':
      case 'better_discount':
        query = query.order('discount_percentage', { ascending: false });
        break;
      case 'newest':
      case 'whats_new':
        query = query.order('created_at', { ascending: false });
        break;
      case 'popularity':
      default:
        query = query.order('is_trending', { ascending: false }).order('rating_count', { ascending: false });
        break;
    }

    // 12. Pagination
    const page = Math.max(1, parseInt(params.page, 10) || 1);
    const limit = Math.max(1, parseInt(params.limit, 10) || 20);
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    query = query.range(from, to);

    const { data, count, error } = await query;
    if (error) {
      console.error('Error fetching products:', error);
      throw error;
    }

    const totalCount = count || 0;
    const totalPages = Math.ceil(totalCount / limit) || 1;

    return {
      products: (data || []).map(mapProduct),
      totalCount,
      totalPages,
      page,
      limit,
    };
  },

  async getProductById(id) {
    if (!id) return null;

    // Support querying by uuid or legacy_id or sku
    let query = supabase.from('products').select('*');
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
      query = query.eq('id', id);
    } else if (id.startsWith('MYN-')) {
      query = query.eq('sku', id);
    } else {
      query = query.eq('legacy_id', id);
    }

    const { data, error } = await query.maybeSingle();
    if (error || !data) {
      // Fallback: try querying by id directly
      const { data: fallback } = await supabase.from('products').select('*').eq('id', id).maybeSingle();
      if (!fallback) throw new Error('Product not found');
      return mapProduct(fallback);
    }

    return mapProduct(data);
  },

  async getCategories() {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) throw error;
    return (data || []).map(mapCategory);
  },

  async getCategoryById(id) {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .or(`id.eq.${id},slug.eq.${id}`)
      .maybeSingle();

    if (error || !data) throw new Error('Category not found');
    return mapCategory(data);
  },

  async getBrands() {
    const { data, error } = await supabase
      .from('brands')
      .select('*')
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async getHomeFeed() {
    const [
      catsRes,
      dealsRes,
      trendingRes,
      bestsellersRes,
      newArrivalsRes,
      luxeRes,
      popularRes,
      brandsRes,
    ] = await Promise.all([
      supabase.from('categories').select('*').eq('is_active', true).order('display_order', { ascending: true }),
      supabase.from('products').select('*').eq('is_active', true).gte('discount_percentage', 35).order('discount_percentage', { ascending: false }).limit(8),
      supabase.from('products').select('*').eq('is_active', true).eq('is_trending', true).order('rating_count', { ascending: false }).limit(8),
      supabase.from('products').select('*').eq('is_active', true).eq('is_bestseller', true).order('rating', { ascending: false }).limit(8),
      supabase.from('products').select('*').eq('is_active', true).eq('is_new_arrival', true).order('created_at', { ascending: false }).limit(8),
      supabase.from('products').select('*').eq('is_active', true).eq('category', 'premium-luxe').limit(8),
      supabase.from('products').select('*').eq('is_active', true).order('rating_count', { ascending: false }).limit(8),
      supabase.from('brands').select('*').eq('is_active', true).limit(8),
    ]);

    const categories = (catsRes.data || []).map(mapCategory);
    const dealsOfTheDay = (dealsRes.data || []).map(mapProduct);
    const trendingNow = (trendingRes.data || []).map(mapProduct);
    const bestsellers = (bestsellersRes.data || []).map(mapProduct);
    const newArrivals = (newArrivalsRes.data || []).map(mapProduct);
    const premiumCollections = (luxeRes.data || []).map(mapProduct);
    const popularProducts = (popularRes.data || []).map(mapProduct);

    const heroBanners = [
      {
        id: 'banner-1',
        title: 'AUTUMN / WINTER 2026 COUTURE',
        subtitle: 'Unveiling high-fashion outerwear, minimalist silhouettes and runway-ready ensembles.',
        image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1600&auto=format&fit=crop',
        ctaText: 'EXPLORE MEN LUXE',
        link: '/products?category=men',
      },
      {
        id: 'banner-2',
        title: 'CONTEMPORARY ETHNIC & FESTIVE GLAM',
        subtitle: 'Handcrafted zari lehengas, silk kurtas and artisanal jewellery collections.',
        image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=1600&auto=format&fit=crop',
        ctaText: 'SHOP WOMEN ATELIER',
        link: '/products?category=women',
      },
      {
        id: 'banner-3',
        title: 'STREETWEAR & HYPER-SPORT ACTIVE',
        subtitle: 'Engineered performance sneakers, retro varsity bombers and technical fleece.',
        image: 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?q=80&w=1600&auto=format&fit=crop',
        ctaText: 'DISCOVER URBAN STREET',
        link: '/products?category=sports-fitness',
      },
      {
        id: 'banner-4',
        title: 'PREMIUM FOOTWEAR & DESIGNER ATELIER',
        subtitle: 'Italian leather loafers, modern chunky sneakers and iconic chronographs.',
        image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=1600&auto=format&fit=crop',
        ctaText: 'EXPLORE FOOTWEAR',
        link: '/products?category=footwear',
      },
      {
        id: 'banner-5',
        title: 'HAUTE LUXURY & PRESTIGE TIMEPIECES',
        subtitle: 'Exclusive fine gold jewellery, master-crafted chronographs & haute couture.',
        image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=1600&auto=format&fit=crop',
        ctaText: 'EXPLORE LUXE',
        link: '/products?category=premium-luxe',
      },
    ];

    const trendingBrands = (brandsRes.data || []).map((b) => ({
      name: b.name,
      image: b.logo || b.banner || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600',
      discount: b.description || 'Exclusive Collection',
    }));

    return {
      heroBanners,
      categories,
      trendingNow: trendingNow.length ? trendingNow : popularProducts.slice(0, 4),
      newArrivals: newArrivals.length ? newArrivals : popularProducts.slice(2, 6),
      bestsellers: bestsellers.length ? bestsellers : popularProducts.slice(4, 8),
      trendingBrands: trendingBrands.length ? trendingBrands : [
        { name: 'Nike', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600', discount: 'Flat 40% OFF' },
        { name: 'Zara', image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=600', discount: 'Up to 50% OFF' },
        { name: "Levi's", image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=600', discount: 'Min 35% OFF' },
        { name: 'Puma', image: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?q=80&w=600', discount: 'Flat 45% OFF' },
      ],
      recommendedForYou: popularProducts.slice(0, 4),
      premiumCollections: premiumCollections.length ? premiumCollections : popularProducts.slice(0, 4),
      specialOffers: dealsOfTheDay.length ? dealsOfTheDay : popularProducts.slice(0, 4),
      dealsOfTheDay: dealsOfTheDay.length ? dealsOfTheDay : popularProducts.slice(0, 4),
      popularProducts: popularProducts.length ? popularProducts : bestsellers,
    };
  },

  async addReview(productId, reviewData) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Authentication required to submit review');

    // Find PostgreSQL product UUID
    let pgProdId = productId;
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(productId)) {
      const { data: p } = await supabase.from('products').select('id').or(`legacy_id.eq.${productId},sku.eq.${productId}`).maybeSingle();
      if (p) pgProdId = p.id;
    }

    const { data: profile } = await supabase.from('profiles').select('name').eq('id', user.id).maybeSingle();

    const { data, error } = await supabase
      .from('product_reviews')
      .insert({
        product_id: pgProdId,
        user_id: user.id,
        user_name: profile?.name || user.email.split('@')[0],
        rating: reviewData.rating,
        comment: reviewData.comment || '',
        is_verified_buyer: true,
      })
      .select()
      .single();

    if (error) throw error;
    return { success: true, review: data };
  },
};

export default productService;
