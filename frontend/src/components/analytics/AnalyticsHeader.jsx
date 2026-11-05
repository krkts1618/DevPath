import React, { useState } from 'react';
import {
  Download,
  RefreshCw,
  ChevronDown,
  FileSpreadsheet,
  CalendarRange,
  X,
  Check,
} from 'lucide-react';

export const TIMEFRAMES = [
  { id: '7d', label: '7D', fullLabel: 'Last 7 Days' },
  { id: '30d', label: '30D', fullLabel: 'Last 30 Days' },
  { id: '90d', label: '3M', fullLabel: 'Last 3 Months' },
  { id: '12m', label: '1Y', fullLabel: 'Last 1 Year' },
];

export default function AnalyticsHeader({
  timeframe,
  setTimeframe,
  customRange,
  setCustomRange,
  onRefresh,
  onExportCsv,
  loading,
}) {
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isCustomOpen, setIsCustomOpen] = useState(false);
  const [tempStart, setTempStart] = useState(customRange?.startDate || '');
  const [tempEnd, setTempEnd] = useState(customRange?.endDate || '');

  const handleApplyCustom = () => {
    if (tempStart && tempEnd) {
      setCustomRange({ startDate: tempStart, endDate: tempEnd });
      setTimeframe('custom');
      setIsCustomOpen(false);
    }
  };

  const exportOptions = [
    { type: 'tasks', label: 'Task Completion History' },
    { type: 'roadmaps', label: 'Roadmap Progress Summary' },
    { type: 'sessions', label: 'Focus Study Sessions' },
    { type: 'revisions', label: 'Revision Schedule & Recall' },
    { type: 'projects', label: 'Engineering Projects' },
  ];

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border-subtle)]">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] tracking-tight">
          Analytics
        </h1>
        <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-0.5">
          Progress trajectory, spaced retention, and focus time insights
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        {/* Timeframe Selector Pills (Matching Reference Image) */}
        <div className="inline-flex p-1 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
          {TIMEFRAMES.map((tf) => {
            const active = timeframe === tf.id;
            return (
              <button
                key={tf.id}
                onClick={() => setTimeframe(tf.id)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  active
                    ? 'bg-[var(--accent-primary)] text-[var(--accent-text)] shadow-xs'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
                title={tf.fullLabel}
              >
                {tf.label}
              </button>
            );
          })}
        </div>

        {/* Export CSV Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsExportOpen(!isExportOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--bg-surface)] text-[var(--text-primary)] text-xs font-semibold border border-[var(--border-subtle)] hover:border-[var(--border-strong)] transition shadow-xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
            <span>Export</span>
            <ChevronDown className="w-3 h-3 text-[var(--text-muted)]" />
          </button>

          {isExportOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsExportOpen(false)}
              />
              <div className="absolute right-0 mt-1 w-56 rounded-xl bg-[var(--bg-surface-elevated)] border border-[var(--border-strong)] shadow-xl z-50 py-1 overflow-hidden">
                <div className="px-3 py-1.5 border-b border-[var(--border-subtle)] text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  Export Dataset (CSV)
                </div>
                {exportOptions.map((opt) => (
                  <button
                    key={opt.type}
                    onClick={() => {
                      setIsExportOpen(false);
                      onExportCsv(opt.type);
                    }}
                    className="w-full px-3 py-2 text-left text-xs text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] flex items-center gap-2 transition cursor-pointer"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
                    <span>{opt.label}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Refresh Button */}
        <button
          onClick={onRefresh}
          disabled={loading}
          className="p-2 rounded-xl bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)] hover:border-[var(--border-strong)] transition shadow-xs disabled:opacity-50 cursor-pointer"
          title="Refresh analytics data"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>
    </div>
  );
}
