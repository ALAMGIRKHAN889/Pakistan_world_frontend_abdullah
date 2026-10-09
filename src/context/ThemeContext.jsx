import { createContext, useCallback, useContext, useEffect, useState } from 'react';

const Ctx = createContext({ theme: 'light', dark: false, toggle: () => {}, setTheme: () => {} });
export const useTheme = () => useContext(Ctx);

const KEY = 'pw_theme';
const read = () => {
  const attr = document.documentElement.getAttribute('data-theme');
  return attr === 'dark' || attr === 'light' ? attr : 'light';
};

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(read);

  // apply to <html>, browser UI colour (mobile address bar) and native controls
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#0f1013' : '#fcfbf9');
  }, [theme]);

  const setTheme = useCallback((t) => {
    const root = document.documentElement;
    root.classList.add('theme-anim');                       // short colour cross-fade
    window.setTimeout(() => root.classList.remove('theme-anim'), 450);
    try { localStorage.setItem(KEY, t); } catch {}
    setThemeState(t);
  }, []);
  const toggle = useCallback(() => setTheme(theme === 'dark' ? 'light' : 'dark'), [theme, setTheme]);

  // follow the phone/computer setting until the visitor picks a mode themselves
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const on = (e) => { try { if (localStorage.getItem(KEY)) return; } catch {} setThemeState(e.matches ? 'dark' : 'light'); };
    mq.addEventListener?.('change', on);
    return () => mq.removeEventListener?.('change', on);
  }, []);

  return <Ctx.Provider value={{ theme, dark: theme === 'dark', toggle, setTheme }}>{children}</Ctx.Provider>;
}
