import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useShop } from '../context/ShopContext';
import { money } from '../api';
import Icon from './Icons';

export const FREE_SHIP = 150;

export default function CartDrawer() {
  const { open, setOpen, bag, setQty, remove, subtotal, count } = useShop();
  const nav = useNavigate();
  const left = Math.max(0, FREE_SHIP - subtotal);
  return (
    <AnimatePresence>
      {open && (<>
        <motion.div className="overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)} />
        <motion.aside className="drawer" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 32, stiffness: 320 }} aria-label="Shopping bag">
          <div className="drawer-h"><h3 style={{ fontSize: 24 }}>Curated Bag <span className="muted" style={{ fontSize: 15 }}>({count})</span></h3><button className="icon-btn" onClick={() => setOpen(false)} aria-label="Close"><Icon n="x" /></button></div>
          {bag.length > 0 && (
            <div style={{ padding: '14px 24px 0', fontSize: 13 }}>
              {left > 0 ? <>Add <b>{money(left)}</b> more for complimentary express upgrade</> : <b style={{ color: 'var(--ok)' }}>✓ Priority atelier perks unlocked</b>}
              <div className="free-ship"><i style={{ width: `${Math.min(100, (subtotal / FREE_SHIP) * 100)}%` }} /></div>
            </div>
          )}
          <div className="drawer-b">
            {bag.length === 0 ? (
              <div className="empty"><Icon n="bag" size={40} style={{ opacity: .4 }} /><h3 style={{ marginTop: 16 }}>Your bag is empty</h3><p>Discover something extraordinary.</p><Link to="/shop" onClick={() => setOpen(false)} className="btn btn-primary" style={{ marginTop: 20 }}>Explore the collection</Link></div>
            ) : (
              <AnimatePresence initial={false}>
                {bag.map((l) => (
                  <motion.div key={l.key} layout initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 60, height: 0 }} className="line">
                    <Link to={`/product/${l.slug}`} onClick={() => setOpen(false)}><img src={l.image} alt="" /></Link>
                    <div>
                      <h4>{l.name}</h4>
                      {l.options.map((o) => <small key={o.name}>{o.name}: {o.label}</small>)}
                      <div className="mini-qty"><button onClick={() => setQty(l.key, l.qty - 1)}>−</button><span>{l.qty}</span><button onClick={() => setQty(l.key, l.qty + 1)}>+</button></div>
                    </div>
                    <div style={{ textAlign: 'right' }}><b>{money(l.price * l.qty)}</b><br /><button className="linkbtn" onClick={() => remove(l.key)}>Remove</button></div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
          {bag.length > 0 && (
            <div className="drawer-f">
              <div className="sum-row"><span>Subtotal</span><b>{money(subtotal)}</b></div>
              <p className="muted" style={{ fontSize: 12, marginBottom: 12 }}>Shipping & discounts calculated at checkout.</p>
              <button className="btn btn-primary btn-block" onClick={() => { setOpen(false); nav('/checkout'); }}>Checkout · {money(subtotal)}</button>
            </div>
          )}
        </motion.aside>
      </>)}
    </AnimatePresence>
  );
}
