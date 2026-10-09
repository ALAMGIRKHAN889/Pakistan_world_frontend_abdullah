import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api, { money, errMsg } from '../api';
import { Skel } from '../components/Bits';
import Icon from '../components/Icons';

const STATUSES = ['placed', 'processing', 'shipped', 'delivered', 'cancelled'];

function Detail({ order, onClose, onChange }) {
  const [o, setO] = useState(order), [wa, setWa] = useState('');
  const upd = async (patch) => {
    try { const { data } = await api.put(`/admin/orders/${o._id}`, patch); setO({ ...o, ...data.order, user: o.user }); setWa(data.whatsapp); onChange(); toast.success('Order updated'); } catch (e) { toast.error(errMsg(e)); }
  };
  const phone = (o.shipping.phone || '').replace(/[^\d]/g, '');
  return (
    <motion.div className="modal-bg" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <motion.div className="modal" initial={{ y: 30 }} animate={{ y: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}><div><h2 style={{ marginBottom: 4 }}>Order #{o.orderNo}</h2><span className="muted">{new Date(o.createdAt).toLocaleString()}</span></div><button className="sq" onClick={onClose}><Icon n="x" size={16} /></button></div>
        <div className="adm-grid eq" style={{ margin: '18px 0' }}>
          <div><h3 style={{ fontFamily: 'var(--sans)', fontSize: 14, marginBottom: 8 }}>Customer</h3><dl className="kv"><dt>Name</dt><dd>{o.shipping.name}</dd><dt>Email</dt><dd>{o.shipping.email}</dd><dt>Phone</dt><dd>{o.shipping.phone}</dd><dt>Address</dt><dd>{o.shipping.street}, {o.shipping.city} {o.shipping.postal}, {o.shipping.country}</dd>{o.shipping.notes && <><dt>Notes</dt><dd>{o.shipping.notes}</dd></>}</dl></div>
          <div><h3 style={{ fontFamily: 'var(--sans)', fontSize: 14, marginBottom: 8 }}>Payment & delivery</h3><dl className="kv"><dt>Method</dt><dd>{o.paymentMethod === 'card' ? `Card •••• ${o.cardLast4}` : 'Cash on delivery'}</dd><dt>Payment</dt><dd>
            <select className="select" style={{ height: 34 }} value={o.paymentStatus} onChange={(e) => upd({ paymentStatus: e.target.value })}>{['pending', 'paid', 'refunded'].map((s) => <option key={s}>{s}</option>)}</select></dd><dt>Delivery</dt><dd>{o.delivery}</dd>{o.coupon && <><dt>Coupon</dt><dd>{o.coupon}</dd></>}</dl></div>
        </div>
        <table className="tbl"><tbody>{o.items.map((i, k) => <tr key={k}><td><div className="cell"><img src={i.image} alt="" /><div>{i.name}<div className="muted" style={{ fontSize: 12 }}>{i.options?.map((x) => x.label).join(' · ')}</div></div></div></td><td>×{i.qty}</td><td style={{ textAlign: 'right' }}>{money(i.price * i.qty)}</td></tr>)}</tbody></table>
        <div style={{ textAlign: 'right', margin: '12px 0', fontSize: 14 }}>Subtotal {money(o.subtotal)} · Discount −{money(o.discount)} · Delivery {money(o.shippingFee)}<div style={{ fontFamily: 'var(--serif)', fontSize: 24, fontWeight: 600 }}>{money(o.total)}</div></div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', borderTop: '1px solid var(--line)', paddingTop: 16 }}>
          <span className="label muted">Status</span>
          {STATUSES.map((s) => <button key={s} className={`pill-btn ${o.status === s ? 'on' : ''}`} onClick={() => o.status !== s && upd({ status: s })}>{s}</button>)}
          <span style={{ flex: 1 }} />
          {phone && <a className="btn btn-sm" style={{ background: '#25d366', color: '#052e16' }} target="_blank" rel="noreferrer" href={`https://wa.me/${phone}?text=${encodeURIComponent(`Hello ${o.shipping.name}, your AURA Atelier order #${o.orderNo} is now ${o.status}. Thank you!`)}`}><Icon n="wa" size={15} /> WhatsApp customer</a>}
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function Orders() {
  const [orders, setOrders] = useState(null), [status, setStatus] = useState(''), [q, setQ] = useState(''), [sel, setSel] = useState(null);
  const load = () => api.get('/admin/orders', { params: { status: status || undefined, q: q || undefined } }).then((r) => setOrders(r.data.orders));
  useEffect(() => { const t = setTimeout(load, 200); return () => clearTimeout(t); }, [status, q]);
  return (
    <>
      <div className="adm-top"><div><h1>Orders</h1><span className="muted">{orders?.length ?? '…'} orders</span></div></div>
      <div className="adm-card">
        <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
          <input className="input" style={{ maxWidth: 260, height: 40 }} placeholder="Search order # or name…" value={q} onChange={(e) => setQ(e.target.value)} />
          <button className={`pill-btn ${!status ? 'on' : ''}`} onClick={() => setStatus('')}>All</button>
          {STATUSES.map((s) => <button key={s} className={`pill-btn ${status === s ? 'on' : ''}`} onClick={() => setStatus(s)}>{s}</button>)}
        </div>
        {!orders ? <Skel h={300} /> : (
          <div className="tbl-wrap"><table className="tbl"><thead><tr><th>Order</th><th>Customer</th><th>Date</th><th>Payment</th><th>Total</th><th>Status</th></tr></thead>
            <tbody>{orders.map((o) => (
              <tr key={o._id} style={{ cursor: 'pointer' }} onClick={() => setSel(o)}>
                <td><b>#{o.orderNo}</b><div className="muted" style={{ fontSize: 12 }}>{o.items.length} item(s)</div></td>
                <td>{o.shipping.name}<div className="muted" style={{ fontSize: 12 }}>{o.shipping.city}</div></td>
                <td>{new Date(o.createdAt).toLocaleDateString()}</td>
                <td>{o.paymentMethod.toUpperCase()} · <span style={{ color: o.paymentStatus === 'paid' ? 'var(--ok)' : 'var(--warn)' }}>{o.paymentStatus}</span></td>
                <td><b>{money(o.total)}</b></td><td><span className={`status st-${o.status}`}>{o.status}</span></td>
              </tr>))}
              {!orders.length && <tr><td colSpan="6" className="muted" style={{ textAlign: 'center', padding: 40 }}>No orders</td></tr>}</tbody></table></div>
        )}
      </div>
      <AnimatePresence>{sel && <Detail key={sel._id} order={sel} onClose={() => setSel(null)} onChange={load} />}</AnimatePresence>
    </>
  );
}
