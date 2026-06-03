import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp }       from '../context/AppContext.jsx';
import Navbar           from '../components/Navbar.jsx';
import FileTable        from '../components/FileTable.jsx';
import FileGrid         from '../components/FileGrid.jsx';
import Pagination       from '../components/Pagination.jsx';
import TextViewer       from '../components/TextViewer.jsx';
import StatsPanel       from '../components/StatsPanel.jsx';
import '../styles/global.css';
import '../styles/dashboard.css';

export default function Dashboard() 
{
  const { files, 
          upload, 
          remove, 
          rename, 
          viewMode, 
          setViewMode,
          pageCount,
          currentPage, 
          switchPage,
          syncFiles,
          logout,
          setForceLogoutHandler,
          logFileDownload } = useApp();

  const [selected, setSelected] = useState(null);
  const [viewing, setViewing]   = useState(false);
  const fileInputRef            = useRef(null);
  const nav = useNavigate();

  useEffect(() =>
  {
    setForceLogoutHandler(() =>
    {
      logout();
      nav('/login', { replace: true });
    });

    syncFiles();

    return () => setForceLogoutHandler(null);
  }, []);

  async function handleUpload(e) 
  {
    if (!e.target.files?.length) return;

    await switchPage(1);
    await upload(e.target.files);
    setSelected(null);

    e.target.value = '';
  }

  function handleSelect(f) 
  {
    setSelected(prev => prev?.id === f.id ? null : f);
    setViewing(false);
  }

  function handleDelete(id) 
  {
    remove(id);
    if (selected?.id === id) setSelected(null);
  }

  function handleRename(id, name) 
  {
    rename(id, name);
    if (selected?.id === id) setSelected(prev => ({ ...prev, name }));
  }

  function switchView(mode) 
  {
    setViewMode(mode);
    setSelected(null);
    setViewing(false);
  }

  function handleViewText()
  {
    if (!selected) return;
    const newViewing = !viewing;
    setViewing(newViewing);
    if (newViewing) logFileDownload(selected.name);
  }

  return (
    <div>
      <Navbar />
      <div className="dash page-in">

        <div className="dash__toolbar">
          <button className="dash__upload" onClick={() => fileInputRef.current?.click()}>
            UPLOAD FILES
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            style={{ display: 'none' }}
            onChange={handleUpload}
          />
          <button
            className={`dash__view-text${selected ? ' active' : ''}`}
            onClick={handleViewText}
          >
            VIEW AS TEXT
          </button>
          <button
            className={"dash__upload"}
            onClick={() => 
            { 
              let names = [];
              for (let i = 0; i < 50; i++) names.push(`file${i}.txt`);

              let buffers = names.map(n => new File([], n,
              {
                type: Math.random() > 0.5 ? "text/text" : "image/png",
                lastModified: Date.now() - (Math.random() > 0.5 ? (1000 * 60 * 60 * 24 * 7 * 4 * Math.random() * 10) : 0)
              }));

              upload(buffers, false);
              switchPage(1);

              setSelected(null);
            }}
          >
            ADD 50 DUMMY FILES
          </button>
          <div className="dash__tools">
            <button
              className={`dash__icon-btn view-toggle${viewMode === 'table' ? ' on' : ''}`}
              title="Table view"
              onClick={() => switchView('table')}
            >☰</button>
            <button
              className={`dash__icon-btn view-toggle${viewMode === 'icon' ? ' on' : ''}`}
              title="Icon view"
              onClick={() => switchView('icon')}
            >⊞</button>
          </div>
        </div>

        {viewing && selected && (
          <div style={{ marginBottom: '1rem' }}>
            <TextViewer file={selected} onClose={() => setViewing(false)} />
          </div>
        )}

        <div className="dash__split">
          <div className="dash__split-files">
            <div className="dash__panel">
              {viewMode === 'table' ? (
                <FileTable
                  files={files}
                  selected={selected}
                  onSelect={handleSelect}
                  onDelete={handleDelete}
                  onRename={handleRename}
                />
              ) : (
                <FileGrid
                  files={files}
                  selected={selected}
                  onSelect={handleSelect}
                  onDelete={handleDelete}
                />
              )}
            </div>
            <div className="dash__status">
              <span>{selected ? selected.name : 'No file selected.'}</span>
              <Pagination/>
              <span>(personal dashboard)</span>
            </div>
          </div>

          <div className="dash__split-stats">
            <div className="dash__panel dash__stats-embed">
              <StatsPanel/>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}