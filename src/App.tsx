/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { StrictMode } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "./components/Layout";
import { AdminLayout } from "./components/admin/AdminLayout";
import { AdminLogin } from "./pages/admin/AdminLogin";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { AdminProducts } from "./pages/admin/AdminProducts";
import { AdminCategories } from "./pages/admin/AdminCategories";
import { AdminSports } from "./pages/admin/AdminSports";
import { AdminStacks } from "./pages/admin/AdminStacks";
import { AdminOrders } from "./pages/admin/AdminOrders";
import { AdminCustomers } from "./pages/admin/AdminCustomers";
import { AdminBlogs } from "./pages/admin/AdminBlogs";
import { AdminRewards } from "./pages/admin/AdminRewards";
import { AdminCoupons } from "./pages/admin/AdminCoupons";
import { AdminReviews } from "./pages/admin/AdminReviews";
import { AdminHomepage } from "./pages/admin/AdminHomepage";
import { AdminSettings } from "./pages/admin/AdminSettings";
import { AdminNEXAI } from "./pages/admin/AdminNEXAI";
import { Home } from "./pages/Home";
import { Products } from "./pages/Products";
import { ProductDetail } from "./pages/ProductDetail";
import { BestSellersPage } from "./pages/BestSellersPage";
import  About  from "./pages/About";
import { Blogs } from "./pages/Blogs";
import { SingleBlog } from "./pages/SingleBlog";
import { TrackOrder } from "./pages/TrackOrder";
import { Cart } from "./pages/Cart";
import { Wishlist } from "./pages/Wishlist";
import { Account } from "./pages/Account";
import { Checkout } from "./pages/Checkout";
import { Login } from "./pages/Login";

import { SportDetail } from "./pages/SportDetail";
import { CategoryDetail } from "./pages/CategoryDetail";
import { NEXAI } from "./pages/NEXAI";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="sports" element={<AdminSports />} />
          <Route path="stacks" element={<AdminStacks />} />
          <Route path="nexai" element={<AdminNEXAI />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="customers" element={<AdminCustomers />} />
          <Route path="blogs" element={<AdminBlogs />} />
          <Route path="rewards" element={<AdminRewards />} />
          <Route path="coupons" element={<AdminCoupons />} />
          <Route path="reviews" element={<AdminReviews />} />
          <Route path="homepage" element={<AdminHomepage />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>
        
        <Route path="/control" element={<AdminLogin />} />
        
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="products" element={<Products />} />
          <Route path="product/:slug" element={<ProductDetail />} />
          <Route path="sports/:id" element={<SportDetail />} />
          <Route path="category/:id" element={<CategoryDetail />} />
          <Route path="best-sellers" element={<BestSellersPage />} />
          <Route path="about" element={<About />} />
          <Route path="blogs" element={<Blogs />} />
          <Route path="blogs/:slug" element={<SingleBlog />} />
          <Route path="track-order" element={<TrackOrder />} />
          <Route path="cart" element={<Cart />} />
          <Route path="wishlist" element={<Wishlist />} />
          <Route path="account" element={<Account />} />
          <Route path="login" element={<Login />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="nexai" element={<NEXAI />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
