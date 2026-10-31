import React, { useState } from 'react';
import {
  Calendar,
  Download,
  Filter,
  RefreshCw,
  ChevronDown,
  FileSpreadsheet,
  CalendarRange,
  X,
  Check,
} from 'lucide-react';
import Button from '../ui/Button';

export const TIMEFRAMES = [
  { id: '7d', label: '7D', fullLabel: 'Last 7 Days' },
  { id: '30d', label: '30D', fullLabel: 'Last 30 Days' },
  { id: '90d', label: '90D', fullLabel: 'Last 90 Days' },
  { id: '6m', label: '6M', fullLabel: 'Last 6 Months' },
  { id: '12m', label: '12M', fullLabel: 'Last 12 Months' },
  { id: 'all', label: 'All', fullLabel: 'All Time' },
  { id: 'custom', label: 'Custom', fullLabel: 'Custom Date Range' },
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
  const [tempStart, setTempStart] = useState(customRange.startDate || '');
  const [tempEnd, setTempEnd] = useState(customRange.endDate || '');

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
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#E8E8DF] dark:border-[#393E46]">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-[#202A23] dark:text-[#DFD0B8] tracking-tight">
          Analytics & Engineering Insights
        </h1>
        <p className="text-xs sm:text-sm text-[#737C74] dark:text-[#948979] mt-0.5">
          Deterministic learning velocity, spaced recall performance, and study time distribution
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        {/* Timeframe Selector Pills */}
        <div className="inline-flex p-0.5 rounded-lg bg-[#E8E8DF]/60 dark:bg-[#393E46]/60 border border-[#E8E8DF] dark:border-[#393E46]">
          {TIMEFRAMES.map((tf) => {
            const active = timeframe === tf.id;
            return (
              <button
                key={tf.id}
                onClick={() => {
                  if (tf.id === 'custom') {
                    setIsCustomOpen(true);
                  } else {
                    setTimeframe(tf.id);
                  }
                }}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                  active
                    ? 'bg-[#FFFFFF] dark:bg-[#2A303A] text-[#244C3B] dark:text-[#DFD0B8] shadow-xs'
                    : 'text-[#737C74] dark:text-[#948979] hover:text-[#202A23] dark:hover:text-[#DFD0B8]'
                }`}
                title={tf.fullLabel}
              >
                {tf.label}
              </button>
            );
          })}
        </div>

        {/* Custom Range Indicator if active */}
        {timeframe === 'custom' && customRange.startDate && customRange.endDate && (
          <button
            onClick={() => setIsCustomOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#E8F0EB] dark:bg-[#393E46] text-[#244C3B] dark:text-[#DFD0B8] text-xs font-mono border border-[#244C3B]/20 dark:border-[#DFD0B8]/20 cursor-pointer"
          >
            <CalendarRange className="w-3.5 h-3.5" />
            <span>
              {customRange.startDate.substring(5)} &rarr; {customRange.endDate.substring(5)}
            </span>
          </button>
        )}

        {/* Export CSV Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsExportOpen(!isExportOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FFFFFF] dark:bg-[#2A303A] text-[#202A23] dark:text-[#DFD0B8] text-xs font-semibold border border-[#E8E8DF] dark:border-[#393E46] hover:bg-[#F7F7F2] dark:hover:bg-[#393E46]/60 transition shadow-xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[#244C3B] dark:text-[#DFD0B8]" />
            <span>Export CSV</span>
            <ChevronDown className="w-3 h-3 text-[#737C74] dark:text-[#948979]" />
          </button>

          {isExportOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsExportOpen(false)}
              />
              <div className="absolute right-0 mt-1 w-56 rounded-xl bg-[#FFFFFF] dark:bg-[#2A303A] border border-[#E8E8DF] dark:border-[#393E46] shadow-lg z-50 py-1 overflow-hidden">
                <div className="px-3 py-1.5 border-b border-[#E8E8DF] dark:border-[#393E46] text-[10px] font-bold uppercase tracking-wider text-[#737C74] dark:text-[#948979]">
                  Export Dataset (RFC 4180 CSV)
                </div>
                {exportOptions.map((opt) => (
                  <button
                    key={opt.type}
                    onClick={() => {
                      setIsExportOpen(false);
                      onExportCsv(opt.type);
                    }}
                    className="w-full px-3 py-2 text-left text-xs text-[#202A23] dark:text-[#DFD0B8] hover:bg-[#F0F0EB] dark:hover:bg-[#393E46] flex items-center gap-2 transition cursor-pointer"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-[#244C3B] dark:text-[#DFD0B8]" />
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
          className="p-2 rounded-lg bg-[#FFFFFF] dark:bg-[#2A303A] text-[#737C74] dark:text-[#948979] hover:text-[#202A23] dark:hover:text-[#DFD0B8] border border-[#E8E8DF] dark:border-[#393E46] hover:bg-[#F7F7F2] dark:hover:bg-[#393E46]/60 transition shadow-xs disabled:opacity-50 cursor-pointer"
          title="Refresh analytics data"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Custom Date Range Modal */}
      {isCustomOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-xl bg-[#FFFFFF] dark:bg-[#2A303A] border border-[#E8E8DF] dark:border-[#393E46] shadow-xl p-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E8DF] dark:border-[#393E46] mb-4">
              <h3 className="text-sm font-bold text-[#202A23] dark:text-[#DFD0B8] flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#244C3B] dark:text-[#DFD0B8]" />
                Select Custom Date Range
              </h3>
              <button
                onClick={() => setIsCustomOpen(false)}
                className="text-[#737C74] hover:text-[#202A23] dark:text-[#948979] dark:hover:text-[#DFD0B8] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-[#202A23] dark:text-[#DFD0B8] mb-1">
                  Start Date (Asia/Kolkata)
                </label>
                <input
                  type="date"
                  value={tempStart}
                  onChange={(e) => setTempStart(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-[#F7F7F2] dark:bg-[#222831] border border-[#E8E8DF] dark:border-[#393E46] text-[#202A23] dark:text-[#DFD0B8] focus:outline-none focus:ring-1 focus:ring-[#244C3B]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#202A23] dark:text-[#DFD0B8] mb-1">
                  End Date (Asia/Kolkata)
                </label>
                <input
                  type="date"
                  value={tempEnd}
                  onChange={(e) => setTempEnd(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-[#F7F7F2] dark:bg-[#222831] border border-[#E8E8DF] dark:border-[#393E46] text-[#202A23] dark:text-[#DFD0B8] focus:outline-none focus:ring-1 focus:ring-[#244C3B]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E8E8DF] dark:border-[#393E46]">
                <button
                  type="button"
                  onClick={() => setIsCustomOpen(false)}
                  className="px-3 py-1.5 text-xs font-medium text-[#737C74] hover:text-[#202A23] dark:text-[#948979] dark:hover:text-[#DFD0B8] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleApplyCustom}
                  disabled={!tempStart || !tempEnd}
                  className="px-3.5 py-1.5 rounded-lg bg-[#244C3B] text-white text-xs font-semibold hover:bg-[#1B382B] transition disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  Apply Range
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
