# Myntra Pro — Full-Stack E-Commerce Web Application

A full-stack, production-grade e-commerce web platform inspired by Myntra, built with **React + Vite** and connected to the existing **Node.js/Express** backend and **MongoDB** database (`myntra_pro`).

---

## 🚀 Quick Launch Guide

### 1. Start MongoDB
Ensure MongoDB is running locally:
```bash
mongod --dbpath /data/db --fork --logpath /tmp/mongod.log
```

### 2. Start Express Backend
```bash
cd ~/Desktop/Projects/Myntra/backend
npm run start
# Server listens on http://localhost:5000 (Health check: http://localhost:5000/api/health)
```

*(Optional: If resetting or seeding the catalog with 780 products and demo accounts)*
```bash
npm run seed
```

### 3. Start React + Vite Frontend
```bash
cd ~/Desktop/Projects/myntra-web
npm run dev
# Frontend runs at: http://localhost:5173
```

---

## 🔑 Demo Role Credentials

| Portal / Role | Email | Password | Access Privileges |
|---|---|---|---|
| **Customer** | `demo@myntrapro.com` | `Password123` | Browsing, Wishlist, Bag, Checkout, Order Tracking |
| **Super Admin** | `admin@myntrapro.com` | `AdminPassword123` | Catalog, Categories, Financials, User Blocks, Staff Roster, Audit Logs |
| **Transport Manager** | `transport@myntrapro.com` | `TransportPass123` | Logistics Dashboard, Shipments, Assign Courier Staff, Status Tracking |
| **Delivery Staff** | `delivery@myntrapro.com` | `DeliveryPass123` | Assigned Deliveries Queue, Digital Proof of Delivery, Outcome Submission |
| **Blocked User** | `blocked@myntrapro.com` | `Password123` | Account restriction enforcement demonstration |

---

## 📦 15 Fashion Departments (780 Unique Products)

Each category contains 52 unique catalog items with live server-side filtering, sorting, and pagination:

1. **Men's Clothing** (`/products?category=mens-clothing`)
2. **Women's Clothing** (`/products?category=womens-clothing`)
3. **Kids' Clothing** (`/products?category=kids-clothing`)
4. **Men's Footwear** (`/products?category=mens-footwear`)
5. **Women's Footwear** (`/products?category=womens-footwear`)
6. **Kids' Footwear** (`/products?category=kids-footwear`)
7. **Bags & Backpacks** (`/products?category=bags-backpacks`)
8. **Watches & Wearables** (`/products?category=watches-wearables`)
9. **Jewellery** (`/products?category=jewellery`)
10. **Beauty & Makeup** (`/products?category=beauty-makeup`)
11. **Skincare & Personal Care** (`/products?category=skincare-personal-care`)
12. **Sportswear & Activewear** (`/products?category=sportswear-activewear`)
13. **Home & Living** (`/products?category=home-living`)
14. **Ethnic & Traditional Wear** (`/products?category=ethnic-traditional-wear`)
15. **Lingerie & Sleepwear** (`/products?category=lingerie-sleepwear`)

---

## 🛠️ Technology Stack & Architecture

- **Frontend**: React 18, Vite 6, React Router DOM v6, Axios, Lucide React, Canvas Confetti
- **State Management**: React Context API (`AuthContext`, `CartContext`, `WishlistContext`, `ToastContext`)
- **Backend**: Node.js, Express, MongoDB with Mongoose
- **Security**: JWT tokens in Authorization headers, atomic stock deduction, input sanitization, RBAC middleware

---

## 🌐 Environment Variables

File: `~/Desktop/Projects/myntra-web/.env`
```env
VITE_API_URL=http://localhost:5000/api
```
# MYNTRA
