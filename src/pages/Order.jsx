import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import api, { money } from '../api';
import { CatChip } from '../components/Bits';
import Icon from '../components/Icons';

export default function Order() {
  const { id } = useParams();
  const { state } = useLocation();
  const [d, setD] = useState(null), [err, setErr] = useState(false);
  useEffect(() => { api.get(`/orders/${id}`).then((r) => setD(r.data)).catch(() => setErr(true)); }, [id]);
  if (err) return <div className="wrap empty" style={{ padding: '8rem 0' }}><h2>Order not found</h2><Link to="/account" className="btn btn-primary" style={{ marginTop: 20 }}>My orders</Link></div>;
  if (!d) return <div className="wrap empty" style={{ padding: '8rem 0' }}>Loading…</div>;
  const o = d.order;
  const eta = new Date(o.createdAt); eta.setDate(eta.getDate() + (o.delivery === 'express' ? 2 : 5));
  const msg = decodeURIComponent(d.whatsapp.split('?text=')[1] || '');

  return (
    <div className="wrap" style={{ padding: '3rem var(--margin) 0' }}>
      <div className="success">
        <motion.div className="check-anim" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 220, damping: 14 }}>
          <svg viewBox="0 0 24 24"><motion.path d="M5 12.500l4.500 4.500L19 7.500" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.3, duration: 0.6 }} /></svg>
        </motion.div>
        <span className="eyebrow">{state?.fresh ? 'Acquisition confirmed' : `Order ${o.status}`}</span>
        <h1 className="display" style={{ fontSize: 'clamp(32px,4.4vw,52px)', margin: '10px 0' }}>{state?.fresh ? 'Order Placed Successfully!' : `Order #${o.orderNo}`}</h1>
        <p className="muted">Thank you, <b style={{ color: 'var(--ink)' }}>{o.shipping.name}</b>. We have initiated curation and bespoke fulfillment under reference <b style={{ color: 'var(--ink)' }}>#{o.orderNo}</b>.</p>
        <div className="facts">
          <div><span className="label muted">Order reference</span><b>#{o.orderNo}</b></div>
          <div><span className="label muted">Total</span><b>{money(o.total)}</b></div>
          <div><span className="label muted">Settlement</span><b>{o.paymentMethod === 'card' ? `Card (**** ${o.cardLast4})` : 'Cash on delivery'}</b></div>
          <div><span className="label muted">Estimated arrival</span><b>{eta.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</b></div>
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="btn btn-line" onClick={() => window.print()}>Download receipt (PDF)</button>
          <Link to="/account" className="btn btn-primary">Track my order</Link>
          <Link to="/shop" className="btn btn-line">Continue shopping</Link>
        </div>

        <div className="panel" style={{ textAlign: 'left', marginTop: 36 }} id="receipt">
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, marginBottom: 14 }}><b style={{ fontFamily: 'var(--serif)', fontSize: 22 }}>AURA Atelier — Receipt</b><span className={`status st-${o.status}`}>{o.status}</span></div>
          <p className="muted" style={{ fontSize: 13, marginBottom: 14 }}>Ship to: {o.shipping.name}, {o.shipping.street}, {o.shipping.city} {o.shipping.postal}, {o.shipping.country} · {o.shipping.phone}</p>
          {o.items.map((i, k) => (
            <div key={k} className="line" style={{ gridTemplateColumns: '56px 1fr auto', padding: '10px 0' }}><img src={i.image} alt="" style={{ width: 56, height: 68 }} />
              <div><h4>{i.name}</h4><CatChip cat={i.category} /> <small>Qty {i.qty}{i.options?.map((x) => ` · ${x.label}`).join('')}</small></div><b>{money(i.price * i.qty)}</b></div>
          ))}
          <div className="sum-row" style={{ marginTop: 10 }}><span>Subtotal</span><span>{money(o.subtotal)}</span></div>
          {o.discount > 0 && <div className="sum-row"><span>Discount {o.coupon && `(${o.coupon})`}</span><span>−{money(o.discount)}</span></div>}
          <div className="sum-row"><span>Delivery</span><span>{o.shippingFee ? money(o.shippingFee) : 'Free'}</span></div>
          <div className="sum-row total"><span>Total paid</span><span>{money(o.total)}</span></div>
        </div>

        <div className="wa-card">
          <div className="wa-head"><Icon n="wa" size={26} /><div><b>Products World | Admin concierge</b><div style={{ fontSize: 12, opacity: .85 }}>Order alert ready to send to the atelier</div></div></div>
          <div className="wa-msg"><div>{msg}</div></div>
          <a className="wa-go" href={d.whatsapp} target="_blank" rel="noreferrer"><Icon n="wa" size={18} /> Send order details on WhatsApp</a>
        </div>
      </div>
      <style>{`@media print { .header, .topbar, .realms, .footer, .wa-card, .success > :not(.panel):not(.facts) { display: none !important; } }`}</style>
    </div>
  );
}
