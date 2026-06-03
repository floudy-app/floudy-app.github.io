import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { checkRecovery, sendRecovery, validateRecoveryToken, resetPassword } from '../utils/authHelpers.js';
import { validatePassword, validateMatch } from '../utils/validation.js';
import '../styles/global.css';
import '../styles/auth.css';

function ShieldBg() {
  return (
    <svg className="auth__bg-icon" viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M50 5L10 25V55C10 82 28 106 50 115C72 106 90 82 90 55V25L50 5Z" 
            fill="currentColor" opacity="0.15"/>
      <path d="M45 65L35 55L31 59L45 73L71 47L67 43L45 65Z" 
            fill="currentColor" opacity="0.2"/>
    </svg>
  );
}

export default function Recovery() 
{
  const nav = useNavigate();
  const [searchParams] = useSearchParams();
  const userParam = searchParams.get('user');
  const resetParam = searchParams.get('reset');

  const [input, setInput] = useState('');
  const [err, setErr] = useState('');
  const [status, setStatus] = useState(''); // '' | 'checking' | 'sending' | 'sent' | 'error'
  const [message, setMessage] = useState('');

  // Password reset specific states
  const [tokenValid, setTokenValid] = useState(null); // null = verifying, true = valid, false = invalid/expired
  const [tokenError, setTokenError] = useState(''); // '' | 'expired' | 'error'
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetError, setResetError] = useState('');
  const [resetStatus, setResetStatus] = useState(''); // '' | 'submitting' | 'success' | 'expired'

  // If we land with ?user=<value>, auto-trigger the send
  useEffect(() => {
    if (userParam) {
      setStatus('sending');
      sendRecovery(userParam)
        .then(data => {
          setStatus('sent');
          setMessage(data.message || 'A recovery email has been sent.');
        })
        .catch(ex => {
          setStatus('error');
          setErr(ex.message || 'Failed to send recovery email.');
        });
    }
  }, [userParam]);

  // If we land with ?reset=<token>, validate it on mount
  useEffect(() => {
    if (resetParam) {
      validateRecoveryToken(resetParam)
        .then(() => {
          setTokenValid(true);
        })
        .catch(ex => {
          if (ex.status === 401) {
            nav('/recovery', { replace: true });
          } else if (ex.status === 410) {
            setTokenValid(false);
            setTokenError('expired');
          } else {
            setTokenValid(false);
            setTokenError('error');
            setResetError(ex.message || 'Failed to validate reset token.');
          }
        });
    }
  }, [resetParam, nav]);

  async function handleCheck() {
    if (!input.trim()) {
      setErr('Please enter your username or email.');
      return;
    }

    setErr('');
    setStatus('checking');

    try {
      await checkRecovery(input);
      // Redirect with user param to trigger the send
      nav(`/recovery?user=${encodeURIComponent(input)}`);
    } catch (ex) {
      setStatus('error');
      setErr(ex.message || 'Username/email does not exist.');
    }
  }

  async function handleResetSubmit(e) {
    e.preventDefault();

    const passErr = validatePassword(newPassword);
    if (passErr) {
      setResetError(passErr);
      return;
    }

    const matchErr = validateMatch(newPassword, confirmPassword);
    if (matchErr) {
      setResetError(matchErr);
      return;
    }

    setResetError('');
    setResetStatus('submitting');

    try {
      await resetPassword(resetParam, newPassword);
      nav('/login', { replace: true });
    } catch (ex) {
      if (ex.status === 410) {
        setResetStatus('expired');
      } else if (ex.status === 401) {
        nav('/recovery', { replace: true });
      } else {
        setResetStatus('');
        setResetError(ex.message || 'Failed to reset password.');
      }
    }
  }

  function handleKey(e) { if (e.key === 'Enter') handleCheck(); }

  if (resetParam) {
    if (tokenValid === null) {
      return (
        <div className="auth page-in">
          <ShieldBg />
          <div className="auth__card">
            <h1 className="auth__heading" style={{ marginBottom: '0.6rem' }}>Verifying link</h1>
            <p className="auth__subheading">Please wait while check your request.</p>
          </div>
        </div>
      );
    }

    if (tokenValid === false && tokenError === 'expired') {
      return (
        <div className="auth page-in">
          <ShieldBg />
          <div className="auth__card">
            <h1 className="auth__heading" style={{ marginBottom: '0.6rem' }}>Link Expired</h1>
            <p className="auth__subheading" style={{ color: '#e8403a', marginBottom: '1.2rem' }}>
              Your password reset session has expired. Password reset links are only valid for 5 minutes.
            </p>
            <button className="auth__btn secondary" onClick={() => nav('/recovery', { replace: true })}>
              ← REQUEST NEW LINK
            </button>
          </div>
        </div>
      );
    }

    if (resetStatus === 'success') {
      return (
        <div className="auth page-in">
          <ShieldBg />
          <div className="auth__card">
            <h1 className="auth__heading" style={{ marginBottom: '0.6rem' }}>Reset Password</h1>
            <p className="auth__subheading" style={{ color: '#4ec97b', marginBottom: '1.2rem' }}>
              Password reset successfully.
            </p>
            <p className="auth__foot" style={{ marginBottom: '1rem' }}>
              You can now log in to your account with your new password.
            </p>
            <button className="auth__btn primary" onClick={() => nav('/login', { replace: true })}>
              GO TO LOG IN
            </button>
          </div>
        </div>
      );
    }

    if (resetStatus === 'expired') {
      return (
        <div className="auth page-in">
          <ShieldBg />
          <div className="auth__card">
            <h1 className="auth__heading" style={{ marginBottom: '0.6rem' }}>Session Expired</h1>
            <p className="auth__subheading" style={{ color: '#e8403a', marginBottom: '1.2rem' }}>
              Your session has expired. Please request a new recovery link.
            </p>
            <button className="auth__btn secondary" onClick={() => nav('/recovery', { replace: true })}>
              ← REQUEST NEW LINK
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="auth page-in">
        <ShieldBg />
        <div className="auth__card">
          <h1 className="auth__heading" style={{ marginBottom: '0.6rem' }}>Reset Password</h1>
          <p className="auth__subheading" style={{ marginBottom: '1.2rem' }}>
            Please enter your new password below.
          </p>

          <form onSubmit={handleResetSubmit}>
            <input
              type="password"
              className={`auth__input${resetError && (resetError.includes('password') || resetError.includes('Password')) ? ' error' : ''}`}
              placeholder="new password"
              value={newPassword}
              onChange={e => { setNewPassword(e.target.value); setResetError(''); }}
              autoComplete="new-password"
            />

            <input
              type="password"
              className={`auth__input${resetError && resetError.includes('match') ? ' error' : ''}`}
              placeholder="confirm new password"
              value={confirmPassword}
              onChange={e => { setConfirmPassword(e.target.value); setResetError(''); }}
              autoComplete="new-password"
              style={{ marginTop: '0.6rem' }}
            />

            {resetError && <div className="err-msg" style={{ marginBottom: '0.6rem' }}>{resetError}</div>}

            <button
              type="submit"
              className="auth__btn primary"
              style={{ marginTop: '0.6rem' }}
              disabled={resetStatus === 'submitting'}
            >
              {resetStatus === 'submitting' ? 'RESETTING…' : 'RESET PASSWORD'}
            </button>
          </form>

          <p className="auth__foot" style={{ marginTop: '1.2rem' }}>
            ← return to{' '}
            <span onClick={() => nav('/recovery', { replace: true })} style={{ color: '#4a90d9', cursor: 'pointer', fontWeight: 700 }}>password recovery.</span>
          </p>
        </div>
      </div>
    );
  }

  if (userParam) {
    return (
      <div className="auth page-in">
        <ShieldBg />
        <div className="auth__card">
          <h1 className="auth__heading" style={{ marginBottom: '0.6rem' }}>Password recovery</h1>

          {status === 'sending' && (
            <p className="auth__subheading" style={{ marginBottom: '1.2rem' }}>
              Sending recovery email…
            </p>
          )}

          {status === 'sent' && (
            <>
              <p className="auth__subheading" style={{ color: '#4ec97b', marginBottom: '1.2rem' }}>
                ✓ {message}
              </p>
              <p className="auth__foot" style={{ marginBottom: '0.6rem' }}>
                Check your inbox and follow the instructions.
              </p>
            </>
          )}

          {status === 'error' && (
            <div className="err-msg" style={{ marginBottom: '1rem' }}>{err}</div>
          )}

          <button className="auth__btn secondary" onClick={() => nav('/login')}>
            ← BACK TO LOG IN
          </button>
        </div>
      </div>
    );
  }

  // ── Default State (username/email entry form) ──────────────
  return (
    <div className="auth page-in">
      <ShieldBg />

      <div className="auth__card">
        <h1 className="auth__heading" style={{ marginBottom: '0.6rem' }}>Password recovery</h1>
        <p className="auth__subheading" style={{ marginBottom: '1rem' }}>
          Enter your username or email to recover your account.
        </p>

        <input
          className={`auth__input${err ? ' error' : ''}`}
          placeholder="username or email"
          value={input}
          onChange={e => { setInput(e.target.value); setErr(''); }}
          onKeyDown={handleKey}
          autoComplete="username"
        />

        {err && <div className="err-msg">{err}</div>}

        <button 
          className="auth__btn primary" 
          style={{ marginTop: '0.4rem' }} 
          onClick={handleCheck}
          disabled={status === 'checking'}
        >
          {status === 'checking' ? 'CHECKING…' : 'RECOVER ACCOUNT'}
        </button>

        <p className="auth__foot">
          ← return to the{' '}
          <span onClick={() => nav('/login')} style={{ color: '#4a90d9', cursor: 'pointer', fontWeight: 700 }}>log in page.</span>
        </p>
      </div>
    </div>
  );
}
