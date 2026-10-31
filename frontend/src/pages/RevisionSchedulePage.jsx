import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clock,
  RefreshCw,
  Calendar,
  CheckCircle2,
  AlertCircle,
  PauseCircle,
  PlayCircle,
  Trash2,
  Plus,
  BookOpen,
  Layers,
  ArrowRight,
  RotateCcw,
  Sparkles,
  FileText,
  Timer,
  X,
} from 'lucide-react';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import StatCard from '../components/ui/StatCard';
import EmptyState from '../components/ui/EmptyState';
import Modal from '../components/ui/Modal';
import ConfirmationDialog from '../components/ui/ConfirmationDialog';
import MarkdownViewer from '../components/notes/MarkdownViewer';
import { revisionService } from '../services/revisionService';
import { roadmapService } from '../services/roadmapService';
import { noteService } from '../services/noteService';

export default function RevisionSchedulePage() {
  const navigate = useNavigate();
  const [revisions, setRevisions] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('due'); // 'due' | 'overdue' | 'upcoming' | 'completed' | 'paused' | 'all'

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeSessionRevision, setActiveSessionRevision] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);

  // New revision form state
  const [newTopic, setNewTopic] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newRoadmapId, setNewRoadmapId] = useState('');
  const [newPriority, setNewPriority] = useState('normal');
  const [newIntervalDays, setNewIntervalDays] = useState(1);
  const [roadmaps, setRoadmaps] = useState([]);
  const [notes, setNotes] = useState([]);
  const [selectedNoteId, setSelectedNoteId] = useState('');

  // Active Session state
  const [sessionRating, setSessionRating] = useState('good');
  const [sessionNotes, setSessionNotes] = useState('');
  const [sessionDuration, setSessionDuration] = useState(10);
  const [isSubmittingSession, setIsSubmittingSession] = useState(false);

  const fetchRevisions = useCallback(async () => {
    try {
      setLoading(true);
      const [revData, anaData] = await Promise.all([
        revisionService.getRevisions({ status: activeTab }),
        revisionService.getAnalytics(),
      ]);
      setRevisions(revData || []);
      setAnalytics(anaData || null);
    } catch (err) {
      console.error('Failed to load revisions:', err);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchRevisions();
  }, [fetchRevisions]);

  useEffect(() => {
    async function loadAuxData() {
      try {
        const [rmRes, noteRes] = await Promise.all([
          roadmapService.getRoadmaps({ status: 'all' }),
          noteService.getNotes({ limit: 50 }),
        ]);
        setRoadmaps(rmRes?.roadmaps || rmRes || []);
        setNotes(noteRes?.notes || []);
      } catch (err) {
        console.error('Failed to load aux data:', err);
      }
    }
    loadAuxData();
  }, []);

  const handleCreateRevision = async (e) => {
    e.preventDefault();
    if (!newTopic.trim()) return;

    try {
      await revisionService.createRevision({
        topic: newTopic.trim(),
        description: newDescription.trim() || null,
        roadmapId: newRoadmapId || null,
        noteId: selectedNoteId || null,
        priority: newPriority,
        intervalDays: Number(newIntervalDays) || 1,
      });

      setIsCreateModalOpen(false);
      setNewTopic('');
      setNewDescription('');
      setNewRoadmapId('');
      setSelectedNoteId('');
      fetchRevisions();
    } catch (err) {
      console.error('Create revision error:', err);
    }
  };

  const handleCompleteSession = async () => {
    if (!activeSessionRevision) return;

    try {
      setIsSubmittingSession(true);
      await revisionService.completeSession(activeSessionRevision.id, {
        rating: sessionRating,
        notes: sessionNotes,
        durationMinutes: Number(sessionDuration) || 10,
      });
      setActiveSessionRevision(null);
      setSessionNotes('');
      fetchRevisions();
    } catch (err) {
      console.error('Session submission error:', err);
    } finally {
      setIsSubmittingSession(false);
    }
  };

  const handleTogglePause = async (rev) => {
    try {
      if (rev.status === 'paused') {
        await revisionService.resume(rev.id);
      } else {
        await revisionService.pause(rev.id);
      }
      fetchRevisions();
    } catch (err) {
      console.error('Toggle pause error:', err);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;
    try {
      await revisionService.deleteRevision(itemToDelete.id);
      setItemToDelete(null);
      fetchRevisions();
    } catch (err) {
      console.error('Delete revision error:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#202A23] dark:text-[#DFD0B8] flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-[#244C3B] dark:text-[#DFD0B8]" />
            Smart Spaced Repetition & Recall
          </h2>
          <p className="text-xs text-[#737C74] dark:text-[#948979] mt-1">
            Engineered spaced retention intervals (1d, 3d, 7d, 14d, 30d) based on recall performance ratings.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          icon={Plus}
          onClick={() => setIsCreateModalOpen(true)}
        >
          Schedule Topic
        </Button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Due Today"
          value={`${analytics?.dueTodayCount ?? 0} Topics`}
          subtitle="Ready for recall session"
          icon={CheckCircle2}
          color="emerald"
        />
        <StatCard
          title="Overdue"
          value={`${analytics?.overdueCount ?? 0} Topics`}
          subtitle="Priority recall required"
          icon={AlertCircle}
          color="amber"
        />
        <StatCard
          title="Upcoming Queue"
          value={`${analytics?.upcomingCount ?? 0} Scheduled`}
          subtitle="Next 7–30 days"
          icon={Calendar}
          color="green"
        />
        <StatCard
          title="Completed Sessions"
          value={`${analytics?.completedSessionsCount ?? 0} Cleared`}
          subtitle={`Retention Rate: ${analytics?.retentionRate ?? 100}%`}
          icon={RefreshCw}
          color="sky"
        />
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E8E8DF] dark:border-[#393E46] pb-3 overflow-x-auto text-xs">
        {[
          { id: 'due', label: `Due Today (${analytics?.dueTodayCount ?? 0})` },
          { id: 'overdue', label: `Overdue (${analytics?.overdueCount ?? 0})` },
          { id: 'upcoming', label: `Upcoming (${analytics?.upcomingCount ?? 0})` },
          { id: 'completed', label: `Completed (${analytics?.completedSessionsCount ?? 0})` },
          { id: 'paused', label: `Paused (${analytics?.pausedCount ?? 0})` },
          { id: 'all', label: 'All Items' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-[#244C3B] text-white dark:bg-[#DFD0B8] dark:text-[#222831]'
                : 'text-[#737C74] dark:text-[#948979] hover:bg-[#EAEAE4] dark:hover:bg-[#393E46]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Revisions List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-24 rounded-xl bg-[#FFFFFF] dark:bg-[#2A303A] border border-[#E8E8DF] dark:border-[#393E46] animate-pulse"
            />
          ))}
        </div>
      ) : revisions.length === 0 ? (
        <div className="bg-[#FFFFFF] dark:bg-[#2A303A] border border-[#E8E8DF] dark:border-[#393E46] rounded-xl p-8">
          <EmptyState
            icon={Clock}
            title={`No ${activeTab} revision topics`}
            description={
              activeTab === 'due'
                ? 'You are all caught up! No spaced recall checkpoints are pending for today.'
                : 'Items scheduled for memory retention will appear in this queue.'
            }
            action={
              <Button
                variant="primary"
                size="sm"
                icon={Plus}
                onClick={() => setIsCreateModalOpen(true)}
              >
                Schedule New Topic
              </Button>
            }
          />
        </div>
      ) : (
        <div className="space-y-3">
          {revisions.map((rev) => (
            <div
              key={rev.id}
              className="bg-[#FFFFFF] dark:bg-[#2A303A] border border-[#E8E8DF] dark:border-[#393E46] hover:border-[#244C3B] dark:hover:border-[#DFD0B8] rounded-xl p-5 shadow-xs transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      rev.priority === 'urgent'
                        ? 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400'
                        : rev.priority === 'high'
                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'
                        : 'bg-[#E8F0EB] text-[#244C3B] dark:bg-[#393E46] dark:text-[#DFD0B8]'
                    }`}
                  >
                    Stage {rev.stage} • Interval {rev.intervalDays}d
                  </span>

                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-medium capitalize ${
                      rev.status === 'due'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                        : rev.status === 'overdue'
                        ? 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300'
                        : rev.status === 'paused'
                        ? 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                        : 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                    }`}
                  >
                    {rev.status}
                  </span>

                  {rev.scheduledDate && (
                    <span className="text-xs text-[#737C74] dark:text-[#948979] flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Due:{' '}
                      {new Date(rev.scheduledDate).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-sm text-[#202A23] dark:text-[#DFD0B8] mb-1">
                  {rev.topic}
                </h3>

                {rev.description && (
                  <p className="text-xs text-[#737C74] dark:text-[#948979] line-clamp-2 mb-2">
                    {rev.description}
                  </p>
                )}

                <div className="flex items-center gap-3 text-[11px] text-[#737C74] dark:text-[#948979] flex-wrap">
                  {rev.roadmap?.title && (
                    <span className="flex items-center gap-1 text-[#244C3B] dark:text-[#DFD0B8] font-medium">
                      <Layers className="w-3 h-3" />
                      {rev.roadmap.title}
                    </span>
                  )}
                  {rev.note && (
                    <span className="flex items-center gap-1">
                      <FileText className="w-3 h-3" />
                      Linked Note: {rev.note.title}
                    </span>
                  )}
                  {rev.lastRevisedAt && (
                    <span>
                      Last recall:{' '}
                      {new Date(rev.lastRevisedAt).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                {rev.status !== 'completed' && rev.status !== 'paused' && (
                  <>
                    <Button
                      variant="primary"
                      size="sm"
                      icon={Sparkles}
                      onClick={() => setActiveSessionRevision(rev)}
                    >
                      Recall Session
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      icon={Timer}
                      onClick={() =>
                        navigate(
                          `/focus?revisionId=${rev.id}&title=${encodeURIComponent(
                            `Revision: ${rev.topic}`
                          )}&roadmapId=${rev.roadmapId || ''}`
                        )
                      }
                    >
                      Focus
                    </Button>
                  </>
                )}

                <button
                  onClick={() => handleTogglePause(rev)}
                  title={rev.status === 'paused' ? 'Resume revision' : 'Pause schedule'}
                  className="p-1.5 rounded-lg border border-[#E8E8DF] dark:border-[#393E46] text-[#737C74] hover:text-[#202A23] dark:text-[#948979] dark:hover:text-[#DFD0B8] transition"
                >
                  {rev.status === 'paused' ? (
                    <PlayCircle className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <PauseCircle className="w-4 h-4" />
                  )}
                </button>

                <button
                  onClick={() => setItemToDelete(rev)}
                  title="Delete topic"
                  className="p-1.5 rounded-lg border border-[#E8E8DF] dark:border-[#393E46] text-red-500 hover:text-red-700 transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Revision Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Schedule Spaced Revision Topic"
      >
        <form onSubmit={handleCreateRevision} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#202A23] dark:text-[#DFD0B8] mb-1">
              Topic / Key Concept *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Raft Leader Election & Heartbeats"
              value={newTopic}
              onChange={(e) => setNewTopic(e.target.value)}
              className="w-full text-xs bg-[#FFFFFF] dark:bg-[#2A303A] border border-[#E8E8DF] dark:border-[#393E46] rounded-lg px-3 py-2 text-[#202A23] dark:text-[#DFD0B8] outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#202A23] dark:text-[#DFD0B8] mb-1">
              Recall Prompts / Description (Optional)
            </label>
            <textarea
              rows={3}
              placeholder="Questions or edge cases to challenge yourself on during the recall session..."
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              className="w-full text-xs bg-[#FFFFFF] dark:bg-[#2A303A] border border-[#E8E8DF] dark:border-[#393E46] rounded-lg px-3 py-2 text-[#202A23] dark:text-[#DFD0B8] outline-none resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#202A23] dark:text-[#DFD0B8] mb-1">
                Link to Curriculum Roadmap
              </label>
              <select
                value={newRoadmapId}
                onChange={(e) => setNewRoadmapId(e.target.value)}
                className="w-full text-xs bg-[#FFFFFF] dark:bg-[#2A303A] border border-[#E8E8DF] dark:border-[#393E46] rounded-lg px-3 py-2 text-[#202A23] dark:text-[#DFD0B8] outline-none"
              >
                <option value="">Independent / General Topic</option>
                {roadmaps.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#202A23] dark:text-[#DFD0B8] mb-1">
                Attach Note (Optional)
              </label>
              <select
                value={selectedNoteId}
                onChange={(e) => setSelectedNoteId(e.target.value)}
                className="w-full text-xs bg-[#FFFFFF] dark:bg-[#2A303A] border border-[#E8E8DF] dark:border-[#393E46] rounded-lg px-3 py-2 text-[#202A23] dark:text-[#DFD0B8] outline-none truncate"
              >
                <option value="">No note attached</option>
                {notes.map((n) => (
                  <option key={n.id} value={n.id}>
                    {n.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#202A23] dark:text-[#DFD0B8] mb-1">
                Initial Interval (Days)
              </label>
              <select
                value={newIntervalDays}
                onChange={(e) => setNewIntervalDays(e.target.value)}
                className="w-full text-xs bg-[#FFFFFF] dark:bg-[#2A303A] border border-[#E8E8DF] dark:border-[#393E46] rounded-lg px-3 py-2 text-[#202A23] dark:text-[#DFD0B8] outline-none"
              >
                <option value={1}>1 Day (Tomorrow)</option>
                <option value={3}>3 Days</option>
                <option value={7}>7 Days (1 Week)</option>
                <option value={14}>14 Days (2 Weeks)</option>
                <option value={30}>30 Days (1 Month)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#202A23] dark:text-[#DFD0B8] mb-1">
                Priority
              </label>
              <select
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value)}
                className="w-full text-xs bg-[#FFFFFF] dark:bg-[#2A303A] border border-[#E8E8DF] dark:border-[#393E46] rounded-lg px-3 py-2 text-[#202A23] dark:text-[#DFD0B8] outline-none"
              >
                <option value="normal">Normal</option>
                <option value="high">High Priority</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-[#E8E8DF] dark:border-[#393E46]">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsCreateModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Schedule Topic
            </Button>
          </div>
        </form>
      </Modal>

      {/* Active Revision Recall Session Workspace Modal */}
      <Modal
        isOpen={!!activeSessionRevision}
        onClose={() => setActiveSessionRevision(null)}
        title="Spaced Recall Session"
      >
        {activeSessionRevision && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-[#F7F7F2] dark:bg-[#222831] border border-[#E8E8DF] dark:border-[#393E46]">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#244C3B] dark:text-[#DFD0B8]">
                  Stage {activeSessionRevision.stage} Checkpoint
                </span>
              </div>
              <h3 className="text-base font-bold text-[#202A23] dark:text-[#DFD0B8]">
                {activeSessionRevision.topic}
              </h3>
              {activeSessionRevision.description && (
                <p className="text-xs text-[#737C74] dark:text-[#948979] mt-2">
                  {activeSessionRevision.description}
                </p>
              )}
            </div>

            {/* Linked Note Preview if available */}
            {activeSessionRevision.note && (
              <div className="p-4 rounded-xl border border-[#E8E8DF] dark:border-[#393E46] bg-[#FFFFFF] dark:bg-[#2A303A] max-h-48 overflow-y-auto">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#244C3B] dark:text-[#DFD0B8] mb-2">
                  <FileText className="w-3.5 h-3.5" />
                  <span>Associated Note: {activeSessionRevision.note.title}</span>
                </div>
                <MarkdownViewer content={activeSessionRevision.note.content} />
              </div>
            )}

            {/* Understanding Rating Picker */}
            <div>
              <label className="block text-xs font-semibold text-[#202A23] dark:text-[#DFD0B8] mb-2">
                How well did you recall this concept?
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  {
                    id: 'again',
                    label: 'Again',
                    desc: 'Review tomorrow (Stage 1)',
                    color: 'hover:border-red-500',
                  },
                  {
                    id: 'difficult',
                    label: 'Difficult',
                    desc: 'Review in 2 days',
                    color: 'hover:border-amber-500',
                  },
                  {
                    id: 'good',
                    label: 'Good',
                    desc: 'Advance to next interval',
                    color: 'hover:border-emerald-500',
                  },
                  {
                    id: 'easy',
                    label: 'Easy',
                    desc: 'Advance + extended interval',
                    color: 'hover:border-blue-500',
                  },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setSessionRating(opt.id)}
                    className={`p-3 rounded-lg border text-left transition cursor-pointer flex flex-col justify-between ${
                      sessionRating === opt.id
                        ? 'border-[#244C3B] bg-[#E8F0EB] dark:border-[#DFD0B8] dark:bg-[#393E46]'
                        : 'border-[#E8E8DF] dark:border-[#393E46] bg-[#FFFFFF] dark:bg-[#2A303A]'
                    } ${opt.color}`}
                  >
                    <span className="font-bold text-xs text-[#202A23] dark:text-[#DFD0B8]">
                      {opt.label}
                    </span>
                    <span className="text-[10px] text-[#737C74] dark:text-[#948979] mt-1">
                      {opt.desc}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Session Notes */}
            <div>
              <label className="block text-xs font-semibold text-[#202A23] dark:text-[#DFD0B8] mb-1">
                Recall Reflection / Insights
              </label>
              <textarea
                rows={2}
                placeholder="What did you remember? What details need sharpening?"
                value={sessionNotes}
                onChange={(e) => setSessionNotes(e.target.value)}
                className="w-full text-xs bg-[#FFFFFF] dark:bg-[#2A303A] border border-[#E8E8DF] dark:border-[#393E46] rounded-lg px-3 py-2 text-[#202A23] dark:text-[#DFD0B8] outline-none resize-none"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-[#E8E8DF] dark:border-[#393E46]">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveSessionRevision(null)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleCompleteSession}
                disabled={isSubmittingSession}
              >
                {isSubmittingSession ? 'Saving Recall...' : 'Complete Session'}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Revision Topic"
        message={`Are you sure you want to remove "${itemToDelete?.topic}" from your spaced revision schedule? Curriculum roadmaps and tasks will remain untouched.`}
        confirmText="Delete Topic"
        confirmVariant="danger"
      />
    </div>
  );
}
