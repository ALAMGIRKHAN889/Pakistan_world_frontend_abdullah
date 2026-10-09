import { useState } from 'react';
import { Link, NavLink, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import Icon from '../components/Icons';
import Logo from '../components/Logo';
import { ThemeSwitch } from '../components/ThemeToggle';
import './admin.css';

const NAV = [['/admin', 'Dashboard', 'dash', true], ['/admin/products', 'Products', 'box'], ['/admin/orders', 'Orders', 'receipt'], ['/admin/customers', 'Customers', 'users'], ['/admin/coupons', 'Coupons', 'tag']];

export default function AdminLayout() {
  const { user, ready, logout } = useAuth();
  const nav = useNavigate(), loc = useLocation();
  const [open, setOpen] = useState(false);
  if (!ready) return null;
  if (!user) return <Navigate to="/login?next=/admin" replace />;
  if (user.role !== 'admin') return <Navigate to="/" replace />;
  const isOn = (to, end) => (end ? loc.pathname === to : loc.pathname.startsWith(to));
  return (
    <div className="adm">
      <aside className={`adm-side ${open ? 'open' : ''}`}>
        <Link to="/admin" className="brand" aria-label="Products World admin"><Logo /></Link>
        {NAV.map(([to, l, ic, end]) => (
          <NavLink key={to} to={to} end={end} className={`adm-link ${isOn(to, end) ? 'on' : ''}`} onClick={() => setOpen(false)}>
            {isOn(to, end) && <motion.span layoutId="admnav" className="bg" />}<Icon n={ic} size={18} />{l}
          </NavLink>
        ))}
        <div className="sp" />
        <div className="theme-row"><ThemeSwitch /></div>
        <Link to="/" className="adm-link"><Icon n="store" size={18} />View storefront</Link>
        <button className="adm-link" onClick={() => { logout(); nav('/'); }}><Icon n="out" size={18} />Sign out</button>
        <div style={{ padding: '12px 12px 0', fontSize: 12, color: '#8d8b92', borderTop: '1px solid rgba(255,255,255,.08)', marginTop: 8 }}>{user.email}</div>
      </aside>
      <main className="adm-main">
        <button className="sq adm-mob" style={{ marginBottom: 14 }} onClick={() => setOpen((o) => !o)} aria-label="Menu"><Icon n="menu" size={18} /></button>
        <AnimatePresence mode="wait"><motion.div key={loc.pathname} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}><Outlet /></motion.div></AnimatePresence>
      </main>
    </div>
  );
}
