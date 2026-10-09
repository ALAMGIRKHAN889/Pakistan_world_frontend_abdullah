import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import api, { CATS, money } from '../api';
import ProductCard from '../components/ProductCard';
import { GridSkel } from '../components/Bits';
import Icon from '../components/Icons';

const SORTS = [['featured', 'Featured'], ['newest', 'Newest'], ['price-asc', 'Price: low to high'], ['price-desc', 'Price: high to low'], ['rating', 'Top rated'], ['popular', 'Best selling']];
const FLAGS = { trending: 'Trending Now', newArrival: 'New Arrivals', bestSeller: 'Best Sellers', featured: 'Featured' };

export default function Shop() {
  const { cat } = useParams();
  const [sp, setSp] = useSearchParams();
  const [data, setData] = useState(null), [facets, setFacets] = useState(null), [show, setShow] = useState(false);
  const q = sp.get('q') || '', sort = sp.get('sort') || 'featured', page = +sp.get('page') || 1, flag = sp.get('flag') || '', badge = sp.get('badge') || '';
  const max = sp.get('max') || '', inStock = sp.get('inStock') === 'true', minRating = sp.get('minRating') || '';
  const cats = (cat ? [cat] : (sp.get('category') || '').split(',').filter(Boolean));

  useEffect(() => { api.get('/products/facets').then((r) => setFacets(r.data)); }, []);
  useEffect(() => {
    setData(null);
    api.get('/products', { params: { category: cats.join(',') || undefined, q: q || undefined, sort, page, limit: 12, flag: flag || undefined, badge: badge || undefined, max: max || undefined, inStock: inStock || undefined, minRating: minRating || undefined } })
      .then((r) => setData(r.data)).catch(() => setData({ items: [], total: 0, pages: 1 }));
  }, [cat, q, sort, page, flag, badge, max, inStock, minRating, sp.get('category')]);

  const set = (patch) => { const n = new URLSearchParams(sp); Object.entries({ page: '', ...patch }).forEach(([k, v]) => (v ? n.set(k, v) : n.delete(k))); setSp(n, { replace: true }); };
  const title = cat ? CATS[cat]?.label : q ? `Results for “${q}”` : FLAGS[flag] || (badge === 'sale' ? 'The Sale' : 'All Collections');
  const count = (c) => facets?.categories?.find((x) => x._id === c)?.count || 0;
  const pmax = facets?.price?.max || 1000;
  const toggleCat = (c) => { const s = new Set(cats); s.has(c) ? s.delete(c) : s.add(c); set({ category: [...s].join(',') }); };

  return (
    <div className="wrap">
      <div className="page-head">
        <div className="crumbs"><Link to="/">Home</Link>/<Link to="/shop">Shop</Link>{cat && <>/<span>{CATS[cat]?.label}</span></>}</div>
        <motion.h1 key={title} className="display" style={{ fontSize: 'clamp(34px,4.4vw,56px)' }} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>{title}</motion.h1>
        {cat && <p className="muted" style={{ marginTop: 8 }}>{CATS[cat].realm} — curated by Products World</p>}
        <div className="tabs" style={{ marginTop: 20 }}>
          <Link to="/shop" className={`pill-btn ${!cat ? 'on' : ''}`} style={{ display: 'inline-flex', alignItems: 'center' }}>All</Link>
          {Object.entries(CATS).map(([k, c]) => <Link key={k} to={`/shop/${k}`} className={`pill-btn ${cat === k ? 'on' : ''}`} style={{ display: 'inline-flex', alignItems: 'center' }}>{c.label}</Link>)}
        </div>
      </div>

      <div className="shop-layout" style={{ paddingBottom: 40 }}>
        <aside className={`filters ${show ? 'show' : ''}`}>
          {!cat && <div><h4>Category</h4>{Object.entries(CATS).map(([k, c]) => <label key={k} className="check"><input type="checkbox" checked={cats.includes(k)} onChange={() => toggleCat(k)} />{c.label}<em>{count(k)}</em></label>)}</div>}
          <div><h4>Max price · <span style={{ color: 'var(--gold-ink)' }}>{max ? money(max) : money(pmax)}</span></h4>
            <input className="range" type="range" min={Math.floor(facets?.price?.min || 0)} max={Math.ceil(pmax)} step="10" value={max || pmax} onChange={(e) => set({ max: +e.target.value >= pmax ? '' : e.target.value })} /></div>
          <div><h4>Availability &amp; rating</h4>
            <label className="check"><input type="checkbox" checked={inStock} onChange={(e) => set({ inStock: e.target.checked ? 'true' : '' })} />In stock only</label>
            <label className="check"><input type="checkbox" checked={minRating === '4'} onChange={(e) => set({ minRating: e.target.checked ? '4' : '' })} />4★ &amp; up</label>
            <label className="check"><input type="checkbox" checked={badge === 'sale'} onChange={(e) => set({ badge: e.target.checked ? 'sale' : '' })} />On sale</label></div>
          <div><h4>Collections</h4>{Object.entries(FLAGS).map(([k, l]) => <label key={k} className="check"><input type="radio" name="flag" style={{ borderRadius: '50%' }} checked={flag === k} onChange={() => set({ flag: flag === k ? '' : k })} onClick={() => flag === k && set({ flag: '' })} />{l}</label>)}</div>
          <button className="btn btn-line btn-sm" onClick={() => setSp({}, { replace: true })}>Clear all filters</button>
        </aside>

        <div>
          <div className="toolbar">
            <button className="btn btn-line btn-sm filter-toggle" onClick={() => setShow((s) => !s)}>Filters</button>
            <span className="muted">{data ? `${data.total} piece${data.total === 1 ? '' : 's'}` : 'Loading…'}</span>
            <select className="select" style={{ width: 200, height: 40 }} value={sort} onChange={(e) => set({ sort: e.target.value })}>{SORTS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
          </div>
          {!data ? <GridSkel n={6} /> : data.items.length === 0 ? (
            <div className="empty"><h3>No pieces match your filters</h3><p>Try widening your search or clearing filters.</p><button className="btn btn-primary" style={{ marginTop: 18 }} onClick={() => setSp({}, { replace: true })}>Reset</button></div>
          ) : <div className="pgrid three">{data.items.map((p, i) => <ProductCard key={p._id} p={p} index={i} />)}</div>}
          {data && data.pages > 1 && (
            <div className="pager">{Array.from({ length: data.pages }).map((_, i) => <button key={i} className={`pill-btn ${page === i + 1 ? 'on' : ''}`} style={{ width: 40, padding: 0 }} onClick={() => { set({ page: i + 1 > 1 ? String(i + 1) : '' }); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>{i + 1}</button>)}</div>
          )}
        </div>
      </div>
    </div>
  );
}
