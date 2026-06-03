import { getCategory, formatSize, formatDate } from '../utils/fileHelpers.js';
import '../styles/dashboard.css';

function FileIconSvg({ category }) 
{
  const colors = 
  {
    image: ['#c9a0e8', '#e8d0f8'],
    audio: ['#ffd4a0', '#fff0d8'],
    video: ['#98e0b0', '#d0f5e0'],
    text:  ['#87ceeb', '#d0eef8'],
    pdf:   ['#f4a0a0', '#fdd8d8'],
    other: ['#d0d0d0', '#ececec'],
  };

  const [dark, light] = colors[category] || colors.other;

  return (
    <svg viewBox="0 0 64 72" className="fgrid__icon-img" xmlns="http://www.w3.org/2000/svg">

      <rect x="4" y="8" width="48" height="58" rx="5" fill={light} />

      <polygon points="36,8 52,8 52,24" fill={dark} opacity="0.5" />
      <polygon points="36,8 52,24 36,24" fill={dark} opacity="0.25" />

      {category === 'image' && (
        <>
          <rect x="14" y="30" width="36" height="22" rx="3" fill={dark} opacity="0.3" />
          <circle cx="22" cy="37" r="4" fill={dark} opacity="0.6" />
          <polygon points="14,52 28,38 36,46 44,36 50,52" fill={dark} opacity="0.5" />
        </>
      )}

      {category === 'audio' && (
        <>
          <ellipse cx="22" cy="50" rx="6" ry="5" fill={dark} opacity="0.5" />
          <ellipse cx="42" cy="46" rx="6" ry="5" fill={dark} opacity="0.5" />
          <path d="M28 50 L28 30 L48 26 L48 46" stroke={dark} strokeWidth="3" fill="none" opacity="0.7" />
        </>
      )}

      {category === 'text' && (
        <>
          <line x1="14" y1="30" x2="50" y2="30" stroke={dark} strokeWidth="3" opacity="0.5" />
          <line x1="14" y1="38" x2="50" y2="38" stroke={dark} strokeWidth="3" opacity="0.5" />
          <line x1="14" y1="46" x2="38" y2="46" stroke={dark} strokeWidth="3" opacity="0.5" />
        </>
      )}

      {(category === 'other' || category === 'pdf') && (
        <text x="32" y="50" textAnchor="middle" fill={dark} fontSize="18" fontWeight="bold" opacity="0.6">
          {category === 'pdf' ? 'PDF' : '?'}
        </text>
      )}

      {category === 'video' && (
        <polygon points="20,30 20,52 48,41" fill={dark} opacity="0.5" />
      )}
    </svg>
  );
}

export default function FileGrid({ files, selected, onSelect, onDelete }) 
{
  const sel = selected;
  const hasDetails = !!sel;

  return (
    <div className="fgrid">
      <div className="fgrid__files">
        {files.map((f, i) => (
          <div key={f.id}
               className={`fgrid__item${sel?.id === f.id ? ' selected' : ''}`}
               onClick={() => onSelect(f)}
               style={{ animationDelay: `${i * 0.05}s` }}>
            <FileIconSvg category={getCategory(f.type)} />
            <span className="fgrid__name">{f.name}</span>
          </div>
        ))}

        {hasDetails && (
          <div className="fgrid__actions" style={{ position: 'absolute', bottom: 8, left: 8 }}>
            <button className="act-btn del" title="Delete"   onClick={() => onDelete(sel.id)}>🗑</button>
            <button className="act-btn dl"  title="Download" onClick={() => 
            {
              const url = URL.createObjectURL(sel.raw);
              const a = document.createElement('a');
              a.href = url; a.download = sel.name; a.click();
              URL.revokeObjectURL(url);
            }}>
              ⬇
            </button>
          </div>
        )}
      </div>

      <div className="fgrid__details">
        <h4>File Details</h4>
        <p>size:&nbsp;&nbsp;&nbsp;<span>{hasDetails ? formatSize(sel.size) : '--'}</span></p>
        <p>type:&nbsp;&nbsp;&nbsp;<span>{hasDetails ? getCategory(sel.type) : '--'}</span></p>
        <p>upload: <span>{hasDetails ? formatDate(sel.uploaded) : '--'}</span></p>
      </div>
    </div>
  );
}
