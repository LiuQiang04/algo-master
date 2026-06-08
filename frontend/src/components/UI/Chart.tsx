import { useState, useEffect, useRef } from 'react';

/* ============================================
   Chart Components - SVG-based data visualization
   ============================================ */

// ---- Shared Types ----

interface DataPoint {
  [key: string]: string | number;
}

interface BaseChartProps {
  data: DataPoint[];
  width?: number;
  height?: number;
  color?: string;
  className?: string;
  animate?: boolean;
  showLabels?: boolean;
  showGrid?: boolean;
}

interface LineChartProps extends BaseChartProps {
  xKey: string;
  yKey: string;
  strokeWidth?: number;
  dotRadius?: number;
}

interface BarChartProps extends BaseChartProps {
  xKey: string;
  yKey: string;
  barRadius?: number;
}

interface PieChartProps extends Omit<BaseChartProps, 'showGrid'> {
  nameKey: string;
  valueKey: string;
  colors?: string[];
  innerRadius?: number;
  showLegend?: boolean;
}

// ---- Default Theme Colors ----

const DEFAULT_COLORS = [
  'var(--primary-500, #3b82f6)',
  'var(--success-500, #22c55e)',
  'var(--warning-500, #f59e0b)',
  'var(--danger-500, #ef4444)',
  'var(--accent-500, #a855f7)',
  '#06b6d4',
  '#ec4899',
  '#14b8a6',
];

// ---- Helper Functions ----

function getMinMax(data: DataPoint[], key: string): { min: number; max: number } {
  const values = data.map((d) => Number(d[key]));
  return {
    min: Math.min(...values),
    max: Math.max(...values),
  };
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

// ---- LineChart ----

export function LineChart({
  data,
  xKey,
  yKey,
  width = 600,
  height = 300,
  color = 'var(--primary-500, #3b82f6)',
  strokeWidth = 2,
  dotRadius = 4,
  className = '',
  animate = true,
  showLabels = true,
  showGrid = true,
}: LineChartProps) {
  const [progress, setProgress] = useState(animate ? 0 : 1);
  const animRef = useRef<number>();

  useEffect(() => {
    if (!animate) return;
    setProgress(0);
    const start = performance.now();
    const duration = 800;
    function tick(now: number) {
      const t = Math.min((now - start) / duration, 1);
      setProgress(t < 1 ? t : 1);
      if (t < 1) animRef.current = requestAnimationFrame(tick);
    }
    animRef.current = requestAnimationFrame(tick);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [data, animate]);

  if (!data.length) return null;

  const padding = { top: 20, right: 20, bottom: 40, left: 50 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const { min: yMin, max: yMax } = getMinMax(data, yKey);
  const yRange = yMax - yMin || 1;
  const yPadding = yRange * 0.1;
  const adjustedMin = yMin - yPadding;
  const adjustedMax = yMax + yPadding;
  const adjustedRange = adjustedMax - adjustedMin;

  const points = data.map((d, i) => {
    const x = padding.left + (i / (data.length - 1 || 1)) * chartW;
    const y = padding.top + chartH - ((Number(d[yKey]) - adjustedMin) / adjustedRange) * chartH;
    return { x, y, label: String(d[xKey]), value: Number(d[yKey]) };
  });

  const visiblePoints = points.slice(0, Math.ceil(points.length * progress));
  const pathD = visiblePoints
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
    .join(' ');

  // Grid lines
  const gridLines = [];
  if (showGrid) {
    for (let i = 0; i <= 4; i++) {
      const y = padding.top + (i / 4) * chartH;
      const val = lerp(adjustedMax, adjustedMin, i / 4);
      gridLines.push(
        <g key={`grid-${i}`}>
          <line x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke="var(--border-light, #e5e7eb)" strokeWidth={1} strokeDasharray="4 4" />
          {showLabels && (
            <text x={padding.left - 8} y={y + 4} textAnchor="end" fontSize={11} fill="var(--text-muted, #9ca3af)">
              {Math.round(val)}
            </text>
          )}
        </g>
      );
    }
  }

  return (
    <svg width={width} height={height} className={className} style={{ overflow: 'visible' }}>
      {gridLines}

      {/* X-axis labels */}
      {showLabels && points.map((p, i) => (
        <text key={`x-${i}`} x={p.x} y={height - 8} textAnchor="middle" fontSize={11} fill="var(--text-muted, #9ca3af)">
          {p.label}
        </text>
      ))}

      {/* Line path */}
      <path d={pathD} fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />

      {/* Dots */}
      {visiblePoints.map((p, i) => (
        <g key={`dot-${i}`}>
          <circle cx={p.x} cy={p.y} r={dotRadius} fill="white" stroke={color} strokeWidth={2} />
          {showLabels && (
            <text x={p.x} y={p.y - dotRadius - 6} textAnchor="middle" fontSize={11} fontWeight={600} fill="var(--text-primary, #1f2937)">
              {p.value}
            </text>
          )}
        </g>
      ))}
    </svg>
  );
}

// ---- BarChart ----

export function BarChart({
  data,
  xKey,
  yKey,
  width = 600,
  height = 300,
  color = 'var(--primary-500, #3b82f6)',
  barRadius = 4,
  className = '',
  animate = true,
  showLabels = true,
  showGrid = true,
}: BarChartProps) {
  const [progress, setProgress] = useState(animate ? 0 : 1);
  const animRef = useRef<number>();

  useEffect(() => {
    if (!animate) return;
    setProgress(0);
    const start = performance.now();
    const duration = 600;
    function tick(now: number) {
      const t = Math.min((now - start) / duration, 1);
      setProgress(t < 1 ? t : 1);
      if (t < 1) animRef.current = requestAnimationFrame(tick);
    }
    animRef.current = requestAnimationFrame(tick);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [data, animate]);

  if (!data.length) return null;

  const padding = { top: 20, right: 20, bottom: 40, left: 50 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const { max: yMax } = getMinMax(data, yKey);
  const adjustedMax = yMax * 1.15 || 1;

  const barWidth = Math.max(8, (chartW / data.length) * 0.6);
  const gap = (chartW / data.length) * 0.4;

  // Grid lines
  const gridLines = [];
  if (showGrid) {
    for (let i = 0; i <= 4; i++) {
      const y = padding.top + (i / 4) * chartH;
      const val = lerp(adjustedMax, 0, i / 4);
      gridLines.push(
        <g key={`grid-${i}`}>
          <line x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke="var(--border-light, #e5e7eb)" strokeWidth={1} strokeDasharray="4 4" />
          {showLabels && (
            <text x={padding.left - 8} y={y + 4} textAnchor="end" fontSize={11} fill="var(--text-muted, #9ca3af)">
              {Math.round(val)}
            </text>
          )}
        </g>
      );
    }
  }

  return (
    <svg width={width} height={height} className={className} style={{ overflow: 'visible' }}>
      {gridLines}

      {data.map((d, i) => {
        const value = Number(d[yKey]);
        const barH = (value / adjustedMax) * chartH * progress;
        const x = padding.left + (i / data.length) * chartW + gap / 2;
        const y = padding.top + chartH - barH;

        return (
          <g key={`bar-${i}`}>
            <rect
              x={x}
              y={y}
              width={barWidth}
              height={barH}
              rx={barRadius}
              ry={barRadius}
              fill={color}
              opacity={0.9}
            />
            {showLabels && progress > 0.8 && (
              <text x={x + barWidth / 2} y={y - 6} textAnchor="middle" fontSize={11} fontWeight={600} fill="var(--text-primary, #1f2937)">
                {value}
              </text>
            )}
            {showLabels && (
              <text x={x + barWidth / 2} y={height - 8} textAnchor="middle" fontSize={11} fill="var(--text-muted, #9ca3af)">
                {String(d[xKey])}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

// ---- PieChart ----

export function PieChart({
  data,
  nameKey,
  valueKey,
  width = 400,
  height = 400,
  colors = DEFAULT_COLORS,
  innerRadius = 0,
  className = '',
  animate = true,
  showLabels = true,
  showLegend = true,
}: PieChartProps) {
  const [progress, setProgress] = useState(animate ? 0 : 1);
  const animRef = useRef<number>();

  useEffect(() => {
    if (!animate) return;
    setProgress(0);
    const start = performance.now();
    const duration = 800;
    function tick(now: number) {
      const t = Math.min((now - start) / duration, 1);
      setProgress(t < 1 ? t : 1);
      if (t < 1) animRef.current = requestAnimationFrame(tick);
    }
    animRef.current = requestAnimationFrame(tick);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [data, animate]);

  if (!data.length) return null;

  const total = data.reduce((sum, d) => sum + Number(d[valueKey]), 0);
  if (total === 0) return null;

  const cx = width / 2;
  const cy = height / 2;
  const radius = Math.min(cx, cy) - 40;
  const innerR = innerRadius * radius;

  let currentAngle = -Math.PI / 2;
  const slices = data.map((d, i) => {
    const value = Number(d[valueKey]);
    const angle = (value / total) * Math.PI * 2 * progress;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    currentAngle = endAngle;

    const largeArc = angle > Math.PI ? 1 : 0;

    const x1 = cx + radius * Math.cos(startAngle);
    const y1 = cy + radius * Math.sin(startAngle);
    const x2 = cx + radius * Math.cos(endAngle);
    const y2 = cy + radius * Math.sin(endAngle);

    const ix1 = cx + innerR * Math.cos(startAngle);
    const iy1 = cy + innerR * Math.sin(startAngle);
    const ix2 = cx + innerR * Math.cos(endAngle);
    const iy2 = cy + innerR * Math.sin(endAngle);

    const path = innerR > 0
      ? `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} L ${ix2} ${iy2} A ${innerR} ${innerR} 0 ${largeArc} 0 ${ix1} ${iy1} Z`
      : `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;

    // Label position at midpoint of arc
    const midAngle = (startAngle + endAngle) / 2;
    const labelR = radius * 0.7;
    const lx = cx + labelR * Math.cos(midAngle);
    const ly = cy + labelR * Math.sin(midAngle);

    return {
      path,
      color: colors[i % colors.length],
      name: String(d[nameKey]),
      value,
      percentage: ((value / total) * 100).toFixed(1),
      lx,
      ly,
      midAngle,
    };
  });

  return (
    <div className={className} style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
      <svg width={width} height={height} style={{ overflow: 'visible' }}>
        {slices.map((s, i) => (
          <g key={`slice-${i}`}>
            <path d={s.path} fill={s.color} stroke="white" strokeWidth={2} />
            {showLabels && progress > 0.8 && Number(s.percentage) > 5 && (
              <text x={s.lx} y={s.ly} textAnchor="middle" dominantBaseline="middle" fontSize={12} fontWeight={600} fill="white">
                {s.percentage}%
              </text>
            )}
          </g>
        ))}
      </svg>

      {showLegend && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {slices.map((s, i) => (
            <div key={`legend-${i}`} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 12, height: 12, borderRadius: 3, background: s.color, flexShrink: 0 }} />
              <span style={{ fontSize: 13, color: 'var(--text-secondary, #6b7280)' }}>
                {s.name}
              </span>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary, #1f2937)', marginLeft: 'auto' }}>
                {s.value}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ---- Chart Container ----

interface ChartContainerProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function ChartContainer({ title, children, className = '' }: ChartContainerProps) {
  return (
    <div
      className={className}
      style={{
        background: 'var(--bg-card, white)',
        border: '1px solid var(--border-light, #e5e7eb)',
        borderRadius: 'var(--radius-xl, 12px)',
        padding: 24,
      }}
    >
      {title && (
        <h3 style={{
          fontSize: 16,
          fontWeight: 600,
          color: 'var(--text-primary, #1f2937)',
          marginBottom: 16,
        }}>
          {title}
        </h3>
      )}
      <div style={{ width: '100%', overflow: 'auto' }}>
        {children}
      </div>
    </div>
  );
}
