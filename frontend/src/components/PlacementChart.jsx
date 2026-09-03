import React from 'react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  CartesianGrid,
  Line,
  ComposedChart
} from 'recharts';
import { TrendingUp, Award, DollarSign, Users, ArrowUpRight } from 'lucide-react';

export default function PlacementChart({ outcomesComparison, onOpenAddOutcome }) {
  if (!outcomesComparison) return null;

  const {
    has_comparison,
    version_1_rate,
    version_2_rate,
    percentage_points_change,
    relative_growth_pct,
    salary_change_lpa,
    history = [],
  } = outcomesComparison;

  // Prepare chart data
  const chartData = history.map((item) => ({
    name: item.batch_name.replace('Batch ', ''),
    version: `v${item.version_number}`,
    placementRate: item.placement_rate,
    avgSalary: item.average_salary_lpa,
    studentsPlaced: item.students_placed,
    studentsEnrolled: item.students_enrolled,
  }));

  return (
    <div className="space-y-6">
      {/* Comparison KPI Banner */}
      {has_comparison && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl glass-card border border-emerald-500/30 bg-emerald-950/20 glow-emerald">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Placement Rate Gain</span>
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-white">
                {version_1_rate}% → {version_2_rate}%
              </span>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                +{percentage_points_change} pts
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-400">
              +{relative_growth_pct}% relative placement boost after curriculum update
            </p>
          </div>

          <div className="p-5 rounded-2xl glass-card border border-indigo-500/30 bg-indigo-950/20 glow-indigo">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">Average Package (LPA)</span>
              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-white">
                {history[0]?.average_salary_lpa}L → {history[history.length - 1]?.average_salary_lpa}L
              </span>
              {salary_change_lpa > 0 && (
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  +{salary_change_lpa} LPA
                </span>
              )}
            </div>
            <p className="mt-1 text-xs text-slate-400">Increase in starting industry compensation</p>
          </div>

          <div className="p-5 rounded-2xl glass-card border border-slate-800 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Continuous Feedback</span>
              <div className="p-2 rounded-xl bg-slate-800 text-slate-300 border border-slate-700">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              Curriculum updates validated by employers directly translate to higher job offer conversions.
            </p>
            {onOpenAddOutcome && (
              <button
                onClick={onOpenAddOutcome}
                className="mt-3 py-1.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 text-xs font-semibold border border-indigo-500/30 transition-all flex items-center justify-center gap-1"
              >
                <span>+ Enter Batch Outcome</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Chart Section */}
      <div className="p-6 rounded-2xl glass-card border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white">Curriculum Impact Timeline (Before vs After)</h3>
            <p className="text-xs text-slate-400">Placement conversion rate (%) and average salary (LPA)</p>
          </div>
          {onOpenAddOutcome && !has_comparison && (
            <button
              onClick={onOpenAddOutcome}
              className="py-1.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all"
            >
              + Add Placement Data
            </button>
          )}
        </div>

        <div className="h-64 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
              <YAxis yAxisId="left" stroke="#64748b" fontSize={11} domain={[0, 100]} />
              <YAxis yAxisId="right" orientation="right" stroke="#818cf8" fontSize={11} domain={[0, 15]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '0.75rem',
                  fontSize: '12px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Bar yAxisId="left" dataKey="placementRate" name="Placement Rate (%)" fill="#6366f1" radius={[6, 6, 0, 0]} />
              <Line yAxisId="right" type="monotone" dataKey="avgSalary" name="Avg Salary (LPA)" stroke="#10b981" strokeWidth={3} dot={{ r: 5 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* History Table */}
      <div className="rounded-2xl glass-card border border-slate-800 overflow-hidden">
        <div className="p-4 bg-slate-900/60 border-b border-slate-800 font-semibold text-xs text-slate-300">
          Batch Placement Records
        </div>
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-900/40 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
            <tr>
              <th className="px-5 py-3">Batch & Curriculum Version</th>
              <th className="px-5 py-3">Enrolled</th>
              <th className="px-5 py-3">Placed</th>
              <th className="px-5 py-3">Placement Rate</th>
              <th className="px-5 py-3">Avg Salary</th>
              <th className="px-5 py-3">Hiring Partners</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-200">
            {history.map((row) => (
              <tr key={row.id} className="hover:bg-slate-900/40 transition-colors">
                <td className="px-5 py-3 font-semibold text-white">
                  {row.batch_name} <span className="text-slate-400 font-mono text-[11px]">(v{row.version_number})</span>
                </td>
                <td className="px-5 py-3">{row.students_enrolled}</td>
                <td className="px-5 py-3">{row.students_placed}</td>
                <td className="px-5 py-3 font-bold text-emerald-400">{row.placement_rate}%</td>
                <td className="px-5 py-3 text-indigo-300 font-mono">{row.average_salary_lpa} LPA</td>
                <td className="px-5 py-3 text-slate-400">{row.top_hiring_companies || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
