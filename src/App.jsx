import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { WishlistProvider } from './context/WishlistContext';
import { CartProvider } from './context/CartContext';

import { PublicLayout } from './layouts/PublicLayout';
import { RoleLayout } from './layouts/RoleLayout';
import { ProtectedRoute } from './components/ProtectedRoute';

// Public & Customer Storefront Pages
import { Home } from './pages/Home';
import { Categories } from './pages/Categories';
import { ProductListing } from './pages/ProductListing';
import { ProductDetails } from './pages/ProductDetails';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Wishlist } from './pages/Wishlist';
import { Cart } from './pages/Cart';
import { Checkout } from './pages/Checkout';
import { OrderConfirmation } from './pages/OrderConfirmation';
import { Orders } from './pages/Orders';
import { Profile } from './pages/Profile';
import { CustomerReturns } from './pages/CustomerReturns';
import { CustomerSupport } from './pages/CustomerSupport';
import { Unauthorized } from './pages/Unauthorized';

// Dedicated Logins
import { AdminLogin } from './pages/admin/AdminLogin';
import { CompanyLogin } from './pages/company/CompanyLogin';
import { PartnerLogin } from './pages/partner/PartnerLogin';
import { DeliveryLogin } from './pages/delivery/DeliveryLogin';

// Super Admin Portal Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminProducts } from './pages/admin/AdminProducts';
import { AdminCategories } from './pages/admin/AdminCategories';
import { AdminInventory } from './pages/admin/AdminInventory';
import { AdminOrders } from './pages/admin/AdminOrders';
import { AdminUsers } from './pages/admin/AdminUsers';
import { AdminStaff } from './pages/admin/AdminStaff';
import { AdminTravelPartners } from './pages/admin/AdminTravelPartners';
import { AdminDeliveryStaff } from './pages/admin/AdminDeliveryStaff';
import { AdminShipments } from './pages/admin/AdminShipments';
import { AdminPayments } from './pages/admin/AdminPayments';
import { AdminReports } from './pages/admin/AdminReports';
import { AdminAuditLogs } from './pages/admin/AdminAuditLogs';

// Company Operations Portal Pages
import { CompanyDashboard } from './pages/company/CompanyDashboard';
import { CompanyOrders } from './pages/company/CompanyOrders';
import { CompanyOrderDetail } from './pages/company/CompanyOrderDetail';
import { CompanyProcessing } from './pages/company/CompanyProcessing';
import { CompanyPacking } from './pages/company/CompanyPacking';
import { CompanyReadyToDispatch } from './pages/company/CompanyReadyToDispatch';
import { CompanyDispatch } from './pages/company/CompanyDispatch';
import { CompanyShipments } from './pages/company/CompanyShipments';
import { CompanyReturns } from './pages/company/CompanyReturns';
import { CompanyInventory } from './pages/company/CompanyInventory';
import { CompanyNotifications } from './pages/company/CompanyNotifications';
import { CompanyProfile } from './pages/company/CompanyProfile';

// Delivery Staff Portal Pages
import { DeliveryDashboard } from './pages/delivery/DeliveryDashboard';
import { DeliveryAvailableOrders } from './pages/delivery/DeliveryAvailableOrders';
import { DeliveryMyDeliveries } from './pages/delivery/DeliveryMyDeliveries';
import { DeliveryShipmentDetail } from './pages/delivery/DeliveryShipmentDetail';
import { DeliveryHistory } from './pages/delivery/DeliveryHistory';
import { DeliveryProfile } from './pages/delivery/DeliveryProfile';
import { DeliveryNotifications } from './pages/delivery/DeliveryNotifications';

// Travel Partner Portal Pages
import { PartnerDashboard } from './pages/partner/PartnerDashboard';
import { PartnerShipments } from './pages/partner/PartnerShipments';
import { PartnerAvailableShipments } from './pages/partner/PartnerAvailableShipments';
import { PartnerShipmentDetail } from './pages/partner/PartnerShipmentDetail';
import { PartnerAssignments } from './pages/partner/PartnerAssignments';
import { PartnerDeliveryStaff } from './pages/partner/PartnerDeliveryStaff';
import { PartnerVehicles } from './pages/partner/PartnerVehicles';
import { PartnerTracking } from './pages/partner/PartnerTracking';
import { PartnerReports } from './pages/partner/PartnerReports';
import { PartnerProfile } from './pages/partner/PartnerProfile';

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <WishlistProvider>
          <CartProvider>
            <BrowserRouter>
              <Routes>
                {/* Dedicated Portal Login Routes */}
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/company/login" element={<CompanyLogin />} />
                <Route path="/partner/login" element={<PartnerLogin />} />
                <Route path="/delivery/login" element={<DeliveryLogin />} />
                <Route path="/unauthorized" element={<Unauthorized />} />

                {/* Public & Customer Storefront Routes */}
                <Route element={<PublicLayout />}>
                  <Route path="/" element={<Home />} />
                  <Route path="/categories" element={<Categories />} />
                  <Route path="/category/:slug" element={<ProductListing />} />
                  <Route path="/products" element={<ProductListing />} />
                  <Route path="/products/:productId" element={<ProductDetails />} />
                  <Route path="/product/:id" element={<ProductDetails />} />
                  <Route path="/search" element={<ProductListing />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/wishlist" element={<Wishlist />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/account/support" element={<CustomerSupport />} />

                  {/* Protected Customer Routes */}
                  <Route
                    path="/checkout"
                    element={
                      <ProtectedRoute>
                        <Checkout />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/order-confirmation"
                    element={
                      <ProtectedRoute>
                        <OrderConfirmation />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/orders"
                    element={
                      <ProtectedRoute>
                        <Orders />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute>
                        <Profile />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/account"
                    element={
                      <ProtectedRoute>
                        <Profile />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/account/profile"
                    element={
                      <ProtectedRoute>
                        <Profile />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/account/addresses"
                    element={
                      <ProtectedRoute>
                        <Profile />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/account/orders"
                    element={
                      <ProtectedRoute>
                        <Orders />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/account/orders/:orderId"
                    element={
                      <ProtectedRoute>
                        <Orders />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/account/returns"
                    element={
                      <ProtectedRoute>
                        <CustomerReturns />
                      </ProtectedRoute>
                    }
                  />
                </Route>

                {/* 1. Super Admin Protected Portal (/admin/*) */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute allowedRoles={['super_admin', 'admin']}>
                      <RoleLayout portalRole="admin" title="Super Admin Portal" />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<AdminDashboard />} />
                  <Route path="dashboard" element={<AdminDashboard />} />
                  <Route path="products" element={<AdminProducts />} />
                  <Route path="categories" element={<AdminCategories />} />
                  <Route path="inventory" element={<AdminInventory />} />
                  <Route path="orders" element={<AdminOrders />} />
                  <Route path="customers" element={<AdminUsers />} />
                  <Route path="users" element={<AdminUsers />} />
                  <Route path="staff" element={<AdminStaff />} />
                  <Route path="travel-partners" element={<AdminTravelPartners />} />
                  <Route path="delivery-staff" element={<AdminDeliveryStaff />} />
                  <Route path="shipments" element={<AdminShipments />} />
                  <Route path="payments" element={<AdminPayments />} />
                  <Route path="reports" element={<AdminReports />} />
                  <Route path="audit-logs" element={<AdminAuditLogs />} />
                </Route>

                {/* 2. Company Operations Protected Portal (/company/*) */}
                <Route
                  path="/company"
                  element={
                    <ProtectedRoute allowedRoles={['company_staff', 'super_admin', 'admin']}>
                      <RoleLayout portalRole="company" title="Company Operations & Fulfillment" />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<CompanyDashboard />} />
                  <Route path="dashboard" element={<CompanyDashboard />} />
                  <Route path="orders" element={<CompanyOrders />} />
                  <Route path="orders/:orderId" element={<CompanyOrderDetail />} />
                  <Route path="processing" element={<CompanyProcessing />} />
                  <Route path="packing" element={<CompanyPacking />} />
                  <Route path="ready-to-dispatch" element={<CompanyReadyToDispatch />} />
                  <Route path="dispatch" element={<CompanyDispatch />} />
                  <Route path="shipments" element={<CompanyShipments />} />
                  <Route path="returns" element={<CompanyReturns />} />
                  <Route path="inventory" element={<CompanyInventory />} />
                  <Route path="notifications" element={<CompanyNotifications />} />
                  <Route path="profile" element={<CompanyProfile />} />
                </Route>

                {/* 3. Travel Partner Protected Portal (/partner/*) */}
                <Route
                  path="/partner"
                  element={
                    <ProtectedRoute allowedRoles={['transport_manager', 'super_admin', 'admin']}>
                      <RoleLayout portalRole="partner" title="Travel Partner Operations" />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<PartnerDashboard />} />
                  <Route path="dashboard" element={<PartnerDashboard />} />
                  <Route path="shipments" element={<PartnerShipments />} />
                  <Route path="shipments/:shipmentId" element={<PartnerShipmentDetail />} />
                  <Route path="available-shipments" element={<PartnerAvailableShipments />} />
                  <Route path="assignments" element={<PartnerAssignments />} />
                  <Route path="delivery-staff" element={<PartnerDeliveryStaff />} />
                  <Route path="vehicles" element={<PartnerVehicles />} />
                  <Route path="tracking" element={<PartnerTracking />} />
                  <Route path="reports" element={<PartnerReports />} />
                  <Route path="profile" element={<PartnerProfile />} />
                </Route>

                {/* Backward compatibility: Transport route redirects to /partner */}
                <Route path="/transport" element={<Navigate to="/partner" replace />} />
                <Route path="/transport/*" element={<Navigate to="/partner" replace />} />

                {/* 4. Delivery Courier Protected Portal (/delivery/*) */}
                <Route
                  path="/delivery"
                  element={
                    <ProtectedRoute allowedRoles={['delivery_staff', 'super_admin', 'admin']}>
                      <RoleLayout portalRole="delivery" title="Courier Delivery Portal" />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<DeliveryDashboard />} />
                  <Route path="dashboard" element={<DeliveryDashboard />} />
                  <Route path="available-orders" element={<DeliveryAvailableOrders />} />
                  <Route path="my-deliveries" element={<DeliveryMyDeliveries />} />
                  <Route path="delivery/:shipmentId" element={<DeliveryShipmentDetail />} />
                  <Route path="history" element={<DeliveryHistory />} />
                  <Route path="profile" element={<DeliveryProfile />} />
                  <Route path="notifications" element={<DeliveryNotifications />} />
                </Route>

                {/* 404 Catch All */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </BrowserRouter>
          </CartProvider>
        </WishlistProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
