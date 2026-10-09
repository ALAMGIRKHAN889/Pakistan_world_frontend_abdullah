import { useEffect, useRef, useState } from 'react';
import { motion, useInView, animate } from 'framer-motion';
import { CATS } from '../api';

export function Reveal({ children, delay = 0, y = 28, as = 'div', className, style }) {
  const M = motion[as];
  return (
    <M className={className} style={style} initial={{ opacity: 0, y }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}>
      {children}
    </M>
  );
}

export const Stagger = ({ children, className, gap = 0.07 }) => (
  <motion.div className={className} initial="h" whileInView="s" viewport={{ once: true, margin: '-60px' }} transition={{ staggerChildren: gap }}>{children}</motion.div>
);
export const Item = ({ children, className }) => (
  <motion.div className={className} variants={{ h: { opacity: 0, y: 30 }, s: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } } }}>{children}</motion.div>
);

export function Stars({ value = 0 }) {
  return (
    <span className="stars" aria-label={`${value} out of 5`}>
      {[1, 2, 3, 4, 5].map((i) => <span key={i} className={i <= Math.round(value) ? '' : 'off'}>★</span>)}
    </span>
  );
}

export function CountUp({ to, prefix = '', suffix = '', decimals = 0 }) {
  const ref = useRef(null), inView = useInView(ref, { once: true });
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const c = animate(0, to, { duration: 1.4, ease: 'easeOut', onUpdate: (x) => setV(x) });
    return () => c.stop();
  }, [inView, to]);
  return <span ref={ref}>{prefix}{v.toLocaleString('en-US', { maximumFractionDigits: decimals, minimumFractionDigits: decimals })}{suffix}</span>;
}

export function Countdown({ hours = 72 }) {
  const [end] = useState(() => {
    const s = localStorage.getItem('aura_sale_end');
    if (s && +s > Date.now()) return +s;
    const e = Date.now() + hours * 36e5; localStorage.setItem('aura_sale_end', e); return e;
  });
  const [left, setLeft] = useState(end - Date.now());
  useEffect(() => { const t = setInterval(() => setLeft(Math.max(0, end - Date.now())), 1000); return () => clearInterval(t); }, [end]);
  const p = (n) => String(Math.floor(n)).padStart(2, '0');
  return (
    <div className="timer">
      {[['Days', left / 864e5], ['Hours', (left / 36e5) % 24], ['Mins', (left / 6e4) % 60], ['Secs', (left / 1e3) % 60]].map(([l, n]) => <div key={l}><b>{p(n)}</b><span>{l}</span></div>)}
    </div>
  );
}

export const CatChip = ({ cat }) => {
  const c = CATS[cat]; if (!c) return null;
  return <span className="chip" style={{ background: c.soft, color: c.ink }}>{c.label}</span>;
};

export const Skel = ({ h = 300, w = '100%' }) => <div className="skel" style={{ height: h, width: w }} />;
export const GridSkel = ({ n = 8 }) => <div className="pgrid">{Array.from({ length: n }).map((_, i) => <div key={i}><Skel h={320} /><div style={{ height: 8 }} /><Skel h={16} w="70%" /></div>)}</div>;
