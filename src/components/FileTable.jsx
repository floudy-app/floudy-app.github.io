import { useState } from 'react';
import { formatSize, getCategory, formatDate } from '../utils/fileHelpers.js';
import { validateFilename } from '../utils/validation.js';
import { useApp } from '../context/AppContext.jsx';
import '../styles/dashboard.css';

function download(file)
{
  const url = URL.createObjectURL(file.raw);
  const a = document.createElement('a');
  a.href = url;
  a.download = file.name;
  a.click();
  URL.revokeObjectURL(url);
}

export default function FileTable({ files, selected, onSelect, onDelete, onRename }) 
{
  const { currentPage } = useApp();

  const [renaming, setRenaming] = useState(null); // file id being renamed
  const [nameVal, setNameVal]   = useState('');
  const [nameErr, setNameErr]   = useState('');

  function startRename(file, e) 
  {
    e.stopPropagation();
    setRenaming(file.id);
    setNameVal(file.name);
    setNameErr('');
  }

  function commitRename(id) 
  {
    const err = validateFilename(nameVal);
    if (err) { setNameErr(err); return; }
    onRename(id, nameVal.trim());
    setRenaming(null);
  }

  function handleKeyDown(e, id) 
  {
    if (e.key === 'Enter') commitRename(id);
    if (e.key === 'Escape') setRenaming(null);
  }

  return (
    <table className="ftable">
      <thead>
        <tr>
          <th>#</th>
          <th>Name</th>
          <th className="hide-mobile">Size</th>
          <th className="hide-mobile">File Type</th>
          <th className="hide-mobile">Upload Date</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {files.map((f, i) => (
          <tr
            key={f.id}
            className={selected?.id === f.id ? 'selected' : ''}
            onClick={() => onSelect(f)}
            style={{ animationDelay: `${i * 0.04}s` }}
          >
            <td className="ftable__num">{f.id}</td>
            <td>
              {renaming === f.id ? (
                <div>
                  <input
                    className="ftable__rename"
                    value={nameVal}
                    autoFocus
                    onChange={e => { setNameVal(e.target.value); setNameErr(''); }}
                    onBlur={() => commitRename(f.id)}
                    onKeyDown={e => handleKeyDown(e, f.id)}
                    onClick={e => e.stopPropagation()}
                  />
                  {nameErr && <div className="err-msg">{nameErr}</div>}
                </div>
              ) : f.name}
            </td>
            <td className="hide-mobile">{formatSize(f.size)}</td>
            <td className="hide-mobile">{getCategory(f.type)}</td>
            <td className="hide-mobile">{formatDate(f.uploaded)}</td>
            <td onClick={e => e.stopPropagation()}>
              <button className="act-btn del" title="Delete"  onClick={() => onDelete(f.id)}>🗑</button>
              <button className="act-btn ren" title="Rename"  onClick={e => startRename(f, e)}>✎</button>
              <button className="act-btn dl"  title="Download" onClick={() => download(f)}>⬇</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
