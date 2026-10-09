import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useShop } from '../context/ShopContext';
import { money } from '../api';
import { CatChip, Stars } from './Bits';
import Icon from './Icons';

export default function ProductCard({ p, index = 0 }) {
  const { add, toggleWish, wishIds } = useShop();
  const on = wishIds.has(String(p._id));
  const off = p.comparePrice > p.price ? Math.round((1 - p.price / p.comparePrice) * 100) : 0;
  const hasOpts = false;
  return (
    <motion.article className="pcard" initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.6, delay: (index % 4) * 0.07, ease: [0.22, 1, 0.36, 1] }}>
      <Link to={`/product/${p.slug}`} className="media" aria-label={p.name}>
        <img src={p.images?.[0]} alt={p.name} loading="lazy" />
        {p.images?.[1] && <img className="alt" src={p.images[1]} alt="" loading="lazy" />}
      </Link>
      <span className="tag"><CatChip cat={p.category} /></span>
      {off > 0 && <span className="chip tag2">-{off}%</span>}
      <button className={`wish ${on ? 'on' : ''}`} onClick={() => toggleWish(p)} aria-label="Toggle wishlist"><Icon n="heart" /></button>
      <div className="quick">
        {p.stock > 0
          ? <button className="btn btn-primary btn-sm btn-block" onClick={() => add(p, 1)}>Quick add</button>
          : <button className="btn btn-line btn-sm btn-block" disabled>Sold out</button>}
      </div>
      <div className="body">
        <span className="brand-s">{p.brand}</span>
        <Link to={`/product/${p.slug}`}><h3>{p.name}</h3></Link>
        {p.numReviews > 0 && <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}><Stars value={p.rating} /><span className="muted" style={{ fontSize: 12 }}>({p.numReviews})</span></div>}
        <div className="price-row"><span className="price">{money(p.price)}</span>{off > 0 && <span className="was">{money(p.comparePrice)}</span>}</div>
      </div>
    </motion.article>
  );
}
