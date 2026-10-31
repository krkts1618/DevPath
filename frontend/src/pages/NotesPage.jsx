import React, { useState, useEffect, useCallback } from 'react';
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
  Edit,
  LayoutGrid,
  List,
  Filter,
  Tag,
  Layers,
  Calendar,
  Check,
  ArrowUpDown,
} from 'lucide-react';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';
import ConfirmationDialog from '../components/ui/ConfirmationDialog';
import NoteEditor from '../components/notes/NoteEditor';
import { noteService } from '../services/noteService';
import { roadmapService } from '../services/roadmapService';

export default function NotesPage() {
  const [notes, setNotes] = useState([]);
  const [roadmaps, setRoadmaps] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters & State
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'recent' | 'pinned' | 'favorites' | 'archived'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoadmapId, setSelectedRoadmapId] = useState('');
  const [selectedTagId, setSelectedTagId] = useState('');
  const [sortBy, setSortBy] = useState('updatedAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'

  // Editor modal state
  const [activeNoteForEdit, setActiveNoteForEdit] = useState(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  // Delete confirmation
  const [noteToDelete, setNoteToDelete] = useState(null);

  const fetchNotes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        search: searchQuery || undefined,
        roadmapId: selectedRoadmapId || undefined,
        tagId: selectedTagId || undefined,
        sort: sortBy,
        order: sortOrder,
        limit: 100,
      };

      if (activeTab === 'pinned') {
        params.isPinned = true;
      } else if (activeTab === 'favorites') {
        params.isFavorite = true;
      } else if (activeTab === 'archived') {
        params.isArchived = true;
      } else {
        params.isArchived = false;
      }

      const res = await noteService.getNotes(params);
      setNotes(res?.notes || []);
    } catch (err) {
      console.error('Failed to load notes:', err);
      setError(err.message || 'Failed to load notes');
    } finally {
      setLoading(false);
    }
  }, [activeTab, searchQuery, selectedRoadmapId, selectedTagId, sortBy, sortOrder]);

  useEffect(() => {
    fetchNotes();
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

  const handleTogglePin = async (e, noteId) => {
    e.stopPropagation();
    try {
      await noteService.togglePin(noteId);
      fetchNotes();
    } catch (err) {
      console.error('Toggle pin error:', err);
    }
  };

  const handleToggleFavorite = async (e, noteId) => {
    e.stopPropagation();
    try {
      await noteService.toggleFavorite(noteId);
      fetchNotes();
    } catch (err) {
      console.error('Toggle favorite error:', err);
    }
  };

  const handleToggleArchive = async (e, noteId) => {
    e.stopPropagation();
    try {
      await noteService.toggleArchive(noteId);
      fetchNotes();
    } catch (err) {
      console.error('Toggle archive error:', err);
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

  const handleDeleteConfirm = async () => {
    if (!noteToDelete) return;
    try {
      await noteService.deleteNote(noteToDelete.id);
      setNoteToDelete(null);
      fetchNotes();
    } catch (err) {
      console.error('Delete note error:', err);
    }
  };

  // If in editor view
  if (isCreatingNew || activeNoteForEdit) {
    return (
      <div className="space-y-4">
        <NoteEditor
          note={activeNoteForEdit}
          onSave={() => {
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
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#202A23] dark:text-[#DFD0B8] flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#244C3B] dark:text-[#DFD0B8]" />
            Personal Notes Workspace
          </h2>
          <p className="text-xs text-[#737C74] dark:text-[#948979] mt-1">
            Write, organize, search, and revisit technical learning notes, markdown documents, and syntax-highlighted code snippets.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          icon={Plus}
          onClick={() => {
            setActiveNoteForEdit(null);
            setIsCreatingNew(true);
          }}
        >
          New Note
        </Button>
      </div>

      {/* Tabs & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E8E8DF] dark:border-[#393E46] pb-3">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          {[
            { id: 'all', label: 'All Notes' },
            { id: 'recent', label: 'Recently Edited' },
            { id: 'pinned', label: 'Pinned' },
            { id: 'favorites', label: 'Favorites' },
            { id: 'archived', label: 'Archived' },
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

        {/* View Mode & Sorter */}
        <div className="flex items-center gap-3">
          <div className="flex items-center border border-[#E8E8DF] dark:border-[#393E46] rounded-lg p-0.5 bg-[#FFFFFF] dark:bg-[#2A303A]">
            <button
              onClick={() => setViewMode('grid')}
              title="Grid view"
              className={`p-1.5 rounded ${
                viewMode === 'grid'
                  ? 'bg-[#244C3B] text-white dark:bg-[#DFD0B8] dark:text-[#222831]'
                  : 'text-[#737C74] dark:text-[#948979]'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              title="List view"
              className={`p-1.5 rounded ${
                viewMode === 'list'
                  ? 'bg-[#244C3B] text-white dark:bg-[#DFD0B8] dark:text-[#222831]'
                  : 'text-[#737C74] dark:text-[#948979]'
              }`}
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-1 text-xs text-[#737C74] dark:text-[#948979]">
            <ArrowUpDown className="w-3.5 h-3.5" />
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [sb, so] = e.target.value.split('-');
                setSortBy(sb);
                setSortOrder(so);
              }}
              className="bg-[#FFFFFF] dark:bg-[#2A303A] border border-[#E8E8DF] dark:border-[#393E46] rounded-md px-2 py-1 text-[#202A23] dark:text-[#DFD0B8] outline-none"
            >
              <option value="updatedAt-desc">Recently Updated</option>
              <option value="createdAt-desc">Newest Created</option>
              <option value="title-asc">Title (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Search & Filters Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#737C74] dark:text-[#948979]" />
          <input
            type="text"
            placeholder="Search notes by title, content, tags, or curriculum..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg bg-[#FFFFFF] dark:bg-[#2A303A] border border-[#E8E8DF] dark:border-[#393E46] text-[#202A23] dark:text-[#DFD0B8] outline-none focus:border-[#244C3B] dark:focus:border-[#DFD0B8]"
          />
        </div>

        {/* Roadmap Filter */}
        <div className="flex items-center gap-2">
          <select
            value={selectedRoadmapId}
            onChange={(e) => setSelectedRoadmapId(e.target.value)}
            className="text-xs bg-[#FFFFFF] dark:bg-[#2A303A] border border-[#E8E8DF] dark:border-[#393E46] rounded-lg px-2.5 py-2 text-[#202A23] dark:text-[#DFD0B8] outline-none"
          >
            <option value="">All Roadmaps</option>
            {roadmaps.map((r) => (
              <option key={r.id} value={r.id}>
                {r.title}
              </option>
            ))}
          </select>

          {/* Tag Filter */}
          <select
            value={selectedTagId}
            onChange={(e) => setSelectedTagId(e.target.value)}
            className="text-xs bg-[#FFFFFF] dark:bg-[#2A303A] border border-[#E8E8DF] dark:border-[#393E46] rounded-lg px-2.5 py-2 text-[#202A23] dark:text-[#DFD0B8] outline-none"
          >
            <option value="">All Tags</option>
            {tags.map((t) => (
              <option key={t.id} value={t.id}>
                #{t.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Notes Content */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-44 rounded-xl bg-[#FFFFFF] dark:bg-[#2A303A] border border-[#E8E8DF] dark:border-[#393E46] animate-pulse p-5"
            />
          ))}
        </div>
      ) : notes.length === 0 ? (
        <div className="bg-[#FFFFFF] dark:bg-[#2A303A] border border-[#E8E8DF] dark:border-[#393E46] rounded-xl p-8">
          <EmptyState
            icon={FileText}
            title={searchQuery ? 'No matching notes found' : 'No notes available'}
            description={
              searchQuery
                ? 'Try refining your search keyword or clearing the filters.'
                : 'Start documenting your learning journey, engineering patterns, and architecture takeaways.'
            }
            action={
              <Button
                variant="primary"
                size="sm"
                icon={Plus}
                onClick={() => {
                  setActiveNoteForEdit(null);
                  setIsCreatingNew(true);
                }}
              >
                Create Your First Note
              </Button>
            }
          />
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {notes.map((note) => (
            <div
              key={note.id}
              onClick={() => setActiveNoteForEdit(note)}
              className="group relative bg-[#FFFFFF] dark:bg-[#2A303A] border border-[#E8E8DF] dark:border-[#393E46] hover:border-[#244C3B] dark:hover:border-[#DFD0B8] rounded-xl p-5 shadow-xs transition cursor-pointer flex flex-col justify-between"
            >
              <div>
                {/* Header icons: Pin & Favorite & Actions */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5">
                    {note.isPinned && (
                      <span className="p-1 rounded bg-[#E8F0EB] text-[#244C3B] dark:bg-[#393E46] dark:text-[#DFD0B8]">
                        <Pin className="w-3 h-3 fill-current" />
                      </span>
                    )}
                    {note.isFavorite && (
                      <span className="p-1 rounded bg-amber-50 text-amber-500 dark:bg-amber-950/40">
                        <Star className="w-3 h-3 fill-current" />
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                    <button
                      onClick={(e) => handleTogglePin(e, note.id)}
                      title={note.isPinned ? 'Unpin' : 'Pin to top'}
                      className="p-1 rounded text-[#737C74] hover:text-[#202A23] dark:text-[#948979] dark:hover:text-[#DFD0B8]"
                    >
                      <Pin className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => handleToggleFavorite(e, note.id)}
                      title={note.isFavorite ? 'Unfavorite' : 'Mark as favorite'}
                      className="p-1 rounded text-[#737C74] hover:text-[#202A23] dark:text-[#948979] dark:hover:text-[#DFD0B8]"
                    >
                      <Star className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => handleDuplicate(e, note.id)}
                      title="Duplicate note"
                      className="p-1 rounded text-[#737C74] hover:text-[#202A23] dark:text-[#948979] dark:hover:text-[#DFD0B8]"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => handleToggleArchive(e, note.id)}
                      title={note.isArchived ? 'Restore' : 'Archive'}
                      className="p-1 rounded text-[#737C74] hover:text-[#202A23] dark:text-[#948979] dark:hover:text-[#DFD0B8]"
                    >
                      {note.isArchived ? (
                        <RotateCcw className="w-3.5 h-3.5" />
                      ) : (
                        <Archive className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setNoteToDelete(note);
                      }}
                      title="Delete note"
                      className="p-1 rounded text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Title */}
                <h3 className="font-bold text-sm text-[#202A23] dark:text-[#DFD0B8] mb-1.5 line-clamp-1">
                  {note.title}
                </h3>

                {/* Content preview */}
                <p className="text-xs text-[#737C74] dark:text-[#948979] line-clamp-3 mb-3 leading-relaxed">
                  {note.previewSnippet || 'No additional content.'}
                </p>
              </div>

              {/* Footer info: tags & links */}
              <div className="space-y-2 pt-2 border-t border-[#E8E8DF] dark:border-[#393E46]/60 text-[11px]">
                {note.roadmapTitle && (
                  <div className="flex items-center gap-1 text-[#244C3B] dark:text-[#DFD0B8] truncate font-medium">
                    <Layers className="w-3 h-3 shrink-0" />
                    <span className="truncate">{note.roadmapTitle}</span>
                    {note.dayNumber && (
                      <span className="text-[#737C74] dark:text-[#948979]">
                        • Day {note.dayNumber}
                      </span>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1 overflow-hidden">
                    {(note.tags || []).slice(0, 3).map((t) => (
                      <span
                        key={t.id || t.name}
                        className="px-1.5 py-0.5 rounded bg-[#E8F0EB] text-[#244C3B] dark:bg-[#393E46] dark:text-[#DFD0B8] text-[10px]"
                      >
                        #{t.name}
                      </span>
                    ))}
                    {(note.tags || []).length > 3 && (
                      <span className="text-[10px] text-[#737C74] dark:text-[#948979]">
                        +{note.tags.length - 3}
                      </span>
                    )}
                  </div>

                  <span className="text-[10px] text-[#737C74] dark:text-[#948979] shrink-0">
                    {new Date(note.updatedAt).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* List View */
        <div className="bg-[#FFFFFF] dark:bg-[#2A303A] border border-[#E8E8DF] dark:border-[#393E46] rounded-xl overflow-hidden divide-y divide-[#E8E8DF] dark:divide-[#393E46]">
          {notes.map((note) => (
            <div
              key={note.id}
              onClick={() => setActiveNoteForEdit(note)}
              className="p-4 hover:bg-[#F7F7F2] dark:hover:bg-[#222831]/50 transition cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className="pt-0.5">
                  {note.isPinned ? (
                    <Pin className="w-4 h-4 text-[#244C3B] dark:text-[#DFD0B8] fill-current" />
                  ) : (
                    <FileText className="w-4 h-4 text-[#737C74] dark:text-[#948979]" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-[#202A23] dark:text-[#DFD0B8] truncate">
                      {note.title}
                    </h3>
                    {note.isFavorite && (
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-current shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-[#737C74] dark:text-[#948979] truncate mt-0.5">
                    {note.previewSnippet || 'No additional content.'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs shrink-0">
                {note.roadmapTitle && (
                  <Badge variant="neutral" size="sm">
                    {note.roadmapTitle}
                  </Badge>
                )}
                <span className="text-[#737C74] dark:text-[#948979] text-xs">
                  {new Date(note.updatedAt).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                  })}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => handleTogglePin(e, note.id)}
                    className="p-1 rounded text-[#737C74] hover:text-[#202A23] dark:text-[#948979] dark:hover:text-[#DFD0B8]"
                  >
                    <Pin className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => handleDuplicate(e, note.id)}
                    className="p-1 rounded text-[#737C74] hover:text-[#202A23] dark:text-[#948979] dark:hover:text-[#DFD0B8]"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setNoteToDelete(note);
                    }}
                    className="p-1 rounded text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={!!noteToDelete}
        onClose={() => setNoteToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Note"
        message={`Are you sure you want to permanently delete "${noteToDelete?.title}"? Deleting this note will NOT affect any associated curriculum roadmaps, days, or tasks.`}
        confirmText="Delete Note"
        confirmVariant="danger"
      />
    </div>
  );
}
