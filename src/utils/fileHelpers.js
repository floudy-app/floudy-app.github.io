export function formatSize(bytes) 
{
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(0)}KB`;
  if (bytes < 1073741824) return `${(bytes / 1048576).toFixed(0)}MB`;

  return `${(bytes / 1073741824).toFixed(1)}GB`;
}

export function getCategory(mime = '') 
{
  if (mime.startsWith('image/')) return 'image';
  if (mime.startsWith('audio/')) return 'audio';
  if (mime.startsWith('video/')) return 'video';
  if (mime.startsWith('text/')) return 'text';
  if (mime.includes('pdf')) return 'pdf';

  return 'other';
}

export function mimeLabel(mime = '') 
{
  if (!mime) return 'unknown';
  const [sub, type] = mime.split('/');
  return type ? `${type}/${sub}` : sub;
}

export function formatDate(ts) 
{
  const d = new Date(ts);
  const p = n => String(n).padStart(2, '0');

  return `${d.getFullYear()}/${p(d.getMonth() + 1)}/${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}

export function monthKey(ts) 
{
  const d = new Date(ts);
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export const CATEGORY_COLORS = 
{
  image: '#c9a0e8',
  text:  '#87ceeb',
  audio: '#ffd4a0',
  video: '#98e0b0',
  pdf:   '#f4a0a0',
  other: '#d0d0d0',
};

export function buildRecord(file, index, autoDate = true) 
{
  return {
            name: file.name,
            size: file.size,
            type: file.type,
            uploaded: autoDate ? Date.now() : file.lastModified,
            raw: file,
         };
}