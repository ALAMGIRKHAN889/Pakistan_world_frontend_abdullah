import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api, { money, errMsg } from '../api';
import { useShop } from '../context/ShopContext';
import { useAuth } from '../context/AuthContext';

export default function Checkout() {
  const { bag, subtotal, clear, coupon, setCoupon } = useShop();
  const { user, ready } = useAuth();
  const nav = useNavigate();
  const [f, setF] = useState({ name: '', email: '', phone: '', street: '', city: '', postal: '', country: 'Pakistan', notes: '' });
  const [delivery, setDelivery] = useState('standard'), [pay, setPay] = useState('cod');
  const [card, setCard] = useState({ number: '', exp: '', cvc: '' });
  const [code, setCode] = useState(''), [busy, setBusy] = useState(false);

  useEffect(() => { if (user) setF((x) => ({ ...x, name: x.name || user.name, email: x.email || user.email, phone: x.phone || user.phone || '', ...(user.addresses?.[0] ? { street: x.street || user.addresses[0].street, city: x.city || user.addresses[0].city, postal: x.postal || user.addresses[0].postal, country: user.addresses[0].country || x.country } : {}) })); }, [user]);
  const up = (k) => (e) => setF({ ...f, [k]: e.target.value });

  if (ready && !user) return <Navigate to="/login?next=/checkout" replace />;
  if (!bag.length) return <div className="wrap empty" style={{ padding: '8rem 0' }}><h2>Your bag is empty</h2><Link to="/shop" className="btn btn-primary" style={{ marginTop: 20 }}>Continue shopping</Link></div>;

  const ship = delivery === 'express' ? 15 : 0;
  const discount = coupon?.discount || 0;
  const total = Math.max(0, subtotal - discount + ship);

  const applyCoupon = async () => {
    try { const { data } = await api.post('/me/coupons/validate', { code, subtotal }); setCoupon(data); toast.success(`${data.code} applied`); }
    catch (e) { setCoupon(null); toast.error(errMsg(e)); }
  };

  const place = async (e) => {
    e.preventDefault(); setBusy(true);
    try {
      const { data } = await api.post('/orders', {
        items: bag.map((l) => ({ productId: l.productId, qty: l.qty, options: l.options })),
        shipping: f, delivery, paymentMethod: pay, coupon: coupon?.code, card: pay === 'card' ? card : undefined,
      });
      clear(); nav(`/order/${data.order._id}`, { state: { fresh: true } });
    } catch (er) { toast.error(errMsg(er)); } finally { setBusy(false); }
  };

  const fmtCard = (v) => v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();

  return (
    <div className="wrap" style={{ paddingTop: 40 }}>
      <h1 className="display" style={{ fontSize: 'clamp(32px,4vw,48px)', marginBottom: 28 }}>Checkout</h1>
      <form className="co" onSubmit={place}>
        <div>
          <motion.section className="panel" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h3><i>1</i> Shipping profile</h3>
            <div style={{ display: 'grid', gap: 14 }}>
              <div className="grid2"><label className="field"><span>Full name</span><input className="input" required value={f.name} onChange={up('name')} /></label><label className="field"><span>Email</span><input className="input" type="email" required value={f.email} onChange={up('email')} /></label></div>
              <div className="grid2"><label className="field"><span>Phone / WhatsApp</span><input className="input" required value={f.phone} onChange={up('phone')} placeholder="+92 300 1234567" /></label><label className="field"><span>Country</span><input className="input" required value={f.country} onChange={up('country')} /></label></div>
              <label className="field"><span>Street address</span><input className="input" required value={f.street} onChange={up('street')} /></label>
              <div className="grid2"><label className="field"><span>City</span><input className="input" required value={f.city} onChange={up('city')} /></label><label className="field"><span>Postal code</span><input className="input" value={f.postal} onChange={up('postal')} /></label></div>
              <label className="field"><span>Delivery notes</span><textarea className="textarea" value={f.notes} onChange={up('notes')} placeholder="Gift packaging, signature required…" /></label>
            </div>
          </motion.section>
          <section className="panel">
            <h3><i>2</i> Delivery method</h3>
            <div style={{ display: 'grid', gap: 10 }}>
              <button type="button" className={`choice ${delivery === 'standard' ? 'on' : ''}`} onClick={() => setDelivery('standard')}><span className="r" /><div style={{ flex: 1 }}>Standard insured delivery<small>3–5 business days · climate-controlled cargo</small></div><b>FREE</b></button>
              <button type="button" className={`choice ${delivery === 'express' ? 'on' : ''}`} onClick={() => setDelivery('express')}><span className="r" /><div style={{ flex: 1 }}>Express priority air courier<small>1–2 business days · dedicated courier</small></div><b>$15.00</b></button>
            </div>
          </section>
          <section className="panel">
            <h3><i>3</i> Payment</h3>
            <div style={{ display: 'grid', gap: 10 }}>
              <button type="button" className={`choice ${pay === 'cod' ? 'on' : ''}`} onClick={() => setPay('cod')}><span className="r" /><div style={{ flex: 1 }}>Cash on delivery<small>Pay upon doorstep physical delivery</small></div></button>
              <button type="button" className={`choice ${pay === 'card' ? 'on' : ''}`} onClick={() => setPay('card')}><span className="r" /><div style={{ flex: 1 }}>Credit / debit card<small>Visa · Mastercard · Amex</small></div></button>
              {pay === 'card' && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} style={{ display: 'grid', gap: 12, padding: '6px 2px' }}>
                  <label className="field"><span>Card number</span><input className="input" inputMode="numeric" required value={card.number} onChange={(e) => setCard({ ...card, number: fmtCard(e.target.value) })} placeholder="4242 4242 4242 4242" /></label>
                  <div className="grid2"><label className="field"><span>Expiry</span><input className="input" required value={card.exp} onChange={(e) => setCard({ ...card, exp: e.target.value })} placeholder="MM / YY" /></label><label className="field"><span>CVC</span><input className="input" required maxLength={4} value={card.cvc} onChange={(e) => setCard({ ...card, cvc: e.target.value.replace(/\D/g, '') })} placeholder="•••" /></label></div>
                  <p className="muted" style={{ fontSize: 12 }}>Demo checkout: card details are validated for format only and never stored — only the last 4 digits are kept on the order.</p>
                </motion.div>
              )}
            </div>
          </section>
        </div>

        <aside className="summary panel">
          <h3 style={{ fontFamily: 'var(--serif)', fontSize: 24, fontWeight: 500 }}>Curated order bag</h3>
          {bag.map((l) => <div className="line" key={l.key} style={{ gridTemplateColumns: '56px 1fr auto', padding: '10px 0' }}><img src={l.image} alt="" style={{ width: 56, height: 68 }} /><div><h4>{l.name}</h4><small>Qty {l.qty}{l.options.map((o) => ` · ${o.label}`).join('')}</small></div><b>{money(l.price * l.qty)}</b></div>)}
          <div className="coupon-row"><input className="input" style={{ height: 42 }} placeholder="Coupon code" value={code} onChange={(e) => setCode(e.target.value)} /><button type="button" className="btn btn-line btn-sm" style={{ height: 42 }} onClick={applyCoupon}>Apply</button></div>
          {coupon && <p style={{ color: 'var(--ok)', fontSize: 13, marginTop: -6, marginBottom: 6 }}>✓ {coupon.code} applied</p>}
          <div className="sum-row"><span>Subtotal</span><span>{money(subtotal)}</span></div>
          {discount > 0 && <div className="sum-row" style={{ color: 'var(--ok)' }}><span>Discount</span><span>−{money(discount)}</span></div>}
          <div className="sum-row"><span>Delivery</span><span>{ship ? money(ship) : 'Free'}</span></div>
          <div className="sum-row total"><span>Total</span><span>{money(total)}</span></div>
          <button className="btn btn-primary btn-block" style={{ marginTop: 18 }} disabled={busy}>{busy ? 'Placing order…' : `Place order · ${money(total)}`}</button>
          <p className="muted" style={{ fontSize: 12, marginTop: 10, textAlign: 'center' }}>Each piece includes a certificate of authenticity.</p>
        </aside>
      </form>
    </div>
  );
}
