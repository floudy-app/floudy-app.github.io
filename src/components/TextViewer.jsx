import { useState, useEffect } from 'react';
import '../styles/dashboard.css';

export default function TextViewer({ file, onClose }) 
{
  const [content, setContent] = useState('Loading…');

  useEffect(() => 
  {
    if (!file?.raw) return;
    const reader = new FileReader();
    reader.onload = e => setContent(e.target.result);
    reader.onerror = ()  => setContent('[error reading file]');
    reader.readAsText(file.raw);
  }, [file]);

  return (
    <div className="tviewer">
      <div className="tviewer__header">
        <span className="tviewer__title">{file?.name}</span>
        <button className="tviewer__close" onClick={onClose}>✕ Close</button>
      </div>
      <pre className="tviewer__content">{content}</pre>
    </div>
  );
}