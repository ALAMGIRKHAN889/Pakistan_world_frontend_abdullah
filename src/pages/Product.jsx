import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api, { CATS, money, errMsg } from '../api';
import { useShop } from '../context/ShopContext';
import { useAuth } from '../context/AuthContext';
import ProductCard from '../components/ProductCard';
import { CatChip, Reveal, Skel, Stars } from '../components/Bits';
import Icon from '../components/Icons';
import { useNavigate } from 'react-router-dom';

const TABS = ['Specifications', 'Curation & story', 'Verified reviews', 'Dispatch & returns'];

export default function Product() {
  const { slug } = useParams();
  const nav = useNavigate();
  const { add, toggleWish, wishIds } = useShop();
  const { user } = useAuth();
  const [d, setD] = useState(null), [err, setErr] = useState(false);
  const [img, setImg] = useState(0), [zoom, setZoom] = useState(null), [qty, setQty] = useState(1), [sel, setSel] = useState({}), [tab, setTab] = useState(0);
  const [rv, setRv] = useState({ rating: 5, comment: '' });

  useEffect(() => {
    setD(null); setErr(false); setImg(0); setQty(1); setTab(0);
    api.get(`/products/${slug}`).then((r) => {
      setD(r.data);
      const s = {}; r.data.product.options?.forEach((o) => (s[o.name] = o.values[0]?.label)); setSel(s);
    }).catch(() => setErr(true));
  }, [slug]);

  const p = d?.product;
  const { unit, opts } = useMemo(() => {
    if (!p) return { unit: 0, opts: [] };
    let u = p.price; const o = [];
    p.options?.forEach((g) => { const v = g.values.find((x) => x.label === sel[g.name]); if (v) { u += v.priceDelta || 0; o.push({ name: g.name, label: v.label }); } });
    return { unit: u, opts: o };
  }, [p, sel]);

  if (err) return <div className="wrap empty" style={{ padding: '8rem 0' }}><h2>Piece not found</h2><Link to="/shop" className="btn btn-primary" style={{ marginTop: 20 }}>Back to shop</Link></div>;
  if (!p) return <div className="wrap" style={{ padding: '3rem var(--margin)' }}><div className="pdp"><Skel h={600} /><Skel h={500} /></div></div>;

  const off = p.comparePrice > p.price ? Math.round((1 - p.price / p.comparePrice) * 100) : 0;
  const on = wishIds.has(String(p._id));
  const move = (e) => { const r = e.currentTarget.getBoundingClientRect(); setZoom({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 }); };
  const submitReview = async (e) => {
    e.preventDefault();
    try { const r = await api.post(`/products/${p._id}/reviews`, rv); setD({ ...d, product: r.data.product }); setRv({ rating: 5, comment: '' }); toast.success('Thank you for your review'); } catch (er) { toast.error(errMsg(er)); }
  };
  const buyNow = () => { add(p, qty, opts, unit); nav('/checkout'); };

  return (
    <div className="wrap" style={{ paddingTop: 28 }}>
      <div className="crumbs"><Link to="/">Home</Link>/<Link to={`/shop/${p.category}`}>{CATS[p.category].label}</Link>/<span>{p.name}</span></div>
      <div className="pdp">
        <div className="gallery">
          <div className="thumbs">{p.images.map((s, i) => <button key={i} className={i === img ? 'on' : ''} onClick={() => setImg(i)} aria-label={`View image ${i + 1}`}><img src={s} alt="" /></button>)}</div>
          <div className={`mainpic ${zoom ? 'zoom' : ''}`} onMouseMove={move} onMouseLeave={() => setZoom(null)} onMouseEnter={move}>
            <AnimatePresence mode="wait"><motion.img key={img} src={p.images[img]} alt={p.name} style={zoom ? { transformOrigin: `${zoom.x}% ${zoom.y}%` } : undefined} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} /></AnimatePresence>
          </div>
        </div>

        <motion.div className="buybox" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}><span className="label" style={{ color: 'var(--gold-ink)' }}>{p.brand}</span><CatChip cat={p.category} />{p.badge && <span className="chip" style={{ background: 'var(--ink)', color: '#fff' }}>{p.badge}</span>}</div>
          <h1>{p.name}</h1>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>{p.numReviews > 0 ? <><Stars value={p.rating} /><b>{p.rating}</b><a href="#reviews" onClick={() => setTab(2)} className="muted" style={{ textDecoration: 'underline', fontSize: 13 }}>({p.numReviews} verified reviews)</a></> : <span className="muted" style={{ fontSize: 13 }}>No reviews yet</span>}</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, margin: '1rem 0 .4rem', flexWrap: 'wrap' }}>
            <motion.span key={unit} className="big" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>{money(unit)}</motion.span>
            {off > 0 && <><span className="was" style={{ fontSize: 17 }}>{money(p.comparePrice)}</span><span className="chip" style={{ background: 'var(--gold)' }}>Save {off}%</span></>}
          </div>
          <div style={{ fontSize: 14 }} className={p.stock > 5 ? 'stock-ok' : p.stock > 0 ? 'stock-low' : 'muted'}>
            <span className="dot-s" />{p.stock > 5 ? 'In stock' : p.stock > 0 ? `Only ${p.stock} pieces remaining` : 'Currently sold out'}
          </div>
          <p className="muted" style={{ margin: '1rem 0 0', color: 'var(--charcoal)' }}>{p.description}</p>

          {p.options?.map((g) => (
            <div className="opt" key={g.name}>
              <div className="label"><span>{g.name}</span><span>{sel[g.name]}</span></div>
              <div className="opt-row">{g.values.map((v) => <button key={v.label} className={sel[g.name] === v.label ? 'on' : ''} onClick={() => setSel({ ...sel, [g.name]: v.label })}>{v.label}<small>{v.priceDelta ? `+${money(v.priceDelta)}` : 'Included'}</small></button>)}</div>
            </div>
          ))}

          <div className="buy-row">
            <div className="qty"><button onClick={() => setQty(Math.max(1, qty - 1))} aria-label="Less">−</button><span>{qty}</span><button onClick={() => setQty(Math.min(p.stock || 1, qty + 1))} aria-label="More">+</button></div>
            <button className="btn btn-primary" style={{ flex: 1 }} disabled={p.stock < 1} onClick={() => add(p, qty, opts, unit)}><Icon n="bag" size={17} /> Add to bag · {money(unit * qty)}</button>
          </div>
          <button className="btn btn-gold btn-block" style={{ marginTop: 10 }} disabled={p.stock < 1} onClick={buyNow}>Buy now — express checkout</button>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16, fontSize: 13 }}>
            <button onClick={() => toggleWish(p)} style={{ display: 'flex', gap: 8, alignItems: 'center' }}><Icon n="heart" size={17} style={{ fill: on ? 'var(--gold)' : 'none', color: on ? 'var(--gold)' : 'inherit' }} /> {on ? 'Saved' : 'Save to wishlist'}</button>
            <button onClick={() => { navigator.clipboard?.writeText(location.href); toast.success('Link copied'); }}>Share</button>
          </div>
          <div className="assure"><span><Icon n="truck" size={15} /> Dispatched within 24h</span><span><Icon n="shield" size={15} /> Authenticity guaranteed</span><span><Icon n="return" size={15} /> 30-day returns</span></div>
          <div className="label muted" style={{ marginTop: 14, fontSize: 10 }}>SKU {p.sku}</div>
        </motion.div>
      </div>

      <div className="ptabs" id="reviews">{TABS.map((t, i) => <button key={t} className={`pill-btn ${tab === i ? 'on' : ''}`} style={{ height: 40 }} onClick={() => setTab(i)}>{i + 1}. {t}{i === 2 ? ` (${p.numReviews})` : ''}</button>)}</div>
      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
          {tab === 0 && (p.specs?.length ? <div className="spec-grid">{p.specs.map((s) => <div className="spec" key={s.label}><div className="label">{s.label}</div><b>{s.value}</b></div>)}</div> : <p className="muted">Specifications coming soon.</p>)}
          {tab === 1 && <div className="panel" style={{ maxWidth: 760 }}><h3 style={{ fontFamily: 'var(--serif)', fontSize: 26 }}>The {CATS[p.category].realm} story</h3><p style={{ color: 'var(--charcoal)' }}>{p.description} Every piece from {p.brand} is individually inspected by our atelier team before it leaves the workshop, and ships with a certificate of authenticity.</p></div>}
          {tab === 2 && (
            <div style={{ maxWidth: 820 }}>
              {user ? (
                <form className="rev-form" onSubmit={submitReview}>
                  <b>Share your experience</b>
                  <div className="star-pick">{[1, 2, 3, 4, 5].map((n) => <button type="button" key={n} className={n <= rv.rating ? 'on' : ''} onClick={() => setRv({ ...rv, rating: n })}>★</button>)}</div>
                  <textarea className="textarea" placeholder="Tell others about the quality, finish and fit…" value={rv.comment} onChange={(e) => setRv({ ...rv, comment: e.target.value })} />
                  <button className="btn btn-primary" style={{ justifySelf: 'start' }}>Submit review</button>
                </form>
              ) : <p className="muted" style={{ marginBottom: 20 }}><Link to="/login" style={{ textDecoration: 'underline' }}>Sign in</Link> to write a review.</p>}
              {p.reviews.length === 0 && <p className="muted">Be the first to review this piece.</p>}
              {p.reviews.map((r) => <div key={r._id} className="review" style={{ marginBottom: 12 }}><div style={{ display: 'flex', justifyContent: 'space-between' }}><div className="who2"><span className="avatar">{r.name?.[0]}</span><b>{r.name}</b></div><Stars value={r.rating} /></div><p style={{ marginBottom: 0 }}>{r.comment}</p></div>)}
            </div>
          )}
          {tab === 3 && <div className="spec-grid">{[['Dispatch', 'Packed in signature atelier packaging and dispatched within 24 hours.'], ['Express', 'Priority air courier, 1–2 business days.'], ['Standard', 'Insured delivery, 3–5 business days.'], ['Returns', '30-day effortless returns on all unworn pieces.']].map(([a, b]) => <div className="spec" key={a}><div className="label">{a}</div><b style={{ fontWeight: 400 }}>{b}</b></div>)}</div>}
        </motion.div>
      </AnimatePresence>

      {d.complete?.length > 0 && <section style={{ marginTop: '5rem' }}>
        <Reveal className="sec-head"><div><span className="eyebrow">Atelier wardrobe synergy</span><h2 className="h-lg" style={{ marginTop: 10 }}>Complete the Look</h2></div></Reveal>
        <div className="pgrid">{d.complete.map((x, i) => <ProductCard key={x._id} p={x} index={i} />)}</div>
      </section>}
      {d.related?.length > 0 && <section style={{ marginTop: '4rem' }}>
        <Reveal className="sec-head"><h2 className="h-lg">You may also love</h2></Reveal>
        <div className="pgrid">{d.related.map((x, i) => <ProductCard key={x._id} p={x} index={i} />)}</div>
      </section>}
    </div>
  );
}
