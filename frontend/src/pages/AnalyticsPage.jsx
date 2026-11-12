import React, { useState, useEffect } from 'react';
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
import WeeklyEngineeringReport from '../components/analytics/WeeklyEngineeringReport';
import ErrorState from '../components/ui/ErrorState';

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeframe, setTimeframe] = useState('7d'); // Default to 7D matching reference
  const [customRange, setCustomRange] = useState({ startDate: '', endDate: '' });
  const [activeSection, setActiveSection] = useState('all');
  const [data, setData] = useState(null);

  // Target config modal state
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [targetConfig, setTargetConfig] = useState({ currentTarget: 5, history: [] });
  const [newTarget, setNewTarget] = useState(5);
  const [savingTarget, setSavingTarget] = useState(false);

  const fetchAnalytics = async (signal) => {
    try {
      setLoading(true);
      setError(null);
      const params = { timeframe };
      if (timeframe === 'custom' && customRange.startDate && customRange.endDate) {
        params.startDate = customRange.startDate;
        params.endDate = customRange.endDate;
      }

      const res = await analyticsService.getComprehensiveAnalytics(params, { signal });
      setData(res);

      analyticsService
        .getStreakTarget({ signal })
        .then((tc) => {
          setTargetConfig(tc || { currentTarget: 5, history: [] });
          setNewTarget(tc?.currentTarget || 5);
        })
        .catch(() => {});
    } catch (err) {
      if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED') {
        return; // Ignore normal request cancellation
      }
      console.error('Failed to load comprehensive analytics:', err);
      setError(err.message || 'Unable to connect to DevPath analytics service.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    fetchAnalytics(controller.signal);
    return () => {
      controller.abort();
    };
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

  return (
    <div className="space-y-6">
      {/* 1. Header with Timeframe Pills & Export */}
      <AnalyticsHeader
        timeframe={timeframe}
        setTimeframe={setTimeframe}
        customRange={customRange}
        setCustomRange={setCustomRange}
        onRefresh={() => fetchAnalytics()}
        onExportCsv={handleExportCsv}
        loading={loading}
      />

      {/* 2. Sub-Navigation Tabs */}
      <AnalyticsNav
        activeSection={activeSection}
        onSelectSection={setActiveSection}
      />

      {/* Error state notification if data fetch fails */}
      {error && !data && (
        <div className="py-6">
          <ErrorState
            title="Failed to Load Analytics"
            message={error}
            onRetry={() => fetchAnalytics()}
          />
        </div>
      )}

      {/* Loading Skeleton if no data yet */}
      {loading && !data && (
        <div className="space-y-6 animate-pulse">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="h-28 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl" />
            <div className="h-28 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl" />
            <div className="h-28 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl" />
            <div className="h-28 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="h-64 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl" />
            <div className="h-64 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl" />
          </div>
        </div>
      )}

      {/* 3. Render Sections when data is available */}
      {data && (
        <>
          {(activeSection === 'all' || activeSection === 'weekly-report') && (
            <WeeklyEngineeringReport />
          )}

          {(activeSection === 'all' || activeSection === 'overview') && (
            <OverviewSection
              overview={data?.overview}
              roadmaps={data?.roadmaps}
              studyTime={data?.studyTime}
              consistency={data?.consistency}
            />
          )}

          {(activeSection === 'all' || activeSection === 'insights') && (
            <EngineeringInsightsSection insights={data?.insights} />
          )}

          {(activeSection === 'all' || activeSection === 'technology') && (
            <TechnologySection
              roadmaps={data?.roadmaps}
              consistency={data?.consistency}
            />
          )}

          {(activeSection === 'all' || activeSection === 'study-time') && (
            <StudyTimeSection studyTime={data?.studyTime} />
          )}

          {(activeSection === 'all' || activeSection === 'consistency') && (
            <ConsistencySection consistency={data?.consistency} />
          )}

          {(activeSection === 'all' || activeSection === 'tasks') && (
            <TaskPerformanceSection taskPerformance={data?.taskPerformance} />
          )}

          {(activeSection === 'all' || activeSection === 'revisions') && (
            <RevisionPerformanceSection revisionPerformance={data?.revisionPerformance} />
          )}

          {(activeSection === 'all' || activeSection === 'projects') && (
            <ProjectPerformanceSection projectPerformance={data?.projectPerformance} />
          )}
        </>
      )}

      {/* Streak Target Configuration Modal */}
      {isConfigOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-[var(--bg-surface)] border border-[var(--border-strong)] rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-base font-bold text-[var(--text-primary)]">
              Configure Daily Streak Target
            </h3>
            <p className="text-xs text-[var(--text-secondary)] mt-1">
              Choose how many distinct tasks are required per calendar day to qualify for a streak.
            </p>

            <form onSubmit={handleSaveTarget} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-[var(--text-primary)] mb-1">
                  Daily Task Target: <span className="font-bold text-[var(--accent-primary)] text-sm">{newTarget} tasks</span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="50"
                  value={newTarget}
                  onChange={(e) => setNewTarget(parseInt(e.target.value, 10))}
                  className="w-full accent-[var(--accent-primary)]"
                />
                <div className="flex justify-between text-[10px] text-[var(--text-muted)] mt-1 font-mono">
                  <span>1 (Light)</span>
                  <span>5 (Default)</span>
                  <span>10 (Intense)</span>
                  <span>50 (Maximum)</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-[var(--border-subtle)]">
                <button
                  type="button"
                  onClick={() => setIsConfigOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-surface-elevated)] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingTarget}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-[var(--accent-primary)] text-[var(--accent-text)] hover:bg-[var(--accent-hover)] disabled:opacity-50 cursor-pointer"
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
