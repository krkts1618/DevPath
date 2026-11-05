import React, { useState, useEffect } from 'react';
import {
  Folder,
  Plus,
  Edit2,
  Archive,
  RotateCcw,
  ChevronUp,
  ChevronDown,
  AlertCircle,
  Check,
} from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { categoryService } from '../../services/categoryService';

export default function CategoryManagerModal({
  isOpen,
  onClose,
  onCategoryChanged,
}) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active'); // 'active' | 'archived'
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Edit / Create Form state
  const [editingCatId, setEditingCatId] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [displayOrder, setDisplayOrder] = useState(0);

  // Reassignment state for Archiving
  const [archiveTargetId, setArchiveTargetId] = useState(null);
  const [reassignCategoryChoice, setReassignCategoryChoice] = useState('');
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await categoryService.getCategories({ status: 'all' });
      setCategories(data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
      setEditingCatId(null);
      setError(null);
      setSuccessMsg(null);
    }
  }, [isOpen]);

  const activeCategories = categories.filter((c) => c.status !== 'archived');
  const archivedCategories = categories.filter((c) => c.status === 'archived');

  const startEdit = (cat) => {
    setEditingCatId(cat.id);
    setName(cat.name);
    setDescription(cat.description || '');
    setDisplayOrder(cat.displayOrder || 0);
    setError(null);
  };

  const cancelEdit = () => {
    setEditingCatId(null);
    setName('');
    setDescription('');
    setDisplayOrder(0);
    setError(null);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Category name cannot be empty');
      return;
    }

    setError(null);
    try {
      if (editingCatId && editingCatId !== 'NEW') {
        await categoryService.updateCategory(editingCatId, {
          name: name.trim(),
          description: description.trim() || null,
          displayOrder: parseInt(displayOrder, 10) || 0,
        });
        setSuccessMsg('Category updated successfully');
      } else {
        await categoryService.createCategory({
          name: name.trim(),
          description: description.trim() || null,
          displayOrder: parseInt(displayOrder, 10) || 0,
        });
        setSuccessMsg('Category created successfully');
      }
      cancelEdit();
      fetchCategories();
      onCategoryChanged?.();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      setError(err.message || 'Failed to save category');
    }
  };

  const handleInitiateArchive = (cat) => {
    setArchiveTargetId(cat.id);
    const roadmapsCount = cat._count?.roadmaps || (cat.roadmaps ? cat.roadmaps.length : 0);
    if (roadmapsCount > 0) {
      const otherActive = activeCategories.filter((c) => c.id !== cat.id);
      setReassignCategoryChoice(otherActive.length > 0 ? otherActive[0].id : '');
    } else {
      setReassignCategoryChoice('');
    }
    setShowArchiveConfirm(true);
  };

  const handleConfirmArchive = async () => {
    const cat = categories.find((c) => c.id === archiveTargetId);
    const roadmapsCount = cat?._count?.roadmaps || (cat?.roadmaps ? cat.roadmaps.length : 0);

    if (roadmapsCount > 0 && !reassignCategoryChoice) {
      setError('You must select a category to reassign the active roadmaps to');
      return;
    }

    try {
      await categoryService.archiveCategory(archiveTargetId, reassignCategoryChoice || null);
      setShowArchiveConfirm(false);
      setArchiveTargetId(null);
      setSuccessMsg('Category archived successfully');
      fetchCategories();
      onCategoryChanged?.();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      setError(err.message || 'Failed to archive category');
    }
  };

  const handleRestore = async (id) => {
    try {
      await categoryService.restoreCategory(id);
      setSuccessMsg('Category restored successfully');
      fetchCategories();
      onCategoryChanged?.();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      setError(err.message || 'Failed to restore category');
    }
  };

  const handleReorder = async (catId, direction) => {
    const list = [...activeCategories];
    const index = list.findIndex((c) => c.id === catId);
    if (index < 0) return;

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= list.length) return;

    const temp = list[index];
    list[index] = list[newIndex];
    list[newIndex] = temp;

    const reordered = list.map((item, idx) => ({
      id: item.id,
      displayOrder: idx + 1,
    }));

    try {
      await categoryService.reorderCategories(reordered);
      fetchCategories();
      onCategoryChanged?.();
    } catch (err) {
      setError(err.message || 'Failed to reorder categories');
    }
  };

  const targetCategory = categories.find((c) => c.id === archiveTargetId);
  const otherActiveCategories = activeCategories.filter((c) => c.id !== archiveTargetId);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Category Manager"
      maxWidth="2xl"
      footer={
        <Button variant="outline" size="sm" onClick={onClose}>
          Close
        </Button>
      }
    >
      <div className="space-y-5">
        {/* Alerts */}
        {error && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 rounded-lg text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 rounded-lg text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
            <Check className="w-4 h-4 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Tab switcher: Active vs Archived */}
        <div className="flex items-center justify-between border-b border-[#E4E7E0] dark:border-[#303945] pb-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setActiveTab('active');
                cancelEdit();
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'active'
                  ? 'bg-[var(--accent-primary)] text-white dark:bg-[#F3F4F6] dark:text-[#222831] shadow-2xs'
                  : 'text-[#596258] dark:text-[#7F8996] hover:text-[#202620] dark:hover:text-[#E6EDE5]'
              }`}
            >
              Active Categories ({activeCategories.length})
            </button>
            <button
              onClick={() => {
                setActiveTab('archived');
                cancelEdit();
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'archived'
                  ? 'bg-[var(--accent-primary)] text-white dark:bg-[#F3F4F6] dark:text-[#222831] shadow-2xs'
                  : 'text-[#596258] dark:text-[#7F8996] hover:text-[#202620] dark:hover:text-[#E6EDE5]'
              }`}
            >
              Archived Categories ({archivedCategories.length})
            </button>
          </div>

          {!editingCatId && activeTab === 'active' && (
            <Button
              variant="secondary"
              size="xs"
              icon={Plus}
              onClick={() => {
                setEditingCatId('NEW');
                setName('');
                setDescription('');
                setDisplayOrder(activeCategories.length + 1);
              }}
            >
              Add Category
            </Button>
          )}
        </div>

        {/* Create / Edit Form */}
        {editingCatId && (
          <form
            onSubmit={handleSave}
            className="p-4 bg-[#F7F7F2] dark:bg-[#222831] border border-[#E4E7E0] dark:border-[#303945] rounded-xl space-y-3"
          >
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#202620] dark:text-[#F3F4F6]">
              {editingCatId === 'NEW' ? 'Create New Category' : 'Edit Category'}
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold text-[#596258] dark:text-[#7F8996] mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Distributed Systems"
                  className="w-full px-3 py-1.5 bg-white dark:bg-[#1D232B] border border-[#D4D4CA] dark:border-[#4F5561] rounded-lg text-xs text-[#202620] dark:text-[#F3F4F6] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] dark:focus:ring-[#F3F4F6]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#596258] dark:text-[#7F8996] mb-1">
                  Display Order
                </label>
                <input
                  type="number"
                  value={displayOrder}
                  onChange={(e) => setDisplayOrder(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white dark:bg-[#1D232B] border border-[#D4D4CA] dark:border-[#4F5561] rounded-lg text-xs text-[#202620] dark:text-[#F3F4F6] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] dark:focus:ring-[#F3F4F6] font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#596258] dark:text-[#7F8996] mb-1">
                Description
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Domain scope, learning focus, and roadmap group purpose..."
                className="w-full px-3 py-1.5 bg-white dark:bg-[#1D232B] border border-[#D4D4CA] dark:border-[#4F5561] rounded-lg text-xs text-[#202620] dark:text-[#F3F4F6] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] dark:focus:ring-[#F3F4F6]"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button variant="ghost" size="xs" onClick={cancelEdit}>
                Cancel
              </Button>
              <Button variant="primary" size="xs" type="submit">
                {editingCatId === 'NEW' ? 'Create Category' : 'Save Changes'}
              </Button>
            </div>
          </form>
        )}

        {/* Categories List */}
        <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
          {activeTab === 'active' ? (
            activeCategories.length > 0 ? (
              activeCategories.map((cat, idx) => {
                const roadmapsList = cat.roadmaps || [];
                const roadmapsCount = cat._count?.roadmaps ?? roadmapsList.length;

                return (
                  <div
                    key={cat.id}
                    className="p-3 bg-[#FFFFFF] dark:bg-[#1D232B] border border-[#E4E7E0] dark:border-[#303945] rounded-xl flex items-start justify-between gap-3 shadow-2xs"
                  >
                    <div className="flex items-start gap-2.5 flex-1 min-w-0">
                      {/* Order Controls */}
                      <div className="flex flex-col items-center justify-center -space-y-1 mt-0.5">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => handleReorder(cat.id, 'up')}
                          className="p-0.5 text-[#858D82] hover:text-[#202620] dark:hover:text-[#E6EDE5] disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <ChevronUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === activeCategories.length - 1}
                          onClick={() => handleReorder(cat.id, 'down')}
                          className="p-0.5 text-[#858D82] hover:text-[#202620] dark:hover:text-[#E6EDE5] disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <Folder className="w-3.5 h-3.5 text-[var(--accent-primary)] dark:text-[#F3F4F6] flex-shrink-0" />
                          <h4 className="text-xs font-bold text-[#202620] dark:text-[#F3F4F6] truncate">
                            {cat.name}
                          </h4>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-[#E4E7E0] dark:bg-[#303945] text-[#858D82] dark:text-[#7F8996]">
                            {roadmapsCount} {roadmapsCount === 1 ? 'track' : 'tracks'}
                          </span>
                        </div>

                        {cat.description && (
                          <p className="text-[11px] text-[#858D82] dark:text-[#7F8996] mt-1 line-clamp-1">
                            {cat.description}
                          </p>
                        )}

                        {/* Assigned roadmaps tags */}
                        {roadmapsList.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {roadmapsList.map((r) => (
                              <span
                                key={r.id}
                                className="text-[10px] px-1.5 py-0.5 rounded bg-[#F0F0EB] dark:bg-[#303945] text-[#596258] dark:text-[#B0B7C2] font-mono truncate max-w-[140px]"
                              >
                                {r.title}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => startEdit(cat)}
                        className="p-1.5 rounded-lg text-[#858D82] hover:text-[#202620] dark:hover:text-[#E6EDE5] hover:bg-[#F0F0EB] dark:hover:bg-[#303945] transition-colors"
                        title="Edit Category"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleInitiateArchive(cat)}
                        className="p-1.5 rounded-lg text-[#858D82] hover:text-amber-600 dark:hover:text-amber-400 hover:bg-[#F0F0EB] dark:hover:bg-[#303945] transition-colors"
                        title="Archive Category"
                      >
                        <Archive className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center text-xs text-[#858D82] dark:text-[#7F8996] italic">
                No active categories. Create your first category above!
              </div>
            )
          ) : archivedCategories.length > 0 ? (
            archivedCategories.map((cat) => (
              <div
                key={cat.id}
                className="p-3 bg-[#F7F7F2] dark:bg-[#222831] border border-[#E4E7E0] dark:border-[#303945] rounded-xl flex items-center justify-between gap-3 opacity-75"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <Folder className="w-3.5 h-3.5 text-[#858D82]" />
                    <span className="text-xs font-semibold text-[#202620] dark:text-[#F3F4F6]">
                      {cat.name}
                    </span>
                    <Badge type="archived" size="xs">
                      Archived
                    </Badge>
                  </div>
                  {cat.description && (
                    <p className="text-[11px] text-[#858D82] mt-0.5 line-clamp-1">
                      {cat.description}
                    </p>
                  )}
                </div>

                <Button
                  variant="outline"
                  size="xs"
                  icon={RotateCcw}
                  onClick={() => handleRestore(cat.id)}
                >
                  Restore
                </Button>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-xs text-[#858D82] dark:text-[#7F8996] italic">
              No archived categories found.
            </div>
          )}
        </div>
      </div>

      {/* Archive with Reassignment Confirmation Dialog */}
      {showArchiveConfirm && targetCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-[#202620]/50 dark:bg-black/80 backdrop-blur-xs"
            onClick={() => setShowArchiveConfirm(false)}
          />

          <div className="relative bg-[#FFFFFF] dark:bg-[#1D232B] border border-[#E4E7E0] dark:border-[#303945] rounded-xl p-5 max-w-md w-full shadow-2xl z-10 space-y-4">
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <h4 className="text-sm font-bold text-[#202620] dark:text-[#F3F4F6]">
                Archive Category: {targetCategory.name}
              </h4>
            </div>

            {(targetCategory._count?.roadmaps || 0) > 0 ? (
              <div className="space-y-3 text-xs text-[#596258] dark:text-[#B0B7C2]">
                <p>
                  This category currently contains{' '}
                  <strong className="text-[#202620] dark:text-[#F3F4F6]">
                    {targetCategory._count.roadmaps} active roadmap(s)
                  </strong>
                  . Roadmaps cannot be orphaned or deleted when a category is archived.
                </p>

                <div>
                  <label className="block text-[11px] font-semibold text-[#202620] dark:text-[#F3F4F6] mb-1">
                    Select Category to Reassign Roadmaps To *
                  </label>
                  <select
                    required
                    value={reassignCategoryChoice}
                    onChange={(e) => setReassignCategoryChoice(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-[#222831] border border-[#D4D4CA] dark:border-[#4F5561] rounded-lg text-xs text-[#202620] dark:text-[#F3F4F6] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] dark:focus:ring-[#F3F4F6]"
                  >
                    {otherActiveCategories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ) : (
              <p className="text-xs text-[#596258] dark:text-[#B0B7C2]">
                Are you sure you want to archive <strong>{targetCategory.name}</strong>? It has no active roadmaps and can be restored anytime from the Archived Categories tab.
              </p>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E4E7E0] dark:border-[#303945]">
              <Button
                variant="ghost"
                size="xs"
                onClick={() => setShowArchiveConfirm(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="xs"
                onClick={handleConfirmArchive}
                className="bg-amber-600 hover:bg-amber-700"
              >
                Confirm Archive
              </Button>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
