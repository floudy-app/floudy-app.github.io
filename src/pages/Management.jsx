import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import { getAdminUsers, renameUser, blockUser, unblockUser, getSuspiciousUsers } from '../utils/authHelpers.js';
import Navbar from '../components/Navbar.jsx';
import '../styles/global.css';
import '../styles/management.css';

export default function Management() 
{
  const { user } = useApp();
  const nav = useNavigate();
  const [users, setUsers] = useState([]);
  const [suspiciousUsers, setSuspiciousUsers] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');

  useEffect(() =>
  {
    if (!user || user.role !== 'Admin') { nav('/login', { replace: true }); return; }
    fetchData();
  }, [user]);

  async function fetchData()
  {
    const uData = await getAdminUsers();
    setUsers(uData);

    const sData = await getSuspiciousUsers();
    setSuspiciousUsers(sData);
  }

  function startEdit(u)
  {
    setEditingId(u.id);
    setEditName(u.username);
  }

  async function saveEdit(id)
  {
    await renameUser(id, editName, user.id, user.username);
    setEditingId(null);
    await fetchData();
  }

  async function toggleBlock(u)
  {
    if (u.isBlocked) await unblockUser(u.id, user.id, user.username);
    else await blockUser(u.id, user.id, user.username);
    await fetchData();
  }

  return (
    <div>
      <Navbar />
      <div className="mgmt page-in">
        <h1 className="mgmt__title">User Management</h1>
        <p className="mgmt__subtitle">Manage all existing user accounts.</p>

        <div className="mgmt__table-wrap">
          <table className="mgmt__table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Username</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 && (
                <tr><td colSpan={5} className="mgmt__empty">No users found.</td></tr>
              )}
              {users.map(u => (
                <tr key={u.id} className={u.isBlocked ? 'mgmt__row--blocked' : ''}>
                  <td className="mgmt__id">{u.id}</td>
                  <td>
                    {editingId === u.id ? (
                      <input
                        className="mgmt__edit-input"
                        value={editName}
                        onChange={e => setEditName(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && saveEdit(u.id)}
                        autoFocus
                      />
                    ) : (
                      <span className="mgmt__username">{u.username}</span>
                    )}
                  </td>
                  <td><span className="mgmt__role-badge">{u.role}</span></td>
                  <td>
                    <span className={`mgmt__status ${u.isBlocked ? 'mgmt__status--blocked' : 'mgmt__status--active'}`}>
                      {u.isBlocked ? 'Blocked' : 'Active'}
                    </span>
                  </td>
                  <td className="mgmt__actions">
                    {editingId === u.id ? (
                      <>
                        <button className="mgmt__btn mgmt__btn--save" onClick={() => saveEdit(u.id)}>Save</button>
                        <button className="mgmt__btn mgmt__btn--cancel" onClick={() => setEditingId(null)}>Cancel</button>
                      </>
                    ) : (
                      <>
                        <button className="mgmt__btn mgmt__btn--rename" onClick={() => startEdit(u)}>Rename</button>
                        <button className={`mgmt__btn ${u.isBlocked ? 'mgmt__btn--unblock' : 'mgmt__btn--block'}`} onClick={() => toggleBlock(u)}>
                          {u.isBlocked ? 'Unblock' : 'Block'}
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h1 className="mgmt__title" style={{ marginTop: '3rem' }}>Suspicious Behavior</h1>
        <p className="mgmt__subtitle">Users flagged by the malicious behavior detection system.</p>

        <div className="mgmt__table-wrap">
          <table className="mgmt__table">
            <thead>
              <tr>
                <th>Detected At</th>
                <th>User ID</th>
                <th>Username</th>
                <th>Reason</th>
              </tr>
            </thead>
            <tbody>
              {suspiciousUsers.length === 0 && (
                <tr><td colSpan={4} className="mgmt__empty">No suspicious behavior detected.</td></tr>
              )}
              {suspiciousUsers.map(s => (
                <tr key={s.id}>
                  <td className="mgmt__id">{new Date(s.detectedAt).toLocaleString()}</td>
                  <td className="mgmt__id">{s.userId}</td>
                  <td className="mgmt__username">{s.username}</td>
                  <td className="mgmt__reason">{s.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
