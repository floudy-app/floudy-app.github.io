import { getCategory, CATEGORY_COLORS } from '../utils/fileHelpers.js';
import { useApp } from '../context/AppContext.jsx';

const R_OUT = 90, R_IN = 46, CX = 110, CY = 110;

function arcPath(startAngle, endAngle, rOut, rIn, cx, cy) 
{
  const rad = a => (a - 90) * (Math.PI / 180);
  const cos = (a, r) => cx + r * Math.cos(rad(a));
  const sin = (a, r) => cy + r * Math.sin(rad(a));
  const large = endAngle - startAngle > 180 ? 1 : 0;

  return [
    `M ${cos(startAngle, rOut)} ${sin(startAngle, rOut)}`,
    `A ${rOut} ${rOut} 0 ${large} 1 ${cos(endAngle, rOut)} ${sin(endAngle, rOut)}`,
    `L ${cos(endAngle, rIn)} ${sin(endAngle, rIn)}`,
    `A ${rIn} ${rIn} 0 ${large} 0 ${cos(startAngle, rIn)} ${sin(startAngle, rIn)}`,
    'Z',
  ].join(' ');
}

function midAngle(start, end) { return (start + end) / 2; }

export default function FileTypeDonut() 
{
  const { typeStats } = useApp();

  const entries = typeStats.filter(entry => entry.count > 0);
  if (!entries.length) 
  {
    return (
      <svg viewBox="0 0 220 220" style={{ width: '100%', maxWidth: 220 }}>
        <text x={CX} y={CY + 5} textAnchor="middle" fill="#c0a090" fontSize="13" fontFamily="Nunito,sans-serif">
          No data yet
        </text>
      </svg>
    );
  }

  const total = entries.reduce((s, entry) => s + entry.count, 0);
  let angle = 0;

  const slices = entries.map(entry => 
  {
    const sweep = (entry.count / total) * 360;
    const slice = { cat: entry.type, count: entry.count, start: angle, end: angle + sweep, color: CATEGORY_COLORS[entry.type] };
    angle += sweep;
    return slice;
  });

  return (
    <svg viewBox="0 0 220 220" style={{ width: '100%', maxWidth: 220 }}>
      {slices.map(s => {
        const mid = midAngle(s.start, s.end);
        const rad = (mid - 90) * (Math.PI / 180);
        const labelR = (R_OUT + R_IN) / 2;
        const lx = CX + labelR * Math.cos(rad);
        const ly = CY + labelR * Math.sin(rad);

        return (
          <g key={s.cat}>
            <path
              d={arcPath(s.start, s.end, R_OUT, R_IN, CX, CY)}
              fill={s.color}
              stroke="white"
              strokeWidth="2"
            >
              <title>{s.cat}: {s.count}</title>
            </path>

            {/* only show label if slice is large enough */}
            {s.end - s.start > 28 && (
              <text
                x={lx} y={ly}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="white"
                fontSize="11"
                fontWeight="bold"
                fontFamily="Nunito,sans-serif"
              >
                <tspan x={lx} dy="-6">{s.cat}</tspan>
                <tspan x={lx} dy="14">({s.count})</tspan>
              </text>
            )}
          </g>
        );
      })}
      
      <circle cx={CX} cy={CY} r={R_IN} fill="white" />
    </svg>
  );
}
