import axios from 'axios';

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || '/api' });
api.interceptors.request.use((cfg) => {
  const t = localStorage.getItem('aura_token');
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});
export const errMsg = (e) => e?.response?.data?.message || e?.message || 'Something went wrong';
export const money = (n) => `$${(+n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
export const money0 = (n) => `$${Math.round(+n || 0).toLocaleString('en-US')}`;
export const CATS = {
  watches: { label: 'Watches', realm: 'Horology', color: '#18191f', soft: '#18191f', ink: '#fff' },
  cosmetics: { label: 'Cosmetics', realm: 'Beauty & Glow', color: '#c59b9b', soft: '#f9ecea', ink: '#8c4d4d' },
  jewelry: { label: 'Jewelry', realm: 'Fine Adornments', color: '#d4af37', soft: '#faf4df', ink: '#876d1e' },
  toys: { label: 'Toys', realm: 'Play & Wonder', color: '#ea580c', soft: '#ffeedb', ink: '#c2410c' },
};
export default api;
