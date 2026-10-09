import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api, { money, errMsg } from '../api';
import { useAuth } from '../context/AuthContext';
import { Skel } from '../components/Bits';

export default function Customers() {
  const [users, setUsers] = useState(null), [q, setQ] = useState('');
  const { user: me } = useAuth();
  const load = () => api.get('/admin/users').then((r) => setUsers(r.data.users));
  useEffect(() => { load(); }, []);
  const patch = async (u, body) => { try { await api.put(`/admin/users/${u._id}`, body); toast.success('Updated'); load(); } catch (e) { toast.error(errMsg(e)); } };
  const list = (users || []).filter((u) => (u.name + u.email).toLowerCase().includes(q.toLowerCase()));
  return (
    <>
      <div className="adm-top"><div><h1>Customers</h1><span className="muted">{users?.length ?? '…'} accounts</span></div></div>
      <div className="adm-card">
        <input className="input" style={{ maxWidth: 280, height: 40, marginBottom: 14 }} placeholder="Search customers…" value={q} onChange={(e) => setQ(e.target.value)} />
        {!users ? <Skel h={260} /> : (
          <div className="tbl-wrap"><table className="tbl"><thead><tr><th>Customer</th><th>Role</th><th>Joined</th><th>Orders</th><th>Spent</th><th>Status</th><th /></tr></thead>
            <tbody>{list.map((u) => (
              <tr key={u._id}>
                <td><div className="cell"><span className="avatar">{u.name[0]}</span><div><b>{u.name}</b><div className="muted" style={{ fontSize: 12 }}>{u.email}</div></div></div></td>
                <td><span className="chip" style={u.role === 'admin' ? { background: 'var(--ink)', color: 'var(--inv)' } : {}}>{u.role}</span></td>
                <td>{new Date(u.createdAt).toLocaleDateString()}</td><td>{u.orders}</td><td><b>{money(u.spent)}</b></td>
                <td>{u.blocked ? <span className="status st-cancelled">blocked</span> : <span className="status st-delivered">active</span>}</td>
                <td style={{ textAlign: 'right' }}>{u._id !== me._id && <div className="acts"><button className="btn btn-line btn-sm" onClick={() => patch(u, { blocked: !u.blocked })}>{u.blocked ? 'Unblock' : 'Block'}</button><button className="btn btn-line btn-sm" onClick={() => patch(u, { role: u.role === 'admin' ? 'user' : 'admin' })}>{u.role === 'admin' ? 'Remove admin' : 'Make admin'}</button></div>}</td>
              </tr>))}</tbody></table></div>
        )}
      </div>
    </>
  );
}
