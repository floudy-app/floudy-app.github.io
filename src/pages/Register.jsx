import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { validateUsername, validateEmail, validatePassword, validateMatch } from '../utils/validation.js';
import { registerUser, checkUsername } from '../utils/authHelpers.js';
import '../styles/global.css';
import '../styles/auth.css';

function PersonBg() {
  return (
    <img src="resources/svg/person.svg" className="auth__bg-icon"/>
  );
}

export default function Register() 
{
  const nav = useNavigate();

  const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '' });
  const [errs, setErrs]  = useState({});

  function set(field, val) {
    setForm(f => ({ ...f, [field]: val }));
    setErrs(e => ({ ...e, [field]: null }));
  }

  async function handleUsernameBlur() {
    if (!form.username || form.username.length < 3) return;
    const exists = await checkUsername(form.username);
    if (exists) setErrs(e => ({ ...e, username: 'Username already taken.' }));
  }

  function validate() {
    const e = {
      username: validateUsername(form.username),
      email: validateEmail(form.email),
      password: validatePassword(form.password),
      confirm:  validateMatch(form.password, form.confirm),
    };
    setErrs(e);
    return !Object.values(e).some(Boolean);
  }

  async function submit() {
    if (!validate()) return;

    try
    {
      await registerUser(form.username, form.email, form.password);
      nav('/login');
    }
    catch (ex)
    {
      setErrs(e => ({ ...e, username: ex.message || 'Registration failed.' }));
    }
  }

  const field = (key, type, ph, extraProps = {}) => (
    <>
      <input
        type={type}
        className={`auth__input${errs[key] ? ' error' : ''}`}
        placeholder={ph}
        value={form[key]}
        onChange={e => set(key, e.target.value)}
        onKeyDown={ev => ev.key === 'Enter' && submit()}
        autoComplete={key === 'confirm' ? 'new-password' : key}
        {...extraProps}
      />
      {errs[key] && <div className="err-msg">{errs[key]}</div>}
    </>
  );

  return (
    <div className="auth page-in">
      <PersonBg />

      <div className="auth__card">
        <h1 className="auth__heading" style={{ marginBottom: '1.2rem' }}>Create an account</h1>

        {field('username', 'text', 'username', { onBlur: handleUsernameBlur })}
        {field('email', 'email', 'email address')}
        {field('password', 'password', 'password')}
        {field('confirm',  'password', 'confirm password')}

        <button className="auth__btn primary" style={{ marginTop: '0.4rem' }} onClick={submit}>
          CREATE YOUR ACCOUNT
        </button>

        <p className="auth__foot">
          if you already have an account, return to the<br/>{' '}
          <span onClick={() => nav('/login')} style={{ color: '#4a90d9', cursor: 'pointer', fontWeight: 700 }}>log in page.</span>
        </p>
      </div>
    </div>
  );
}
