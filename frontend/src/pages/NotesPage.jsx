import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  FileText,
  Plus,
  Search,
  Pin,
  Star,
  Archive,
  RotateCcw,
  Trash2,
  Copy,
  Tag,
  Layers,
  LayoutGrid,
  List,
  Check,
  Code,
  Database,
  Cpu,
  Globe,
  Terminal,
} from 'lucide-react';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import ConfirmationDialog from '../components/ui/ConfirmationDialog';
import NoteEditor from '../components/notes/NoteEditor';
import { noteService } from '../services/noteService';
import { roadmapService } from '../services/roadmapService';
import { cacheStore } from '../services/cacheStore';

export default function NotesPage() {
  const [notes, setNotes] = useState(() => {
    const cached = cacheStore.getSync('GET:/notes:{"isArchived":false,"limit":100}');
    return cached?.notes || [];
  });
  const [roadmaps, setRoadmaps] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Filters & State
  const [selectedCategory, setSelectedCategory] = useState('all'); // 'all' | 'web' | 'dsa' | 'sysdesign' | 'devops' | 'others'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoadmapId, setSelectedRoadmapId] = useState('');
  const [selectedTagId, setSelectedTagId] = useState('');

  // Editor modal state
  const [activeNoteForEdit, setActiveNoteForEdit] = useState(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  // Delete confirmation
  const [noteToDelete, setNoteToDelete] = useState(null);

  const fetchNotes = useCallback(async () => {
    try {
      if (notes.length === 0) setLoading(true);
      setError(null);

      const params = {
        search: searchQuery || undefined,
        roadmapId: selectedRoadmapId || undefined,
        tagId: selectedTagId || undefined,
        limit: 100,
        isArchived: false,
      };

      const res = await noteService.getNotes(params);
      setNotes(res?.notes || []);
    } catch (err) {
      console.error('Failed to load notes:', err);
      if (notes.length === 0) {
        setError(err.message || 'Failed to load notes');
      }
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedRoadmapId, selectedTagId]);

  useEffect(() => {
    fetchNotes();

    const handleInvalidation = (e) => {
      const { pattern } = e.detail || {};
      if (pattern === 'all' || /notes/i.test(pattern)) {
        fetchNotes();
      }
    };

    window.addEventListener('devpath:cache-invalidated', handleInvalidation);
    return () => window.removeEventListener('devpath:cache-invalidated', handleInvalidation);
  }, [fetchNotes]);

  useEffect(() => {
    async function loadRoadmapsAndTags() {
      try {
        const [rmData, tagData] = await Promise.all([
          roadmapService.getRoadmaps({ status: 'all' }),
          noteService.getTags(),
        ]);
        setRoadmaps(rmData?.roadmaps || rmData || []);
        setTags(tagData || []);
      } catch (err) {
        console.error('Failed to load metadata:', err);
      }
    }
    loadRoadmapsAndTags();
  }, []);

  // Filter notes by selectedCategory
  const filteredNotes = useMemo(() => {
    if (selectedCategory === 'all') return notes;

    return notes.filter((n) => {
      const text = `${n.title} ${n.roadmapTitle || ''} ${(n.tags || []).map((t) => t.name).join(' ')}`.toLowerCase();
      if (selectedCategory === 'web') {
        return text.includes('react') || text.includes('web') || text.includes('node') || text.includes('javascript') || text.includes('mern') || text.includes('frontend') || text.includes('backend');
      }
      if (selectedCategory === 'dsa') {
        return text.includes('dsa') || text.includes('data structure') || text.includes('algorithm') || text.includes('tree') || text.includes('graph');
      }
      if (selectedCategory === 'sysdesign') {
        return text.includes('system design') || text.includes('architecture') || text.includes('cache') || text.includes('load balancer') || text.includes('scale');
      }
      if (selectedCategory === 'devops') {
        return text.includes('docker') || text.includes('git') || text.includes('devops') || text.includes('ci/cd') || text.includes('linux') || text.includes('container');
      }
      if (selectedCategory === 'others') {
        return true;
      }
      return true;
    });
  }, [notes, selectedCategory]);

  // Dynamic counts for category sidebar
  const categoryCounts = useMemo(() => {
    const counts = {
      all: notes.length,
      web: 0,
      dsa: 0,
      sysdesign: 0,
      devops: 0,
      others: 0,
    };

    notes.forEach((n) => {
      const text = `${n.title} ${n.categoryName || ''} ${n.roadmapTitle || ''} ${(n.tags || []).map((t) => (typeof t === 'string' ? t : t?.name)).join(' ')}`.toLowerCase();
      if (text.includes('react') || text.includes('web') || text.includes('node') || text.includes('javascript') || text.includes('mern') || text.includes('frontend') || text.includes('backend') || text.includes('full-stack') || text.includes('spring')) {
        counts.web++;
      } else if (text.includes('dsa') || text.includes('data structure') || text.includes('algorithm') || text.includes('tree') || text.includes('graph') || text.includes('leetcode')) {
        counts.dsa++;
      } else if (text.includes('system design') || text.includes('architecture') || text.includes('cache') || text.includes('load balancer') || text.includes('scale') || text.includes('distributed')) {
        counts.sysdesign++;
      } else if (text.includes('docker') || text.includes('git') || text.includes('devops') || text.includes('ci/cd') || text.includes('linux') || text.includes('container') || text.includes('kubernetes')) {
        counts.devops++;
      } else {
        counts.others++;
      }
    });

    return counts;
  }, [notes]);

  const categories = [
    { id: 'all', label: 'All Notes', count: categoryCounts.all },
    { id: 'web', label: 'Web Development', count: categoryCounts.web },
    { id: 'dsa', label: 'Data Structures', count: categoryCounts.dsa },
    { id: 'sysdesign', label: 'System Design', count: categoryCounts.sysdesign },
    { id: 'devops', label: 'DevOps', count: categoryCounts.devops },
    { id: 'others', label: 'Others', count: categoryCounts.others },
  ];

  const handleTogglePin = async (e, noteId) => {
    e.stopPropagation();
    try {
      await noteService.togglePin(noteId);
      fetchNotes();
    } catch (err) {
      console.error('Toggle pin error:', err);
    }
  };

  const handleDuplicate = async (e, noteId) => {
    e.stopPropagation();
    try {
      await noteService.duplicateNote(noteId);
      fetchNotes();
    } catch (err) {
      console.error('Duplicate error:', err);
    }
  };

  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteConfirm = async () => {
    if (!noteToDelete || isDeleting) return;
    try {
      setIsDeleting(true);
      await noteService.deleteNote(noteToDelete.id);
      setNoteToDelete(null);
      await fetchNotes();
    } catch (err) {
      console.error('Delete note error:', err);
      setError(err.message || 'Failed to delete note');
    } finally {
      setIsDeleting(false);
    }
  };

  // If in editor view
  if (isCreatingNew || activeNoteForEdit) {
    return (
      <div className="space-y-4">
        <NoteEditor
          key={activeNoteForEdit?.id || (isCreatingNew ? 'new-note' : 'note-editor')}
          note={activeNoteForEdit}
          onSave={(saved) => {
            if (saved?.id) {
              setActiveNoteForEdit(saved);
              setIsCreatingNew(false);
            }
            fetchNotes();
          }}
          onClose={() => {
            setIsCreatingNew(false);
            setActiveNoteForEdit(null);
            fetchNotes();
          }}
        />
      </div>
    );
  }


  return (
    <div className="space-y-5">
      {/* 1. Header with Search and New Note Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border-subtle)]">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] tracking-tight">
            Notes
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-0.5">
            Technical takeaways, architecture patterns, and quick-reference cheatsheets
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Search bar */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-xs rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none focus:border-[var(--accent-primary)] transition"
            />
          </div>

          {/* New Note Button (Warm Amber) */}
          <button
            onClick={() => {
              setActiveNoteForEdit(null);
              setIsCreatingNew(true);
            }}
            className="flex items-center gap-2 px-4.5 py-2.5 rounded-xl bg-[var(--accent-primary)] hover:brightness-105 active:scale-[0.98] text-[var(--accent-text)] text-xs sm:text-sm font-semibold transition-all shadow-sm cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>New Note</span>
          </button>
        </div>
      </div>

      {/* 2. Two-Pane Layout Matching Reference Screen 5 */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Left Category Sidebar (approx 3 cols) */}
        <div className="md:col-span-3 space-y-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-2.5 shadow-xs">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                  isActive
                    ? 'bg-[var(--accent-subtle)] text-[var(--accent-primary)] border border-[var(--accent-primary)]/30'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-elevated)]'
                }`}
              >
                <span>{cat.label}</span>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-md ${
                    isActive
                      ? 'bg-[var(--accent-primary)] text-[var(--accent-text)]'
                      : 'bg-[var(--bg-surface-elevated)] text-[var(--text-muted)]'
                  }`}
                >
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Right Cards Grid (approx 9 cols) */}
        <div className="md:col-span-9">
          {loading && notes.length === 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-5 h-44 animate-pulse"
                />
              ))}
            </div>
          ) : notes.length === 0 ? (
            <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-10 text-center">
              <EmptyState
                icon={FileText}
                title="No Notes Yet"
                description="You haven't created any technical notes yet. Record architecture decisions, study summaries, and interview takeaways."
                actionLabel="+ Create First Note"
                onAction={() => {
                  setActiveNoteForEdit(null);
                  setIsCreatingNew(true);
                }}
              />
            </div>
          ) : filteredNotes.length === 0 ? (
            <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-10 text-center">
              <EmptyState
                icon={Search}
                title="No Matching Notes Found"
                description={
                  searchQuery
                    ? `No notes match "${searchQuery}" in this category.`
                    : 'No notes found for this category filter.'
                }
                actionLabel="Clear Filters"
                onAction={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredNotes.map((note) => (
                <div
                  key={note.id}
                  onClick={() => {
                    setActiveNoteForEdit(note);
                    setIsCreatingNew(false);
                  }}
                  className="group relative bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-[var(--accent-primary)] rounded-2xl p-5 shadow-xs transition cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    {/* Top row: Pin indicator & Menu actions */}
                    <div className="flex items-center justify-between mb-2">
                      {note.isPinned ? (
                        <span className="p-1 rounded-lg bg-[var(--accent-subtle)] text-[var(--accent-primary)]">
                          <Pin className="w-3.5 h-3.5 fill-current" />
                        </span>
                      ) : (
                        <span className="w-3.5 h-3.5" />
                      )}

                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                        <button
                          onClick={(e) => handleTogglePin(e, note.id)}
                          title={note.isPinned ? 'Unpin' : 'Pin to top'}
                          className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
                        >
                          <Pin className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => handleDuplicate(e, note.id)}
                          title="Duplicate note"
                          className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setNoteToDelete(note);
                          }}
                          title="Delete note"
                          className="p-1 rounded text-red-500 hover:text-red-700 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Note Title */}
                    <h3 className="font-bold text-sm text-[var(--text-primary)] mb-1 line-clamp-1">
                      {note.title}
                    </h3>

                    {/* Note Snippet */}
                    <p className="text-xs text-[var(--text-secondary)] line-clamp-2 mb-4 leading-relaxed">
                      {note.previewSnippet || note.content || 'No additional content.'}
                    </p>
                  </div>

                  {/* Footer row: Tags and Date */}
                  <div className="flex items-center justify-between pt-3 border-t border-[var(--border-subtle)] text-[11px]">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {(note.tags || []).slice(0, 3).map((t, idx) => (
                        <span
                          key={t.id || idx}
                          className="px-2.5 py-1 rounded-lg bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] text-[var(--text-secondary)] text-[10px] font-medium"
                        >
                          {typeof t === 'string' ? t : t.name}
                        </span>
                      ))}
                    </div>

                    <span className="text-[10px] font-mono text-[var(--text-muted)] shrink-0">
                      {new Date(note.updatedAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={!!noteToDelete}
        onClose={() => {
          if (!isDeleting) setNoteToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Note"
        message={
          noteToDelete
            ? `Are you sure you want to delete "${noteToDelete.title}"? This action cannot be undone.`
            : ''
        }
        confirmLabel="Delete Note"
        isDestructive={true}
        isLoading={isDeleting}
      />
    </div>
  );
}
