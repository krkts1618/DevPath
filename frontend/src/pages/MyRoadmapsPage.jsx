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
  const [sortBy, setSortBy] = useState('default'); // 'default', 'name', 'createdAt', 'startDate', 'duration', 'progress'
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'

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
          setError(err.message || 'Archive failed');
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
      setError(err.message || 'Restore failed');
    }
  };

  const handleDeletePermanent = (roadmap) => {
    setConfirmDialog({
      isOpen: true,
      title: `Permanently Delete Roadmap: ${roadmap.title}?`,
      message:
        'CRITICAL: This will permanently remove the roadmap and all its modules, roadmap days, and associated tasks from the database.',
      impactDetails: (
        <>
          <div>• {roadmap.modulesCount || 0} Modules will be permanently deleted</div>
          <div>• {roadmap.daysCount || 0} Roadmap Days will be permanently deleted</div>
          <div>• {roadmap.totalTasks || 0} Granular Tasks will be deleted</div>
        </>
      ),
      isDestructive: true,
      confirmLabel: 'Delete Permanently',
      action: async () => {
        try {
          await roadmapService.deleteRoadmapPermanently(roadmap.id);
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
          fetchRoadmapsAndCategories();
          refreshNavData?.();
        } catch (err) {
          setError(err.message || 'Permanent deletion failed');
        }
      },
    });
  };

  const handleOpenEdit = (roadmap) => {
    setRoadmapToEdit(roadmap);
    setIsEditRoadmapOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header & Main Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#202A23] dark:text-[#DFD0B8]">
            Engineering Roadmaps & Tracks
          </h2>
          <p className="text-xs text-[#737C74] dark:text-[#948979] mt-1">
            Browse, configure, and dynamically manage learning tracks across all software engineering domains.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={Settings2}
            onClick={() => setIsCategoryManagerOpen(true)}
          >
            Manage Categories
          </Button>

          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={() => setIsAddRoadmapOpen(true)}
          >
            Add Roadmap
          </Button>
        </div>
      </div>

      {/* Filter, Search & Sort Bar */}
      <div className="bg-[#FFFFFF] dark:bg-[#2A303A] border border-[#E8E8DF] dark:border-[#393E46] rounded-xl p-4 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#91A88E] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search roadmaps by title or scope..."
              className="w-full pl-9 pr-4 py-2 bg-[#F7F7F2] dark:bg-[#222831] border border-[#E8E8DF] dark:border-[#393E46] rounded-lg text-xs text-[#202A23] dark:text-[#DFD0B8] placeholder-[#737C74] dark:placeholder-[#948979] focus:outline-none focus:ring-2 focus:ring-[#244C3B] dark:focus:ring-[#DFD0B8]"
            />
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-1.5 bg-[#F0F0EB] dark:bg-[#393E46] p-1 rounded-lg">
            <ArrowUpDown className="w-3.5 h-3.5 text-[#91A88E] ml-1.5" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent text-xs text-[#202A23] dark:text-[#DFD0B8] font-medium focus:outline-none cursor-pointer pr-2"
            >
              <option value="default">Default Order</option>
              <option value="name">Name (A–Z)</option>
              <option value="progress">Progress %</option>
              <option value="startDate">Start Date</option>
              <option value="duration">Duration (Shortest)</option>
              <option value="createdAt">Date Created</option>
            </select>
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-1 bg-[#F0F0EB] dark:bg-[#393E46] p-1 rounded-lg self-start md:self-auto">
            <button
              onClick={() => setSelectedStatus('active')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                selectedStatus === 'active'
                  ? 'bg-white dark:bg-[#2A303A] text-[#202A23] dark:text-[#DFD0B8] shadow-2xs'
                  : 'text-[#737C74] dark:text-[#948979] hover:text-[#202A23] dark:hover:text-[#DFD0B8]'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setSelectedStatus('archived')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                selectedStatus === 'archived'
                  ? 'bg-white dark:bg-[#2A303A] text-[#202A23] dark:text-[#DFD0B8] shadow-2xs'
                  : 'text-[#737C74] dark:text-[#948979] hover:text-[#202A23] dark:hover:text-[#DFD0B8]'
              }`}
            >
              Archived
            </button>
            <button
              onClick={() => setSelectedStatus('all')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                selectedStatus === 'all'
                  ? 'bg-white dark:bg-[#2A303A] text-[#202A23] dark:text-[#DFD0B8] shadow-2xs'
                  : 'text-[#737C74] dark:text-[#948979] hover:text-[#202A23] dark:hover:text-[#DFD0B8]'
              }`}
            >
              All
            </button>
          </div>

          {/* View Mode Toggle */}
          <div className="hidden sm:flex items-center bg-[#F0F0EB] dark:bg-[#393E46] p-1 rounded-lg">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md text-xs transition-colors cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-[#2A303A] text-[#244C3B] dark:text-[#DFD0B8] shadow-2xs'
                  : 'text-[#737C74] hover:text-[#202A23] dark:text-[#948979] dark:hover:text-[#DFD0B8]'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md text-xs transition-colors cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-[#2A303A] text-[#244C3B] dark:text-[#DFD0B8] shadow-2xs'
                  : 'text-[#737C74] hover:text-[#202A23] dark:text-[#948979] dark:hover:text-[#DFD0B8]'
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Category Pill Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-[#737C74] dark:text-[#948979] font-medium flex items-center gap-1 mr-1">
            <Filter className="w-3 h-3" /> Category:
          </span>

          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors whitespace-nowrap cursor-pointer ${
              selectedCategory === 'ALL'
                ? 'bg-[#244C3B] text-white dark:bg-[#DFD0B8] dark:text-[#222831]'
                : 'bg-[#F0F0EB] dark:bg-[#393E46] text-[#4A5749] dark:text-[#DFD0B8] hover:bg-[#E8E8DF] dark:hover:bg-[#454B54]'
            }`}
          >
            All Tracks
          </button>

          {categories
            .filter((c) => c.status !== 'archived')
            .map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors whitespace-nowrap cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-[#244C3B] text-white dark:bg-[#DFD0B8] dark:text-[#222831]'
                    : 'bg-[#F0F0EB] dark:bg-[#393E46] text-[#4A5749] dark:text-[#DFD0B8] hover:bg-[#E8E8DF] dark:hover:bg-[#454B54]'
                }`}
              >
                {cat.name}
              </button>
            ))}
        </div>
      </div>

      {/* Roadmaps Grid / List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : error ? (
        <ErrorState
          title="Failed to load roadmaps"
          message={error}
          onRetry={fetchRoadmapsAndCategories}
        />
      ) : roadmaps.length > 0 ? (
        <div
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5'
              : 'space-y-4'
          }
        >
          {roadmaps.map((r) => (
            <RoadmapCard
              key={r.id}
              roadmap={r}
              onEdit={handleOpenEdit}
              onArchive={handleArchive}
              onRestore={handleRestore}
              onDeletePermanent={handleDeletePermanent}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Compass}
          title={
            selectedStatus === 'archived'
              ? 'No archived roadmaps found'
              : 'No roadmaps match your criteria'
          }
          description="Try adjusting your filters, selecting another category, or create a brand new roadmap track."
          action={
            selectedStatus !== 'archived' ? (
              <Button
                variant="primary"
                size="sm"
                icon={Plus}
                onClick={() => setIsAddRoadmapOpen(true)}
              >
                Create New Roadmap
              </Button>
            ) : null
          }
        />
      )}

      {/* Modals */}
      <AddRoadmapModal
        isOpen={isAddRoadmapOpen}
        onClose={() => setIsAddRoadmapOpen(false)}
        categories={categories.filter((c) => c.status !== 'archived')}
        onSuccess={() => {
          setIsAddRoadmapOpen(false);
          fetchRoadmapsAndCategories();
          refreshNavData?.();
        }}
      />

      <EditRoadmapModal
        isOpen={isEditRoadmapOpen}
        onClose={() => setIsEditRoadmapOpen(false)}
        roadmap={roadmapToEdit}
        categories={categories.filter((c) => c.status !== 'archived')}
        onSuccess={() => {
          setIsEditRoadmapOpen(false);
          fetchRoadmapsAndCategories();
          refreshNavData?.();
        }}
      />

      <CategoryManagerModal
        isOpen={isCategoryManagerOpen}
        onClose={() => setIsCategoryManagerOpen(false)}
        onCategoryChanged={() => {
          fetchRoadmapsAndCategories();
          refreshNavData?.();
        }}
      />

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmDialog.action}
        title={confirmDialog.title}
        message={confirmDialog.message}
        impactDetails={confirmDialog.impactDetails}
        isDestructive={confirmDialog.isDestructive}
        confirmLabel={confirmDialog.confirmLabel}
      />
    </div>
  );
}
