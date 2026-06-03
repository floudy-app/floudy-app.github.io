const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost';

export const API_BASE = `http://${hostname}:5057`;

export function getAuthHeaders(extraHeaders = {}) 
{
  const saved = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('fl_user') : null;
  const token = saved ? JSON.parse(saved).token : null;
  const headers = { ...extraHeaders };

  if (token) headers['Authorization'] = `Bearer ${token}`;

  return headers;
}
