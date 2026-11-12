import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Search,
  Plus,
  ArrowUpDown,
  Settings2,
} from 'lucide-react';
import { roadmapService } from '../services/roadmapService';
import { categoryService } from '../services/categoryService';
import RoadmapCard from '../components/roadmaps/RoadmapCard';
import AddRoadmapModal from '../components/roadmaps/AddRoadmapModal';
import EditRoadmapModal from '../components/roadmaps/EditRoadmapModal';
import CategoryManagerModal from '../components/roadmaps/CategoryManagerModal';
import ConfirmationDialog from '../components/ui/ConfirmationDialog';
import EmptyState from '../components/ui/EmptyState';
import ErrorState from '../components/ui/ErrorState';
import { CardSkeleton } from '../components/ui/Skeleton';
import { cacheStore } from '../services/cacheStore';

export default function MyRoadmapsPage() {
  const { refreshNavData } = useOutletContext() || {};

  const [roadmaps, setRoadmaps] = useState(() => {
    return cacheStore.getSync('GET:/roadmaps:{"limit":100}') || [];
  });
  const [categories, setCategories] = useState(() => {
    return cacheStore.getSync('GET:/categories:{"status":"all"}') || [];
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Filters, Search & Sorting
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('active');
  const [sortBy, setSortBy] = useState('default');

  // Modals
  const [isAddRoadmapOpen, setIsAddRoadmapOpen] = useState(false);
  const [isEditRoadmapOpen, setIsEditRoadmapOpen] = useState(false);
  const [roadmapToEdit, setRoadmapToEdit] = useState(null);
  const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false);

  // Confirmation dialog state
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    isDestructive: false,
    confirmLabel: 'Confirm',
    action: null,
  });

  const fetchRoadmapsAndCategories = async () => {
    if (roadmaps.length === 0) setLoading(true);
    setError(null);
    try {
      const [cats, roadmapsRes] = await Promise.all([
        categoryService.getCategories({ status: 'all' }),
        roadmapService.getRoadmaps({
          status: selectedStatus === 'all' ? undefined : selectedStatus,
          categoryId: selectedCategory === 'ALL' ? undefined : selectedCategory,
          search: searchQuery.trim() || undefined,
          sortBy,
          limit: 100,
        }),
      ]);
      setCategories(cats || []);
      setRoadmaps(roadmapsRes || []);
    } catch (err) {
      console.error('Failed to load roadmaps:', err);
      if (roadmaps.length === 0) {
        setError(err.message || 'Failed to fetch roadmaps');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoadmapsAndCategories();

    const handleInvalidation = (e) => {
      const { pattern } = e.detail || {};
      if (pattern === 'all' || /roadmaps|categories/i.test(pattern)) {
        fetchRoadmapsAndCategories();
      }
    };

    window.addEventListener('devpath:cache-invalidated', handleInvalidation);
    return () => window.removeEventListener('devpath:cache-invalidated', handleInvalidation);
  }, [selectedCategory, selectedStatus, searchQuery, sortBy]);

  const handleArchive = (id) => {
    const r = roadmaps.find((item) => item.id === id);
    setConfirmDialog({
      isOpen: true,
      title: `Archive Roadmap: ${r?.title || ''}?`,
      message: 'Archiving removes this roadmap from your daily active views. You can restore it at any time.',
      isDestructive: false,
      confirmLabel: 'Archive',
      action: async () => {
        try {
          await roadmapService.archiveRoadmap(id);
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
          fetchRoadmapsAndCategories();
          refreshNavData?.();
        } catch (err) {
          alert('Failed to archive: ' + err.message);
        }
      },
    });
  };

  const handleRestore = async (id) => {
    try {
      await roadmapService.restoreRoadmap(id);
      fetchRoadmapsAndCategories();
      refreshNavData?.();
    } catch (err) {
      alert('Failed to restore: ' + err.message);
    }
  };

  const handleDeletePermanent = (id) => {
    const r = roadmaps.find((item) => item.id === id);
    setConfirmDialog({
      isOpen: true,
      title: `Permanently Delete: ${r?.title || ''}?`,
      message: 'This will permanently delete this roadmap and all its days/tasks. This cannot be undone.',
      isDestructive: true,
      confirmLabel: 'Delete',
      action: async () => {
        try {
          await roadmapService.permanentlyDeleteRoadmap(id);
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
          fetchRoadmapsAndCategories();
          refreshNavData?.();
        } catch (err) {
          alert('Failed to delete permanently: ' + err.message);
        }
      },
    });
  };

  return (
    <div className="space-y-4">
      {/* 1. Compact Header Matching IMAGE 1 Reference */}
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-base sm:text-lg font-bold tracking-tight text-[#202620] dark:text-[#F3F4F6]">
          My Roadmaps
        </h1>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCategoryManagerOpen(true)}
            className="p-2 rounded-xl border border-[#E4E7E0] dark:border-[#303945] text-[#858D82] dark:text-[#7F8996] hover:text-[#202620] dark:hover:text-[#F3F4F6] text-xs transition cursor-pointer"
            title="Manage Categories"
          >
            <Settings2 className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setIsAddRoadmapOpen(true)}
            className="flex items-center gap-2 px-4.5 py-2 rounded-xl bg-[var(--accent-primary)] text-[var(--accent-text)] text-xs sm:text-sm font-semibold hover:brightness-105 active:scale-[0.98] transition shadow-sm cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Create Roadmap</span>
          </button>
        </div>
      </div>

      {/* 2. Small Category Filter Tabs (IMAGE 1: All, Development, Core CS, Tools, Others) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-0.5 scrollbar-none">
        <button
          onClick={() => setSelectedCategory('ALL')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer shrink-0 ${
            selectedCategory === 'ALL'
              ? 'bg-[var(--accent-primary)] text-[var(--accent-text)] shadow-xs'
              : 'bg-[#FFFFFF] dark:bg-[#1D232B] text-[#596258] dark:text-[#B0B7C2] border border-[#E4E7E0] dark:border-[#303945] hover:bg-[#F0F2ED] dark:hover:bg-[#252C35]'
          }`}
        >
          All
        </button>

        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer shrink-0 ${
              selectedCategory === cat.id
                ? 'bg-[var(--accent-primary)] text-[var(--accent-text)] shadow-xs'
                : 'bg-[#FFFFFF] dark:bg-[#1D232B] text-[#596258] dark:text-[#B0B7C2] border border-[#E4E7E0] dark:border-[#303945] hover:bg-[#F0F2ED] dark:hover:bg-[#252C35]'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* 3. Compact Search & Toolbar */}
      <div className="bg-[#FFFFFF] dark:bg-[#1D232B] border border-[#E4E7E0] dark:border-[#303945] rounded-xl p-2.5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        {/* Search Input */}
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 text-[#858D82] dark:text-[#7F8996] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search roadmaps..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#F8F9F6] dark:bg-[#171B21] border border-[#E4E7E0] dark:border-[#303945] rounded-xl text-[#202620] dark:text-[#F3F4F6] placeholder-[#858D82] dark:placeholder-[#7F8996] focus:outline-none focus:border-[var(--accent-primary)]"
          />
        </div>

        {/* Status Filter Tabs & Sort */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-[#F8F9F6] dark:bg-[#171B21] rounded-xl p-1 border border-[#E4E7E0] dark:border-[#303945] text-xs">
            {['active', 'archived', 'all'].map((st) => (
              <button
                key={st}
                onClick={() => setSelectedStatus(st)}
                className={`px-3 py-1 rounded-lg capitalize transition cursor-pointer font-medium ${
                  selectedStatus === st
                    ? 'bg-[var(--accent-primary)] text-[var(--accent-text)] font-semibold shadow-xs'
                    : 'text-[#596258] dark:text-[#B0B7C2] hover:text-[#202620] dark:hover:text-[#F3F4F6]'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 text-xs text-[#858D82] dark:text-[#7F8996] border-l border-[#E4E7E0] dark:border-[#303945] pl-2">
            <ArrowUpDown className="w-3 h-3" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent text-xs text-[#202620] dark:text-[#F3F4F6] focus:outline-none cursor-pointer"
            >
              <option value="default">Default</option>
              <option value="name">A–Z</option>
              <option value="duration">Duration</option>
              <option value="progress">Progress</option>
            </select>
          </div>
        </div>
      </div>

      {/* 4. Balanced 3-Column Grid Matching IMAGE 1 Desktop Spec */}
      {loading && roadmaps.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : error ? (
        <ErrorState
          title="Failed to Load Roadmaps"
          message={error}
          onRetry={fetchRoadmapsAndCategories}
        />
      ) : roadmaps.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {roadmaps.map((roadmap) => (
            <RoadmapCard
              key={roadmap.id}
              roadmap={roadmap}
              onEdit={(r) => {
                setRoadmapToEdit(r);
                setIsEditRoadmapOpen(true);
              }}
              onArchive={handleArchive}
              onRestore={handleRestore}
              onDeletePermanent={handleDeletePermanent}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No Roadmaps Found"
          description={
            searchQuery
              ? `No roadmaps match "${searchQuery}".`
              : 'Create your first engineering learning roadmap.'
          }
          action={
            <button
              onClick={() => setIsAddRoadmapOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-[var(--accent-primary)] text-[var(--accent-text)] text-xs font-semibold hover:bg-[var(--accent-hover)] transition cursor-pointer"
            >
              Create Roadmap
            </button>
          }
        />
      )}

      {/* Modals */}
      <AddRoadmapModal
        isOpen={isAddRoadmapOpen}
        onClose={() => setIsAddRoadmapOpen(false)}
        categories={categories}
        onSuccess={() => {
          setIsAddRoadmapOpen(false);
          fetchRoadmapsAndCategories();
          refreshNavData?.();
        }}
      />

      {roadmapToEdit && (
        <EditRoadmapModal
          isOpen={isEditRoadmapOpen}
          onClose={() => {
            setIsEditRoadmapOpen(false);
            setRoadmapToEdit(null);
          }}
          roadmap={roadmapToEdit}
          categories={categories}
          onSuccess={() => {
            setIsEditRoadmapOpen(false);
            setRoadmapToEdit(null);
            fetchRoadmapsAndCategories();
            refreshNavData?.();
          }}
        />
      )}

      <CategoryManagerModal
        isOpen={isCategoryManagerOpen}
        onClose={() => setIsCategoryManagerOpen(false)}
        onCategoriesUpdated={() => {
          fetchRoadmapsAndCategories();
          refreshNavData?.();
        }}
      />

      <ConfirmationDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmDialog.action}
        title={confirmDialog.title}
        message={confirmDialog.message}
        isDestructive={confirmDialog.isDestructive}
        confirmLabel={confirmDialog.confirmLabel}
      />
    </div>
  );
}
