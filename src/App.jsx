import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useApp } from './context/AppContext.jsx';

import Home        from './pages/Home.jsx';
import Login       from './pages/Login.jsx';
import Register    from './pages/Register.jsx';
import Dashboard   from './pages/Dashboard.jsx';
import RecentFiles from './pages/RecentFiles.jsx';
import Management  from './pages/Management.jsx';
import Chat        from './pages/Chat.jsx';
import Recovery    from './pages/Recovery.jsx';

const FAVICON_PATH = '/resources/favicon.png';

function Guard({ children }) 
{
  const { user } = useApp();
  return user ? children : <Navigate to="/login" replace />;
}

function AdminGuard({ children })
{
  const { user } = useApp();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'Admin') return <Navigate to="/login" replace />;
  return children;
}

function AuthOnly({ children }) 
{
  const { user } = useApp();
  return user ? <Navigate to="/dashboard" replace /> : children;
}

function DocumentHead() 
{
  useEffect(() => {
    const existing = document.querySelectorAll("link[data-floudy-icon='true']");
    existing.forEach(node => node.remove());

    const icon = document.createElement('link');
    icon.rel = 'icon';
    icon.type = 'image/png';
    icon.href = FAVICON_PATH;
    icon.setAttribute('data-floudy-icon', 'true');
    document.head.appendChild(icon);

    const apple = document.createElement('link');
    apple.rel = 'apple-touch-icon';
    apple.href = FAVICON_PATH;
    apple.setAttribute('data-floudy-icon', 'true');
    document.head.appendChild(apple);
  }, []);

  return null;
}

export default function App() 
{
  return (
    <BrowserRouter>
      <DocumentHead />
      <Routes>
        <Route path="/"           element={<Home />} />
        <Route path="/login"      element={<AuthOnly><Login /></AuthOnly>} />
        <Route path="/register"   element={<AuthOnly><Register /></AuthOnly>} />
        <Route path="/recovery"   element={<Recovery />} />
        <Route path="/dashboard"  element={<Guard><Dashboard /></Guard>} />
        <Route path="/recent"     element={<Guard><RecentFiles /></Guard>} />
        <Route path="/chat"       element={<Guard><Chat /></Guard>} />
        <Route path="/management" element={<AdminGuard><Management /></AdminGuard>} />
        <Route path="*"           element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
