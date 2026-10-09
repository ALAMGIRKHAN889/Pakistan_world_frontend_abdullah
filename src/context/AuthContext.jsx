import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import api from '../api';

const Ctx = createContext(null);
export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem('aura_token')) return setReady(true);
    api.get('/auth/me').then((r) => setUser(r.data.user)).catch(() => localStorage.removeItem('aura_token')).finally(() => setReady(true));
  }, []);

  const authed = (data) => { localStorage.setItem('aura_token', data.token); setUser(data.user); return data.user; };
  const login = async (email, password) => authed((await api.post('/auth/login', { email, password })).data);
  const register = async (form) => authed((await api.post('/auth/register', form)).data);
  const logout = () => { localStorage.removeItem('aura_token'); setUser(null); };
  const refresh = useCallback(async () => setUser((await api.get('/auth/me')).data.user), []);

  return <Ctx.Provider value={{ user, setUser, ready, login, register, logout, refresh }}>{children}</Ctx.Provider>;
}
