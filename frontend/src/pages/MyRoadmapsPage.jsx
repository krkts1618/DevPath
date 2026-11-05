import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Compass,
  Search,
  Plus,
  LayoutGrid,
  List,
  Filter,
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
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import ErrorState from '../components/ui/ErrorState';
import { CardSkeleton } from '../components/ui/Skeleton';

export default function MyRoadmapsPage() {
  const { refreshNavData } = useOutletContext() || {};

  const [roadmaps, setRoadmaps] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters, Search & Sorting
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('active'); // 'active', 'archived', 'all'
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
    impactDetails: null,
    isDestructive: false,
    confirmLabel: 'Confirm',
    action: null,
  });

  const fetchRoadmapsAndCategories = async () => {
    setLoading(true);
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
      setError(err.message || 'Failed to fetch roadmaps');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoadmapsAndCategories();
  }, [selectedCategory, selectedStatus, searchQuery, sortBy]);

  const handleArchive = (id) => {
    const r = roadmaps.find((item) => item.id === id);
    setConfirmDialog({
      isOpen: true,
      title: `Archive Roadmap: ${r?.title || ''}?`,
      message:
        'Archiving removes this roadmap from your daily active views. You can restore it at any time from the Archived tab.',
      isDestructive: false,
      confirmLabel: 'Archive Roadmap',
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
      message:
        'WARNING: This will permanently delete this roadmap, all associated modules, days, tasks, and task completion records. This cannot be undone.',
      isDestructive: true,
      confirmLabel: 'Delete Permanently',
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
    <div className="space-y-6">
      {/* 1. Header (Reference Style: My Roadmaps + Amber Create Button) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#202620] dark:text-[#F3F4F6]">
            My Roadmaps
          </h1>
          <p className="text-xs text-[#858D82] dark:text-[#7F8996] mt-0.5">
            Curriculum explorer and adaptive learning tracks.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={Settings2}
            onClick={() => setIsCategoryManagerOpen(true)}
            className="text-xs"
          >
            Manage Categories
          </Button>

          <Button
            variant="amber"
            size="sm"
            icon={Plus}
            onClick={() => setIsAddRoadmapOpen(true)}
            className="text-xs font-semibold"
          >
            Create Roadmap
          </Button>
        </div>
      </div>

      {/* 2. Category Filter Pills (Reference: All, Development, Core CS, Tools, etc.) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setSelectedCategory('ALL')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors cursor-pointer flex-shrink-0 ${
            selectedCategory === 'ALL'
              ? 'bg-[var(--accent-primary)] text-[var(--accent-text)] font-semibold shadow-xs'
              : 'bg-[#FFFFFF] dark:bg-[#1D232B] text-[#596258] dark:text-[#B0B7C2] border border-[#E4E7E0] dark:border-[#303945] hover:bg-[#F0F2ED] dark:hover:bg-[#252C35]'
          }`}
        >
          All Categories
        </button>

        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors cursor-pointer flex-shrink-0 ${
              selectedCategory === cat.id
                ? 'bg-[var(--accent-primary)] text-[var(--accent-text)] font-semibold shadow-xs'
                : 'bg-[#FFFFFF] dark:bg-[#1D232B] text-[#596258] dark:text-[#B0B7C2] border border-[#E4E7E0] dark:border-[#303945] hover:bg-[#F0F2ED] dark:hover:bg-[#252C35]'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* 3. Search Bar & Status Tabs */}
      <div className="bg-[#FFFFFF] dark:bg-[#1D232B] border border-[#E4E7E0] dark:border-[#303945] rounded-xl p-3 sm:p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#858D82] dark:text-[#7F8996] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search roadmaps by title or topic..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#F8F9F6] dark:bg-[#171B21] border border-[#E4E7E0] dark:border-[#303945] rounded-lg text-[#202620] dark:text-[#F3F4F6] placeholder-[#858D82] dark:placeholder-[#7F8996] focus:outline-none focus:border-[var(--accent-primary)]"
          />
        </div>

        {/* Status Filter Tabs & Sort */}
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-[#F8F9F6] dark:bg-[#171B21] rounded-lg p-0.5 border border-[#E4E7E0] dark:border-[#303945] text-xs font-mono">
            <button
              onClick={() => setSelectedStatus('active')}
              className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                selectedStatus === 'active'
                  ? 'bg-[var(--accent-primary)] text-[var(--accent-text)] font-semibold shadow-xs'
                  : 'text-[#596258] dark:text-[#B0B7C2] hover:text-[#202620] dark:hover:text-[#F3F4F6]'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setSelectedStatus('archived')}
              className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                selectedStatus === 'archived'
                  ? 'bg-[var(--accent-primary)] text-[var(--accent-text)] font-semibold shadow-xs'
                  : 'text-[#596258] dark:text-[#B0B7C2] hover:text-[#202620] dark:hover:text-[#F3F4F6]'
              }`}
            >
              Archived
            </button>
            <button
              onClick={() => setSelectedStatus('all')}
              className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                selectedStatus === 'all'
                  ? 'bg-[var(--accent-primary)] text-[var(--accent-text)] font-semibold shadow-xs'
                  : 'text-[#596258] dark:text-[#B0B7C2] hover:text-[#202620] dark:hover:text-[#F3F4F6]'
              }`}
            >
              All
            </button>
          </div>

          {/* Sort selector */}
          <div className="flex items-center gap-1.5 text-xs font-mono text-[#858D82] dark:text-[#7F8996]">
            <ArrowUpDown className="w-3.5 h-3.5" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent text-xs text-[#202620] dark:text-[#F3F4F6] focus:outline-none cursor-pointer"
            >
              <option value="default">Default Order</option>
              <option value="name">Alphabetical</option>
              <option value="duration">Duration</option>
              <option value="progress">Progress %</option>
            </select>
          </div>
        </div>
      </div>

      {/* 4. Responsive Grid of Roadmap Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
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
              ? `No roadmaps match "${searchQuery}". Try adjusting your filters.`
              : 'Create your first engineering learning roadmap to get started.'
          }
          action={
            <Button
              variant="amber"
              size="sm"
              icon={Plus}
              onClick={() => setIsAddRoadmapOpen(true)}
            >
              Create Roadmap
            </Button>
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
