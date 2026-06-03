import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import Navbar from '../components/Navbar.jsx';
import { formatSize, mimeLabel, formatDate } from '../utils/fileHelpers.js';
import '../styles/global.css';
import '../styles/components.css';

export default function RecentFiles() {
  const { recentFiles, logout, setForceLogoutHandler } = useApp();
  const nav = useNavigate();

  useEffect(() =>
  {
    setForceLogoutHandler(() =>
    {
      logout();
      nav('/login', { replace: true });
    });
    return () => setForceLogoutHandler(null);
  }, []);

  return (
    <div>
      <Navbar />
      <div className="recent page-in">
        <div className="recent__panel">
          {recentFiles.length === 0 ? (
            <p className="recent__empty">No files uploaded yet.</p>
          ) : (
            <table className="ftable" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th className="hide-mobile">Size</th>
                  <th className="hide-mobile">File Type</th>
                  <th>Upload Date</th>
                </tr>
              </thead>
              <tbody>
                {recentFiles.map((f, i) => (
                  <tr key={f.id} style={{ animationDelay: `${i * 0.04}s` }}>
                    <td style={{ color: 'var(--text-mid)', fontWeight: 700 }}>{f.id}</td>
                    <td style={{ fontWeight: 700 }}>{f.name}</td>
                    <td className="hide-mobile">{formatSize(f.size)}</td>
                    <td className="hide-mobile">{mimeLabel(f.type)}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.82rem' }}>{formatDate(f.uploaded)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
