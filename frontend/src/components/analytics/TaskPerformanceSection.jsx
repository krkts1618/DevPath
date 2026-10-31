import React from 'react';
import {
  CheckCircle2,
  ListTodo,
  Calendar,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Award,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { useTheme } from '../../context/ThemeContext';

const PRIO_COLORS = {
  urgent: '#E11D48',
  high: '#EA580C',
  normal: '#244C3B',
  low: '#64748B',
};

export default function TaskPerformanceSection({ taskPerformance }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  if (!taskPerformance) return null;

  const prioData = (taskPerformance.priorityDistribution || []).map((p) => ({
    ...p,
    color: PRIO_COLORS[p.priority] || '#244C3B',
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E8E8DF] dark:border-[#393E46]">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#202A23] dark:text-[#DFD0B8]">
            Task Execution & Completion Patterns
          </h2>
          <p className="text-xs text-[#737C74] dark:text-[#948979] mt-0.5">
            Pacing, weekday velocity, priority breakdown, and carry-forward analysis
          </p>
        </div>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-[#FFFFFF] dark:bg-[#2A303A] border border-[#E8E8DF] dark:border-[#393E46] rounded-xl p-4 shadow-xs">
          <div className="text-[11px] font-semibold text-[#737C74] dark:text-[#948979]">Tasks in Period</div>
          <div className="text-2xl font-bold font-mono text-[#202A23] dark:text-[#DFD0B8] mt-1">
            {taskPerformance.tasksCompletedPeriod}
          </div>
          <p className="text-[11px] text-[#737C74] dark:text-[#948979] mt-0.5 font-mono">
            All-time: {taskPerformance.tasksCompletedAllTime} completed
          </p>
        </div>

        <div className="bg-[#FFFFFF] dark:bg-[#2A303A] border border-[#E8E8DF] dark:border-[#393E46] rounded-xl p-4 shadow-xs">
          <div className="text-[11px] font-semibold text-[#737C74] dark:text-[#948979]">Tasks Pending</div>
          <div className="text-2xl font-bold font-mono text-[#202A23] dark:text-[#DFD0B8] mt-1">
            {taskPerformance.tasksPending}
          </div>
          <p className="text-[11px] text-[#737C74] dark:text-[#948979] mt-0.5">
            Across active tracks
          </p>
        </div>

        <div className="bg-[#FFFFFF] dark:bg-[#2A303A] border border-[#E8E8DF] dark:border-[#393E46] rounded-xl p-4 shadow-xs">
          <div className="text-[11px] font-semibold text-[#737C74] dark:text-[#948979]">Avg Tasks / Active Day</div>
          <div className="text-2xl font-bold font-mono text-[#202A23] dark:text-[#DFD0B8] mt-1">
            {taskPerformance.averageTasksPerActiveDay}
          </div>
          <p className="text-[11px] text-[#737C74] dark:text-[#948979] mt-0.5">
            Tasks on active learning days
          </p>
        </div>

        <div className="bg-[#FFFFFF] dark:bg-[#2A303A] border border-[#E8E8DF] dark:border-[#393E46] rounded-xl p-4 shadow-xs">
          <div className="text-[11px] font-semibold text-[#737C74] dark:text-[#948979]">Carried Forward</div>
          <div className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400 mt-1">
            {taskPerformance.tasksCarriedForward}
          </div>
          <p className="text-[11px] text-[#737C74] dark:text-[#948979] mt-0.5">
            Reassigned workflow tasks
          </p>
        </div>
      </div>

      {/* Weekday Productivity Callout Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-[#F7F7F2] dark:bg-[#222831] border border-[#E8E8DF] dark:border-[#393E46] flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-[#737C74] dark:text-[#948979] flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              Most Productive Weekday
            </div>
            <div className="text-base font-bold font-mono text-[#202A23] dark:text-[#DFD0B8] mt-1">
              {taskPerformance.mostProductiveWeekday}
            </div>
          </div>
          <div className="text-[11px] text-[#737C74] dark:text-[#948979] text-right">
            Highest completion density
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#F7F7F2] dark:bg-[#222831] border border-[#E8E8DF] dark:border-[#393E46] flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-[#737C74] dark:text-[#948979] flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#737C74] dark:text-[#948979]" />
              Least Productive Weekday
            </div>
            <div className="text-base font-bold font-mono text-[#202A23] dark:text-[#DFD0B8] mt-1">
              {taskPerformance.leastProductiveWeekday}
            </div>
          </div>
          <div className="text-[11px] text-[#737C74] dark:text-[#948979] text-right">
            Opportunity for recovery or scheduling
          </div>
        </div>
      </div>

      {/* Charts Grid: Weekday Productivity & Priority Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekday Distribution Chart */}
        <div className="bg-[#FFFFFF] dark:bg-[#2A303A] border border-[#E8E8DF] dark:border-[#393E46] rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#202A23] dark:text-[#DFD0B8]">
              Completed Tasks by Day of Week
            </h3>
            <span className="text-xs text-[#737C74] dark:text-[#948979]">
              Task count
            </span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={taskPerformance.weekdayDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#393E46' : '#E8E8DF'} vertical={false} />
                <XAxis dataKey="day" stroke={isDark ? '#948979' : '#737C74'} fontSize={10} tickLine={false} axisLine={false} tickFormatter={(d) => d.substring(0, 3)} />
                <YAxis stroke={isDark ? '#948979' : '#737C74'} fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-[#FFFFFF] dark:bg-[#222831] border border-[#E8E8DF] dark:border-[#393E46] p-2 rounded shadow-md text-xs">
                          <p className="font-bold text-[#202A23] dark:text-[#DFD0B8]">{data.day}</p>
                          <p className="text-[#244C3B] dark:text-[#DFD0B8] font-mono">{data.count} tasks completed</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="count" fill={isDark ? '#91A88E' : '#244C3B'} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Priority Distribution Pie */}
        <div className="bg-[#FFFFFF] dark:bg-[#2A303A] border border-[#E8E8DF] dark:border-[#393E46] rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#202A23] dark:text-[#DFD0B8]">
              Completed Tasks by Priority
            </h3>
            <span className="text-xs text-[#737C74] dark:text-[#948979]">
              Urgency breakdown
            </span>
          </div>

          <div className="h-56 w-full flex items-center justify-center">
            {prioData.some((p) => p.count > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={prioData}
                    dataKey="count"
                    nameKey="priority"
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={3}
                  >
                    {prioData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-[#FFFFFF] dark:bg-[#222831] border border-[#E8E8DF] dark:border-[#393E46] p-2 rounded shadow-md text-xs">
                            <p className="font-bold text-[#202A23] dark:text-[#DFD0B8] capitalize">{data.priority}</p>
                            <p className="text-[#244C3B] dark:text-[#DFD0B8] font-mono">{data.count} tasks</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend
                    formatter={(value) => (
                      <span className="text-[11px] text-[#202A23] dark:text-[#DFD0B8] capitalize">{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-xs text-[#737C74] dark:text-[#948979]">
                No completed tasks recorded in this timeframe.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Roadmaps with Pending Tasks & Category Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most Pending Roadmaps */}
        <div className="bg-[#FFFFFF] dark:bg-[#2A303A] border border-[#E8E8DF] dark:border-[#393E46] rounded-xl p-5 shadow-xs">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#202A23] dark:text-[#DFD0B8] mb-3">
            Active Tracks with Most Pending Tasks
          </h3>

          <div className="space-y-2.5">
            {(taskPerformance.roadmapsWithMostPending || []).map((rm) => (
              <div
                key={rm.id}
                className="p-3 rounded-lg bg-[#F7F7F2] dark:bg-[#222831] border border-[#E8E8DF] dark:border-[#393E46] flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-bold text-[#202A23] dark:text-[#DFD0B8]">{rm.title}</div>
                  <div className="text-[10px] text-[#737C74] dark:text-[#948979]">{rm.categoryName}</div>
                </div>
                <div className="text-right">
                  <div className="font-mono font-bold text-amber-600 dark:text-amber-400">
                    {rm.pendingTasks} pending
                  </div>
                  <div className="text-[10px] text-[#737C74] dark:text-[#948979]">
                    {rm.progressPercent}% complete
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Category Completion Rates */}
        <div className="bg-[#FFFFFF] dark:bg-[#2A303A] border border-[#E8E8DF] dark:border-[#393E46] rounded-xl p-5 shadow-xs">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#202A23] dark:text-[#DFD0B8] mb-3">
            Category Completion Rates
          </h3>

          <div className="space-y-3">
            {(taskPerformance.categoryPerformance || []).map((cat) => (
              <div key={cat.name} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#202A23] dark:text-[#DFD0B8]">{cat.name}</span>
                  <span className="font-mono text-[#737C74] dark:text-[#948979]">
                    {cat.completionRate}% ({cat.completedTasks} / {cat.totalTasks})
                  </span>
                </div>
                <div className="w-full bg-[#E8E8DF] dark:bg-[#393E46] rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-[#244C3B] dark:bg-[#91A88E] h-1.5 rounded-full transition-all"
                    style={{ width: `${cat.completionRate}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
