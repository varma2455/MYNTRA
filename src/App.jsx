import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { WishlistProvider } from './context/WishlistContext';
import { CartProvider } from './context/CartContext';

import { PublicLayout } from './layouts/PublicLayout';
import { RoleLayout } from './layouts/RoleLayout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Loader } from './components/Loader';

// Public & Customer Storefront Pages (Lazy loaded for blazing performance)
const Home = lazy(() => import('./pages/Home').then(m => ({ default: m.Home })));
const Categories = lazy(() => import('./pages/Categories').then(m => ({ default: m.Categories })));
const ProductListing = lazy(() => import('./pages/ProductListing').then(m => ({ default: m.ProductListing })));
const ProductDetails = lazy(() => import('./pages/ProductDetails').then(m => ({ default: m.ProductDetails })));
const Login = lazy(() => import('./pages/Login').then(m => ({ default: m.Login })));
const Register = lazy(() => import('./pages/Register').then(m => ({ default: m.Register })));
const Wishlist = lazy(() => import('./pages/Wishlist').then(m => ({ default: m.Wishlist })));
const Cart = lazy(() => import('./pages/Cart').then(m => ({ default: m.Cart })));
const Checkout = lazy(() => import('./pages/Checkout').then(m => ({ default: m.Checkout })));
const OrderConfirmation = lazy(() => import('./pages/OrderConfirmation').then(m => ({ default: m.OrderConfirmation })));
const Orders = lazy(() => import('./pages/Orders').then(m => ({ default: m.Orders })));
const Profile = lazy(() => import('./pages/Profile').then(m => ({ default: m.Profile })));
const CustomerReturns = lazy(() => import('./pages/CustomerReturns').then(m => ({ default: m.CustomerReturns })));
const CustomerSupport = lazy(() => import('./pages/CustomerSupport').then(m => ({ default: m.CustomerSupport })));
const Unauthorized = lazy(() => import('./pages/Unauthorized').then(m => ({ default: m.Unauthorized })));

// Dedicated Logins
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin').then(m => ({ default: m.AdminLogin })));
const CompanyLogin = lazy(() => import('./pages/company/CompanyLogin').then(m => ({ default: m.CompanyLogin })));
const PartnerLogin = lazy(() => import('./pages/partner/PartnerLogin').then(m => ({ default: m.PartnerLogin })));
const DeliveryLogin = lazy(() => import('./pages/delivery/DeliveryLogin').then(m => ({ default: m.DeliveryLogin })));

// Super Admin Portal Pages
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const AdminProducts = lazy(() => import('./pages/admin/AdminProducts').then(m => ({ default: m.AdminProducts })));
const AdminCategories = lazy(() => import('./pages/admin/AdminCategories').then(m => ({ default: m.AdminCategories })));
const AdminInventory = lazy(() => import('./pages/admin/AdminInventory').then(m => ({ default: m.AdminInventory })));
const AdminOrders = lazy(() => import('./pages/admin/AdminOrders').then(m => ({ default: m.AdminOrders })));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers').then(m => ({ default: m.AdminUsers })));
const AdminStaff = lazy(() => import('./pages/admin/AdminStaff').then(m => ({ default: m.AdminStaff })));
const AdminTravelPartners = lazy(() => import('./pages/admin/AdminTravelPartners').then(m => ({ default: m.AdminTravelPartners })));
const AdminDeliveryStaff = lazy(() => import('./pages/admin/AdminDeliveryStaff').then(m => ({ default: m.AdminDeliveryStaff })));
const AdminShipments = lazy(() => import('./pages/admin/AdminShipments').then(m => ({ default: m.AdminShipments })));
const AdminPayments = lazy(() => import('./pages/admin/AdminPayments').then(m => ({ default: m.AdminPayments })));
const AdminReports = lazy(() => import('./pages/admin/AdminReports').then(m => ({ default: m.AdminReports })));
const AdminAuditLogs = lazy(() => import('./pages/admin/AdminAuditLogs').then(m => ({ default: m.AdminAuditLogs })));

// Company Operations Portal Pages
const CompanyDashboard = lazy(() => import('./pages/company/CompanyDashboard').then(m => ({ default: m.CompanyDashboard })));
const CompanyOrders = lazy(() => import('./pages/company/CompanyOrders').then(m => ({ default: m.CompanyOrders })));
const CompanyOrderDetail = lazy(() => import('./pages/company/CompanyOrderDetail').then(m => ({ default: m.CompanyOrderDetail })));
const CompanyProcessing = lazy(() => import('./pages/company/CompanyProcessing').then(m => ({ default: m.CompanyProcessing })));
const CompanyPacking = lazy(() => import('./pages/company/CompanyPacking').then(m => ({ default: m.CompanyPacking })));
const CompanyReadyToDispatch = lazy(() => import('./pages/company/CompanyReadyToDispatch').then(m => ({ default: m.CompanyReadyToDispatch })));
const CompanyDispatch = lazy(() => import('./pages/company/CompanyDispatch').then(m => ({ default: m.CompanyDispatch })));
const CompanyShipments = lazy(() => import('./pages/company/CompanyShipments').then(m => ({ default: m.CompanyShipments })));
const CompanyReturns = lazy(() => import('./pages/company/CompanyReturns').then(m => ({ default: m.CompanyReturns })));
const CompanyInventory = lazy(() => import('./pages/company/CompanyInventory').then(m => ({ default: m.CompanyInventory })));
const CompanyNotifications = lazy(() => import('./pages/company/CompanyNotifications').then(m => ({ default: m.CompanyNotifications })));
const CompanyProfile = lazy(() => import('./pages/company/CompanyProfile').then(m => ({ default: m.CompanyProfile })));

// Delivery Staff Portal Pages
const DeliveryDashboard = lazy(() => import('./pages/delivery/DeliveryDashboard').then(m => ({ default: m.DeliveryDashboard })));
const DeliveryAvailableOrders = lazy(() => import('./pages/delivery/DeliveryAvailableOrders').then(m => ({ default: m.DeliveryAvailableOrders })));
const DeliveryMyDeliveries = lazy(() => import('./pages/delivery/DeliveryMyDeliveries').then(m => ({ default: m.DeliveryMyDeliveries })));
const DeliveryShipmentDetail = lazy(() => import('./pages/delivery/DeliveryShipmentDetail').then(m => ({ default: m.DeliveryShipmentDetail })));
const DeliveryHistory = lazy(() => import('./pages/delivery/DeliveryHistory').then(m => ({ default: m.DeliveryHistory })));
const DeliveryProfile = lazy(() => import('./pages/delivery/DeliveryProfile').then(m => ({ default: m.DeliveryProfile })));
const DeliveryNotifications = lazy(() => import('./pages/delivery/DeliveryNotifications').then(m => ({ default: m.DeliveryNotifications })));

// Travel Partner Portal Pages
const PartnerDashboard = lazy(() => import('./pages/partner/PartnerDashboard').then(m => ({ default: m.PartnerDashboard })));
const PartnerShipments = lazy(() => import('./pages/partner/PartnerShipments').then(m => ({ default: m.PartnerShipments })));
const PartnerAvailableShipments = lazy(() => import('./pages/partner/PartnerAvailableShipments').then(m => ({ default: m.PartnerAvailableShipments })));
const PartnerShipmentDetail = lazy(() => import('./pages/partner/PartnerShipmentDetail').then(m => ({ default: m.PartnerShipmentDetail })));
const PartnerAssignments = lazy(() => import('./pages/partner/PartnerAssignments').then(m => ({ default: m.PartnerAssignments })));
const PartnerDeliveryStaff = lazy(() => import('./pages/partner/PartnerDeliveryStaff').then(m => ({ default: m.PartnerDeliveryStaff })));
const PartnerVehicles = lazy(() => import('./pages/partner/PartnerVehicles').then(m => ({ default: m.PartnerVehicles })));
const PartnerTracking = lazy(() => import('./pages/partner/PartnerTracking').then(m => ({ default: m.PartnerTracking })));
const PartnerReports = lazy(() => import('./pages/partner/PartnerReports').then(m => ({ default: m.PartnerReports })));
const PartnerProfile = lazy(() => import('./pages/partner/PartnerProfile').then(m => ({ default: m.PartnerProfile })));

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <WishlistProvider>
          <CartProvider>
            <BrowserRouter>
              <Suspense
                fallback={
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                    <Loader size="large" text="Curating luxury experience..." />
                  </div>
                }
              >
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
              </Suspense>
            </BrowserRouter>
          </CartProvider>
        </WishlistProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
