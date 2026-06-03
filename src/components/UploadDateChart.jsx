import { useApp } from '../context/AppContext.jsx';

const CHART_WIDTH  = 380;
const CHART_HEIGHT = 240;

const PADDING = { top: 20, right: 20, bottom: 56, left: 60 };

const PLOT_WIDTH  = CHART_WIDTH  - PADDING.left - PADDING.right;
const PLOT_HEIGHT = CHART_HEIGHT - PADDING.top  - PADDING.bottom;

const MAX_Y_TICKS = 15;
const MAX_X_TICKS = 10;

function buildYTicks(maxValue) 
{
  if (maxValue === 0) return [0];

  if (maxValue < MAX_Y_TICKS) return Array.from({ length: maxValue + 1 }, (_, i) => i);

  const step = Math.ceil(maxValue / (MAX_Y_TICKS - 1));
  const ticks = [];

  for (let value = 0; value <= maxValue; value += step) ticks.push(value);

  if (ticks[ticks.length - 1] !== maxValue) ticks.push(maxValue);
  return ticks;
}

function buildXLabelIndices(dataLength) 
{
  if (dataLength === 0) return [];
  if (dataLength <= MAX_X_TICKS) return Array.from({ length: dataLength }, (_, i) => i);

  const indices = new Set();
  for (let tick = 0; tick < MAX_X_TICKS; tick++) indices.add(Math.round((tick / (MAX_X_TICKS - 1)) * (dataLength - 1)));
  return [...indices].sort((a, b) => a - b);
}

function xForIndex(index, totalPoints) 
{
  if (totalPoints <= 1) return PADDING.left + PLOT_WIDTH;
  return PADDING.left + (index / (totalPoints - 1)) * PLOT_WIDTH;
}

function yForValue(value, maxValue) { return PADDING.top + PLOT_HEIGHT - (value / maxValue) * PLOT_HEIGHT; }

export default function UploadDateChart() 
{
  const { uploadStats } = useApp();

  if (!uploadStats.length) 
  {
    return (
      <svg viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`} style={{ width: '100%', maxWidth: CHART_WIDTH }}>
        <text
          x={CHART_WIDTH / 2}
          y={CHART_HEIGHT / 2}
          textAnchor="middle"
          fill="#c0a090"
          fontSize="13"
          fontFamily="Nunito,sans-serif"
        >
          No data yet
        </text>
      </svg>
    );
  }

  const maxCount = Math.max(...uploadStats.map(entry => entry.count), 1);
  const yTicks   = buildYTicks(maxCount);
  const xLabelIndices = new Set(buildXLabelIndices(uploadStats.length));

  const points = uploadStats.map((entry, index) => 
  ({
      x:     xForIndex(index, uploadStats.length),
      y:     yForValue(entry.count || 0, maxCount),
      count: entry.count || 0,
      date:  entry.date,
  }));

  const linePath = points.map((pt, i) => `${i === 0 ? 'M' : 'L'}${pt.x},${pt.y}`)
                         .join(' ');

  const baselineY = PADDING.top + PLOT_HEIGHT;

  return (
    <svg
      viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
      style={{ width: '100%', maxWidth: CHART_WIDTH }}
      className="line-chart"
    >
      <line
        x1={PADDING.left} y1={PADDING.top}
        x2={PADDING.left} y2={baselineY}
        stroke="#b08060" strokeWidth="1.5"
      />
      <line
        x1={PADDING.left}              y1={baselineY}
        x2={PADDING.left + PLOT_WIDTH} y2={baselineY}
        stroke="#b08060" strokeWidth="1.5"
      />

      <text
        transform={`translate(14,${PADDING.top + PLOT_HEIGHT / 2}) rotate(-90)`}
        textAnchor="middle"
        fill="#b08060"
        fontSize="10"
        fontFamily="Nunito,sans-serif"
      >
        file count
      </text>

      <text
        x={PADDING.left + PLOT_WIDTH / 2}
        y={CHART_HEIGHT - 4}
        textAnchor="middle"
        fill="#b08060"
        fontSize="10"
        fontFamily="Nunito,sans-serif"
      >
        date (YYYY/MM)
      </text>

      {yTicks.map(tickValue => {
        const tickY = yForValue(tickValue, maxCount);
        return (
          <g key={tickValue}>
            <line
              x1={PADDING.left - 5} y1={tickY}
              x2={PADDING.left}     y2={tickY}
              stroke="#b08060" strokeWidth="1"
            />
            <text
              x={PADDING.left - 8}
              y={tickY + 4}
              textAnchor="end"
              fill="#b08060"
              fontSize="10"
              fontFamily="Nunito,sans-serif"
            >
              {tickValue}
            </text>
          </g>
        );
      })}

      {/* ── Line ── */}

      {points.length > 1 && (
        <path d={linePath} fill="none" stroke="#d09060" strokeWidth="1.5" />
      )}

      {points.map(pt => pt.count > 0 && (
        <g key={pt.date}>

          <line
            x1={pt.x} y1={pt.y}
            x2={pt.x} y2={baselineY}
            stroke="#b08060" strokeWidth="1" strokeDasharray="4,3"
          />

          <line
            x1={PADDING.left} y1={pt.y}
            x2={pt.x}         y2={pt.y}
            stroke="#b08060" strokeWidth="1" strokeDasharray="4,3"
          />
          <circle cx={pt.x} cy={pt.y} r={4} fill="#d09060" />
        </g>
      ))}


      {points.map((pt, index) => {
        if (!xLabelIndices.has(index)) return null;

        const [year, month] = pt.date.split('/');

        return (
          <text
            key={pt.date}
            textAnchor="middle"
            fill="#b08060"
            fontSize="9.5"
            fontFamily="Nunito,sans-serif"
          >
            <tspan x={pt.x} y={baselineY + 14}>{year}</tspan>
            <tspan x={pt.x} dy="12">{month}</tspan>
          </text>
        );
      })}
    </svg>
  );
}