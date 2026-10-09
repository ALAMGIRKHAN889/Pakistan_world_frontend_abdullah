import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import toast from 'react-hot-toast';
import api, { CATS, money, errMsg } from '../api';
import ProductCard from '../components/ProductCard';
import { Reveal, Stagger, Item, CountUp, Countdown, GridSkel, Stars } from '../components/Bits';
import Icon from '../components/Icons';
import { useShop } from '../context/ShopContext';

const useList = (params) => {
  const [items, setItems] = useState(null);
  useEffect(() => { api.get('/products', { params }).then((r) => setItems(r.data.items)).catch(() => setItems([])); }, [JSON.stringify(params)]);
  return items;
};


export default function Home() {
  const hero = useRef(null);
  const { scrollYProgress } = useScroll({ target: hero, offset: ['start start', 'end start'] });
  const yImg = useTransform(scrollYProgress, [0, 1], [0, 90]);
  const yTxt = useTransform(scrollYProgress, [0, 1], [0, -40]);

  const trending = useList({ flag: 'trending', limit: 8 });
  const fresh = useList({ flag: 'newArrival', limit: 24 });
  const best = useList({ flag: 'bestSeller', limit: 3, sort: 'popular' });
  const featured = useList({ flag: 'featured', limit: 12 });
  const all = useList({ limit: 60 });
  const { add } = useShop();

  const [tab, setTab] = useState('all');
  const [email, setEmail] = useState('');

  const pick = (cat, n = 1) => (all || []).filter((p) => p.category === cat);
  const heroProd = featured?.find((p) => p.slug.startsWith('chronos')) || featured?.[0];
  const beauty = pick('cosmetics')[0], gift = pick('jewelry')[1], toy = pick('toys')[0];
  const catCover = (c) => pick(c)[0]?.images?.[0];
  const newList = (fresh || []).filter((p) => tab === 'all' || p.category === tab).slice(0, 4);

  const sub = async (e) => {
    e.preventDefault();
    try { await api.post('/me/subscribe', { email }); toast.success('Welcome to the inner circle ✦'); setEmail(''); } catch (er) { toast.error(errMsg(er)); }
  };

  return (
    <>
      <section className="hero" ref={hero}>
        <div className="wrap hero-in">
          <motion.div style={{ y: yTxt }}>
            <motion.span className="chip" style={{ background: 'var(--gold-soft)', color: 'var(--gold-ink)' }} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>✦ Atelier curated edition</motion.span>
            <motion.h1 className="display" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}>
              Style, Beauty<br /><span className="italic">&amp; Fun</span> — All in<br />One Place.
            </motion.h1>
            <motion.p className="lead" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.8 }}>
              Discover premium watches, cosmetics, jewelry and toys — handcrafted, delivered worldwide and curated for those who notice the details.
            </motion.p>
            <motion.div className="hero-cta" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
              <Link to="/shop" className="btn btn-primary">Shop now <Icon n="arrow" size={16} /></Link>
              <Link to="/shop?flag=featured" className="btn btn-outline">Explore collections</Link>
            </motion.div>
            <motion.div className="trust" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}>
              <div><b><CountUp to={10} suffix="K+" /></b><span>Happy customers</span></div>
              <div><b><CountUp to={100} suffix="%" /></b><span>Authentic pieces</span></div>
              <div><b>24/7</b><span>Concierge support</span></div>
            </motion.div>
          </motion.div>
          <motion.div className="hero-visual" initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}>
            <div className="frame"><motion.img style={{ y: yImg, scale: 1.15 }} src={heroProd?.images?.[0] || ''} alt="Products World featured" /></div>
            <motion.div className="glass float-card a" animate={{ y: [0, -8, 0] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}>
              <span className="ic"><Icon n="shield" size={18} /></span><div><b>Free shipping</b><div className="muted" style={{ fontSize: 12 }}>on orders over $150</div></div>
            </motion.div>
            <motion.div className="glass float-card b" animate={{ y: [0, 8, 0] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}>
              <span className="ic"><Icon n="sparkle" size={18} /></span><div><span className="label muted">Limited</span><div><b>Chronos Obsidian</b></div></div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className="section" style={{ paddingBottom: 2 }}><div className="wrap">
        <Reveal className="sec-head"><div><span className="eyebrow">Four realms · one atelier</span><h2 className="h-lg" style={{ marginTop: 10 }}>Curated by Craft &amp; Calling</h2></div><p>Four disciplined worlds under a single architectural roof — each with its own atmosphere, each held to the same standard.</p></Reveal>
        <Stagger className="cat-grid">
          {Object.entries(CATS).map(([k, c]) => (
            <Item key={k}><Link to={`/shop/${k}`} className="cat-tile">
              {catCover(k) ? <img src={catCover(k)} alt={c.label} loading="lazy" /> : <div className="skel" style={{ height: '100%' }} />}
              <div className="txt"><span className="chip" style={{ background: c.soft, color: c.ink }}>{c.realm}</span><h3>{c.label}</h3><span className="ghost arrow">Shop {c.label} <Icon n="arrow" size={14} /></span></div>
            </Link></Item>
          ))}
        </Stagger>
      </div></section>

      <section className="section"><div className="wrap">
        <Reveal className="sec-head"><div><span className="eyebrow">Most coveted this season</span><h2 className="h-lg" style={{ marginTop: 10 }}>Trending Now</h2></div><Link to="/shop?flag=trending" className="ghost">View all <Icon n="arrow" size={14} /></Link></Reveal>
        {trending ? <div className="pgrid">{trending.map((p, i) => <ProductCard key={p._id} p={p} index={i} />)}</div> : <GridSkel />}
      </div></section>

      {heroProd && (
        <section className="band-dark section"><div className="wrap showcase">
          <Reveal>
            <span className="eyebrow" style={{ color: 'var(--gold)' }}>Horology spotlight</span>
            <h2 className="display" style={{ fontSize: 'clamp(32px,4.2vw,54px)', margin: '14px 0 16px' }}>Time to Upgrade<br />Your Style</h2>
            <p style={{ opacity: .75, maxWidth: 440, marginBottom: 26 }}>{heroProd.name} — {heroProd.brand}. Limited batches, individually tested, shipped with a 5-year movement warranty.</p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 28 }}><span className="price" style={{ fontSize: 40, color: '#fff' }}>{money(heroProd.price)}</span>{heroProd.comparePrice > 0 && <span className="was">{money(heroProd.comparePrice)}</span>}</div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}><Link to={`/product/${heroProd.slug}`} className="btn btn-gold">Configure yours</Link><Link to="/shop/watches" className="btn btn-outline" style={{ color: '#fff' }}>All watches</Link></div>
          </Reveal>
          <Reveal delay={0.15}><Link to={`/product/${heroProd.slug}`} className="pic" style={{ display: 'block' }}><img src={heroProd.images[1] || heroProd.images[0]} alt={heroProd.name} loading="lazy" /></Link></Reveal>
        </div></section>
      )}

      {beauty && (
        <section className="band-rose section"><div className="wrap showcase rev">
          <Reveal delay={0.1}><Link to={`/product/${beauty.slug}`} className="pic" style={{ display: 'block' }}><img src={beauty.images[2] || beauty.images[0]} alt={beauty.name} loading="lazy" /></Link></Reveal>
          <Reveal>
            <span className="eyebrow" style={{ color: 'var(--rose-ink)' }}>Cosmetics &amp; skincare</span>
            <h2 className="h-lg" style={{ margin: '12px 0 14px' }}>Your Beauty, <span className="italic" style={{ color: 'var(--rose-ink)' }}>Your Style</span></h2>
            <p style={{ color: 'var(--charcoal)', maxWidth: 460, marginBottom: 24 }}>Cold-pressed botanicals, clean formulations and radiant pigments — rituals worth lingering over.</p>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}><Link to="/shop/cosmetics" className="btn btn-primary">Shop beauty</Link><span className="price">from {money(Math.min(...pick('cosmetics').map((p) => p.price)))}</span></div>
          </Reveal>
        </div></section>
      )}

      {gift && (
        <section className="section"><div className="wrap showcase">
          <Reveal>
            <span className="eyebrow">Fine jewelry &amp; gifts</span>
            <h2 className="h-lg" style={{ margin: '12px 0 14px' }}>Elegance That <span className="italic">Speaks</span></h2>
            <p style={{ color: 'var(--charcoal)', maxWidth: 460, marginBottom: 24 }}>18k solid gold, ethically sourced diamonds and heirloom finishing — pieces that outlast trends.</p>
            <Link to="/shop/jewelry" className="btn btn-gold">Explore jewelry</Link>
          </Reveal>
          <Reveal delay={0.1}><Link to={`/product/${gift.slug}`} className="pic" style={{ display: 'block' }}><img src={gift.images[0]} alt={gift.name} loading="lazy" /></Link></Reveal>
        </div></section>
      )}

      {toy && (
        <section className="section band-toy"><div className="wrap showcase rev">
          <Reveal><Link to={`/product/${toy.slug}`} className="pic" style={{ display: 'block' }}><img src={toy.images[0]} alt={toy.name} loading="lazy" /></Link></Reveal>
          <Reveal delay={0.1}>
            <span className="eyebrow" style={{ color: 'var(--orange-ink)' }}>Design objects &amp; play</span>
            <h2 className="h-lg" style={{ margin: '12px 0 14px' }}>Make Every Moment <span className="italic" style={{ color: 'var(--orange-ink)' }}>Fun</span></h2>
            <p style={{ color: 'var(--charcoal)', maxWidth: 460, marginBottom: 24 }}>Heirloom plush, Montessori blocks and electric racers — beautifully made, built to be played with.</p>
            <Link to="/shop/toys" className="btn btn-primary" style={{ background: '#ea580c' }}>Shop toys</Link>
          </Reveal>
        </div></section>
      )}

      <section className="section"><div className="wrap">
        <Reveal className="sec-head"><div><span className="eyebrow">Just landed</span><h2 className="h-lg" style={{ marginTop: 10 }}>New Arrivals</h2></div>
          <div className="tabs u-tabs">{['all', ...Object.keys(CATS)].map((t) => <button key={t} className={`pill-btn ${tab === t ? 'on' : ''}`} onClick={() => setTab(t)}>{tab === t && <motion.span layoutId="tabu" className="u" />}{t === 'all' ? 'All' : CATS[t].label}</button>)}</div>
        </Reveal>
        {fresh ? <motion.div key={tab} className="pgrid" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{newList.length ? newList.map((p, i) => <ProductCard key={p._id} p={p} index={i} />) : <p className="muted">Nothing new here yet.</p>}</motion.div> : <GridSkel n={4} />}
      </div></section>

      <section className="band-dark section"><div className="wrap" style={{ textAlign: 'center' }}>
        <Reveal>
          <span className="eyebrow" style={{ color: 'var(--gold)' }}>Limited-time event</span>
          <h2 className="display" style={{ margin: '14px 0' }}>BIG SALE — <span className="italic" style={{ color: 'var(--gold)' }}>Up to 50% Off</span></h2>
          <p style={{ opacity: .7, maxWidth: 520, margin: '0 auto 28px' }}>Select watches, serums, jewelry and play objects. Use code <b style={{ color: 'var(--gold)' }}>AURAVIP</b> for an extra $40 off orders over $100.</p>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 32 }}><Countdown /></div>
          <Link to="/shop?badge=sale" className="btn btn-gold">Shop the sale now</Link>
        </Reveal>
      </div></section>

      <section className="section"><div className="wrap">
        <Reveal className="sec-head" style={{ justifyContent: 'center', textAlign: 'center' }}><div><span className="eyebrow">Atelier favourites</span><h2 className="h-lg" style={{ marginTop: 10 }}>Best Sellers</h2></div></Reveal>
        {best ? <div className="pgrid three">{best.map((p, i) => <ProductCard key={p._id} p={p} index={i} />)}</div> : <GridSkel n={3} />}
      </div></section>

      <div className="wrap"><Stagger className="perks">
        {[['truck', 'Worldwide shipping', 'Complimentary over $150'], ['shield', '100% secure checkout', 'Encrypted payments'], ['return', 'Flexible payment', 'Card or cash on delivery'], ['sparkle', '30-day returns', 'Effortless, white-glove']].map(([ic, t, s]) => (
          <Item key={t} className="perk"><span className="ic"><Icon n={ic} size={18} /></span><div><b>{t}</b><span>{s}</span></div></Item>
        ))}
      </Stagger></div>

      <section className="section"><div className="wrap">
        <Reveal className="sec-head"><div><span className="eyebrow">Testimonials</span><h2 className="h-lg" style={{ marginTop: 10 }}>Loved Across the Continents</h2></div></Reveal>
        <Stagger className="reviews">
          {[['Eleanor Vance', 'San Francisco', 'The Chronos arrived in a velvet box with a handwritten note. Genuinely the best unboxing of my life.'], ['Amara Okafor', 'Lagos', 'The glow serum is unreal — my skin has never looked better. Dispatch was next-day.'], ['Hiro Tanaka', 'Tokyo', 'Bought the solitaire pendant as a gift. The craftsmanship is flawless and she cried happy tears.']].map(([n, c, t]) => (
            <Item key={n} className="review"><Stars value={5} /><p>“{t}”</p><div className="who2"><span className="avatar">{n[0]}</span><div><b>{n}</b><div className="muted" style={{ fontSize: 12 }}>{c} · Verified buyer</div></div></div></Item>
          ))}
        </Stagger>
      </div></section>

      <section className="wrap"><Reveal className="news">
        <span className="eyebrow" style={{ color: 'var(--gold)' }}>Private invitations</span>
        <h2 className="display" style={{ fontSize: 'clamp(30px,4vw,48px)', margin: '12px 0' }}>Stay in the Loop</h2>
        <p style={{ opacity: .7 }}>First access to limited editions, atelier events and subscriber-only pricing.</p>
        <form onSubmit={sub}><input className="input" type="email" required placeholder="Your email address" value={email} onChange={(e) => setEmail(e.target.value)} /><button className="btn btn-gold">Subscribe</button></form>
      </Reveal></section>
    </>
  );
}
