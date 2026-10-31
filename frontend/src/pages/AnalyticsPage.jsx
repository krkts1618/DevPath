import React, { useState, useEffect } from 'react';
import {
  Flame,
  Award,
  Target,
  Calendar,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Settings,
  ChevronLeft,
  ChevronRight,
  Compass,
  ArrowUpRight,
  TrendingUp,
} from 'lucide-react';
import { analyticsService } from '../services/analyticsService';
import AnalyticsHeader from '../components/analytics/AnalyticsHeader';
import AnalyticsNav from '../components/analytics/AnalyticsNav';
import OverviewSection from '../components/analytics/OverviewSection';
import TechnologySection from '../components/analytics/TechnologySection';
import StudyTimeSection from '../components/analytics/StudyTimeSection';
import ConsistencySection from '../components/analytics/ConsistencySection';
import TaskPerformanceSection from '../components/analytics/TaskPerformanceSection';
import RevisionPerformanceSection from '../components/analytics/RevisionPerformanceSection';
import ProjectPerformanceSection from '../components/analytics/ProjectPerformanceSection';
import EngineeringInsightsSection from '../components/analytics/EngineeringInsightsSection';
import ErrorState from '../components/ui/ErrorState';

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeframe, setTimeframe] = useState('30d');
  const [customRange, setCustomRange] = useState({ startDate: '', endDate: '' });
  const [activeSection, setActiveSection] = useState('all');
  const [data, setData] = useState(null);

  // Target config modal state
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [targetConfig, setTargetConfig] = useState({ currentTarget: 5, history: [] });
  const [newTarget, setNewTarget] = useState(5);
  const [savingTarget, setSavingTarget] = useState(false);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = { timeframe };
      if (timeframe === 'custom' && customRange.startDate && customRange.endDate) {
        params.startDate = customRange.startDate;
        params.endDate = customRange.endDate;
      }

      const res = await analyticsService.getComprehensiveAnalytics(params);
      setData(res);

      // Also fetch streak target config in background
      analyticsService.getStreakTarget()
        .then((tc) => {
          setTargetConfig(tc || { currentTarget: 5, history: [] });
          setNewTarget(tc?.currentTarget || 5);
        })
        .catch(() => {});
    } catch (err) {
      console.error('Failed to load comprehensive analytics:', err);
      setError(err.message || 'Unable to connect to DevPath analytics service.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [timeframe, customRange]);

  const handleExportCsv = async (type) => {
    try {
      const params = { timeframe };
      if (timeframe === 'custom') {
        params.startDate = customRange.startDate;
        params.endDate = customRange.endDate;
      }
      await analyticsService.downloadCsv(type, params);
    } catch (err) {
      console.error('Failed to export CSV:', err);
      alert('Failed to export CSV: ' + err.message);
    }
  };

  const handleSaveTarget = async (e) => {
    e.preventDefault();
    try {
      setSavingTarget(true);
      await analyticsService.updateStreakTarget(newTarget);
      setIsConfigOpen(false);
      fetchAnalytics();
    } catch (err) {
      console.error('Failed to update streak target:', err);
    } finally {
      setSavingTarget(false);
    }
  };

  if (loading && !data) {
    return (
      <div className="space-y-6">
        <div className="h-16 bg-[#E8E8DF] dark:bg-[#393E46] rounded-xl animate-pulse" />
        <div className="h-10 bg-[#E8E8DF] dark:bg-[#393E46] rounded-xl animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="h-32 bg-[#E8E8DF] dark:bg-[#393E46] rounded-xl animate-pulse" />
          <div className="h-32 bg-[#E8E8DF] dark:bg-[#393E46] rounded-xl animate-pulse" />
          <div className="h-32 bg-[#E8E8DF] dark:bg-[#393E46] rounded-xl animate-pulse" />
          <div className="h-32 bg-[#E8E8DF] dark:bg-[#393E46] rounded-xl animate-pulse" />
        </div>
        <div className="h-72 bg-[#E8E8DF] dark:bg-[#393E46] rounded-xl animate-pulse" />
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="py-12">
        <ErrorState
          title="Failed to Load Analytics"
          message={error}
          onRetry={fetchAnalytics}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. Header with Timeframe Pills, Custom Range & CSV Export */}
      <AnalyticsHeader
        timeframe={timeframe}
        setTimeframe={setTimeframe}
        customRange={customRange}
        setCustomRange={setCustomRange}
        onRefresh={fetchAnalytics}
        onExportCsv={handleExportCsv}
        loading={loading}
      />

      {/* 2. Compact Sub-Navigation Tabs */}
      <AnalyticsNav
        activeSection={activeSection}
        onSelectSection={setActiveSection}
      />

      {/* 3. Render Sections based on activeSection */}

      {/* Overview Section */}
      {(activeSection === 'all' || activeSection === 'overview') && (
        <OverviewSection overview={data?.overview} />
      )}

      {/* Engineering Insights Section */}
      {(activeSection === 'all' || activeSection === 'insights') && (
        <EngineeringInsightsSection insights={data?.insights} />
      )}

      {/* Technology & Roadmaps Performance Section */}
      {(activeSection === 'all' || activeSection === 'technology') && (
        <TechnologySection
          roadmaps={data?.roadmaps}
          consistency={data?.consistency}
        />
      )}

      {/* Study Time Analytics Section */}
      {(activeSection === 'all' || activeSection === 'study-time') && (
        <StudyTimeSection studyTime={data?.studyTime} />
      )}

      {/* Consistency & Streaks Section */}
      {(activeSection === 'all' || activeSection === 'consistency') && (
        <ConsistencySection consistency={data?.consistency} />
      )}

      {/* Task Performance Section */}
      {(activeSection === 'all' || activeSection === 'tasks') && (
        <TaskPerformanceSection taskPerformance={data?.taskPerformance} />
      )}

      {/* Revision Performance Section */}
      {(activeSection === 'all' || activeSection === 'revisions') && (
        <RevisionPerformanceSection revisionPerformance={data?.revisionPerformance} />
      )}

      {/* Project Performance Section */}
      {(activeSection === 'all' || activeSection === 'projects') && (
        <ProjectPerformanceSection projectPerformance={data?.projectPerformance} />
      )}

      {/* Streak Target Configuration Modal */}
      {isConfigOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-[#2A303A] border border-[#E8E8DF] dark:border-[#393E46] rounded-2xl max-w-md w-full p-6 shadow-xl">
            <h3 className="text-base font-bold text-[#202A23] dark:text-[#DFD0B8]">
              Configure Daily Streak Target
            </h3>
            <p className="text-xs text-[#737C74] dark:text-[#948979] mt-1">
              Choose how many distinct tasks are required per local calendar day (range 1–50) to qualify for a streak. Past qualifying dates remain preserved under their historical rules.
            </p>

            <form onSubmit={handleSaveTarget} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#202A23] dark:text-[#DFD0B8] mb-1">
                  Daily Task Target: <span className="font-bold text-[#244C3B] dark:text-[#DFD0B8] text-sm">{newTarget} tasks</span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="50"
                  value={newTarget}
                  onChange={(e) => setNewTarget(parseInt(e.target.value, 10))}
                  className="w-full accent-[#244C3B] dark:accent-[#DFD0B8]"
                />
                <div className="flex justify-between text-[10px] text-[#737C74] dark:text-[#948979] mt-1 font-mono">
                  <span>1 (Light)</span>
                  <span>5 (Default)</span>
                  <span>10 (Intense)</span>
                  <span>50 (Maximum)</span>
                </div>
              </div>

              {/* Target History */}
              {targetConfig.history && targetConfig.history.length > 0 && (
                <div className="mt-4 pt-3 border-t border-[#E8E8DF] dark:border-[#393E46]">
                  <span className="text-[11px] font-semibold text-[#737C74] dark:text-[#948979]">Target Change Audit History:</span>
                  <div className="mt-2 space-y-1 max-h-24 overflow-y-auto text-[11px] text-[#737C74] dark:text-[#948979]">
                    {targetConfig.history.map((h) => (
                      <div key={h.id} className="flex justify-between">
                        <span>Target: {h.target} tasks</span>
                        <span className="font-mono">Effective: {h.effectiveFrom}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-[#E8E8DF] dark:border-[#393E46]">
                <button
                  type="button"
                  onClick={() => setIsConfigOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-[#737C74] dark:text-[#948979] hover:bg-[#F0F0EB] dark:hover:bg-[#222831] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingTarget}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#244C3B] dark:bg-[#DFD0B8] text-white dark:text-[#222831] hover:bg-[#1A3B2C] dark:hover:bg-[#ECE3D4] disabled:opacity-50 cursor-pointer"
                >
                  {savingTarget ? 'Saving...' : 'Apply New Target'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
