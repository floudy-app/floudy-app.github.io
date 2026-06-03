import '../styles/components.css';
import { useApp } from '../context/AppContext.jsx';

export default function Pagination() 
{
  const { 
          pageCount,
          currentPage,
          switchPage,
        } 
        = useApp();

  const go = (p) => 
    {
      console.log(p);
      switchPage(Math.max(1, Math.min(p, pageCount)));
    }

  return (
    <div className="pagination">
      <button className="pagination__btn arrow" onClick={() => go(1)}       disabled={currentPage === 1}>{'<<'}</button>
      <button className="pagination__btn arrow" onClick={() => go(currentPage - 1)} disabled={currentPage === 1}>{'<'}</button>
      <span className="pagination__current">{currentPage}/{pageCount}</span>
      <button className="pagination__btn arrow" onClick={() => go(currentPage + 1)} disabled={currentPage === pageCount}>{'>'}</button>
      <button className="pagination__btn arrow" onClick={() => go(pageCount)}   disabled={currentPage === pageCount}>{'>>'}</button>
    </div>
  );
}
