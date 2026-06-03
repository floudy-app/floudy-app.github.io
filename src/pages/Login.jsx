import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import { validateLoginFields } from '../utils/validation.js';
import { loginUser } from '../utils/authHelpers.js';
import '../styles/global.css';
import '../styles/auth.css';

function KeyBg() 
{
  return (
    <img src="resources/svg/key.svg" className="auth__bg-icon"/>
  );
}

export default function Login() 
{
  const { login } = useApp();
  const nav = useNavigate();

  const [form, setForm] = useState({ username: '', password: '' });
  const [err, setErr]   = useState('');

  function set(field, val) 
  {
    setForm(f => ({ ...f, [field]: val }));
    setErr('');
  }

  async function submit() 
  {
    const e = validateLoginFields(form.username, form.password);
    if (e) { setErr(e); return; }

    try
    {
      const userData = await loginUser(form.username, form.password);
      login(userData);
      nav('/dashboard');
    }
    catch (ex)
    {
      setErr(ex.message || 'Login failed.');
    }
  }

  function handleKey(e) { if (e.key === 'Enter') submit(); }

  return (
    <div className="auth page-in">
      <KeyBg />

      <div className="auth__card">
        <h1 className="auth__heading">Sign in</h1>
        <p className="auth__subheading">to access your files</p>

        <input className={`auth__input${err ? ' error' : ''}`}
               placeholder="username or email"
               value={form.username}
               onChange={e => set('username', e.target.value)}
               onKeyDown={handleKey}
               autoComplete="username"
        />
        <input type="password"
               className={`auth__input${err ? ' error' : ''}`}
               placeholder="password"
               value={form.password}
               onChange={e => set('password', e.target.value)}
               onKeyDown={handleKey}
               autoComplete="current-password"
        />

        {err && <div className="err-msg">{err}</div>}

        <p className="auth__foot" style={{ marginTop: '0.4rem', marginBottom: '0.8rem', textAlign: 'right', fontSize: '0.85rem' }}>
          <span onClick={() => nav('/recovery')} style={{ color: '#4a90d9', cursor: 'pointer', fontWeight: 600 }}>Forgot password?</span>
        </p>

        <button className="auth__btn primary" onClick={submit}>LOG IN</button>

        <p className="auth__or">or, if you don't have an account…</p>
        <button className="auth__btn secondary" onClick={() => nav('/register')}>REGISTER</button>

        <p className="auth__foot">
          ← back to the <span onClick={() => nav('/')} style={{ color: '#4a90d9', cursor: 'pointer', fontWeight: 700 }}>home page.</span>
        </p>
      </div>
    </div>
  );
}
