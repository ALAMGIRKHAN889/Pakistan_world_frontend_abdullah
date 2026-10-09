import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api, { money, errMsg } from '../api';
import Icon from '../components/Icons';

export default function Coupons() {
  const [list, setList] = useState([]);
  const [f, setF] = useState({ code: '', type: 'percent', value: '', minSubtotal: '' });
  const load = () => api.get('/admin/coupons').then((r) => setList(r.data.coupons));
  useEffect(() => { load(); }, []);
  const add = async (e) => {
    e.preventDefault();
    try { await api.post('/admin/coupons', { ...f, value: +f.value, minSubtotal: +f.minSubtotal || 0 }); setF({ code: '', type: 'percent', value: '', minSubtotal: '' }); toast.success('Coupon created'); load(); } catch (er) { toast.error(errMsg(er)); }
  };
  return (
    <>
      <div className="adm-top"><div><h1>Coupons</h1><span className="muted">Discount codes for checkout</span></div></div>
      <form className="adm-card" onSubmit={add} style={{ display: 'flex', gap: 12, alignItems: 'end', flexWrap: 'wrap', marginBottom: 16 }}>
        <label className="field"><span>Code</span><input className="input" required value={f.code} onChange={(e) => setF({ ...f, code: e.target.value.toUpperCase() })} /></label>
        <label className="field"><span>Type</span><select className="select" value={f.type} onChange={(e) => setF({ ...f, type: e.target.value })}><option value="percent">Percent %</option><option value="fixed">Fixed $</option></select></label>
        <label className="field"><span>Value</span><input className="input" type="number" min="1" required value={f.value} onChange={(e) => setF({ ...f, value: e.target.value })} /></label>
        <label className="field"><span>Min. subtotal ($)</span><input className="input" type="number" min="0" value={f.minSubtotal} onChange={(e) => setF({ ...f, minSubtotal: e.target.value })} /></label>
        <button className="btn btn-primary"><Icon n="plus" size={15} /> Create</button>
      </form>
      <div className="adm-card"><div className="tbl-wrap"><table className="tbl"><thead><tr><th>Code</th><th>Discount</th><th>Min. spend</th><th>Used</th><th>Active</th><th /></tr></thead>
        <tbody>{list.map((c) => (
          <tr key={c._id}><td><b style={{ letterSpacing: '.06em' }}>{c.code}</b></td><td>{c.type === 'percent' ? `${c.value}%` : money(c.value)}</td><td>{c.minSubtotal ? money(c.minSubtotal) : '—'}</td><td>{c.used}</td>
            <td><button className={`toggle ${c.active ? 'on' : ''}`} onClick={async () => { await api.put(`/admin/coupons/${c._id}`, { active: !c.active }); load(); }} aria-label="Toggle" /></td>
            <td><div className="acts"><button className="sq danger" onClick={async () => { if (confirm('Delete coupon?')) { await api.delete(`/admin/coupons/${c._id}`); load(); } }}><Icon n="trash" size={15} /></button></div></td></tr>))}</tbody></table></div></div>
    </>
  );
}
