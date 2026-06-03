import UploadDateChart from './UploadDateChart.jsx';
import FileTypeDonut   from './FileTypeDonut.jsx';
import { getCategory, CATEGORY_COLORS } from '../utils/fileHelpers.js';
import { useApp } from '../context/AppContext.jsx';
import '../styles/stats.css';

export default function StatsPanel() {
  
  const { typeStats } = useApp();

  return (
    <div className="stats__inner">
      <div className="stats__half">
        <h3 className="stats__ttl">By Upload Date</h3>
        <UploadDateChart/>
      </div>

      <div className="stats__divider" />

      <div className="stats__half">
        <h3 className="stats__ttl">By File Type</h3>
        <FileTypeDonut/>

        {typeStats.length > 0 && (
          <div className="donut-legend">
            {typeStats.map(entry => (
              <div key={entry.type} className="donut-legend__item">
                <div className="donut-legend__dot" style={{ background: CATEGORY_COLORS[entry.type] }} />
                {entry.type} ({entry.count})
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
