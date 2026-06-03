export function setCookie(name, value, days = 30) 
{
  const exp = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(String(value))};expires=${exp};path=/`;
}

export function getCookie(name) 
{
  const m = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
  return m ? decodeURIComponent(m[1]) : null;
}

export function deleteCookie(name) 
{
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/`;
}

// append to a rolling activity log (max 20 entries)
export function trackActivity(action) 
{
  try 
  {
    const raw = getCookie('fl_activity') || '[]';
    const log = JSON.parse(raw);

    log.unshift({ action, t: Date.now() });
    if (log.length > 20) log.length = 20;

    setCookie('fl_activity', JSON.stringify(log), 7);
  } 
  catch (_) { setCookie('fl_activity', JSON.stringify([{ action, t: Date.now() }]), 7); }
}

export function setPreference(key, value) 
{
  setCookie(`fl_pref_${key}`, value, 365);
}

export function getPreference(key, fallback = null) 
{
  return getCookie(`fl_pref_${key}`) ?? fallback;
}
