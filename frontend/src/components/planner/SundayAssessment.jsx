import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  FileText,
  Target,
  Sparkles,
  Save,
  Check,
  BarChart2,
  Flame,
  ArrowRight,
} from 'lucide-react';
import { weekendReviewService } from '../../services/weekendReviewService';

export default function SundayAssessment({
  weekStartDate,
  initialData,
  onOpenWeeklyReport,
  onSaved,
}) {
  const [data, setData] = useState(initialData || null);
  const [loading, setLoading] = useState(!initialData);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Ratings map: { [topicName]: 'understood' | 'needs_revision' | 'difficult' }
  const [topicRatings, setTopicRatings] = useState({});
  const [topicNotes, setTopicNotes] = useState({});

  // Reflection form fields
  const [reflection, setReflection] = useState('');
  const [mistakes, setMistakes] = useState('');
  const [questions, setQuestions] = useState('');
  const [weakAreas, setWeakAreas] = useState('');
  const [nextWeekGoals, setNextWeekGoals] = useState('');

  useEffect(() => {
    if (initialData) {
      setData(initialData);
      populateFromSaved(initialData.savedReview);
    } else {
      loadAssessment();
    }
  }, [weekStartDate, initialData]);

  const populateFromSaved = (saved) => {
    if (!saved) return;
    setReflection(saved.reflection || '');
    setMistakes(saved.mistakes || '');
    setQuestions(saved.questions || '');
    setWeakAreas(saved.weakAreas || '');
    setNextWeekGoals(saved.nextWeekGoals || '');

    if (Array.isArray(saved.topicAssessments)) {
      const rMap = {};
      const nMap = {};
      saved.topicAssessments.forEach((ta) => {
        rMap[ta.topic] = ta.understanding;
        if (ta.notes) nMap[ta.topic] = ta.notes;
      });
      setTopicRatings(rMap);
      setTopicNotes(nMap);
    }
  };

  const loadAssessment = async () => {
    try {
      setLoading(true);
      const res = await weekendReviewService.getAssessment(weekStartDate);
      setData(res);
      populateFromSaved(res?.savedReview);
    } catch (err) {
      console.error('Failed to load assessment data:', err);
    } finally {
      setLoading(false);
    }
  };

  const setRating = (topic, level) => {
    setTopicRatings((prev) => ({
      ...prev,
      [topic]: level,
    }));
  };

  const setNote = (topic, text) => {
    setTopicNotes((prev) => ({
      ...prev,
      [topic]: text,
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setSavedSuccess(false);

      const topicsCovered = data?.topicsCovered || [];
      const topicAssessments = topicsCovered
        .filter((t) => topicRatings[t.topic])
        .map((t) => ({
          topic: t.topic,
          understanding: topicRatings[t.topic],
          notes: topicNotes[t.topic] || null,
          roadmapId: t.roadmapId || null,
          taskId: t.taskId || null,
        }));

      await weekendReviewService.saveReview({
        weekStartDate: data?.weekStartDate || weekStartDate,
        reviewType: 'assessment',
        reflection,
        mistakes,
        questions,
        weakAreas,
        nextWeekGoals,
        topicAssessments,
      });

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
      if (onSaved) onSaved();
    } catch (err) {
      alert(err.message || 'Failed to save Sunday assessment');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 bg-[#FFFFFF] dark:bg-[#1D232B] rounded-2xl border border-[#E4E7E0] dark:border-[#303945] animate-pulse space-y-4">
        <div className="h-6 bg-[#E4E7E0] dark:bg-[#252C35] rounded-md w-1/3" />
        <div className="h-28 bg-[#E4E7E0] dark:bg-[#252C35] rounded-xl" />
      </div>
    );
  }

  const topicsCovered = data?.topicsCovered || [];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#FFFFFF] dark:bg-[#1D232B] border border-[#E4E7E0] dark:border-[#303945] shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                Sunday Review
              </span>
              <span className="text-xs text-[#858D82] dark:text-[#7F8996] font-mono">
                Week of {data?.weekStartDate}
              </span>
            </div>
            <h2 className="text-xl font-bold text-[#202620] dark:text-[#F3F4F6] flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[var(--accent-primary)]" />
              <span>Weekly Self-Assessment & Reflection</span>
            </h2>
            <p className="text-xs sm:text-sm text-[#596258] dark:text-[#B0B7C2] mt-1">
              Rate your technical depth across this week's topics. Topics marked as difficult or needing revision will automatically be prioritized in future recall sessions.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {onOpenWeeklyReport && (
              <button
                onClick={onOpenWeeklyReport}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#F0F2ED] hover:bg-[#E4E7E0] dark:bg-[#252C35] dark:hover:bg-[#2B333D] text-[#202620] dark:text-[#F3F4F6] text-xs sm:text-sm font-semibold transition border border-[#E4E7E0] dark:border-[#303945] cursor-pointer"
              >
                <BarChart2 className="w-4 h-4 text-[var(--accent-primary)]" />
                <span>Weekly Report</span>
              </button>
            )}

            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--accent-primary)] hover:brightness-105 active:scale-[0.98] text-[var(--accent-text)] text-xs sm:text-sm font-semibold transition shadow-sm cursor-pointer disabled:opacity-50"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4 stroke-[2.5]" />
                  <span>Assessment Saved!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 stroke-[2.5]" />
                  <span>{saving ? 'Saving...' : 'Save Assessment'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Topics Covered & 3-Tier Rating */}
      <div className="rounded-2xl border border-[#E4E7E0] dark:border-[#303945] bg-[#FFFFFF] dark:bg-[#1D232B] overflow-hidden shadow-xs">
        <div className="px-5 py-4 bg-[#F8F9F6] dark:bg-[#171B21] border-b border-[#E4E7E0] dark:border-[#303945] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-[#202620] dark:text-[#F3F4F6]">
              Topic Understanding Ratings ({topicsCovered.length} Topics Covered)
            </h3>
          </div>
          <div className="flex items-center gap-4 text-[11px] font-mono">
            <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Understood
            </span>
            <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              Needs Revision
            </span>
            <span className="flex items-center gap-1.5 text-red-600 dark:text-red-400">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              Difficult
            </span>
          </div>
        </div>

        <div className="p-5 space-y-3.5">
          {topicsCovered.length === 0 ? (
            <p className="text-xs text-[#858D82] dark:text-[#7F8996] text-center py-6 font-mono">
              No completed curriculum topics found for this week to assess.
            </p>
          ) : (
            topicsCovered.map((topicItem) => {
              const currentRating = topicRatings[topicItem.topic] || null;
              return (
                <div
                  key={topicItem.topic}
                  className="p-4 rounded-xl bg-[#F8F9F6] dark:bg-[#171B21] border border-[#E4E7E0] dark:border-[#303945] space-y-2.5"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="min-w-0">
                      <span className="text-[10px] font-mono text-[#858D82] dark:text-[#7F8996] block truncate">
                        {topicItem.roadmapTitle} • Day {topicItem.dayNumber}
                      </span>
                      <h4 className="text-xs sm:text-sm font-bold text-[#202620] dark:text-[#F3F4F6] truncate">
                        {topicItem.topic}
                      </h4>
                    </div>

                    {/* 3-Tier Pill Buttons */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => setRating(topicItem.topic, 'understood')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                          currentRating === 'understood'
                            ? 'bg-emerald-500 text-white shadow-xs'
                            : 'bg-[#FFFFFF] dark:bg-[#252C35] text-[#596258] dark:text-[#B0B7C2] border border-[#E4E7E0] dark:border-[#303945] hover:border-emerald-500/50'
                        }`}
                      >
                        ✓ Understood
                      </button>

                      <button
                        type="button"
                        onClick={() => setRating(topicItem.topic, 'needs_revision')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                          currentRating === 'needs_revision'
                            ? 'bg-amber-500 text-white shadow-xs'
                            : 'bg-[#FFFFFF] dark:bg-[#252C35] text-[#596258] dark:text-[#B0B7C2] border border-[#E4E7E0] dark:border-[#303945] hover:border-amber-500/50'
                        }`}
                      >
                        ⚡ Needs Revision
                      </button>

                      <button
                        type="button"
                        onClick={() => setRating(topicItem.topic, 'difficult')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                          currentRating === 'difficult'
                            ? 'bg-red-500 text-white shadow-xs'
                            : 'bg-[#FFFFFF] dark:bg-[#252C35] text-[#596258] dark:text-[#B0B7C2] border border-[#E4E7E0] dark:border-[#303945] hover:border-red-500/50'
                        }`}
                      >
                        ⚠️ Difficult
                      </button>
                    </div>
                  </div>

                  {/* Optional topic notes input */}
                  {currentRating && (
                    <input
                      type="text"
                      value={topicNotes[topicItem.topic] || ''}
                      onChange={(e) => setNote(topicItem.topic, e.target.value)}
                      placeholder="Specific doubt or confusing edge case (optional)..."
                      className="w-full px-3 py-1.5 text-xs rounded-lg bg-[#FFFFFF] dark:bg-[#252C35] border border-[#E4E7E0] dark:border-[#303945] text-[#202620] dark:text-[#F3F4F6] placeholder-[#858D82] focus:outline-none focus:border-[var(--accent-primary)] transition"
                    />
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Qualitative Self-Assessment Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Questions that arose */}
        <div className="p-5 rounded-2xl bg-[#FFFFFF] dark:bg-[#1D232B] border border-[#E4E7E0] dark:border-[#303945] shadow-xs space-y-2">
          <label className="text-xs font-bold text-[#202620] dark:text-[#F3F4F6] flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-amber-500" />
            <span>Questions That Arose This Week</span>
          </label>
          <textarea
            value={questions}
            onChange={(e) => setQuestions(e.target.value)}
            placeholder="Questions or architectural doubts requiring research or mentor guidance..."
            rows={3}
            className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F9F6] dark:bg-[#171B21] border border-[#E4E7E0] dark:border-[#303945] text-xs sm:text-sm text-[#202620] dark:text-[#F3F4F6] placeholder-[#858D82] focus:outline-none focus:border-[var(--accent-primary)] transition"
          />
        </div>

        {/* Mistakes / Confusing concepts */}
        <div className="p-5 rounded-2xl bg-[#FFFFFF] dark:bg-[#1D232B] border border-[#E4E7E0] dark:border-[#303945] shadow-xs space-y-2">
          <label className="text-xs font-bold text-[#202620] dark:text-[#F3F4F6] flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
            <span>Mistakes Made & Confusing Concepts</span>
          </label>
          <textarea
            value={mistakes}
            onChange={(e) => setMistakes(e.target.value)}
            placeholder="Syntax bugs, async pitfalls, memory traps, or incorrect assumptions..."
            rows={3}
            className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F9F6] dark:bg-[#171B21] border border-[#E4E7E0] dark:border-[#303945] text-xs sm:text-sm text-[#202620] dark:text-[#F3F4F6] placeholder-[#858D82] focus:outline-none focus:border-[var(--accent-primary)] transition"
          />
        </div>

        {/* Topics Needing Extra Practice */}
        <div className="p-5 rounded-2xl bg-[#FFFFFF] dark:bg-[#1D232B] border border-[#E4E7E0] dark:border-[#303945] shadow-xs space-y-2">
          <label className="text-xs font-bold text-[#202620] dark:text-[#F3F4F6] flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-orange-500" />
            <span>Topics Needing Extra Practice</span>
          </label>
          <textarea
            value={weakAreas}
            onChange={(e) => setWeakAreas(e.target.value)}
            placeholder="e.g. Graph traversals, PostgreSQL CTE queries, Docker multi-stage builds..."
            rows={3}
            className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F9F6] dark:bg-[#171B21] border border-[#E4E7E0] dark:border-[#303945] text-xs sm:text-sm text-[#202620] dark:text-[#F3F4F6] placeholder-[#858D82] focus:outline-none focus:border-[var(--accent-primary)] transition"
          />
        </div>

        {/* Next Week's Learning Goals */}
        <div className="p-5 rounded-2xl bg-[#FFFFFF] dark:bg-[#1D232B] border border-[#E4E7E0] dark:border-[#303945] shadow-xs space-y-2">
          <label className="text-xs font-bold text-[#202620] dark:text-[#F3F4F6] flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-emerald-500" />
            <span>Next Week's Learning Goals</span>
          </label>
          <textarea
            value={nextWeekGoals}
            onChange={(e) => setNextWeekGoals(e.target.value)}
            placeholder="Primary deliverables, milestone objectives, target modules for Monday–Friday..."
            rows={3}
            className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F9F6] dark:bg-[#171B21] border border-[#E4E7E0] dark:border-[#303945] text-xs sm:text-sm text-[#202620] dark:text-[#F3F4F6] placeholder-[#858D82] focus:outline-none focus:border-[var(--accent-primary)] transition"
          />
        </div>
      </div>

      {/* Bottom Save Bar */}
      <div className="p-5 rounded-2xl bg-[#FFFFFF] dark:bg-[#1D232B] border border-[#E4E7E0] dark:border-[#303945] flex items-center justify-between shadow-xs">
        <div className="text-xs text-[#596258] dark:text-[#B0B7C2]">
          All ratings and reflections are saved persistently and fed into your Weekly Engineering Report.
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[var(--accent-primary)] hover:brightness-105 active:scale-[0.98] text-[var(--accent-text)] text-xs sm:text-sm font-semibold transition shadow-sm cursor-pointer disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving Assessment...' : 'Save Weekly Assessment'}</span>
        </button>
      </div>
    </div>
  );
}
