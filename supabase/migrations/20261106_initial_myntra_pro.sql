-- ==============================================================================
-- MYNTRA PRO ENTERPRISE POSTGRESQL SCHEMA & ROW LEVEL SECURITY MIGRATION
-- Project: betvgxsoanhhfcwvrppn
-- Database: PostgreSQL 17
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. UTILITY FUNCTIONS & UPDATED_AT TRIGGER
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ------------------------------------------------------------------------------
-- 2. USER TABLES
-- ------------------------------------------------------------------------------

-- 2.1 profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  phone TEXT DEFAULT '',
  avatar_url TEXT DEFAULT '',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'blocked', 'suspended')),
  block_reason TEXT DEFAULT '',
  assigned_vehicle TEXT DEFAULT '',
  preferred_categories TEXT[] DEFAULT '{}',
  fcm_token TEXT DEFAULT '',
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 2.2 user_roles
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT uq_user_roles UNIQUE (user_id, role)
);

CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);

-- Helper security functions
CREATE OR REPLACE FUNCTION public.get_auth_role()
RETURNS TEXT LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT role FROM public.user_roles WHERE user_id = auth.uid() LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
      AND UPPER(role) IN ('ADMIN', 'SUPER_ADMIN')
  );
$$;

CREATE OR REPLACE FUNCTION public.is_delivery_partner()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
      AND UPPER(role) IN ('DELIVERY_PARTNER', 'DELIVERY_STAFF', 'ADMIN', 'SUPER_ADMIN')
  );
$$;

CREATE OR REPLACE FUNCTION public.is_logistics_partner()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
      AND UPPER(role) IN ('LOGISTICS_PARTNER', 'COMPANY_STAFF', 'TRANSPORT_MANAGER', 'ADMIN', 'SUPER_ADMIN')
  );
$$;

-- 2.3 user_addresses
CREATE TABLE IF NOT EXISTS public.user_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  mobile TEXT NOT NULL,
  pincode TEXT NOT NULL,
  street TEXT NOT NULL,
  locality TEXT DEFAULT '',
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  is_default BOOLEAN DEFAULT false,
  type TEXT DEFAULT 'HOME' CHECK (type IN ('HOME', 'WORK', 'OTHER')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_addresses_user ON public.user_addresses(user_id);

CREATE TRIGGER set_user_addresses_updated_at
  BEFORE UPDATE ON public.user_addresses
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ------------------------------------------------------------------------------
-- 3. PRODUCT & CATALOG TABLES
-- ------------------------------------------------------------------------------

-- 3.1 categories
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  image TEXT NOT NULL,
  banner_image TEXT DEFAULT '',
  item_count_text TEXT DEFAULT '50+ Styles',
  product_count INTEGER DEFAULT 0,
  sub_categories JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  featured BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_active ON public.categories(is_active, display_order);

CREATE TRIGGER set_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 3.2 brands
CREATE TABLE IF NOT EXISTS public.brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  logo TEXT DEFAULT '',
  banner TEXT DEFAULT '',
  description TEXT DEFAULT '',
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_brands_slug ON public.brands(slug);
CREATE INDEX IF NOT EXISTS idx_brands_active ON public.brands(is_active);

CREATE TRIGGER set_brands_updated_at
  BEFORE UPDATE ON public.brands
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 3.3 products
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  legacy_id TEXT UNIQUE,
  sku TEXT UNIQUE,
  name TEXT NOT NULL,
  brand TEXT NOT NULL,
  brand_id UUID REFERENCES public.brands(id) ON DELETE SET NULL,
  category TEXT NOT NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  category_name TEXT DEFAULT '',
  sub_category TEXT DEFAULT '',
  sub_category_name TEXT DEFAULT '',
  gender TEXT DEFAULT 'unisex',
  images TEXT[] NOT NULL DEFAULT '{}',
  video_url TEXT DEFAULT '',
  selling_price NUMERIC(10, 2) NOT NULL CHECK (selling_price >= 0),
  original_price NUMERIC(10, 2) NOT NULL CHECK (original_price >= 0),
  discount_percentage NUMERIC(5, 2) DEFAULT 0,
  rating NUMERIC(3, 2) DEFAULT 4.5 CHECK (rating >= 1 AND rating <= 5),
  rating_count INTEGER DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  sizes TEXT[] NOT NULL DEFAULT '{}',
  colors JSONB NOT NULL DEFAULT '[]'::jsonb,
  description TEXT NOT NULL,
  details JSONB DEFAULT '[]'::jsonb,
  is_new_arrival BOOLEAN DEFAULT false,
  is_trending BOOLEAN DEFAULT false,
  is_bestseller BOOLEAN DEFAULT false,
  is_deal_of_the_day BOOLEAN DEFAULT false,
  in_stock BOOLEAN DEFAULT true,
  stock_quantity INTEGER DEFAULT 50 CHECK (stock_quantity >= 0),
  is_active BOOLEAN DEFAULT true,
  search_keywords TEXT[] DEFAULT '{}',
  delivery_days INTEGER DEFAULT 2,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category, is_active);
CREATE INDEX IF NOT EXISTS idx_products_brand ON public.products(brand, is_active);
CREATE INDEX IF NOT EXISTS idx_products_price ON public.products(selling_price);
CREATE INDEX IF NOT EXISTS idx_products_discount ON public.products(discount_percentage);
CREATE INDEX IF NOT EXISTS idx_products_rating ON public.products(rating);
CREATE INDEX IF NOT EXISTS idx_products_instock ON public.products(in_stock);
CREATE INDEX IF NOT EXISTS idx_products_created ON public.products(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_sizes ON public.products USING GIN (sizes);
CREATE INDEX IF NOT EXISTS idx_products_colors ON public.products USING GIN (colors);
CREATE INDEX IF NOT EXISTS idx_products_search ON public.products USING GIN (to_tsvector('english', name || ' ' || brand || ' ' || description || ' ' || category));

CREATE TRIGGER set_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 3.4 product_images
CREATE TABLE IF NOT EXISTS public.product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_product_images_prod ON public.product_images(product_id);

-- 3.5 product_variants
CREATE TABLE IF NOT EXISTS public.product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  size TEXT NOT NULL,
  color_name TEXT NOT NULL,
  color_hex TEXT NOT NULL,
  sku TEXT,
  stock INTEGER DEFAULT 10 CHECK (stock >= 0),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_product_variants_prod ON public.product_variants(product_id);

-- 3.6 product_reviews
CREATE TABLE IF NOT EXISTS public.product_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  rating NUMERIC(2, 1) NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT DEFAULT '',
  is_verified_buyer BOOLEAN DEFAULT true,
  images TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_product_reviews_prod ON public.product_reviews(product_id, created_at DESC);

CREATE TRIGGER set_product_reviews_updated_at
  BEFORE UPDATE ON public.product_reviews
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 3.7 inventory
CREATE TABLE IF NOT EXISTS public.inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  sku TEXT NOT NULL,
  warehouse_location TEXT DEFAULT 'Warehouse BNG-01 (Electronic City)',
  quantity INTEGER NOT NULL DEFAULT 50 CHECK (quantity >= 0),
  reserved_quantity INTEGER NOT NULL DEFAULT 0 CHECK (reserved_quantity >= 0),
  low_stock_threshold INTEGER DEFAULT 5,
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT uq_inventory_sku UNIQUE (sku)
);

CREATE INDEX IF NOT EXISTS idx_inventory_prod ON public.inventory(product_id);

CREATE TRIGGER set_inventory_updated_at
  BEFORE UPDATE ON public.inventory
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ------------------------------------------------------------------------------
-- 4. SHOPPING & CART TABLES
-- ------------------------------------------------------------------------------

-- 4.1 carts
CREATE TABLE IF NOT EXISTS public.carts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_carts_user ON public.carts(user_id);

CREATE TRIGGER set_carts_updated_at
  BEFORE UPDATE ON public.carts
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 4.2 cart_items
CREATE TABLE IF NOT EXISTS public.cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id UUID NOT NULL REFERENCES public.carts(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  legacy_product_id TEXT,
  name TEXT NOT NULL,
  image TEXT DEFAULT '',
  selected_size TEXT NOT NULL,
  selected_color JSONB DEFAULT '{"name": "Standard", "hex": "#000000"}'::jsonb,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity >= 1),
  price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  discount NUMERIC(10, 2) DEFAULT 0,
  final_price NUMERIC(10, 2) NOT NULL CHECK (final_price >= 0),
  added_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT uq_cart_item UNIQUE (cart_id, product_id, selected_size)
);

CREATE INDEX IF NOT EXISTS idx_cart_items_cart ON public.cart_items(cart_id);

-- 4.3 wishlists
CREATE TABLE IF NOT EXISTS public.wishlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_wishlists_user ON public.wishlists(user_id);

CREATE TRIGGER set_wishlists_updated_at
  BEFORE UPDATE ON public.wishlists
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 4.4 wishlist_items
CREATE TABLE IF NOT EXISTS public.wishlist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wishlist_id UUID NOT NULL REFERENCES public.wishlists(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT uq_wishlist_item UNIQUE (wishlist_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_wishlist_items_wl ON public.wishlist_items(wishlist_id);

-- 4.5 recently_viewed
CREATE TABLE IF NOT EXISTS public.recently_viewed (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  viewed_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT uq_recently_viewed UNIQUE (user_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_recently_viewed_user ON public.recently_viewed(user_id, viewed_at DESC);

-- ------------------------------------------------------------------------------
-- 5. ORDERS & FULFILLMENT TABLES
-- ------------------------------------------------------------------------------

-- 5.1 orders
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id TEXT NOT NULL UNIQUE,
  idempotency_key TEXT UNIQUE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  subtotal NUMERIC(10, 2) NOT NULL,
  discount NUMERIC(10, 2) DEFAULT 0,
  coupon_code TEXT DEFAULT '',
  coupon_discount NUMERIC(10, 2) DEFAULT 0,
  delivery_charge NUMERIC(10, 2) DEFAULT 0,
  convenience_fee NUMERIC(10, 2) DEFAULT 0,
  total NUMERIC(10, 2) NOT NULL,
  shipping_address JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'Placed' CHECK (
    status IN (
      'Placed', 'Confirmed', 'Processing', 'Packed',
      'Ready for Dispatch', 'Dispatched', 'In Transit',
      'Out for Delivery', 'Delivered', 'Cancelled',
      'Return Requested', 'Returned', 'Refunded'
    )
  ),
  status_history JSONB DEFAULT '[]'::jsonb,
  payment_method TEXT DEFAULT 'UPI',
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
  payment_details JSONB DEFAULT '{}'::jsonb,
  delivery_otp TEXT DEFAULT '1234',
  is_otp_verified BOOLEAN DEFAULT false,
  tracking_number TEXT,
  estimated_delivery_date TEXT DEFAULT '',
  cancellation_reason TEXT DEFAULT '',
  return_reason TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_orders_user ON public.orders(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_order_id ON public.orders(order_id);

CREATE TRIGGER set_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 5.2 order_items
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  legacy_product_id TEXT,
  product_name TEXT NOT NULL,
  brand TEXT NOT NULL,
  image TEXT NOT NULL,
  size TEXT NOT NULL,
  color TEXT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity >= 1),
  price NUMERIC(10, 2) NOT NULL,
  original_price NUMERIC(10, 2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_order_items_order ON public.order_items(order_id);

-- 5.3 payments
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id TEXT NOT NULL UNIQUE,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE RESTRICT,
  order_code TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  amount NUMERIC(10, 2) NOT NULL,
  currency TEXT DEFAULT 'INR',
  payment_method TEXT DEFAULT 'UPI',
  gateway TEXT DEFAULT 'Razorpay',
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  razorpay_signature TEXT,
  status TEXT DEFAULT 'captured' CHECK (status IN ('pending', 'authorized', 'captured', 'failed', 'refunded')),
  refund_details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_payments_order ON public.payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_user ON public.payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_razorpay ON public.payments(razorpay_order_id);

CREATE TRIGGER set_payments_updated_at
  BEFORE UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 5.4 shipments
CREATE TABLE IF NOT EXISTS public.shipments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id TEXT NOT NULL UNIQUE,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE RESTRICT,
  order_code TEXT NOT NULL,
  transport_manager_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  delivery_staff_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'Created' CHECK (
    status IN (
      'Created', 'Pending Assignment', 'Assigned to Partner',
      'Pickup Scheduled', 'Awaiting Pickup', 'Picked Up',
      'In Transit', 'At Delivery Facility', 'Out for Delivery',
      'Delivered', 'Delivery Failed', 'Returned to Origin', 'Returned'
    )
  ),
  package_details JSONB DEFAULT '{"weightKg": 0.5, "packageCount": 1, "warehouse": "Warehouse BNG-01 (Electronic City)", "priority": "Standard", "serviceLevel": "Road Surface Express"}'::jsonb,
  dispatched_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  dispatch_notes TEXT DEFAULT '',
  tracking_events JSONB DEFAULT '[]'::jsonb,
  recipient JSONB NOT NULL,
  origin_hub JSONB DEFAULT '{"facility": "Bengaluru Central Fulfillment Hub", "city": "Bengaluru", "state": "Karnataka"}'::jsonb,
  destination_hub JSONB DEFAULT '{}'::jsonb,
  vehicle_info JSONB DEFAULT '{"vehicleType": "Van", "vehicleNumber": "KA-01-EQ-9874"}'::jsonb,
  estimated_delivery_date TEXT DEFAULT '',
  delivery_otp TEXT DEFAULT '',
  is_otp_verified BOOLEAN DEFAULT false,
  pickup_timestamp TIMESTAMPTZ,
  delivery_timestamp TIMESTAMPTZ,
  delivery_notes TEXT DEFAULT '',
  failure_reason TEXT DEFAULT '',
  proof_of_delivery JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_shipments_order ON public.shipments(order_id);
CREATE INDEX IF NOT EXISTS idx_shipments_status ON public.shipments(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_shipments_staff ON public.shipments(delivery_staff_id, status);
CREATE INDEX IF NOT EXISTS idx_shipments_manager ON public.shipments(transport_manager_id, status);

CREATE TRIGGER set_shipments_updated_at
  BEFORE UPDATE ON public.shipments
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 5.5 returns
CREATE TABLE IF NOT EXISTS public.returns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  comment TEXT DEFAULT '',
  status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected', 'Inspected', 'Completed')),
  inspection_notes TEXT DEFAULT '',
  refund_amount NUMERIC(10, 2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_returns_order ON public.returns(order_id);
CREATE INDEX IF NOT EXISTS idx_returns_user ON public.returns(user_id);

CREATE TRIGGER set_returns_updated_at
  BEFORE UPDATE ON public.returns
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 5.6 refunds
CREATE TABLE IF NOT EXISTS public.refunds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  payment_id UUID REFERENCES public.payments(id) ON DELETE SET NULL,
  amount NUMERIC(10, 2) NOT NULL,
  currency TEXT DEFAULT 'INR',
  status TEXT DEFAULT 'processed' CHECK (status IN ('initiated', 'processed', 'failed')),
  gateway_refund_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_refunds_order ON public.refunds(order_id);

-- ------------------------------------------------------------------------------
-- 6. BUSINESS TABLES
-- ------------------------------------------------------------------------------

-- 6.1 coupons
CREATE TABLE IF NOT EXISTS public.coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('flat', 'percentage')),
  discount_value NUMERIC(10, 2) NOT NULL,
  minimum_order_value NUMERIC(10, 2) DEFAULT 0,
  description TEXT NOT NULL,
  expiry_text TEXT DEFAULT '',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_coupons_code ON public.coupons(code);

CREATE TRIGGER set_coupons_updated_at
  BEFORE UPDATE ON public.coupons
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 6.2 coupon_usage
CREATE TABLE IF NOT EXISTS public.coupon_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id UUID NOT NULL REFERENCES public.coupons(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  used_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_coupon_usage_user ON public.coupon_usage(user_id, coupon_id);

-- 6.3 notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  recipient_role TEXT DEFAULT 'CUSTOMER',
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'INFO',
  read BOOLEAN DEFAULT false,
  link TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id, read);
CREATE INDEX IF NOT EXISTS idx_notifications_role ON public.notifications(recipient_role, created_at DESC);

-- 6.4 delivery_partners
CREATE TABLE IF NOT EXISTS public.delivery_partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  status TEXT DEFAULT 'Available' CHECK (status IN ('Available', 'On Delivery', 'Off Duty', 'Suspended')),
  assigned_hub TEXT DEFAULT 'Bengaluru South Hub',
  vehicle_type TEXT DEFAULT 'Bike',
  vehicle_number TEXT DEFAULT 'KA-05-MN-2026',
  current_location JSONB DEFAULT '{}'::jsonb,
  total_deliveries INTEGER DEFAULT 0,
  successful_deliveries INTEGER DEFAULT 0,
  rating NUMERIC(3, 2) DEFAULT 4.8,
  total_earnings NUMERIC(10, 2) DEFAULT 0,
  todays_earnings NUMERIC(10, 2) DEFAULT 0,
  active_orders_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_delivery_partners_user ON public.delivery_partners(user_id);
CREATE INDEX IF NOT EXISTS idx_delivery_partners_status ON public.delivery_partners(status);

CREATE TRIGGER set_delivery_partners_updated_at
  BEFORE UPDATE ON public.delivery_partners
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 6.5 logistics_partners
CREATE TABLE IF NOT EXISTS public.logistics_partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT NOT NULL UNIQUE,
  contact_person TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT NOT NULL,
  manager_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  fleet_size INTEGER DEFAULT 15,
  serviceable_pincodes TEXT[] DEFAULT '{}',
  active_shipments_count INTEGER DEFAULT 0,
  total_shipments_handled INTEGER DEFAULT 0,
  on_time_delivery_rate NUMERIC(5, 2) DEFAULT 98.5,
  rating NUMERIC(3, 2) DEFAULT 4.9,
  contract_status TEXT DEFAULT 'Active' CHECK (contract_status IN ('Active', 'Pending Renewal', 'Terminated')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_logistics_partners_name ON public.logistics_partners(company_name);

CREATE TRIGGER set_logistics_partners_updated_at
  BEFORE UPDATE ON public.logistics_partners
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 6.6 dispatch_assignments
CREATE TABLE IF NOT EXISTS public.dispatch_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id UUID NOT NULL REFERENCES public.shipments(id) ON DELETE CASCADE,
  partner_id UUID REFERENCES public.logistics_partners(id) ON DELETE SET NULL,
  delivery_partner_id UUID REFERENCES public.delivery_partners(id) ON DELETE SET NULL,
  assigned_at TIMESTAMPTZ DEFAULT now(),
  status TEXT DEFAULT 'ASSIGNED',
  notes TEXT DEFAULT ''
);

CREATE INDEX IF NOT EXISTS idx_dispatch_assignments_shipment ON public.dispatch_assignments(shipment_id);

-- 6.7 transactions
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id TEXT NOT NULL UNIQUE,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  amount NUMERIC(10, 2) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('PAYMENT', 'REFUND', 'PAYOUT')),
  status TEXT NOT NULL DEFAULT 'SUCCESS',
  payment_gateway TEXT DEFAULT 'Razorpay',
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_transactions_order ON public.transactions(order_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user ON public.transactions(user_id);

-- 6.8 audit_logs
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  acting_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  acting_user_name TEXT NOT NULL,
  acting_user_role TEXT NOT NULL,
  action TEXT NOT NULL,
  target_record JSONB DEFAULT '{}'::jsonb,
  details JSONB DEFAULT '{}'::jsonb,
  reason TEXT DEFAULT '',
  ip_address TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_acting ON public.audit_logs(acting_user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action);

-- ------------------------------------------------------------------------------
-- 7. SUPABASE AUTH TRIGGER (AUTO-INITIALIZE PROFILE & ROLES)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_role TEXT;
  v_name TEXT;
  v_avatar TEXT;
  v_phone TEXT;
BEGIN
  -- Determine name
  v_name := COALESCE(
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'full_name',
    split_part(NEW.email, '@', 1)
  );

  -- Determine avatar & phone
  v_avatar := COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture', '');
  v_phone := COALESCE(NEW.raw_user_meta_data->>'phone', '');

  -- Secure role assignment: NEVER allow user-controlled admin elevation
  v_role := UPPER(COALESCE(NEW.raw_user_meta_data->>'role', 'CUSTOMER'));
  IF v_role NOT IN ('DELIVERY_PARTNER', 'DELIVERY_STAFF', 'LOGISTICS_PARTNER', 'COMPANY_STAFF', 'TRANSPORT_MANAGER') THEN
    v_role := 'CUSTOMER';
  END IF;

  -- Insert profile
  INSERT INTO public.profiles (
    id, email, name, phone, avatar_url, created_at, updated_at
  ) VALUES (
    NEW.id,
    NEW.email,
    v_name,
    v_phone,
    v_avatar,
    now(),
    now()
  ) ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = COALESCE(NULLIF(EXCLUDED.name, ''), profiles.name),
    avatar_url = COALESCE(NULLIF(EXCLUDED.avatar_url, ''), profiles.avatar_url),
    updated_at = now();

  -- Insert user role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, v_role)
  ON CONFLICT (user_id, role) DO NOTHING;

  -- Auto-create Cart and Wishlist
  INSERT INTO public.carts (user_id) VALUES (NEW.id) ON CONFLICT (user_id) DO NOTHING;
  INSERT INTO public.wishlists (user_id) VALUES (NEW.id) ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

-- ------------------------------------------------------------------------------
-- 8. ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------

-- Enable RLS on all 29 tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recently_viewed ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.returns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.refunds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupon_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logistics_partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dispatch_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- 8.1 Profiles Policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins full manage profiles"
  ON public.profiles FOR ALL
  USING (public.is_admin());

-- 8.2 User Roles Policies
CREATE POLICY "Users can read own role"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Only admins manage roles"
  ON public.user_roles FOR ALL
  USING (public.is_admin());

-- 8.3 Addresses Policies
CREATE POLICY "Users view own addresses"
  ON public.user_addresses FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users insert own addresses"
  ON public.user_addresses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own addresses"
  ON public.user_addresses FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete own addresses"
  ON public.user_addresses FOR DELETE
  USING (auth.uid() = user_id);

-- 8.4 Categories & Brands (Publicly viewable, Admin manageable)
CREATE POLICY "Categories are viewable by everyone"
  ON public.categories FOR SELECT USING (true);
CREATE POLICY "Only admins manage categories"
  ON public.categories FOR ALL USING (public.is_admin());

CREATE POLICY "Brands are viewable by everyone"
  ON public.brands FOR SELECT USING (true);
CREATE POLICY "Only admins manage brands"
  ON public.brands FOR ALL USING (public.is_admin());

-- 8.5 Products, Variants, Images (Publicly viewable, Admin manageable)
CREATE POLICY "Active products are viewable by everyone"
  ON public.products FOR SELECT
  USING (is_active = true OR public.is_admin() OR public.is_logistics_partner());
CREATE POLICY "Only admins manage products"
  ON public.products FOR ALL USING (public.is_admin());

CREATE POLICY "Product images viewable by everyone"
  ON public.product_images FOR SELECT USING (true);
CREATE POLICY "Only admins manage product images"
  ON public.product_images FOR ALL USING (public.is_admin());

CREATE POLICY "Product variants viewable by everyone"
  ON public.product_variants FOR SELECT USING (true);
CREATE POLICY "Only admins manage product variants"
  ON public.product_variants FOR ALL USING (public.is_admin());

-- 8.6 Product Reviews
CREATE POLICY "Reviews viewable by everyone"
  ON public.product_reviews FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create reviews"
  ON public.product_reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can edit own reviews"
  ON public.product_reviews FOR UPDATE
  USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own reviews or admin"
  ON public.product_reviews FOR DELETE
  USING (auth.uid() = user_id OR public.is_admin());

-- 8.7 Inventory
CREATE POLICY "Staff view inventory"
  ON public.inventory FOR SELECT
  USING (public.is_admin() OR public.is_logistics_partner() OR public.is_delivery_partner());
CREATE POLICY "Admins and logistics staff manage inventory"
  ON public.inventory FOR ALL
  USING (public.is_admin() OR public.is_logistics_partner());

-- 8.8 Carts & Cart Items
CREATE POLICY "Users view own cart"
  ON public.carts FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "Users manage own cart"
  ON public.carts FOR ALL
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users view own cart items"
  ON public.cart_items FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.carts WHERE carts.id = cart_items.cart_id AND (carts.user_id = auth.uid() OR public.is_admin()))
  );
CREATE POLICY "Users manage own cart items"
  ON public.cart_items FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.carts WHERE carts.id = cart_items.cart_id AND (carts.user_id = auth.uid() OR public.is_admin()))
  );

-- 8.9 Wishlists & Items
CREATE POLICY "Users view own wishlist"
  ON public.wishlists FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "Users manage own wishlist"
  ON public.wishlists FOR ALL
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users view own wishlist items"
  ON public.wishlist_items FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.wishlists WHERE wishlists.id = wishlist_items.wishlist_id AND (wishlists.user_id = auth.uid() OR public.is_admin()))
  );
CREATE POLICY "Users manage own wishlist items"
  ON public.wishlist_items FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.wishlists WHERE wishlists.id = wishlist_items.wishlist_id AND (wishlists.user_id = auth.uid() OR public.is_admin()))
  );

-- 8.10 Recently Viewed
CREATE POLICY "Users view own recently viewed"
  ON public.recently_viewed FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "Users insert own recently viewed"
  ON public.recently_viewed FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own recently viewed"
  ON public.recently_viewed FOR DELETE
  USING (auth.uid() = user_id);

-- 8.11 Orders & Order Items
CREATE POLICY "Users view own orders or authorized roles"
  ON public.orders FOR SELECT
  USING (
    auth.uid() = user_id
    OR public.is_admin()
    OR public.is_logistics_partner()
    OR public.is_delivery_partner()
  );

CREATE POLICY "Customers create own orders"
  ON public.orders FOR INSERT
  WITH CHECK (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Order updates by authorized roles"
  ON public.orders FOR UPDATE
  USING (
    auth.uid() = user_id
    OR public.is_admin()
    OR public.is_logistics_partner()
    OR public.is_delivery_partner()
  );

CREATE POLICY "View order items"
  ON public.order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
        AND (orders.user_id = auth.uid() OR public.is_admin() OR public.is_logistics_partner() OR public.is_delivery_partner())
    )
  );

CREATE POLICY "Insert order items"
  ON public.order_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
        AND (orders.user_id = auth.uid() OR public.is_admin())
    )
  );

-- 8.12 Payments
CREATE POLICY "Users view own payments or admin"
  ON public.payments FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Admins or service manage payments"
  ON public.payments FOR ALL
  USING (public.is_admin());

-- 8.13 Shipments
CREATE POLICY "Shipment viewable by customer, staff, delivery partner"
  ON public.shipments FOR SELECT
  USING (
    public.is_admin()
    OR public.is_logistics_partner()
    OR (public.is_delivery_partner() AND (delivery_staff_id = auth.uid() OR status IN ('Pending Assignment', 'Created', 'Assigned to Partner', 'Awaiting Pickup')))
    OR EXISTS (SELECT 1 FROM public.orders WHERE orders.id = shipments.order_id AND orders.user_id = auth.uid())
  );

CREATE POLICY "Shipment manageable by admin, logistics, delivery"
  ON public.shipments FOR UPDATE
  USING (
    public.is_admin()
    OR public.is_logistics_partner()
    OR (public.is_delivery_partner() AND (delivery_staff_id = auth.uid() OR status IN ('Pending Assignment', 'Created', 'Assigned to Partner', 'Awaiting Pickup')))
  );

CREATE POLICY "Shipment insertable by admin, logistics"
  ON public.shipments FOR INSERT
  WITH CHECK (public.is_admin() OR public.is_logistics_partner());

-- 8.14 Returns & Refunds
CREATE POLICY "Users view own returns"
  ON public.returns FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin() OR public.is_logistics_partner());

CREATE POLICY "Users request own returns"
  ON public.returns FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Staff manage returns"
  ON public.returns FOR UPDATE
  USING (public.is_admin() OR public.is_logistics_partner());

CREATE POLICY "Users view own refunds"
  ON public.refunds FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.orders WHERE orders.id = refunds.order_id AND (orders.user_id = auth.uid() OR public.is_admin()))
  );

CREATE POLICY "Admins manage refunds"
  ON public.refunds FOR ALL
  USING (public.is_admin());

-- 8.15 Coupons & Usage
CREATE POLICY "Coupons viewable by everyone"
  ON public.coupons FOR SELECT USING (is_active = true OR public.is_admin());
CREATE POLICY "Admins manage coupons"
  ON public.coupons FOR ALL USING (public.is_admin());

CREATE POLICY "Coupon usage viewable by user and admin"
  ON public.coupon_usage FOR SELECT USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "Coupon usage insertable by authenticated user"
  ON public.coupon_usage FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 8.16 Notifications
CREATE POLICY "Users view own notifications"
  ON public.notifications FOR SELECT
  USING (
    auth.uid() = user_id
    OR public.is_admin()
    OR (recipient_role = 'DELIVERY_PARTNER' AND public.is_delivery_partner())
    OR (recipient_role = 'LOGISTICS_PARTNER' AND public.is_logistics_partner())
  );

CREATE POLICY "Users update own notifications read status"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Staff insert notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- 8.17 Delivery Partners & Logistics Partners
CREATE POLICY "Delivery partner profiles viewable by staff & partner"
  ON public.delivery_partners FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin() OR public.is_logistics_partner());

CREATE POLICY "Delivery partners update own profile"
  ON public.delivery_partners FOR UPDATE
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Admins manage delivery partner records"
  ON public.delivery_partners FOR ALL
  USING (public.is_admin());

CREATE POLICY "Logistics partner records viewable by staff"
  ON public.logistics_partners FOR SELECT
  USING (public.is_admin() OR public.is_logistics_partner());

CREATE POLICY "Admins manage logistics partner records"
  ON public.logistics_partners FOR ALL
  USING (public.is_admin());

-- 8.18 Dispatch Assignments
CREATE POLICY "Staff view dispatch assignments"
  ON public.dispatch_assignments FOR SELECT
  USING (public.is_admin() OR public.is_logistics_partner() OR public.is_delivery_partner());

CREATE POLICY "Logistics & Admin manage dispatch assignments"
  ON public.dispatch_assignments FOR ALL
  USING (public.is_admin() OR public.is_logistics_partner());

-- 8.19 Transactions & Audit Logs
CREATE POLICY "Users view own transactions"
  ON public.transactions FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Only admins manage transactions"
  ON public.transactions FOR ALL
  USING (public.is_admin());

CREATE POLICY "Only admins view and create audit logs"
  ON public.audit_logs FOR SELECT
  USING (public.is_admin());

CREATE POLICY "System and admins insert audit logs"
  ON public.audit_logs FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- ------------------------------------------------------------------------------
-- 9. REALTIME PUBLICATION CONFIGURATION
-- ------------------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    CREATE PUBLICATION supabase_realtime;
  END IF;
END $$;

ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.shipments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.inventory;
ALTER PUBLICATION supabase_realtime ADD TABLE public.cart_items;

-- ------------------------------------------------------------------------------
-- 10. STORAGE BUCKETS SETUP
-- ------------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('product-images', 'product-images', true),
  ('category-images', 'category-images', true),
  ('brand-images', 'brand-images', true),
  ('user-avatars', 'user-avatars', true),
  ('order-documents', 'order-documents', false)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

-- Storage RLS Policies
CREATE POLICY "Public Read Product Images" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');
CREATE POLICY "Public Read Category Images" ON storage.objects FOR SELECT USING (bucket_id = 'category-images');
CREATE POLICY "Public Read Brand Images" ON storage.objects FOR SELECT USING (bucket_id = 'brand-images');
CREATE POLICY "Public Read User Avatars" ON storage.objects FOR SELECT USING (bucket_id = 'user-avatars');

CREATE POLICY "Authenticated Upload Product Images" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'product-images' AND auth.role() = 'authenticated'
);
CREATE POLICY "Authenticated Upload Category Images" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'category-images' AND auth.role() = 'authenticated'
);
CREATE POLICY "Authenticated Upload Brand Images" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'brand-images' AND auth.role() = 'authenticated'
);
CREATE POLICY "User Upload Avatar" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'user-avatars' AND auth.role() = 'authenticated'
);
CREATE POLICY "Protected Order Documents Select" ON storage.objects FOR SELECT USING (
  bucket_id = 'order-documents' AND (auth.role() = 'authenticated')
);
CREATE POLICY "Protected Order Documents Insert" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'order-documents' AND (auth.role() = 'authenticated')
);
