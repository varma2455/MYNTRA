import supabase from '../lib/supabase';
import { mapProduct, mapCategory } from './productService';

export const adminService = {
  // Super Admin Analytics Dashboard
  async getDashboard() {
    const [ordersCount, totalRevRes, usersCount, productsCount, shipmentsCount] = await Promise.all([
      supabase.from('orders').select('id', { count: 'exact', head: true }),
      supabase.from('orders').select('total').eq('payment_status', 'completed'),
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      supabase.from('products').select('id', { count: 'exact', head: true }),
      supabase.from('shipments').select('id', { count: 'exact', head: true }),
    ]);

    const revenue = (totalRevRes.data || []).reduce((sum, o) => sum + Number(o.total || 0), 0);

    return {
      totalRevenue: revenue,
      totalOrders: ordersCount.count || 0,
      totalUsers: usersCount.count || 0,
      totalProducts: productsCount.count || 0,
      totalShipments: shipmentsCount.count || 0,
      salesOverview: [
        { month: 'Jun', sales: 45000 },
        { month: 'Jul', sales: 62000 },
        { month: 'Aug', sales: 78000 },
        { month: 'Sep', sales: 91000 },
        { month: 'Oct', sales: 125000 },
        { month: 'Nov', sales: Math.max(revenue, 142000) },
      ],
      recentOrders: [],
    };
  },

  async getSalesReport(params = {}) {
    const { data: orders } = await supabase
      .from('orders')
      .select('*')
      .eq('payment_status', 'completed')
      .order('created_at', { ascending: false });

    const totalGross = (orders || []).reduce((acc, o) => acc + Number(o.total || 0), 0);
    return {
      totalGrossSales: totalGross,
      netSales: Math.round(totalGross * 0.92),
      totalDiscounts: (orders || []).reduce((acc, o) => acc + Number(o.coupon_discount || 0), 0),
      completedOrdersCount: (orders || []).length,
      averageOrderValue: (orders || []).length ? Math.round(totalGross / (orders || []).length) : 0,
    };
  },

  // Products
  async getProducts(params = {}) {
    let query = supabase.from('products').select('*', { count: 'exact' });
    if (params.category && params.category !== 'all') {
      query = query.eq('category', params.category);
    }
    if (params.search) {
      query = query.ilike('name', `%${params.search.trim()}%`);
    }

    const page = Math.max(1, parseInt(params.page, 10) || 1);
    const limit = Math.max(1, parseInt(params.limit, 10) || 50);
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, count, error } = await query
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw error;
    return {
      products: (data || []).map(mapProduct),
      totalCount: count || 0,
      totalPages: Math.ceil((count || 0) / limit) || 1,
    };
  },

  async createProduct(productData) {
    const sku = productData.sku || `MYN-${Date.now().toString(36).toUpperCase()}`;
    const legacyId = `prod-${Date.now().toString(36)}`;

    const { data, error } = await supabase
      .from('products')
      .insert({
        legacy_id: legacyId,
        sku,
        name: productData.name,
        brand: productData.brand,
        category: productData.category?.toLowerCase() || 'men',
        category_name: productData.categoryName || productData.category,
        sub_category: productData.subCategory || '',
        sub_category_name: productData.subCategoryName || '',
        gender: productData.gender || 'unisex',
        images: productData.images || ['https://images.unsplash.com/photo-1516826957135-700dedea698c?q=80&w=600'],
        selling_price: Number(productData.sellingPrice),
        original_price: Number(productData.originalPrice || productData.sellingPrice),
        discount_percentage: Number(productData.discountPercentage || 0),
        rating: Number(productData.rating || 4.5),
        sizes: productData.sizes || ['Free Size'],
        colors: productData.colors || [{ name: 'Standard', hex: '#000000' }],
        description: productData.description || productData.name,
        details: productData.details || [],
        is_new_arrival: !!productData.isNewArrival,
        is_trending: !!productData.isTrending,
        is_bestseller: !!productData.isBestseller,
        is_deal_of_the_day: !!productData.isDealOfTheDay,
        in_stock: productData.inStock !== false,
        stock_quantity: Number(productData.stockQuantity || productData.stockCount || 50),
        is_active: productData.isActive !== false,
      })
      .select()
      .single();

    if (error) throw error;

    // Inventory
    await supabase.from('inventory').insert({
      product_id: data.id,
      sku,
      quantity: Number(productData.stockQuantity || 50),
    });

    return mapProduct(data);
  },

  async updateProduct(id, productData) {
    const updatePayload = {};
    if (productData.name !== undefined) updatePayload.name = productData.name;
    if (productData.brand !== undefined) updatePayload.brand = productData.brand;
    if (productData.category !== undefined) updatePayload.category = productData.category.toLowerCase();
    if (productData.sellingPrice !== undefined) updatePayload.selling_price = Number(productData.sellingPrice);
    if (productData.originalPrice !== undefined) updatePayload.original_price = Number(productData.originalPrice);
    if (productData.discountPercentage !== undefined) updatePayload.discount_percentage = Number(productData.discountPercentage);
    if (productData.sizes !== undefined) updatePayload.sizes = productData.sizes;
    if (productData.colors !== undefined) updatePayload.colors = productData.colors;
    if (productData.description !== undefined) updatePayload.description = productData.description;
    if (productData.inStock !== undefined) updatePayload.in_stock = !!productData.inStock;
    if (productData.stockQuantity !== undefined || productData.stockCount !== undefined) {
      const qty = Number(productData.stockQuantity ?? productData.stockCount);
      updatePayload.stock_quantity = qty;
    }
    if (productData.isTrending !== undefined) updatePayload.is_trending = !!productData.isTrending;
    if (productData.isBestseller !== undefined) updatePayload.is_bestseller = !!productData.isBestseller;
    if (productData.isNewArrival !== undefined) updatePayload.is_new_arrival = !!productData.isNewArrival;
    if (productData.isDealOfTheDay !== undefined) updatePayload.is_deal_of_the_day = !!productData.isDealOfTheDay;
    if (productData.images !== undefined) updatePayload.images = productData.images;

    // Find record by id or legacy_id
    let targetId = id;
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
      const { data: p } = await supabase.from('products').select('id').eq('legacy_id', id).maybeSingle();
      if (p) targetId = p.id;
    }

    const { data, error } = await supabase
      .from('products')
      .update(updatePayload)
      .eq('id', targetId)
      .select()
      .single();

    if (error) throw error;

    // If stock updated, update inventory
    if (updatePayload.stock_quantity !== undefined) {
      await supabase
        .from('inventory')
        .update({ quantity: updatePayload.stock_quantity })
        .eq('product_id', targetId);
    }

    return mapProduct(data);
  },

  async deleteProduct(id) {
    let targetId = id;
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
      const { data: p } = await supabase.from('products').select('id').eq('legacy_id', id).maybeSingle();
      if (p) targetId = p.id;
    }

    const { error } = await supabase.from('products').delete().eq('id', targetId);
    if (error) throw error;
    return { success: true };
  },

  // Categories
  async getCategories() {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('display_order', { ascending: true });
    if (error) throw error;
    return (data || []).map(mapCategory);
  },

  async createCategory(formData) {
    const slug = formData.slug || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const { data, error } = await supabase
      .from('categories')
      .insert({
        slug,
        name: formData.name,
        image: formData.image || 'https://images.unsplash.com/photo-1516826957135-700dedea698c?q=80&w=600',
        banner_image: formData.bannerImage || '',
        item_count_text: formData.itemCountText || '50+ Styles',
        sub_categories: formData.subCategories || [],
        display_order: formData.displayOrder || 1,
      })
      .select()
      .single();
    if (error) throw error;
    return mapCategory(data);
  },

  async updateCategory(id, formData) {
    const updatePayload = {};
    if (formData.name) updatePayload.name = formData.name;
    if (formData.image) updatePayload.image = formData.image;
    if (formData.bannerImage) updatePayload.banner_image = formData.bannerImage;
    if (formData.itemCountText) updatePayload.item_count_text = formData.itemCountText;
    if (formData.subCategories) updatePayload.sub_categories = formData.subCategories;
    if (formData.displayOrder !== undefined) updatePayload.display_order = formData.displayOrder;

    const { data, error } = await supabase
      .from('categories')
      .update(updatePayload)
      .or(`id.eq.${id},slug.eq.${id}`)
      .select()
      .single();
    if (error) throw error;
    return mapCategory(data);
  },

  async deleteCategory(id) {
    const { error } = await supabase.from('categories').delete().or(`id.eq.${id},slug.eq.${id}`);
    if (error) throw error;
    return { success: true };
  },

  // Orders
  async getOrders(params = {}) {
    let query = supabase.from('orders').select('*, order_items(*), profiles(name, email)', { count: 'exact' });
    if (params.status && params.status !== 'All') {
      query = query.eq('status', params.status);
    }
    const limit = params.limit || 50;
    const { data, count, error } = await query.order('created_at', { ascending: false }).limit(limit);
    if (error) throw error;

    return {
      orders: (data || []).map((o) => ({
        _id: o.id,
        id: o.order_id || o.id,
        orderId: o.order_id,
        status: o.status,
        total: Number(o.total),
        paymentMethod: o.payment_method,
        paymentStatus: o.payment_status,
        shippingAddress: o.shipping_address,
        user: { name: o.profiles?.name || 'Customer', email: o.profiles?.email || '' },
        items: o.order_items || [],
        createdAt: o.created_at,
      })),
      totalCount: count || 0,
    };
  },

  async updateOrderStatus(orderId, status) {
    let targetId = orderId;
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(orderId)) {
      const { data: o } = await supabase.from('orders').select('id').eq('order_id', orderId).maybeSingle();
      if (o) targetId = o.id;
    }

    const { data, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', targetId)
      .select()
      .single();
    if (error) throw error;

    // Sync shipment status if relevant
    if (['Dispatched', 'Out for Delivery', 'Delivered'].includes(status)) {
      await supabase.from('shipments').update({ status }).eq('order_id', targetId);
    }

    return data;
  },

  // Users
  async getUsers(params = {}) {
    let query = supabase.from('profiles').select('*, user_roles(role)');
    if (params.search) {
      query = query.or(`name.ilike.%${params.search}%,email.ilike.%${params.search}%`);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;

    return {
      users: (data || []).map((u) => {
        const roles = (u.user_roles || []).map((r) => r.role);
        return {
          _id: u.id,
          id: u.id,
          name: u.name,
          email: u.email,
          phone: u.phone,
          status: u.status || 'active',
          role: roles.includes('ADMIN') || roles.includes('super_admin') ? 'super_admin' : (roles[0] || 'customer'),
          roles,
          createdAt: u.created_at,
        };
      }),
    };
  },

  async blockUser(id, reason = 'Flagged by administration') {
    const { data, error } = await supabase
      .from('profiles')
      .update({ status: 'blocked', block_reason: reason })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async unblockUser(id) {
    const { data, error } = await supabase
      .from('profiles')
      .update({ status: 'active', block_reason: '' })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // Staff (Delivery & Logistics staff)
  async getStaff() {
    const { data, error } = await supabase
      .from('profiles')
      .select('*, user_roles(role)')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Return non-customer staff
    const staff = (data || [])
      .map((u) => {
        const roles = (u.user_roles || []).map((r) => r.role);
        let primaryRole = 'customer';
        if (roles.includes('ADMIN') || roles.includes('super_admin')) primaryRole = 'super_admin';
        else if (roles.includes('transport_manager')) primaryRole = 'transport_manager';
        else if (roles.includes('company_staff')) primaryRole = 'company_staff';
        else if (roles.includes('DELIVERY_PARTNER') || roles.includes('delivery_staff')) primaryRole = 'delivery_staff';
        else if (roles.includes('LOGISTICS_PARTNER')) primaryRole = 'company_staff';

        return {
          _id: u.id,
          id: u.id,
          name: u.name,
          email: u.email,
          phone: u.phone,
          role: primaryRole,
          status: u.status || 'active',
          assignedVehicle: u.assigned_vehicle || '',
        };
      })
      .filter((u) => u.role !== 'customer');

    return staff;
  },

  async createStaff(formData) {
    // In Supabase, create user via client sign-up or admin API
    const { email, password, name, phone, role } = formData;
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password: password || 'StaffPass123',
      options: {
        data: {
          name: name.trim(),
          phone: phone || '',
          role: role || 'DELIVERY_PARTNER',
        },
      },
    });

    if (error) throw error;
    return { success: true, user: data.user };
  },

  async updateStaffStatus(id, status) {
    const { data, error } = await supabase
      .from('profiles')
      .update({ status })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateStaffRole(id, newRole) {
    await supabase.from('user_roles').delete().eq('user_id', id);
    await supabase.from('user_roles').insert([
      { user_id: id, role: newRole },
    ]);
    return { success: true };
  },

  // Shipments
  async getShipments(params = {}) {
    let query = supabase.from('shipments').select('*, orders(*)');
    if (params.status && params.status !== 'All') {
      query = query.eq('status', params.status);
    }
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;

    return {
      shipments: (data || []).map((s) => ({
        _id: s.id,
        shipmentId: s.shipment_id,
        orderId: s.order_code,
        status: s.status,
        recipient: s.recipient,
        deliveryStaff: s.delivery_staff_id,
        transportManager: s.transport_manager_id,
        createdAt: s.created_at,
      })),
    };
  },

  async assignShipmentStaff(shipmentId, deliveryStaffId, transportManagerId) {
    let targetId = shipmentId;
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(shipmentId)) {
      const { data: s } = await supabase.from('shipments').select('id').eq('shipment_id', shipmentId).maybeSingle();
      if (s) targetId = s.id;
    }

    const { data, error } = await supabase
      .from('shipments')
      .update({
        delivery_staff_id: deliveryStaffId || null,
        transport_manager_id: transportManagerId || null,
        status: 'Assigned to Partner',
      })
      .eq('id', targetId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Audit Logs
  async getAuditLogs() {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;
    return {
      logs: (data || []).map((l) => ({
        _id: l.id,
        actingUserName: l.acting_user_name,
        actingUserRole: l.acting_user_role,
        action: l.action,
        details: l.details,
        reason: l.reason,
        createdAt: l.created_at,
      })),
    };
  },
};

export default adminService;
