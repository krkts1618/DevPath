import React, { useState, useEffect } from 'react';
import {
  RotateCcw,
  CheckCircle2,
  BookOpen,
  AlertTriangle,
  FileText,
  Save,
  Check,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react';
import { weekendReviewService } from '../../services/weekendReviewService';

export default function SaturdayRecollection({
  weekStartDate,
  initialData,
  onSaved,
}) {
  const [data, setData] = useState(initialData || null);
  const [loading, setLoading] = useState(!initialData);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [reflection, setReflection] = useState('');
  const [reviewedTaskIds, setReviewedTaskIds] = useState(new Set());
  const [checklistItems, setChecklistItems] = useState([
    { id: '1', text: 'Review core concepts and trade-offs from this week', completed: false },
    { id: '2', text: 'Audit notes taken and clean up code snippets', completed: false },
    { id: '3', text: 'Re-implement one complex task or pattern from memory', completed: false },
    { id: '4', text: 'Verify weak topics from previous weeks are clear', completed: false },
  ]);

  useEffect(() => {
    if (initialData) {
      setData(initialData);
      if (initialData.savedReview) {
        setReflection(initialData.savedReview.reflection || '');
        if (Array.isArray(initialData.savedReview.checklistItems)) {
          setChecklistItems(initialData.savedReview.checklistItems);
        }
      }
    } else {
      loadRecollection();
    }
  }, [weekStartDate, initialData]);

  const loadRecollection = async () => {
    try {
      setLoading(true);
      const res = await weekendReviewService.getRecollection(weekStartDate);
      setData(res);
      if (res?.savedReview) {
        setReflection(res.savedReview.reflection || '');
        if (Array.isArray(res.savedReview.checklistItems) && res.savedReview.checklistItems.length > 0) {
          setChecklistItems(res.savedReview.checklistItems);
        }
      }
    } catch (err) {
      console.error('Failed to load recollection:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleTaskReviewed = (taskId) => {
    setReviewedTaskIds((prev) => {
      const next = new Set(prev);
      if (next.has(taskId)) next.delete(taskId);
      else next.add(taskId);
      return next;
    });
  };

  const toggleChecklistItem = (id) => {
    setChecklistItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item))
    );
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setSavedSuccess(false);
      await weekendReviewService.saveReview({
        weekStartDate: data?.weekStartDate || weekStartDate,
        reviewType: 'recollection',
        reflection,
        checklistItems,
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
      if (onSaved) onSaved();
    } catch (err) {
      alert(err.message || 'Failed to save Saturday recollection');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 bg-[#FFFFFF] dark:bg-[#1D232B] rounded-2xl border border-[#E4E7E0] dark:border-[#303945] animate-pulse space-y-4">
        <div className="h-6 bg-[#E4E7E0] dark:bg-[#252C35] rounded-md w-1/3" />
        <div className="h-24 bg-[#E4E7E0] dark:bg-[#252C35] rounded-xl" />
      </div>
    );
  }

  const roadmaps = data?.roadmaps || [];
  const notes = data?.notes || [];
  const suggestions = data?.revisionSuggestions || [];
  const totalTasks = data?.totalCompletedTasks || 0;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#FFFFFF] dark:bg-[#1D232B] border border-[#E4E7E0] dark:border-[#303945] shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                Saturday Revision
              </span>
              <span className="text-xs text-[#858D82] dark:text-[#7F8996] font-mono">
                Week of {data?.weekStartDate}
              </span>
            </div>
            <h2 className="text-xl font-bold text-[#202620] dark:text-[#F3F4F6] flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-[var(--accent-primary)]" />
              <span>Weekly Recollection & Active Recall</span>
            </h2>
            <p className="text-xs sm:text-sm text-[#596258] dark:text-[#B0B7C2] mt-1">
              Consolidate everything learned Monday–Friday. Check off concepts you recall and reinforce weak areas.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--accent-primary)] hover:brightness-105 active:scale-[0.98] text-[var(--accent-text)] text-xs sm:text-sm font-semibold transition shadow-sm cursor-pointer disabled:opacity-50"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4 stroke-[2.5]" />
                  <span>Saved!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 stroke-[2.5]" />
                  <span>{saving ? 'Saving...' : 'Save Recollection'}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Quick Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-[#E4E7E0] dark:border-[#303945] text-xs font-mono">
          <div className="p-3 rounded-xl bg-[#F8F9F6] dark:bg-[#171B21] border border-[#E4E7E0] dark:border-[#303945]">
            <span className="text-[#858D82] dark:text-[#7F8996] block text-[10px] uppercase font-bold">Week Completed</span>
            <span className="text-base font-bold text-[#202620] dark:text-[#F3F4F6]">{totalTasks} Tasks</span>
          </div>
          <div className="p-3 rounded-xl bg-[#F8F9F6] dark:bg-[#171B21] border border-[#E4E7E0] dark:border-[#303945]">
            <span className="text-[#858D82] dark:text-[#7F8996] block text-[10px] uppercase font-bold">Active Roadmaps</span>
            <span className="text-base font-bold text-[#202620] dark:text-[#F3F4F6]">{roadmaps.length} Tracks</span>
          </div>
          <div className="p-3 rounded-xl bg-[#F8F9F6] dark:bg-[#171B21] border border-[#E4E7E0] dark:border-[#303945]">
            <span className="text-[#858D82] dark:text-[#7F8996] block text-[10px] uppercase font-bold">Notes Updated</span>
            <span className="text-base font-bold text-[#202620] dark:text-[#F3F4F6]">{notes.length} Docs</span>
          </div>
          <div className="p-3 rounded-xl bg-[#F8F9F6] dark:bg-[#171B21] border border-[#E4E7E0] dark:border-[#303945]">
            <span className="text-[#858D82] dark:text-[#7F8996] block text-[10px] uppercase font-bold">Recalled Today</span>
            <span className="text-base font-bold text-[var(--accent-primary)]">{reviewedTaskIds.size} / {totalTasks}</span>
          </div>
        </div>
      </div>

      {/* Prioritized Revision Suggestions from Past Assessments */}
      {suggestions.length > 0 && (
        <div className="p-5 rounded-2xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300 font-semibold text-sm">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Prioritized Revision Suggestions (From Past Self-Assessments)</span>
          </div>
          <p className="text-xs text-[#596258] dark:text-[#B0B7C2]">
            These topics were previously marked as <span className="font-semibold text-red-500">difficult</span> or <span className="font-semibold text-amber-500">needs revision</span>. Allocate extra focus here today:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-1">
            {suggestions.map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-xl bg-[#FFFFFF] dark:bg-[#1D232B] border border-amber-500/30 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-[10px] font-mono text-[#858D82] dark:text-[#7F8996] mb-1">
                    <span className="truncate">{item.roadmapTitle}</span>
                    <span className={`capitalize font-bold ${item.understanding === 'difficult' ? 'text-red-500' : 'text-amber-500'}`}>
                      {item.understanding.replace('_', ' ')}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-[#202620] dark:text-[#F3F4F6] line-clamp-2">
                    {item.topic}
                  </h4>
                </div>
                {item.notes && (
                  <p className="text-[11px] text-[#858D82] dark:text-[#7F8996] italic mt-2 line-clamp-2 border-t border-[#E4E7E0] dark:border-[#303945] pt-1.5">
                    "{item.notes}"
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Grouped Completed Tasks by Roadmap */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-[#858D82] dark:text-[#7F8996] font-mono px-1">
          Completed Curriculum Tasks to Recall (Monday–Friday)
        </h3>

        {roadmaps.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-[#FFFFFF] dark:bg-[#1D232B] border border-[#E4E7E0] dark:border-[#303945] text-xs text-[#858D82] dark:text-[#7F8996]">
            No completed tasks recorded for this week yet.
          </div>
        ) : (
          roadmaps.map((rm) => (
            <div
              key={rm.roadmapId}
              className="rounded-2xl border border-[#E4E7E0] dark:border-[#303945] bg-[#FFFFFF] dark:bg-[#1D232B] overflow-hidden shadow-xs"
            >
              <div className="px-5 py-3.5 bg-[#F8F9F6] dark:bg-[#171B21] border-b border-[#E4E7E0] dark:border-[#303945] flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[var(--accent-primary)]" />
                  <h4 className="text-sm font-bold text-[#202620] dark:text-[#F3F4F6]">
                    {rm.roadmapTitle}
                  </h4>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#E4E7E0] dark:bg-[#252C35] text-[#596258] dark:text-[#B0B7C2]">
                    {rm.categoryName}
                  </span>
                </div>
                <span className="text-xs font-mono text-[#858D82] dark:text-[#7F8996]">
                  {rm.tasks.length} {rm.tasks.length === 1 ? 'task' : 'tasks'}
                </span>
              </div>

              <div className="p-4 space-y-2.5">
                {rm.tasks.map((task) => {
                  const isChecked = reviewedTaskIds.has(task.id);
                  return (
                    <div
                      key={task.id}
                      onClick={() => toggleTaskReviewed(task.id)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isChecked
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-[#202620] dark:text-[#F3F4F6]'
                          : 'bg-[#F8F9F6] dark:bg-[#171B21]/60 border-[#E4E7E0] dark:border-[#303945] hover:border-[var(--accent-primary)]/50'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition ${
                            isChecked
                              ? 'bg-emerald-500 border-emerald-500 text-white'
                              : 'border-[#858D82] dark:border-[#7F8996]'
                          }`}
                        >
                          {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                        <div className="min-w-0">
                          <p className={`text-xs sm:text-sm font-medium truncate ${isChecked ? 'line-through text-[#858D82] dark:text-[#7F8996]' : ''}`}>
                            {task.title}
                          </p>
                          {task.dayTitle && (
                            <span className="text-[10px] font-mono text-[#858D82] dark:text-[#7F8996] block truncate">
                              Day {task.dayNumber}: {task.dayTitle}
                            </span>
                          )}
                        </div>
                      </div>

                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-md bg-[#E4E7E0] dark:bg-[#252C35] text-[#596258] dark:text-[#B0B7C2] shrink-0">
                        {isChecked ? 'Recalled' : 'Review'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Revision Checklist & Reflection */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Checklist */}
        <div className="lg:col-span-6 p-5 rounded-2xl bg-[#FFFFFF] dark:bg-[#1D232B] border border-[#E4E7E0] dark:border-[#303945] shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-[#202620] dark:text-[#F3F4F6] flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[var(--accent-primary)]" />
            <span>Revision Audit Checklist</span>
          </h3>
          <div className="space-y-2.5">
            {checklistItems.map((item) => (
              <label
                key={item.id}
                onClick={() => toggleChecklistItem(item.id)}
                className="flex items-start gap-3 p-3 rounded-xl bg-[#F8F9F6] dark:bg-[#171B21] border border-[#E4E7E0] dark:border-[#303945] cursor-pointer hover:border-[var(--accent-primary)]/40 transition"
              >
                <input
                  type="checkbox"
                  checked={item.completed}
                  onChange={() => {}}
                  className="mt-0.5 w-4 h-4 rounded text-[var(--accent-primary)] accent-[var(--accent-primary)] cursor-pointer"
                />
                <span className={`text-xs ${item.completed ? 'line-through text-[#858D82] dark:text-[#7F8996]' : 'text-[#202620] dark:text-[#F3F4F6]'}`}>
                  {item.text}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Reflection Notes */}
        <div className="lg:col-span-6 p-5 rounded-2xl bg-[#FFFFFF] dark:bg-[#1D232B] border border-[#E4E7E0] dark:border-[#303945] shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#202620] dark:text-[#F3F4F6] flex items-center gap-2 mb-1.5">
              <FileText className="w-4 h-4 text-[var(--accent-primary)]" />
              <span>Saturday Reflection & Revision Notes</span>
            </h3>
            <p className="text-xs text-[#596258] dark:text-[#B0B7C2] mb-3">
              Document which patterns clicked, what needed extra reading, and key algorithmic insights.
            </p>
            <textarea
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              placeholder="e.g. Reviewed PostgreSQL MVCC and B-Tree indexing. Practiced state hoisting in React..."
              rows={5}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F9F6] dark:bg-[#171B21] border border-[#E4E7E0] dark:border-[#303945] text-xs sm:text-sm text-[#202620] dark:text-[#F3F4F6] placeholder-[#858D82] focus:outline-none focus:border-[var(--accent-primary)] transition"
            />
          </div>

          <div className="flex items-center justify-end pt-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--accent-primary)] hover:brightness-105 active:scale-[0.98] text-[var(--accent-text)] text-xs sm:text-sm font-semibold transition shadow-sm cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Saturday Notes'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
