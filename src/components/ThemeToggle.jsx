import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import Icon from './Icons';

/* Round icon button (header / admin) */
export function ThemeToggle({ className = 'icon-btn', size }) {
  const { dark, toggle } = useTheme();
  return (
    <button type="button" className={className} onClick={toggle} aria-label={dark ? 'Switch to day mode' : 'Switch to night mode'} aria-pressed={dark} title={dark ? 'Day mode' : 'Night mode'}>
      <AnimatePresence mode="wait" initial={false}>
        <motion.span key={dark ? 'moon' : 'sun'} style={{ display: 'grid', placeItems: 'center' }} initial={{ rotate: -70, opacity: 0, scale: 0.6 }} animate={{ rotate: 0, opacity: 1, scale: 1 }} exit={{ rotate: 70, opacity: 0, scale: 0.6 }} transition={{ duration: 0.18 }}>
          <Icon n={dark ? 'moon' : 'sun'} size={size} />
        </motion.span>
      </AnimatePresence>
    </button>
  );
}

/* Big Day | Night switch (mobile menu) */
export function ThemeSwitch() {
  const { dark, setTheme } = useTheme();
  return (
    <div className="theme-switch" role="group" aria-label="Appearance">
      <button type="button" className={!dark ? 'on' : ''} onClick={() => setTheme('light')} aria-pressed={!dark}><Icon n="sun" size={18} />Day</button>
      <button type="button" className={dark ? 'on' : ''} onClick={() => setTheme('dark')} aria-pressed={dark}><Icon n="moon" size={18} />Night</button>
    </div>
  );
}
