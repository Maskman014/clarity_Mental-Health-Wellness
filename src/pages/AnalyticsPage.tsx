import React, { useMemo, useState, useCallback } from 'react';
import {
  BarChart3, TrendingUp, Calendar, Download, Activity,
  Brain, Gauge, AlertCircle,
} from 'lucide-react';
import { useWellness, MoodType } from '../context/WellnessContext';
import { downloadClinicalReport, getMoodColor, getStressColor } from '../utils/dataExport';

/* ─── Reusable interactive SVG line chart ─── */
interface ChartPoint {
  x: number;
  y: number;
  label: string;
  value: number;
  mood: MoodType;
}

function StressTrendChart({ points }: { points: ChartPoint[] }) {
  const [tooltip, setTooltip] = useState<{ x: number; y: number; point: ChartPoint } | null>(null);
  const W = 560;
  const H = 160;
  const PAD = { top: 12, right: 16, bottom: 24, left: 28 };

  const xs = points.map((p) => PAD.left + (p.x / (points.length - 1)) * (W - PAD.left - PAD.right));
  const ys = points.map((p) => PAD.top + ((10 - p.value) / 9) * (H - PAD.top - PAD.bottom));

  const pathD = xs.map((x, i) => `${i === 0 ? 'M' : 'L'} ${x},${ys[i]}`).join(' ');
  const areaD = `${pathD} L ${xs[xs.length - 1]},${H - PAD.bottom} L ${xs[0]},${H - PAD.bottom} Z`;

  const gridYs = [1, 3, 5, 7, 10].map(
    (v) => PAD.top + ((10 - v) / 9) * (H - PAD.top - PAD.bottom)
  );

  return (
    <div className="relative select-none" onMouseLeave={() => setTooltip(null)}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full overflow-visible"
        style={{ height: 'clamp(120px, 20vw, 200px)' }}
      >
        <defs>
          <linearGradient id="lineArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Grid */}
        {gridYs.map((gy, i) => (
          <line key={i} x1={PAD.left} y1={gy} x2={W - PAD.right} y2={gy}
            stroke="#334155" strokeWidth="1" strokeDasharray="4 3" />
        ))}

        {/* Area fill */}
        {points.length > 1 && <path d={areaD} fill="url(#lineArea)" />}

        {/* Line */}
        {points.length > 1 && (
          <path d={pathD} fill="none" stroke="#10b981" strokeWidth="2.5"
            strokeLinejoin="round" strokeLinecap="round" />
        )}

        {/* Points + hover targets */}
        {xs.map((x, i) => (
          <g key={i}>
            <circle cx={x} cy={ys[i]} r="16" fill="transparent"
              onMouseEnter={() => setTooltip({ x, y: ys[i], point: points[i] })}
            />
            <circle cx={x} cy={ys[i]} r={tooltip?.point === points[i] ? 6 : 4}
              fill={getStressColor(points[i].value)}
              stroke="#0f172a" strokeWidth="2"
              className="transition-all duration-150 pointer-events-none"
            />
          </g>
        ))}

        {/* X-axis labels */}
        {xs.map((x, i) => {
          if (points.length <= 8 || i === 0 || i === points.length - 1 || i % Math.ceil(points.length / 6) === 0) {
            return (
              <text key={`lx-${i}`} x={x} y={H - 4} textAnchor="middle"
                className="fill-slate-500" fontSize="9">
                {points[i].label}
              </text>
            );
          }
          return null;
        })}

        {/* Y-axis labels */}
        {[1, 5, 10].map((v) => {
          const gy = PAD.top + ((10 - v) / 9) * (H - PAD.top - PAD.bottom);
          return (
            <text key={v} x={PAD.left - 4} y={gy + 3} textAnchor="end"
              className="fill-slate-600" fontSize="9">
              {v}
            </text>
          );
        })}
      </svg>

      {/* Floating tooltip */}
      {tooltip && (
        <div
          className="absolute z-20 pointer-events-none"
          style={{ left: `${(tooltip.x / W) * 100}%`, top: `${(tooltip.y / (H + 24)) * 100}%`, transform: 'translate(-50%,-110%)' }}
        >
          <div className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs shadow-xl whitespace-nowrap">
            <p className="text-white font-semibold">{tooltip.point.label}</p>
            <p style={{ color: getStressColor(tooltip.point.value) }}>
              Stress: <span className="font-bold">{tooltip.point.value}/10</span>
            </p>
            <p style={{ color: getMoodColor(tooltip.point.mood) }} className="capitalize">
              Mood: {tooltip.point.mood}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Donut chart for mood distribution ─── */
interface DonutSlice { mood: MoodType; count: number; percentage: number }

function MoodDonut({ slices }: { slices: DonutSlice[] }) {
  const [hovered, setHovered] = useState<MoodType | null>(null);
  const R = 52;
  const CX = 70;
  const CY = 70;
  const strokeW = 20;

  let cumulative = 0;
  const total = slices.reduce((s, sl) => s + sl.count, 0) || 1;

  const arcs = slices.map((sl) => {
    const start = cumulative;
    const fraction = sl.count / total;
    cumulative += fraction;
    return { ...sl, startFraction: start, fraction };
  });

  function describeArc(startFrac: number, frac: number): string {
    const startAngle = startFrac * 2 * Math.PI - Math.PI / 2;
    const endAngle = (startFrac + frac) * 2 * Math.PI - Math.PI / 2;
    const x1 = CX + R * Math.cos(startAngle);
    const y1 = CY + R * Math.sin(startAngle);
    const x2 = CX + R * Math.cos(endAngle);
    const y2 = CY + R * Math.sin(endAngle);
    const large = frac > 0.5 ? 1 : 0;
    return `M ${x1} ${y1} A ${R} ${R} 0 ${large} 1 ${x2} ${y2}`;
  }

  const hoveredSlice = hovered ? arcs.find((a) => a.mood === hovered) : null;

  return (
    <div className="flex items-center gap-6">
      <div className="relative flex-shrink-0">
        <svg width={CX * 2} height={CY * 2} viewBox={`0 0 ${CX * 2} ${CY * 2}`}>
          {/* Background ring */}
          <circle cx={CX} cy={CY} r={R} fill="none" stroke="#1e293b" strokeWidth={strokeW} />
          {arcs.map((arc) => (
            arc.fraction > 0.001 && (
              <path
                key={arc.mood}
                d={describeArc(arc.startFraction, arc.fraction)}
                fill="none"
                stroke={getMoodColor(arc.mood)}
                strokeWidth={hovered === arc.mood ? strokeW + 4 : strokeW}
                strokeLinecap="round"
                className="transition-all duration-200 cursor-pointer"
                onMouseEnter={() => setHovered(arc.mood)}
                onMouseLeave={() => setHovered(null)}
                style={{ opacity: hovered && hovered !== arc.mood ? 0.4 : 1 }}
              />
            )
          ))}
          {/* Center label */}
          {hoveredSlice ? (
            <>
              <text x={CX} y={CY - 6} textAnchor="middle" className="fill-white" fontSize="16" fontWeight="700">
                {hoveredSlice.count}
              </text>
              <text x={CX} y={CY + 10} textAnchor="middle" className="fill-slate-400" fontSize="9" textTransform="capitalize">
                {hoveredSlice.mood}
              </text>
            </>
          ) : (
            <>
              <text x={CX} y={CY - 6} textAnchor="middle" className="fill-white" fontSize="16" fontWeight="700">
                {total}
              </text>
              <text x={CX} y={CY + 10} textAnchor="middle" className="fill-slate-400" fontSize="9">
                entries
              </text>
            </>
          )}
        </svg>
      </div>

      <div className="flex flex-col gap-2 flex-1">
        {arcs.map((arc) => (
          <div
            key={arc.mood}
            className="flex items-center gap-2 cursor-pointer group"
            onMouseEnter={() => setHovered(arc.mood)}
            onMouseLeave={() => setHovered(null)}
          >
            <div
              className="w-3 h-3 rounded-full flex-shrink-0 transition-all duration-200"
              style={{
                backgroundColor: getMoodColor(arc.mood),
                transform: hovered === arc.mood ? 'scale(1.3)' : 'scale(1)',
              }}
            />
            <span className="text-xs capitalize flex-1"
              style={{ color: hovered === arc.mood ? 'white' : '#94a3b8' }}>
              {arc.mood}
            </span>
            <span className="text-xs font-medium" style={{ color: getMoodColor(arc.mood) }}>
              {arc.percentage.toFixed(0)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Bar chart for weekly stress ─── */
interface WeekBar { week: string; avgStress: number; entries: number }

function WeeklyBarChart({ bars }: { bars: WeekBar[] }) {
  const [hovered, setHovered] = useState<number | null>(null);
  if (bars.length === 0) return null;

  return (
    <div className="space-y-2">
      {bars.map((bar, i) => (
        <div
          key={bar.week}
          className="flex items-center gap-3 cursor-default"
          onMouseEnter={() => setHovered(i)}
          onMouseLeave={() => setHovered(null)}
        >
          <div className="w-20 text-xs text-slate-400 flex-shrink-0">{bar.week}</div>
          <div className="flex-1 relative h-8 bg-slate-800/50 rounded-lg overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 rounded-lg flex items-center justify-end pr-2 transition-all duration-500"
              style={{
                width: `${(bar.avgStress / 10) * 100}%`,
                background: `linear-gradient(to right, ${getStressColor(1)}, ${getStressColor(bar.avgStress)})`,
                opacity: hovered !== null && hovered !== i ? 0.5 : 1,
              }}
            >
              <span className="text-xs font-semibold text-white">{bar.avgStress.toFixed(1)}</span>
            </div>
          </div>
          <div className={`w-14 text-right text-xs transition-colors ${hovered === i ? 'text-white' : 'text-slate-500'}`}>
            {bar.entries} {bar.entries === 1 ? 'entry' : 'entries'}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── Main analytics page ─── */
export function AnalyticsPage() {
  const { diagnostics, clearHistory } = useWellness();
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | 'all'>('30d');

  const filteredDiagnostics = useMemo(() => {
    if (timeRange === 'all') return diagnostics;
    const days = timeRange === '7d' ? 7 : 30;
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
    return diagnostics.filter((d) => d.timestamp >= cutoff);
  }, [diagnostics, timeRange]);

  const chartPoints = useMemo((): ChartPoint[] => {
    return filteredDiagnostics
      .slice()
      .sort((a, b) => a.timestamp - b.timestamp)
      .slice(-30)
      .map((d, i, arr) => ({
        x: arr.length === 1 ? 0.5 : i / (arr.length - 1),
        y: d.stressLevel,
        label: new Date(d.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        value: d.stressLevel,
        mood: d.mood,
      }));
  }, [filteredDiagnostics]);

  const moodSlices = useMemo((): DonutSlice[] => {
    const counts: Record<MoodType, number> = { flourishing: 0, grounded: 0, overwhelmed: 0, exhausted: 0, restless: 0 };
    filteredDiagnostics.forEach((d) => { counts[d.mood]++; });
    const total = filteredDiagnostics.length || 1;
    return (Object.entries(counts) as [MoodType, number][]).map(([mood, count]) => ({
      mood,
      count,
      percentage: (count / total) * 100,
    }));
  }, [filteredDiagnostics]);

  const weeklyBars = useMemo((): WeekBar[] => {
    const weeks = new Map<string, { stress: number[]; count: number }>();
    filteredDiagnostics.forEach((d) => {
      const date = new Date(d.timestamp);
      const ws = new Date(date);
      ws.setDate(date.getDate() - date.getDay());
      const key = ws.toISOString().split('T')[0];
      if (!weeks.has(key)) weeks.set(key, { stress: [], count: 0 });
      const w = weeks.get(key)!;
      w.stress.push(d.stressLevel);
      w.count++;
    });
    return Array.from(weeks.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-8)
      .map(([week, data]) => ({
        week: new Date(week).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        avgStress: data.stress.reduce((a, b) => a + b, 0) / data.stress.length,
        entries: data.count,
      }));
  }, [filteredDiagnostics]);

  const avgStress = useMemo(() => {
    if (!filteredDiagnostics.length) return 0;
    return filteredDiagnostics.reduce((s, d) => s + d.stressLevel, 0) / filteredDiagnostics.length;
  }, [filteredDiagnostics]);

  const dominantMood = useMemo(() => {
    return moodSlices.reduce((prev, cur) => cur.count > prev.count ? cur : prev, moodSlices[0]);
  }, [moodSlices]);

  const weeklyTrend = useMemo(() => {
    if (weeklyBars.length < 2) return 'stable';
    const diff = weeklyBars[weeklyBars.length - 1].avgStress - weeklyBars[weeklyBars.length - 2].avgStress;
    if (diff > 0.5) return 'increasing';
    if (diff < -0.5) return 'decreasing';
    return 'stable';
  }, [weeklyBars]);

  const handleClearHistory = useCallback(async () => {
    if (window.confirm('Are you sure you want to clear all diagnostic history? This cannot be undone.')) {
      await clearHistory();
    }
  }, [clearHistory]);

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Analytics &amp; Clinical Trends</h1>
            <p className="text-slate-400">Visualise your mental health journey with interactive charts.</p>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as typeof timeRange)}
              className="px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500/50 cursor-pointer"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="all">All time</option>
            </select>
            <button
              onClick={() => downloadClinicalReport(filteredDiagnostics)}
              disabled={filteredDiagnostics.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg font-medium text-sm hover:from-emerald-600 hover:to-teal-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        {/* Summary KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { icon: Activity, color: 'emerald', label: 'Total Entries', value: String(filteredDiagnostics.length) },
            { icon: Gauge, color: 'amber', label: 'Avg. Stress', value: avgStress.toFixed(1) },
            {
              icon: Brain, color: 'blue', label: 'Dominant Mood',
              value: dominantMood?.mood ?? 'N/A',
              style: { color: getMoodColor(dominantMood?.mood ?? 'grounded') },
            },
            {
              icon: TrendingUp, color: 'teal', label: 'Weekly Trend', value: weeklyTrend,
              style: {
                color: weeklyTrend === 'decreasing' ? '#10b981' : weeklyTrend === 'increasing' ? '#f59e0b' : '#94a3b8',
              },
            },
          ].map(({ icon: Icon, color, label, value, style }) => (
            <div key={label} className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-800 p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className={`w-8 h-8 rounded-lg bg-${color}-500/20 flex items-center justify-center`}>
                  <Icon className={`w-4 h-4 text-${color}-400`} />
                </div>
                <span className="text-xs text-slate-400">{label}</span>
              </div>
              <div className="text-2xl font-bold capitalize" style={style ?? { color: 'white' }}>{value}</div>
            </div>
          ))}
        </div>

        {/* Stress Trend + Mood Donut */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2 bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-800 p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-white">Stress Level Trend</h2>
                <p className="text-xs text-slate-400">Hover any point for details</p>
              </div>
            </div>
            {chartPoints.length > 0 ? (
              <StressTrendChart points={chartPoints} />
            ) : (
              <div className="h-40 flex items-center justify-center text-slate-500">
                <div className="text-center">
                  <AlertCircle className="w-7 h-7 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">No data in this period</p>
                </div>
              </div>
            )}
          </div>

          <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-800 p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <Brain className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-white">Mood Distribution</h2>
                <p className="text-xs text-slate-400">Hover slices to explore</p>
              </div>
            </div>
            {filteredDiagnostics.length > 0 ? (
              <MoodDonut slices={moodSlices} />
            ) : (
              <div className="h-40 flex items-center justify-center text-slate-500">
                <div className="text-center">
                  <AlertCircle className="w-7 h-7 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">No data yet</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Weekly Aggregates + Recent Entries */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-800 p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-teal-500/20 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-teal-400" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-white">Weekly Stress Average</h2>
                <p className="text-xs text-slate-400">Hover bars for details</p>
              </div>
            </div>
            {weeklyBars.length > 0 ? (
              <WeeklyBarChart bars={weeklyBars} />
            ) : (
              <div className="h-40 flex items-center justify-center text-slate-500">
                <div className="text-center">
                  <AlertCircle className="w-7 h-7 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">No weekly data yet</p>
                </div>
              </div>
            )}
          </div>

          <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-800 p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-white">Recent Entries</h2>
                <p className="text-xs text-slate-400">Your last 5 sessions</p>
              </div>
            </div>

            <div className="space-y-3 max-h-72 overflow-y-auto pr-1 custom-scroll">
              {filteredDiagnostics.length > 0 ? (
                filteredDiagnostics.slice(0, 5).map((entry) => (
                  <div key={entry.id} className="p-4 bg-slate-800/30 rounded-xl border border-slate-700/50 hover:border-slate-600/50 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-xs font-medium capitalize"
                          style={{ backgroundColor: `${getMoodColor(entry.mood)}20`, color: getMoodColor(entry.mood) }}>
                          {entry.mood}
                        </span>
                        <span className="px-2 py-0.5 rounded text-xs font-medium"
                          style={{ backgroundColor: `${getStressColor(entry.stressLevel)}20`, color: getStressColor(entry.stressLevel) }}>
                          Stress {entry.stressLevel}
                        </span>
                      </div>
                      <span className="text-xs text-slate-500">
                        {new Date(entry.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <p className="text-sm text-slate-400 line-clamp-2">{entry.journal}</p>
                  </div>
                ))
              ) : (
                <div className="h-40 flex items-center justify-center text-slate-500">
                  <div className="text-center">
                    <AlertCircle className="w-7 h-7 mx-auto mb-2 opacity-40" />
                    <p className="text-sm">No entries in this period</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Data management */}
        {diagnostics.length > 0 && (
          <div className="mt-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-amber-400" />
            </div>
            <div className="flex-1">
              <p className="text-white font-medium text-sm">Data Management</p>
              <p className="text-slate-400 text-xs">Your data is securely stored in the cloud, tied to your account.</p>
            </div>
            <button
              onClick={handleClearHistory}
              className="px-4 py-2 bg-amber-500/20 text-amber-400 rounded-lg text-sm font-medium hover:bg-amber-500/30 transition-colors border border-amber-500/30 flex-shrink-0"
            >
              Clear History
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
