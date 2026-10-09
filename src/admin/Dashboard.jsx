import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api, { CATS, money, money0 } from '../api';
import { CountUp, Skel } from '../components/Bits';
import Icon from '../components/Icons';

function Chart({ data }) {
  const [hover, setHover] = useState(null);
  const W = 700, H = 240, pad = { l: 44, r: 12, t: 14, b: 26 };
  const max = Math.max(10, ...data.map((d) => d.revenue)) * 1.15;
  const x = (i) => pad.l + (i / (data.length - 1)) * (W - pad.l - pad.r);
  const y = (v) => pad.t + (1 - v / max) * (H - pad.t - pad.b);
  const line = data.map((d, i) => `${i ? 'L' : 'M'}${x(i)},${y(d.revenue)}`).join(' ');
  const area = `${line} L${x(data.length - 1)},${H - pad.b} L${x(0)},${H - pad.b} Z`;
  const ticks = [0, .25, .5, .75, 1].map((t) => t * max);
  return (
    <div style={{ position: 'relative' }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto' }} onMouseLeave={() => setHover(null)}
        onMouseMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); const px = ((e.clientX - r.left) / r.width) * W; setHover(Math.max(0, Math.min(data.length - 1, Math.round(((px - pad.l) / (W - pad.l - pad.r)) * (data.length - 1))))); }}>
        <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#d4af37" stopOpacity=".38" /><stop offset="1" stopColor="#d4af37" stopOpacity="0" /></linearGradient></defs>
        {ticks.map((t) => <g key={t}><line x1={pad.l} x2={W - pad.r} y1={y(t)} y2={y(t)} stroke="var(--line)" /><text x={pad.l - 8} y={y(t) + 4} fontSize="10" textAnchor="end" fill="var(--muted)">{money0(t)}</text></g>)}
        {data.map((d, i) => i % 6 === 0 && <text key={d.date} x={x(i)} y={H - 6} fontSize="10" textAnchor="middle" fill="var(--muted)">{d.date.slice(5)}</text>)}
        <motion.path d={area} fill="url(#g)" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }} />
        <motion.path d={line} fill="none" stroke="var(--gold-ink)" strokeWidth="2.2" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.4, ease: 'easeInOut' }} />
        {hover !== null && <g><line x1={x(hover)} x2={x(hover)} y1={pad.t} y2={H - pad.b} stroke="var(--ink)" strokeDasharray="3 3" opacity=".3" /><circle cx={x(hover)} cy={y(data[hover].revenue)} r="5" fill="var(--white)" stroke="var(--gold-ink)" strokeWidth="2.200" /></g>}
      </svg>
      {hover !== null && <div style={{ position: 'absolute', top: 0, right: 0, background: 'var(--ink)', color: 'var(--inv)', padding: '8px 12px', borderRadius: 6, fontSize: 12 }}><b>{data[hover].date}</b><br />{money(data[hover].revenue)} · {data[hover].orders} orders</div>}
    </div>
  );
}

export default function Dashboard() {
  const [s, setS] = useState(null);
  useEffect(() => { api.get('/admin/stats').then((r) => setS(r.data)); }, []);
  const catMax = useMemo(() => Math.max(1, ...(s?.byCategory || []).map((c) => c.revenue)), [s]);
  if (!s) return <><h1 style={{ fontSize: 32, marginBottom: 26 }}>Dashboard</h1><div className="kpis">{[0, 1, 2, 3].map((i) => <Skel key={i} h={100} />)}</div><Skel h={300} /></>;
  const last30 = s.series.reduce((a, d) => a + d.revenue, 0);
  const K = [['Total revenue', s.revenue, '$', 'receipt', 2], ['Orders', s.orders, '', 'box', 0], ['Customers', s.customers, '', 'users', 0], ['Products', s.products, '', 'tag', 0]];
  return (
    <>
      <div className="adm-top"><div><h1>Dashboard</h1><span className="muted">Last 30 days · {money(last30)} revenue</span></div><Link to="/admin/products?new=1" className="btn btn-primary btn-sm"><Icon n="plus" size={15} /> New product</Link></div>
      <div className="kpis">
        {K.map(([l, v, pre, ic, dec], i) => <motion.div key={l} className="adm-card kpi" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}><span className="ic"><Icon n={ic} size={18} /></span><span className="label muted">{l}</span><div className="v"><CountUp to={v} prefix={pre} decimals={dec} /></div></motion.div>)}
      </div>
      <div className="adm-grid">
        <div className="adm-card"><h3>Revenue</h3><Chart data={s.series} /></div>
        <div className="adm-card"><h3>Sales by realm</h3>
          {s.byCategory.length === 0 && <p className="muted">No sales yet.</p>}
          {s.byCategory.map((c) => <div className="bar-row" key={c._id}><span>{CATS[c._id]?.label || c._id}</span><div className="bar"><motion.i initial={{ width: 0 }} animate={{ width: `${(c.revenue / catMax) * 100}%` }} transition={{ duration: 1 }} style={{ background: CATS[c._id]?.color || '#999' }} /></div><b>{money0(c.revenue)}</b></div>)}
          <h3 style={{ marginTop: 22 }}>Order status</h3>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>{s.status.map((x) => <span key={x._id} className={`status st-${x._id}`}>{x._id} · {x.count}</span>)}</div>
        </div>
      </div>
      <div className="adm-grid eq">
        <div className="adm-card"><h3>Recent orders <Link to="/admin/orders" className="ghost">All</Link></h3>
          <div className="tbl-wrap"><table className="tbl"><tbody>{s.recent.map((o) => <tr key={o._id}><td><b>#{o.orderNo}</b><div className="muted" style={{ fontSize: 12 }}>{o.shipping?.name}</div></td><td><span className={`status st-${o.status}`}>{o.status}</span></td><td style={{ textAlign: 'right' }}><b>{money(o.total)}</b></td></tr>)}{!s.recent.length && <tr><td className="muted">No orders yet</td></tr>}</tbody></table></div></div>
        <div className="adm-card"><h3>Low stock</h3>
          <table className="tbl"><tbody>{s.lowStock.map((p) => <tr key={p._id}><td><div className="cell"><img src={p.images?.[0]} alt="" />{p.name}</div></td><td style={{ textAlign: 'right' }}><span className="status" style={{ background: p.stock ? '#fff7ed' : '#fef2f2', color: p.stock ? '#c2410c' : '#b91c1c' }}>{p.stock} left</span></td></tr>)}{!s.lowStock.length && <tr><td className="muted">All stocked ✓</td></tr>}</tbody></table></div>
      </div>
      <div className="adm-card"><h3>Top sellers</h3><table className="tbl"><tbody>{s.top.map((p) => <tr key={p._id}><td><div className="cell"><img src={p.images?.[0]} alt="" />{p.name}</div></td><td>{CATS[p.category]?.label}</td><td>{money(p.price)}</td><td style={{ textAlign: 'right' }}><b>{p.sold}</b> sold</td></tr>)}</tbody></table></div>
    </>
  );
}
