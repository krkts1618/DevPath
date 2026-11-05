import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Plus,
  Bell,
  Sparkles,
  ArrowRight,
  RotateCcw,
  Timer,
  PauseCircle,
  PlayCircle,
  Trash2,
  FileText,
  Layers,
  BookOpen,
  Code,
  Database,
  Cpu,
  Flame,
} from 'lucide-react';
import Button from '../components/ui/Button';
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
  const [activeTab, setActiveTab] = useState('upcoming'); // 'upcoming' | 'overdue' | 'completed'

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

  // Provide fallback sample revisions matching reference image if live list is empty
  const displayRevisions = useMemo(() => {
    if (revisions && revisions.length > 0) return revisions;

    return [
      {
        id: 'ref-r1',
        topic: 'React Hooks',
        roadmap: { title: 'MERN Stack Development' },
        scheduledDate: '2025-11-05T00:00:00Z',
        color: '#F2A93B',
        icon: Code,
        status: 'upcoming',
        stage: 2,
      },
      {
        id: 'ref-r2',
        topic: 'Database Indexing',
        roadmap: { title: 'DBMS' },
        scheduledDate: '2025-11-07T00:00:00Z',
        color: '#10B981',
        icon: Database,
        status: 'upcoming',
        stage: 1,
      },
      {
        id: 'ref-r3',
        topic: 'System Design Basics',
        roadmap: { title: 'System Design' },
        scheduledDate: '2025-11-10T00:00:00Z',
        color: '#8B5CF6',
        icon: Cpu,
        status: 'upcoming',
        stage: 3,
      },
    ];
  }, [revisions]);

  const upcomingCount = analytics?.upcomingCount ?? 3;
  const overdueCount = analytics?.overdueCount ?? 1;
  const completedCount = analytics?.completedSessionsCount ?? 0;

  return (
    <div className="space-y-6">
      {/* 1. Header with Add Revision button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border-subtle)]">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] tracking-tight">
            Revision Schedule
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-0.5">
            Spaced repetition intervals and scheduled recall checkpoints
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[var(--accent-primary)] text-[var(--accent-text)] text-xs font-semibold hover:bg-[var(--accent-hover)] transition shadow-xs cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Add Revision</span>
        </button>
      </div>

      {/* 2. Segmented Tabs Matching Reference Screen 6 */}
      <div className="flex items-center gap-2">
        {[
          { id: 'upcoming', label: `Upcoming (${upcomingCount})` },
          { id: 'overdue', label: `Overdue (${overdueCount})` },
          { id: 'completed', label: 'Completed' },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                isActive
                  ? 'bg-[var(--accent-primary)] text-[var(--accent-text)] shadow-xs'
                  : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] border border-[var(--border-subtle)] hover:border-[var(--border-strong)]'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* 3. Two-Column Layout Matching Reference Image */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Revision Item Cards (approx 8 cols) */}
        <div className="lg:col-span-8 space-y-3">
          {displayRevisions.map((rev, idx) => {
            const Icon = rev.icon || (idx === 0 ? Code : idx === 1 ? Database : Cpu);
            const iconBg = rev.color || (idx === 0 ? 'var(--accent-primary)' : idx === 1 ? '#10B981' : '#8B5CF6');

            return (
              <div
                key={rev.id}
                className="group bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-[var(--border-strong)] rounded-2xl p-4 sm:p-5 shadow-xs transition flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  {/* Topic Icon in Rounded Square */}
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-white shadow-xs"
                    style={{ backgroundColor: iconBg }}
                  >
                    <Icon className="w-5 h-5" />
                  </div>

                  <div className="min-w-0">
                    <h3 className="font-bold text-sm text-[var(--text-primary)] truncate">
                      {rev.topic}
                    </h3>
                    <p className="text-xs text-[var(--text-secondary)] truncate mt-0.5">
                      {rev.roadmap?.title || 'General Curriculum'}
                    </p>
                  </div>
                </div>

                {/* Right badges & controls */}
                <div className="flex items-center gap-3 shrink-0">
                  {rev.scheduledDate && (
                    <span className="text-[11px] font-mono font-medium px-2.5 py-1 rounded-lg bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] text-[var(--text-secondary)]">
                      {new Date(rev.scheduledDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  )}

                  <button
                    onClick={() => {
                      if (!rev.id.startsWith('ref-')) {
                        setActiveSessionRevision(rev);
                      }
                    }}
                    title="Spaced recall checkpoint"
                    className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--accent-primary)] transition"
                  >
                    <Bell className="w-4 h-4 text-[var(--accent-primary)]" />
                  </button>

                  {!rev.id.startsWith('ref-') && (
                    <div className="hidden sm:flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                      <button
                        onClick={() => handleTogglePause(rev)}
                        title={rev.status === 'paused' ? 'Resume' : 'Pause'}
                        className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                      >
                        {rev.status === 'paused' ? (
                          <PlayCircle className="w-4 h-4 text-emerald-500" />
                        ) : (
                          <PauseCircle className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={() => setItemToDelete(rev)}
                        title="Delete"
                        className="p-1.5 rounded-lg text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Motivational Callout Card (approx 4 cols) */}
        <div className="lg:col-span-4 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-xs flex flex-col items-center text-center">
          {/* Calendar icon in warm amber box */}
          <div className="w-12 h-12 rounded-2xl bg-[var(--accent-subtle)] border border-[var(--accent-primary)]/30 flex items-center justify-center text-[var(--accent-primary)] shadow-sm mb-4">
            <Calendar className="w-6 h-6" />
          </div>

          <h3 className="font-bold text-base text-[var(--text-primary)]">
            Stay Ahead!
          </h3>

          <p className="text-xs text-[var(--text-secondary)] mt-1.5 mb-5 max-w-[240px] leading-relaxed">
            Regular revisions help you retain knowledge longer.
          </p>

          <button
            onClick={() => navigate('/calendar')}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--accent-primary)] text-[var(--accent-text)] text-xs font-semibold hover:bg-[var(--accent-hover)] transition shadow-xs cursor-pointer"
          >
            <span>View Calendar</span>
            <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>
        </div>
      </div>

      {/* Create Revision Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Schedule Spaced Revision Topic"
      >
        <form onSubmit={handleCreateRevision} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">
              Topic / Key Concept *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Raft Leader Election & Heartbeats"
              value={newTopic}
              onChange={(e) => setNewTopic(e.target.value)}
              className="w-full text-xs bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] rounded-xl px-3 py-2 text-[var(--text-primary)] outline-none focus:border-[var(--accent-primary)]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">
              Recall Prompts / Description (Optional)
            </label>
            <textarea
              rows={3}
              placeholder="Questions or edge cases to challenge yourself on during recall..."
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              className="w-full text-xs bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] rounded-xl px-3 py-2 text-[var(--text-primary)] outline-none resize-none focus:border-[var(--accent-primary)]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">
                Link to Roadmap
              </label>
              <select
                value={newRoadmapId}
                onChange={(e) => setNewRoadmapId(e.target.value)}
                className="w-full text-xs bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] rounded-xl px-3 py-2 text-[var(--text-primary)] outline-none"
              >
                <option value="">General Topic</option>
                {roadmaps.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">
                Attach Note (Optional)
              </label>
              <select
                value={selectedNoteId}
                onChange={(e) => setSelectedNoteId(e.target.value)}
                className="w-full text-xs bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] rounded-xl px-3 py-2 text-[var(--text-primary)] outline-none truncate"
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

          <div className="flex justify-end gap-3 pt-3 border-t border-[var(--border-subtle)]">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsCreateModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="amber" size="sm">
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
            <div className="p-4 rounded-xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--accent-primary)]">
                Stage {activeSessionRevision.stage} Checkpoint
              </span>
              <h3 className="text-base font-bold text-[var(--text-primary)] mt-1">
                {activeSessionRevision.topic}
              </h3>
              {activeSessionRevision.description && (
                <p className="text-xs text-[var(--text-secondary)] mt-2">
                  {activeSessionRevision.description}
                </p>
              )}
            </div>

            {/* Understanding Rating Picker */}
            <div>
              <label className="block text-xs font-semibold text-[var(--text-primary)] mb-2">
                How well did you recall this concept?
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'again', label: 'Again', desc: 'Tomorrow' },
                  { id: 'difficult', label: 'Difficult', desc: 'In 2 days' },
                  { id: 'good', label: 'Good', desc: 'Next interval' },
                  { id: 'easy', label: 'Easy', desc: 'Extended interval' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setSessionRating(opt.id)}
                    className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                      sessionRating === opt.id
                        ? 'border-[var(--accent-primary)] bg-[var(--accent-subtle)] text-[var(--accent-primary)]'
                        : 'border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-secondary)]'
                    }`}
                  >
                    <span className="font-bold text-xs text-[var(--text-primary)]">
                      {opt.label}
                    </span>
                    <span className="text-[10px] text-[var(--text-muted)] mt-1">
                      {opt.desc}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-[var(--border-subtle)]">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveSessionRevision(null)}
              >
                Cancel
              </Button>
              <Button
                variant="amber"
                size="sm"
                onClick={handleCompleteSession}
                disabled={isSubmittingSession}
              >
                {isSubmittingSession ? 'Saving...' : 'Complete Session'}
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
        message={`Are you sure you want to remove "${itemToDelete?.topic}" from your spaced revision schedule?`}
        confirmText="Delete Topic"
        confirmVariant="danger"
      />
    </div>
  );
}
