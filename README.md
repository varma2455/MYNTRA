# Myntra Pro — Enterprise Fashion E-Commerce Platform

A production-grade, enterprise luxury fashion e-commerce ecosystem inspired by Myntra, Nike, Zara, and modern designer platforms. Built with **React 18 + Vite**, an independent **Node.js/Express** enterprise backend, a dedicated **MongoDB Atlas/Local** database (`myntra_web_pro`), distributed **Redis (v8.0)** caching, **Socket.IO** real-time tracking, and **AI-powered** shopping assistance.

---

## 🏗️ Architecture & Component Ecosystem

```
myntra-project/
│
├── myntra-web/                           # Frontend React 18 SPA (Vercel Ready)
│   ├── src/
│   │   ├── components/                   # Navbar, MegaMenu, AIChatModal, Filters, Cards
│   │   ├── context/                      # Auth, Cart, Wishlist, Toast
│   │   ├── layouts/                      # PublicLayout, RoleLayout
│   │   ├── pages/                        # Storefront & 4 Role Portals (Lazy Loaded)
│   │   ├── services/                     # REST API, AI, Payment, Order Services
│   │   └── styles/                       # Luxury Design System & Global Styles
│   ├── package.json
│   └── vite.config.js
│
└── myntra-backend/                       # Enterprise REST API & Realtime Backend
    ├── src/
    │   ├── config/                       # Dedicated MongoDB (myntra_web_pro) Connection
    │   ├── controllers/                  # Auth, Products, Orders, AI, Payments, Admin
    │   ├── middleware/                   # RBAC Authorization, JWT, Rate Limiting, Helmet
    │   ├── models/                       # 18 Dedicated Mongoose Schemas with Indexes
    │   ├── routes/                       # Modular REST API Routes
    │   ├── services/                     # Cache (Redis/Memory), AI (Gemini), Razorpay
    │   ├── sockets/                      # Socket.IO Real-time Order & Delivery Server
    │   └── server.js                     # Express HTTP + WebSocket Server
    ├── .env
    └── package.json
```

---

## 🚀 Quick Launch Guide

### 1. Start MongoDB & Redis
Ensure MongoDB and Redis are active:
```bash
# Start MongoDB (if not running)
mongod --bind_ip_all --fork --logpath /tmp/mongod.log

# Start Redis (if not running)
redis-server --daemonize yes
```

### 2. Start Dedicated Express Backend (`myntra-backend`)
```bash
cd ~/Desktop/Projects/myntra-backend
npm install
npm run seed     # Seeds dedicated database 'myntra_web_pro' with 15 categories, 780 products & demo users
npm run start    # Listens on http://localhost:5000 (Health: http://localhost:5000/api/health)
```

### 3. Run Automated API Test Suite
```bash
cd ~/Desktop/Projects/myntra-backend
npm test
```

### 4. Start React + Vite Frontend (`myntra-web`)
```bash
cd ~/Desktop/Projects/myntra-web
npm install
npm run dev      # Launches storefront on http://localhost:5173
```

---

## 🔑 Demo Role Credentials

| Portal / Role | Email | Password | Access Privileges |
|---|---|---|---|
| **Customer Storefront** | `demo@myntrapro.com` | `Password123` | Browsing, Bag, Checkout, Live Order Tracking with Handover OTP |
| **Super Administrator** | `admin@myntrapro.com` | `AdminPassword123` | Analytics, Revenue, Catalog CRUD, User Restriction, Audit Logs |
| **Logistics / Travel Partner** | `transport@myntrapro.com` | `TransportPass123` | Dispatch Assignments, Fleet Vehicles, Waypoint Logging, Tracking |
| **Delivery Courier Partner** | `delivery@myntrapro.com` | `DeliveryPass123` | Assigned Tasks, Delivery Handover OTP Verification, Digital POD |
| **Company Fulfillment** | `company@myntrapro.com` | `CompanyPass123` | Warehouse Operations, Packing, Dispatch Staging, Inventory |
| **Restricted / Blocked User** | `blocked@myntrapro.com` | `Password123` | Security blocking demonstration |

---

## 🌟 Key Features Implemented

1. **AI Fashion Concierge & Natural Language Search**:
   - Floating AI assistant widget available across all pages.
   - Natural language search query parsing (e.g., *"cotton shirts for men under 2000"*).
   - Complete the Look / AI Outfit Coordination recommendations with bundle savings.

2. **15 Curated Departments (780 Unique Products)**:
   - Men's Clothing, Women's Clothing, Kids' Clothing, Men's Footwear, Women's Footwear, Kids' Footwear, Bags & Backpacks, Watches & Wearables, Jewellery, Beauty & Makeup, Skincare & Personal Care, Sportswear & Activewear, Home & Living, Ethnic & Traditional Wear, Lingerie & Sleepwear.
   - Faceted filtering: brand, price range, discount %, customer rating, size, color.

3. **Real-time Order Lifecycle & Delivery OTP**:
   - Full order lifecycle: `PLACED → CONFIRMED → PACKED → DISPATCHED → IN TRANSIT → OUT FOR DELIVERY → DELIVERED`.
   - Real-time updates delivered via **Socket.IO**.
   - 4-digit **Delivery Handover OTP** displayed on the customer tracking page and verified by courier on delivery.

4. **Cart, Coupons & Multi-Option Checkout**:
   - Promo codes: `FIRST100` (₹100 Off), `SAVE200` (₹200 Off), `FESTIVE25` (25% Off), `VIP30` (30% Off).
   - Razorpay payment order creation and signature verification.
   - Cash on Delivery (COD) with verification OTP, UPI, Cards, Net Banking.

5. **Performance & Security**:
   - Route-based code splitting: Main bundle reduced to **298 kB (gzip 93 kB)**.
   - Redis caching with high-speed in-memory fallback.
   - Helmet security headers, rate limiting, and request correlation IDs.
