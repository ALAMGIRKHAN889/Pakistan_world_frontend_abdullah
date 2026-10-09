import { lazy, Suspense } from 'react';
import { Link, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Shop from './pages/Shop';
import Product from './pages/Product';
import Checkout from './pages/Checkout';
import Order from './pages/Order';
import Account from './pages/Account';
import Auth from './pages/Auth';
const AdminLayout = lazy(() => import('./admin/AdminLayout'));
const Dashboard = lazy(() => import('./admin/Dashboard'));
const AProducts = lazy(() => import('./admin/Products'));
const AOrders = lazy(() => import('./admin/Orders'));
const Customers = lazy(() => import('./admin/Customers'));
const Coupons = lazy(() => import('./admin/Coupons'));

const NotFound = () => (
  <div className="wrap empty" style={{ padding: '8rem 0' }}><span className="eyebrow">404</span><h1 className="display" style={{ margin: '10px 0 20px' }}>Page not found</h1><Link to="/" className="btn btn-primary">Back home</Link></div>
);

export default function App() {
  return (
    <Suspense fallback={<div style={{ padding: 60, textAlign: 'center' }}>Loading…</div>}>
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="shop" element={<Shop />} />
        <Route path="shop/:cat" element={<Shop />} />
        <Route path="product/:slug" element={<Product />} />
        <Route path="checkout" element={<Checkout />} />
        <Route path="order/:id" element={<Order />} />
        <Route path="account" element={<Account />} />
        <Route path="account/:tab" element={<Account />} />
        <Route path="login" element={<Auth />} />
        <Route path="register" element={<Auth mode="register" />} />
        <Route path="*" element={<NotFound />} />
      </Route>
      <Route path="admin" element={<AdminLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="products" element={<AProducts />} />
        <Route path="orders" element={<AOrders />} />
        <Route path="customers" element={<Customers />} />
        <Route path="coupons" element={<Coupons />} />
      </Route>
    </Routes>
    </Suspense>
  );
}
