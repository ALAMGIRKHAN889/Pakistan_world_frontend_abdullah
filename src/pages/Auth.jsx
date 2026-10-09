import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { errMsg } from '../api';

export default function Auth({ mode = 'login' }) {
  const { login, register } = useAuth();
  const nav = useNavigate();
  const [sp] = useSearchParams();
  const [f, setF] = useState({ name: '', email: '', password: '', phone: '' });
  const [err, setErr] = useState(''), [busy, setBusy] = useState(false);
  const reg = mode === 'register';
  const up = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault(); setErr(''); setBusy(true);
    try {
      const u = reg ? await register(f) : await login(f.email, f.password);
      nav(sp.get('next') || (u.role === 'admin' ? '/admin' : '/'), { replace: true });
    } catch (er) { setErr(errMsg(er)); } finally { setBusy(false); }
  };

  return (
    <div className="auth">
      <div className="auth-art">
        <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuCcevqT3y5R_i2gqY9UnoDmSP1MgK6AcqcB4AuSSsXXbAgzwSdbwELyt26GqQjaRXXrVcneVzbWqv90qQI5yb8Q4GmFo6GsvLVShxvbSttzof7etp1K6q5jTidnKxTk_32-3ZaAuY70RkRxz_syq82N8prxS72dP0wE3brLbofE3vOEsgk_q4eNFQh29ngsZ4MwJiW9w-2Z5XJllHTWwsUaytHrW1nqzCKwh0zNnC83" alt="" onError={(e) => (e.currentTarget.style.display = 'none')} />
        <div><span className="eyebrow" style={{ color: 'var(--gold)' }}>Products World</span><h2 className="display" style={{ fontSize: 44, marginTop: 10 }}>Where craft meets <span className="italic" style={{ color: 'var(--gold)' }}>curiosity.</span></h2></div>
      </div>
      <div className="auth-form">
        <motion.form onSubmit={submit} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>
          <div><h1 style={{ fontSize: 38 }}>{reg ? 'Create account' : 'Welcome back'}</h1><p className="muted" style={{ marginTop: 6 }}>{reg ? 'Join Products World for order tracking, wishlists and private offers.' : 'Sign in to your Products World account.'}</p></div>
          {err && <div className="err-box">{err}</div>}
          {reg && <label className="field"><span>Full name</span><input className="input" required value={f.name} onChange={up('name')} /></label>}
          <label className="field"><span>Email</span><input className="input" type="email" required value={f.email} onChange={up('email')} /></label>
          {reg && <label className="field"><span>Phone / WhatsApp</span><input className="input" value={f.phone} onChange={up('phone')} /></label>}
          <label className="field"><span>Password</span><input className="input" type="password" required minLength={6} value={f.password} onChange={up('password')} /></label>
          <button className="btn btn-primary btn-block" disabled={busy}>{busy ? 'Please wait…' : reg ? 'Create account' : 'Sign in'}</button>
          <p className="muted" style={{ fontSize: 14, textAlign: 'center' }}>{reg ? <>Already a member? <Link to="/login" style={{ textDecoration: 'underline' }}>Sign in</Link></> : <>New to Products World? <Link to="/register" style={{ textDecoration: 'underline' }}>Create an account</Link></>}</p>
        </motion.form>
      </div>
    </div>
  );
}
