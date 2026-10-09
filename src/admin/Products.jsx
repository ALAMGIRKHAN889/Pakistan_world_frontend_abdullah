import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api, { CATS, money, errMsg } from '../api';
import { CatChip, Skel } from '../components/Bits';
import Icon from '../components/Icons';

const EMPTY = { name: '', category: 'watches', brand: 'Products World', price: '', comparePrice: '', stock: 10, description: '', images: [], tags: [], specs: [], options: [], badge: '', featured: false, trending: false, newArrival: false, bestSeller: false, active: true };

function Form({ initial, onClose, onSaved }) {
  const [f, setF] = useState({ ...EMPTY, ...initial, tags: initial.tags || [], specs: initial.specs || [] });
  const [url, setUrl] = useState(''), [busy, setBusy] = useState(false), [up, setUp] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });

  const upload = async (files) => {
    if (!files?.length) return; setUp(true);
    const fd = new FormData(); [...files].forEach((x) => fd.append('images', x));
    try { const { data } = await api.post('/admin/upload', fd); setF((x) => ({ ...x, images: [...x.images, ...data.urls] })); } catch (e) { toast.error(errMsg(e)); } finally { setUp(false); }
  };
  const save = async (e) => {
    e.preventDefault();
    if (!f.images.length) return toast.error('Add at least one image');
    setBusy(true);
    const body = { ...f, price: +f.price, comparePrice: +f.comparePrice || 0, stock: +f.stock, specs: f.specs.filter((s) => s.label && s.value) };
    try { initial._id ? await api.put(`/admin/products/${initial._id}`, body) : await api.post('/admin/products', body); toast.success('Product saved'); onSaved(); }
    catch (er) { toast.error(errMsg(er)); } finally { setBusy(false); }
  };
  const flags = [['featured', 'Featured'], ['trending', 'Trending'], ['newArrival', 'New arrival'], ['bestSeller', 'Best seller'], ['active', 'Visible in store']];
  return (
    <motion.div className="modal-bg" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <motion.form className="modal" onSubmit={save} initial={{ y: 30, scale: .97 }} animate={{ y: 0, scale: 1 }} exit={{ y: 20, opacity: 0 }}>
        <h2>{initial._id ? 'Edit product' : 'New product'}</h2>
        <div className="form-grid">
          <label className="field full"><span>Name</span><input className="input" required value={f.name} onChange={set('name')} /></label>
          <label className="field"><span>Realm</span><select className="select" value={f.category} onChange={set('category')}>{Object.entries(CATS).map(([k, c]) => <option key={k} value={k}>{c.label}</option>)}</select></label>
          <label className="field"><span>Brand</span><input className="input" value={f.brand} onChange={set('brand')} /></label>
          <label className="field"><span>Price ($)</span><input className="input" type="number" min="0" step="0.01" required value={f.price} onChange={set('price')} /></label>
          <label className="field"><span>Compare-at price ($)</span><input className="input" type="number" min="0" step="0.01" value={f.comparePrice} onChange={set('comparePrice')} /></label>
          <label className="field"><span>Stock</span><input className="input" type="number" min="0" required value={f.stock} onChange={set('stock')} /></label>
          <label className="field"><span>Badge (optional)</span><input className="input" value={f.badge || ''} onChange={set('badge')} placeholder="Limited Edition" /></label>
          <label className="field full"><span>Description</span><textarea className="textarea" value={f.description} onChange={set('description')} /></label>
          <label className="field full"><span>Tags (comma separated)</span><input className="input" value={f.tags.join(', ')} onChange={(e) => setF({ ...f, tags: e.target.value.split(',').map((t) => t.trim()).filter(Boolean) })} /></label>
          <div className="field full"><span>Images (first is the cover)</span>
            <div className="img-list">{f.images.map((s, i) => <div key={s + i}><img src={s} alt="" /><button type="button" onClick={() => setF({ ...f, images: f.images.filter((_, k) => k !== i) })}>×</button></div>)}</div>
            <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
              <input className="input" style={{ flex: 1, minWidth: 200 }} placeholder="Paste image URL…" value={url} onChange={(e) => setUrl(e.target.value)} />
              <button type="button" className="btn btn-line" onClick={() => { if (url.trim()) { setF({ ...f, images: [...f.images, url.trim()] }); setUrl(''); } }}>Add URL</button>
              <label className="btn btn-line" style={{ cursor: 'pointer' }}><Icon n="upload" size={16} />{up ? 'Uploading…' : 'Upload'}<input type="file" accept="image/*" multiple hidden onChange={(e) => upload(e.target.files)} /></label>
            </div></div>
          <div className="field full"><span>Specifications</span>
            {f.specs.map((s, i) => <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 6 }}><input className="input" placeholder="Label" value={s.label} onChange={(e) => setF({ ...f, specs: f.specs.map((x, k) => (k === i ? { ...x, label: e.target.value } : x)) })} /><input className="input" placeholder="Value" value={s.value} onChange={(e) => setF({ ...f, specs: f.specs.map((x, k) => (k === i ? { ...x, value: e.target.value } : x)) })} /><button type="button" className="sq" onClick={() => setF({ ...f, specs: f.specs.filter((_, k) => k !== i) })}><Icon n="x" size={14} /></button></div>)}
            <button type="button" className="btn btn-line btn-sm" style={{ justifySelf: 'start' }} onClick={() => setF({ ...f, specs: [...f.specs, { label: '', value: '' }] })}>+ Add specification</button></div>
          <div className="full" style={{ display: 'flex', gap: 18, flexWrap: 'wrap' }}>{flags.map(([k, l]) => <label className="check" key={k}><input type="checkbox" checked={!!f[k]} onChange={set(k)} />{l}</label>)}</div>
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 22 }}><button type="button" className="btn btn-line" onClick={onClose}>Cancel</button><button className="btn btn-primary" disabled={busy}>{busy ? 'Saving…' : 'Save product'}</button></div>
      </motion.form>
    </motion.div>
  );
}

export default function Products() {
  const [items, setItems] = useState(null), [q, setQ] = useState(''), [cat, setCat] = useState('');
  const [edit, setEdit] = useState(null);
  const [sp, setSp] = useSearchParams();
  const load = () => api.get('/admin/products', { params: { q: q || undefined, category: cat || undefined } }).then((r) => setItems(r.data.items));
  useEffect(() => { const t = setTimeout(load, 200); return () => clearTimeout(t); }, [q, cat]);
  useEffect(() => { if (sp.get('new')) { setEdit({}); setSp({}, { replace: true }); } }, []);
  const del = async (p) => { if (!confirm(`Delete "${p.name}"?`)) return; await api.delete(`/admin/products/${p._id}`); toast.success('Deleted'); load(); };
  const toggle = async (p) => { await api.put(`/admin/products/${p._id}`, { active: !p.active }); load(); };
  const open = async (p) => { const { data } = await api.get(`/admin/products/${p._id}`); setEdit(data.product); };

  return (
    <>
      <div className="adm-top"><div><h1>Products</h1><span className="muted">{items?.length ?? '…'} items</span></div><button className="btn btn-primary btn-sm" onClick={() => setEdit({})}><Icon n="plus" size={15} /> New product</button></div>
      <div className="adm-card">
        <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
          <input className="input" style={{ maxWidth: 280, height: 40 }} placeholder="Search products…" value={q} onChange={(e) => setQ(e.target.value)} />
          <select className="select" style={{ width: 170, height: 40 }} value={cat} onChange={(e) => setCat(e.target.value)}><option value="">All realms</option>{Object.entries(CATS).map(([k, c]) => <option key={k} value={k}>{c.label}</option>)}</select>
        </div>
        {!items ? <Skel h={300} /> : (
          <div className="tbl-wrap"><table className="tbl"><thead><tr><th>Product</th><th>Realm</th><th>Price</th><th>Stock</th><th>Sold</th><th>Visible</th><th /></tr></thead>
            <tbody>{items.map((p) => (
              <tr key={p._id}>
                <td><div className="cell"><img src={p.images?.[0]} alt="" /><div><b>{p.name}</b><div className="muted" style={{ fontSize: 12 }}>{p.sku}</div></div></div></td>
                <td><CatChip cat={p.category} /></td>
                <td>{money(p.price)}{p.comparePrice > 0 && <div className="was">{money(p.comparePrice)}</div>}</td>
                <td><span style={{ color: p.stock === 0 ? 'var(--err)' : p.stock <= 5 ? 'var(--warn)' : 'inherit', fontWeight: 600 }}>{p.stock}</span></td>
                <td>{p.sold}</td>
                <td><button className={`toggle ${p.active ? 'on' : ''}`} onClick={() => toggle(p)} aria-label="Toggle visibility" /></td>
                <td><div className="acts"><button className="sq" onClick={() => open(p)} aria-label="Edit"><Icon n="edit" size={15} /></button><button className="sq danger" onClick={() => del(p)} aria-label="Delete"><Icon n="trash" size={15} /></button></div></td>
              </tr>))}
              {!items.length && <tr><td colSpan="7" className="muted" style={{ textAlign: 'center', padding: 40 }}>No products found</td></tr>}</tbody></table></div>
        )}
      </div>
      <AnimatePresence>{edit && <Form key={edit._id || 'new'} initial={edit} onClose={() => setEdit(null)} onSaved={() => { setEdit(null); load(); }} />}</AnimatePresence>
    </>
  );
}
