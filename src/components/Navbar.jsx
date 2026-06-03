import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import '../styles/navbar.css';

export default function Navbar() 
{
  const { user, logout } = useApp();
  const nav = useNavigate();
  const { pathname } = useLocation();

  const isAdmin = user?.role === 'Admin';

  const LINKS = [
    { label: 'Recent Files',    path: '/recent' },
    { label: 'Chat',            path: '/chat' },
    { label: 'Manage Profiles', path: isAdmin ? '/management' : null },
  ];

  return (
    <nav className="navbar">
      <span className="navbar__logo" onClick={() => nav('/dashboard')}>Floudy</span>

      <div className="navbar__links">
        {LINKS.map((l, i) => (
          <span key={l.label} style={{ display: 'contents' }}>
            {i > 0 && <span className="navbar__sep">|</span>}
            <span
              className={`navbar__link${l.path === pathname ? ' active' : ''}${!l.path ? ' disabled' : ''}`}
              onClick={() => l.path && nav(l.path)}
            >
              {l.label}
            </span>
          </span>
        ))}
      </div>

      <button className="navbar__logout" onClick={logout}>LOG OUT</button>
    </nav>
  );
}