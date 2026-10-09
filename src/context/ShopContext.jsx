import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import api, { errMsg } from '../api';
import { useAuth } from './AuthContext';

const Ctx = createContext(null);
export const useShop = () => useContext(Ctx);

const lineKey = (id, opts = []) => id + '|' + opts.map((o) => `${o.name}:${o.label}`).join(',');
const load = () => { try { return JSON.parse(localStorage.getItem('aura_bag')) || []; } catch { return []; } };

export function ShopProvider({ children }) {
  const { user, setUser } = useAuth();
  const [bag, setBag] = useState(load);
  const [open, setOpen] = useState(false);
  const [coupon, setCoupon] = useState(null);

  useEffect(() => { try { localStorage.setItem('aura_bag', JSON.stringify(bag)); } catch {} }, [bag]);

  const add = (product, qty = 1, options = [], unitPrice) => {
    const price = unitPrice ?? product.price;
    setBag((b) => {
      const key = lineKey(product._id, options), found = b.find((l) => l.key === key);
      if (found) return b.map((l) => (l.key === key ? { ...l, qty: Math.min(l.qty + qty, product.stock || 99) } : l));
      return [...b, { key, productId: product._id, slug: product.slug, name: product.name, image: product.images?.[0], category: product.category, price, qty, options, stock: product.stock }];
    });
    setOpen(true);
  };
  const setQty = (key, qty) => setBag((b) => b.map((l) => (l.key === key ? { ...l, qty: Math.max(1, Math.min(qty, l.stock || 99)) } : l)));
  const remove = (key) => setBag((b) => b.filter((l) => l.key !== key));
  const clear = () => { setBag([]); setCoupon(null); };

  const count = bag.reduce((a, l) => a + l.qty, 0);
  const subtotal = useMemo(() => bag.reduce((a, l) => a + l.price * l.qty, 0), [bag]);

  const wishIds = useMemo(() => new Set((user?.wishlist || []).map(String)), [user]);
  const toggleWish = async (product) => {
    if (!user) return toast('Sign in to save items to your wishlist', { icon: '♡' });
    try {
      const { data } = await api.post(`/me/wishlist/${product._id}`);
      setUser((u) => ({ ...u, wishlist: data.wishlist }));
      toast.success(data.added ? 'Saved to wishlist' : 'Removed from wishlist');
    } catch (e) { toast.error(errMsg(e)); }
  };

  return (
    <Ctx.Provider value={{ bag, add, setQty, remove, clear, count, subtotal, open, setOpen, coupon, setCoupon, wishIds, toggleWish }}>
      {children}
    </Ctx.Provider>
  );
}
