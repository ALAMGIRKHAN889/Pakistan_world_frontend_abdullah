import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import api, { money, errMsg } from '../api';
import { useAuth } from '../context/AuthContext';
import ProductCard from '../components/ProductCard';
import { Skel } from '../components/Bits';

const STEPS = ['placed', 'processing', 'shipped', 'delivered'];

function Orders() {
  const [orders, setOrders] = useState(null);
  const load = () => api.get('/orders/mine').then((r) => setOrders(r.data.orders));
  useEffect(() => { load(); }, []);
  const cancel = async (id) => { if (!confirm('Cancel this order?')) return; try { await api.post(`/orders/${id}/cancel`); toast.success('Order cancelled'); load(); } catch (e) { toast.error(errMsg(e)); } };
  if (!orders) return <Skel h={200} />;
  if (!orders.length) return <div className="empty"><h3>No orders yet</h3><p>Your acquisitions will appear here.</p><Link to="/shop" className="btn btn-primary" style={{ marginTop: 16 }}>Start exploring</Link></div>;
  return orders.map((o) => {
    const idx = STEPS.indexOf(o.status);
    return (
      <div className="order-card" key={o._id}>
        <div className="order-top"><div><b>#{o.orderNo}</b><div className="muted" style={{ fontSize: 13 }}>{new Date(o.createdAt).toLocaleDateString('en-US', { dateStyle: 'medium' })}</div></div><div style={{ textAlign: 'right' }}><span className={`status st-${o.status}`}>{o.status}</span><div style={{ marginTop: 4 }}><b>{money(o.total)}</b></div></div></div>
        <div className="thumbs-row">{o.items.slice(0, 6).map((i, k) => <img key={k} src={i.image} alt={i.name} title={i.name} />)}</div>
        {o.status !== 'cancelled' && <div className="track">{STEPS.map((s, i) => <div key={s} className={i <= idx ? 'done' : ''}>{s}</div>)}</div>}
        <div style={{ display: 'flex', gap: 10, marginTop: 14 }}><Link to={`/order/${o._id}`} className="btn btn-line btn-sm">View receipt</Link>{['placed', 'processing'].includes(o.status) && <button className="btn btn-line btn-sm" onClick={() => cancel(o._id)}>Cancel</button>}</div>
      </div>
    );
  });
}

function Wishlist() {
  const [items, setItems] = useState(null);
  const { user } = useAuth();
  useEffect(() => { api.get('/me/wishlist').then((r) => setItems(r.data.items)); }, [user?.wishlist?.length]);
  if (!items) return <Skel h={200} />;
  if (!items.length) return <div className="empty"><h3>Your wishlist is empty</h3><p>Tap the heart on any piece to save it.</p><Link to="/shop" className="btn btn-primary" style={{ marginTop: 16 }}>Discover pieces</Link></div>;
  return <div className="pgrid three">{items.map((p, i) => <ProductCard key={p._id} p={p} index={i} />)}</div>;
}

function Profile() {
  const { user, setUser } = useAuth();
  const a = user.addresses?.[0] || {};
  const [f, setF] = useState({ name: user.name, phone: user.phone || '', street: a.street || '', city: a.city || '', postal: a.postal || '', country: a.country || '', password: '' });
  const up = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const save = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.put('/auth/me', { name: f.name, phone: f.phone, password: f.password || undefined, addresses: [{ label: 'Home', street: f.street, city: f.city, postal: f.postal, country: f.country }] });
      setUser(data.user); setF({ ...f, password: '' }); toast.success('Profile updated');
    } catch (er) { toast.error(errMsg(er)); }
  };
  return (
    <form className="panel" onSubmit={save} style={{ display: 'grid', gap: 14, maxWidth: 640 }}>
      <div className="grid2"><label className="field"><span>Name</span><input className="input" value={f.name} onChange={up('name')} required /></label><label className="field"><span>Phone</span><input className="input" value={f.phone} onChange={up('phone')} /></label></div>
      <label className="field"><span>Email</span><input className="input" value={user.email} disabled /></label>
      <label className="field"><span>Saved street address</span><input className="input" value={f.street} onChange={up('street')} /></label>
      <div className="grid2"><label className="field"><span>City</span><input className="input" value={f.city} onChange={up('city')} /></label><label className="field"><span>Postal</span><input className="input" value={f.postal} onChange={up('postal')} /></label></div>
      <label className="field"><span>Country</span><input className="input" value={f.country} onChange={up('country')} /></label>
      <label className="field"><span>New password (optional)</span><input className="input" type="password" minLength={6} value={f.password} onChange={up('password')} /></label>
      <button className="btn btn-primary" style={{ justifySelf: 'start' }}>Save changes</button>
    </form>
  );
}

export default function Account() {
  const { user, ready, logout } = useAuth();
  const { tab = 'orders' } = useParams();
  const nav = useNavigate();
  if (ready && !user) return <Navigate to="/login?next=/account" replace />;
  if (!user) return null;
  const T = [['orders', 'Orders & tracking', '/account'], ['wishlist', 'Wishlist', '/account/wishlist'], ['profile', 'Profile & addresses', '/account/profile']];
  return (
    <div className="wrap" style={{ padding: '3rem var(--margin) 0' }}>
      <span className="eyebrow">My atelier</span>
      <h1 className="display" style={{ fontSize: 'clamp(30px,4vw,48px)', margin: '8px 0 32px' }}>Hello, {user.name.split(' ')[0]}</h1>
      <div className="acc">
        <nav className="acc-nav">
          {T.map(([k, l, to]) => <button key={k} className={tab === k ? 'on' : ''} onClick={() => nav(to)}>{l}</button>)}
          {user.role === 'admin' && <Link to="/admin" style={{ color: 'var(--gold-ink)' }}>Admin panel →</Link>}
          <button onClick={() => { logout(); nav('/'); }}>Sign out</button>
        </nav>
        <div>{tab === 'orders' && <Orders />}{tab === 'wishlist' && <Wishlist />}{tab === 'profile' && <Profile />}</div>
      </div>
    </div>
  );
}
