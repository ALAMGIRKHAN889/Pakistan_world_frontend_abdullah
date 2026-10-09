import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useShop } from '../context/ShopContext';
import { CATS } from '../api';
import { PORTFOLIO_URL } from '../config';
import Icon from './Icons';
import Logo from './Logo';
import { ThemeToggle, ThemeSwitch } from './ThemeToggle';

const LINKS = [['/shop', 'Shop'], ['/shop/watches', 'Watches'], ['/shop/cosmetics', 'Cosmetics'], ['/shop/jewelry', 'Jewelry'], ['/shop/toys', 'Toys'], ['/shop?flag=newArrival', 'New Arrivals'], ['/shop?badge=sale', 'Sale']];
const MSGS = ['Shop more · Live better', 'Complimentary worldwide shipping on orders over $150', 'Exclusive curations', '30-day effortless returns', 'Guaranteed authenticity'];
const PLACEHOLDER = 'Search watches, serums, rings, toys…';

/* One search field used both in the header and in the mobile menu */
function SearchField({ q, setQ, onSubmit, className = '', inputRef, placeholder = PLACEHOLDER, id }) {
  return (
    <form className={`sfield ${className}`} onSubmit={onSubmit} role="search">
      <Icon n="search" size={18} />
      <input
        id={id} ref={inputRef} type="search" enterKeyHint="search" autoComplete="off" autoCorrect="off" spellCheck={false}
        value={q} onChange={(e) => setQ(e.target.value)} placeholder={placeholder} aria-label="Search products"
        onKeyDown={(e) => { if (e.key === 'Escape') e.currentTarget.blur(); }}
      />
      {q && <button type="button" className="sclear" aria-label="Clear search" onClick={() => { setQ(''); inputRef?.current?.focus(); }}><Icon n="x" size={14} /></button>}
    </form>
  );
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const { count, setOpen } = useShop();
  const nav = useNavigate(), loc = useLocation();
  const [q, setQ] = useState(''), [menu, setMenu] = useState(false), [mob, setMob] = useState(false), [sc, setSc] = useState(false);
  const mobInput = useRef(null), headInput = useRef(null), focusMob = useRef(false);

  useEffect(() => { const f = () => setSc(window.scrollY > 10); f(); window.addEventListener('scroll', f, { passive: true }); return () => window.removeEventListener('scroll', f); }, []);
  useEffect(() => { setMenu(false); setMob(false); }, [loc.pathname, loc.search]);
  // keep the box in sync with the page you are on (/shop?q=ring shows "ring", other pages clear it)
  useEffect(() => { setQ(loc.pathname.startsWith('/shop') ? new URLSearchParams(loc.search).get('q') || '' : ''); }, [loc.pathname, loc.search]);
  // phone: search icon opens the menu and puts the cursor in its search box
  useEffect(() => { if (mob && focusMob.current) { const t = setTimeout(() => mobInput.current?.focus(), 320); focusMob.current = false; return () => clearTimeout(t); } }, [mob]);
  // lock page scroll behind the open menu
  useEffect(() => { document.body.style.overflow = mob ? 'hidden' : ''; return () => { document.body.style.overflow = ''; }; }, [mob]);

  const submit = (e) => { e.preventDefault(); const t = q.trim(); if (!t) return; document.activeElement?.blur?.(); setMob(false); nav(`/shop?q=${encodeURIComponent(t)}`); };
  const openMenu = (withSearch) => { focusMob.current = !!withSearch; setMob(true); };
  const active = (to) => (to === '/shop' ? loc.pathname === '/shop' && !loc.search : to.includes('?') ? loc.pathname + loc.search === to : loc.pathname === to);

  return (
    <>
      <div className="topbar"><div className="marquee">{[...MSGS, ...MSGS, ...MSGS, ...MSGS].map((m, i) => <span key={i}>{m}</span>)}</div></div>
      <header className={`header ${sc ? 'scrolled' : ''}`}>
        <div className="wrap header-in">
          <button className="icon-btn menu-btn" onClick={() => openMenu(false)} aria-label="Menu"><Icon n="menu" /></button>
          <Link to="/" className="brand" aria-label="Products World — home"><Logo /></Link>
          <nav className="nav">
            {LINKS.map(([to, label]) => (
              <Link key={to} to={to} className={active(to) ? 'active' : ''}>
                {label}{label === 'Sale' && <span className="vip">VIP</span>}
                {active(to) && <motion.span layoutId="navdot" className="dot" />}
              </Link>
            ))}
          </nav>
          <SearchField className="hsearch" q={q} setQ={setQ} onSubmit={submit} inputRef={headInput} placeholder="Search products…" />
          <div className="tools">
            <button className="icon-btn search-btn" onClick={() => openMenu(true)} aria-label="Search"><Icon n="search" /></button>
            <Link to="/account/wishlist" className="icon-btn wish-btn" aria-label="Wishlist"><Icon n="heart" />{user?.wishlist?.length > 0 && <span className="badge-count">{user.wishlist.length}</span>}</Link>
            <a href={PORTFOLIO_URL} target="_blank" rel="noopener noreferrer" className="icon-btn portfolio-btn" aria-label="Portfolio" title="Portfolio"><Icon n="portfolio" /></a>
            <ThemeToggle />
            <button className="icon-btn" onClick={() => setOpen(true)} aria-label="Bag"><Icon n="bag" />{count > 0 && <motion.span key={count} initial={{ scale: 1.6 }} animate={{ scale: 1 }} className="badge-count">{count}</motion.span>}</button>
            <button className="icon-btn" onClick={() => (user ? setMenu((m) => !m) : nav('/login'))} aria-label="Account"><Icon n="user" /></button>
          </div>
        </div>
        <AnimatePresence>
          {menu && user && (
            <motion.div className="menu-pop" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
              <div className="who"><b>{user.name}</b><div className="muted" style={{ fontSize: 12 }}>{user.email}</div></div>
              {user.role === 'admin' && <Link to="/admin">Admin panel</Link>}
              <Link to="/account">My orders</Link><Link to="/account/wishlist">Wishlist</Link><Link to="/account/profile">Profile</Link>
              <button onClick={() => { logout(); nav('/'); }}>Sign out</button>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
      <div className="realms"><div className="wrap realms-in">
        <span className="label">Realms:</span>
        {Object.entries(CATS).map(([k, c]) => <Link key={k} to={`/shop/${k}`} className="realm" style={{ background: c.soft, color: c.ink }}>{c.realm}</Link>)}
        <span className="grow"><Icon n="shield" size={13} /> Guaranteed authenticity &amp; atelier warranties</span>
      </div></div>

      <AnimatePresence>
        {mob && (<>
          <motion.div className="overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMob(false)} />
          <motion.aside className="drawer drawer-left" aria-label="Menu" initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'spring', damping: 30, stiffness: 300 }}>
            <div className="drawer-h"><Link to="/" className="brand" onClick={() => setMob(false)}><Logo /></Link><button className="icon-btn" onClick={() => setMob(false)} aria-label="Close menu"><Icon n="x" /></button></div>
            <div className="drawer-b drawer-menu">
              <SearchField className="msearch" q={q} setQ={setQ} onSubmit={submit} inputRef={mobInput} />
              {LINKS.map(([to, l]) => <Link key={to} to={to} className={`mlink ${active(to) ? 'on' : ''}`}>{l}{l === 'Sale' && <span className="vip">VIP</span>}</Link>)}
              <Link to="/account/wishlist" className="mlink sm">Wishlist{user?.wishlist?.length > 0 && <span className="vip">{user.wishlist.length}</span>}</Link>
              <a href={PORTFOLIO_URL} target="_blank" rel="noopener noreferrer" className="mlink sm">Portfolio<Icon n="portfolio" size={18} /></a>
              {user ? <Link to="/account" className="mlink sm">My account</Link> : <Link to="/login" className="btn btn-primary" style={{ marginTop: 18 }}>Sign in</Link>}
              <div className="mtheme"><span className="label muted">Appearance</span><ThemeSwitch /></div>
            </div>
          </motion.aside>
        </>)}
      </AnimatePresence>
    </>
  );
}
