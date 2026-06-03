import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { deleteFile, getFiles, getRecentFiles, getTypeStats, getUploadStats, renameFile, sendFile, logAction } from '../utils/crudHelpers.js';
import { trackActivity, setPreference, getPreference } from '../utils/cookies.js';
import { buildRecord } from '../utils/fileHelpers.js';
import { API_BASE, getAuthHeaders } from '../utils/apiConfig.js';
import * as signalR from '@microsoft/signalr';

const Ctx = createContext(null);

const INACTIVITY_TIMEOUT_MS = 10 * 60 * 1000;

export function AppProvider({ children })
{
  const [user, setUser] = useState(() => {
    const saved = sessionStorage.getItem('fl_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [files, setFiles] = useState([]);
  const [recentFiles, setRecentFiles] = useState([]);
  const [pageCount, setPageCount] = useState(1);
  const [typeStats, setTypeStats] = useState([]);
  const [uploadStats, setUploadStats] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewModeState] = useState(() => getPreference('viewMode', 'table'));
  const connectionRef = useRef(null);
  const onForceLogoutRef = useRef(null);
  const inactivityTimerRef = useRef(null);

  useEffect(() => {
    if (user) { sessionStorage.setItem('fl_user', JSON.stringify(user)); } 
    else { sessionStorage.removeItem('fl_user'); }
  }, [user]);

  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    inactivityTimerRef.current = setTimeout(() => { performLogout(); }, INACTIVITY_TIMEOUT_MS);
  }, []);

  useEffect(() => {
    if (!user) {
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
      return;
    }

    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    const handler = () => resetInactivityTimer();

    events.forEach(e => window.addEventListener(e, handler, { passive: true }));
    resetInactivityTimer();

    return () => {
      events.forEach(e => window.removeEventListener(e, handler));
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    };
  }, [user, resetInactivityTimer]);

  const login = useCallback((userData) => 
  {
    setUser(userData);
    setPreference('lastUser', userData.username);
    trackActivity('login');
  }, []);

  useEffect(() =>
  {
    if (!user) return;

    const connection = new signalR.HubConnectionBuilder()
                                  .withUrl(`${API_BASE}/floudyhub`)
                                  .withAutomaticReconnect()
                                  .build();

    connection.on('ForceLogout', () => { if (onForceLogoutRef.current) onForceLogoutRef.current(); });

    connection.on('FileChanged', async () => await syncFilesInternal(currentPage));
    connection.start().then(() => connection.invoke('JoinGroup', user.username));
    connectionRef.current = connection;

    return () =>
    {
      if (connectionRef.current)
      {
        connectionRef.current.invoke('LeaveGroup', user.username).catch(() => {});
        connectionRef.current.stop();
        connectionRef.current = null;
      }
    };
  }, [user?.username]);

  const setForceLogoutHandler = useCallback((handler) =>
  {
    onForceLogoutRef.current = handler;
  }, []);

  const syncStats = useCallback(async () =>
  {
    let types = await getTypeStats();
    let dates = await getUploadStats();

    setTypeStats(types.entries);
    setUploadStats(dates.entries);
  });

  const syncFilesInternal = async (page) =>
  {
    let data = await getFiles(page);

    setFiles(data.files);
    setPageCount(data.total_pages);

    let recent = await getRecentFiles(30);
    setRecentFiles(recent.files);

    let types = await getTypeStats();
    let dates = await getUploadStats();
    setTypeStats(types.entries);
    setUploadStats(dates.entries);
  };

  const syncFiles = useCallback(async (page = currentPage) => 
  {
    let data = await getFiles(page);

    setFiles(data.files);
    setPageCount(data.total_pages);

    await syncRecentFiles();
    await syncStats();
  });

  const syncRecentFiles = useCallback(async (count = 30) =>
  {
    let data = await getRecentFiles(count);
    setRecentFiles(data.files);
  });

  const switchPage = useCallback(async (page) =>
  {
    setCurrentPage(page);
    await syncFiles(page);
  });

  const performLogout = useCallback(() => 
  {
    const saved = sessionStorage.getItem('fl_user');
    const currentUser = saved ? JSON.parse(saved) : null;

    if (currentUser?.token) {
      fetch(`${API_BASE}/api/auth/logout`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${currentUser.token}` }
      }).catch(() => {});
    }

    if (currentUser) logAction(currentUser, 'logout', 'User logged out of the application');

    if (connectionRef.current && currentUser)
    {
      connectionRef.current.invoke('LeaveGroup', currentUser.username).catch(() => {});
      connectionRef.current.stop();
      connectionRef.current = null;
    }

    sessionStorage.removeItem('fl_user');
    setUser(null);
    setFiles([]);
    trackActivity('logout');
  }, []);

  const logout = performLogout;

  const upload = useCallback(async (rawFiles, autoDate = true) => 
  {
    const records = Array.from(rawFiles).map((f, i) => buildRecord(f, i, autoDate));
    for (const file of records) await sendFile(file);

    const fileNames = records.map(r => r.name);
    const fileSizes = records.map(r => r.size);

    await logAction(user, 'file_upload', `Uploaded ${records.length} file(s): ${fileNames.slice(0, 5).join(', ')}${fileNames.length > 5 ? '...' : ''}`, {
      fileCount: records.length,
      fileNames,
      fileSizes
    });

    await syncFiles();
    trackActivity('upload');
  }, [user]);

  const remove = useCallback(async id => 
  {
    await deleteFile(id);
    await syncFiles();

    trackActivity('delete');
  }, [user]);

  const rename = useCallback(async (id, name) => 
  {
    await renameFile(id, name);
    await syncFiles();

    trackActivity('rename');
  }, [user]);

  const setViewMode = useCallback((mode) =>
  {
    setViewModeState(mode);
    setPreference('viewMode', mode);

    if (user) logAction(user, 'view_mode_change', `Switched view mode to "${mode}"`);

    trackActivity(`view:${mode}`);
  }, [user]);

  const logFileDownload = useCallback((fileName) =>
  {
    if (user) logAction(user, 'file_download', `Viewed file: "${fileName}"`);
  }, [user]);

  return (
    <Ctx.Provider value={{ user, 
                           login, 
                           logout, 
                           files, 
                           upload, 
                           remove, 
                           rename, 
                           viewMode, 
                           setViewMode, 
                           syncFiles,
                           pageCount,
                           currentPage,
                           switchPage,
                           recentFiles,
                           uploadStats,
                           typeStats,
                           setForceLogoutHandler,
                           logFileDownload }}>
      {children}
    </Ctx.Provider>
  );
}

export const useApp = () => useContext(Ctx);
